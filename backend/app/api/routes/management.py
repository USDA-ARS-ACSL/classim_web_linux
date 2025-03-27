from typing import Any, List, Optional
from fastapi import APIRouter, HTTPException, Query, Depends
from app.api.deps import SessionDep, CurrentUser
from app.models import (
    CropsMetasPublic, CropsMeta, ExperimentCreate, Experiment, 
    ExperimentsPublic, Message, TreatmentsPublic, Treatment, Operation, 
    TreatmentCreate, OperationCreate, InitCondOp, TillageOp, FertilizationOp, 
    FertNutOp, PGROp, SR_Op, IrrigPivotOp, OperationsPublic, OperationDateResponse,
    FertilizationClass, PGRChemical, SurfResType, FertilizationWithNutrients, PGRApplType,
    PGRUnit, SurfResApplType, IrrigationClass, CultivarCottondata ,CultivarMaizedata,
    CultivarPotatodata, CultivarSoybeandata, TillageType, TreatmentCopy
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

@router.post("/experiment", response_model=ExperimentCreate)
def create_experiment(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    experiment_in: ExperimentCreate
) -> Any:
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
    count_statement = select(func.count()).select_from(Treatment).filter(Treatment.t_exid == exid)
    count = session.exec(count_statement).one()
    statement = select(Treatment).filter(Treatment.t_exid == exid)
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

@router.post("/treatment", response_model=bool)
def create_treatment(
    treatment_in: TreatmentCreate,
    session: SessionDep,
    current_user: CurrentUser
) -> Any:
    treatmentname = treatment_in.name
    expname = treatment_in.expname
    cropname = treatment_in.crop
    t_exid = treatment_in.t_exid
    
    treatmentID = get_treatment_id(session, treatmentname, expname, cropname)
    
    if treatmentID:
        raise HTTPException(status_code=400, detail="Treatment with this name already exists")

    insert_treatment(session,current_user, t_exid, treatmentname, cropname)
    insert_default_operations(session,current_user, treatmentname, expname, cropname)
    return True

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

def insert_treatment(session: Session, current_user: CurrentUser, exid: int, treatmentname: str, cropname: str) -> None:
    query = text("""
        INSERT INTO treatment (t_exid, name, owner_id) VALUES (:expid, :treatmentname, :owner_id)
    """)
    
    session.execute(query, {
        'expid': exid,
        'treatmentname': treatmentname,
        'owner_id': current_user.id
    })
    session.commit()

def insert_default_operations(session: SessionDep, current_user: CurrentUser, treatmentname: str, expname: str, cropname: str) -> None:
    now = datetime.now()
    yesterday_date = (now - timedelta(1)).strftime('%m/%d/%Y')
    in5days_date = (now + timedelta(5)).strftime('%m/%d/%Y')
    in7days_date = (now + timedelta(7)).strftime('%m/%d/%Y')
    in60days_date = (now + timedelta(60)).strftime('%m/%d/%Y')
    in65days_date = (now + timedelta(65)).strftime('%m/%d/%Y')

    operations = [
        ('Simulation Start', yesterday_date),
        ('Tillage', ''),
        ('Sowing', in5days_date if cropname not in ["fallow", "cotton"] else ''),
        ('Harvest', in60days_date if cropname != "fallow" else ''),
        ('Simulation End', in65days_date),
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
        create_or_update_operation(operation_in, session, current_user)

@router.post("/operation", response_model=bool)
def create_or_update_operation(
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
    # Fetch PGROp data
    statement = select(InitCondOp).filter(InitCondOp.opID == opid)
    sr = session.execute(statement).scalars().first()
    
    # Handle case where no fertilization data is found
    if not sr:
        raise HTTPException(status_code=404, detail="No Simulation Start found")
    
    # Return combined result
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
                    irrAmt_op = IrrigPivotOp(opID=new_op.opID, **dict(zip(["irrigationClass", "numIrrAppl"], [orig_IrrigationType.irrigationClass, orig_IrrigationType.numIrrAppl])))
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
