import subprocess
import os
import numpy as np
import pandas as pd
from subprocess import Popen
from app.dbsupport_helper import *
from app.texture_helper import *
from sqlmodel import func, select
from app.models import WeatherMeta
global classimDir
global runDir
global storeDir

currentDir = os.getcwd()
classimDir=os.path.join(currentDir,'executables')

runDir = os.path.join(classimDir,'run')
storeDir = os.path.join(runDir,'store')

## This should always be there
if not os.path.exists(storeDir):
    print('RotationTab Error: Missing store folder.')


def copyFile(src, dest):
    # Copy this way will make it wait for this command to finish first
    try:
        copyresult = subprocess.run(['cp', src, dest], stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=False)
        if copyresult.returncode != 0:
            print(f"Error in Copy function: {copyresult.stderr.decode('utf-8')}")
    except Exception as e:
        print(f"Exception in Copy function: {e}")



def WriteBiologydefault(field_name, field_path,session):
    # writes to file: BiologyDefault.bio
    CODEC = "UTF-8"
    filename = os.path.join(field_path, "BiologyDefault.bio")
    
    try:
        with open(filename, "w", encoding=CODEC) as fh:
            biolist = read_biologydefault(session)
            fh.write("*** Example 12.3: Parameters of abiotic response: file 'SetAbio.dat'\n")
            fh.write("Dehumification, mineralization, nitrification dependencies on moisture:\n")
            fh.write("dThH    dThL    es    Th_m\n")
            fh.write(f'{biolist[0][0]:-14.6f}{biolist[0][1]:-14.6f}{biolist[0][2]:-14.6f}{biolist[0][3]:-14.6f}\n')
            fh.write("Dependencies of temperature\n")
            fh.write("tb     QT\n")
            fh.write(f'{biolist[0][4]:-14.6f}{biolist[0][5]:-14.6f}\n')
            fh.write("Denitrification dependencies on water content\n")
            fh.write("dThD   Th_d\n")
            fh.write(f'{biolist[0][6]:-14.6f}{biolist[0][7]:-14.6f}\n')
    except IOError:
        print("Could not open file")

def WriteDripIrrigationFile(field_name, field_path):
    # Write DRP file
    CODEC = "UTF-8"
    filename = os.path.join(field_path, field_name + ".drp")
    
    try:
        with open(filename, "w", encoding=CODEC) as fh:
            fh.write("*****Script for Drip application module ***** mAppl is cm water per hour to a 45 x 30 cm area\n")
            fh.write("Number of Drip irrigations(max=25)\n")
            fh.write("0\n")
            fh.write("No drip irrigation\n")
    except IOError:
        print("Could not open file")

 

def WriteCropVariety(crop, cultivar, field_name, field_path,session,current_user_id=None):
    hybridname = cultivar
    hybridparameters = read_cultivar_DB_detailed(hybridname, crop,session,current_user_id)

    filename = os.path.join(field_path, hybridname + ".var")
    
    try:
        with open(filename, "w", encoding="UTF-8") as fout:
            if crop == "maize":
                fout.write(f"maize growth simulation for variety {hybridname}\n")
                fout.write("Juvenile   Daylength   StayGreen  LM_Min Rmax_LTAR          Rmax_LTIR          Phyllochrons from \n")
                fout.write("leaves     Sensitive   Leaf tip appearance   Leaf tip initiation       TassellInit\n")
                fout.write(f'{hybridparameters[0]:0f}{hybridparameters[1]:-14.0f}{hybridparameters[5]:-14.6f}{hybridparameters[6]:-14.6f}'
                           f'{hybridparameters[2]:-14.6f}{hybridparameters[3]:-14.6f}{hybridparameters[4]:-14.6f}\n')
            elif crop == "potato":
                a2 = (hybridparameters[0] - 1) / 10
                a3 = 100
                a4 = 1
                a5 = hybridparameters[1] - 1
                a7 = hybridparameters[2] - 1
                fout.write("*** EX4 Coefficient Calibration for Agmip 2017\n")
                fout.write(f"{hybridname}\n")
                fout.write("Genetic Coefficients\n")
                fout.write("A1(T1) A2(T2) A3(LAI) A4(Srad) A5(Tamp) A6(Tamp) A7(Pd) A8(Pd) A9(N) A10(N) G1(Det) G2(Exp) G3(TGR) G4(SLW)\n")
                fout.write(f'{hybridparameters[0]:-14.3f}{a2:-14.3f}{a3:-14.3f}{a4:-14.3f}{a5:-14.3f}{hybridparameters[1]:-14.3f}'
                           f'{a7:-14.3f}{hybridparameters[2]:-14.3f}{hybridparameters[3]:-14.3f}{hybridparameters[4]:-14.3f}'
                           f'{hybridparameters[5]:-14.3f}{hybridparameters[6]:-14.3f}{hybridparameters[7]:-14.3f}{hybridparameters[8]:-14.3f}\n')
            elif crop == "soybean":
                fout.write(f"soybean growth simulation for variety {hybridname}\n")
                fout.write("[Phenology]\n")
                fout.write("MG SEEDLB FILL PARM(2) PARM(3) PARM(4) PARM(5) PARM(6) PARM(7) PARM(8) PARM(9) PARM(10) PARM(11) "
                           "PARM(12) PARM(13) PARM(14) PARM(15) PARM(16) PARM(17) PARM(18) PARM(19) PARM(20) PARM(21) PARM(22) "
                           "PARM(23) PARM(24) PARM(25)\n")
                fout.write(f'{hybridparameters[0]:-14.5f}{hybridparameters[1]:-14.5f}{hybridparameters[2]:-14.5f}{hybridparameters[3]:-14.5f}'
                           f'{hybridparameters[4]:-14.5f}{hybridparameters[5]:-14.5f}{hybridparameters[6]:-14.5f}{hybridparameters[7]:-14.5f}'
                           f'{hybridparameters[8]:-14.5f}{hybridparameters[9]:-14.5f}{hybridparameters[10]:-14.5f}{hybridparameters[11]:-14.5f}'
                           f'{hybridparameters[12]:-14.5f}{hybridparameters[13]:-14.5f}{hybridparameters[14]:-14.5f}{hybridparameters[15]:-14.5f}'
                           f'{hybridparameters[16]:-14.5f}{hybridparameters[17]:-14.5f}{hybridparameters[18]:-14.5f}{hybridparameters[19]:-14.5f}'
                           f'{hybridparameters[20]:-14.5f}{hybridparameters[21]:-14.5f}{hybridparameters[22]:-14.5f}{hybridparameters[23]:-14.5f}'
                           f'{hybridparameters[24]:-14.5f}{hybridparameters[25]:-14.5f}{hybridparameters[26]:-14.5f}\n')


        # cotton
            elif crop == "cotton":
                calbrt1 = 0.9
                calbrt2 = -0.22
                calbrt3 = -2.2
                calbrt4 = 0.1
                calbrt5 = -5.5
                calbrt6 = 0.5
                calbrt7 = 0.5
                calbrt8 = 0.1
                calbrt9 = 1.65
                calbrt10 = 2.15
                calbrt14 = 0.1
                calbrt20 = 1
                calbrt21 = 1
                calbrt23 = 1
                calbrt24 = 1    
                calbrt25 = 1
                calbrt46 = 1
                calbrt51 = 1
                calbrt53 = 1
                calbrt54 = 0
                calbrt55 = 0.9
                calbrt56 = 1
                calbrt58 = 1
                calbrt59 = 1
                calbrt60 = 1
                rrrm = 166.7
                rrry = 31.3
                rvrl = 0.73
                alpm = 0.6
                alpy = 0.3
                rtwl = 0.00001
                mrwpua = 0.0002
                epsi = 1
                iupw = 1
                courmax = 1           
                diffx = 2.4
                diffz = 2.9
                velz = 0
                isink = 1
                rroot = 0.03
                constlm = 35
                constkm = 0.5
                cminom = 0.01
                constly = 17.2
                constky = 0.75
                cminoy = 0.03
                # Open the file in write mode
                fout.write(f"Cotton growth simulation for variety {hybridname}\n")
                fout.write("[Phenology]\n")
                fout.write(f"{hybridname}\n")
                fout.write(f'{calbrt1:-14.6f}{calbrt2:-14.6f}{calbrt3:-14.6f}{calbrt4:-14.6f}{calbrt5:-14.6f}{calbrt6:-14.6f}'
                        f'{calbrt7:-14.6f}{calbrt8:-14.6f}{calbrt9:-14.6f}{calbrt10:-14.6f}{hybridparameters[0]:-14.6f}'
                        f'{hybridparameters[1]:-14.6f}{hybridparameters[2]:-14.6f}{calbrt14:-14.6f}{hybridparameters[3]:-14.6f}'
                        f'{hybridparameters[4]:-14.6f}{hybridparameters[5]:-14.6f}{hybridparameters[6]:-14.6f}{hybridparameters[7]:-14.6f}'
                        f'{calbrt20:-14.6f}{calbrt21:-14.6f}{hybridparameters[8]:-14.6f}{calbrt23:-14.6f}{calbrt24:-14.6f}'
                        f'{calbrt25:-14.6f}{hybridparameters[9]:-14.6f}{hybridparameters[10]:-14.6f}{hybridparameters[11]:-14.6f}'
                        f'{hybridparameters[12]:-14.6f}{hybridparameters[13]:-14.6f}{hybridparameters[14]:-14.6f}{hybridparameters[15]:-14.6f}'
                        f'{hybridparameters[16]:-14.6f}{hybridparameters[17]:-14.6f}{hybridparameters[18]:-14.6f}{hybridparameters[19]:-14.6f}'
                        f'{hybridparameters[20]:-14.6f}{hybridparameters[21]:-14.6f}{hybridparameters[22]:-14.6f}{hybridparameters[23]:-14.6f}'
                        f'{hybridparameters[24]:-14.6f}{hybridparameters[25]:-14.6f}{hybridparameters[26]:-14.6f}{hybridparameters[27]:-14.6f}'
                        f'{hybridparameters[28]:-14.6f}{calbrt46:-14.6f}{hybridparameters[29]:-14.6f}{hybridparameters[30]:-14.6f}'
                        f'{hybridparameters[31]:-14.6f}{hybridparameters[32]:-14.6f}{calbrt51:-14.6f}{hybridparameters[33]:-14.6f}'
                        f'{calbrt53:-14.6f}{calbrt54:-14.6f}{calbrt55:-14.6f}{calbrt56:-14.6f}{hybridparameters[34]:-14.6f}'
                        f'{calbrt58:-14.6f}{calbrt59:-14.6f}{calbrt60:-14.6f}\n')
            fout.write("[SoilRoot]\n")
            fout.write("*** WATER UPTAKE PARAMETER INFORMATION **************************\n")
            fout.write("RRRM       RRRY    RVRL\n")
            upw_int=int(hybridparameters[15])
            insink_int=int(hybridparameters[20])
            if crop == "maize":
                fout.write(f'{hybridparameters[7]:-14.6f}{hybridparameters[8]:-14.6f}{hybridparameters[9]:-14.6f}\n')
                fout.write(" ALPM    ALPY     RTWL    RtMinWtPerUnitArea\n")
                fout.write(f'{hybridparameters[10]:-14.8f}{hybridparameters[11]:-14.8f}{hybridparameters[12]:-14.8f}{hybridparameters[13]:-14.8f}\n')
                fout.write("[RootDiff]\n")
                fout.write("*** ROOT MOVER PARAMETER INFORMATION **************************\n")
                fout.write("EPSI        lUpW             CourMax\n")
                fout.write(f'{hybridparameters[14]:-14.6f}{upw_int:-14d}{hybridparameters[16]:-14.6f}\n')
                fout.write("Diffusivity and geotropic velocity\n")
                fout.write(f'{hybridparameters[17]:-14.6f}{hybridparameters[18]:-14.6f}{hybridparameters[19]:-14.6f}\n')
                fout.write("[SoilNitrogen]\n")
                fout.write("*** NITROGEN ROOT UPTAKE PARAMETER INFORMATION **************************\n")
                fout.write("ISINK    Rroot         \n")
                fout.write(f'{insink_int:-14d}{hybridparameters[21]:-14.6f}\n')
                fout.write("ConstI   Constk     Cmin0 \n")
                fout.write(f'{hybridparameters[22]:-14.6f}{hybridparameters[23]:-14.6f}{hybridparameters[24]:-14.6f}\n')
                fout.write(f'{hybridparameters[25]:-14.6f}{hybridparameters[26]:-14.6f}{hybridparameters[27]:-14.6f}\n')
            elif crop == "potato":
                fout.write(f'{hybridparameters[9]:-14.6f}{hybridparameters[10]:-14.6f}{hybridparameters[11]:-14.6f}\n')
                fout.write(" ALPM    ALPY     RTWL    RtMinWtPerUnitArea\n")
                fout.write(f'{hybridparameters[12]:-14.8f}{hybridparameters[13]:-14.8f}{hybridparameters[14]:-14.8f}{hybridparameters[15]:-14.8f}\n')
                fout.write("[RootDiff]\n")
                fout.write("*** ROOT MOVER PARAMETER INFORMATION **************************\n")
                fout.write("EPSI        lUpW             CourMax\n")
                fout.write(f'{hybridparameters[16]:-14.6f}{int(hybridparameters[17]):-14}{hybridparameters[18]:-14.6f}\n')
                fout.write("Diffusivity and geotropic velocity\n")
                fout.write(f'{hybridparameters[19]:-14.6f}{hybridparameters[20]:-14.6f}{hybridparameters[21]:-14.6f}\n')
                fout.write("[SoilNitrogen]\n")
                fout.write("*** NITROGEN ROOT UPTAKE PARAMETER INFORMATION **************************\n")
                fout.write("ISINK    Rroot         \n")
                fout.write(f'{int(hybridparameters[22]):-14d}{hybridparameters[23]:-14.6f}\n')
                fout.write("ConstI   Constk     Cmin0 \n")
                fout.write(f'{hybridparameters[24]:-14.6f}{hybridparameters[25]:-14.6f}{hybridparameters[26]:-14.6f}\n')
                fout.write(f'{hybridparameters[27]:-14.6f}{hybridparameters[28]:-14.6f}{hybridparameters[29]:-14.6f}\n')

            elif crop == "soybean":
                fout.write(f'{hybridparameters[27]:-14.6f}{hybridparameters[28]:-14.6f}{hybridparameters[29]:-14.6f}\n')
                fout.write(" ALPM    ALPY     RTWL    RtMinWtPerUnitArea\n")
                fout.write(f'{hybridparameters[30]:-14.8f}{hybridparameters[31]:-14.8f}{hybridparameters[32]:-14.8f}{hybridparameters[33]:-14.8f}\n')
                fout.write("[RootDiff]\n")
                fout.write("*** ROOT MOVER PARAMETER INFORMATION **************************\n")
                fout.write("EPSI        lUpW             CourMax\n")
                fout.write(f'{hybridparameters[34]:-14.6f}{int(hybridparameters[35]):-14d}{hybridparameters[36]:-14.6f}\n')
                fout.write("Diffusivity and geotropic velocity\n")
                fout.write(f'{hybridparameters[37]:-14.6f}{hybridparameters[38]:-14.6f}{hybridparameters[39]:-14.6f}\n')
                fout.write("[SoilNitrogen]\n")
                fout.write("*** NITROGEN ROOT UPTAKE PARAMETER INFORMATION **************************\n")
                fout.write("ISINK    Rroot         \n")
                fout.write(f'{int(hybridparameters[40]):-14d}{hybridparameters[41]:-14.6f}\n')
                fout.write("ConstI   Constk     Cmin0 \n")
                fout.write(f'{hybridparameters[42]:-14.6f}{hybridparameters[43]:-14.6f}{hybridparameters[44]:-14.6f}\n')
                fout.write(f'{hybridparameters[45]:-14.6f}{hybridparameters[46]:-14.6f}{hybridparameters[47]:-14.6f}\n')
            elif crop == "cotton":
                fout.write(f'{rrrm:-14.6f}{rrry:-14.6f}{rvrl:-14.6f}\n')
                fout.write(" ALPM    ALPY     RTWL    RtMinWtPerUnitArea\n")
                fout.write(f'{alpm:-14.8f}{alpy:-14.8f}{rtwl:-14.8f}{mrwpua:-14.8f}\n')
                fout.write("[RootDiff]\n")
                fout.write("*** ROOT MOVER PARAMETER INFORMATION **************************\n")
                fout.write("EPSI        lUpW             CourMax\n")
                fout.write(f'{epsi:-14.6f}{iupw:-14d}{courmax:-14.6f}\n')
                fout.write("Diffusivity and geotropic velocity\n")
                fout.write(f'{diffx:-14.6f}{diffz:-14.6f}{velz:-14.6f}\n')
                fout.write("[SoilNitrogen]\n")
                fout.write("*** NITROGEN ROOT UPTAKE PARAMETER INFORMATION **************************\n")
                fout.write("ISINK    Rroot         \n")
                fout.write(f'{int(isink):-14d}{rroot:-14.6f}\n')
                fout.write("ConstI   Constk     Cmin0 \n")
                fout.write(f'{constlm:-14.6f}{constkm:-14.6f}{cminom:-14.6f}\n')
                fout.write(f'{constly:-14.6f}{constky:-14.6f}{cminoy:-14.6f}\n')


            fout.write("[Gas_Exchange Species Parameters] \n")
            fout.write("**** for photosynthesis calculations ***\n")
            fout.write("EaVp    EaVc    Eaj     Hj      Sj     Vpm25   Vcm25    Jm25    Rd25    Ear       g0    g1\n")
            fout.write("75100   55900   32800   220000  702.6   70      50       300    2       39800   0.017   4.53\n")
            fout.write("*** Second set of parameters for Photosynthesis ****\n")
            fout.write("f (spec_correct)     scatt  Kc25    Ko25    Kp25    gbs         gi      gamma1\n")
            fout.write("0.15                 0.15   650      450    80      0.003       1       0.193\n")
            fout.write("**** Third set of photosynthesis parameters ****\n")
            fout.write("Gamma_gsw  sensitivity (sf) Reference_Potential_(phyla, bars) stomaRatio widthFact lfWidth (m)\n")
            fout.write("  10.0        2.3               -1.2                             1.0        0.72   0.050\n")
            fout.write("**** Secondary parameters for miscelanious equations ****\n")
            fout.write("internal_CO2_Ratio   SC_param      BLC_param\n")
            fout.write("0.7                   1.57           1.36\n")
            if crop == "maize" or crop == "soybean" or crop == "cotton":
                fout.write("***** Q10 parameters for respiration and leaf senescence\n")
                fout.write("Q10MR            Q10LeafSenescense\n")
                fout.write("2.0                     2.0\n")
                fout.write("**** parameters for calculating the rank of the largest leaf and potential length of the leaf based on rank\n")
                fout.write("leafNumberFactor_a1 leafNumberFactor_b1 leafNumberFactor_a2 leafNumberFactor_b2\n")
                fout.write("-10.61                   0.25                   -5.99           0.27\n")
                fout.write("**************Leaf Morphology Factors *************\n")
                fout.write("LAF        WLRATIO         A_LW\n")
                fout.write(" 1.37          0.106           0.75\n")
                fout.write("*******************Temperature factors for growth *****************************\n")
                fout.write("T_base                 T_opt            t_ceil  t_opt_GDD\n")
                fout.write("8.0                   32.1              43.7       34.0\n")
            fout.write("\n")
        fout.close()
    except IOError:
        print("Could not open file")

            

def WriteWeather(experiment,treatmentname,stationtype,weather,field_path,tempVar,rainVar,CO2Var,owner_id,session:SessionDep):

    # First create .wea file that stores the daily/hourly weather information for the simulation period
    filename = "".join([os.path.join(field_path, stationtype),'.wea'])
    # getting weather data from sqlite
    # get date range for treatment
 # Query with named parameters
    op_date_query = """
        SELECT DISTINCT odate
        FROM operations o, treatment t, experiment e
        WHERE t.tid = o.o_t_exid
        AND e.exid = t.t_exid
        AND e.name = %(experiment_name)s
        AND t.name = %(treatment_name)s
    """
    # Pass params as a dictionary
    df_op_date = pd.read_sql(op_date_query, session.connection(), params={'experiment_name': experiment, 'treatment_name': treatmentname})
    df_op_date['odate'] = pd.to_datetime(df_op_date['odate'])
    sdate = df_op_date['odate'].min() - timedelta(days=1)
    edate = df_op_date['odate'].max() + timedelta(days=1)
    diffInDays = (edate - sdate)/np.timedelta64(1,'D')
    statement = select(WeatherMeta).filter(
    WeatherMeta.stationtype == weather,
    WeatherMeta.owner_id == owner_id
    )
    weatherMetadata = session.exec(statement).first()
    weather_id=weatherMetadata.id
    weather_query = """select jday, date, hour, srad, tmax, tmin, temperature, rain, wind, rh, co2 from weather_data where 
        stationtype= %(stationtype)s and weather_id= %(weather_id)s order by date"""
    df_weatherdata_orig = pd.read_sql(weather_query, session.connection(),params={'stationtype': stationtype,'weather_id': str(weather_id)})
    
    # Convert date column to Date type
    df_weatherdata_orig['date'] = pd.to_datetime(df_weatherdata_orig['date'])
    
    firstDate = df_weatherdata_orig['date'].min()
    lastDate = df_weatherdata_orig['date'].max()
    df_weatherdata = df_weatherdata_orig.copy()
    mask = (df_weatherdata['date'] >= sdate) & (df_weatherdata['date'] <= edate)
    df_weatherdata = df_weatherdata.loc[mask]
    #Check if dataframe is empty
#     if df_weatherdata.empty == True or (df_weatherdata.shape[0] + 1) < diffInDays:
#         return "Weather data is available for the data range of " + firstDate.strftime("%m/%d/%Y") + " and " + lastDate.strftime("%m/%d/%Y") + ". If this period covers \
# the date range of your simulation, there are data missing for this simulation period."
    # Check if data is daily or hourly
    hourly_flag = 0
    weather_length = df_weatherdata['date'].max() - df_weatherdata['date'].min()
    num_records = len(df_weatherdata)
    df_weatherdata['date'] = pd.to_datetime(df_weatherdata['date'],format='%Y-%m-%d')
    weatherRoundDict = {"Radiation":2, "rain":2, "Wind":2, "rh":1, "CO2":1}
    if(num_records > (weather_length.days+1)):
        # header for hourly file
        df_weatherdata = df_weatherdata.drop(columns=['tmax','tmin'])
        weather_col_names = ["JDay", "Date", "hour", "Radiation", "temperature", "rain", "Wind", "rh", "CO2"] 
        hourly_flag = 1
        df_weatherdata = df_weatherdata.sort_values(by=['date','hour'])
        # Sensitivity analyses temperature variance
        if tempVar != 0:
            df_weatherdata['temperature'] = df_weatherdata['temperature'] + float(tempVar)
        weatherRoundDict['temperature'] = 1
    else:
        # header for daily file
        df_weatherdata = df_weatherdata.drop(columns=['hour','temperature'])
        weather_col_names = ["JDay", "Date", "Radiation", "Tmax","Tmin", "rain", "Wind", "rh", "CO2"] 
        df_weatherdata = df_weatherdata.sort_values(by=['date'])
        # Sensitivity analyses temperature variance
        if tempVar != 0:
            df_weatherdata['tmax'] = df_weatherdata['tmax'] + float(tempVar)
            df_weatherdata['tmin'] = df_weatherdata['tmin'] + float(tempVar)
        weatherRoundDict['tmax'] = 1
        weatherRoundDict['tmin'] = 1
    df_weatherdata['date'] = df_weatherdata['date'].dt.strftime('\'%m/%d/%Y\'')
    df_weatherdata.columns = weather_col_names
    rh_flag = 1
    if (df_weatherdata['rh'].isna().sum() > 0 or (df_weatherdata['rh'] == '').sum() > 0):
        df_weatherdata = df_weatherdata.drop(columns=['rh'])
        rh_flag = 0
        del weatherRoundDict['rh']
    co2_flag = 1
    if CO2Var != "None" and CO2Var != 0:
        df_weatherdata['CO2'] = float(CO2Var)
    else:
        if (df_weatherdata['CO2'].isna().sum() > 0 or (df_weatherdata['CO2'] == 0).sum() > 0):
            df_weatherdata = df_weatherdata.drop(columns=['CO2'])
            co2_flag = 0
            del weatherRoundDict['CO2']
    if rainVar != 0:
        df_weatherdata['rain'] = df_weatherdata['rain'] + (df_weatherdata['rain']*(float(rainVar)/100.0))         
    else:
        if (df_weatherdata['rain'].isna().sum() > 0 or (df_weatherdata['rain'] == '').sum() > 0):
            df_weatherdata = df_weatherdata.drop(columns=['rain'])
            del weatherRoundDict['rain']

    wind_flag = 1
    if (df_weatherdata['Wind'].isna().sum() > 0 or (df_weatherdata['Wind'] == '').sum() > 0):
        df_weatherdata = df_weatherdata.drop(columns=['Wind'])
        del weatherRoundDict['Wind']
        wind_flag = 0
    # the inputs for weather file comes from the weather flags. So we have to build that data stream 
    # and then write
    
    comment_value = ",".join(df_weatherdata.columns)
    #write the comment first
    with open(filename,'a') as ff:
        ff.write(comment_value)
        ff.write('\n')

    df_weatherdata = df_weatherdata.round(weatherRoundDict)
    df_weatherdata.to_csv(filename,sep=' ',index=False,mode='a')
    # Create .cli file
    # Extracts weather information from the weather_meta table and write the text file.       
    weatherparameters = read_weatherlongDB(stationtype,session) #returns a tuple
    CODEC="UTF-8"
    filename ="".join([os.path.join(field_path, stationtype), ".cli"])

#        print("Debug: weatherparameters=",weatherparameters)
#        print("Debug: filename=",filename)
    with open(filename, 'w') as fh:
        header = ""
        val = ""
        if wind_flag == 0:
            header = "wind"
            val = str(weatherparameters[7])
        
        # IRAV is only used with daily data and if there is no column of rain intensity values
        if hourly_flag == 0:
            header = header + "    irav"
            val = val + "    " + str(weatherparameters[8])
            
        header = header + "    ChemConc"
        val = val + "    " + str(weatherparameters[9])
        
        if co2_flag == 0:
            header = header + "    Co2"
            if CO2Var == 0:
                val = val + "    " + str(weatherparameters[10])
            # Sensitivity analyses CO2 variance
            else:
                val = val + "    " + str(CO2Var)
        
        # Writing output to the file
        fh.write(f"***STANDARD METEOROLOGICAL DATA  Header file for {stationtype}\n")
        fh.write("Latitude Longitude\n")
        fh.write(f'{weatherparameters[0]:-14.6f}{weatherparameters[1]:-14.6f}\n')
        fh.write("^Daily Bulb T(1) ^Daily Wind(2) ^RainIntensity(3) ^Daily Conc^(4) ^Furrow(5) ^Rel_humid(6) ^CO2(7)\n")
        fh.write(f'{0:-14d}{wind_flag:-14d}{0:-14d}{0:-14d}{0:-14d}{rh_flag:-14d}{co2_flag:-14d}\n')
        fh.write("Parameters for changing of units: BSOLAR BTEMP ATEMP ERAIN BWIND BIR\n")
        fh.write("BSOLAR is 1e6/3600 to go from j m-2 h-1 to wm-2\n")
        fh.write(f'{weatherparameters[2]:-14.1f}{weatherparameters[3]:-14.1f}{weatherparameters[4]:-14.4f}{0.1:-14.1f}{weatherparameters[5]:-14.1f}{weatherparameters[6]:-14.1f}\n')
        fh.write("Average values for the site\n")
        fh.write(f"{header}\n")
        fh.write(f"{val}\n")
    fh.close()
    return hourly_flag, edate


def WriteSoluteFile(soilname, field_path, session, current_user_id):
    # Writes the SOLUTE FILE
    CODEC = "UTF-8"
    filename = os.path.join(field_path, "NitrogenDefault.sol")
    
    try:
        with open(filename, 'w', encoding=CODEC) as fout:
            # Read soil texture and solute data
            soiltexture_list = read_soiltextureDB(soilname, session, current_user_id)  # Read soil file content
            solute_tuple = read_soluteDB(session, 1)  # Read solute file content
            TextureCl = []  # Empty list for textures

            # Process each row of soil texture
            for irow in soiltexture_list:
                texture = Texture(irow[0], irow[2]).whatTexture()
                textures = list(filter(str.strip, texture.split("/")))
                if len(textures) >= 1:
                    # Assumption: choose the second texture if there are two, else last one
                    TextureCl.append(textures[-1])

            # Write the output file
            fout.write("*** SOLUTE MOVER PARAMETER INFORMATION ***\n")
            fout.write("Number of solutes\n")
            fout.write("1\n")
            fout.write("Computational parameters\n")
            fout.write("EPSI        lUpW             CourMax\n")
            fout.write(f'{solute_tuple[1]:.6f}'.rstrip('0').rstrip('.') + f'{int(solute_tuple[2]):-14d}{solute_tuple[3]:-14.6f}\n')
            fout.write("Material Information\n")
            fout.write("Solute#, Ionic/molecular diffusion coefficients of solutes\n")
            fout.write(f'{1:-14.6f}{solute_tuple[4]:-14.6f}\n')
            fout.write("Solute#, Layer#, Longitudinal Dispersivity, Transversal Dispersivity (units are cm)\n")

            # Write dispersivity data for each texture
            for counter, texture in enumerate(TextureCl, start=1):
                dispersivity = read_dispersivityDB(texture, session)
                fout.write(f'{1:-9d}{counter:-14d}{dispersivity[0]:-14.6f}{dispersivity[0]/2:-14.6f}\n')
            fout.write("\n")
    except IOError:
        print(f"Could not open file: {filename}")



def WriteGasFile(field_path,session):
    # Writes the SOLUTE FILE
    CODEC = "UTF-8"
    filename = os.path.join(field_path, "GasID.gas")
    
    try:
        with open(filename, 'w', encoding=CODEC) as fout:
            gas_list = read_gasDB(session)  # Read gas data
                    # Write the output file
            fout.write("*** Gas Movement Parameters Information ***\n")
            fout.write("Number of gases\n")
            fout.write(f'{len(gas_list):-14d}\n')
            fout.write("Computational parameters\n")
            fout.write("EPSI\n")
            fout.write(f'{gas_list[0][1]:-14.6f}\n')
            fout.write("Reduced tortuosity rate change with water content (bTort)\n")
            fout.write("for entire soil domain\n")
            fout.write(f'{gas_list[0][2]:-14.6f}\n')
            fout.write("Gas diffusion coefficients in air at standard conditions, cm2/day\n")
            fout.write("Gas # 1 (CO2) Gas # 2 (Oxygen) Gas # 3 (Methane)\n")
            fout.write(f'{gas_list[0][3]:-14.6f}{gas_list[1][3]:-14.6f}{gas_list[2][3]:-14.6f}\n')
            fout.write("\n")

    except IOError:
        print(f"Could not open file: {filename}")


def WriteTimeFileData(treatmentname, experimentname, cropname, stationtype,
                       hourlyFlag, field_name, field_path, hourly_flag, soilModel_flag,session):
    # Writes the Time information into *.tim FILE
    startdate = 'Blank'
    enddate = 'Blank'
    dt = 0.0001
    dtMin = 0.0000001
    DMul1 = 1.3
    DMul2 = 0.3
    CODEC = "UTF-8"
    filename = os.path.join(field_path, f"{field_name}.tim")
    
    try:
        with open(filename, 'w', encoding=CODEC) as fout:
            # Retrieve start and end dates
            startdate = read_operation_timeDB2('Simulation Start', treatmentname, experimentname, cropname,session)                 
            enddate = read_operation_timeDB2('Simulation End', treatmentname, experimentname, cropname,session)              
            fout.write("*** SYNCHRONIZER INFORMATION *****************************\n")
            fout.write("Initial time       dt       dtMin     DMul1    DMul2    tFin\n")
            fout.write(f"'{startdate:<10s}'  {dt:<14.4f}{dtMin:<14.10f}{DMul1:<14.4f}{DMul2:<14.4f}'{enddate:<10s}'\n")
            fout.write("Output variables, 1 if true  Daily    Hourly\n")
            fout.write(f"{1 - hourlyFlag:<16d}{hourlyFlag:<14d}\n")
            fout.write("Daily Hourly Weather data frequency. if daily enter 1   0; if hourly enter 0  1\n")
            fout.write(f"{1 - hourly_flag:<16d}{hourly_flag:<14d}\n")
            fout.write("run to end of soil model if 1, when crop matures the model ends, otherwise continues to stop date in time file\n")
            fout.write(f"{soilModel_flag:<14d}\n\n")
    
    except IOError:
        print(f"Could not open file: {filename}")


def WriteNitData(soilname, field_name, field_path, rowSpacing,session,current_user_id):
    # Writes Soil Nitrogen parameters into *.nit FILE
    soilnitrogen_list = read_soilnitrogenDB(soilname,session, current_user_id)
    NCount = len(soilnitrogen_list)        
    MaxX = rowSpacing / 100  # Maximum width of grid

    CODEC = "UTF-8"
    filename = os.path.join(field_path, f"{field_name}.nit")
    
    try:
        with open(filename, 'w', encoding=CODEC) as fout:
            fout.write(" *** SoilNit parameters for location ***\n")
            fout.write("ROW SPACING (m)\n")
            fout.write(f"{MaxX}\n")
            fout.write("                             Potential rate constants:       Ratios and fractions:\n")
            fout.write("m      kh     kL       km       kn        kd             fe   fh    r0   rL    rm   fa    nq   cs\n")
            
            for rrow in range(NCount):
                record_tuple = soilnitrogen_list[rrow]
                fout.write(f"{rrow + 1:<14d}{record_tuple[0]:<14.5f}{record_tuple[1]:<14.3f}{record_tuple[2]:<14.6f}{record_tuple[3]:<14.1f}{record_tuple[4]:<14.5f}{record_tuple[5]:<14.1f}{record_tuple[6]:<14.1f}{record_tuple[7]:<14f}{record_tuple[8]:<14f}{record_tuple[9]:<14f}{record_tuple[10]:<14.1f}{record_tuple[11]:<14f}{record_tuple[12]:<14.5f}\n")
    
    except IOError:
        print(f"Could not open file: {filename}")


def WriteSoiData(soilname, field_name, field_path,session,current_user_id):
    # Writes Soil data into *.soi FILE
    soil_hydrology_list = read_soilhydroDB(soilname,session,current_user_id)
    NCount = len(soil_hydrology_list)               
    CODEC = "UTF-8"    
    sandcontent= 0  
    filename = os.path.join(field_path, f"{soilname}.soi")

    try:
        with open(filename, 'w', encoding=CODEC) as fout:
            fout.write("           *** Material information ****                                                                   g/g\n")
            fout.write("   thr       ths         tha       th      Alfa      n        Ks         Kk       thk       BulkD     OM    Sand    Silt\n")
            
            for rrow in range(NCount):
                record_tuple = soil_hydrology_list[rrow]
                try:
                    fout.write(
                        f"{record_tuple[0]:<9.6f}"
                        f"{record_tuple[1]:<9.6f}"
                        f"{record_tuple[2]:<9.6f}"
                        f"{record_tuple[3]:<9.6f}"
                        f"{record_tuple[4]:<9.6f}"
                        f"{record_tuple[5]:<9.6f}"
                        f"{record_tuple[6]:<9.6f}"
                        f"{record_tuple[7]:<9.6f}"
                        f"{record_tuple[8]:<9.6f}"
                        f"{record_tuple[9]:<9.6f}"
                        f"{float(record_tuple[10]) / 100:<9.6f}"
                        f"{record_tuple[11]:<9.6f}"
                        f"{record_tuple[12]:<9.6f}\n"
                    )
                except Exception as e:
                    print(f"Error: {e}")
                if rrow == 0:
                    sandcontent = record_tuple[11]

        # Writing additional data to the .dat file
        filename = os.path.join(field_path, f"{field_name}.dat")
        with open(filename, 'w', encoding=CODEC) as fout:
            soil_OM_list = read_soilOMDB(soilname,session, current_user_id)     
            NCount = len(soil_OM_list)
            fout.write(" Matnum      sand     silt    clay     bd     om   TH33       TH1500 \n") 
            for rrow in range(NCount):
                record_tuple = soil_OM_list[rrow]
                fout.write(
                    f"{record_tuple[0]:<5d}"
                    f"{record_tuple[1]:<8.3f}"
                    f"{record_tuple[2]:<8.3f}"
                    f"{record_tuple[3]:<8.3f}"
                    f"{record_tuple[4]:<8.3f}"
                    f"{float(record_tuple[5])/100:<8.3f}"
                    f"{record_tuple[6]:<8.3f}"
                    f"{record_tuple[7]:<8.3f}\n"
                )

    except IOError:
        print(f"Could not open file: {filename}")
    return sandcontent


def WriteMulchGeo(field_path, nutrient,session):
    # Writes mulch file (.mul)
    # Get mulch geo information
    mulchGeoList = getMulchGeo(nutrient,session)

    # Get mulch decomp information
    mulchDecompList = getMulchDecomp(nutrient,session)

    CODEC = "UTF-8"
    filename = os.path.join(field_path, 'MulchGeo.mul')

    try:
        with open(filename, 'w', encoding=CODEC) as fout:
            fout.write("*** Mulch Material information ****  based on g, m^3, J and oC\n")
            fout.write("[Basic_Mulch_Configuration]\n")
            fout.write("********The mulch grid configuration********\n")
            fout.write(f"Minimal Grid Size for Horizontal Element\n")
            fout.write(f"{int(mulchGeoList[0]) if mulchGeoList[0].is_integer() else mulchGeoList[0]:<10}\n")
            fout.write("********Simulation Specifications (1=Yes; 0=No)********\n")
            fout.write(f"Only_Diffusive_Flux     Neglect_LongWave_Radiation      Include_Mulch_Decomputions\n")
            fout.write(f"{int(mulchGeoList[1]) if mulchGeoList[1].is_integer() else mulchGeoList[1]:<10}"
                    f"{int(mulchGeoList[2]) if mulchGeoList[2].is_integer() else mulchGeoList[2]:<10}"
                    f"{int(mulchGeoList[3]) if mulchGeoList[3].is_integer() else mulchGeoList[3]:<10}\n")
            fout.write("[Mulch_Radiation]\n")
            fout.write("********Mulch Radiation Properties********\n")
            fout.write("DeltaRshort DeltaRlong  Omega   epsilon_mulch   alpha_mulch\n")
            fout.write(f"{int(mulchGeoList[4]) if mulchGeoList[4].is_integer() else mulchGeoList[4]:<10}"
                    f"{int(mulchGeoList[5]) if mulchGeoList[5].is_integer() else mulchGeoList[5]:<10}"
                    f"{int(mulchGeoList[6]) if mulchGeoList[6].is_integer() else mulchGeoList[6]:<10}"
                    f"{int(mulchGeoList[7]) if mulchGeoList[7].is_integer() else mulchGeoList[7]:<10}"
                    f"{int(mulchGeoList[8]) if mulchGeoList[8].is_integer() else mulchGeoList[8]:<10}\n")
            fout.write("[Numerical_Controls]\n")
            fout.write("********Picard Iteration COntrol********\n")
            fout.write("Max Iteration Step (before time step shrinkage) Tolerence for Convergence (%)\n")
            fout.write(f"{int(mulchGeoList[9]) if mulchGeoList[9].is_integer() else mulchGeoList[9]:<10}"
                    f"{int(mulchGeoList[10]) if mulchGeoList[10].is_integer() else mulchGeoList[10]:<10}\n")
            fout.write("[Mulch_Mass_Properties]\n")
            fout.write("********Some Basic Information such as density, porosity and empirical parameters********\n")
            fout.write("VRho_Mulch g/m3  Pore_Space  Max Held Ponding Depth\n")
            fout.write(f"{int(mulchGeoList[11]) if mulchGeoList[11].is_integer() else mulchGeoList[11]:<10}"
                    f"{int(mulchGeoList[12]) if mulchGeoList[12].is_integer() else mulchGeoList[12]:<10}"
                    f"{int(mulchGeoList[13]) if mulchGeoList[13].is_integer() else mulchGeoList[13]:<10}\n")
            fout.write("[Mulch_Decomposition]\n")
            fout.write("********Overall Factors********\n")
            fout.write("Contacting_Fraction Feeding_Coef\n")
            fout.write(f"{int(mulchDecompList[0]) if mulchDecompList[0].is_integer() else f'{mulchDecompList[0]:.4f}'.rstrip('0').rstrip('.'): <10}"
                    f"{int(mulchDecompList[1]) if mulchDecompList[1].is_integer() else f'{mulchDecompList[1]:.4f}'.rstrip('0').rstrip('.'): <10}\n")
            fout.write("The Fraction of Three Carbon Formats (Initial Value)\n")
            fout.write("Carbonhydrate(CARB)    Holo-Cellulose (CEL)   Lignin (LIG)\n")
            fout.write(f"{int(mulchDecompList[2]) if mulchDecompList[2].is_integer() else f'{mulchDecompList[2]:.4f}'.rstrip('0').rstrip('.'): <10}"
                    f"{int(mulchDecompList[3]) if mulchDecompList[3].is_integer() else f'{mulchDecompList[3]:.4f}'.rstrip('0').rstrip('.'): <10}"
                    f"{int(mulchDecompList[4]) if mulchDecompList[4].is_integer() else f'{mulchDecompList[4]:.4f}'.rstrip('0').rstrip('.'): <10}\n")
            fout.write("The Fraction of N in Three Carbon Formats (Initial Value)\n")
            fout.write(" Carbonhydrate(CARB)    Holo-Cellulose (CEL)   Lignin (LIG)\n")
            fout.write(f"{int(mulchDecompList[5]) if mulchDecompList[5].is_integer() else f'{mulchDecompList[5]:.4f}'.rstrip('0').rstrip('.'): <10}"
                    f"{int(mulchDecompList[6]) if mulchDecompList[6].is_integer() else f'{mulchDecompList[6]:.4f}'.rstrip('0').rstrip('.'): <10}"
                    f"{int(mulchDecompList[7]) if mulchDecompList[7].is_integer() else f'{mulchDecompList[7]:.4f}'.rstrip('0').rstrip('.'): <10}\n")
            fout.write("The Intrinsic Decomposition Speed of Three Carbon Formats (day^-1)\n")
            fout.write(" Carbonhydrate(CARB)    Holo-Cellulose (CEL)   Lignin (LIG)\n")
            fout.write(f"{int(mulchDecompList[8]) if mulchDecompList[8].is_integer() else f'{mulchDecompList[8]:.4f}'.rstrip('0').rstrip('.'): <10}"
                    f"{int(mulchDecompList[9]) if mulchDecompList[9].is_integer() else f'{mulchDecompList[9]:.4f}'.rstrip('0').rstrip('.'): <10}"
                    f"{int(mulchDecompList[10]) if mulchDecompList[10].is_integer() else f'{mulchDecompList[10]:.4f}'.rstrip('0').rstrip('.'): <10}\n")
    except IOError:
        print(f"Could not open file: {filename}")

# def WriteIrrigation(field_name, field_path, irrigationClass, simulationname, o_t_exid,session):
#     # conn, c = openDB('crop.db')
#     # if c:
#     #     c1 = c.execute("select o_t_exid from operations")
#     #     # o_t_exid = c1.fetchall()
#     # print("o_t_exid: ", o_t_exid)
    
#     irrAmtlist = getIrrigationData(simulationname, o_t_exid,session)
#     NCount = len(irrAmtlist)

#     CODEC = "UTF-8"
#     filename = os.path.join(field_path, f'{field_name}.irr')

#     try:
#         with open(filename, 'w', encoding=CODEC) as irrfile:
#             fout = irrfile.write
#             fout("*** Script for irrigation\n")
#             fout("Sprinkler irrigation\n")
#             fout("Average irrigation rate (cm/hour)\n")
#             fout("3\n")
#             fout("Number of irrigation application\n")
            
#             if irrigationClass != "No Irrigation":
#                 fout(f"{NCount:5d}\n")
#                 fout("Date             AmtIrrAppl (mm/day)\n")
#                 for rrow in range(NCount):
#                     record_tuple = irrAmtlist[rrow]
#                     fout(f"'{record_tuple[0]:<10s}'      {record_tuple[1]:<14d}\n")
#             else:
#                 fout("0\nNo Irrigation\n")
#     except IOError:
#         print(f"Could not open file: {filename}")
#WriteIrrigation(field_name, field_path, irrType, simulation_name, o_t_exid, session)
def WriteIrrigation(field_name,field_path, simulationname, o_t_exid,session):
    """Write irrigation data to .irr file"""
    
    # First create .irr file for the simulation period
    CODEC = "UTF-8"
    filename = os.path.join(field_path, f"{field_name}.irr")

    # Reading all the irrigation from irrigationDetails table
    totIrrigation = read_irrigationDB(o_t_exid, session)
    values = [item[1] for item in totIrrigation]
    irrAmtlist = []
    floodlistH = []
    floodlistR = []

    NCountS = 0
    NCountH = 0
    NCountR = 0

    for item in values:
        if item == 'Sprinkler':
            irrAmtlist = getIrrigationData(simulationname, o_t_exid, session)
            NCountS = len(irrAmtlist)
        elif item == 'FloodH':
            floodlistH = getFloodHData(o_t_exid, session)
            NCountH = len(floodlistH)
        elif item == 'FloodR':
            floodlistR = getFloodRData( o_t_exid, session)
            NCountR = len(floodlistR)

    try:
        with open(filename, 'w', encoding=CODEC) as fout:
            fout.write("**** Script for irrigation\n")
            
            # Sprinkler   
            fout.write("[Sprinkler]\n")
            fout.write("Sprinkler irrigation\n")
            fout.write("Average irrigation rate (cm/hour)\n")
            fout.write("3\n")
            fout.write("Number of irrigation application\n")

            if NCountS != 0:
                fout.write(f"{NCountS:5d}\n")
                fout.write("Date             AmtIrrAppl (mm/day)\n")
                for record_tuple in irrAmtlist:
                    fout.write(f"'{record_tuple[0]:-10s}'      {record_tuple[1]:-14d}\n")
            else:
                fout.write("0\n")
                fout.write("No Irrigation\n")
                    
            # Flood_H
            fout.write("[Flood_H]\n")
            fout.write("Flood irrigation as depth of water (cm)\n")
            fout.write("Number of flood irrigations as head (cm)\n")

            if NCountH != 0:
                fout.write(f"{NCountH:5d}\n")
                fout.write("Ponding Depth (cm)        Irrigation start date         and  hour/         Irrigation stop date         and hour/ -          one line for each application\n")
                for record_tuple in floodlistH:
                    fout.write(f"{record_tuple[0]:-10.2f}      '{record_tuple[1]:-14s}'         {record_tuple[2]:-14s}         '{record_tuple[3]:-14s}'         {record_tuple[4]:-14s}\n")
            else:
                fout.write("0\n")
                fout.write("No flood Irrigation\n")

            # Flood_R
            fout.write("[Flood_R]\n")
            fout.write("Flood irrigation as rate applied (cm/day)\n")
            fout.write("Number of flood irrigations as rate\n")

            if NCountR != 0:
                fout.write(f"{NCountR:5d}\n")
                fout.write("Ponding Depth (cm)       rate (cm/day)     Irrigation start date        and  hour/             Irrigation stop date        and hour/ -          one line for each application\n")
                for record_tuple in floodlistR:
                    fout.write(f"{record_tuple[0]:-10.2f}      {record_tuple[1]:-14d}       '{record_tuple[2]:-14s}'        {record_tuple[3]:-14s}         '{record_tuple[4]:-14s}'         {record_tuple[5]:-14s}\n")
            else:
                fout.write("0\n")
                fout.write("No flood Irrigation\n")

    except IOError:
        print(f"Could not open file: {filename}")


def WriteRunFile(cropname, soilname, field_name, cultivar, field_path, stationtype):
    # Writes Run file with input data file names
    CODEC = "UTF-8"
    filename = os.path.join(field_path, f"Run{field_name}.dat")

    try:
        with open(filename, 'w', encoding=CODEC) as fh:
            fout = fh.write
            hybridname = cultivar
            
            fout(f"{field_path}/{stationtype}.wea\n")
            fout(f"{field_path}/{field_name}.tim\n")
            fout(f"{field_path}/BiologyDefault.bio\n")
            fout(f"{field_path}/{stationtype}.cli\n")
            fout(f"{field_path}/{field_name}.nit\n")
            fout(f"{field_path}/NitrogenDefault.sol\n")
            fout(f"{field_path}/GasID.gas\n")
            fout(f"{field_path}/{soilname}.soi\n")
            fout(f"{field_path}/MulchGeo.mul\n")
            fout(f"{field_path}/{field_name}.man\n")
            fout(f"{field_path}/{field_name}.irr\n")
            fout(f"{field_path}/{field_name}.drp\n")
            fout(f"{field_path}/WatMovParam.dat\n")
            fout(f"{field_path}/Water3.DAT\n")
            
            fout(f"{field_path}/{field_name}.ini\n")
            fout(f"{field_path}/{hybridname}.var\n")
            fout(f"{field_path}/{field_name}.grd\n")
            fout(f"{field_path}/{field_name}.nod\n")
            fout(f"{field_path}/MassBI.dat\n")
            fout(f"{field_path}/{field_name}.g01\n")
            
            if cropname in ["maize", "soybean"]:
                fout(f"{field_path}/{field_name}.g02\n")
            else:
                fout(f"{field_path}/plantstress.crp\n")
            
            fout(f"{field_path}/{field_name}.G03\n")
            fout(f"{field_path}/{field_name}.G04\n")
            fout(f"{field_path}/{field_name}.G05\n")
            fout(f"{field_path}/{field_name}.G06\n")
            fout(f"{field_path}/{field_name}.G07\n")
            fout(f"{field_path}/MassBI.out\n")
            fout(f"{field_path}/MassBlRunOff.out\n")
            fout(f"{field_path}/MassBlMulch.out\n")
            fout(f"{field_path}/runoffmassbl.txt\n")
            
            if cropname == "cotton":
                fout(f"{field_path}/Cotton.out\n")
                fout(f"{field_path}/Cotton.sum\n")
    except IOError:
        print(f"Could not open file: {filename}")

def WriteManagement(cropname, experiment, treatmentname, field_name, field_path, rowSpacing, session):
    # Get data from operation, fertilizerOp and fertNutOp and Irrig_pivotOp

    fertCount = 0
    PGRCount = 0

    # Use crop to find exid in experiment table
    # Use exid and treatmentname to find tid from treatment table
    # Use tid(o_t_exid) to find all the operations
    operationList = []
    fDepth = []
    date = []
    ammtT = []
    lammtC = []
    lammtN = []
    mammtC = []
    mammtN = []
    PGRDate = []
    PGRChem = []
    PGRAppMeth = []
    PGRBandwidth = []
    PGRAppRate = []
    PGRAppUnit = []
    SurfResInfo = []
    IrrigationInfo = []

    exid = read_experimentDB_id(cropname, experiment,session)
    tid = read_treatmentDB_id(exid, treatmentname,session)
    operationList = read_operationsDB_id(tid,session)
    factor = (rowSpacing / 2) / 10000
    surfResType = "Rye"
    irrType = "No Irrigation"

    for ii, jj in enumerate(operationList):
        if jj[1] == "Fertilizer":
            fertInfo = readOpDetails(jj[0], jj[1],session)
            for j in range(len(fertInfo)):
                if j == 0:
                    fDepth.append(fertInfo[j][4])
                    date.append(fertInfo[j][2])

                if fertInfo[j][3] == "Fertilizer-N":
                    ammtT.append(fertInfo[j][6] * factor * 100)
                    lammtC.append(0)
                    lammtN.append(0)
                    mammtC.append(0)
                    mammtN.append(0)
                elif fertInfo[j][3] == "Manure":
                    if j == 0:
                        ammtT.append(0)
                        lammtC.append(0)
                        lammtN.append(0)
                    if fertInfo[j][5] == "Carbon (C)":
                        mammtC.append(fertInfo[j][6] * factor * 100)
                    if fertInfo[j][5] == "Nitrogen (N)":
                        mammtN.append(fertInfo[j][6] * factor * 100)
                elif fertInfo[j][3] == "Litter":
                    if j == 0:
                        ammtT.append(0)
                        mammtC.append(0)
                        mammtN.append(0)
                    if fertInfo[j][5] == "Carbon (C)":
                        lammtC.append(fertInfo[j][6] * factor * 100)
                    if fertInfo[j][5] == "Nitrogen (N)":
                        lammtN.append(fertInfo[j][6] * factor * 100)
            fertCount += 1
        if jj[1] == "Plant Growth Regulator":
            PGRInfo = readOpDetails(jj[0], jj[1],session)
            PGRDate.append(PGRInfo[0][2])
            PGRChem.append(PGRInfo[0][3])
            PGRAppMeth.append(PGRInfo[0][8])
            PGRBandwidth.append(PGRInfo[0][5])
            PGRAppRate.append(PGRInfo[0][6])
            PGRAppUnit.append(PGRInfo[0][9])
            PGRCount += 1
        if jj[1] == "Surface Residue":
            SurfResInfo = readOpDetails(jj[0], jj[1],session)
            surfResType = SurfResInfo[0][3]
        if jj[1] == "Tillage":
            TillageInfo = readOpDetails(jj[0], jj[1],session)
            if TillageInfo[0][3] == "Moldboard plow":
                tillDepth = 15
            elif TillageInfo[0][3] == "Chisel plow":
                tillDepth = 10
            elif TillageInfo[0][3] == "Vertical tillage":
                tillDepth = 5

    # Write *.MAN file using standard Python file handling
    filename = f"{field_path}/{field_name}.man"

    try:
        with open(filename, "w", encoding="utf-8") as fout:
            fout.write("*** Script for management practices fertilizer, residue and tillage\n")
            fout.write("[N Fertilizer]\n")
            fout.write("****Script for chemical application module  *******mg/cm2= kg/ha* 0.01*rwsp*eomult*100\n")
            fout.write("Number of Fertilizer applications (max=25) mappl is in total mg N applied to grid (1 kg/ha = 1 mg/m2/width of application) application divided by width of grid in cm is kg ha-1\n")
            fout.write(f'{fertCount: <14}\n')
            fout.write("mAppl is manure, lAppl is litter. Apply as mg/cm2 of slab same units as N\n")
            fout.write("tAppl(i)  AmtAppl(i) depth(i) lAppl_C(i) lAppl_N(i)  mAppl_C(i) mAppl_N(i)  (repeat these 3 lines for the number of fertilizer applications)\n")
            for j in range(len(date)):
                try:
                    fout.write(
                        f"'{date[j]}' "
                        f"{float(ammtT[j]): <14.6f}{float(fDepth[j]): <14.6f}"
                        f"{float(lammtC[j]): <14.6f}{float(lammtN[j]): <14.6f}"
                        f"{float(mammtC[j]): <14.6f}{float(mammtN[j]): <14.6f}\n"
                    )
                except ValueError as e:
                    print(f"Error formatting values: {e}. Check the input data.")
            if cropname == "cotton":
                fout.write("[PGR]\n")
                fout.write("Number of PGR applications; 0: No PGR\n")
                fout.write(f'{PGRCount: <14}\n')
                fout.write("pgrDate		Brand	Appl_Method	Band_Width Appl_Rate	Appl_Unit\n")
                for j in range(len(PGRDate)):
                    fout.write(f"'{PGRDate[j]}' '{PGRChem[j]}' '{PGRAppMeth[j]: <14}{PGRBandwidth[j]: <14.6f}{PGRAppRate[j]: <14.6f}{PGRAppUnit[j]: <14}\n")
            fout.write("[Residue]\n")
            fout.write("****Script for residue/mulch application module\n")
            fout.write("**** Residue amount can be thickness ('t') or mass ('m')   ***\n")
            fout.write("application  1 or 0, 1(yes) 0(no)\n")
            if not SurfResInfo:
                fout.write("0\n")
            else:
                SurfResAmt = SurfResInfo[0][5] if SurfResInfo[0][4] != 'Mass (kg/ha)' else SurfResInfo[0][5] / 1000
                fout.write("1\n")
                fout.write("tAppl_R (i)    't' or 'm'      Mass (gr/m2) or thickness (cm)    vertical layers\n")
                fout.write("---either thickness  or Mass\n")
                fout.write(f"'{SurfResInfo[0][2]}'  '{SurfResInfo[0][4][0].lower()}'  {SurfResAmt: <14.6f}       3\n")
            fout.write("[Tillage]\n")
            fout.write("1: Tillage, 0: No till\n")
            if TillageInfo[0][3] == "No tillage":
                fout.write("0\n")
            else:
                fout.write("1\n")
                fout.write("Till Date Till Depth (cm)\n")
                fout.write(f"'{TillageInfo[0][2]}'  {tillDepth: <14.6f}\n")
    except IOError:
        print("Could not open or write to file.")

    return surfResType  # irrType


def irrigationInfo(cropname, experiment, treatmentname,session):
    operationList = []
    IrrigationInfo = []

    exid = read_experimentDB_id(cropname, experiment,session)
    tid = read_treatmentDB_id(exid, treatmentname,session)
    operationList = read_operationsDB_id(tid,session)

    irrType = "No Irrigation"

    for ii, jj in enumerate(operationList):
        if jj[1] == "Irrigation":
            IrrigationInfo = readOpDetails(jj[0], jj[1],session)
            irrType = IrrigationInfo[0][3]
            print(IrrigationInfo)

    return irrType
