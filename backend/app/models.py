from sqlmodel import Field, Relationship, SQLModel
from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime, timezone
from enum import Enum

class GuestType(str, Enum):
    ANONYMOUS = "anonymous"
    EMAIL = "email"

# Shared properties
# TODO replace email str with EmailStr when sqlmodel supports it
class UserBase(SQLModel):
    email: str | None = Field(default=None, index=True)  # Remove unique=True constraint
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = None


# Properties to receive via API on creation (OIDC)
class UserCreateOIDC(SQLModel):
    email: str
    full_name: str | None = None
    oidc_sub: str


# Properties to receive via API on update, all are optional
# TODO replace email str with EmailStr when sqlmodel supports it
class UserUpdate(UserBase):
    email: str | None = None  # type: ignore
    full_name: str | None = None



class UserUpdateMe(SQLModel):
    full_name: str | None = None
    email: str | None = None


# Database model, database table inferred from class name
# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    oidc_sub: str | None = Field(default=None, unique=True, index=True)  # Make nullable for guests
    
    # Guest-specific fields
    is_guest: bool = Field(default=False)
    guest_session_id: str | None = Field(default=None, unique=True, index=True)
    guest_email: str | None = Field(default=None)  # Separate field for guest email
    guest_type: GuestType | None = Field(default=None)  # "anonymous" or "email"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: datetime | None = Field(default=None)
    
    # Relationships (keep existing ones)
    items: list["Item"] = Relationship(back_populates="owner")
    sites: list["Site"] = Relationship(back_populates="owner")
    soils: list["Soil"] = Relationship(back_populates="owner")
    stations: list["WeatherMeta"] = Relationship(back_populates="owner")
    guest_reports: list["GuestReport"] = Relationship(back_populates="guest_user")


class GuestReport(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    guest_user_id: int = Field(foreign_key="user.id")
    report_type: str
    report_data: str  # JSON string of report data
    email_sent: bool = Field(default=False)
    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    email_sent_at: datetime | None = Field(default=None)  # This one stays as-is
    
    # Relationship
    guest_user: User | None = Relationship(back_populates="guest_reports")



# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: int


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


# Shared properties
class ItemBase(SQLModel):
    title: str
    description: str | None = None


# Properties to receive on item creation
class ItemCreate(ItemBase):
    title: str


# Properties to receive on item update
class ItemUpdate(ItemBase):
    title: str | None = None  # type: ignore


# Database model, database table inferred from class name
class Item(ItemBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    
    title: str
    owner_id: int | None = Field(default=None, foreign_key="user.id", nullable=False)
    owner: User | None = Relationship(back_populates="items")


# Properties to return via API, id is always required
class ItemPublic(ItemBase):
    id: int
    owner_id: int


class ItemsPublic(SQLModel):
    data: list[ItemPublic]
    count: int


# Generic message
class Message(SQLModel):
    message: str

class DownloadMessage(SQLModel):
    message: str
    error: str
    
# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: int | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str


####### FAQ Models Begin#########
# Shared properties
class FaqBase(SQLModel):
    tabname: str | None = None
    question: str | None = None
    answer: str | None = None


# Properties to receive on item creation
class FaqCreate(FaqBase):
    tabname: str
    question: str
    answer: str


# Properties to receive on item update
class FaqUpdate(FaqBase):
    tabname: str | None = None  # type: ignore
    question: str | None = None  # type: ignore
    answer: str | None = None  # type: ignore


# Database model, database table inferred from class name
class Faq(FaqBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    tabname: str | None = None  # type: ignore



# Properties to return via API, id is always required
class FaqPublic(FaqBase):
    id: int | None = None  # type: ignore
    tabname: str
    question: str
    answer: str


class FaqsPublic(SQLModel):
    data: list[FaqPublic]
    count: int
####### FAQ model End############

####### Site Models Begin#########
# Shared properties
class SiteBase(SQLModel):
    sitename: str | None = None
    rlat: float | None = None
    rlon: float | None = None
    altitude: float | None = None


# Properties to receive on item creation
class SiteCreate(SiteBase):
    sitename: str
    rlat: float
    rlon: float
    altitude: float


# Properties to receive on item update
class SiteUpdate(SiteBase):
    sitename: str | None = None  # type: ignore
    rlat: float | None = None  # type: ignore
    rlon: float | None = None  # type: ignore
    altitude: float | None = None  # type: ignore


# Database model, database table inferred from class name
class Site(SiteBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    sitename: str | None = None  # type: ignore
    owner_id: int | None = Field(default=None, foreign_key="user.id", nullable=False)
    owner: User | None = Relationship(back_populates="sites")
    



# Properties to return via API, id is always required
class SitePublic(SiteBase):
    id: int | None = None  # type: ignore
    owner_id: int


class SitesPublic(SQLModel):
    data: list[SitePublic]
    count: int
####### Site model End############

####### Soil tbl model Begin############
class SoilBase(SQLModel):
    soilname: str | None = None
    site_id: int | None = None
    o_gridratio_id: int | None = None


# Properties to receive on item creation
class SoilCreate(SoilBase):
    soilname: str
    site_id: int
    o_gridratio_id: int


# Properties to receive on item update
class SoilUpdate(SoilBase):
    soilname: str | None = None  # type: ignore
    site_id: float | None = None  # type: ignore
    o_gridratio_id: float | None = None  # type: ignore


# Database model, database table inferred from class name
class Soil(SoilBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    soilname: str | None = None  # type: ignore
    owner_id: int | None = Field(default=None, foreign_key="user.id", nullable=False)
    owner: User | None = Relationship(back_populates="soils")
    



# Properties to return via API, id is always required
class SoilPublic(SoilBase):
    id: int | None = None  # type: ignore
    owner_id: int


class SoilsPublic(SQLModel):
    data: list[SoilPublic]
    count: int

class SoilProfile(BaseModel):
    lat: float
    long: float
####### Soil tbl model End############


class SoilLongBase(SQLModel):
    __tablename__ = 'soil_long'      
    o_sid: int
    initType: int | None
    Bottom_depth: float | None
    OM_pct: float | None
    NO3: float | None
    NH4: float | None
    HnNew: float | None
    Tmpr: float | None
    Sand: float | None
    Silt: float | None
    Clay: float | None
    TH33: float | None
    TH1500: float | None
    kh: float | None
    kl: float | None
    km: float | None
    kn: float | None
    kd: float | None
    fe: float | None
    fh: float | None
    r0: float | None
    rL: float | None
    rm: float | None
    fa: float | None
    nq: float | None
    cs: float | None
    thr: float | None
    ths: float | None
    tha: float | None
    th: float | None
    Alfa: float | None
    n: float | None
    Ks: float | None
    Kk: float | None
    thk: float | None
    BD: float | None
    CO2: float | None
    O2: float | None
    N2O: float | None


# Properties to receive on item creation
class SoilLongCreate(SoilLongBase): 
    __tablename__ = 'soil_long'  
    o_sid: int
    initType: int | None
    Bottom_depth: float | None
    OM_pct: float | None
    NO3: float | None
    NH4: float | None
    HnNew: float | None
    Tmpr: float | None
    Sand: float | None
    Silt: float | None
    Clay: float | None
    TH33: float | None
    TH1500: float | None
    kh: float | None
    kl: float | None
    km: float | None
    kn: float | None
    kd: float | None
    fe: float | None
    fh: float | None
    r0: float | None
    rL: float | None
    rm: float | None
    fa: float | None
    nq: float | None
    cs: float | None
    thr: float | None
    ths: float | None
    tha: float | None
    Alfa: float | None
    n: float | None
    Ks: float | None
    th: float | None
    Kk: float | None
    thk: float | None
    BD: float | None
    CO2: float | None
    O2: float | None
    N2O: float | None

# Properties to receive on item update
class SoilLongUpdate(SoilLongBase):
    __tablename__ = 'soil_long'      
    o_sid: int
    initType: int | None
    Bottom_depth: float | None
    OM_pct: float | None
    NO3: float | None
    NH4: float | None
    HnNew: float | None
    Tmpr: float | None
    Sand: float | None
    Silt: float | None
    Clay: float | None
    TH33: float | None
    TH1500: float | None
    kh: float | None
    kl: float | None
    km: float | None
    kn: float | None
    kd: float | None
    fe: float | None
    fh: float | None
    r0: float | None
    rL: float | None
    rm: float | None
    fa: float | None
    nq: float | None
    cs: float | None
    thr: float | None
    ths: float | None
    tha: float | None
    Alfa: float | None
    n: float | None
    th: float | None
    Ks: float | None
    Kk: float | None
    thk: float | None
    BD: float | None
    CO2: float | None
    O2: float | None
    N2O: float | None


# Database model, database table inferred from class name
class SoilLong(SoilLongBase, table=True):
    __tablename__ = 'soil_long'  
    id: float | None = Field(default=None, primary_key=True)    
    o_sid: int
    initType: float | None
    Bottom_depth: float | None
    OM_pct: float | None
    NO3: float | None
    NH4: float | None
    HnNew: float | None
    Tmpr: float | None
    Sand: float | None
    Silt: float | None
    Clay: float | None
    TH33: float | None
    TH1500: float | None
    kh: float | None
    kl: float | None
    km: float | None
    kn: float | None
    kd: float | None
    fe: float | None
    fh: float | None
    r0: float | None
    rL: float | None
    rm: float | None
    fa: float | None
    nq: float | None
    cs: float | None
    thr: float | None
    ths: float | None
    th: float | None
    tha: float | None
    Alfa: float | None
    n: float | None
    Ks: float | None
    Kk: float | None
    thk: float | None
    BD: float | None
    CO2: float | None
    O2: float | None
    N2O: float | None
    



# Properties to return via API, id is always required
class SoilLongPublic(SoilLongBase):
    __tablename__ = 'soil_long'  
    id: int
    o_sid: int
    initType: float | None
    Bottom_depth: float | None
    OM_pct: float | None
    NO3: float | None
    NH4: float | None
    HnNew: float | None
    Tmpr: float | None
    Sand: float | None
    Silt: float | None
    Clay: float | None
    TH33: float | None
    TH1500: float | None
    kh: float | None
    kl: float | None
    km: float | None
    kn: float | None
    kd: float | None
    fe: float | None
    fh: float | None
    r0: float | None
    rL: float | None
    rm: float | None
    fa: float | None
    th: float | None
    nq: float | None
    cs: float | None
    thr: float | None
    ths: float | None
    tha: float | None
    Alfa: float | None
    n: float | None
    Ks: float | None
    Kk: float | None
    thk: float | None
    BD: float | None
    CO2: float | None
    O2: float | None
    N2O: float | None


class SoilsLongPublic(SQLModel):
    data: list[SoilLongPublic]
    count: int

####### Soil tbl model End############


# GridRatio start

class GridRatioBase(SQLModel):  
  gridratio_id: int | None = None
  SR1: float | None = None
  SR2: float | None = None
  IR1: float | None = None
  IR2: float | None = None
  PlantingDepth: float | None = None
  XLimitRoot: float | None = None
  BottomBC: int | None = None
  GasBCTop: int | None = None
  GasBCBottom: int | None = None

# Properties to receive on item creation
class GridRatioCreate(GridRatioBase):
    gridratio_id: int | None = None
    SR1: float | None = None
    SR2: float | None = None
    IR1: float | None = None
    IR2: float | None = None
    PlantingDepth: float | None = None
    XLimitRoot: float | None = None
    BottomBC: int | None = None
    GasBCTop: int | None = None
    GasBCBottom: int | None = None
    
class GridRatio(GridRatioBase, table=True):
    gridratio_id: int | None = Field(default=None, primary_key=True)
    SR1: float | None = None
    SR2: float | None = None
    IR1: float | None = None
    IR2: float | None = None
    PlantingDepth: float | None = None
    XLimitRoot: float | None = None
    BottomBC: int | None = None
    GasBCTop: int | None = None
    GasBCBottom: int | None = None
    
class GridRatioUpdate(GridRatioBase):
    gridratio_id: int | None = None
    SR1: float | None = None
    SR2: float | None = None
    IR1: float | None = None
    IR2: float | None = None
    PlantingDepth: float | None = None
    XLimitRoot: float | None = None
    BottomBC: int | None = None
    GasBCTop: int | None = None
    GasBCBottom: int | None = None
    
class GridRatioPublic(GridRatioBase):
    gridratio_id: int | None = None
    SR1: float | None = None
    SR2: float | None = None
    IR1: float | None = None
    IR2: float | None = None
    PlantingDepth: float | None = None
    XLimitRoot: float | None = None
    BottomBC: int | None = None
    GasBCTop: int | None = None
    GasBCBottom: int | None = None
    
class GridRatiosPublic(SQLModel):
    data: list[GridRatioPublic]
    count: int
###################Biology Data##################


class BiologyDefaultBase(SQLModel):
    id: int | None = None
    dthH: float | None = None
    dthL: float | None = None
    es: float | None = None
    Th_m: float | None = None
    tb: float | None = None
    QT: float | None = None
    dThD: float | None = None
    Th_d: float | None = None
    
class BiologyDefaultCreate(BiologyDefaultBase):
    id: int | None = None
    dthH: float | None = None
    dthL: float | None = None
    es: float | None = None
    Th_m: float | None = None
    tb: float | None = None
    QT: float | None = None
    dThD: float | None = None
    Th_d: float | None = None

class BiologyDefault(BiologyDefaultBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    dthH: float | None = None
    dthL: float | None = None
    es: float | None = None
    Th_m: float | None = None
    tb: float | None = None
    QT: float | None = None
    dThD: float | None = None
    Th_d: float | None = None
    
    
#############End Biology
    
class BiologyDefault(BiologyDefaultBase, table=True):
    __tablename__ = "biologydefault"
    id = Column(Integer, primary_key=True, autoincrement=True)
    dthH = Column(Float)
    dthL = Column(Float)
    es = Column(Float)
    Th_m = Column(Float)
    tb = Column(Float)
    QT = Column(Float)
    dThD = Column(Float)
    Th_d = Column(Float)  

######### Weather tab model Start ##############

######### Weather tab model End ##############
class WeatherMetaBase(SQLModel):
    __tablename__ = 'weather_meta'  
    id: int | None = None
    owner_id: int | None = None
    stationtype: str | None = None
    site: str | None = None
    Bsolar: float | None = None
    Btemp: int | None = None
    Atemp: int | None = None
    BWInd: int | None = None
    BIR: int | None = None
    AvgWind: float | None = None
    AvgRainRate: float | None = None
    ChemCOnc: float | None = None
    AvgCO2: float | None = None


class WeatherMeta(WeatherMetaBase, table=True):
    __tablename__ = 'weather_meta'
    id: int | None = Field(default=None, primary_key=True)
    stationtype: str | None = None  # type: ignore
    owner_id: int | None = Field(default=None, foreign_key="user.id", nullable=False)
    owner: User | None = Relationship(back_populates="stations")

class WeatherMetaPublic(WeatherMetaBase):
    id: int | None = None
    owner_id: int | None = None
    stationtype: str | None = None
    site: str | None = None
    Bsolar: float | None = None
    Btemp: int | None = None
    Atemp: int | None = None
    BWInd: int | None = None
    BIR: int | None = None
    AvgWind: float | None = None
    AvgRainRate: float | None = None
    ChemCOnc: float | None = None
    AvgCO2: float | None = None


class WeatherMetasPublic(SQLModel):
    data: list[WeatherMetaPublic]
    count: int

class WeatherMetaCreate(WeatherMetaBase):
    id: int | None = None
    stationtype: str | None = None
    site: str | None = None
    Bsolar: float | None = None
    Btemp: int | None = None
    Atemp: int | None = None
    BWInd: int | None = None
    BIR: int | None = None
    AvgWind: float | None = None
    AvgRainRate: float | None = None
    ChemCOnc: float | None = None
    AvgCO2: float | None = None

class WeatherMetaUpdate(WeatherMetaBase):
    id: int | None = None
    stationtype: str | None = None
    site: str | None = None
    Bsolar: float | None = None
    Btemp: int | None = None
    Atemp: int | None = None
    BWInd: int | None = None
    BIR: int | None = None
    AvgWind: float | None = None
    AvgRainRate: float | None = None
    ChemCOnc: float | None = None
    AvgCO2: float | None = None

######### Weather Meta tab model Start ##############

class WeatherBase(SQLModel):
    id: int | None = Field(default=None, primary_key=True)
    stationtype: str | None = None
    weather_id: str | None = None
    jday: float | None = None
    date: str | None = None
    hour: float | None = None
    srad: float | None = None
    wind: float | None = None
    rh: float | None = None
    rain: float | None = None
    tmax: float | None = None
    tmin: float | None = None
    temperature: float | None = None
    co2: float | None = None

class WeatherCreate(WeatherBase, table=True):
    __tablename__ = 'weather_data'
    id: int | None = Field(default=None, primary_key=True)
    stationtype: str | None = None
    weather_id: str | None = None
    jday: float | None = None
    date: str | None = None
    hour: float | None = None
    srad: float | None = None
    wind: float | None = None
    rh: float | None = None
    rain: float | None = None
    tmax: float | None = None
    tmin: float | None = None
    temperature: float | None = None
    co2: float | None = None

class WeatherUpdate(WeatherBase):
    stationtype: str | None = None
    weather_id: str | None = None
    jday: float | None = None
    date: str | None = None
    hour: float | None = None
    srad: float | None = None
    wind: float | None = None
    rh: float | None = None
    rain: float | None = None
    tmax: float | None = None
    tmin: float | None = None
    temperature: float | None = None
    co2: float | None = None

class WeatherData(WeatherBase, table=True):
    __tablename__ = 'weather_data'
    __table_args__ = {'extend_existing': True}
    id: int | None = Field(default=None, primary_key=True)
    stationtype: str | None = None
    weather_id: str | None = None
    jday: float | None = None
    date: str | None = None
    hour: float | None = None
    srad: float | None = None
    wind: float | None = None
    rh: float | None = None
    rain: float | None = None
    tmax: float | None = None
    tmin: float | None = None
    temperature: float | None = None
    co2: float | None = None

class WeatherDataPublic(WeatherBase):
    id: int | None = Field(default=None, primary_key=True)
    stationtype: str | None = None
    weather_id: str | None = None
    jday: float | None = None
    date: str | None = None
    hour: float | None = None
    srad: float | None = None
    wind: float | None = None
    rh: float | None = None
    rain: float | None = None
    tmax: float | None = None
    tmin: float | None = None
    temperature: float | None = None
    co2: float | None = None
    
class WeatherDatasPublic(SQLModel):
    data: list[WeatherDataPublic]
    count: int

######### Weather tab model End ############## 



class CropsMetaBase(SQLModel):
    __tablename__ = 'crops'  
    id: int | None = None
    cropname: str | None = None
class CropsMeta(CropsMetaBase, table=True):
    __tablename__ = 'crops'
    id: int | None = Field(default=None, primary_key=True)
    cropname: str | None = None  # type: ignore   

class CropsMetaPublic(CropsMetaBase):
    id: int | None = None
    cropname: str | None = None

class CropsMetasPublic(SQLModel):
    data: list[CropsMetaPublic]
    count: int
    
class ExperimentBase(SQLModel):
    __tablename__ = 'experiment'
    exid: int | None = Field(default=None, primary_key=True)
    name: str | None = None
    crop: str | None = None
    owner_id: int | None = Field(default=None, foreign_key="user.id", nullable=False)
    
class ExperimentCreate(ExperimentBase, table=True): 
    __tablename__ = 'experiment'   
    __table_args__ = {'extend_existing': True}
    exid: int | None = Field(default=None, primary_key=True)
    name: str | None = None
    crop: str | None = None
    owner_id: int | None = Field(default=None, foreign_key="user.id", nullable=False)
    
class ExperimentPublic(ExperimentBase):    
    exid: int | None = Field(default=None, primary_key=True)
    name: str | None = None
    crop: str | None = None
    
class Experiment(ExperimentBase, table=True):  
    __tablename__ = 'experiment'  
    __table_args__ = {'extend_existing': True}
    exid: int | None = Field(default=None, primary_key=True)
    name: str | None = None
    crop: str | None = None
    
class ExperimentsPublic(SQLModel):
    data: list[ExperimentPublic]
    count: int
    

class TreatmentBase(SQLModel):
    __tablename__ = 'treatment'
    tid: int | None = Field(default=None, primary_key=True)
    # t_exid: int | None = None
    name: str | None = None    
    
class Treatment(TreatmentBase, table=True):  
    __tablename__ = 'treatment'  
    __table_args__ = {'extend_existing': True}
    tid: int | None = Field(default=None, primary_key=True)
    t_exid: int | None = None
    name: str | None = None
    owner_id: int | None = Field(default=None, foreign_key="user.id", nullable=False)
    
class TreatmentCreate(TreatmentBase, table=True): 
    __tablename__ = 'treatment'  
    __table_args__ = {'extend_existing': True}
    tid: int | None = Field(default=None, primary_key=True)
    t_exid: int | None = None
    name: str | None = None
    crop: str | None = None
    expname: str | None = None
    owner_id: int | None = Field(default=None, foreign_key="user.id", nullable=False)

class TreatmentCopy(BaseModel):
    treatmentname: str
    experimentname: str
    cropname: str
    newtreatmentname: str
class TreatmentPublic(TreatmentBase):    
    tid: int | None = Field(default=None, primary_key=True)
    t_exid: int | None = None
    name: str | None = None
class TreatmentsPublic(SQLModel):
    data: list[TreatmentPublic]
    count: int
    
class Togetsimoutput(BaseModel):
    simId: int
    cropname: str
    experimentname: str
    treatmentname: str
    

class OperationBase(SQLModel):
    __tablename__ = 'operations'
    opID: int | None = Field(default=None, primary_key=True)
    o_t_exid: int | None = None
    name: str | None = None
    odate: str | None = None
    owner_id: int | None = Field(default=None, foreign_key="user.id", nullable=False)
    
class Operation(OperationBase, table=True):  
    __tablename__ = 'operations'  
    __table_args__ = {'extend_existing': True}
    opID: int | None = Field(default=None, primary_key=True)
    o_t_exid: int | None = None
    name: str | None = None
    odate: str | None = None
    owner_id: int | None = Field(default=None, foreign_key="user.id", nullable=False)
    
class OperationPublic(OperationBase):    
    opID: int | None = Field(default=None, primary_key=True)
    o_t_exid: int | None = None
    name: str | None = None
    odate: str | None = None
    
class OperationsPublic(SQLModel):
    data: list[OperationPublic]
    count: int
    
class OperationRecord(BaseModel):
    o_t_exid: int
    name: str
    odate: str

# class Simulation


class InitCondOp(SQLModel, table=True):
    __tablename__ = "initCondOp"    
    opID: int | None = Field(default=None, primary_key=True)
    pop: float | None = None
    autoirrigation: float | None = None
    xseed: float | None = None
    yseed: float | None = None
    cec: float | None = None
    eomult: float | None = None
    rowSpacing: float | None = None
    cultivar: str | None = None
    seedpieceMass: float | None = None

class InitCondOpUpdateRequest(BaseModel):
    pop: Optional[float] = None
    autoirrigation: Optional[float] = None
    xseed: Optional[float] = None
    yseed: Optional[float] = None
    cec: Optional[float] = None
    eomult: Optional[float] = None
    rowSpacing: Optional[float] = None
    cultivar: Optional[str] = None
    seedpieceMass: Optional[float] = None
    odate: Optional[str] = None


class TillageOp(SQLModel, table=True):  
    __tablename__ = 'tillageOp'        
    opID : int | None = Field(default=None, primary_key=True)
    tillage: str | None = None

class OperationData(BaseModel):
    op_id: Optional[int]
    opName: Optional[str]
    treatmentid: Optional[int]
    opDate: Optional[str]
    tillageType: Optional[str]

class TillageType(SQLModel, table=True):
    __tablename__ = 'tillageType'    
    id: int  | None = Field(default=None, primary_key=True)
    tillage: str | None = None
    description: str | None = None

class TillageTypePublic(SQLModel):
    id: int | None = None
    tillage: str | None = None
    description: str | None = None

class TillageTypesPublic(SQLModel):
    data: list[TillageTypePublic]
    count: int 

 
class FertNutOp(SQLModel, table=True):
    __tablename__ = 'fertNutOp'
    id:int | None = Field(default=None, primary_key=True)
    opID : int | None = None
    nutrient: str | None = None
    nutrientQuantity:  float | None = None


class IrrigFloodH(SQLModel, table=True):
    __tablename__ = "irrig_floodH"
    opID: int = Field(primary_key=True)
    irrigationClass: str
    pondDepth: float
    irrStartD: str
    startH: str
    irrStopD: str
    stopH: str

class IrrigFloodR(SQLModel, table=True):
    __tablename__ = "irrig_floodR"
    opID: int = Field(primary_key=True)
    irrigationClass: str
    pondDepth: float
    rate: int
    irrStartD: str
    startH: str
    irrStopD: str
    stopH: str
    
class PGROp(SQLModel, table=True):
    __tablename__="PGROp"
    opID : int | None = Field(default=None, primary_key=True)
    PGRChemical: str | None = None
    applicationType: str | None = None
    bandwidth: float | None = None
    applicationRate: float | None = None
    PGRUnit: str | None = None
class SR_Op(SQLModel, table=True):
    __tablename__="surfResOp"
    opID : int | None = Field(default=None, primary_key=True)
    residueType: str | None = None
    applicationType: str | None = None
    applicationTypeValue: float | None = None
    
class IrrigPivotOp(SQLModel, table=True):
    __tablename__="Irrig_pivotOp"
    opID : int | None = Field(default=None, primary_key=True)
    irrigationClass: str | None = None
    AmtIrrAppl: int | None = None

class IrrigationDetails(SQLModel, table=True):
    __tablename__="irrigationDetails"
    opID : int | None = Field(default=None, primary_key=True)
    o_t_exid: int | None = None
    irrigationClass: str | None = None

class SimData(BaseModel):
    site: str
    soil: str
    station: str
    weather: str
    crop: str
    experiment: str
    waterStress: str
    nitrogenStress: str
    tempVariance: Optional[int] = 0
    rainVariance: Optional[int] = 0
    co2Variance: Optional[str] = "None"
    startDate: int
    endDate: int

class OperationCreate(SQLModel):
    opID: int | None = Field(default=None, primary_key=True)
    name: str | None = None
    exid: str | None = None
    cropname: str | None = None
    treatmentname: str | None = None
    operation_record: Optional[List[str]] = None
    initCond_record: Optional[List[float | str]] = None
    tillage_record: Optional[List[str]] = None
    fert_record: Optional[List[str]] = None
    fertNut_record: Optional[List[str]] = None
    PGR_record: Optional[List[str]] = None
    SR_record: Optional[List[str]] = None
    irrAmt_record: Optional[List[str]] = None
    owner_id: int | None = Field(default=None, foreign_key="user.id", nullable=False)
    
class OperationRequest(SQLModel):
    treatmentname: str | None = None
    experimentname: str | None = None
    cropname: str | None = None
    opname: str | None = None

class OperationDateResponse(SQLModel):
    date: Optional[str] = None
    
class FertilizationClass(SQLModel, table=True):
    __tablename__ = 'fertilizationClass'
    fertilizationClass: str  | None = Field(default=None, primary_key=True)
    
class PGRChemical(SQLModel, table=True):
    __tablename__ = 'PGRChemical'
    id: int | None = Field(default=None, primary_key=True)
    PGRChemical: str | None = None
    
class PGRApplType(SQLModel, table=True):
    __tablename__ = 'PGRApplType'
    id: int | None = Field(default=None, primary_key=True)
    applicationType: str | None = None 
    code: int | None = None
    
class SurfResApplType(SQLModel, table=True):
    __tablename__ = 'surfResApplType'
    id: int | None = Field(default=None, primary_key=True)
    applicationType: str | None = None     
    
class PGRUnit(SQLModel, table=True):
    __tablename__ = 'PGRUnit'
    id: int | None = Field(default=None, primary_key=True)
    PGRUnit: str | None = None 
    code: int | None = None
    
class SurfResType(SQLModel, table=True):
    __tablename__ = 'surfResType'
    id: int | None = Field(default=None, primary_key=True)
    residueType: str | None = None
class IrrigationClass(SQLModel, table=True):
    __tablename__ = 'IrrigationClass'    
    irrigationClass: str  | None = Field(default=None, primary_key=True)
    
class IrrigationType(SQLModel, table=True):
    __tablename__ = 'irrigationType'
    id: int | None = Field(default=None, primary_key=True)
    irrigation: str | None = None
    description: str | None = None

class FertilizationOp(SQLModel, table=True):
    __tablename__ = 'fertilizationOp'
    opID: int | None = Field(default=None, primary_key=True)
    fertilizationClass: str
    depth: str
    
class FertilizationWithNutrients(BaseModel):
    fertilization: FertilizationOp
    nutrients: Optional[List[FertNutOp]] = None


###############Cultivar Cotton table#############
# # Shared properties
class CultivarCottonBase(SQLModel):
    __tablename__ = 'cultivar_cotton'
    id: int | None = Field(default=None, primary_key=True)
    hybridname: str
    



# Properties to receive on CultivarCotton creation
class CultivarCottonCreate(CultivarCottonBase):
    __tablename__ = 'cultivar_cotton'
    hybridname: str
    calbrt11: float | None 
    calbrt12: float | None
    calbrt13: float | None
    calbrt15: float | None
    calbrt16: float | None
    calbrt17: float | None
    calbrt18: float | None
    calbrt19: float | None
    calbrt22: float | None
    calbrt26: float | None
    calbrt27: float | None
    calbrt28: float | None
    calbrt29: float | None
    calbrt30: float | None
    calbrt31: float | None
    calbrt32: float | None
    calbrt33: float | None
    calbrt34: float | None
    calbrt35: float | None
    calbrt36: float | None
    calbrt37: float | None
    calbrt38: float | None
    calbrt39: float | None
    calbrt40: float | None
    calbrt41: float | None
    calbrt42: float | None
    calbrt43: float | None
    calbrt44: float | None
    calbrt45: float | None
    calbrt47: float | None
    calbrt48: float | None
    calbrt49: float | None
    calbrt50: float | None
    calbrt52: float | None
    calbrt57: float | None


# Properties to receive on CultivarCotton update
class CultivarCottonUpdate(CultivarCottonBase):
    hybridname: str | None = None  # type: ignore


# Database model, database table inferred from class name
class CultivarCottondata(CultivarCottonBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    
    hybridname: str
    calbrt11: float | None 
    calbrt12: float | None
    calbrt13: float | None
    calbrt15: float | None
    calbrt16: float | None
    calbrt17: float | None
    calbrt18: float | None
    calbrt19: float | None
    calbrt22: float | None
    calbrt26: float | None
    calbrt27: float | None
    calbrt28: float | None
    calbrt29: float | None
    calbrt30: float | None
    calbrt31: float | None
    calbrt32: float | None
    calbrt33: float | None
    calbrt34: float | None
    calbrt35: float | None
    calbrt36: float | None
    calbrt37: float | None
    calbrt38: float | None
    calbrt39: float | None
    calbrt40: float | None
    calbrt41: float | None
    calbrt42: float | None
    calbrt43: float | None
    calbrt44: float | None
    calbrt45: float | None
    calbrt47: float | None
    calbrt48: float | None
    calbrt49: float | None
    calbrt50: float | None
    calbrt52: float | None
    calbrt57: float | None
    owner_id: int | None = Field(default=None, foreign_key="user.id", nullable=False)



# Properties to return via API, id is always required
class CultivarCottonPublic(CultivarCottonBase):
    id: int
    hybridname: str
    calbrt11: float | None 
    calbrt12: float | None
    calbrt13: float | None
    calbrt15: float | None
    calbrt16: float | None
    calbrt17: float | None
    calbrt18: float | None
    calbrt19: float | None
    calbrt22: float | None
    calbrt26: float | None
    calbrt27: float | None
    calbrt28: float | None
    calbrt29: float | None
    calbrt30: float | None
    calbrt31: float | None
    calbrt32: float | None
    calbrt33: float | None
    calbrt34: float | None
    calbrt35: float | None
    calbrt36: float | None
    calbrt37: float | None
    calbrt38: float | None
    calbrt39: float | None
    calbrt40: float | None
    calbrt41: float | None
    calbrt42: float | None
    calbrt43: float | None
    calbrt44: float | None
    calbrt45: float | None
    calbrt47: float | None
    calbrt48: float | None
    calbrt49: float | None
    calbrt50: float | None
    calbrt52: float | None
    calbrt57: float | None


class CultivarCottonsPublic(SQLModel):
    data: list[CultivarCottonPublic]

#########Cultivar Cotton End#############

###############Cultivar Maize table#############
# # Shared properties
class CultivarMaizeBase(SQLModel):
    __tablename__ = 'cultivar_maize'
    id: int | None = Field(default=None, primary_key=True)
    hybridname: str


# Properties to receive on CultivarMaize creation
class CultivarMaizeCreate(CultivarMaizeBase):
    __tablename__ = 'cultivar_maize'
    hybridname: str
    juvenileleaves: int
    DaylengthSensitive: float | None
    Rmax_LTAR: float | None
    Rmax_LTIR:float | None
    PhyllFrmTassel:float | None
    StayGreen:float | None



# Properties to receive on CultivarMaize update
class CultivarMaizeUpdate(CultivarMaizeBase):
    hybridname: str | None = None  # type: ignore


# Database model, database table inferred from class name
class CultivarMaizedata(CultivarMaizeBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    
    hybridname: str
    juvenileleaves: int
    DaylengthSensitive: float | None
    Rmax_LTAR: float | None
    Rmax_LTIR:float | None
    PhyllFrmTassel:float | None
    StayGreen:float | None
    owner_id: int | None = Field(default=None, foreign_key="user.id", nullable=False)



# Properties to return via API, id is always required
class CultivarMaizePublic(CultivarMaizeBase):
    id: int
    hybridname: str
    juvenileleaves: int
    DaylengthSensitive: float | None
    Rmax_LTAR: float | None
    Rmax_LTIR:float | None
    PhyllFrmTassel:float | None
    StayGreen:float | None


class CultivarMaizesPublic(SQLModel):
    data: list[CultivarMaizePublic]

#########Cultivar Maize End#############
###############Cultivar Potato table#############
# # Shared properties
class CultivarPotatoBase(SQLModel):
    __tablename__ = 'cultivar_potato'
    id: int | None = Field(default=None, primary_key=True)
    hybridname: str


# Properties to receive on CultivarPotato creation
class CultivarPotatoCreate(CultivarPotatoBase):
    __tablename__ = 'cultivar_potato'
    hybridname: str
    A1: float | None
    A6:float | None
    A8:float | None
    A9:float | None
    A10:float | None
    G1:float | None
    G2:float | None
    G3:float | None
    G4:float | None



# Properties to receive on CultivarPotato update
class CultivarPotatoUpdate(CultivarPotatoBase):
    hybridname: str | None = None  # type: ignore


# Database model, database table inferred from class name
class CultivarPotatodata(CultivarPotatoBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    
    hybridname: str
    A1: float | None
    A6:float | None
    A8:float | None
    A9:float | None
    A10:float | None
    G1:float | None
    G2:float | None
    G3:float | None
    G4:float | None
    owner_id: int | None = Field(default=None, foreign_key="user.id", nullable=False)



# Properties to return via API, id is always required
class CultivarPotatoPublic(CultivarPotatoBase):
    id: int
    hybridname: str
    A1: float | None
    A6:float | None
    A8:float | None
    A9:float | None
    A10:float | None
    G1:float | None
    G2:float | None
    G3:float | None
    G4:float | None


class CultivarPotatosPublic(SQLModel):
    data: list[CultivarPotatoPublic]

#########Cultivar Potato End#############
# Properties to receive on CultivarSoybean creation
###############Cultivar Soybean table#############
# # Shared properties
class CultivarSoybeanBase(SQLModel):
    __tablename__ = 'cultivar_soybean'
    id: int | None = Field(default=None, primary_key=True)
    hybridname: str


class CultivarSoybeanCreate(CultivarSoybeanBase):
    __tablename__ = 'cultivar_soybean'
    hybridname: str
    matGrp:float | None
    seedLb:float | None
    fill:float | None
    v1:float | None
    v2:float | None
    v3:float | None
    r1:float | None
    r2:float | None
    r3:float | None
    r4:float | None
    r5:float | None
    r6:float | None
    r7:float | None
    r8:float | None
    r9:float | None
    r10:float | None
    r11:float | None
    r12:float | None
    g1:float | None
    g2:float | None
    g3:float | None
    g4:float | None
    g5:float | None
    g6:float | None
    g7:float | None
    g8:float | None
    g9:float | None



# Properties to receive on CultivarSoybean update
class CultivarSoybeanUpdate(CultivarSoybeanBase):
    hybridname: str | None = None  # type: ignore


# Database model, database table inferred from class name
class CultivarSoybeandata(CultivarSoybeanBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    
    hybridname: str
    matGrp:float | None
    seedLb:float | None
    fill:float | None
    v1:float | None
    v2:float | None
    v3:float | None
    r1:float | None
    r2:float | None
    r3:float | None
    r4:float | None
    r5:float | None
    r6:float | None
    r7:float | None
    r8:float | None
    r9:float | None
    r10:float | None
    r11:float | None
    r12:float | None
    g1:float | None
    g2:float | None
    g3:float | None
    g4:float | None
    g5:float | None
    g6:float | None
    g7:float | None
    g8:float | None
    g9:float | None 
    owner_id: int | None = Field(default=None, foreign_key="user.id", nullable=False)



# Properties to return via API, id is always required
class CultivarSoybeanPublic(CultivarSoybeanBase):
    id: int
    hybridname: str
    matGrp:float | None
    seedLb:float | None
    fill:float | None
    v1:float | None
    v2:float | None
    v3:float | None
    r1:float | None
    r2:float | None
    r3:float | None
    r4:float | None
    r5:float | None
    r6:float | None
    r7:float | None
    r8:float | None
    r9:float | None
    r10:float | None
    r11:float | None
    r12:float | None
    g1:float | None
    g2:float | None
    g3:float | None
    g4:float | None
    g5:float | None
    g6:float | None
    g7:float | None
    g8:float | None
    g9:float | None


class CultivarSoybeansPublic(SQLModel):
    data: list[CultivarSoybeanPublic]

#########Cultivar Soybean End#############

####### Site Models Begin#########
# Shared properties
class Pastrunbase(SQLModel):
    rotationID: int


# Properties to return via API, id is always required
class Pastrun(Pastrunbase, table=True):
    __tablename__= 'pastruns'
    id: int | None = Field(default=None, primary_key=True)
    rotationID:int
    site: str
    soil: str
    stationtype: str
    weather: str
    treatment: str
    startyear: int
    endyear: int
    waterstress: str
    nitrostress: str
    tempVar: int
    rainVar: int
    CO2Var: int
    owner_id:int
    status: int
   
# Guest-specific models
class GuestCreate(SQLModel):
    email: str | None = None

class GuestResponse(SQLModel):
    access_token: str
    token_type: str
    guest_session_id: str
    has_email: bool

class AddEmailRequest(SQLModel):
    email: str = Field(regex=r'^[^@]+@[^@]+\.[^@]+$')  # Basic email validation

class SendReportRequest(SQLModel):
    report_type: str
    report_data: dict

class GuestReportPublic(SQLModel):
    id: int
    report_type: str
    generated_at: datetime
    email_sent: bool
    email_sent_at: datetime | None = None

class PastrunsPublic(SQLModel):
    data: list[Pastrun]
####### Site model End############




class seasonRunResponse(SQLModel):
    data: list[Any]