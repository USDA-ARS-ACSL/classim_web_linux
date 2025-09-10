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
    OperationData, IrrigFloodH, IrrigFloodR, TillageTypesPublic
)
from sqlmodel import func, select
from datetime import datetime, timedelta
from sqlalchemy.sql import text
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

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
    session: SessionDep, cropName: str, current_user: CurrentUser,
) -> Any:
    count_statement = select(func.count()).select_from(Experiment).filter(Experiment.crop == cropName, Experiment.owner_id == current_user.id)
    count = session.exec(count_statement).one()
    statement = select(Experiment).filter(Experiment.crop == cropName, Experiment.owner_id == current_user.id)
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
    session: SessionDep, cropName: str, experimentName: str,current_user: CurrentUser,
) -> Any:
    statement = select(Experiment).where(Experiment.crop == cropName, Experiment.name == experimentName, Experiment.owner_id == current_user.id)
    experiment = session.exec(statement).one_or_none()
    count = 1 if experiment else 0
    return ExperimentsPublic(data=[experiment] if experiment else [], count=count)

@router.get("/treatment/{exid}", response_model=TreatmentsPublic)
def read_treatment_by_experimentId(
    session: SessionDep, exid: int, 
) -> Any:
    """To get treatments based on experiment ID.. """
    count_statement = select(func.count()).select_from(Treatment).filter(Treatment.t_exid == exid, Treatment.owner_id == 1)
    count = session.exec(count_statement).one()
    statement = select(Treatment).filter(Treatment.t_exid == exid)
    treatments = session.exec(statement).all()
    return TreatmentsPublic(data=treatments, count=count)


@router.get("/treatmentbyid/{tid}", response_model=TreatmentsPublic)
def read_treatment_by_experimentId(
    session: SessionDep, tid: int, current_user: CurrentUser,
) -> Any:
    """To get treatments based on experiment ID.. """
    count_statement = select(func.count()).select_from(Treatment).filter(Treatment.tid == tid, Treatment.owner_id == current_user.id)
    count = session.exec(count_statement).one()
    statement = select(Treatment).filter(Treatment.tid == tid, Treatment.owner_id == current_user.id)
    treatments = session.exec(statement).all()
    return TreatmentsPublic(data=treatments, count=count)

@router.delete("/treatment/{tid}")
def delete_treatment(session: SessionDep, current_user: CurrentUser, tid: int) -> Message:
    treatment = session.get(Treatment, tid).filter(Treatment.owner_id == current_user.id).one_or_none()
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
    statement = select(Experiment).where(Experiment.exid == exid, Experiment.owner_id == current_user.id)
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
        create_or_update_operation_from_simStart(operation_in, session, current_user)


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


def create_or_update_operation_from_simStart(
    operation_in: OperationCreate,
    session: SessionDep,
    current_user: CurrentUser
) -> bool:
    op_id = operation_in.opID
    treatmentname = operation_in.treatmentname
    expid = operation_in.exid
    cropname = operation_in.cropname
    operation_record = operation_in.operation_record
    initCond_record = operation_in.initCond_record
    tillage_record = operation_in.tillage_record
    fert_record = operation_in.fert_record
    fertNut_record = operation_in.fertNut_record
    PGR_record = operation_in.PGR_record
    SR_record = operation_in.SR_record
    irrAmt_record = operation_in.irrAmt_record
    
    if op_id == -10:
        o_t_exid = get_treatment_id(session, treatmentname, expid, cropname)
        if not o_t_exid:
            raise HTTPException(status_code=404, detail="Treatment not found")

        new_op = Operation(o_t_exid=o_t_exid, name=operation_record[0], odate=operation_record[1], owner_id=current_user.id)
        session.add(new_op)
        session.commit()
        session.refresh(new_op)
        op_id = new_op.opID

        if operation_record[0] == "Simulation Start" and initCond_record:
            field_names = ["pop", "autoirrigation", "xseed", "yseed", "cec", "eomult", "rowSpacing", "cultivar", "seedpieceMass"]
            init_cond_data = dict(zip(field_names, initCond_record))    
                    
            # Convert fields to appropriate types, handling empty strings or other invalid input
            init_cond_data['pop'] = float(init_cond_data.get('pop') or 0.0)
            init_cond_data['autoirrigation'] = float(init_cond_data.get('autoirrigation') or 0.0)
            init_cond_data['xseed'] = float(init_cond_data.get('xseed') or 0.0)
            init_cond_data['yseed'] = float(init_cond_data.get('yseed') or 0.0)
            init_cond_data['cec'] = float(init_cond_data.get('cec') or 0.0)
            init_cond_data['eomult'] = float(init_cond_data.get('eomult') or 0.0)
            init_cond_data['rowSpacing'] = float(init_cond_data.get('rowSpacing') or 0.0)
            init_cond_data['cultivar'] = str(init_cond_data.get('cultivar') or "")  # Ensure it's a string
            init_cond_data['seedpieceMass'] = float(init_cond_data.get('seedpieceMass') or 0.0)
            print('init.....', init_cond_data)
            # Create InitCondOp object and add it to the session
            try:
                initCond_op = InitCondOp(opID=op_id, **init_cond_data)
                session.add(initCond_op)
                session.commit()  # Commit the session
            except Exception as e:
                session.rollback()  # Rollback on error
                print(f"An error occurred: {e}")

        elif operation_record[0] == "Tillage" and tillage_record:
            tillage_op = TillageOp(opID=op_id, tillage=tillage_record[0])
            session.add(tillage_op)
        elif operation_record[0] == "Fertilizer" and fert_record:
            fert_op = FertilizationOp(opID=op_id, **dict(zip(["fertilizationClass", "depth"], fert_record)))
            session.add(fert_op)
            for i in range(0, len(fertNut_record), 2):
                fertNut_op = FertNutOp(opID=op_id, nutrient=fertNut_record[i], nutrientQuantity=float(fertNut_record[i+1]))
                session.add(fertNut_op)
        elif operation_record[0] == "Plant Growth Regulator" and PGR_record:
            PGR_op = PGROp(opID=op_id, **dict(zip(["PGRChemical", "applicationType", "bandwidth", "applicationRate", "PGRUnit"], PGR_record)))
            session.add(PGR_op)
        elif operation_record[0] == "Surface Residue" and SR_record:
            SR_op = SR_Op(opID=op_id, **dict(zip(["residueType", "applicationType", "applicationTypeValue"], SR_record)))
            session.add(SR_op)
        elif operation_record[0] == "Irrigation Type" and irrAmt_record:
            irrAmt_op = IrrigPivotOp(opID=op_id, **dict(zip(["irrigationClass", "numIrrAppl"], irrAmt_record)))
            session.add(irrAmt_op)

        session.commit()
        return True
    else:        
        o_t_exid = get_treatment_id(session, treatmentname, expid, cropname)        
        if not o_t_exid:
            raise HTTPException(status_code=404, detail="Treatment not found")
        
        op = session.get(Operation, op_id)
        if not op:
            raise HTTPException(status_code=404, detail="Operation not found")

        op.o_t_exid = o_t_exid
        op.name = operation_record[0]
        op.odate = operation_record[1]
        session.commit()

        if operation_record[0] == "Simulation Start":
            initCond_op = session.exec(select(InitCondOp).where(InitCondOp.opID == op_id)).first()
            if initCond_op: 
                print("it is inside now")               
                # Ensure that values are valid before assignment
                initCond_op.pop = float(initCond_record[0])
                initCond_op.autoirrigation = float(initCond_record[1])
                initCond_op.xseed = float(initCond_record[2])
                initCond_op.yseed = float(initCond_record[3])
                initCond_op.cec = float(initCond_record[4])
                initCond_op.eomult = float(initCond_record[5])
                initCond_op.rowSpacing = float(initCond_record[6])
                initCond_op.cultivar = str(initCond_record[7])
                initCond_op.seedpieceMass = float(initCond_record[8])

                session.add(initCond_op)

        elif operation_record[0] == "Tillage":
            tillage_op = session.exec(select(TillageOp).where(TillageOp.opID == op_id)).first()
            if tillage_op:
                tillage_op.tillage = tillage_record[0]
                session.add(tillage_op)
        elif operation_record[0] == "Fertilizer":
            # Fetch the FertilizationOp record based on opID
            fert_op = session.exec(select(FertilizationOp).where(FertilizationOp.opID == op_id)).first()
            
            if fert_op:
                # Update FertilizationOp fields with new data from fert_record
                fert_op.fertilizationClass = fert_record[0]  # Assuming fert_record[0] contains fertilizationClass
                fert_op.depth = fert_record[1]               # Assuming fert_record[1] contains depth
                session.add(fert_op)  # Add the updated record to the session

            # Handle fertNutOp updates
            for i in range(0, len(fertNut_record), 2):
                fertNut_op = session.exec(
                    select(FertNutOp)
                    .where(FertNutOp.opID == op_id)
                    .where(FertNutOp.nutrient == fertNut_record[i])
                ).first()
                
                if fertNut_op:
                    # Update the existing FertNutOp record
                    fertNut_op.nutrientQuantity = float(fertNut_record[i+1])
                else:
                    # If the record doesn't exist, create a new one
                    fertNut_op = FertNutOp(
                        opID=op_id,
                        nutrient=fertNut_record[i],
                        nutrientQuantity=float(fertNut_record[i+1])
                    )
                session.add(fertNut_op)                            
        elif operation_record[0] == "Plant Growth Regulator":
            PGR_op = session.exec(select(PGROp).where(PGROp.opID == op_id)).first()
            if PGR_op:           
                # Update FertilizationOp fields with new data from fert_record
                PGR_op.PGRChemical = PGR_record[0]
                PGR_op.applicationType = PGR_record[1]
                PGR_op.bandwidth = float(PGR_record[2])
                PGR_op.applicationRate = float(PGR_record[3])
                PGR_op.PGRUnit = PGR_record[4]
                session.add(PGR_op)
        elif operation_record[0] == "Surface Residue":
            SR_op = session.exec(select(SR_Op).where(SR_Op.opID == op_id)).first()
            if SR_op:
                SR_op.residueType = SR_record[0]
                SR_op.applicationType = SR_record[1]
                SR_op.applicationTypeValue = float(SR_record[2])
                session.add(SR_op)
        elif operation_record[0] == "Irrigation Type":
            irrAmt_op = session.exec(select(IrrigPivotOp).where(IrrigPivotOp.opID == op_id)).first()
            if irrAmt_op:
                irrAmt_op.irrigationClass = irrAmt_record[0]
                irrAmt_op.numIrrAppl = float(irrAmt_record[1])
                session.add(irrAmt_op)

        session.commit()
        return True

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
        .order_by(text("to_date(odate, 'MM/DD/YYYY') ASC NULLS LAST"), Operation.opID.asc())
        .offset(skip)
        .limit(limit)
    )
    operations = session.exec(statement).all()
    return OperationsPublic(data=operations, count=count)




@router.get('/tillageType', response_model=TillageTypesPublic)
def read_tillage_type(session: SessionDep, skip=0, limit=10) -> TillageTypesPublic:    
    statement = select(TillageType).offset(skip).limit(limit)
    items = session.exec(statement).all()

    return TillageTypesPublic(data=items, count=len(items))



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
    tillageType = data.tillageType

    if op_id is None:
        raise HTTPException(status_code=400, detail="Operation ID is required")
    operation_meta = session.get(Operation, op_id)
    if not operation_meta:
        raise HTTPException(status_code=404, detail="Operation not found")
    if treatmentid is not None:
        operation_meta.o_t_exid = treatmentid
    if op_name is not None:
        operation_meta.name = op_name
    if op_date is not None:
        operation_meta.odate = op_date
    if tillageType != "otherOp":
        tillageopData = session.get(TillageOp, op_id)
        tillageopData.tillage= tillageType
        session.add(tillageopData)
    # if tillageType is not None:
    #     operation.tillageType = tillageType
    session.add(operation_meta)
    session.commit()
    session.refresh(operation_meta)
    return OperationData(
        op_id=operation_meta.opID,
        opName=operation_meta.name,
        treatmentid=operation_meta.o_t_exid,
        opDate=operation_meta.odate,
        tillageType=tillageType
    )


@router.post("/operation/createorupdate")
def create_or_update_operation(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    data: Any = Body(...)
) -> Any:
    data = data.get("data", data)  # Unwrap if payload is wrapped in 'data'

    # --- Validation ---
    required_fields = {
        "fertilization": ["treatmentId", "class", "date", "depth", "n"],
        "s_residue": ["treatmentId", "class", "date", "appType", "appValue"],
        "irrgationType": ["treatmentId", "irrType", "date"]
    }
    op_type = data.get("operationType")
    missing = []
    if op_type in required_fields:
        for field in required_fields[op_type]:
            if not data.get(field):
                missing.append(field)
    if missing:
        raise HTTPException(
                status_code=400, detail=f"Missing required fields: {', '.join(missing)}"
            )
    # --- Existing logic ---
    if op_type == "fertilization":
        opName = "Fertilizer"
        date = data["date"]
    elif op_type == "s_residue":
        opName = "Surface Residue"
        date = data["date"]
    elif op_type == "irrgationType":
        opName = "Irrigation"
        date = data.get("date", "")

    op_id = data.get("operationID", -10)
    if op_id == -10:
        new_op = Operation(o_t_exid=data["treatmentId"], name=opName, odate=date, owner_id=current_user.id)
        session.add(new_op)
        session.commit()
        session.refresh(new_op)
        op_id = new_op.opID
        if op_type == "fertilization":
            fert_op = FertilizationOp(opID=op_id, **dict(zip(["fertilizationClass", "depth"], [data.get("class"), data.get("depth")])))
            session.add(fert_op)
            if data["n"] and float(data["n"]) > 0:
                fertNut_op_nit = FertNutOp(opID=op_id, nutrient="Nitrogen (N)", nutrientQuantity=float(data["n"]))
                session.add(fertNut_op_nit)
            if data.get("carbon") and float(data["carbon"]) > 0:
                fertNut_op_nit = FertNutOp(opID=op_id, nutrient="Carbon (C)", nutrientQuantity=float(data["carbon"]))
                session.add(fertNut_op_nit)
        elif op_type == "s_residue":
            appType = data.get("appType", "Mass")
            SR_op = SR_Op(opID=op_id, **dict(zip(["residueType", "applicationType", "applicationTypeValue"], [data["class"], appType, data["appValue"]])))
            session.add(SR_op)
        elif op_type == "irrgationType":
            irr_type = data.get("irrType")
            if irr_type in ["Drip", "Furrow"]:
                depth = data.get("depth")
                irrAmt_op = IrrigPivotOp(opID=op_id, irrigationClass=irr_type, AmtIrrAppl=depth)
                session.add(irrAmt_op)
            elif irr_type == "FloodH":
                pondDepth = data.get("depth")
                irrStartD = data.get("startDate")
                startH = data.get("startH")
                irrStopD = data.get("endDate")
                stopH = data.get("stopH")
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
                pondDepth = data.get("depth")
                rate = data.get("rate")
                irrStartD = data.get("startDate")
                startH = data.get("startH")
                irrStopD = data.get("endDate")
                stopH = data.get("stopH")
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
                rate = data.get("rate")
                irrAmt_op = IrrigPivotOp(opID=op_id, irrigationClass=irr_type, AmtIrrAppl=rate)
                session.add(irrAmt_op)
        session.commit()
    else:
        op = session.get(Operation, op_id)
        if not op:
            raise HTTPException(status_code=404, detail="Operation not found")
        op.o_t_exid = data["treatmentId"]
        if op_type == "fertilization":
            op.name = "Fertilizer"
            op.odate = data["date"]
        elif op_type == "s_residue":
            op.name = "Surface Residue"
            op.odate = data["date"]
        elif op_type == "irrgationType":
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
                    floodH.startH = data.get("startH")
                    floodH.irrStopD = data.get("endDate")
                    floodH.stopH = data.get("stopH")
                    session.add(floodH)
            elif irr_type == "FloodR":
                floodR = session.exec(select(IrrigFloodR).where(IrrigFloodR.opID == op_id)).first()
                if floodR:
                    floodR.irrigationClass = irr_type
                    floodR.pondDepth = data.get("depth")
                    floodR.rate = data.get("rate")
                    floodR.irrStartD = data.get("startDate")
                    floodR.startH = data.get("startH")
                    floodR.irrStopD = data.get("endDate")
                    floodR.stopH = data.get("stopH")
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
