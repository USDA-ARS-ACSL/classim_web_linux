from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select, or_

from app.api.deps import SessionDep
from app.models import Faq,FaqBase,FaqCreate,FaqsPublic,FaqUpdate,FaqPublic

router = APIRouter()


@router.get("/", response_model=FaqsPublic)
def read_Faqs(
    session: SessionDep, skip: int = 0, limit: int = 150
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

@router.post("/", response_model=FaqPublic)
def create_faq(
    *,
    session: SessionDep,
    faq_in: FaqCreate,
) -> FaqPublic:
    db_faq = Faq(**faq_in.dict(), owner_id=1)  # set owner_id accordingly
    session.add(db_faq)
    session.commit()
    session.refresh(db_faq)
    return db_faq

@router.put("/{faq_id}", response_model=FaqPublic)
def update_faq(
    *,
    session: SessionDep,
    faq_id: int,
    faq_in: FaqUpdate,
) -> FaqPublic:
    db_faq = session.get(Faq, faq_id)
    if not db_faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    faq_data = faq_in.dict(exclude_unset=True)
    for key, value in faq_data.items():
        setattr(db_faq, key, value)
    session.add(db_faq)
    session.commit()
    session.refresh(db_faq)
    return db_faq

@router.delete("/{faq_id}", response_model=dict)
def delete_faq(
    *,
    session: SessionDep,
    faq_id: int,
) -> dict:
    db_faq = session.get(Faq, faq_id)
    if not db_faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    session.delete(db_faq)
    session.commit()
    return {"detail": "FAQ deleted"}