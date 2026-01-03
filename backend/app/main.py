import sentry_sdk
from fastapi import FastAPI, Request, Query, HTTPException
from fastapi.routing import APIRoute
from fastapi.responses import RedirectResponse
from starlette.middleware.cors import CORSMiddleware
from typing import Optional
import requests

from app.api.main import api_router
from app.core.config import settings
from app.core import security


def custom_generate_unique_id(route: APIRoute) -> str:
    if route.tags:
        return f"{route.tags[0]}-{route.name}"
    else:
        return route.name

if settings.SENTRY_DSN and settings.ENVIRONMENT != "local":
    sentry_sdk.init(dsn=str(settings.SENTRY_DSN), enable_tracing=True)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    generate_unique_id_function=custom_generate_unique_id,
)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            str(origin).strip("/") for origin in settings.BACKEND_CORS_ORIGINS
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


# Root-level OIDC callback handler
@app.get("/")
async def root_callback(
    code: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    error: Optional[str] = Query(None)
):
    """
    Handle OIDC callback at root level and redirect to frontend with results
    """
    # If no OIDC parameters, serve the main application
    if not code and not state and not error:
        # Redirect to the main frontend application
        return RedirectResponse(url="/index.html")
    
    # Handle OIDC callback
    if error:
        # Redirect to frontend with error
        return RedirectResponse(url=f"/login?error={error}")
    
    if not code or not state:
        return RedirectResponse(url="/login?error=missing_parameters")
    
    try:
        # Exchange code for access token using client secret
        token_data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": settings.OIDC_REDIRECT_URI,
            "client_id": settings.OIDC_CLIENT_ID,
            "client_secret": settings.OIDC_CLIENT_SECRET,
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
        
        # Create user and generate internal access token
        # (This would need database session - simplified for now)
        
        # For now, create a basic JWT token with user info
        # In a full implementation, you'd create the user in the database
        access_token = security.create_access_token(
            subject=userinfo.get("sub", "unknown")
        )
        
        # Redirect to frontend with token
        return RedirectResponse(url=f"/login?token={access_token}")
        
    except Exception as e:
        print(f"OIDC callback error: {e}")  # For debugging
        return RedirectResponse(url="/login?error=auth_failed")


app.include_router(api_router, prefix=settings.API_V1_STR)