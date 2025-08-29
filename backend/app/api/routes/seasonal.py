import asyncio
import json
from typing import Any, List
import subprocess
import time
from fastapi.responses import StreamingResponse
import os
import sys
import re
import csv
import pandas as pd
import glob
import logging
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import AsyncGenerator
from app.api.deps import SessionDep, CurrentUser
from app.models import Message, SimData, seasonRunResponse,Pastrun
from app.generateModelInputFiles_helper import *
from app.dbsupport_helper import *
from sqlalchemy.sql import text
from watchfiles import awatch  # Added import for awatch
import time
# NOTE: The 'watchfiles' library is required for efficient file watching. Ensure it is installed in your environment.

# Create an instance of the FastAPI class
router = APIRouter()
last_read_row = 0
# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

currentDir = os.getcwd()
classimDir = os.path.join(currentDir,'executables')
runDir = os.path.join(classimDir, 'run')
storeDir = os.path.join(runDir, 'store')
# /app/execuatbales"
createsoilexe = os.path.join(classimDir, 'CreateSoilFiles.exe')

# maize model executables
maizsimexe = os.path.join(classimDir, 'maizsim')

# Potato model executable
spudsimexe = os.path.join(classimDir, 'spudsim')

# Soybean model executable
glycimexe = os.path.join(classimDir, 'glycim')

# Cotton model executable
gossymexe = os.path.join(classimDir, 'gossym')

# Flag to tell script if output files should be removed, the default is 1 so they are removed
remOutputFilesFlag = 0

## This should always be there
if not os.path.exists(storeDir):
    print('RotationTab Error: Missing storeDir')

def extract_date_time(date,time):
    '''
  Split date and returns as a timestamp.
  Input:
    date
    time
  Output:
    date as a timestamp
    '''
    (m,d,y) = str(date).split('/')
    newDate = pd.Timestamp(int(y),int(m),int(d),time)
    return newDate

def checkNaNInOutputFile(table_name,g_name):
    '''
  Check output data for NaN values.
    table_name
    g_name = input filename with full path
  Output:
    columnList = list with columns with NaN values
    '''
    columnList = []
    spaceStr = ", "
    message = ""
    g_df = pd.read_csv(g_name,skipinitialspace=True,index_col=False)
    # Check for NaN values for each dataframe column
    dates = []
    date = ""
    for col in g_df.columns:
        if g_df[col].isnull().values.any():
            if len(dates)  == 0:
                dates = list(g_df.loc[pd.isna(g_df[col]),:].index)
                if(table_name == "g01_maize" or table_name == "g01_potato" or \
                   table_name == "nitrogen_potato" or table_name == "plantStress_potato" or \
                   table_name == "g01_soybean" or table_name == "nitrogen_soybean" or \
                   table_name == "plantStress_soybean"):
                    # Change date format
                    g_df['Date_Time'] = g_df.apply(lambda row: extract_date_time(row['date'],row['time']), axis=1)

                if(table_name == "g03_maize" or table_name == "g04_maize" or table_name == "g05_maize" or \
                   table_name == "g03_potato" or table_name == "g04_potato" or table_name == "g05_potato" or \
                   table_name == "g03_soybean" or table_name == "g04_soybean" or table_name == "g05_soybean" or\
                   table_name == "g03_fallow" or table_name == "g05_fallow"):
                    # Change date format
                    # 2dsoil start counting the days starting on 12/30/1899.
                    g_df['DateInit'] = pd.Timestamp('1899-12-30')
                    g_df['Date_Time'] = g_df['DateInit'] + pd.to_timedelta(g_df['Date_time'], unit='D')

                g_df['Date_Time'] = g_df['Date_Time'].dt.strftime('%m/%d/%Y')
                date = "Date:"+spaceStr.join(g_df['Date_Time'].loc[dates])+"<br>\n"
            columnList.append(col)
    if len(columnList) > 0:
        message = g_name+": "+spaceStr.join(columnList)+"<br>\n"+date
    return message



def ingestOutputFile(table_name, g_name, simulationname, session: Any) -> bool:
    '''
    Ingest file with output data into the cropOutput database using a SQLAlchemy Session.
    Input:
      table_name: The name of the table to insert data into.
      g_name: Input filename with full path (CSV file).
      simulationname: The simulation name to link to the table.
      session: SQLAlchemy session object.
    Output:
      True if successful, False if there is an error.
    '''
    try:
        # Load the CSV file into a pandas DataFrame
        id = table_name + "_id"
        g_df = pd.read_csv(g_name,skipinitialspace=True,index_col=False)
        # strip leading and trailing spaces from column names
        for col in g_df.columns: 
            g_df.rename(columns={col:col.strip()},inplace=True)
        g_df[id] = int(simulationname)
        # Apply date formatting or column transformations based on the table_name
        if table_name in ["g01_maize", "g01_potato", "nitrogen_potato", "plantStress_potato", 
                          "plantStress_maize", "g01_soybean", "nitrogen_soybean", 
                          "plantStress_soybean", "g01_cotton", "plantStress_cotton"]:
            # Change date format
            g_df['Date_Time'] = g_df.apply(lambda row: extract_date_time(row['date'], row['time']), axis=1)
            g_df = g_df.drop(columns=['date', 'time'],axis=1)
            if table_name == "g01_potato":
                g_df.rename(columns={'LA/pl': 'LA_pl'}, inplace=True)
            if table_name == "nitrogen_potato":
                g_df.rename(columns={'Seed N': 'seed_N'}, inplace=True)
            if table_name in ["nitrogen_potato", "plantStress_potato", "nitrogen_soybean", 
                              "plantStress_soybean", "g01_cotton", "plantStress_cotton"]:
                g_df = g_df.drop(columns=['jday'])

        if table_name in ["g03_maize", "g04_maize", "g05_maize", "g07_maize", "g03_potato", "g04_potato", 
                          "g05_potato", "g07_potato", "g03_soybean", "g04_soybean", "g05_soybean", "g07_soybean", 
                          "g03_fallow", "g05_fallow", "g07_fallow", "g03_cotton", "g04_cotton", "g05_cotton", 
                          "g07_cotton"]:
            # 2dsoil start counting the days starting on 12/30/1899
            g_df['DateInit'] = pd.Timestamp('1899-12-30')
            g_df['Date_Time'] = g_df['DateInit'] + pd.to_timedelta(g_df['Date_time'], unit='D').dt.round('h')
            g_df = g_df.drop(columns=['DateInit', 'Date', 'Date_time'])
            if table_name in ["g03_maize", "g03_cotton", "g03_soybean", "g03_potato", "g03_fallow"]:
                g_df = g_df.drop(columns=['Area', 'Vx', 'Vy'])

        # Use the session to perform a bulk insert using pandas' to_sql method
        g_df.to_sql(table_name, session.bind, if_exists='append', index=False)

        return True
    except Exception as e:
        print(f"Error while ingesting output file: {e}")
        return False
    



def ingestGeometryFile(grdFile: str, g03File: str, simulation: str, session: Any) -> bool:
    '''
    Ingest geometry data from .grd and .g03 files into the cropOutput database.
    
    Input:
      grdFile: Path to the .grd file
      g03File: Path to the .g03 file
      simulation: Simulation name (or ID) to associate with the data
      session: Active SQLAlchemy session
    Output:
      True if data is ingested successfully, False otherwise.
    '''
    try:
        # First, read the .grd file
        searchFor = "***************** ELEMENT INFORMATION ******************************************************"
        with open(grdFile, 'r') as gf:
            lines = gf.readlines()
            for line in lines:
                if line.find(searchFor) != -1:
                    lineNum = lines.index(line)
                    totLines = len(lines)
                    footer = totLines - lineNum
                    break
        
        # Load the .grd file into a DataFrame
        grd_df = pd.read_csv(grdFile, header=[3], sep='\s+', skipinitialspace=True, skipfooter=footer, engine='python')
        grd_df = grd_df.rename(columns={'n': 'nodeNum', 'x': 'X', 'y': 'Y', 'MatNum': 'Layer'})
        
        # Load the .g03 file into a DataFrame
        g_df = pd.read_csv(g03File, skipinitialspace=True, index_col=False)
        for col in g_df.columns: 
            g_df.rename(columns={col: col.strip()}, inplace=True)
        g_df = g_df.drop(columns=['Date_time', 'Date', 'hNew', 'thNew', 'Vx', 'Vy', 'Q', 'NO3N', 'NH4N', 'Temp', 'CO2Conc', 'O2Conc'])
        
        # Drop duplicates from the .g03 data
        g_df = g_df.drop_duplicates(keep="first")

        # Add simulation ID to the g_df
        g_df['simID'] = int(simulation)
        
        # Merge the two DataFrames on X and Y columns
        result = pd.merge(grd_df, g_df, how='inner', on=['X', 'Y'])

        # Insert the merged result into the 'geometry' table
        result.to_sql('geometry', session.bind, if_exists="append", index=False)

        # Commit the session
        session.commit()

        return True
    except Exception as e:
        session.rollback()  # Rollback in case of an error
        print(f"Error while ingesting geometry data: {e}")
        return False



import os

def WriteLayerGas(soilname, field_name, field_path, rowSpacing, rootWeightPerSlab,session,current_user_id):
    '''
    Writes Layer file (*.lyr)
    '''
    # Get Grid Ratio for the soil
    gridratio_list = read_soilgridratioDB(soilname,session,current_user_id)
    NumObs = len(gridratio_list)

    # Define file path
    filename = os.path.join(field_path, f"{field_name}.lyr")
    
    try:
        with open(filename, 'w', encoding="UTF-8") as fout:
            fout.write("surface ratio    internal ratio: ratio of the distance between two neighboring nodes\n")
            
            # Write grid ratio records
            for rrow in range(0, NumObs):
                record_tuple = gridratio_list[rrow]
                fout.write(f'{record_tuple[0]:0f}{record_tuple[1]:-14.3f}{record_tuple[2]:-14.3f}{record_tuple[3]:-14.3f}\n')

            fout.write("RowSpacing\n")
            fout.write(f'{rowSpacing:0f}\n')

            fout.write(" Planting Depth  X limit for roots\n")
            for rrow in range(0, len(gridratio_list)):
                record_tuple = gridratio_list[rrow]
                fout.write(f'{record_tuple[4]:0f}{record_tuple[5]:-14.3f}{rootWeightPerSlab:-14.3f}\n')

            fout.write("Surface water Boundary Code  surface and bottom Gas boundary codes(for all bottom nodes) 1 constant -2 seepage face, 7 drainage, 4 atmospheric\n")
            fout.write("water boundary code for bottom layer, gas BC for the surface and bottom layers\n")
            for rrow in range(0, len(gridratio_list)):
                record_tuple = gridratio_list[rrow]
                fout.write(f'{record_tuple[6]:0d}{record_tuple[7]:-14d}{record_tuple[8]:-14d}\n')
            
            fout.write(" Bottom depth   Init Type  OM (%/100)   Humus_C    Humus_N    Litter_C    Litter_N    Manure_C    Manure_N  no3(ppm)  NH4  \
                        hNew  Tmpr     CO2     O2    N2O    Sand     Silt    Clay     BD     TH33     TH1500  thr ths tha th  Alfa    n   Ks  Kk  thk\n")
            fout.write(" cm         w/m       Frac      ppm    ppm    ppm    ppm   ppm    ppm   ppm     ppm   cm     0C     ppm   ppm  ----  fraction---     \
                        g/cm3    cm3/cm3   cm3/cm3\n")

            
            soilgrid_list = read_soilshortDB(soilname,session,current_user_id)
            for rrow in range(0, len(soilgrid_list)):
                record_tuple = soilgrid_list[rrow]

                record_tuple = [float(i) for i in record_tuple]
                
                # Determine initType based on record value
                initType = "'m'" if record_tuple[1] == 1 else "'w'"
                fout.write(f'{int(record_tuple[0]):-1d}{initType:>14s}{float(record_tuple[2])/100:-14.3f}{-1:-14.3f}{-1:-14.3f}')
                fout.write(f'{0:-14.3f}{0:-14.3f}{0:-14.3f}{0:-14.3f}')
                fout.write(f'{record_tuple[3]:-14.3f}{record_tuple[4]:-14.3f}{record_tuple[5]:-14.3f}{record_tuple[6]:-14.3f}')
                fout.write(f'{record_tuple[22]:-14.3f}{record_tuple[23]:-14.3f}{record_tuple[24]:-14.3f}{record_tuple[7]/100:-14.3f}{record_tuple[8]/100:-14.3f}')
                fout.write(f'{record_tuple[9]/100:-14.3f}{record_tuple[10]:-14.3f}{record_tuple[11]:-14.3f}{record_tuple[12]:-14.3f}')
                fout.write(f'{record_tuple[13]:-14.3f}{record_tuple[14]:-14.3f}{record_tuple[15]:-14.3f}{record_tuple[16]:-14.3f}')
                fout.write(f'{record_tuple[17]:-14.3f}{record_tuple[18]:-14.3f}{record_tuple[19]:-14.3f}{record_tuple[20]:-14.3f}')
                fout.write(f'{record_tuple[21]:-14.3f}\n')


    except Exception as e:
        print(f"Error writing file: {e}")



def WriteIni(cropname,experiment,treatmentname, site, soil, field_path,waterStressFlag, nitroStressFlag,session, current_user_id):
    '''
    lcrop,lexperiment,ltreatmentname,field_name,lsoilname,
    Get data from operation, soil_long
    '''
    # Default values
    autoirrigation = 0
    rowangle = 0
    xseed = 0
    yseed = 5
    cec = 0.65
    eomult = 0.5
    pop = 6.5
    rowSpacing = 75
    SowingDate = 0
    HarvestDate = 0
    EndDate = 0
    cultivar = "fallow"

    # Find cropid, exid, tid and fetch operation list
    operationList = []
    exid = read_experimentDB_id(cropname, experiment,session)
    tid = read_treatmentDB_id(exid, treatmentname,session)
    operationList = read_operationsDB_id(tid,session)  # Gets all the operations

    # Processing operation list
    for ii, jj in enumerate(operationList):
        if jj[1] == 'Simulation Start':
            if cropname == "fallow":
                SowingDate = (pd.to_datetime(jj[2]) + pd.DateOffset(days=370)).strftime('%m/%d/%Y')
            initCond = readOpDetails(jj[0], jj[1],session)
            # Extract initialization conditions
            depth = initCond[0][6]
            length = initCond[0][5]
            pop = initCond[0][3]
            autoirrigation = initCond[0][4]
            xseed = initCond[0][5]
            yseed = initCond[0][6]
            cec = initCond[0][7]
            eomult = initCond[0][8]
            rowSpacing = initCond[0][9]
            seedpieceMass = initCond[0][11]
            cultivar = initCond[0][10]
        if jj[1] == 'Sowing':
            SowingDate = jj[2]

        if jj[1] == 'Emergence':
            EmergenceDate = jj[2]

        if jj[1] == 'Harvest':
            HarvestDate = jj[2]

        if jj[1] == 'Simulation End':
            EndDate = jj[2]
            if cropname == "fallow":
                EndDate = (pd.to_datetime(jj[2]) + pd.DateOffset(days=365)).strftime('%m/%d/%Y')
    tsite_tuple = extract_sitedetails(site,session)  # Get site details

    # Maximum profile depth
    maxSoilDepth = read_soillongDB_maxdepth(soil,session, current_user_id)
    RowSP = rowSpacing

    # Write INI file
    PopRow = rowSpacing / 100 * pop

    # Define file path
    filename = os.path.join(field_path, f"{site}.ini")
    try:
        with open(filename, 'w', encoding="UTF-8") as fout:
            yseed = maxSoilDepth - yseed
            # Write initialization data
            fout.write("***Initialization data for location\n")
            fout.write("POPROW  ROWSP  Plant Density      ROWANG  xSeed  ySeed         CEC    EOMult\n")
            fout.write(f'{PopRow:-14.6f}{RowSP:-14.6f}{pop:-14.6f}{rowangle:-14.6f}{xseed:-14.6f}{yseed:-14.6f}{cec:-14.6f}{eomult:-14.6f}\n')
            
            fout.write("Latitude longitude altitude\n")
            fout.write(f'{tsite_tuple[1]:-14.6f}{tsite_tuple[2]:-14.6f}{tsite_tuple[3]:-14.6f}\n')
            # Crop-specific settings
            if cropname == "maize" or cropname == "fallow":
                fout.write("AutoIrrigate\n")
                fout.write(f'{autoirrigation}\n')
                fout.write("Planting          Emergence           End           TimeStep(m)    sowing and end dates for fallow are set in the future so the soil model will not call a crop\n")
                fout.write(f"'{SowingDate}'  '{EndDate}'  {60}\n")
                rootWeightPerSlab = 0
            elif cropname == "potato":
                fout.write("Seed  Depth  Length  Bigleaf\n")
                fout.write(f'{seedpieceMass:-14.6f}{depth:-14.6f}{length:-14.6f}{1:-14d}\n')
                fout.write("Planting          Emergence          End	TimeStep(m)\n")
                fout.write(f"'{SowingDate}'  '{EmergenceDate}'  '{EndDate}'  {60}\n")
                fout.write("AutoIrrigate\n")
                fout.write(f'{autoirrigation}\n')
                fout.write("Stresses (Nitrogen, Water stress: 1-nonlimiting, 2-limiting): Simulation Type (1-meteorological, 2-physiological)\n")
                fout.write("Nstressoff  Wstressoff  Water-stress-simulation-method\n")
                fout.write(f"{waterStressFlag}    {nitroStressFlag}    {0}\n")
                popSlab = RowSP / 100 * 0.5 * 0.01 * pop
                rootWeightPerSlab = seedpieceMass * 0.25 * popSlab
            elif cropname == "soybean":
                fout.write("AutoIrrigate\n")
                fout.write(f'{autoirrigation}\n')
                fout.write("Sowing          Emergence          End	TimeStep(m)\n")
                fout.write(f"'{SowingDate}'  '{EmergenceDate}'  '{EndDate}'  {60}\n")
                popSlab = RowSP / 100 * eomult * 0.01 * pop
                rootWeightPerSlab = 0.0275 * popSlab
            elif cropname == "cotton":
                fout.write("AutoIrrigate\n")
                fout.write(f'{autoirrigation}\n')
                fout.write("Emergence          End	TimeStep(m)\n")
                fout.write(f"'{EmergenceDate}'  '{HarvestDate}'  {60}\n")
                popSlab = RowSP / 100 * eomult * 0.01 * pop
                rootWeightPerSlab = 0.2 * popSlab

            fout.write("output soils data (g03, g04, g05 and g06 files) 1 if true\n")
            fout.write("no soil files        output soil files\n")
            fout.write("    0                   1\n")

    except Exception as e:
        print(f"Error writing file: {e}")
    return RowSP, rootWeightPerSlab, cultivar


def update_pastrunsDB(rotationID,site,managementname,weather,stationtype,
                      soilname,startyear,endyear,waterstress,nitrostress,tempVar,rainVar,CO2Var,session,userid):     
    '''
  Insert a new record on pastrun table and returns the assigned id.
  Input:
    rotationID
    site
    managementname
    weather
    soilname
    stationtype
    startyear
    endyear
    waterstress
    nitrostress
    tempVar
    rainVar
    CO2Var
  Output:
    pastrun id
    '''
    rlist = []
    
    
    odate =  datetime.now()
    odate_int = odate.timestamp()  # This converts to float (seconds since epoch)
    odate_int = int(odate_int) 

    # record_tuple = (rotationID,site,managementname,weather,soilname,stationtype,startyear,endyear,odate,waterstress,nitrostress,tempVar,rainVar,CO2Var)
    query = text("""
        INSERT INTO pastruns ("rotationID", "site", "treatment", "weather", "soil", "stationtype", "startyear", "endyear", "odate", "waterstress", "nitrostress", "tempVar", "rainVar", "CO2Var","owner_id")
        VALUES (:rotationID, :site, :managementname, :weather, :soilname, :stationtype, :startyear, :endyear, :odate, :waterstress, :nitrostress, :tempVar, :rainVar, :CO2Var, :userid)
        RETURNING "id"
    """)


    # Create a dictionary with the values to be inserted
    record_dict = {
        'rotationID': rotationID,
        'site': site,
        'managementname': managementname,
        'weather': weather,
        'soilname': soilname,
        'stationtype': stationtype,
        'startyear': startyear,
        'endyear': endyear,
        'odate': odate_int,
        'waterstress': waterstress,
        'nitrostress': nitrostress,
        'tempVar': tempVar,
        'rainVar': rainVar,
        'CO2Var': CO2Var,
        'userid':userid
    }
    result = session.execute(query, record_dict)
    session.commit()
    insertion_id = result.fetchone()[0]
    classimDir = os.getcwd()
    return insertion_id

def update_status(msg,simulation_name,session: Any):
    """
    Update the status of the simulation in the database.
    """
    try:
        statement = (
            select(Pastrun)
            .where(Pastrun.id == simulation_name)
        )
        simulation = session.exec(statement).one()
        if simulation:
            simulation.status = msg
            session.add(simulation)
            session.commit()
    except Exception as e:
        print(f"Error updating status: {e}")
    finally:
        session.close()

def prepare_and_execute( simulation_name, session: Any, current_user_id):
    """
    This will create input files, and execute both exe's.
    """
    update_status(1001, simulation_name,session)
    statement = (
        select(Pastrun)
        .where(Pastrun.id == simulation_name)
    )
    simulation = session.exec(statement).one()
    if simulation:
        simulation_name = simulation.id
        field_name = simulation.site
        lsoilname = simulation.soil
        lstationtype = simulation.stationtype
        lweather = simulation.weather
        lcrop = simulation.treatment.split('/')[0]
        lexperiment = simulation.treatment.split('/')[1]
        ltreatmentname = simulation.treatment.split('/')[2]
        waterStressFlag = simulation.waterstress
        nitroStressFlag = simulation.nitrostress
        ltempVar = simulation.tempVar
        lrainVar = simulation.rainVar
        lCO2Var = simulation.CO2Var
        lstartyear = simulation.startyear
        lendyear = simulation.endyear
    field_path = os.path.join(runDir, str(simulation_name))
    if not os.path.exists(field_path):
        os.makedirs(field_path)

    # Copy water.dat file from store to runDir
    src_file = os.path.join(storeDir, 'Water.DAT')
    dest_file = os.path.join(field_path, 'Water.DAT')
    copyFile(src_file, dest_file)

    waterfilecontent = []
    with open(dest_file, 'r') as read_file:
        waterfilecontent = read_file.readlines()

    sandcontent = WriteSoiData(lsoilname, field_name, field_path, session,current_user_id)
    if sandcontent > 75:
        with open(dest_file, 'w') as write_file:
            for line in waterfilecontent:
                write_file.write(line.replace("-1.00000E+005", "-1.00000E+004"))

    # Copy waterBound.dat file from store to runDir
    src_file = os.path.join(storeDir, 'WaterBound.DAT')
    dest_file = os.path.join(field_path, 'WatMovParam.dat')
    copyFile(src_file, dest_file)

    WriteBiologydefault(field_name, field_path, session)

    # Start
    # Includes initial, management and fertilizer
    rowSpacing, rootWeightPerSlab, cultivar = WriteIni(lcrop, lexperiment, ltreatmentname, field_name,
                                                       lsoilname, field_path, waterStressFlag,
                                                       nitroStressFlag, session, current_user_id)
    if cultivar != "fallow":
        WriteCropVariety(lcrop, cultivar, field_name, field_path, session,current_user_id)
    else:
        src_file = os.path.join(storeDir, 'fallow.var')
        dest_file = os.path.join(field_path, 'fallow.var')
        copyFile(src_file, dest_file)
    WriteDripIrrigationFile(field_name, field_path)
    hourly_flag, edate = WriteWeather(lexperiment, ltreatmentname, lstationtype, lweather, field_path, ltempVar, lrainVar, lCO2Var,current_user_id, session)
    WriteSoluteFile(lsoilname, field_path, session, current_user_id)
    WriteGasFile(field_path, session)
    hourlyFlag = 1
    WriteTimeFileData(ltreatmentname, lexperiment, lcrop, lstationtype, hourlyFlag, field_name, field_path, hourly_flag, 0, session)
    WriteNitData(lsoilname, field_name, field_path, rowSpacing, session, current_user_id)
    WriteLayerGas(lsoilname, field_name, field_path, rowSpacing, rootWeightPerSlab, session, current_user_id)
    surfResType = WriteManagement(lcrop, lexperiment, ltreatmentname, field_name, field_path, rowSpacing, session)
    irrType = irrigationInfo(lcrop, lexperiment, ltreatmentname, session)
    WriteMulchGeo(field_path, surfResType, session)
    o_t_exid = getTreatmentID(ltreatmentname, lexperiment, lcrop, session)
    WriteIrrigation(field_name, field_path, simulation_name, o_t_exid, session)
    WriteRunFile(lcrop, lsoilname, field_name, cultivar, field_path, lstationtype)
    src_file = os.path.join(field_path, f"{field_name}.lyr")
    layerdest_file = os.path.join(field_path, f"{field_name}.lyr")
    createsoil_opfile = lsoilname
    grid_name = field_name
    pp = subprocess.Popen(['mono', createsoilexe, f"{field_name}.lyr", "/GN", grid_name, "/SN", createsoil_opfile], cwd=field_path)
    
    while pp.poll() is None:
        time.sleep(1)
        runname = os.path.join(field_path, f"Run{field_name}.dat")
    try:
        if lcrop == "maize":
            p = subprocess.Popen([maizsimexe, runname], stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=False)
            file_ext = ["g01", "G03", "G04", "G05", "G07"]
        elif lcrop == "potato":
            p = subprocess.Popen([spudsimexe, runname], stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=False)
            file_ext = ["g01", "G03", "G04", "G05", "G07"]
        elif lcrop == "soybean":
            p = subprocess.Popen([glycimexe, runname], stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=False)
            file_ext = ["g01", "G03", "G04", "G05", "G07"]
        elif lcrop == "cotton":
            p = subprocess.Popen([gossymexe, runname], stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=False)
            file_ext = ["g01", "G03", "G04", "G05", "G07"]
        else:  # fallow
            p = subprocess.Popen([maizsimexe, runname], stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=False)
            file_ext = ["G03", "G05", "G07"]
        for line in iter(p.stdout.readline, b''):
            if b'Progress' in line:
                prog = re.findall(r"[-+]?\d*\.\d+|\d+", line.decode())
                update_status(int(prog[0]), simulation_name, session)
        (out, err) = p.communicate()
        if p.returncode == 0:
            print("twosoil stage completed. %s", str(out))
            update_status(101, simulation_name, session)
        else:
            print("twosoil stage failed. Error =. %s", str(err))
            delete_pastrunsDB(str(simulation_name), lcrop, session)

    except OSError as e:
        delete_pastrunsDB(str(simulation_name), lcrop, session)
        sys.exit("failed to execute twodsoil program, %s", str(e))

    missingRec = ""
    # Check for NaN on output files
    for ext in file_ext:
        g_name2 = os.path.join(field_path, f"{field_name}.{ext}")
        table_name = f"{ext.lower()}_{lcrop}"
        print(table_name,"table_name++++++")
        missingRec += checkNaNInOutputFile(table_name, g_name2)

    if lcrop != "fallow":
        missingRec += checkNaNInOutputFile(f"plantStress_{lcrop}", os.path.join(field_path, "plantstress.crp"))
        if lcrop == "potato" or lcrop == "soybean":
            missingRec += checkNaNInOutputFile(f"nitrogen_{lcrop}", os.path.join(field_path, "nitrogen.crp"))

    if missingRec != "":
        delete_pastrunsDB(str(simulation_name), lcrop, session)
    else:
        for ext in file_ext:
            g_name = os.path.join(field_path, f"{field_name}.{ext}")
            g_name2 = os.path.join(field_path, f"{field_name}.{ext}")
            table_name = f"{ext.lower()}_{lcrop}"
            # Ingest .grd file and Area from G03 file on the geometry table
            if ext == 'G03' or ext == 'g03':
                ingestGeometryFile(os.path.join(field_path, f"{field_name}.grd"), g_name2, str(simulation_name), session)
            ingestOutputFile(table_name, g_name2, str(simulation_name), session)
            if remOutputFilesFlag:
                os.remove(g_name)
        ingestOutputFile(f"plantStress_{lcrop}", os.path.join(field_path, "plantstress.crp"), str(simulation_name), session)
        if remOutputFilesFlag:
            os.remove(os.path.join(field_path, "plantstress.crp"))

        if lcrop == "soybean" or lcrop == "potato":
            ingestOutputFile(f"nitrogen_{lcrop}", os.path.join(field_path, "nitrogen.crp"), str(simulation_name), session)
            if remOutputFilesFlag:
                os.remove(os.path.join(field_path, "nitrogen.crp"))
    
    # Remove the simulation folder after completion
    import shutil
    try:
        shutil.rmtree(field_path)
    except Exception as e:
        logger.warning(f"Failed to remove simulation folder {field_path}: {e}")
    return True




async def stream_csv_selected_columns(file_path: str, simulation_name: int | str, session: SessionDep) -> AsyncGenerator[str, None]:
    crop_row = session.get(Pastrun, simulation_name)
    crop_name = crop_row.treatment.split('/')[0] if crop_row and crop_row.treatment else None

    if crop_name == "maize":
        columns_to_keep = ["SoilT", "SolRad", "TotLeafDM", "ETdmd"]
    elif crop_name == "soybean":
        columns_to_keep = ["LAI", "totalDM", "podDM", "Tr_act"]
    elif crop_name == "potato":
        columns_to_keep = ["LAI", "totalDM", "tuberDM", "Tr-Pot"]
    elif crop_name == "cotton":
        columns_to_keep = ["LAI", "PlantDM", "Yield", "Nodes"]
    else:
        columns_to_keep = None  # Stream all columns if crop is unknown

    print(f"Streaming columns: {columns_to_keep}, {file_path} for crop: {crop_name}")
    header = None
    keep_indices = None
    last_position = 0

    async for changes in awatch(file_path):
        for change, changed_file in changes:
            if changed_file == file_path:
                try:
                    with open(file_path, "r") as file:
                        if header is None:
                            header_line = file.readline()
                            if not header_line:
                                print("File is empty, no header found.")
                                continue  # Wait for next file update
                            header = [h.strip() for h in next(csv.reader([header_line]))]
                            print(f"Header found: {header}")
                            if columns_to_keep:
                                keep_indices = [header.index(col) for col in columns_to_keep if col in header]
                                if not keep_indices:
                                    print(f"No matching columns found for crop: {crop_name}. Streaming all columns.")
                                    keep_indices = list(range(len(header)))
                                    columns_to_keep = header
                            else:
                                keep_indices = list(range(len(header)))
                                columns_to_keep = header
                            last_position = file.tell()
                        else:
                            file.seek(last_position)
                        # Now read new rows
                        for row in csv.reader(file):
                            if keep_indices is not None and len(row) >= max(keep_indices) + 1:
                                row_dict = {columns_to_keep[i]: (row[idx]) for i, idx in enumerate(keep_indices)}
                                print(f"Yielding row: {row_dict}")
                                yield f"data: {json.dumps(row_dict)}\n\n"
                        last_position = file.tell()
                except FileNotFoundError:
                    yield f"event: end\ndata: File not found.\n\n"
                    return
                except Exception as e:
                    yield f"event: error\ndata: Error reading file: {str(e)}\n\n"
                    return


@router.get("/simulationResp/{simulation_name}")
async def execute_the_model(
    *, simulation_name: int | str, session: SessionDep
) -> StreamingResponse:
    """
    Endpoint to stream new CSV data using watchfiles for efficient event-driven streaming.
    Ends streaming if output file is not found or pastruns.status is 101 (completed).
    """
    timeout = 10  # Maximum timeout in seconds for initial file check
    elapsed_time = 0
    file_found = False

    # Wait for the *.g01 file to appear
    while elapsed_time < timeout:
        files = glob.glob(os.path.join(runDir, str(simulation_name), "*.g01"))
        if files:
            file_found = True
            break
        await asyncio.sleep(0.01)  # 10 milliseconds
        elapsed_time += 0.01

    if not file_found:
        raise HTTPException(status_code=404, detail="Simulation output file not found.")
    file_path = files[0]
    return StreamingResponse(stream_csv_selected_columns(file_path,simulation_name,session), media_type="text/event-stream")


# Modify the route to use asyncio.create_task
@router.post("/seasonRun", response_model=seasonRunResponse)
def create_soil(
    *, payload: dict, session: SessionDep, current_user: CurrentUser
) -> Any:
    """
    Create new soil based on the updated payload structure.
    """
    simulationList = []
    try:
        site = payload["site"]
        weather = payload["weather"]
        soil = payload["soil"]
        station = payload["station"]
        expert_system = payload["expertSystem"]
        selected_date = payload["selectedDate"]

        for row in payload["rows"]:
            crop = row["crop"]
            experiment = row["experiment"]
            start_date = row["startDate"]
            end_date = row["endDate"]
            water_stress = row["waterStress"]
            nitrogen_stress = row["nitrogenStress"]
            temp_variance = row["tempVariance"]
            rain_variance = row["rainVariance"]
            co2_variance = row["co2Variance"]

            waterStressFlag = 0 if water_stress == "Yes" else 1
            nitroStressFlag = 0 if nitrogen_stress == "Yes" else 1
            co2_variance = 0 if co2_variance == "None" else co2_variance

            crop_treatment = f"{crop}/{experiment}"
            simulation_name = update_pastrunsDB(
                0,
                site,
                crop_treatment,
                station,
                weather,
                soil,
                str(start_date),
                str(end_date),
                str(waterStressFlag),
                str(nitroStressFlag),
                str(temp_variance),
                str(rain_variance),
                str(co2_variance),
                session,
                current_user.id,
            )

            simulationList.append(simulation_name)

        return seasonRunResponse(data=simulationList)
    except Exception as e:
        logger.error(f"Error during simulation: {e}")
        raise HTTPException(status_code=500, detail="An error occurred during the simulation process.")
    
# @router.get("/seasonRun/{simulation_name}", status_code=202)
# async def get_simulation_results(background_tasks: BackgroundTasks, simulation_name: int, session: SessionDep, current_user: CurrentUser) -> Any:
#     """
#     Get simulation results.
#     """
#     try:
#         # simulation = read_pastrunsDB_id(simulation_name, session)
#         background_tasks.add_task(prepare_and_execute, simulation_name,session, current_user.id)

#         return {"id":simulation_name}
#     except Exception as e:
#         logger.error(f"Error fetching simulation results: {e}")
#         raise HTTPException(status_code=500, detail="An error occurred while fetching simulation results.")
    

@router.get("/seasonRun/{simulation_name}", status_code=202)
async def get_simulation_results(
    background_tasks: BackgroundTasks,
    simulation_name: int,
    session: SessionDep,
    current_user: CurrentUser
) -> Any:
    """
    Get simulation results, but first verify key operation dates are in order.
    """
    try:
        # Fetch the simulation row
        simulation = session.get(Pastrun, simulation_name)
        if not simulation:
            raise HTTPException(status_code=404, detail="Simulation not found.")

        # Fetch all operations for this simulation
          # Parse treatment info
        treatment = simulation.treatment
        weather_info= simulation.weather
        statoiptiontype = simulation.stationtype
        statement = select(WeatherMeta).filter(
        WeatherMeta.stationtype == weather_info,
        WeatherMeta.owner_id == current_user.id
        )
        weatherMetadata = session.exec(statement).first()
        weather_id=str(weatherMetadata.id)
        query = text(
            """
            select jday, date from weather_data where 
                stationtype= :stationtype and weather_id= :weather_id order by date
            """
        )

        # Execute the query with provided parameters
        result = session.execute(query, {'stationtype': statoiptiontype, 'weather_id': weather_id})

        # Fetch and return the result
        row = result.fetchone()
        if not row:
            return {"id": -1, "message": "Weather data not found for the specified station type."}
        # You may need to adjust how you get experiment/crop/treatment name
        crop = treatment.split('/')[0]
        experiment = treatment.split('/')[1] if '/' in treatment else None
        treatment_name = treatment.split('/')[2] if treatment.count('/') >= 2 else None

        # Fetch all operations for this treatment
        # You may need to adjust this helper to your schema
        exid = read_experimentDB_id(crop, experiment, session)
        tid = read_treatmentDB_id(exid, treatment_name, session)
        operationList = read_operationsDB_id(tid, session)  # [(id, name, date, ...), ...]
        cutlivar_simStart_check = is_all_cultivar_zero(tid, session)

        if not cutlivar_simStart_check:
            return {"id": -1, "message": "Please add cultivar for this experiment. Management-> experiment->treatment->cultivar."}
        # Only check these key operations
        key_ops = ['Simulation Start', 'Sowing', 'Harvest', 'Simulation End']
        op_dates = []
        for op_name in key_ops:
            # Find the first operation with this name
            op = next((o for o in operationList if o[1] == op_name), None)
            if op is not None and op[2]:
                try:
                    op_date = pd.to_datetime(op[2])
                except Exception:
                    return {"error": f"Operation '{op_name}' has invalid date: {op[2]}"}
                op_dates.append((op_name, op_date))
            else:
                op_dates.append((op_name, None))

        # Check chronological order
        wrong_ops = []
        last_date = None
        for idx, (op_name, op_date) in enumerate(op_dates):
            if op_date is None:
                continue  # skip missing ops
            if last_date and op_date < last_date:
                
                # Report both the current and previous operation as problematic
                wrong_ops.append(f"{op_dates[idx-1][0]} ({op_dates[idx-1][1].strftime('%m/%d/%Y') if op_dates[idx-1][1] else 'N/A'}) before {op_name} ({op_date.strftime('%m/%d/%Y')})")
            last_date = op_date
        
        if wrong_ops:
            msg = (
                "The following operations are out of order: "
                + "; ".join(wrong_ops)
                + ". Please ensure Simulation Start < Sowing < Harvest < Simulation End."
            )
            return {"id":-1,"message": msg}

        # If all good, start the simulation
        background_tasks.add_task(prepare_and_execute, simulation_name, session, current_user.id)
        return {"id": simulation_name, "message": "Simulation started successfully."}
    except Exception as e:
        logger.error(f"Error fetching simulation results: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while fetching simulation results.")