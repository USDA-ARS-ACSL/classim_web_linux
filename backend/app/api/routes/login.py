from datetime import timedelta
from typing import Annotated, Any
import urllib.parse
from uuid import uuid4
import time
import json

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.responses import RedirectResponse, JSONResponse
from authlib.integrations.requests_client import OAuth2Session
from pydantic import BaseModel
import requests
import jwt
from jwt.algorithms import RSAAlgorithm

from app import crud
from app.api.deps import CurrentUser, SessionDep
from app.core import security
from app.core.config import settings
from app.models import Token, UserPublic, UserCreateOIDC

router = APIRouter()

# Simple in-memory state storage for OIDC (use Redis in production)
_oidc_states = {}

def cleanup_expired_states():
    """Clean up expired OIDC states"""
    global _oidc_states
    cutoff = time.time() - 600  # 10 minutes
    _oidc_states = {k: v for k, v in _oidc_states.items() if v > cutoff}


class OIDCCallbackRequest(BaseModel):
    code: str
    state: str


@router.get("/auth/login")
def login_redirect(request: Request, response: Response) -> RedirectResponse:
    """
    Redirect to USDA eAuth (which connects to login.gov) for authentication
    """
    if not settings.oidc_enabled:
        raise HTTPException(status_code=500, detail="OIDC authentication not configured")
    
    # Generate state for CSRF protection
    state = security.generate_state_token()
    
    # Store state in memory (more reliable than cookies for domain issues)
    cleanup_expired_states()
    _oidc_states[state] = time.time()
    
    # Also try to store in cookie as backup
    host = request.headers.get("host", "").split(":")[0]
    print(f"Setting cookie for host: {host}")  # Debug
    
    response.set_cookie(
        key="oauth_state", 
        value=state, 
        httponly=True, 
        secure=False,
        samesite="lax",
        max_age=600,
        path="/",
        domain=None  # Don't set domain to avoid conflicts
    )
    
    # Build authorization URL using USDA eAuth endpoints
    params = {
        "client_id": settings.OIDC_CLIENT_ID,
        "response_type": "code",
        "scope": settings.OIDC_SCOPE,
        "redirect_uri": settings.OIDC_REDIRECT_URI,
        "state": state,
    }
    
    auth_url = f"{settings.OIDC_AUTHORIZATION_ENDPOINT}?{urllib.parse.urlencode(params)}"
    print(f"Redirecting to: {auth_url}")  # Debug
    return RedirectResponse(url=auth_url)


@router.get("/auth/callback")
def auth_callback(
    request: Request,
    session: SessionDep,
    code: str = None,
    state: str = None,
    error: str = None
) -> RedirectResponse:
    """
    Handle OIDC callback from login.gov
    """
    if error:
        # Redirect to frontend with error
        frontend_url = f"{settings.server_host}/login?error={error}"
        return RedirectResponse(url=frontend_url)
    
    if not code or not state:
        frontend_url = f"{settings.server_host}/login?error=missing_parameters"
        return RedirectResponse(url=frontend_url)
    
    # Verify state to prevent CSRF - check memory first, then cookies
    cleanup_expired_states()
    stored_state = None
    
    # Check in-memory state first (most reliable)
    if state in _oidc_states:
        stored_state = state
        print(f"Found state in memory: {state}")  # Debug
    else:
        # Fallback to cookies
        stored_state = (
            request.cookies.get("oauth_state") or 
            request.cookies.get("oauth_state_domain")
        )
        print(f"Checking cookies. Found: {stored_state}")  # Debug
    
    print(f"Request host: {request.headers.get('host')}")  # Debug
    print(f"Available cookies: {list(request.cookies.keys())}")  # Debug
    print(f"Received state: {state}")  # Debug
    print(f"Stored state: {stored_state}")  # Debug
    
    if not stored_state:
        print(f"No oauth_state found. Memory states: {list(_oidc_states.keys())}")  # Debug
        frontend_url = f"{settings.server_host}/login?error=missing_state_cookie"
        return RedirectResponse(url=frontend_url)
    
    if stored_state != state:
        print(f"State mismatch. Stored: {stored_state}, Received: {state}")
        frontend_url = f"{settings.server_host}/login?error=invalid_state"
        return RedirectResponse(url=frontend_url)
    
    # Remove used state from memory
    _oidc_states.pop(state, None)
    
    try:
        # Exchange code for access token using client secret or private key JWT
        print(f"Starting token exchange with OIDC_TOKEN_ENDPOINT: {settings.OIDC_TOKEN_ENDPOINT}")  # Debug
        
        if settings.OIDC_CLIENT_SECRET:
            # Use client secret authentication (more common)
            token_data = {
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": settings.OIDC_REDIRECT_URI,
                "client_id": settings.OIDC_CLIENT_ID,
                "client_secret": settings.OIDC_CLIENT_SECRET,
            }
            print(f"Using client secret auth. Client ID: {settings.OIDC_CLIENT_ID}")  # Debug
        else:
            # Fallback to private key JWT authentication
            client_assertion = security.create_client_assertion(settings.OIDC_TOKEN_ENDPOINT)
            token_data = {
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": settings.OIDC_REDIRECT_URI,
                "client_assertion_type": "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
                "client_assertion": client_assertion,
            }
            print(f"Using private key JWT auth")  # Debug
        
        print(f"Token request data: {token_data}")  # Debug (be careful with secrets in production)
        
        token_response = requests.post(
            settings.OIDC_TOKEN_ENDPOINT,
            data=token_data,
            headers={"Accept": "application/json"},
            timeout=10
        )
        
        print(f"Token response status: {token_response.status_code}")  # Debug
        print(f"Token response text: {token_response.text}")  # Debug
        
        token_response.raise_for_status()
        tokens = token_response.json()
        
        print(f"Token exchange successful. Getting userinfo from: {settings.OIDC_USERINFO_ENDPOINT}")  # Debug
        
        # Get user info from USDA eAuth
        userinfo_response = requests.get(
            settings.OIDC_USERINFO_ENDPOINT,
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
            timeout=10
        )
        
        print(f"Userinfo response status: {userinfo_response.status_code}")  # Debug
        print(f"Userinfo response text: {userinfo_response.text}")  # Debug
        
        userinfo_response.raise_for_status()
        
        # Try JSON first
        claims = None
        ct = userinfo_response.headers.get("Content-Type", "")
        body = userinfo_response.text.strip()

        if "application/json" in ct:
            claims = userinfo_response.json()
        elif body.count(".") == 2:  # looks like a compact JWT
            # Decode JWT using JWKS
            jwks = requests.get(settings.OIDC_JWKS_ENDPOINT, timeout=10).json()
            header = jwt.get_unverified_header(body)
            kid = header.get("kid")
            jwk = next((k for k in jwks.get("keys", []) if k.get("kid") == kid), None)
            if not jwk:
                raise HTTPException(status_code=400, detail="JWKS key not found")

            public_key = RSAAlgorithm.from_jwk(json.dumps(jwk))
            # Verify signature and issuer; relax audience if needed for userinfo
            claims = jwt.decode(
                body,
                public_key,
                algorithms=["RS256"],
                options={"verify_aud": False},
                issuer=settings.OIDC_ISSUER,
            )
        else:
            raise HTTPException(status_code=400, detail="Unsupported userinfo response")

        # Extract fields (USDA eAuth may not always include email in userinfo JWT)
        oidc_sub = claims.get("sub")
        email = claims.get("email") or claims.get("mail") or claims.get("emailaddress")  # try common alternatives
        given = claims.get("given_name")
        family = claims.get("family_name")
        full_name = (
            claims.get("name")
            or claims.get("preferred_username")
            or (" ".join(filter(None, [given, family])) if (given or family) else None)
        )

        if not oidc_sub:
            raise HTTPException(status_code=400, detail="Missing subject in userinfo")

        # If email is absent, you have options:
        # 1) Accept creating a user without email (your User model supports optional email).
        #    Make UserCreateOIDC.email optional, or use a placeholder here.
        if not email:
            # Option A: placeholder email derived from sub
            email = f"{oidc_sub}@example.invalid"
            # Or, adjust UserCreateOIDC to allow None and handle downstream accordingly.

        # Continue with user creation and token issuance
        
        # Check if user exists
        user = crud.get_user_by_oidc_sub(session=session, oidc_sub=oidc_sub)
        
        if not user:
            # Create new user
            is_admin = email.lower() in [admin_email.lower() for admin_email in settings.admin_email_list]
            user_create = UserCreateOIDC(
                email=email,
                full_name=full_name.strip() if full_name and full_name.strip() else email.split('@')[0],
                oidc_sub=oidc_sub
            )
            user = crud.create_user_oidc(session=session, user_create=user_create, is_admin=is_admin)
        
        # Generate access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = security.create_access_token(
            user.id, expires_delta=access_token_expires
        )
        
        # Redirect to frontend with token
        frontend_url = f"{settings.server_host}/login?token={access_token}"
        response = RedirectResponse(url=frontend_url)
        
        # Clear both oauth state cookies
        response.delete_cookie("oauth_state", path="/")
        response.delete_cookie("oauth_state_domain", path="/")
        
        return response
        
    except requests.RequestException as e:
        print(f"USDA eAuth request error: {e}")  # For debugging
        frontend_url = f"{settings.server_host}/login?error=auth_failed"
        return RedirectResponse(url=frontend_url)
    except Exception as e:
        print(f"USDA eAuth error: {e}")  # For debugging
        frontend_url = f"{settings.server_host}/login?error=internal_error"
        return RedirectResponse(url=frontend_url)
    
@router.post("/auth/callback")
def auth_callback_post(
    request: Request,
    session: SessionDep,
    callback_data: OIDCCallbackRequest
) -> JSONResponse:
    """
    Handle OIDC callback from frontend (POST method for fetch calls)
    """
    code = callback_data.code
    state = callback_data.state
    
    # Verify state to prevent CSRF
    stored_state = request.cookies.get("oauth_state")
    if not stored_state or stored_state != state:
        raise HTTPException(status_code=400, detail="Invalid state parameter")
    
    try:
        # Exchange code for access token using client secret or private key JWT
        if settings.OIDC_CLIENT_SECRET:
            # Use client secret authentication (more common)
            token_data = {
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": settings.OIDC_REDIRECT_URI,
                "client_id": settings.OIDC_CLIENT_ID,
                "client_secret": settings.OIDC_CLIENT_SECRET,
            }
        else:
            # Fallback to private key JWT authentication
            client_assertion = security.create_client_assertion(settings.OIDC_TOKEN_ENDPOINT)
            token_data = {
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": settings.OIDC_REDIRECT_URI,
                "client_assertion_type": "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
                "client_assertion": client_assertion,
            }
        
        token_response = requests.post(
            settings.OIDC_TOKEN_ENDPOINT,
            data=token_data,
            headers={"Accept": "application/json"},
            timeout=10
        )
        token_response.raise_for_status()
        tokens = token_response.json()
        
        # Get user info from USDA eAuth
        userinfo_response = requests.get(
            settings.OIDC_USERINFO_ENDPOINT,
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
            timeout=10
        )
        userinfo_response.raise_for_status()
        userinfo = userinfo_response.json()
        
        # Create or get user
        oidc_sub = userinfo.get("sub")
        email = userinfo.get("email")
        
        # Handle name fields - USDA eAuth may provide different claim names
        full_name = (
            userinfo.get("name") or 
            userinfo.get("preferred_username") or
            f"{userinfo.get('given_name', '')} {userinfo.get('family_name', '')}" or
            f"{userinfo.get('first_name', '')} {userinfo.get('last_name', '')}"
        )
        
        if not oidc_sub or not email:
            raise HTTPException(status_code=400, detail="Missing required user information from USDA eAuth")
        
        # Check if user exists
        user = crud.get_user_by_oidc_sub(session=session, oidc_sub=oidc_sub)
        
        if not user:
            # Create new user
            is_admin = email.lower() in [admin_email.lower() for admin_email in settings.admin_email_list]
            user_create = UserCreateOIDC(
                email=email,
                full_name=full_name.strip() if full_name and full_name.strip() else email.split('@')[0],
                oidc_sub=oidc_sub
            )
            user = crud.create_user_oidc(session=session, user_create=user_create, is_admin=is_admin)
        
        # Generate access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = security.create_access_token(
            user.id, expires_delta=access_token_expires
        )
        
        # Redirect to frontend with token
        frontend_url = f"{settings.server_host}/login?token={access_token}"
        response = RedirectResponse(url=frontend_url)
        
        # Clear both oauth state cookies
        response.delete_cookie("oauth_state", path="/")
        response.delete_cookie("oauth_state_domain", path="/")
        
        return response

    except requests.RequestException as e:
        print(f"USDA eAuth request error: {e}")
        raise HTTPException(status_code=400, detail="Authentication failed")
    except Exception as e:
        print(f"USDA eAuth error: {e}")
        raise HTTPException(status_code=500, detail="Internal authentication error")


@router.post("/auth/logout")
def logout(current_user: CurrentUser) -> JSONResponse:
    """
    Logout user (client should clear token)
    """
    return JSONResponse(content={"message": "Logged out successfully"})


@router.post("/login/test-token", response_model=UserPublic)
def test_token(current_user: CurrentUser) -> Any:
    """
    Test access token
    """
    return current_user
