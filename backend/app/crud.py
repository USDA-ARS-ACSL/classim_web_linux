from typing import Any

from sqlmodel import Session, select

from app.models import Item, ItemCreate, User, UserCreateOIDC, UserUpdate


def create_user_oidc(*, session: Session, user_create: UserCreateOIDC, is_admin: bool = False) -> User:
    """Create user from OIDC authentication"""
    db_obj = User(
        email=user_create.email,
        full_name=user_create.full_name,
        oidc_sub=user_create.oidc_sub,
        is_active=True,
        is_superuser=is_admin
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_user(*, session: Session, db_user: User, user_in: UserUpdate) -> Any:
    user_data = user_in.model_dump(exclude_unset=True)
    db_user.sqlmodel_update(user_data)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def get_user_by_email(*, session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    session_user = session.exec(statement).first()
    return session_user


def get_user_by_oidc_sub(*, session: Session, oidc_sub: str) -> User | None:
    """Get user by OIDC subject identifier"""
    statement = select(User).where(User.oidc_sub == oidc_sub)
    session_user = session.exec(statement).first()
    return session_user


def create_item(*, session: Session, item_in: ItemCreate, owner_id: int) -> Item:
    db_item = Item.model_validate(item_in, update={"owner_id": owner_id})
    session.add(db_item)
    session.commit()
    session.refresh(db_item)
    return db_item
