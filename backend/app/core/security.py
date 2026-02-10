from datetime import datetime, timedelta
from typing import Any
import secrets
import jwt
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
import uuid

from app.core.config import settings


ALGORITHM = "HS256"


def create_access_token(subject: str | Any, expires_delta: timedelta) -> str:
    expire = datetime.utcnow() + expires_delta
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> str | None:
    """Verify JWT token and return user ID if valid"""
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[ALGORITHM]
        )
        user_id = payload.get("sub")
        if user_id is None:
            return None
        return str(user_id)
    except jwt.JWTError:
        return None


def generate_state_token() -> str:
    """Generate a secure state token for OIDC flow"""
    return secrets.token_urlsafe(32)


def create_client_assertion(audience: str) -> str:
    """Create a JWT assertion for private key JWT authentication with login.gov"""
    if not settings.private_key_content:
        raise ValueError("Private key not configured for JWT assertion")
    
    # Load the private key
    try:
        private_key = serialization.load_pem_private_key(
            settings.private_key_content.encode('utf-8'),
            password=None,
        )
    except Exception as e:
        raise ValueError(f"Failed to load private key: {e}")
    
    # Create JWT payload for client assertion
    now = datetime.utcnow()
    payload = {
        "iss": settings.OIDC_CLIENT_ID,  # Issuer (client_id)
        "sub": settings.OIDC_CLIENT_ID,  # Subject (client_id)
        "aud": audience,  # Audience (token endpoint)
        "jti": str(uuid.uuid4()),  # Unique identifier
        "exp": int((now + timedelta(minutes=5)).timestamp()),  # Expires in 5 minutes
        "iat": int(now.timestamp()),  # Issued at
        "nbf": int(now.timestamp()),  # Not before
    }
    
    # Sign the JWT with RS256 (RSA SHA-256)
    try:
        assertion = jwt.encode(
            payload,
            private_key,
            algorithm="RS256",
            headers={"alg": "RS256", "typ": "JWT"}
        )
        return assertion
    except Exception as e:
        raise ValueError(f"Failed to create JWT assertion: {e}")
