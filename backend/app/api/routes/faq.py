from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select, or_

from app.api.deps import SessionDep
from app.models import Faq,FaqBase,FaqCreate,FaqsPublic,FaqUpdate

router = APIRouter()


@router.get("/", response_model=FaqsPublic)
def read_Faqs(
    session: SessionDep, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve Faqs.
    """
    count_statement = select(func.count()).select_from(Faq)
    count = session.exec(count_statement).one()
    statement = select(Faq).offset(skip).limit(limit)
    Faqs = session.exec(statement).all()
    return FaqsPublic(data=Faqs, count=count)


@router.get("/{tab}", response_model=FaqsPublic)
def read_Faqs(
    session: SessionDep, skip: int = 0, limit: int = 100, tab=str
) -> Any:
    """
    Retrieve Faqs.
    """
    count_statement = select(func.count()).select_from(Faq).filter(or_(Faq.tabname == tab, Faq.tabname == 'general'))
    count = session.exec(count_statement).one()
    statement = select(Faq).filter(or_(Faq.tabname == tab, Faq.tabname == 'general'))
    Faqs = session.exec(statement).all()
    return FaqsPublic(data=Faqs, count=count)