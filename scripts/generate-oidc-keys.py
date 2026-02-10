#!/usr/bin/env python3
"""
Generate RSA private/public key pair for login.gov OIDC private key JWT authentication.

Usage:
    python generate-oidc-keys.py

This will generate:
- private_key.pem: Private key for your application (keep secure!)
- public_key.pem: Public key to register with login.gov
- jwk.json: JSON Web Key format for login.gov registration
"""

import json
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.backends import default_backend
import base64

def generate_rsa_keypair():
    """Generate RSA private/public key pair"""
    print("Generating RSA key pair...")
    
    # Generate private key
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
        backend=default_backend()
    )
    
    # Get public key
    public_key = private_key.public_key()
    
    return private_key, public_key

def save_private_key(private_key, filename="private_key.pem"):
    """Save private key in PEM format"""
    pem_private = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )
    
    with open(filename, 'wb') as f:
        f.write(pem_private)
    
    print(f"Private key saved to: {filename}")
    return pem_private.decode('utf-8')

def save_public_key(public_key, filename="public_key.pem"):
    """Save public key in PEM format"""
    pem_public = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    
    with open(filename, 'wb') as f:
        f.write(pem_public)
    
    print(f"Public key saved to: {filename}")
    return pem_public.decode('utf-8')

def create_jwk(public_key, filename="jwk.json"):
    """Create JSON Web Key (JWK) for login.gov registration"""
    public_numbers = public_key.public_numbers()
    
    # Convert to JWK format
    def int_to_base64url(value):
        # Convert integer to base64url
        byte_length = (value.bit_length() + 7) // 8
        value_bytes = value.to_bytes(byte_length, byteorder='big')
        return base64.urlsafe_b64encode(value_bytes).rstrip(b'=').decode('ascii')
    
    jwk = {
        "kty": "RSA",
        "use": "sig",
        "alg": "RS256",
        "n": int_to_base64url(public_numbers.n),
        "e": int_to_base64url(public_numbers.e)
    }
    
    with open(filename, 'w') as f:
        json.dump(jwk, f, indent=2)
    
    print(f"JWK saved to: {filename}")
    return jwk

def main():
    print("=== Login.gov OIDC Key Generator ===")
    print()
    
    # Generate keys
    private_key, public_key = generate_rsa_keypair()
    
    # Save keys
    private_pem = save_private_key(private_key)
    public_pem = save_public_key(public_key)
    jwk = create_jwk(public_key)
    
    print()
    print("=== Next Steps ===")
    print("1. Keep private_key.pem secure and add to your environment:")
    print("   - Set OIDC_PRIVATE_KEY_PATH=./private_key.pem")
    print("   - Or set OIDC_PRIVATE_KEY to the private key content")
    print()
    print("2. Register with login.gov:")
    print("   - Go to https://developers.login.gov")
    print("   - Create/update your application")
    print("   - Upload public_key.pem or use the JWK from jwk.json")
    print("   - Set authentication method to 'private_key_jwt'")
    print()
    print("3. Environment variables needed:")
    print("   OIDC_CLIENT_ID=your-login-gov-client-id")
    print("   OIDC_PRIVATE_KEY_PATH=./private_key.pem")
    print("   OIDC_REDIRECT_URI=https://yourdomain.com/api/v1/auth/callback")
    print()
    print("=== Security Notes ===")
    print("- NEVER commit private_key.pem to version control")
    print("- Store private key securely (environment variables, secrets manager, etc.)")
    print("- Rotate keys regularly")
    print("- The public key can be safely shared with login.gov")

if __name__ == "__main__":
    main()