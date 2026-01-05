from datetime import timedelta
from typing import Annotated, Any
import urllib.parse
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.responses import RedirectResponse, JSONResponse
from authlib.integrations.requests_client import OAuth2Session
from pydantic import BaseModel
import requests

from app import crud
from app.api.deps import CurrentUser, SessionDep
from app.core import security
from app.core.config import settings
from app.models import Token, UserPublic, UserCreateOIDC

router = APIRouter()


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
    
    # Get the request host to set cookie domain appropriately
    host = request.headers.get("host", "").split(":")[0]  # Remove port if present
    
    # Store state in session/cookie for validation
    # Try multiple cookie strategies to handle domain issues
    cookie_kwargs = {
        "key": "oauth_state", 
        "value": state, 
        "httponly": True, 
        "secure": False,  # Must be False for HTTP connections
        "samesite": "lax",
        "max_age": 600,  # 10 minutes
        "path": "/"  # Ensure cookie is available for all paths
    }
    
    # Set cookie without domain restriction first
    response.set_cookie(**cookie_kwargs)
    
    # Also set with explicit domain if it's not localhost
    if host and host != "localhost" and "." in host:
        cookie_kwargs["key"] = "oauth_state_domain"
        cookie_kwargs["domain"] = f".{host}"
        response.set_cookie(**cookie_kwargs)
    
    # Build authorization URL using USDA eAuth endpoints
    params = {
        "client_id": settings.OIDC_CLIENT_ID,
        "response_type": "code",
        "scope": settings.OIDC_SCOPE,
        "redirect_uri": settings.OIDC_REDIRECT_URI,
        "state": state,
    }
    
    auth_url = f"{settings.OIDC_AUTHORIZATION_ENDPOINT}?{urllib.parse.urlencode(params)}"
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
    
    # Verify state to prevent CSRF - try both cookie variants
    stored_state = (
        request.cookies.get("oauth_state") or 
        request.cookies.get("oauth_state_domain")
    )
    
    if not stored_state:
        # Debug: Log available cookies
        print(f"No oauth_state cookie found. Available cookies: {list(request.cookies.keys())}")
        frontend_url = f"{settings.server_host}/login?error=missing_state_cookie"
        return RedirectResponse(url=frontend_url)
    
    if stored_state != state:
        # Debug: Log state mismatch
        print(f"State mismatch. Stored: {stored_state}, Received: {state}")
        frontend_url = f"{settings.server_host}/login?error=invalid_state"
        return RedirectResponse(url=frontend_url)
    
    try:
        # ...existing code...
        # Clear both oauth state cookies
        response = RedirectResponse(url=frontend_url)
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
            # Use client secret authentication
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
        
        # Handle name fields
        full_name = (
            userinfo.get("name") or 
            userinfo.get("preferred_username") or
            f"{userinfo.get('given_name', '')} {userinfo.get('family_name', '')}" or
            f"{userinfo.get('first_name', '')} {userinfo.get('last_name', '')}"
        )
        
        if not oidc_sub or not email:
            raise HTTPException(status_code=400, detail="Missing required user information from USDA eAuth")
        
        # Create or retrieve user
        user = crud.get_user_by_oidc_sub(session=session, oidc_sub=oidc_sub)
        if not user:
            user = crud.get_user_by_email(session=session, email=email)
            if not user:
                # Create new user
                user_create = UserCreateOIDC(email=email, full_name=full_name.strip(), oidc_sub=oidc_sub)
                user = crud.create_oidc_user(session=session, user_create=user_create)
        
        # Generate access token for our application
        access_token = security.create_access_token(
            subject=user.id,
            expires_delta=timedelta(hours=24)
        )
        
        return JSONResponse(content={"access_token": access_token})
        
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
