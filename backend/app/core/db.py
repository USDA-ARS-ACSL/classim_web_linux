from sqlmodel import Session, create_engine, select

from app import crud
from app.core.config import settings
from app.models import User, UserCreateOIDC

engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))


# make sure all SQLModel models are imported (app.models) before initializing DB
# otherwise, SQLModel might fail to initialize relationships properly
# for more details: https://github.com/tiangolo/full-stack-fastapi-template/issues/28


def init_db(session: Session) -> None:
    # Tables should be created with Alembic migrations
    # But if you don't want to use migrations, create
    # the tables un-commenting the next lines
    # from sqlmodel import SQLModel

    # from app.core.engine import engine
    # This works because the models are already imported and registered from app.models
    # SQLModel.metadata.create_all(engine)

    user = session.exec(
        select(User).where(User.email == settings.FIRST_SUPERUSER)
    ).first()
    if not user:
        # Create initial superuser for OIDC authentication
        user_in = UserCreateOIDC(
            email=settings.FIRST_SUPERUSER,
            full_name="System Administrator",
            oidc_sub=f"system-admin-{settings.FIRST_SUPERUSER}",  # Temporary OIDC sub for system admin
        )
        user = crud.create_user_oidc(session=session, user_create=user_in, is_admin=True)
