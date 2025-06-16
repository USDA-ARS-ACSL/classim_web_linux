from typing import Any, List, Optional
from fastapi import APIRouter, HTTPException, Query, Body, Depends
from app.api.deps import SessionDep, CurrentUser
from app.models import (
    CropsMetasPublic, CropsMeta, ExperimentCreate, Experiment, 
    ExperimentsPublic, IrrigationType, Message, TreatmentsPublic, Treatment, Operation, 
    TreatmentCreate, OperationCreate, InitCondOp, TillageOp, FertilizationOp, 
    FertNutOp, PGROp, SR_Op, IrrigPivotOp, OperationsPublic, OperationDateResponse,
    FertilizationClass, PGRChemical, SurfResType, FertilizationWithNutrients, PGRApplType,
    PGRUnit, SurfResApplType, IrrigationClass, TreatmentPublic ,CultivarMaizedata,
    CultivarPotatodata, CultivarSoybeandata, TillageType, TreatmentCopy, InitCondOpUpdateRequest,
    OperationData, IrrigFloodH, IrrigFloodR
)
from sqlmodel import func, select
from datetime import datetime, timedelta
from sqlalchemy.sql import text
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel

router = APIRouter()

@router.get("/", response_model=CropsMetasPublic)
def read_crops(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    count_statement = select(func.count()).select_from(CropsMeta)
    count = session.exec(count_statement).one()
    statement = (
        select(CropsMeta)
        .order_by(CropsMeta.cropname)
        .offset(skip)
        .limit(limit)
    )
    crops = session.exec(statement).all()
    return CropsMetasPublic(data=crops, count=count)

@router.get("/farm-setup-options")
def get_farm_setup_options(session: SessionDep) -> Any:
    # Get fertilization options
    # Fetch fertilization options
    fert_query = select(FertilizationClass.fertilizationClass)
    fert_result = session.exec(fert_query).all()

    # Fetch unique residue types
    residue_query = select(SurfResType.residueType)
    residue_result = session.exec(residue_query).all()

    # Fetch irrigation types
    irrigation_query = select(IrrigationType.irrigation).where(IrrigationType.irrigation.is_not(None))
    irrigation_result = session.exec(irrigation_query).all()

    return {
        "fertilization": fert_result,
        "s_residue": residue_result,
        "irrgationType": irrigation_result
    }

@router.post("/experiment", response_model=ExperimentCreate)
def create_experiment(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    experiment_in: ExperimentCreate
) -> Any:
    # Check if an experiment with the same name and crop already exists
    existing_experiment = session.exec(
        select(Experiment).where(
            Experiment.name == experiment_in.name,
            Experiment.crop == experiment_in.crop
        )
    ).one_or_none()

    if existing_experiment:
        raise HTTPException(
            status_code=409, 
            detail="An experiment with the same name already exists for the same crop"
        )

    # Create and save the new experiment
    exp = Experiment.model_validate(experiment_in, update={"owner_id": current_user.id})
    session.add(exp)
    session.commit()
    session.refresh(exp)
    return exp

@router.get("/experiment/{cropName}", response_model=ExperimentsPublic)
def read_experiment_by_cropname(
    session: SessionDep, cropName: str, skip: int = 0, limit: int = 100
) -> Any:
    count_statement = select(func.count()).select_from(Experiment).filter(Experiment.crop == cropName)
    count = session.exec(count_statement).one()
    statement = select(Experiment).filter(Experiment.crop == cropName)
    experiments = session.exec(statement).all()
    return ExperimentsPublic(data=experiments, count=count)

@router.delete("/experiment/{exid}")
def delete_experiment(session: SessionDep, current_user: CurrentUser, exid: int) -> Message:
    experiment = session.get(Experiment, exid)
    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")
    session.delete(experiment)
    session.commit()
    return Message(message="Experiment deleted successfully")

@router.get("/experiment/{cropName}/{experimentName}", response_model=ExperimentsPublic)
def read_experiment_by_cropname_and_experimentname(
    session: SessionDep, cropName: str, experimentName: str, skip: int = 0, limit: int = 100,
) -> Any:
    statement = select(Experiment).where(Experiment.crop == cropName, Experiment.name == experimentName)
    experiment = session.exec(statement).one_or_none()
    count = 1 if experiment else 0
    return ExperimentsPublic(data=[experiment] if experiment else [], count=count)

@router.get("/treatment/{exid}", response_model=TreatmentsPublic)
def read_treatment_by_experimentId(
    session: SessionDep, exid: int, skip: int = 0, limit: int = 100
) -> Any:
    """To get treatments based on experiment ID.. """
    count_statement = select(func.count()).select_from(Treatment).filter(Treatment.t_exid == exid)
    count = session.exec(count_statement).one()
    statement = select(Treatment).filter(Treatment.t_exid == exid)
    treatments = session.exec(statement).all()
    return TreatmentsPublic(data=treatments, count=count)


@router.get("/treatmentbyid/{tid}", response_model=TreatmentsPublic)
def read_treatment_by_experimentId(
    session: SessionDep, tid: int, skip: int = 0, limit: int = 100
) -> Any:
    """To get treatments based on experiment ID.. """
    count_statement = select(func.count()).select_from(Treatment).filter(Treatment.tid == tid)
    count = session.exec(count_statement).one()
    statement = select(Treatment).filter(Treatment.tid == tid)
    treatments = session.exec(statement).all()
    return TreatmentsPublic(data=treatments, count=count)

@router.delete("/treatment/{tid}")
def delete_treatment(session: SessionDep, current_user: CurrentUser, tid: int) -> Message:
    treatment = session.get(Treatment, tid)
    if not treatment:
        raise HTTPException(status_code=404, detail="Treatment not found")
    session.delete(treatment)
    session.commit()
    return Message(message="Treatment deleted successfully")

@router.post("/treatment", response_model=TreatmentPublic)
def create_treatment(
    treatment_in: TreatmentCreate,
    session: SessionDep,
    current_user: CurrentUser
) -> Any:
    """Creare a new treatment."""
    treatment = Treatment.model_validate(treatment_in, update={"owner_id": current_user.id})
    stmnt=( select(Treatment.tid).where(Treatment.name == treatment.name, Treatment.t_exid == treatment.t_exid) )
    treatmentid = session.exec(stmnt).one_or_none()
    if treatmentid:
        raise HTTPException(status_code=400, detail="Treatment with this name already exists")
    session.add(treatment)
    session.commit()
    treatmentname = treatment_in.name
    expname = treatment_in.expname
    cropname = treatment_in.crop
    insert_default_operations(session,current_user, treatmentname, expname, cropname)
    session.refresh(treatment)
    return treatment


@router.get("/experiment/experiment/id/{exid}", response_model=ExperimentsPublic)
def get_treatment(session: SessionDep, current_user: CurrentUser, exid: int) -> Message:
    statement = select(Experiment).where(Experiment.exid == exid)
    experiment = session.exec(statement).all()

    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")

    return ExperimentsPublic(data=experiment,count=1)


def insert_default_operations(session: SessionDep, current_user: CurrentUser, treatmentname: str, expname: str, cropname: str) -> None:
    now = datetime.now()
    simstartdate = now.strftime('%m/%d/%Y')
    simstartdate_dt = datetime.strptime(simstartdate, '%m/%d/%Y')  # Convert back to datetime

    sowingdate = (simstartdate_dt + timedelta(7)).strftime('%m/%d/%Y')
    in7days_date = (simstartdate_dt + timedelta(14)).strftime('%m/%d/%Y')  # 7 days after sowingdate
    harvestdate = (simstartdate_dt + timedelta(120)).strftime('%m/%d/%Y')
    simenddate = (simstartdate_dt + timedelta(127)).strftime('%m/%d/%Y')

    operations = [
        ('Simulation Start', simstartdate),
        ('Tillage', ''),
        ('Sowing', sowingdate if cropname not in ["fallow", "cotton"] else ''),
        ('Harvest', harvestdate if cropname != "fallow" else ''),
        ('Simulation End', simenddate),
        ('Emergence', in7days_date if cropname not in ["maize", "fallow"] else '')
    ]

    for op_name, op_date in operations:
        operation_in = OperationCreate(
            opID=-10,  # Assuming -10 means a new operation
            name=op_name,
            exid=expname,
            treatmentname=treatmentname,
            cropname=cropname,
            operation_record=[op_name, op_date],
            initCond_record=[6.5,0,0,5,0.65,0.5,75,'1',0] if cropname == 'fallow' else [6.5,0,0,5,0.65,0.5,75,'0',0],
            #here cultivar name is going wrong check
            tillage_record=['No tillage'] if op_name == 'Tillage' else [],
            fert_record=[],
            fertNut_record=[],
            PGR_record=[],
            SR_record=[],
            irrAmt_record=[],
            owner_id = current_user.id
        )
        if cropname=="maize" and op_name=="Emergence":
            continue
        create_or_update_operation(operation_in, session, current_user)


def get_treatment_id(session: Session, treatmentname: str, expname: str, cropname: str) -> Optional[int]:
    query = text("""
        SELECT t.tid
    FROM treatment t
    JOIN experiment e ON t.t_exid = e.exid
    WHERE t.name = :treatmentname
    AND e.name = CAST(:expname AS VARCHAR)
    AND e.crop = CAST(:cropname AS VARCHAR)
    """)
    
    result = session.execute(query, {
        'treatmentname': treatmentname,
        'expname': expname,
        'cropname': cropname,
    }).scalar_one_or_none()
    
    return result


@router.post("/initCondOp/update/{trearmentId}", response_model=Message)
def update_simulation_start(
    trearmentId: int,
    initCond_op: InitCondOpUpdateRequest,
    session: SessionDep,
    current_user: CurrentUser
) -> Message:
    """Update the simulation start operation, including odate from API."""
    # Find the operation for this treatment with name 'Simulation Start'
    operation = session.exec(
        select(Operation).where(Operation.o_t_exid == trearmentId, Operation.name == "Simulation Start")
    ).first()
    if not operation:
        raise HTTPException(status_code=404, detail="Simulation Start operation not found for this treatment")

    # Update the operation date if provided in the payload
    if hasattr(initCond_op, 'odate') and initCond_op.odate:
        operation.odate = initCond_op.odate
        session.add(operation)

    # Update the InitCondOp record
    db_initcond = session.exec(select(InitCondOp).where(InitCondOp.opID == operation.opID)).first()
    if not db_initcond:
        raise HTTPException(status_code=404, detail="InitCondOp not found for this operation")

    # Update all fields from the payload
    db_initcond.pop = initCond_op.pop
    db_initcond.autoirrigation = initCond_op.autoirrigation
    db_initcond.xseed = initCond_op.xseed
    db_initcond.yseed = initCond_op.yseed
    db_initcond.cec = initCond_op.cec
    db_initcond.eomult = initCond_op.eomult
    db_initcond.rowSpacing = initCond_op.rowSpacing
    db_initcond.cultivar = initCond_op.cultivar
    db_initcond.seedpieceMass = initCond_op.seedpieceMass
    session.add(db_initcond)
    session.commit()
    return Message(message=f"Simulation start updated successfully for treatment {trearmentId}")


@router.get("/operation/{o_t_exid}", response_model=OperationsPublic)
def read_operation_by_treatmentId(
    session: SessionDep, o_t_exid: int, skip: int = 0, limit: int = 100
) -> Any:
    count_statement = select(func.count()).select_from(Operation).filter(Operation.o_t_exid == o_t_exid)
    count = session.exec(count_statement).one()
    
    # Add order_by clause to sort by operation id in ascending order
    statement = (
        select(Operation)
        .filter(Operation.o_t_exid == o_t_exid)
        .order_by(Operation.opID.asc())  # Order by operation id ascending
        .offset(skip)
        .limit(limit)
    )
    operations = session.exec(statement).all()
    return OperationsPublic(data=operations, count=count)

@router.post("/get_first_operation_date", response_model=OperationDateResponse)
def get_first_operation_date(
    session: SessionDep, 
    opname: str = Query(..., description="Name of the operation"),
    treatmentname: str = Query(..., description="Name of the treatment"),
    experimentname: str = Query(..., description="Name of the experiment"),
    cropname: str = Query(..., description="Name of the crop"),
    skip: int = 0, 
    limit: int = 100
) -> OperationDateResponse:
    result = (
        session.query(Operation.odate)
        .join(Treatment, Operation.o_t_exid == Treatment.tid)
        .join(Experiment, Treatment.t_exid == Experiment.exid)
        .filter(
            Operation.name == opname,
            Treatment.name == treatmentname,
            Experiment.name == experimentname,
            Experiment.crop == cropname
        )
        .one_or_none()
    )
    
    if result is None:
        raise HTTPException(status_code=404, detail="No operation date found")
    
    return OperationDateResponse(date=result.odate)

@router.get('/fertilizerClass', response_model=List[str])
def read_fertilization_class(db: SessionDep) -> List[str]:
    stmt = select(FertilizationClass.fertilizationClass).order_by(FertilizationClass.fertilizationClass)
    
    result = db.execute(stmt).scalars().all()

    if not result:
        raise HTTPException(status_code=404, detail="No fertilization classes found")

    return result

@router.get("/experimentList", response_model=ExperimentsPublic)
def read_all_experiments(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    # if current_user.is_superuser:
    #     count_statement = select(func.count()).select_from(Experiment)
    #     count = session.exec(count_statement).one()
    #     statement = select(Experiment).offset(skip).limit(limit)
    #     stations = session.exec(statement).all()
    # else:
    count_statement = (
        select(func.count())
        .select_from(Experiment)
    )
    count = session.exec(count_statement).one()
    statement = (
        select(Experiment)        
        .offset(skip)
        .limit(limit)
    )
    stations = session.exec(statement).all()        
    return ExperimentsPublic(data=stations, count=count)

@router.get('/pgrChemical', response_model=List[str])
def read_pgr_chemical(db: SessionDep) -> List[str]:    
    stmt = select(PGRChemical.PGRChemical).order_by(func.lower(PGRChemical.PGRChemical))
    
    result = db.execute(stmt).scalars().all()

    if not result:
        raise HTTPException(status_code=404, detail="No fertilization classes found")

    return result

@router.get('/surfResType', response_model=List[str])
def read_surf_res_type(db: SessionDep) -> List[str]:    
    stmt = select(SurfResType.residueType).order_by(func.lower(SurfResType.residueType))
    
    result = db.execute(stmt).scalars().all()

    if not result:
        raise HTTPException(status_code=404, detail="No SurfRes Type found")

    return result

@router.get('/irrigationType', response_model=List[str])
def read_irrigation_type(db: SessionDep) -> List[str]:    
    stmt = select(IrrigationClass.irrigationClass).order_by(func.lower(IrrigationClass.irrigationClass))
    
    result = db.execute(stmt).scalars().all()

    return result if result else []  # Return an empty list if no results found


@router.get('/tillageType', response_model=List[str])
def read_tillage_type(db: SessionDep) -> List[str]:    
    stmt = select(TillageType.tillage).order_by(func.lower(TillageType.tillage))
    
    result = db.execute(stmt).scalars().all()

    if not result:
        raise HTTPException(status_code=404, detail="No Irrigation Type found")

    return result

@router.get('/pgrApplType', response_model=List[str])
def read_pgr_application_type(db: SessionDep) -> List[str]:    
    stmt = select(PGRApplType.applicationType).order_by(func.lower(PGRApplType.applicationType))
    
    result = db.execute(stmt).scalars().all()

    if not result:
        raise HTTPException(status_code=404, detail="No PGR Application Type found")

    return result

@router.get('/pgrUnit', response_model=List[str])
def read_pgr_unit(db: SessionDep) -> List[str]:    
    stmt = select(PGRUnit.PGRUnit).order_by(func.lower(PGRUnit.PGRUnit))
    
    result = db.execute(stmt).scalars().all()

    if not result:
        raise HTTPException(status_code=404, detail="No fertilization classes found")

    return result

@router.get('/surfResApplicationType', response_model=List[str])
def read_surf_res_application_type(db: SessionDep) -> List[str]:    
    stmt = select(SurfResApplType.applicationType).order_by(func.lower(SurfResApplType.applicationType))
    
    # Execute the statement and retrieve the results
    result = db.execute(stmt).scalars().all()

    if not result:
        raise HTTPException(status_code=404, detail="No SurfRes Application Type found")

    return result

@router.get("/operation/fertilization/{opid}", response_model=FertilizationWithNutrients)
def read_operation_by_fertilization(
    session: SessionDep, opid: int, skip: int = 0, limit: int = 100
) -> Any:
    # Fetch FertilizationOp data
    statement = select(FertilizationOp).filter(FertilizationOp.opID == opid)
    fertilization = session.execute(statement).scalars().first()
    
    # Fetch FertNutOp data
    statement_fertNut = select(FertNutOp).filter(FertNutOp.opID == opid)
    fertNutOp = session.execute(statement_fertNut).scalars().all()
    
    # Handle case where no fertilization data is found
    if not fertilization:
        raise HTTPException(status_code=404, detail="No fertilization class found")
    
    # Return combined result
    return FertilizationWithNutrients(
        fertilization=fertilization,
        nutrients=fertNutOp
    )
    
@router.get("/operation/PGR/{opid}", response_model=PGROp)
def read_operation_by_PGR(
    session: SessionDep, opid: int, skip: int = 0, limit: int = 100
) -> Any:
    # Fetch PGROp data
    statement = select(PGROp).filter(PGROp.opID == opid)
    pgr = session.execute(statement).scalars().first()
    
    # Handle case where no fertilization data is found
    if not pgr:
        raise HTTPException(status_code=404, detail="No PGR found")
    
    # Return combined result
    return pgr

@router.get("/operation/SR/{opid}", response_model=SR_Op)
def read_operation_by_surfaceResidue(
    session: SessionDep, opid: int, skip: int = 0, limit: int = 100
) -> Any:
    # Fetch PGROp data
    statement = select(SR_Op).filter(SR_Op.opID == opid)
    sr = session.execute(statement).scalars().first()
    
    # Handle case where no fertilization data is found
    if not sr:
        raise HTTPException(status_code=404, detail="No Surface Residue found")
    
    # Return combined result
    return sr

@router.get("/operation/Irrigation/{opid}", response_model=IrrigPivotOp)
def read_operation_by_irrigation(
    session: SessionDep, opid: int, skip: int = 0, limit: int = 100
) -> Any:
    # Fetch PGROp data
    statement = select(IrrigPivotOp).filter(IrrigPivotOp.opID == opid)
    sr = session.execute(statement).scalars().first()
    
    # Handle case where no fertilization data is found
    if not sr:
        raise HTTPException(status_code=404, detail="No Irrigation found")
    
    # Return combined result
    return sr

@router.get("/operation/InitCondOp/{opid}", response_model=InitCondOp)
def read_operation_by_initcondop(
    session: SessionDep, opid: int, skip: int = 0, limit: int = 100
) -> Any:
    # Fetch InitCondOp data using SQLAlchemy ORM query
    sr = session.query(InitCondOp).filter(InitCondOp.opID == opid).first()
    
    # Handle case where no simulation start data is found
    if not sr:
        raise HTTPException(status_code=404, detail="No Simulation Start found")
    
    # Return the ORM object directly (FastAPI will serialize it)
    return sr

@router.get("/operation/tillage/{opid}", response_model=TillageOp)
def read_operation_by_tillage(
    session: SessionDep, opid: int, skip: int = 0, limit: int = 100
) -> Any:
    # Fetch PGROp data
    statement = select(TillageOp).filter(TillageOp.opID == opid)
    sr = session.execute(statement).scalars().first()
    
    # Handle case where no fertilization data is found
    if not sr:
        raise HTTPException(status_code=404, detail="No Simulation Start found")
    
    # Return combined result
    return sr

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

@router.get("/operation/simulation/{cropName}")
def read_cultivar_by_crop(
    session: SessionDep, current_user: CurrentUser,cropName: str, skip: int = 0, limit: int = 100
) -> Any:
    cultivar=find_crop(cropName)
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

@router.delete("/operation/{opId}")
def delete_operation(session: SessionDep, current_user: CurrentUser, opId: int) -> Message:
    # Fetch the operation
    operation = session.get(Operation, opId)
    if not operation:
        raise HTTPException(status_code=404, detail="Operation not found")

    operation_name = operation.name

    if operation_name == 'Fertilizer':
        # Delete records from FertilizationOp table
        session.query(FertilizationOp).filter(FertilizationOp.opID == opId).delete()
        
        # Delete records from FertNutOp table
        session.query(FertNutOp).filter(FertNutOp.opID == opId).delete()
    elif operation_name == 'Plant Growth Regulator':
        session.query(PGROp).filter(PGROp.opID == opId).delete()
    elif operation_name == 'Surface Residue':
        session.query(SR_Op).filter(SR_Op.opID == opId).delete()

    # Delete the record from Operation table
    session.delete(operation)
    
    # Commit the transaction
    session.commit()
    
    return Message(message="Operation deleted successfully")

@router.get("/operationData/{opid}", response_model=Operation)
def read_operation_by_id(
    session: SessionDep, opid: int, skip: int = 0, limit: int = 100
) -> Any:
    # Fetch PGROp data
    statement = select(Operation).filter(Operation.opID == int(opid))
    oplist = session.execute(statement).scalars().first()
    
    # Handle case where no fertilization data is found
    if not oplist:
        raise HTTPException(status_code=404, detail="No Operation found")
    
    # Return combined result
    return (oplist)

@router.post("/treatment/copy")
def copy_treatment(
    treatment: TreatmentCopy, 
    session: SessionDep
    ):
    try:
        treatmentID = get_treatment_id(session, treatment.newtreatmentname, treatment.experimentname, treatment.cropname)
        if treatmentID == None:
            t_id = get_treatment_id(session, treatment.treatmentname, treatment.experimentname, treatment.cropname)

            experiment = session.query(Experiment).filter(Experiment.name == treatment.experimentname, Experiment.crop == treatment.cropname).first()
            if not experiment:
                raise HTTPException(status_code=404, detail="Experiment not found")
            
            new_treatment = Treatment(t_exid=experiment.exid, name=treatment.newtreatmentname)
            session.add(new_treatment)
            session.commit()
            session.refresh(new_treatment)
            
            orig_ops = session.query(Operation).filter(Operation.o_t_exid == t_id).all()
            # for item in data:
            #     item['o_t_exid'] = new_treatment.id
            # return orig_ops
            for orig_op in orig_ops:
                new_op = Operation(o_t_exid=new_treatment.tid, name=orig_op.name, odate=orig_op.odate)
                session.add(new_op)
                session.commit()
                session.refresh(new_op)                
                # return orig_op
                if orig_op.name == "Simulation Start":
                    orig_init_cond = session.query(InitCondOp).filter(InitCondOp.opID == orig_op.opID).first()                    
                    init_cond_rec = {}
                    # Convert fields to appropriate types, handling empty strings or other invalid input
                    init_cond_rec['pop'] = float(orig_init_cond.pop or 0.0)
                    init_cond_rec['autoirrigation'] = float(orig_init_cond.autoirrigation or 0.0)
                    init_cond_rec['xseed'] = float(orig_init_cond.xseed or 0.0)
                    init_cond_rec['yseed'] = float(orig_init_cond.yseed or 0.0)
                    init_cond_rec['cec'] = float(orig_init_cond.cec or 0.0)
                    init_cond_rec['eomult'] = float(orig_init_cond.eomult or 0.0)
                    init_cond_rec['rowSpacing'] = float(orig_init_cond.rowSpacing or 0.0)
                    init_cond_rec['cultivar'] = str(orig_init_cond.cultivar or "")  # Ensure it's a string
                    init_cond_rec['seedpieceMass'] = float(orig_init_cond.seedpieceMass or 0.0)
                                                
                    # Create InitCondOp object and add it to the session
                    try:
                        initCond_op = InitCondOp(opID=new_op.opID, **init_cond_rec)
                        session.add(initCond_op)
                        session.commit()  # Commit the session
                    except Exception as e:
                        session.rollback()  # Rollback on error
                        print(f"An error occurred: {e}")
                elif orig_op.name == "Tillage":
                    orig_tillage = session.query(TillageOp).filter(TillageOp.opID == orig_op.opID).first()
                    if orig_tillage:
                        new_tillage = TillageOp(opID=new_op.opID, tillage=orig_tillage.tillage)
                        session.add(new_tillage)
                elif orig_op.name == "Fertilizer":
                    orig_fertilization = session.query(FertilizationOp).filter(FertilizationOp.opID == orig_op.opID).first()
                    if orig_fertilization:                        
                        fert_op = FertilizationOp(opID=new_op.opID, **dict(zip(["fertilizationClass", "depth"], [orig_fertilization.fertilizationClass, orig_fertilization.depth])))
                        session.add(fert_op)
                        orig_fert_nuts = session.query(FertNutOp).filter(FertNutOp.opID == orig_op.opID).all()
                        for orig_fert_nut in orig_fert_nuts:
                            fertNut_op = FertNutOp(opID=new_op.opID, nutrient=orig_fert_nut.nutrient, nutrientQuantity=float(orig_fert_nut.nutrientQuantity))
                            session.add(fertNut_op)  
                elif orig_op.name == "Plant Growth Regulator":
                    orig_PGR = session.query(PGROp).filter(PGROp.opID == orig_op.opID).first()
                    PGR_op = PGROp(opID=new_op.opID, **dict(zip(["PGRChemical", "applicationType", "bandwidth", "applicationRate", "PGRUnit"], [orig_PGR.PGRChemical, orig_PGR.applicationType, orig_PGR.bandwidth, orig_PGR.applicationRate, orig_PGR.PGRUnit])))
                    session.add(PGR_op)
                elif orig_op.name == "Surface Residue":
                    orig_SR = session.query(SR_Op).filter(SR_Op.opID == orig_op.opID).first()
                    SR_op = SR_Op(opID=new_op.opID, **dict(zip(["residueType", "applicationType", "applicationTypeValue"], [orig_SR.residueType, orig_SR.applicationType, orig_SR.applicationTypeValue])))
                    session.add(SR_op)
                elif orig_op.name == "Irrigation Type":
                    orig_IrrigationType = session.query(IrrigPivotOp).filter(IrrigPivotOp.opID == orig_op.opID).first()
                    irrAmt_op = IrrigPivotOp(opID=new_op.opID, **dict(zip(["irrigationClass", "AmtIrrAppl"], [orig_IrrigationType.irrigationClass, orig_IrrigationType.AmtIrrAppl])))
                    session.add(irrAmt_op)                  
                
                session.commit()
            return {"message": "Treatment copied successfully"}
        else:
            raise HTTPException(status_code=400, detail="Treatment with this name already exists")
    except SQLAlchemyError as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/operations/update_date", response_model=OperationData)
def update_operation_date(
    data: OperationData,
    session: SessionDep,
    current_user: CurrentUser
) -> Any:
    """Update the date of an operation by op_id."""
    op_id = data.op_id
    op_name = data.opName
    treatmentid = data.treatmentid
    op_date = data.opDate

    if op_id is None:
        raise HTTPException(status_code=400, detail="Operation ID is required")
    operation = session.get(Operation, op_id)
    if not operation:
        raise HTTPException(status_code=404, detail="Operation not found")
    if treatmentid is not None:
        operation.o_t_exid = treatmentid
    if op_name is not None:
        operation.name = op_name
    if op_date is not None:
        operation.odate = op_date
    session.add(operation)
    session.commit()
    session.refresh(operation)
    return OperationData(
        op_id=operation.opID,
        opName=operation.name,
        treatmentid=operation.o_t_exid,
        opDate=operation.odate
    )


@router.post("/operation/createorupdate")
def create_or_update_operation(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    data: Any = Body(...)
) -> bool:
    print(data)
    data = data.get("data", data)  # Unwrap if payload is wrapped in 'data'
    if data["operationType"] == "fertilization" :
        opName="Fertilizer"
        date=data["date"]
    elif data["operationType"] == "s_residue":
        opName="Surface Residue"
        date=data["date"]
    elif data["operationType"] == "irrgationType":
        opName="Irrigation"
        date = data.get("date", "")

    op_id = data.get("operationID", -10)
    if op_id == -10:
        new_op = Operation(o_t_exid=data["treatmentId"], name=opName, odate=date, owner_id=current_user.id)
        session.add(new_op)
        session.commit()
        session.refresh(new_op)
        op_id = new_op.opID
        print(data.get("class"), "class not found")
        if data["operationType"] == "fertilization" :
            fert_op = FertilizationOp(opID=op_id, **dict(zip(["fertilizationClass", "depth"], [data.get("class"), data.get("depth")])) )
            session.add(fert_op)
            if data["n"] and int(data["n"])>0:
                fertNut_op_nit = FertNutOp(opID=op_id, nutrient="Nitrogen (N)", nutrientQuantity=float(data["n"]))
                session.add(fertNut_op_nit)            
            if data.get("carbon") and int(data.get("carbon"))>0:
                fertNut_op_nit = FertNutOp(opID=op_id, nutrient="Carbon (C)", nutrientQuantity=float(data["carbon"]))
                session.add(fertNut_op_nit)
        elif data["operationType"] == "s_residue":
            try:
                appType=data["appType"]
            except:
                appType="Mass"
            SR_op = SR_Op(opID=op_id, **dict(zip(["residueType", "applicationType", "applicationTypeValue"], [data["class"],appType, data["appValue"]])))
            session.add(SR_op)
        elif data["operationType"] == "irrgationType":
            irr_type = data.get("irrType")
            if irr_type in ["Drip", "Furrow"]:
                # Insert into IrrigPivotOp (Drip/Furrow)
                depth = data.get("depth")
                irrAmt_op = IrrigPivotOp(opID=op_id, irrigationClass=irr_type, AmtIrrAppl=depth)
                session.add(irrAmt_op)
            elif irr_type == "FloodH":
                # Insert into irrig_floodH
                pondDepth = data.get("depth")
                irrStartD = data.get("startDate")
                startH = data.get("startTime")
                irrStopD = data.get("endDate")
                stopH = data.get("endTime")
                irrig_floodH = IrrigFloodH(
                    opID=op_id,
                    irrigationClass=irr_type,
                    pondDepth=pondDepth,
                    irrStartD=irrStartD,
                    startH=startH,
                    irrStopD=irrStopD,
                    stopH=stopH
                )
                session.add(irrig_floodH)
            elif irr_type == "FloodR":
                # Insert into irrig_floodR
                pondDepth = data.get("depth")
                rate = data.get("rate")
                irrStartD = data.get("startDate")
                startH = data.get("startTime")
                irrStopD = data.get("endDate")
                stopH = data.get("endTime")
                irrig_floodR = IrrigFloodR(
                    opID=op_id,
                    irrigationClass=irr_type,
                    pondDepth=pondDepth,
                    rate=rate,
                    irrStartD=irrStartD,
                    startH=startH,
                    irrStopD=irrStopD,
                    stopH=stopH
                )
                session.add(irrig_floodR)
            elif irr_type == "Sprinkler":
                # Insert into IrrigPivotOp (Sprinkler)
                rate = data.get("rate")
                irrAmt_op = IrrigPivotOp(opID=op_id, irrigationClass=irr_type, AmtIrrAppl=rate)
                session.add(irrAmt_op)

        session.commit()
    else:        
        op = session.get(Operation, op_id)
        if not op:
            raise HTTPException(status_code=404, detail="Operation not found")
        # Update Operation main fields
        op.o_t_exid = data["treatmentId"]
        if data["operationType"] == "fertilization":
            op.name = "Fertilizer"
            op.odate = data["date"]
        elif data["operationType"] == "s_residue":
            op.name = "Surface Residue"
            op.odate = data["date"]
        elif data["operationType"] == "irrgationType":
            op.name = "Irrigation"
            op.odate = data.get("date", "")
        session.add(op)

        # Update child tables (same as in if block, but update instead of insert)
        if data["operationType"] == "fertilization":
            fert_op = session.exec(select(FertilizationOp).where(FertilizationOp.opID == op_id)).first()
            if fert_op:
                fert_op.fertilizationClass = data.get("class")
                fert_op.depth = data.get("depth")
                session.add(fert_op)
            # Update or create FertNutOp for N
            if data.get("n") and int(data["n"]) > 0:
                fert_nut = session.exec(select(FertNutOp).where(FertNutOp.opID == op_id, FertNutOp.nutrient == "Nitrogen (N)")).first()
                if fert_nut:
                    fert_nut.nutrientQuantity = float(data["n"])
                else:
                    fert_nut = FertNutOp(opID=op_id, nutrient="Nitrogen (N)", nutrientQuantity=float(data["n"]))
                session.add(fert_nut)
            # Update or create FertNutOp for Carbon
            if data.get("carbon") and int(data["carbon"]) > 0:
                fert_c = session.exec(select(FertNutOp).where(FertNutOp.opID == op_id, FertNutOp.nutrient == "Carbon (C)")).first()
                if fert_c:
                    fert_c.nutrientQuantity = float(data["carbon"])
                else:
                    fert_c = FertNutOp(opID=op_id, nutrient="Carbon (C)", nutrientQuantity=float(data["carbon"]))
                session.add(fert_c)
        elif data["operationType"] == "s_residue":
            sr_op = session.exec(select(SR_Op).where(SR_Op.opID == op_id)).first()
            if sr_op:
                sr_op.residueType = data.get("class")
                sr_op.applicationType = data.get("appType", "Mass")
                sr_op.applicationTypeValue = data.get("appValue")
                session.add(sr_op)
        elif data["operationType"] == "irrgationType":
            irr_type = data.get("irrType")
            if irr_type in ["Drip", "Furrow"]:
                irrAmt_op = session.exec(select(IrrigPivotOp).where(IrrigPivotOp.opID == op_id)).first()
                if irrAmt_op:
                    irrAmt_op.irrigationClass = irr_type
                    irrAmt_op.AmtIrrAppl = data.get("depth")
                    session.add(irrAmt_op)
            elif irr_type == "FloodH":
                floodH = session.exec(select(IrrigFloodH).where(IrrigFloodH.opID == op_id)).first()
                if floodH:
                    floodH.irrigationClass = irr_type
                    floodH.pondDepth = data.get("depth")
                    floodH.irrStartD = data.get("startDate")
                    floodH.startH = data.get("startTime")
                    floodH.irrStopD = data.get("endDate")
                    floodH.stopH = data.get("endTime")
                    session.add(floodH)
            elif irr_type == "FloodR":
                floodR = session.exec(select(IrrigFloodR).where(IrrigFloodR.opID == op_id)).first()
                if floodR:
                    floodR.irrigationClass = irr_type
                    floodR.pondDepth = data.get("depth")
                    floodR.rate = data.get("rate")
                    floodR.irrStartD = data.get("startDate")
                    floodR.startH = data.get("startTime")
                    floodR.irrStopD = data.get("endDate")
                    floodR.stopH = data.get("endTime")
                    session.add(floodR)
            elif irr_type == "Sprinkler":
                irrAmt_op = session.exec(select(IrrigPivotOp).where(IrrigPivotOp.opID == op_id)).first()
                if irrAmt_op:
                    irrAmt_op.irrigationClass = irr_type
                    irrAmt_op.AmtIrrAppl = data.get("rate")
                    session.add(irrAmt_op)
        session.commit()
    return True

@router.get("/operation/full/{opid}")
def get_full_operation_by_id(
    opid: int,
    session: SessionDep
) -> Any:
    """
    Get all info related to an operation by opid, including child tables for Fertilizer, Surface Residue, and Irrigation types.
    """
    op = session.get(Operation, opid)
    if not op:
        raise HTTPException(status_code=404, detail="Operation not found")
    result = {"operation": op}

    # Try to fetch FertilizationOp and nutrients
    fert_op = session.exec(select(FertilizationOp).where(FertilizationOp.opID == opid)).first()
    if fert_op:
        fert_nutrients = session.exec(select(FertNutOp).where(FertNutOp.opID == opid)).all()
        result["fertilization"] = fert_op
        result["fertilization_nutrients"] = fert_nutrients
    print(result)
    # Try to fetch Surface Residue
    sr_op = session.exec(select(SR_Op).where(SR_Op.opID == opid)).first()
    if sr_op:
        result["surface_residue"] = sr_op
    # Try to fetch Irrigation (Drip, Furrow, Sprinkler)
    irr_pivot = session.exec(select(IrrigPivotOp).where(IrrigPivotOp.opID == opid)).first()
    if irr_pivot:
        result["irrigation_pivot"] = irr_pivot
    # Try to fetch FloodH
    floodH = session.exec(select(IrrigFloodH).where(IrrigFloodH.opID == opid)).first()
    if floodH:
        result["irrigation_floodH"] = floodH
    # Try to fetch FloodR
    floodR = session.exec(select(IrrigFloodR).where(IrrigFloodR.opID == opid)).first()
    if floodR:
        result["irrigation_floodR"] = floodR
    
    return result
