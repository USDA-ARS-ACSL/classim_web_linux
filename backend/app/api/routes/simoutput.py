from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import PastrunsPublic, Pastrun, Togetsimoutput
from app.dbsupport_helper import read_experimentDB_id, read_treatmentDB_id, getCottonAgronomicData,read_operationsDB_id, readOpDetails, getMaizeDateByDev, getMaizeAgronomicData,getMaturityDate,getSoybeanDevDate,getPotatoAgronomicData,getSoybeanAgronomicData 

router = APIRouter()

@router.get("/", response_model=PastrunsPublic)
def read_pastrun(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve pastruns.
    """
    try:
        statement = (
            select(Pastrun)
            .where(Pastrun.owner_id == current_user.id)
            .offset(skip)
            .limit(limit)
        )
        pastruns = session.exec(statement).all()
        return PastrunsPublic(data=pastruns)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/geteachexpdata/{simid}")
def read_exp_data(
    session: SessionDep, simid: int, current_user: CurrentUser,
) -> Any:
    totalNAppl = 0
    totalirrAppl = 0
    statement = (
        select(Pastrun.treatment)
        .where(Pastrun.id == simid)
    )
    pastruns = session.exec(statement).all()
    split_parts = pastruns[0].split('/')
    cropname = split_parts[0]
    FertilizerDateList = []
    PGRDateList = []
    IrrigationDateList = []
    exid = read_experimentDB_id(cropname, split_parts[1], session)
    tid = read_treatmentDB_id(exid, split_parts[2], session)
    operationList = read_operationsDB_id(tid, session)
    for ii, jj in enumerate(operationList):
        if jj[1] == 'Simulation Start':
            BeginDate = jj[2]  # month/day/year

            initCond = readOpDetails(jj[0], jj[1], session)
            plantDensity = initCond[0][3]
            print("plantDensity+++++++++++++++++++++", plantDensity)
            eomult = initCond[0][8]
            rowSP = initCond[0][9]
            cultivar = initCond[0][10]

        if jj[1] == 'Sowing':
            SowingDate = jj[2]

        if jj[1] == 'Tillage':
            TillageDate = jj[2]

        if jj[1] == "Fertilizer":
            FertilizerDateList.append(jj[2])
            fertInfo = readOpDetails(jj[0], jj[1], session)
            for j in range(len(fertInfo)):
                if fertInfo[j][5] == "Nitrogen (N)":
                    totalNAppl = totalNAppl + fertInfo[j][6]

        if jj[1] in "Plant Growth Regulator":
            PGRDateList.append(jj[2])

        if jj[1] == 'Emergence':
            EmergenceDate = jj[2]

        if jj[1] == 'Harvest':
            HarvestDate = jj[2]  # month/day/year

        if jj[1] == "Irrigation":
            IrrigationDateList.append(jj[2])
            irrInfo = readOpDetails(jj[0], jj[1], session)
            for j in range(len(irrInfo)):
                if irrInfo[j][3] == "Sprinkler":
                    totalirrAppl = totalirrAppl + irrInfo[j][4]
            #   print(totalirrAppl)

    FertilizerDate = ""
    if len(FertilizerDateList) >= 1:
        FertilizerDate = ", "
        FertilizerDate = FertilizerDate.join(FertilizerDateList)

    IrrigationDate = ""
    if len(IrrigationDateList) >= 1:
        IrrigationDate = ", "
        IrrigationDate = IrrigationDate.join(IrrigationDateList)

    PGRDate = ""
    if len(PGRDateList) >= 1:
        PGRDate = ", "
        PGRDate = PGRDate.join(PGRDateList)
    result_dict = {}
    if cropname == "maize":
        # EmergenceDate = getMaizeDateByDev(simid,"Emerged")
        # TasseledDate = getMaizeDateByDev(simid,"Tasseled")
        # SilkedDate = getMaizeDateByDev(simid,"Silked")
        MaturityDate = getMaizeDateByDev(simid, "Matured", session)

        if MaturityDate != "N/A":
            agroDataTuple = getMaizeAgronomicData(simid, MaturityDate, session)
        else:
            agroDataTuple = getMaizeAgronomicData(simid, HarvestDate, session)

    elif cropname=="potato":
        MaturityDate = getMaturityDate(simid, session)
        agroDataTuple = getPotatoAgronomicData(simid, HarvestDate, session)

    elif cropname == "soybean":
        MaturityDate= getSoybeanDevDate(simid,7,session)
        agroDataTuple = getSoybeanAgronomicData(simid, HarvestDate,session)
    elif cropname == "cotton":
        agroDataTuple = getCottonAgronomicData(simid,session)
    # Ensure all values are float for safe multiplication
    result_dict['Yield'] = round(float(agroDataTuple[0]) * float(plantDensity) * 10, 2)
    result_dict['Total_biomass'] = round(float(agroDataTuple[1]) * float(plantDensity) * 10, 2)
    result_dict['Nitrogen_Uptake'] = round(float(agroDataTuple[2]) * float(plantDensity) * 10, 2)
    return result_dict

