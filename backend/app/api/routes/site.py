from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import SessionDep, CurrentUser
from app.models import Site,SiteCreate,SitesPublic,SiteUpdate, SitePublic, Message

router = APIRouter()


@router.get("/", response_model=SitesPublic)
def read_sites(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve sites.
    """
    if current_user.is_superuser:
        count_statement = select(func.count()).select_from(Site)
        count = session.exec(count_statement).one()
        statement = select(Site).offset(skip).limit(limit)
        sites = session.exec(statement).all()
    else:
        count_statement = (
            select(func.count())
            .select_from(Site)
            .where(Site.owner_id == current_user.id)
        )
        count = session.exec(count_statement).one()
        statement = (
            select(Site)
            .where(Site.owner_id == current_user.id)
            .offset(skip)
            .limit(limit)
        )
        sites = session.exec(statement).all()
    return SitesPublic(data=sites, count=count)


@router.get("/{siteid}", response_model=SitesPublic)
def read_site(
    session: SessionDep, skip: int = 0, limit: int = 100, siteid=int
) -> Any:
    """
    Retrieve sites.
    """
    count_statement = select(func.count()).select_from(Site).filter(Site.id == siteid)
    print(count_statement)
    
    count = session.exec(count_statement).one()
    statement = select(Site).filter(Site.id == siteid)
    sites = session.exec(statement).all()
    return SitesPublic(data=sites, count=count)

@router.post("/", response_model=SitePublic)
def create_site(
    *, session: SessionDep, current_user: CurrentUser, site_in: SiteCreate
) -> Any:
    """
    Create new site.
    """
    
    site = Site.model_validate(site_in, update={"owner_id": current_user.id})
 
    statement = (
    select(Site)
    .where((Site.owner_id == current_user.id)&(Site.sitename == site.sitename))
    )
    sites = session.exec(statement).all()
    if sites:
        raise HTTPException(status_code=400, detail="Site Already existed")       
    
    session.add(site)
    session.commit()
    session.refresh(site)
    return site


@router.put("/{id}", response_model=SitePublic)
def update_site(
    *, session: SessionDep, current_user: CurrentUser, id: int, site_in: SiteUpdate
) -> Any:
    """
    Update an site.
    """
    site = session.get(Site, id)
    
    if not site:
        raise HTTPException(status_code=404, detail="site not found")
    if not current_user.is_superuser and (site.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    update_dict = site_in.model_dump(exclude_unset=True)
    site.sqlmodel_update(update_dict)
    session.add(site)
    session.commit()
    session.refresh(site)
    return site


@router.delete("/{id}")
def delete_site(session: SessionDep, current_user: CurrentUser, id: int) -> Message:
    """
    Delete an site.
    """
    site = session.get(Site, id)
    if not site:
        raise HTTPException(status_code=404, detail="site not found")
    if not current_user.is_superuser and (site.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    session.delete(site)
    session.commit()
    return Message(message="site deleted successfully")
