import secrets
import warnings
from typing import Annotated, Any, Literal

from pydantic import (
    AnyUrl,
    BeforeValidator,
    HttpUrl,
    PostgresDsn,
    computed_field,
    model_validator,
)
from pydantic_core import MultiHostUrl
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing_extensions import Self


def parse_cors(v: Any) -> list[str] | str:
    if isinstance(v, str) and not v.startswith("["):
        return [i.strip() for i in v.split(",")]
    elif isinstance(v, list | str):
        return v
    raise ValueError(v)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_ignore_empty=True, extra="ignore"
    )
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    # 60 minutes * 24 hours * 8 days = 8 days
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    
    # USDA eAuth OIDC Configuration (connects to login.gov via gateway)
    OIDC_CLIENT_ID: str | None = None
    OIDC_CLIENT_SECRET: str | None = None  # Client secret for authentication
    OIDC_PRIVATE_KEY: str | None = None  # PEM format private key (alternative to client secret)
    OIDC_PRIVATE_KEY_PATH: str | None = None  # Path to private key file
    
    # USDA eAuth Gateway Endpoints for CLASSIM Application
    OIDC_DISCOVERY_URL: str = "https://gateway.cert.eauth.usda.gov/affwebservices/CASSO/oidc/USDA_REE_ARS_CLASSIM_V0/.well-known/openid-configuration"
    OIDC_ISSUER: str = "https://gateway.cert.eauth.usda.gov/affwebservices/CASSO/oidc/USDA_REE_ARS_CLASSIM_V0"
    OIDC_AUTHORIZATION_ENDPOINT: str = "https://gateway.cert.eauth.usda.gov/affwebservices/CASSO/oidc/USDA_REE_ARS_CLASSIM_V0/authorize"
    OIDC_TOKEN_ENDPOINT: str = "https://gateway.cert.eauth.usda.gov/affwebservices/CASSO/oidc/USDA_REE_ARS_CLASSIM_V0/token"
    OIDC_USERINFO_ENDPOINT: str = "https://gateway.cert.eauth.usda.gov/affwebservices/CASSO/oidc/USDA_REE_ARS_CLASSIM_V0/userinfo"
    OIDC_JWKS_ENDPOINT: str = "https://gateway.cert.eauth.usda.gov/affwebservices/CASSO/oidc/USDA_REE_ARS_CLASSIM_V0/jwks"
    OIDC_INTROSPECTION_ENDPOINT: str = "https://gateway.cert.eauth.usda.gov/affwebservices/CASSO/oidc/USDA_REE_ARS_CLASSIM_V0/introspect"
    OIDC_REVOCATION_ENDPOINT: str = "https://gateway.cert.eauth.usda.gov/affwebservices/CASSO/oidc/USDA_REE_ARS_CLASSIM_V0/revoke"
    
    OIDC_REDIRECT_URI: str | None = None
    OIDC_SCOPE: str = "openid email profile"
    # Admin users (automatically granted admin privileges)
    ADMIN_EMAILS: Annotated[list[str] | str, BeforeValidator(parse_cors)] = []
    DOMAIN: str = "localhost"
    ENVIRONMENT: Literal["local", "staging", "production"] = "local"

    @computed_field  # type: ignore[misc]
    @property
    def server_host(self) -> str:
        # Use HTTPS for anything other than local development
        if self.ENVIRONMENT == "local":
            return f"http://{self.DOMAIN}"
        return f"https://{self.DOMAIN}"

    BACKEND_CORS_ORIGINS: Annotated[
        list[AnyUrl] | str, BeforeValidator(parse_cors)
    ] = []

    PROJECT_NAME: str
    SENTRY_DSN: HttpUrl | None = None
    POSTGRES_SERVER: str
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str = ""

    @computed_field  # type: ignore[misc]
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> PostgresDsn:
        return MultiHostUrl.build(
            scheme="postgresql+psycopg",
            username=self.POSTGRES_USER,
            password=self.POSTGRES_PASSWORD,
            host=self.POSTGRES_SERVER,
            port=self.POSTGRES_PORT,
            path=self.POSTGRES_DB,
        )

    SMTP_TLS: bool = True
    SMTP_SSL: bool = False
    SMTP_PORT: int = 587
    SMTP_HOST: str | None = None
    SMTP_USER: str | None = None
    SMTP_PASSWORD: str | None = None
    # TODO: update type to EmailStr when sqlmodel supports it
    EMAILS_FROM_EMAIL: str | None = None
    EMAILS_FROM_NAME: str | None = None
    # Guest Access Configuration
    GUEST_ACCESS_ENABLED: bool = True
    GUEST_SESSION_HOURS: int = 24
    GUEST_CLEANUP_TIME: str = "02:00"  # 2 AM cleanup
    GUEST_MAX_REPORTS: int = 5  # Limit reports per guest session
    
    # Email settings for guest reports
    GUEST_EMAIL_TEMPLATE_PATH: str = "email-templates/guest-report.html"
    GUEST_EMAIL_FROM_NAME: str = "CLASSIM System"

    @model_validator(mode="after")
    def _set_default_emails_from(self) -> Self:
        if not self.EMAILS_FROM_NAME:
            self.EMAILS_FROM_NAME = self.PROJECT_NAME
        return self

    # OIDC configuration validation
    @computed_field  # type: ignore[misc]
    @property
    def oidc_enabled(self) -> bool:
        # Support both client secret and private key JWT authentication methods
        has_client_secret = bool(self.OIDC_CLIENT_SECRET)
        has_private_key = bool(self.OIDC_PRIVATE_KEY or self.OIDC_PRIVATE_KEY_PATH)
        
        return bool(
            self.OIDC_CLIENT_ID 
            and (has_client_secret or has_private_key)  # Either authentication method works
            and self.OIDC_REDIRECT_URI
        )

    @computed_field  # type: ignore[misc]
    @property
    def private_key_content(self) -> str | None:
        """Get private key content from either direct value or file path"""
        if self.OIDC_PRIVATE_KEY:
            return self.OIDC_PRIVATE_KEY
        elif self.OIDC_PRIVATE_KEY_PATH:
            try:
                with open(self.OIDC_PRIVATE_KEY_PATH, 'r') as f:
                    return f.read()
            except FileNotFoundError:
                return None
        return None

    @computed_field  # type: ignore[misc]
    @property
    def admin_email_list(self) -> list[str]:
        if isinstance(self.ADMIN_EMAILS, str):
            return [email.strip() for email in self.ADMIN_EMAILS.split(",") if email.strip()]
        return self.ADMIN_EMAILS or []

    def _check_default_secret(self, var_name: str, value: str | None) -> None:
        if value == "changethis":
            message = (
                f'The value of {var_name} is "changethis", '
                "for security, please change it, at least for deployments."
            )
            if self.ENVIRONMENT == "local":
                warnings.warn(message, stacklevel=1)
            else:
                raise ValueError(message)

    @model_validator(mode="after")
    def _enforce_non_default_secrets(self) -> Self:
        self._check_default_secret("SECRET_KEY", self.SECRET_KEY)
        self._check_default_secret("POSTGRES_PASSWORD", self.POSTGRES_PASSWORD)
        
        # Validate OIDC configuration for non-local environments
        if self.ENVIRONMENT != "local" and not self.oidc_enabled:
            missing_items = []
            if not self.OIDC_CLIENT_ID:
                missing_items.append("OIDC_CLIENT_ID")
            if not (self.OIDC_PRIVATE_KEY or self.OIDC_PRIVATE_KEY_PATH):
                missing_items.append("OIDC_PRIVATE_KEY or OIDC_PRIVATE_KEY_PATH")
            if not self.OIDC_REDIRECT_URI:
                missing_items.append("OIDC_REDIRECT_URI")
            
            raise ValueError(
                f"OIDC configuration is required for non-local environments. "
                f"Missing: {', '.join(missing_items)}"
            )

        return self


settings = Settings()  # type: ignore
