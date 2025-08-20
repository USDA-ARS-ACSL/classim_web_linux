import sqlite3
import re
from typing import Any, List
import os
import pandas as pd
import shutil
from sqlalchemy.sql import text
from datetime import datetime as dt
from app.api.deps import SessionDep
from datetime import datetime, timedelta
currentDir = os.getcwd()
dbDir=os.path.join(currentDir,'executables')


def read_experimentDB_id(cropname: str, experimentname: str, session: SessionDep) -> Any:
    '''
    Extracts experiment id based on crop and treatment name.
    Input:
      cropname
      treatmentname
    Output:
      experiment id
    '''
    query = text("""
        SELECT exid FROM experiment WHERE crop = :cropname AND name = :experimentname
    """)

    # Execute the query with provided parameters
    result = session.execute(query, {'cropname': cropname, 'experimentname': experimentname})

    # Fetch and return the result
    row = result.fetchone()
    return row[0] if row else None



def read_operationsDB_id(o_t_exid: int, session: SessionDep) -> List[Any]:
    '''
    Get all operations using treatment id.
    Input:
      o_t_exid = treatment id
    Output:
      list of tuples listing all operations with full detail
    '''
    query = text("""
        SELECT "opID", name, odate FROM operations WHERE o_t_exid = :o_t_exid
    """)

    # Execute the query with the treatment id
    result = session.execute(query, {'o_t_exid': o_t_exid})

    # Fetch all rows and return them as a list of tuples
    return result.fetchall()


def read_treatmentDB_id(exid: int, treatmentname: str, session: SessionDep) -> Any:
    '''
    Returns treatment id based on treatment name and experiment id.
    Input:
      exid = experiment id
      treatmentname
    Output:
      tid = treatment id
    '''
    query = text("""
        SELECT tid FROM treatment WHERE t_exid = :exid AND name LIKE :treatmentname
    """)

    # Execute the query with the experiment id and treatment name
    result = session.execute(query, {'exid': exid, 'treatmentname': treatmentname + '%'})

    # Fetch the result and return the treatment id if it exists
    row = result.fetchone()
    return row[0] if row else None


def is_all_cultivar_zero(tid: int, session: SessionDep) -> bool:
    """
    Returns True if all cultivar values for the given treatment id are 0, otherwise False.
    """
    query = text("""
        SELECT ico.cultivar
        FROM operations o
        JOIN "initCondOp" ico ON o."opID" = ico."opID"
        WHERE o.o_t_exid = :tid
    """)
    result = session.execute(query, {'tid': tid})
    rows = result.fetchall()
    # If any cultivar is not 0, return False
    for row in rows:
        if row[0] != '0':
            return True
    return False


def readOpDetails(operationid: int, operationName: str, session: SessionDep) -> list:
    '''
    Extract operation info based on operation id
    Input: 
        operationid
        operationName
    Output: 
        List of tuples with operation info
    '''
    rlist = [] 
    query = """
    SELECT o."opID", name, odate, {columns}
    FROM operations o
    {join_clause}
    WHERE o."opID" = :operationid
    """

    columns = ""
    join_clause = ""
    if operationName == 'Simulation Start':
        columns = """pop, autoirrigation, xseed, yseed, cec, eomult, "rowSpacing", cultivar, "seedpieceMass" """
        join_clause = """JOIN "initCondOp" ico ON o."opID" = ico."opID" """
    elif operationName == 'Tillage':
        columns = "tillage"
        join_clause = """JOIN "tillageOp" t ON o."opID" = t."opID" """
    elif operationName == 'Fertilizer':
        columns = """ "fertilizationClass", depth, nutrient, "nutrientQuantity" """
        join_clause = """JOIN "fertilizationOp" fo ON o."opID" = fo."opID" JOIN "fertNutOp" fno ON o."opID" = fno."opID" """
    elif operationName == 'Plant Growth Regulator':
        columns = """ "PGRChemical", po."applicationType", bandwidth, "applicationRate", po."PGRUnit", pat.code as appTypeCode, pu.code as appUnitCode"""
        join_clause = """JOIN "PGROp" po ON o."opID" = po."opID" JOIN "PGRApplType" pat ON po."applicationType" = pat."applicationType" JOIN "PGRUnit" pu ON po."PGRUnit" = pu."PGRUnit" """
    elif operationName == "Surface Residue":
        columns = """ "residueType", "applicationType", "applicationTypeValue" """
        join_clause = """JOIN "surfResOp" sro ON o."opID" = sro."opID" """
    elif operationName == "Irrigation":
        columns = """ "irrigationClass", "AmtIrrAppl" """
        join_clause = """JOIN "Irrig_pivotOp" Iro ON o."opID" = Iro."opID" """
    else:
        columns = ""
    
    query = query.format(columns=columns, join_clause=join_clause)
    query = text(query)
    result = session.execute(query, {'operationid': operationid})
    rlist = result.fetchall()
    return rlist


def extract_sitedetails(site_string: str, session: SessionDep):
    '''
    Retrieve site information from sitedetails table
    Input:
        site_string = sitename
    Output:
        Tuple = (site id, latitude, longitude, altitude)
    '''
    query = text("""
    SELECT id, rlat, rlon, altitude
    FROM site
    WHERE sitename = :site_string
    """)

    result = session.execute(query, {'site_string': site_string})
    row = result.fetchone()
    if row:
        return row
    return None

def read_soillongDB_maxdepth(soilname: str, session: SessionDep):
    '''
    Return max Bottom_depth from soil_long based on soilname
    Input:
        soilname
    Output:
        Tuple with max Bottom_depth
    '''
    query = text("""
    SELECT max("Bottom_depth")
    FROM soil_long
    WHERE o_sid = (SELECT site_id FROM soil WHERE soilname = :soilname)
    """)

    result = session.execute(query, {'soilname': soilname})
    row = result.fetchone()
    if row:
        return row[0]
    return None


def getTreatmentID(treatmentname: str, experimentname: str, cropname: str, session: SessionDep):
    '''
    Get treatmentID based on treatment name, experiment name and crop name.
    Input:
        treatmentname
        experimentname
        cropname
    Output:
        treatmentID
    '''
    query = text("""
    SELECT tid
    FROM treatment
    WHERE name = :treatmentname
      AND t_exid = (SELECT exid FROM experiment WHERE name = :experimentname AND crop = :cropname)
    """)

    result = session.execute(query, {
        'treatmentname': treatmentname,
        'experimentname': experimentname,
        'cropname': cropname
    })
    row = result.fetchone()
    if row:
        return row[0]
    return None

def delete_cropOutputSim(id: str, crop: str, session: SessionDep) -> bool:
    '''
    Delete crop output simulation data from specific tables based on crop type
    Input:
        id
        crop
    Output:
        True if successful
    '''
    file_ext = []
    if crop == "maize":
        file_ext = ["g01", "g03", "g04", "g05", "g07", "plantStress"]
    elif crop == "potato" or crop == "soybean":
        file_ext = ["g01", "g03", "g04", "g05", "g07", "nitrogen", "plantStress"]
    elif crop == "fallow":
        file_ext = ["g03", "g05", "g07"]
    elif crop == "cotton":
        file_ext = ["g01", "g03", "g04", "g05", "g07", "plantStress"]

    # Delete geometry data
    geo_query = text("""DELETE FROM geometry WHERE "simID" = :id""")
    session.execute(geo_query, {'id': id})

    # Delete from each crop-specific table
    for ext in file_ext:
        table_name = f"{ext}_{crop}"
        id_name = f"{table_name}_id"
        query = text(f"DELETE FROM {table_name} WHERE {id_name} = :id")
        session.execute(query, {'id': id})

    session.commit()
    return True


def delete_pastrunsDB(id: str, cropname: str, session: SessionDep) -> bool:
    '''
    Delete pastrun.
    Input:
        id
        cropname
    Output:
        True if successful
    '''
    # Delete the pastrun entry
    # query = "DELETE FROM pastruns WHERE id = :id"
    # session.execute(query, {'id': id})
    
    # session.commit()

    # # Delete the directory that was created with the simulation information
    # sim_dir = os.path.join(dbDir, id)
    # shutil.rmtree(sim_dir, ignore_errors=True)

    # Delete simulations on the cropOutput database tables
    delete_cropOutputSim(id, cropname, session)

    return True

def read_biologydefault(session: SessionDep):
    '''
    Returns default biologydefault information to be used in the soil2d biology input file
    Input:
    Output:
        List of tuples with biologydefault information
    '''
    query = text("""
    SELECT "dthH", "dthL", es, "Th_m", tb, "QT", "dThD", "Th_d" 
    FROM biologydefault
    """)
    result = session.execute(query)
    return result.fetchall()


def getMaizeDateByDev(sim_id:int ,maizePhase: str, session:SessionDep):
    '''
  Returns date for tuber initiation date.
  Input:
    sim_id = simulation id
    maizePhase = maize development phase keyword
  Output:
    tuber initiation date
    '''
    rlist = "" 
    query = text("""select min("Date_Time") from g01_maize where g01_maize_id=:id and "Note"=:phase""")
    result = session.execute(query, {
        'id': sim_id,
        'phase': maizePhase,
    })
    row = result.fetchone()
    if row[0] is not None:
        rlist = row[0].strftime('%m/%d/%Y')
    else:
        rlist="N/A"
    return rlist


def getMaturityDate(sim_id:int ,session:SessionDep):
    '''
  Returns date for maturity date.
  Input:
    sim_id = simulation id
  Output:
    maturity date
    '''
    rlist = "" # list
    query= text("""select min("Date_Time") from g01_potato where "Stage" > 10 and g01_potato_id=:id""")
    result= session.execute(query, {'id': sim_id})

    row = result.fetchone()
    print("getMaturityDate+++++++++++", row)
    if row[0] is not None:
        try:
            rlist = row[0].strftime('%m/%d/%Y')
        except AttributeError:
            rlist = row[0]  # Already a string
    else:
        rlist = "N/A"
    return rlist


def getSoybeanDevDate(sim_id, rstage, session:SessionDep):
    '''
  Returns the date for a soybean plant development stage.
  Input:
    sim_id = simulation id
    rstage = index that will corespond with a development stage
  Output:
    date
    '''
    rlist = "" # list
    query= text("""select min("Date_Time") from g01_soybean where "RSTAGE" >= :rstage and g01_soybean_id=:sim_id""")
    result= session.execute(query, {
        'rstage': rstage,
        'sim_id': sim_id
    })
    row = result.fetchone()
    if row:
        if row[0] is not None:
            rlist = row[0].strftime('%m/%d/%Y')
        else:
            rlist = "N/A"
        return rlist

def getMaizeAgronomicData(sim_id, date, session:SessionDep):
    '''
  Returns maize agronomical date.
  Input:
    sim_id = simulation id
    date = maturity date
  Output:
    earDM = yield
    shootDM = total biomass
    NUpt
    '''
    rlist = None # list

    harvestDate = dt.strptime(date, '%m/%d/%Y').strftime('%Y-%m-%d')
    query=text("""select (max("earDM")*.86), max("shootDM"), max("NUpt") from g01_maize where g01_maize_id=:id and "Date_Time" <= :time""")
    result = session.execute(query, {
        'id': sim_id,
        'time': harvestDate+'%',
    })
    print(f"select (max(earDM)*.86), max(shootDM), max(NUpt) from g01_maize where g01_maize_id={sim_id} and Date_Time <= {harvestDate}")
    c1row = result.fetchone()
    if c1row != None:
        rlist = c1row

    return rlist


def getPotatoAgronomicData(sim_id, date,session:SessionDep):
    '''
  Returns agronomical date.
  Input:
    sim_id = simulation id
    date = maturity date
  Output:
    tuberDM = yield
    totalDM = total biomass
    Tr-Act = transpiration
    '''
    rlist = None # list   
    harvestDate = dt.strptime(date, '%m/%d/%Y').strftime('%Y-%m-%d')
    query= text("""select max("tuberDM"), max("totalDM"), sum("Tr-Act") from g01_potato where g01_potato_id=:id and "Date_Time" <= :time""")
    result= session.execute(query, {
        'id': sim_id,
        'time': harvestDate+'%',
    })
    c = result.fetchone()
    rlist = [] 
    if c is not None:
        rlist = c
    else:
        rlist = (0, 0, 0)
    return rlist


def getSoybeanAgronomicData(sim_id, date, session:SessionDep):
    '''
  Returns soybean agronomical date.
  Input:
    sim_id = simulation id
    date = maturity date
  Output:
    seedDM = yield
    totalDM = total biomass
    Tr_act = transpiration
    '''
    rlist = None # list   
    harvestDate = dt.strptime(date, '%m/%d/%Y').strftime('%Y-%m-%d')
    query= text("""select max("seedDM"), max("totalDM"), sum("Tr_act") from g01_soybean where g01_soybean_id=:id and "Date_Time" <= :time""")
    result= session.execute(query, {
        'id': sim_id,
        'time': harvestDate+'%',
    })
    c = result.fetchone()
    rlist = [] 
    if c is not None:
        rlist = c
    else:
        rlist = (0, 0, 0)
    print(f"getSoybeanAgronomicData++++++++++++++++++++++: {query}, {rlist}")
    return rlist


def getCottonAgronomicData(sim_id,session:SessionDep):
    '''
  Returns cotton agronomic data.
  Input:
    sim_id = simulation id
  Output:
    date
    yield
    PlantDM (total biomass)
    N_uptake
    '''
    query=text("""select "Yield", "PlantDM", "N_uptake","Date_Time" from g01_cotton where g01_cotton_id=:sim_id ORDER BY "Date_Time" DESC LIMIT 1""")
    result = session.execute(query, {
        'sim_id': sim_id,
    })
    
    rlist = []
    c = result.fetchone()
    print(query, c, "+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")
    if c is None:
        rlist = (None, 0, 0, 0) 
    else:
        rlist=c
    return rlist


def read_cultivar_DB_detailed(hybridname: str, cropname: str, session: SessionDep,current_user_id=None) -> Any:
    '''
    Extracts the link id from cropname and croptable. With linkid, we can query cultivar_* table to get details of the crop variety.
    This one gives a lot more parameters.
    Input:
        hybridname
        cropname
    Output:
        Tuple with complete information about a particular hybridname
    '''
    query = ""
    if cropname == "maize":
        query = text("""
        SELECT "juvenileleaves","DaylengthSensitive","Rmax_LTAR","Rmax_LTIR","PhyllFrmTassel","StayGreen","LM_min",
               "RRRM","RRRY","RVRL","ALPM","ALPY","RTWL","RTMinWTperArea","EPSI","IUPW","CourMax","Diffx","Diffz","VelZ",
               "lsink","Rroot","Constl_M","ConstK_M","Cmin0_M","ConstI_Y","ConstK_Y","Cmin0_Y","hybridname"
        FROM cultivar_maize
        WHERE hybridname = :hybridname AND owner_id = :owner
        """)
    elif cropname == "potato":
        query = text("""
        SELECT "A1","A6","A8","A9","A10","G1","G2","G3","G4","RRRM","RRRY","RVRL","ALPM","ALPY","RTWL","RTMinWTperArea",
               "EPSI","IUPW","CourMax","Diffx","Diffz","VelZ","lsink","Rroot","Constl_M","ConstK_M","Cmin0_M","ConstI_Y",
               "ConstK_Y","Cmin0_Y"
        FROM cultivar_potato
        WHERE hybridname = :hybridname AND owner_id = :owner
        """)
    elif cropname == "soybean":
        query = text("""
        SELECT "matGrp","seedLb","fill","v1","v2","v3","r1","r2","r3","r4","r5","r6","r7","r8","r9","r10","r11","r12","g1",
              "g2","g3","g4","g5","g6","g7","g8","g9","RRRM","RRRY","RVRL","ALPM","ALPY","RTWL","RTMinWTperArea","EPSI",
              "IUPW","CourMax","Diffx","Diffz","VelZ","lsink","Rroot","Constl_M","ConstK_M","Cmin0_M","ConstI_Y","ConstK_Y","Cmin0_Y"
        FROM cultivar_soybean
        WHERE hybridname = :hybridname AND owner_id = :owner
        """)
    elif cropname == "cotton":
        query = text("""
        SELECT calbrt11, calbrt12, calbrt13, calbrt15, calbrt16, calbrt17, calbrt18, calbrt19, calbrt22,
               calbrt26, calbrt27, calbrt28, calbrt29, calbrt30, calbrt31, calbrt32, calbrt33, calbrt34, calbrt35,
               calbrt36, calbrt37, calbrt38, calbrt39, calbrt40, calbrt41, calbrt42, calbrt43, calbrt44, calbrt45,
               calbrt47, calbrt48, calbrt49, calbrt50, calbrt52, calbrt57
        FROM cultivar_cotton
        WHERE hybridname = :hybridname AND owner_id = :owner
        """)
    result = session.execute(query, {'hybridname': hybridname, 'owner': current_user_id})
    resp=result.fetchone()
    return resp

def read_soiltextureDB(soilname: str, session: SessionDep):
    '''
    Returns soil texture information from soil_long table based on soilname.
    Input:
        soilname
    Output:
        List of tuples with soil information
    '''
    query = text("""
    SELECT "Sand", "Silt", "Clay"
    FROM soil_long
    WHERE o_sid = (SELECT site_id FROM soil WHERE soilname = :soilname)
    """)
    result = session.execute(query, {'soilname': soilname})
    return result.fetchall()

def read_soluteDB( session: SessionDep,id= 1):
    '''
    Returns default solute information to be used in the soil2d solute input file
    Input:
        id
    Output:
        Tuple with solute information
    '''
    query = text("""
    SELECT name, "EPSI", "IUPW", "CourMax", "Diffusion_Coeff"
    FROM solute
    WHERE id = :id
    """)
    result = session.execute(query, {'id': id})
    return result.fetchone()

def read_dispersivityDB(texture, session: SessionDep) -> Any:
    '''
    Return the selected record from the dispersivity table based on texture
    Input:
      texture
    Output:
      Tuple with dispersivity information
    '''
    rtuple = ()
    if texture != "":
        query = text("""SELECT alpha FROM dispersivity WHERE texturecl LIKE :texture""") ###start from here alpha 1 var called but touple has two
        result = session.execute(query, {'texture': texture})
        rtuple = result.fetchone()
    return rtuple



def read_operation_timeDB2(operationname, treatmentname, experimentname, cropname, session: SessionDep) -> Any:
    '''
    Checks if the operations exist, then extract the time info based on operation, treatment, experiment and
    crop name.
    Input: 
      treatmentname
      experimentname
      cropname
      operationname.
    Output: 
      operationname date info
    '''
    rtuple = ()
    if experimentname and operationname:
        record_tuple = {'treatmentname': treatmentname, 'experimentname': experimentname, 'cropname': cropname}
        query1 = text("""
            SELECT tid, t_exid 
            FROM treatment 
            WHERE name = :treatmentname 
              AND t_exid = (SELECT exid FROM experiment WHERE name = :experimentname AND crop = :cropname)
        """)
        c1_row = session.execute(query1, record_tuple).fetchone()
        
        if c1_row:
            o_t_exid = c1_row[0]
            query2 = text("""
                            SELECT odate, 
                                DATE(year || '-' || month || '-' || day) AS dt_frmtd
                            FROM (
                                SELECT *, 
                                    CASE 
                                        WHEN LENGTH(SUBSTR(odate, 1, POSITION('/' IN odate) - 1)) = 2 
                                        THEN SUBSTR(odate, 1, POSITION('/' IN odate) - 1) 
                                        ELSE '0' || SUBSTR(odate, 1, POSITION('/' IN odate) - 1) 
                                    END AS month, 
                                    CASE 
                                        WHEN LENGTH(SUBSTR(SUBSTR(odate, POSITION('/' IN odate) + 1), 1, POSITION('/' IN SUBSTR(odate, POSITION('/' IN odate) + 1)) - 1)) = 2 
                                        THEN SUBSTR(SUBSTR(odate, POSITION('/' IN odate) + 1), 1, POSITION('/' IN SUBSTR(odate, POSITION('/' IN odate) + 1)) - 1) 
                                        ELSE '0' || SUBSTR(SUBSTR(odate, POSITION('/' IN odate) + 1), 1, POSITION('/' IN SUBSTR(odate, POSITION('/' IN odate) + 1)) - 1) 
                                    END AS day, 
                                    CASE 
                                        WHEN LENGTH(SUBSTR(SUBSTR(odate, POSITION('/' IN odate) + 1), POSITION('/' IN SUBSTR(odate, POSITION('/' IN odate) + 1)) + 1)) = 4 
                                        THEN SUBSTR(SUBSTR(odate, POSITION('/' IN odate) + 1), POSITION('/' IN SUBSTR(odate, POSITION('/' IN odate) + 1)) + 1) 
                                    END AS year
                                FROM operations
                            ) AS subquery
                            WHERE o_t_exid = :o_t_exid 
                            AND name = :operationname
                            ORDER BY dt_frmtd;

        """)
            result2 = session.execute(query2, {'o_t_exid': o_t_exid, 'operationname': operationname})
            c2_row = result2.fetchone()
            if c2_row:
                rtuple = c2_row[0]
    return rtuple

def read_soilnitrogenDB(soilname, session: SessionDep) -> Any:
    '''
    Returns soil nitrogen information from soil_long table based on soilname.
    Input:
      soilname
    Output:
      Tuple with soil information
    '''
    rlist = []
    if soilname:
        query = text("""
            SELECT kh, kL, km, kn, kd, fe, fh, r0, "rL", rm, fa, nq, cs
            FROM soil_long 
            WHERE o_sid = (SELECT site_id FROM soil WHERE soilname = :soilname)
        """)
        result = session.execute(query, {'soilname': soilname})
        rlist = result.fetchall()
    return rlist

def read_soilhydroDB(soilname, session: SessionDep,current_user_id) -> Any:
    '''
    Returns soil hydro information from soil_long table based on soilname.
    Input:
      soilname
    Output:
      Tuple with soil information
    '''
    rlist = []
    if soilname:
        if current_user_id ==1:
            query = text("""
            SELECT thr, ths, tha, th, "Alfa", n, "Ks", "Kk", thk, "BD", "OM_pct", "Sand", "Silt" 
            FROM soil_long 
            WHERE o_sid = (SELECT site_id FROM soil WHERE soilname = :soilname)
        """)
            result = session.execute(query, {'soilname': soilname})
        else:
            query = text("""
                SELECT thr, ths, tha, th, "Alfa", n, "Ks", "Kk", thk, "BD", "OM_pct", "Sand", "Silt" 
                FROM soil_long 
                WHERE o_sid = (SELECT site_id FROM soil WHERE soilname = :soilname and owner_id= :owner)
            """)
            result = session.execute(query, {'soilname': soilname, 'owner':current_user_id})
        rlist = result.fetchall()
    return rlist


def read_soilOMDB(soilname, session: SessionDep) -> Any:
    '''
    Returns soil information from soil_long table based on soilname.
    Input:
      soilname
    Output:
      Tuple with soil information
    '''
    rlist = []
    if soilname:
        query = text("""
            SELECT id, "Sand", "Silt", "Clay", "BD", "OM_pct", "TH33", "TH1500" 
            FROM soil_long 
            WHERE o_sid = (SELECT site_id FROM soil WHERE soilname = :soilname)
        """)
        result = session.execute(query, {'soilname': soilname})
        rlist = result.fetchall()
    return rlist

def read_irrigationDB(o_t_exid: int, session: SessionDep) -> Any:
    """
    Reads irrigation data from the database for a given operation ID (o_t_exid).

    Args:
        o_t_exid (int): The operation ID for which to retrieve irrigation data.
        session (Session): The SQLAlchemy session to use for the database query.

    Returns:
        List[Tuple]: A list of tuples containing irrigation data.
    """
    rlist = []
    query = text("""
    SELECT "opID", "irrigationClass"
    FROM "irrigationDetails"
    WHERE o_t_exid = :o_t_exid
    """)
    result = session.execute(query, {'o_t_exid': o_t_exid})
    rlist = result.fetchall()
    return rlist


def getFloodHData(o_t_exid: int, session: SessionDep):
    '''
    Returns tuple with amounts of irrigation for Flood_H irrigationClass
    Input:
      o_t_exid
    Output:
      Tuple with amounts of irrigation
    '''
    rlist = []
    query = text("""
        SELECT "pondDepth", "irrStartD", "startH", "irrStopD", "stopH"
        FROM operations o
        JOIN "irrig_floodH" Ip ON o."opID" = Ip."opID"
        WHERE o.o_t_exid = :o_t_exid 
        ORDER BY o.odate ASC
    """)
    result = session.execute(query, {'o_t_exid': o_t_exid})
    rlist = result.fetchall()
    # print("c1row",c1row)
    return rlist
    
def getFloodRData(o_t_exid,session: SessionDep):
    '''
    Returns tuple with amouts of irrigation for Flood_R irrigationClass
    Input:
      irrigationClass
    Output:
      Tuple with amounts of irrigation
    '''
    rlist = []
    query = text("""
        SELECT "pondDepth", rate, "irrStartD", "startH", "irrStopD", "stopH"
        FROM operations o
        JOIN "irrig_floodR" Ip ON o."opID" = Ip."opID"
        WHERE o.o_t_exid = :o_t_exid 
        ORDER BY o.odate ASC
    """)
    result = session.execute(query, {'o_t_exid': o_t_exid})
    print(query, o_t_exid)
    c1row = result.fetchall()
    # print("c1row",c1row)
    if c1row != None:
        rlist = [c1_row_record for c1_row_record in c1row if c1row != None]
    return rlist


def getMulchGeo(nutrient, session: SessionDep) -> Any:
    '''
    Returns tuple with mulch geo information for a particular nutrient
    Input:
      nutrient
    Output:
      Tuple with mulch geo information
    '''
    rlist = ()
    query = text("""
        SELECT "minHoriSize", "diffusionRestriction", "longWaveRadiationCtrl", "decompositionCtrl", "deltaRShort", "deltaRLong", 
               omega, "epsilonMulch", "alphaMulch", "maxStepInPicardIteration", "toleranceHead", "rhoMulch", "poreSpace", "maxPondingDepth"
        FROM "mulchGeo" 
        WHERE nutrient = :nutrient
    """)
    result = session.execute(query, {'nutrient': nutrient})
    rlist = result.fetchone()
    return rlist

def getMulchDecomp(nutrient, session: SessionDep) -> Any:
    '''
    Returns tuple with mulch decomp information for a particular nutrient
    Input:
      nutrient
    Output:
      Tuple with mulch decomp information
    '''
    rlist = ()
    query = text("""
        SELECT "contactFraction", "alphaFeeding", "carbMass", "cellMass", "lignMass", "carbNMass", "cellNMass", "lignNMass", 
               "carbDecomp", "cellDecomp", "lignDecomp" 
        FROM "mulchDecomp" 
        WHERE nutrient = :nutrient
    """)
    result = session.execute(query, {'nutrient': nutrient})
    rlist = result.fetchone()
    return rlist

def getIrrigationData(simulationname, o_t_exid, session: SessionDep) -> Any:
    '''
    Returns tuple with amounts of irrigation for a particular irrigationClass
    Input:
      irrigationClass
    Output:
      Tuple with amounts of irrigation
    '''
    rlist = []
    query = text("""
        SELECT o.odate, "AmtIrrAppl"
        FROM operations o, "Irrig_pivotOp" Ip 
        WHERE o."opID" = Ip."opID" AND o.o_t_exid = :o_t_exid
        ORDER BY o.odate ASC
    """)
    result = session.execute(query, {'o_t_exid': o_t_exid})
    rlist = result.fetchall()
    return rlist

def read_weatherlongDB(stationtype, session: SessionDep) -> Any:
    '''
    Returns tuple with complete weather_meta information based on stationtype
    Input:
      stationtype
    Output:
      Tuple with complete weather_meta information
    '''
    rlist = ()
    query = text("""
        SELECT rlat, rlon, "Bsolar", "Btemp", "Atemp", "BWInd", "BIR", "AvgWind", "AvgRainRate", "ChemCOnc", "AvgCO2", stationtype, site 
        FROM weather_meta wm, site s 
        WHERE wm.site = s.sitename AND stationtype = :stationtype
    """)
    result = session.execute(query, {'stationtype': stationtype})
    rlist = result.fetchone()
    return rlist

    
def read_gasDB(session: SessionDep) -> Any:
    '''
    Returns gas information
    Input:
      session
    Output:
      Tuple with gas information
    '''
    rlist = []
    query = text("""
        SELECT name, "EPSI", "bTort", "Diffusion_Coeff" 
        FROM gas 
        ORDER BY id
    """)
    result = session.execute(query)
    rlist = result.fetchall()
    return rlist



def read_soilgridratioDB(soilname: str, session: SessionDep,current_user_id) -> list:
    '''
    Returns gridratio information based on soilname.
    Input:
      soilname: Name of the soil (str).
    Output:
      A list of tuples containing gridratio information.
    '''
    rlist = []
    try:
        if len(soilname) > 0:
            # SQL query to fetch the gridratio based on soilname
            query = text("""
                SELECT "SR1", "SR2", "IR1", "IR2", "PlantingDepth", "XLimitRoot", "BottomBC", 
                       "GasBCTop", "GasBCBottom" 
                FROM gridratio 
                WHERE gridratio_id = (
                    SELECT o_gridratio_id 
                    FROM soil 
                    WHERE soilname = :soilname AND owner_id = :current_user_id
                )
            """)
            # Execute the query with the provided soilname parameter
            result = session.execute(query, {'soilname': soilname, 'current_user_id': current_user_id}).fetchall()
            print(query, soilname, result,"+++++++++++++++++++++++++")
            # If the query returns results, append them to the result list
            if result:
                for record in result:
                    rlist.append(record)

        return rlist
    
    except Exception as e:
        print(f"Error while fetching gridratio information: {e}")
        return rlist


def read_soilshortDB(soilname: str, session: SessionDep,current_user_id) -> list:
    '''
    Returns more restricted soil information from soil_long table based on soilname
    Input:
      soilname: Name of the soil (str).
    Output:
      A list of tuples containing soil information.
    '''
    rlist = []
    try:
        if len(soilname) > 0:
            # SQL query to fetch soil information from soil_long based on soilname
            query = text("""
                SELECT "Bottom_depth", "initType", "OM_pct", "NO3", "NH4", "HnNew", "Tmpr", "Sand", 
                       "Silt", "Clay", "BD", "TH33", "TH1500", thr, ths, tha, th, "Alfa", n, 
                       "Ks", "Kk", "thk", "CO2", "O2","N2O"
                FROM soil_long
                WHERE o_sid = (
                    SELECT site_id
                    FROM soil
                    WHERE soilname = :soilname AND owner_id = :current_user_id
                )
            """)
            # Execute the query with the provided soilname parameter
            result = session.execute(query, {'soilname': soilname, 'current_user_id': current_user_id}).fetchall()

            # If the query returns results, append them to the result list
            if result:
                for record in result:
                    rlist.append(record)

        return rlist
    
    except Exception as e:
        print(f"Error while fetching restricted soil information: {e}")
        return rlist
