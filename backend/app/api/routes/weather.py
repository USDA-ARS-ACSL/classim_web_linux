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
from aiohttp import ClientSession

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
async def download(
    *,
    db: SessionDep,  # Rename from 'session' to 'db' to avoid collision
    current_user: CurrentUser,
    id: int,
    con: bool
) -> Any:
    """Download weather data for a station."""
    # Remove transaction context manager - FastAPI dependency injection already handles it
    station = db.query(WeatherMeta).filter(
        WeatherMeta.id == id,
        WeatherMeta.owner_id == current_user.id
    ).first()
    
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")

    stationType = str(station.stationtype)
    sitename = str(station.site)
    siteData = db.query(Site).filter(Site.sitename == sitename).first()

    if not siteData or not siteData.rlat or not siteData.rlon:
        raise HTTPException(status_code=400, detail="Site location data missing")

    # Construct URL and fetch data
    currentyear = datetime.now().year
    year = str(currentyear + 2)
    url = f"https://weather.covercrop-data.org/hourly?lat={siteData.rlat}&lon={siteData.rlon}&start=2018-1-1&end={year}-12-31&1attributes=air_temperature,relative_humidity,wind_speed,shortwave_radiation,precipitation&output=csv&options=predicted"
    
    # Add timeout to prevent hanging on slow external API
    try:
        # Use aiohttp for async requests - rename ClientSession variable to avoid collision
        headers = {'User-Agent': 'Mozilla/5.0'}
        async with ClientSession() as http_session:  # Renamed to http_session
            async with http_session.get(url, headers=headers, timeout=30) as response:
                if response.status != 200:
                    return {"error": f"API returned status {response.status}"}
                content = await response.read()
                data = pd.read_csv(BytesIO(content))
    except Exception as e:
        logger.error(f"Failed to fetch weather data: {e}")
        return {"error": "Website has reported an error. Please try again later."}

    # Process data with vectorized operations
    processed_data = process_weather_data(data, stationType, id)
    
    # Check date range
    dateList = processed_data['date']
    minDate = min(dateList)
    maxDate = max(dateList)
    
    # Check if data exists
    data_exists = check_existing_data(db, id, minDate, maxDate)
    
    if data_exists and not con:
        return {"message": "data existed"}
    
    # Delete existing data if replacing
    if data_exists:
        delete_weather_data(db, stationType, minDate, maxDate)
    
    # Insert new data efficiently
    columns_to_keep = ['stationtype', 'weather_id', 'jday', 'date', 'hour', 'srad', 'wind', 'rh', 'rain', 'tmax', 'tmin', 'temperature', 'co2']
    final_data = processed_data[columns_to_keep]
    row_count = bulk_insert_weather_data(db, final_data)
    
    return {"message": f"Number of rows ingested into database: {row_count}"}
    
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

    stmt = select(Treatment.name, Experiment.name).join(Experiment, Experiment.exid == Treatment.t_exid).filter(Experiment.crop == crop, Treatment.owner_id == current_user.id)

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

def check_existing_data(session, weather_id, min_date, max_date):
    # More efficient count query with exists
    exists_query = select(1).where(
        WeatherData.weather_id == weather_id,
        WeatherData.date > min_date,
        WeatherData.date < max_date
    ).exists()
    
    return session.query(exists_query).scalar()

# Vectorized operations instead of row-by-row processing
def process_weather_data(data, station_type, weather_id):
    # Convert dates once using vectorized operations
    date_objects = pd.to_datetime(data['date'])
    data['jday'] = date_objects.dt.strftime('%j')
    data['hour'] = date_objects.dt.strftime('%H')
    data['date'] = date_objects.dt.strftime('%Y-%m-%d')
    
    # Rename columns with a single operation
    data.rename(columns={
        "air_temperature": "temperature", 
        "relative_humidity": "rh", 
        "wind_speed": "wind", 
        "shortwave_radiation": "srad", 
        "precipitation": "rain"
    }, inplace=True)
    
    # Apply calculations with vectorized operations
    data['srad'] = data['srad'] * 3600 / 1000000
    data['rh'] = data['rh'] * 100
    
    # Add station columns
    data['stationtype'] = station_type
    data['weather_id'] = weather_id
    
    # Fill missing columns with default values
    for col in ['tmax', 'tmin', 'co2']:
        if col not in data.columns:
            data[col] = 0.00
            
    return data

def bulk_insert_weather_data(session, data):
    # Convert DataFrame directly to list of dicts - more efficient than row iteration
    records = data.to_dict(orient='records')
    
    # Filter out invalid records
    valid_records = [
        record for record in records 
        if not any(pd.isna(record[col]) for col in ['jday', 'hour', 'srad', 'wind', 'rh', 'rain', 'tmax', 'tmin', 'temperature', 'co2'])
    ]
    
    # Use chunking for very large datasets to avoid memory issues
    chunk_size = 5000
    for i in range(0, len(valid_records), chunk_size):
        chunk = valid_records[i:i+chunk_size]
        session.bulk_insert_mappings(WeatherData, chunk)
        session.flush()  # Flush but don't commit until all chunks are processed
        
    session.commit()
    return len(valid_records)