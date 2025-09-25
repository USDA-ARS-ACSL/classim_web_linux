from typing import Any
import logging
import json
from fastapi import APIRouter, Depends
from fastapi import APIRouter, HTTPException
from sqlalchemy import text
from sqlmodel import func, select
from app.api.deps import SessionDep, CurrentUser
from app.models import Message,CultivarCottonPublic,CultivarCottondata,CultivarCottonsPublic, CultivarCottonCreate, CultivarMaizePublic,CultivarMaizedata,CultivarMaizesPublic, CultivarMaizeCreate, CultivarPotatoPublic,CultivarPotatodata,CultivarPotatosPublic, CultivarPotatoCreate,CultivarSoybeanPublic,CultivarSoybeandata,CultivarSoybeansPublic, CultivarSoybeanCreate
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


router = APIRouter()

def find_crop(cropType):
    if cropType=='cotton':
        cultivar='cultivar_cotton'
    elif cropType=='maize':
        cultivar='cultivar_maize'
    elif cropType=='potato':
        cultivar='cultivar_potato'
    elif cropType=='soybean':
        cultivar='cultivar_soybean'
    return cultivar

@router.get("/{cropType}")
def read_cultivars(
    session: SessionDep, current_user: CurrentUser,cropType=str
) -> Any:
    """
    Retrieve cultivars.
    """
    cultivar=find_crop(cropType)
    resp = []
    if current_user.is_superuser:
        statement=text(f'select id,hybridname from {cultivar}')
        cultivars = session.exec(statement)
    else:
        statement=text(f'select id,hybridname from {cultivar} where {cultivar}.owner_id = {current_user.id} ')
        cultivars = session.exec(statement)
    if cultivars:
        for row in cultivars:
            vals={
                "id":row[0],
                "hybridname":row[1]
            }
            resp.append(vals)
    return {"data":resp}

#cutlivar cotton apis
@router.get("/geteach/cotton/{id}",response_model=CultivarCottonsPublic)
def download(
    session: SessionDep, current_user: CurrentUser,id=int
)-> Any:
    """
    Retrieve each cultivar details 
    """
    statement = (
    select(CultivarCottondata)
    .filter(CultivarCottondata.id == int(id))
    )
    #print(statement)
    items = session.exec(statement)
    #print(items)
    return CultivarCottonsPublic(data=items)

@router.put("/updatecottoncultivar", response_model=CultivarCottonPublic)
def update_cotton_cultivar(
    *, session: SessionDep, current_user: CurrentUser, cultivarCotton_in: CultivarCottonPublic
) -> Any:
    """
    Create new cultivarCotton.
    """
    
    cultivarCotton = session.get(CultivarCottondata, cultivarCotton_in.id)
    
    if not cultivarCotton:
        raise HTTPException(status_code=404, detail="cultivarCotton not found")
    if not current_user.is_superuser and (cultivarCotton.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    update_dict = cultivarCotton_in.model_dump(exclude_unset=True)
    cultivarCotton.sqlmodel_update(update_dict)
    session.add(cultivarCotton)
    session.commit()
    session.refresh(cultivarCotton)
    return cultivarCotton

@router.post("/savecottoncultivar")
def create_soil_table(
    *, session: SessionDep, current_user: CurrentUser, cultivarCotton_in: CultivarCottonCreate
) -> Message:
    """
    Create new cotton cultivar.
    """
    # Check for unique hybridname per user
    existing = session.exec(
        select(CultivarCottondata).where(
            (CultivarCottondata.hybridname == cultivarCotton_in.hybridname) &
            (CultivarCottondata.owner_id == current_user.id)
        )
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Cultivar name must be unique for this user")
    cultivarCottonData = CultivarCottondata.model_validate(cultivarCotton_in, update={"owner_id": current_user.id})
    session.add(cultivarCottonData)
    session.commit()
    session.refresh(cultivarCottonData)
    return Message(message="Cultivar Created successfully")

#cutlivar maize apis
@router.get("/geteach/maize/{id}",response_model=CultivarMaizesPublic)
def download(
    session: SessionDep, current_user: CurrentUser,cropType=str,id=int
)-> Any:
    """
    Retrieve each cultivar details 
    """
    statement = (
    select(CultivarMaizedata)
    .filter(CultivarMaizedata.id == int(id))
    )
    #print(statement)
    items = session.exec(statement)
    #print(items)
    return CultivarMaizesPublic(data=items)

@router.put("/updatemaizecultivar", response_model=CultivarMaizePublic)
def update_maize_cultivar(
    *, session: SessionDep, current_user: CurrentUser, cultivarMaize_in: CultivarMaizePublic
) -> Any:
    """
    Create new cultivarMaize.
    """
    
    cultivarMaize = session.get(CultivarMaizedata, cultivarMaize_in.id)
    
    if not cultivarMaize:
        raise HTTPException(status_code=404, detail="cultivarMaize not found")
    if not current_user.is_superuser and (cultivarMaize.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    update_dict = cultivarMaize_in.model_dump(exclude_unset=True)
    cultivarMaize.sqlmodel_update(update_dict)
    session.add(cultivarMaize)
    session.commit()
    session.refresh(cultivarMaize)
    return cultivarMaize

@router.post("/savemaizecultivar")
def create_soil_table(
    *, session: SessionDep, current_user: CurrentUser, cultivarMaize_in: CultivarMaizeCreate
) -> Message:
    """
    Create new maize cultivar.
    """
    # Check for unique hybridname per user
    existing = session.exec(
        select(CultivarMaizedata).where(
            (CultivarMaizedata.hybridname == cultivarMaize_in.hybridname) &
            (CultivarMaizedata.owner_id == current_user.id)
        )
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Cultivar name must be unique for this user")
    cultivarMaizeData = CultivarMaizedata.model_validate(cultivarMaize_in, update={"owner_id": current_user.id})
    session.add(cultivarMaizeData)
    session.commit()
    session.refresh(cultivarMaizeData)
    return Message(message="Cultivar Created successfully")

#cutlivar potato apis
@router.get("/geteach/potato/{id}",response_model=CultivarPotatosPublic)
def download(
    session: SessionDep, current_user: CurrentUser,cropType=str,id=int
)-> Any:
    """
    Retrieve each cultivar details 
    """
    statement = (
    select(CultivarPotatodata)
    .filter(CultivarPotatodata.id == int(id))
    )
    #print(statement)
    items = session.exec(statement)
    #print(items)
    return CultivarPotatosPublic(data=items)

@router.put("/updatepotatocultivar", response_model=CultivarPotatoPublic)
def update_potato_cultivar(
    *, session: SessionDep, current_user: CurrentUser, cultivarPotato_in: CultivarPotatoPublic
) -> Any:
    """
    Create new cultivarPotato.
    """
    
    cultivarPotato = session.get(CultivarPotatodata, cultivarPotato_in.id)
    
    if not cultivarPotato:
        raise HTTPException(status_code=404, detail="cultivarPotato not found")
    if not current_user.is_superuser and (cultivarPotato.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    update_dict = cultivarPotato_in.model_dump(exclude_unset=True)
    cultivarPotato.sqlmodel_update(update_dict)
    session.add(cultivarPotato)
    session.commit()
    session.refresh(cultivarPotato)
    return cultivarPotato

@router.post("/savepotatocultivar")
def create_soil_table(
    *, session: SessionDep, current_user: CurrentUser, cultivarPotato_in: CultivarPotatoCreate
) -> Message:
    """
    Create new potato cultivar.
    """
    # Check for unique hybridname per user
    existing = session.exec(
        select(CultivarPotatodata).where(
            (CultivarPotatodata.hybridname == cultivarPotato_in.hybridname) &
            (CultivarPotatodata.owner_id == current_user.id)
        )
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Cultivar name must be unique for this user")
    cultivarPotatoData = CultivarPotatodata.model_validate(cultivarPotato_in, update={"owner_id": current_user.id})
    session.add(cultivarPotatoData)
    session.commit()
    session.refresh(cultivarPotatoData)
    return Message(message="Cultivar Created successfully")

#cutlivar soybean apis
@router.get("/geteach/soybean/{id}",response_model=CultivarSoybeansPublic)
def download(
    session: SessionDep, current_user: CurrentUser,cropType=str,id=int
)-> Any:
    """
    Retrieve each cultivar details 
    """
    statement = (
    select(CultivarSoybeandata)
    .filter(CultivarSoybeandata.id == int(id))
    )
    #print(statement)
    items = session.exec(statement)
    #print(items)
    return CultivarSoybeansPublic(data=items)

@router.put("/updatesoybeancultivar", response_model=CultivarSoybeanPublic)
def update_soybean_cultivar(
    *, session: SessionDep, current_user: CurrentUser, cultivarSoybean_in: CultivarSoybeanPublic
) -> Any:
    """
    Create new cultivarSoybean.
    """
    
    cultivarSoybean = session.get(CultivarSoybeandata, cultivarSoybean_in.id)
    
    if not cultivarSoybean:
        raise HTTPException(status_code=404, detail="cultivarSoybean not found")
    if not current_user.is_superuser and (cultivarSoybean.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    update_dict = cultivarSoybean_in.model_dump(exclude_unset=True)
    cultivarSoybean.sqlmodel_update(update_dict)
    session.add(cultivarSoybean)
    session.commit()
    session.refresh(cultivarSoybean)
    return cultivarSoybean

@router.post("/savesoybeancultivar")
def create_soil_table(
    *, session: SessionDep, current_user: CurrentUser, cultivarSoybean_in: CultivarSoybeanCreate
) -> Message:
    """
    Create new soybean cultivar.
    """
    # Check for unique hybridname per user
    existing = session.exec(
        select(CultivarSoybeandata).where(
            (CultivarSoybeandata.hybridname == cultivarSoybean_in.hybridname) &
            (CultivarSoybeandata.owner_id == current_user.id)
        )
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Cultivar name must be unique for this user")
    cultivarSoybeanData = CultivarSoybeandata.model_validate(cultivarSoybean_in, update={"owner_id": current_user.id})
    session.add(cultivarSoybeanData)
    session.commit()
    session.refresh(cultivarSoybeanData)
    return Message(message="Cultivar Created successfully")

@router.delete("/delete/cotton/{id}")
def read_cultivars(
    session: SessionDep, current_user: CurrentUser,cropType=str, id=int
) -> Any:
    """
    Retrieve cultivars.
    """

    cultivar = session.get(CultivarCottondata, id)
    if not cultivar:
        raise HTTPException(status_code=404, detail="Item not found")
    if not current_user.is_superuser and (cultivar.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    session.delete(cultivar)
    session.commit()

    return Message(message="Cultivar Deleted Successfully")

@router.delete("/delete/maize/{id}")
def read_cultivars(
    session: SessionDep, current_user: CurrentUser,cropType=str, id=int
) -> Any:
    """
    Retrieve cultivars.
    """

    cultivar = session.get(CultivarMaizedata, id)
    if not cultivar:
        raise HTTPException(status_code=404, detail="Item not found")
    if not current_user.is_superuser and (cultivar.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    session.delete(cultivar)
    session.commit()

    return Message(message="Cultivar Deleted Successfully")


@router.delete("/delete/soybean/{id}")
def read_cultivars(
    session: SessionDep, current_user: CurrentUser,cropType=str, id=int
) -> Any:
    """
    Retrieve cultivars.
    """

    cultivar = session.get(CultivarSoybeandata, id)
    if not cultivar:
        raise HTTPException(status_code=404, detail="Item not found")
    if not current_user.is_superuser and (cultivar.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    session.delete(cultivar)
    session.commit()

    return Message(message="Cultivar Deleted Successfully")

@router.delete("/delete/potato/{id}")
def read_cultivars(
    session: SessionDep, current_user: CurrentUser,cropType=str, id=int
) -> Any:
    """
    Retrieve cultivars.
    """

    cultivar = session.get(CultivarPotatodata, id)
    if not cultivar:
        raise HTTPException(status_code=404, detail="Item not found")
    if not current_user.is_superuser and (cultivar.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    session.delete(cultivar)
    session.commit()

    return Message(message="Cultivar Deleted Successfully")