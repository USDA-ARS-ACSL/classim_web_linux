from fastapi import APIRouter, HTTPException
from app.api.deps import SessionDep, CurrentUser
from typing import Any
from sqlmodel import func, select
from app.models import GridRatioCreate, GridRatio, GridRatioPublic, GridRatioUpdate, GridRatiosPublic, Message

router = APIRouter()

@router.post("/", response_model=GridRatioCreate)
def create_grid_ratio(
    *, session: SessionDep, current_user: CurrentUser, gr_in: GridRatioCreate
) -> Any:
    """
    Create new grid ratio.
    """
    gr = GridRatio.model_validate(gr_in)
    session.add(gr)
    session.commit()
    session.refresh(gr)
    return gr

@router.put("/{gridratio_id}", response_model=GridRatioPublic)
def update_soil(
    *, session: SessionDep, current_user: CurrentUser, gridratio_id: int, gr_in: GridRatioUpdate
) -> Any:
    """
    Update an grid ratio.
    """
    gr = session.get(GridRatio, gridratio_id)
    if not gr:
        raise HTTPException(status_code=404, detail="Grid Ratio not found")
    update_dict = gr_in.model_dump(exclude_unset=True)
    gr.sqlmodel_update(update_dict)
    session.add(gr)
    session.commit()
    session.refresh(gr)
    return gr

@router.get("/{gridratio_id}", response_model=GridRatioPublic)
def read_grid_ratio(
    session: SessionDep, skip: int = 0, limit: int = 100, gridratio_id=int
) -> Any:
    """
    Retrieve grid ratio.
    """
    statement = select(GridRatio).filter(GridRatio.gridratio_id == gridratio_id)
    gr = session.exec(statement).all()
    return GridRatioPublic(gr)

@router.get("/", response_model=GridRatiosPublic)
def read_gridratio_list(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve soils.
    """   
    count_statement = (
            select(func.count())
            .select_from(GridRatio)            
        )
    count = session.exec(count_statement).one()
    statement = (
        select(GridRatio)        
        .offset(skip)
        .limit(limit)
    )
    gr = session.exec(statement).all()    
    return GridRatiosPublic(data=gr, count= count)

@router.delete("/{gridratio_id}")
def delete_grid_ratio(session: SessionDep, current_user: CurrentUser, gridratio_id: int) -> Message:
    """
    Delete an Grid Ratio.
    """
    gr = session.get(GridRatio, gridratio_id)
    if not gr:
        raise HTTPException(status_code=404, detail="Grid Ratio not found")
    session.delete(gr)
    session.commit()
    return Message(message="Grid Ratio deleted successfully")