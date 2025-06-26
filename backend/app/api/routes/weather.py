from typing import Any, List
import requests
import pandas as pd
import logging
from datetime import datetime
from fastapi import APIRouter, HTTPException
from sqlmodel import func, select
from io import BytesIO
import ssl
ssl._create_default_https_context = ssl._create_unverified_context
from app.api.deps import SessionDep, CurrentUser
from app.models import WeatherDatasPublic, WeatherDataPublic, WeatherMeta, WeatherMetasPublic, WeatherMetaPublic, WeatherCreate, WeatherMetaBase, WeatherMetaCreate, WeatherUpdate, Message, WeatherMetaUpdate, WeatherData, SitesPublic, Site, Treatment, Experiment, Operation
from dateutil import parser

# Create an instance of the FastAPI class
router = APIRouter()

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define a route using a decorator and the HTTP method
@router.get("/", response_model=WeatherMetasPublic)
def read_stations(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    if current_user.is_superuser:
        count_statement = select(func.count()).select_from(WeatherMeta)
        count = session.exec(count_statement).one()
        statement = select(WeatherMeta).offset(skip).limit(limit)
        stations = session.exec(statement).all()
    else:
        count_statement = (
            select(func.count())
            .select_from(WeatherMeta)
            .where(WeatherMeta.owner_id == current_user.id)
        )
        count = session.exec(count_statement).one()
        statement = (
            select(WeatherMeta)
            .where(WeatherMeta.owner_id == current_user.id)
            .offset(skip)
            .limit(limit)
        )
        stations = session.exec(statement).all()        
    return WeatherMetasPublic(data=stations, count=count)


@router.get("/{stationid}", response_model=WeatherMetasPublic)
def read_station(
    session: SessionDep, skip: int = 0, limit: int = 100, stationid=int
) -> Any:
    """
    Retrieve station.
    """
    stationid = int(stationid)
    count_statement = select(func.count()).select_from(WeatherMeta).filter(WeatherMeta.id == stationid)    
    count = session.exec(count_statement).one()
    statement = select(WeatherMeta).filter(WeatherMeta.id == stationid)
    stations = session.exec(statement).all()
    return WeatherMetasPublic(data=stations, count=count)

@router.post("/", response_model=WeatherMetaPublic)
def create_station(
    *, session: SessionDep, current_user: CurrentUser, station_in: WeatherMetaCreate
) -> Any:
    """
    Create new station.
    """
    station = WeatherMeta.model_validate(station_in, update={"owner_id": current_user.id})
    session.add(station)
    session.commit()
    session.refresh(station)
    return station

@router.delete("/{id}")
def delete_station(session: SessionDep, current_user: CurrentUser, id: int) -> Message:
    """
    Delete a station and its weather data.
    """
    station = session.get(WeatherMeta, id)
    if not station:
        raise HTTPException(status_code=404, detail="station not found")
    if not current_user.is_superuser and (station.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    # Delete all weather data with this weather_id
    session.query(WeatherData).filter(WeatherData.weather_id == id).delete()
    session.delete(station)
    session.commit()
    return Message(message="station and related weather data deleted successfully")

@router.put("/{id}", response_model=WeatherMetaPublic)
def update_station(
    *, session: SessionDep, current_user: CurrentUser, id: int, station_in: WeatherMetaUpdate
) -> Any:
    """
    Update an station.
    """
    station = session.get(WeatherMeta, id)
    if not station:
        raise HTTPException(status_code=404, detail="station not found")
    if not current_user.is_superuser and (station.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    update_dict = station_in.model_dump(exclude_unset=True)
    station.sqlmodel_update(update_dict)
    session.add(station)
    session.commit()
    session.refresh(station)
    return station

@router.get("/data/{stationType}")
def read_station_data(
    session: SessionDep,current_user: CurrentUser, stationType=str
    
) -> Any:
    """
    Retrieve station.
    """
    query = session.query(WeatherMeta).filter(
        WeatherMeta.stationtype == stationType,
        WeatherMeta.owner_id == current_user.id
    ).first()
    print(query)
    weather_data_query = session.query(WeatherData).filter(WeatherData.weather_id == query.id)
    df_weatherdata = pd.read_sql(weather_data_query.statement, session.bind)
    
    weatherSummary = stationType + " Data Availability Report"
    if df_weatherdata.empty:
        weatherSummary += "<br>No data available.<br>"
        return {"summary": weatherSummary, "data": None}

    df_weatherdata['date'] = pd.to_datetime(df_weatherdata['date']).dt.date
    df_weatherdata = df_weatherdata.sort_values(by='date')
    nan_value = float("NaN")
    df_weatherdata.replace("", nan_value, inplace=True)
    df_weatherdata = df_weatherdata.groupby('weather_id').agg({
        'date': ['min', 'max'], 
        'srad': ['min', 'max'], 
        'wind': ['min', 'max'],
        'rh': ['min', 'max'], 
        'rain': ['min', 'max'], 
        'tmax': ['min', 'max'],
        'tmin': ['min', 'max'], 
        'temperature': ['min', 'max']
    }).reset_index()
    df_weatherdata.columns = ['_'.join(col).strip() if col[1] else col[0] for col in df_weatherdata.columns.values]
    # return WeatherDatasPublic(data=df_weatherdata.iloc[0].to_dict(), count=1)
    return {"summary": weatherSummary, "data": df_weatherdata.iloc[0].to_dict()}

@router.post("/data", response_model=List[WeatherDataPublic])
def create_station_table(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    stations_in: List[WeatherCreate]
) -> Any:
    """
    Create new stations.
    """
    
    stations = []
    for station_in in stations_in:
        # Create a new instance of WeatherDataPublic with the provided data and owner_id
        station_data = WeatherCreate(
            stationtype=station_in.stationtype,
            weather_id=station_in.weather_id,
            jday=station_in.jday,
            date=parser.parse(station_in.date).strftime('%Y-%m-%d'),
            hour=station_in.hour,
            srad=station_in.srad,
            wind=station_in.wind,
            rh=station_in.rh,
            rain=station_in.rain,
            tmax=station_in.tmax,
            tmin=station_in.tmin,
            temperature=station_in.temperature,
            co2=station_in.co2,
            # owner_id=current_user.id
        )
        session.add(station_data)
        session.commit()
        session.refresh(station_data)
        stations.append(station_data)
    
    return stations


@router.get("/download/{id}/{con}")
def download(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
    con: bool
) -> Any:
    """
    Create new station.
    """
    station = session.get(WeatherMeta, id)
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")

    stationType = str(station.stationtype) if station else None
    sitename = str(station.site) if station else None
    siteData = session.query(Site).filter(Site.sitename == sitename).first()

    rlat = str(siteData.rlat) if siteData else None
    rlon = str(siteData.rlon) if siteData else None

    if rlat is not None and rlon is not None:
        logger.info(f"Retrieved station with rlat: {rlat}, rlon: {rlon}")
    currentyear = datetime.now().year
    year = str(currentyear + 2)
    url = f"https://weather.covercrop-data.org/hourly?lat={rlat}&lon={rlon}&start=2018-1-1&end={year}-12-31&1attributes=air_temperature,relative_humidity,wind_speed,shortwave_radiation,precipitation&output=csv&options=predicted"
    try:
        # Use pandas to read CSV directly from the URL with custom User-Agent
        data = pd.read_csv(
            url,
            storage_options={'User-Agent': 'Mozilla/5.0'}
        )
        print(data)
    except Exception as e:
        logger.error(f"Failed to fetch or parse weather data: {e}")
        return {"error": "Website has reported an error. Please, try again later."}

    logger.info(f"Retrieved station data: {data}")
    
    data['jday'] = pd.to_datetime(data['date']).dt.strftime('%j')
    data['hour'] = pd.to_datetime(data['date']).dt.strftime('%H')
    data['date'] = pd.to_datetime(data['date']).dt.strftime('%Y-%m-%d')
    data.rename(columns={"air_temperature": "temperature", "relative_humidity": "rh", "wind_speed": "wind", "shortwave_radiation": "srad", "precipitation": "rain"}, inplace=True)
    
    # Convert solar radiation
    data['srad'] = data['srad'] * 3600 / 1000000
    # Convert rh to percentage
    data['rh'] = data['rh'] * 100
    
    dateList = data['date']
    minDate = min(dateList)
    maxDate = max(dateList)
    
    count_statement = session.query(func.count()).filter(
        WeatherData.stationtype == stationType,
        WeatherData.date > minDate,
        WeatherData.date < maxDate
    )

    count = session.execute(count_statement).scalar()
    count = int(count) if count is not None else 0
    
    if count > 0 and not con:
        return {"message": "data existed"}
    else:
        # Delete existing data
        delete_weather_data(session, station_type=stationType, mindate=minDate, maxdate=maxDate)
        
        dbColumns = ['weather_id', 'jday', 'date', 'hour', 'srad', 'wind', 'rh', 'rain', 'tmax', 'tmin', 'temperature', 'co2']
        data['stationtype'] = stationType
        data['weather_id'] = id

        for col in dbColumns:
            if col not in data.columns:
                data[col] = 0.00

        data = data[['stationtype', 'weather_id', 'jday', 'date', 'hour', 'srad', 'wind', 'rh', 'rain', 'tmax', 'tmin', 'temperature', 'co2']]
        numRec = data.shape[0]
        
        try:
            # Prepare a list of dicts for bulk insert
            weather_data_dicts = []
            for _, row in data.iterrows():
                if any(row[['jday', 'hour', 'srad', 'wind', 'rh', 'rain', 'tmax', 'tmin', 'temperature', 'co2']] == ""):
                    continue
                weather_data_dicts.append({
                    "stationtype": str(row['stationtype']),
                    "weather_id": id,
                    "jday": float(row['jday']),
                    "date": str(row['date']),
                    "hour": float(row['hour']),
                    "srad": float(row['srad']),
                    "wind": float(row['wind']),
                    "rh": float(row['rh']),
                    "rain": float(row['rain']),
                    "tmax": float(row['tmax']),
                    "tmin": float(row['tmin']),
                    "temperature": float(row['temperature']),
                    "co2": float(row['co2'])
                })
            if weather_data_dicts:
                session.bulk_insert_mappings(WeatherData, weather_data_dicts)
                session.commit()
        finally:
            session.close()

        recMessage = f"Number of rows ingested into database: {numRec}"
        return {"message": recMessage}
    
def delete_weather_data(session: SessionDep, station_type: str, mindate: datetime, maxdate: datetime):
    """
    Retrieve weather data for a specific station type between the given dates.
    """
    session.query(WeatherData).filter(
        WeatherData.stationtype == station_type,
        WeatherData.date > mindate,
        WeatherData.date < maxdate
    ).delete()
    session.commit()


@router.get("/getStationsBySite/{site}", response_model=WeatherMetasPublic)
def getStationsBySite(
    session: SessionDep, site : str, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    
    count_statement = select(func.count()).select_from(WeatherMeta).where(WeatherMeta.site == site)
    count = session.exec(count_statement).one()
    statement = (
        select(WeatherMeta)
        .where(WeatherMeta.site == site)
        .offset(skip)
        .limit(limit)
    )
    stations = session.exec(statement).all()        
    return WeatherMetasPublic(data=stations, count=count)

@router.get("/getTreatmentsByCrop/{crop}")
def get_treatments(
    session: SessionDep, 
    current_user: CurrentUser, 
    crop: str, 
    skip: int = 0, 
    limit: int = 100
) -> Any:
    
    stmt = select(Treatment.name, Experiment.name).join(Experiment, Experiment.exid == Treatment.t_exid).filter(Experiment.crop == crop)
    
    result = session.execute(stmt).fetchall()

    # Transforming the result into a list of dictionaries for better structure
    formatted_result = [
        # {"treatment_name": row[0], "experiment_name": row[1]} 
        {"t_experiment_name": f"{ row[1] }/{row[0]}"}
        for row in result
    ]
    
    return formatted_result

@router.get("/getDatesByExpTreatment/{experiment}/{treatment}")
def get_dates_by_treatments(
    db: SessionDep, 
    current_user: CurrentUser, 
    experiment: str, 
    treatment: str,
    skip: int = 0, 
    limit: int = 100
) -> Any:
    stmt = (
        select(Operation.odate)
        .join(Treatment, Treatment.tid == Operation.o_t_exid)
        .join(Experiment, Experiment.exid == Treatment.t_exid)
        .where(
            (Experiment.name == experiment) &
            (Treatment.name == treatment)
        )
        .distinct()
        .order_by(Operation.odate)
    )

    # Execute the query
    result = db.execute(stmt).scalars().all()

    # Process results
    rlist = []
    for op in result:
        if op:
            try:
                # Adjust format to match "yyyy-mm-dd"
                date_obj = datetime.strptime(op, "%m/%d/%Y")
                rlist.append(date_obj.year)
            except ValueError:
                # Handle the case where the date string is not in the expected format
                continue

    unique_years = sorted(set(rlist))

    # Check if there's only one unique year and duplicate it
    if len(unique_years) == 1:
        unique_years.append(unique_years[0])

    temp_variance_options = [str(temp) for temp in range(-10, 11)]
    default_temp = "0"

    # Rain Variance Options
    rain_variance_options = [str(rain) for rain in range(-100, 105, 5)]
    default_rain = "0"

    # CO2 Variance Options
    co2_variance_options = ["None"] + [str(co2) for co2 in range(280, 1010, 10)]
    default_co2 = "None"

    response = {
        "start_year": unique_years[0] if unique_years else None,
        "end_year": unique_years[-1] if unique_years else None,
        "years": unique_years,
        "temperature_variance": {
            "options": temp_variance_options,
            "default": default_temp
        },
        "rain_variance": {
            "options": rain_variance_options,
            "default": default_rain
        },
        "co2_variance": {
            "options": co2_variance_options,
            "default": default_co2
        },
    }

    return response