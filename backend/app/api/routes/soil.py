from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query, Response, status
from sqlmodel import func, select
from sqlalchemy import delete
import requests
import json
import xmltodict
import pandas as pd
from app.api.deps import SessionDep, CurrentUser
from app.models import Soil, SoilCreate, SoilsPublic, SoilUpdate, SoilPublic, Message, Site, SoilLongPublic, SoilLongCreate, SoilLong, SoilsLongPublic, SoilLongUpdate
import datetime
from pydantic import BaseModel

router = APIRouter()

class SiteId(BaseModel):
    siteId: int

@router.get("/", response_model=SoilsPublic)
def read_soils(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve all soils for the current user or all soils for admin.
    """
    if current_user.is_superuser:
        count_statement = select(func.count()).select_from(Soil)
        count = session.exec(count_statement).one()
        statement = select(Soil).offset(skip).limit(limit)
        soils = session.exec(statement).all()
    else:
        count_statement = (
            select(func.count())
            .select_from(Soil)
            .where(Soil.owner_id == current_user.id)
        )
        count = session.exec(count_statement).one()
        statement = (
            select(Soil)
            .where(Soil.owner_id == current_user.id)
            .offset(skip)
            .limit(limit)
        )
        soils = session.exec(statement).all()
    return SoilsPublic(data=soils, count=count)


@router.get("/{soilid}", response_model=SoilsPublic)
def read_soil(
    session: SessionDep, soilid: int, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve a specific soil by ID.
    """
    count_statement = select(func.count()).select_from(Soil).filter(Soil.id == soilid)
    count = session.exec(count_statement).one()
    statement = select(Soil).filter(Soil.id == soilid)
    soils = session.exec(statement).all()
    return SoilsPublic(data=soils, count=count)

@router.post("/", response_model=SoilPublic, status_code=status.HTTP_201_CREATED)
def create_soil(
    *, session: SessionDep, current_user: CurrentUser, soil_in: SoilCreate
) -> Any:
    """
    Create new soil.
    """
    # Check if a soil with the same name already exists for the current user
    existing_soil = session.exec(
        select(Soil).where(
            Soil.owner_id == current_user.id, Soil.soilname == soil_in.soilname
        )
    ).first()
    if existing_soil:
        raise HTTPException(
            status_code=400, detail="Soil name already exists. Please choose a different soil name."
        )

    soil = Soil.model_validate(soil_in, update={"owner_id": current_user.id})
    session.add(soil)
    session.commit()
    session.refresh(soil)
    return soil


@router.put("/{id}", response_model=SoilPublic)
def update_soil(
    *, session: SessionDep, current_user: CurrentUser, id: int, soil_in: SoilUpdate
) -> Any:
    """
    Update a soil.
    """
    soil = session.get(Soil, id)
    if not soil:
        raise HTTPException(status_code=404, detail="Soil not found")
    if not current_user.is_superuser and (soil.owner_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Check if soil name already exists if trying to update the name
    if soil_in.soilname and soil_in.soilname != soil.soilname:
        existing_soil = session.exec(
            select(Soil).where(
                Soil.owner_id == current_user.id, 
                Soil.soilname == soil_in.soilname,
                Soil.id != id
            )
        ).first()
        if existing_soil:
            raise HTTPException(
                status_code=400, detail="Soil name already exists. Please choose a different soil name."
            )
    
    update_dict = soil_in.model_dump(exclude_unset=True)
    soil.sqlmodel_update(update_dict)
    session.add(soil)
    session.commit()
    session.refresh(soil)
    return soil


@router.delete("/{id}")
def delete_soil(session: SessionDep, current_user: CurrentUser, id: int) -> Message:
    """
    Delete a soil and all associated soil_long data.
    """
    soil = session.get(Soil, id)
    if not soil:
        raise HTTPException(status_code=404, detail="Soil not found")
    if not current_user.is_superuser and (soil.owner_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # First delete all associated soil_long data
    delete_stmt = delete(SoilLong).where(SoilLong.o_sid == id)
    session.execute(delete_stmt)
    
    # Then delete the soil record
    session.delete(soil)
    session.commit()
    return Message(message="Soil and all associated data deleted successfully")


@router.get("/NRCS/{siteId}", response_model=Dict[str, List[Dict[str, Any]]])
def fetch_soil_profile(session: SessionDep, siteId: int) -> Any:
    """
    Fetch Soil profile from NRCS using site ID
    """
    statement = select(Site).where(Site.id == siteId)
    site = session.exec(statement).first()
    
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    
    lonLat = f"{site.rlon} {site.rlat}"
    url = "https://SDMDataAccess.nrcs.usda.gov/Tabular/SDMTabularService.asmx"
    headers = {'content-type': 'text/xml'}
    body = f"""<?xml version="1.0" encoding="utf-8"?>
            <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:sdm="http://SDMDataAccess.nrcs.usda.gov/Tabular/SDMTabularService.asmx">
            <soap:Header/>
            <soap:Body>
                <sdm:RunQuery>
                    <sdm:Query>SELECT co.cokey as cokey, ch.chkey as chkey, comppct_r as prcent, slope_r, slope_h as slope, hzname, hzdepb_r as depth, 
                                awc_r as awc, claytotal_r as clay, silttotal_r as silt, sandtotal_r as sand, om_r as OM, dbthirdbar_r as dbthirdbar, 
                                wthirdbar_r/100 as th33, (dbthirdbar_r-(wthirdbar_r/100)) as bd FROM sacatalog sc
                                FULL OUTER JOIN legend lg  ON sc.areasymbol=lg.areasymbol
                                FULL OUTER JOIN mapunit mu ON lg.lkey=mu.lkey
                                FULL OUTER JOIN component co ON mu.mukey=co.mukey
                                FULL OUTER JOIN chorizon ch ON co.cokey=ch.cokey
                                FULL OUTER JOIN chtexturegrp ctg ON ch.chkey=ctg.chkey
                                FULL OUTER JOIN chtexture ct ON ctg.chtgkey=ct.chtgkey
                                FULL OUTER JOIN copmgrp pmg ON co.cokey=pmg.cokey
                                FULL OUTER JOIN corestrictions rt ON co.cokey=rt.cokey
                                WHERE mu.mukey IN (SELECT * from SDA_Get_Mukey_from_intersection_with_WktWgs84('point({lonLat})')) order by co.cokey, ch.chkey, prcent, depth
                    </sdm:Query>
                </sdm:RunQuery>
            </soap:Body>
            </soap:Envelope>"""

    try:
        response = requests.post(url, data=body, headers=headers, timeout=30)
        response.raise_for_status()  # Raise an exception for bad responses
        
        # Put query results in dictionary format
        my_dict = xmltodict.parse(response.content)
        
        try:
            soil_df = pd.DataFrame.from_dict(my_dict['soap:Envelope']['soap:Body']['RunQueryResponse']['RunQueryResult']['diffgr:diffgram']['NewDataSet']['Table'])

            # Drop columns where all values are None or NaN
            soil_df = soil_df.dropna(axis=1, how='all')
            soil_df = soil_df[soil_df.chkey.notnull()]

            # Drop unecessary columns
            soil_df = soil_df.drop(['@diffgr:id', '@msdata:rowOrder', '@diffgr:hasChanges'], axis=1)

            # Drop duplicate rows
            soil_df = soil_df.drop_duplicates()

            # Convert prcent and depth column from object to float
            soil_df['prcent'] = soil_df['prcent'].astype(float)
            soil_df['depth'] = soil_df['depth'].astype(float)

            # Select rows with max prcent
            soil_df = soil_df[soil_df.prcent == soil_df.prcent.max()]

            # Sort rows by depth
            soil_df = soil_df.sort_values(by=['depth'])

            # Check for rows with NaN values
            soil_df_with_NaN = soil_df[soil_df.isnull().any(axis=1)]
            depth = ", ".join(soil_df_with_NaN["depth"].astype(str))
            if len(depth) > 0:
                soil_df = soil_df.dropna()
                
            new_dict_list = []
            for index, row in soil_df.iterrows():
                new_dict = {
                    "Bottom_depth": row['depth'],
                    "OM_pct": row['OM'],
                    "NO3": 25,
                    "NH4": 4,
                    "HnNew": -200,
                    "initType": "m",
                    "Tmpr": 25,
                    "Sand": row['sand'],
                    "Silt": row['silt'],
                    "Clay": row['clay'],
                    "BD": row['bd'],
                    "TH33": row['th33'],
                    "TH1500": 0.1,
                    "kl": -0.035,
                    "kh": 0.00007,
                    "km": 0.07,
                    "kn": 0.2,
                    "kd": 0.00001,
                    "fe": 0.6,
                    "fh": 0.2,
                    "r0": 10.0,
                    "rL": 50.0,
                    "rm": 10.0,
                    "fa": 0.1,
                    "nq": 8,
                    "cs": 0.00001,
                    "CO2": 400,
                    "O2": 206000,
                    "N2O": 0,
                }
                new_dict_list.append(new_dict)
                
        except (KeyError, ValueError, TypeError) as e:
            # If there's an error processing the data, return default values
            new_dict_list = create_default_soil_data()
            
    except requests.RequestException as e:
        # If the request fails, return default values
        new_dict_list = create_default_soil_data()

    return {"data": new_dict_list}


def create_default_soil_data() -> List[Dict[str, Any]]:
    """Create default soil data when NRCS data isn't available"""
    return [
        {
            "Bottom_depth": 15,
            "OM_pct": 1.5,
            "NO3": 25,
            "NH4": 4,
            "HnNew": -200,
            "initType": "m",
            "Tmpr": 25,
            "Sand": 33,
            "Silt": 33,
            "Clay": 33,
            "BD": 1.3,
            "TH33": 0.3,
            "TH1500": 0.1,
            "kl": -0.035,
            "kh": 0.00007,
            "km": 0.07,
            "kn": 0.2,
            "kd": 0.00001,
            "fe": 0.6,
            "fh": 0.2,
            "r0": 10.0,
            "rL": 50.0,
            "rm": 10.0,
            "fa": 0.1,
            "nq": 8,
            "cs": 0.00001,
            "CO2": 400,
            "O2": 206000,
            "N2O": 0,
        },
        {
            "Bottom_depth": 30,
            "OM_pct": 0.8,
            "NO3": 25,
            "NH4": 4,
            "HnNew": -200,
            "initType": "m",
            "Tmpr": 25,
            "Sand": 33,
            "Silt": 33,
            "Clay": 33,
            "BD": 1.4,
            "TH33": 0.3,
            "TH1500": 0.1,
            "kl": -0.035,
            "kh": 0.00007,
            "km": 0.07,
            "kn": 0.2,
            "kd": 0.00001,
            "fe": 0.6,
            "fh": 0.2,
            "r0": 10.0,
            "rL": 50.0,
            "rm": 10.0,
            "fa": 0.1,
            "nq": 8,
            "cs": 0.00001,
            "CO2": 400,
            "O2": 206000,
            "N2O": 0,
        }
    ]


@router.get("/data/{o_sid}", response_model=SoilsLongPublic)
def read_soil_table(
    session: SessionDep, o_sid: int, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve soil data for a specific soil ID.
    """
    count_statement = select(func.count()).select_from(SoilLong).filter(SoilLong.o_sid == o_sid)
    count = session.exec(count_statement).one()
    statement = select(SoilLong).filter(SoilLong.o_sid == o_sid).order_by(SoilLong.Bottom_depth)
    soils = session.exec(statement).all()
    return SoilsLongPublic(data=soils, count=count)

@router.post("/data", response_model=SoilLongPublic)
def create_soil_table(
    *, session: SessionDep, soil_in: SoilLongCreate
) -> Any:
    """
    Create new soil layer data.
    """
    soilLong = SoilLong.model_validate(soil_in)
    session.add(soilLong)
    session.commit()
    session.refresh(soilLong)
    return soilLong

@router.put("/data/{id}", response_model=SoilLongPublic)
def update_soil_table(
    *, session: SessionDep, current_user: CurrentUser, id: int, soil_in: SoilLongUpdate
) -> Any:
    """
    Update soil layer data.
    """
    soilLong = session.get(SoilLong, id)
    if not soilLong:
        raise HTTPException(status_code=404, detail="Soil layer data not found")
    
    # Get the soil record to check permissions
    soil = session.exec(select(Soil).where(Soil.id == soilLong.o_sid)).first()
    if soil and not current_user.is_superuser and soil.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions to update this soil data")
        
    update_dict = soil_in.model_dump(exclude_unset=True)
    soilLong.sqlmodel_update(update_dict)
    session.add(soilLong)
    session.commit()
    session.refresh(soilLong)
    return soilLong

@router.delete("/data/{o_sid}")
def delete_soil_table(o_sid: int, session: SessionDep) -> Message:
    """
    Delete all soil layer entries matching the given o_sid.
    """
    # Construct the delete statement
    stmt = delete(SoilLong).where(SoilLong.o_sid == o_sid)
    
    # Execute the delete statement
    result = session.execute(stmt)
    session.commit()
    
    # Check if any rows were deleted
    if result.rowcount == 0:
        return Message(message="No soil layer data found to delete")
    
    return Message(message=f"Successfully deleted {result.rowcount} soil layer records")