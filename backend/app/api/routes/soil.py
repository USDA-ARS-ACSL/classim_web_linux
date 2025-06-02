from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select
from sqlalchemy import delete
import requests
import json
import xmltodict
import pandas as pd
from app.api.deps import SessionDep, CurrentUser
from app.models import Soil,SoilCreate,SoilsPublic,SoilUpdate, SoilPublic, Message, Site, SoilLongPublic, SoilLongCreate, SoilLong, SoilsLongPublic, SoilLongUpdate
import datetime
router = APIRouter()




@router.get("/", response_model=SoilsPublic)
def read_soils(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve soils.
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
    session: SessionDep, skip: int = 0, limit: int = 100, soilid=int
) -> Any:
    """
    Retrieve soils.
    """
    count_statement = select(func.count()).select_from(Soil).filter(Soil.id == soilid)
    print(count_statement)
    
    count = session.exec(count_statement).one()
    statement = select(Soil).filter(Soil.id == soilid)
    soils = session.exec(statement).all()
    return SoilsPublic(data=soils, count=count)

@router.post("/", response_model=SoilPublic)
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
            status_code=400, detail="Soil name already exists.Please chose a different soil name."
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
    Update an soil.
    """
    soil = session.get(Soil, id)
    if not soil:
        raise HTTPException(status_code=404, detail="soil not found")
    if not current_user.is_superuser and (soil.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    update_dict = soil_in.model_dump(exclude_unset=True)
    soil.sqlmodel_update(update_dict)
    session.add(soil)
    session.commit()
    session.refresh(soil)
    return soil


@router.delete("/{id}")
def delete_soil(session: SessionDep, current_user: CurrentUser, id: int) -> Message:
    """
    Delete an soil.
    """
    soil = session.get(Soil, id)
    if not soil:
        raise HTTPException(status_code=404, detail="soil not found")
    if not current_user.is_superuser and (soil.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    session.delete(soil)
    session.commit()
    return Message(message="soil deleted successfully")


@router.get("/NRCS/{siteId}")
def fetch_soil_profile(session: SessionDep, siteId: int) -> Any:
    """
    Fetch Soil profile from NRCS
    """
    statement = select(Site).where(Site.id == siteId)
    sites = session.exec(statement).first()
    lonLat = str(sites.rlon) + " " + str(sites.rlat)
    url="https://SDMDataAccess.nrcs.usda.gov/Tabular/SDMTabularService.asmx"
    headers = {'content-type': 'text/xml'}
    body = """<?xml version="1.0" encoding="utf-8"?>
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
                                WHERE mu.mukey IN (SELECT * from SDA_Get_Mukey_from_intersection_with_WktWgs84('point(""" + lonLat + """)')) order by co.cokey, ch.chkey, prcent, depth
                    </sdm:Query>
                </sdm:RunQuery>
            </soap:Body>
            </soap:Envelope>"""

    response = requests.post(url,data=body,headers=headers)
    
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
            new_dict={}
            for col in range(22):
                if col == 0:
                    new_dict["Bottom_depth"]=row['depth']
                elif col== 1:
                    new_dict["OM_pct"]=row['OM']
                elif col == 2:    
                    new_dict["NO3"]="25"
                elif col == 3:    
                    new_dict["NH4"]="4"
                elif col == 4:    
                    new_dict["HnNew"]="-200"
                elif col == 5:    
                    new_dict["initType"]=["m","w"]
                elif col == 6:    
                    new_dict["Tmpr"]="25"
                elif col == 7:
                    new_dict["Sand"]=str(row['sand'])
                elif col == 8:
                    new_dict["Silt"]=str(row['silt'])
                elif col == 9:
                    new_dict["Clay"]=str(row['clay'])
                elif col == 10:
                    new_dict["BD"]=str(row['bd'])
                elif col == 11:
                    new_dict["TH33"]=str(row['th33'])
                else:
                    new_dict['default']="-1"
                new_dict['kl']=-0.035
                new_dict['kh']=0.00007
                new_dict['km']=0.07
                new_dict['kn']=0.2
                new_dict['kd']=0.00001
                new_dict['fe']=0.6
                new_dict['fh']=0.2
                new_dict['r0']=10.0
                new_dict['rL']=50.0
                new_dict['rm']=10.0
                new_dict['fa']=0.1
                new_dict['nq']=8
                new_dict['cs']=0.00001
                new_dict['CO2']=400
                new_dict['O2']=206000
                new_dict['N2O']=0
            new_dict_list.append(new_dict)
    except:
        data = [0, 0, 25, 4, -200, "m", 25, 0, 0, 0, 0, -1, -1, 0.035, 0.00007, 0.07, 0.2, 0.00001, 0.6, 0.2, 10.0, 50.0, 10.0, 0.1, 8,0.00001,400,206000,0,-1]
        # data = [0, 0, 25, 4, -200, "m", 25, 0, 0, 0, 0, -1]
        keys=["Bottom_depth", "OM_pct", "NO3", "NH4", "HnNew", "initType", "Tmpr", "Sand", "Silt", "Clay", "BD", "TH33","TH1500","kl", "kh", "km", "kn", "kd", "fe", "fh", "r0", "rL", "rm", "fa", "nq", "cs", "CO2", "O2", "N2O","default"]
        # keys = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "default", "default", "default", "default", "default", "default", "default", "default", "default", "default", "default", "default", "default"]

        new_dict_list = [dict(zip(keys, data))]
    return {"data":new_dict_list}


@router.get("/data/{o_sid}", response_model=SoilsLongPublic)
def read_soil_table(
    session: SessionDep, skip: int = 0, limit: int = 100, o_sid=int
) -> Any:
    """
    Retrieve soils.
    """
    count_statement = select(func.count()).select_from(SoilLong).filter(SoilLong.o_sid == int(o_sid))
    count = session.exec(count_statement).one()
    statement = select(SoilLong).filter(SoilLong.o_sid == int(o_sid))
    soils = session.exec(statement).all()
    return SoilsLongPublic(data=soils, count=count)

@router.post("/data", response_model=SoilLongPublic)
def create_soil_table(
    *, session: SessionDep, soil_in: SoilLongCreate
) -> Any:
    """
    Create new soil.
    """
    soilLong = SoilLong.model_validate(soil_in)
    session.add(soilLong)
    session.commit()
    session.refresh(soilLong)
    return soilLong

@router.put("/data/{o_sid}", response_model=SoilLongPublic)
def update_soil_table(
    *, session: SessionDep, current_user: CurrentUser, id: int, soil_in: SoilLongUpdate
) -> Any:
    """
    Update an soil.
    """
    soilLong = session.get(SoilLong, id)
    if not soilLong:
        raise HTTPException(status_code=404, detail="soil not found")
    update_dict = soil_in.model_dump(exclude_unset=True)
    soilLong.sqlmodel_update(update_dict)
    session.add(soilLong)
    session.commit()
    session.refresh(soilLong)
    return soilLong

@router.delete("/data/{o_sid}")
def delete_soil_table(o_sid: int, session: SessionDep, current_user: CurrentUser) -> Message:
    """
    Delete all soil entries matching the given o_sid.
    """
    # Construct the delete statement
    stmt = delete(SoilLong).where(SoilLong.o_sid == o_sid)
    
    # Execute the delete statement
    result = session.execute(stmt)
    session.commit()
    
    # Check if any rows were deleted
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Soil not found")
    
    return Message(message="deleted")