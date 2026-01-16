from sqlmodel import Field, Relationship, SQLModel, Column
from sqlalchemy import Float, Integer, String, text
from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime, timezone
from enum import Enum

class GuestType(str, Enum):
    ANONYMOUS="anonymous"
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
    id: int | None = Field(default=None, primary_key=True)    
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
# only need a create statement as this table is not updated by the API, it is only read

class BiologyDefault(SQLModel, table=True):
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

#########Dispersivity Table################


class Dispersivity(SQLModel, table=True):
    __tablename__ = "dispersivity"

    id: Optional[int] = Field(default=None, primary_key=True)
    texturecl: Optional[str] = Field(default=None, max_length=30)
    alpha: float = Field(default=8.1)

#########Dispersivity Table End############

#########Gas Table#########################
class Gas(SQLModel, table=True):
    __tablename__ = "gas"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: Optional[str] = Field(default=None, max_length=30)
    EPSI: float = Field(default=1)
    bTort: float = Field(default=0.65)
    Diffusion_Coeff: Optional[float] = None
#########Gas Table End ############################## 

#########FertNutrient table############################## 
class FertNutrient(SQLModel, table=True):
    __tablename__ = "fertNutrient"

    fertilizationClass: Optional[str] = Field(default=None, primary_key=True)
    Nutrient: Optional[str] = Field(default=None, primary_key=True)
#########FertNutrient Table End ############################## 

###### solute table#########################

from sqlmodel import SQLModel, Field

class solute(SQLModel, table=True):
    __tablename__ = 'solute'
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(default='NitrogenDefault', max_length=30)
    EPSI: float = Field(default=0.8)
    IUPW: float = Field(default=0.0)
    CourMax: float = Field(default=0.5)
    Diffusion_Coeff: float = Field(default=1.2)

##### solute table end#################

#############Classim Version table #############
class ClassimVersion(SQLModel, table=True):
    __tablename__ = "classimVersion"

    id: Optional[int] = Field(default=None, primary_key=True)
    version: str
    date: str
    comment: str

###########Classim Version Table end #############

##############MulchGeo and MulcDecomp##############


class MulchDecomp(SQLModel, table=True):
    __tablename__ = "mulchDecomp"

    nutrient: Optional[str] = Field(default=None, primary_key=True)
    contactFraction: Optional[float] = None
    alphaFeeding: Optional[float] = None
    carbMass: Optional[float] = None
    cellMass: Optional[float] = None
    lignMass: Optional[float] = None
    carbNMass: Optional[float] = None
    cellNMass: Optional[float] = None
    lignNMass: Optional[float] = None
    carbDecomp: Optional[float] = None
    cellDecomp: Optional[float] = None
    lignDecomp: Optional[float] = None

class MulchGeo(SQLModel, table=True):
    __tablename__ = "mulchGeo"

    nutrient: Optional[str] = Field(default=None, primary_key=True)
    minHoriSize: Optional[float] = None
    diffusionRestriction: Optional[float] = None
    longWaveRadiationCtrl: Optional[float] = None
    decompositionCtrl: Optional[float] = None
    deltaRShort: Optional[float] = None
    deltaRLong: Optional[float] = None
    omega: Optional[float] = None
    epsilonMulch: Optional[float] = None
    alphaMulch: Optional[float] = None
    maxStepInPicardIteration: Optional[float] = None
    toleranceHead: Optional[float] = None
    rhoMulch: Optional[float] = None
    poreSpace: Optional[float] = None
    maxPondingDepth: Optional[float] = None

#############Mulch Tables end##################
    
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
    jday: int | None = None
    date: str | None = None
    hour: int | None = None
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
    jday: int | None = None
    date: str | None = None
    hour: int | None = None
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
    jday: int | None = None
    date: str | None = None
    hour: int | None = None
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
    jday: int | None = None
    date: str | None = None
    hour: int | None = None
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
    jday: int | None = None
    date: str | None = None
    hour: int | None = None
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
    code: int | None = Field(default=None, primary_key=True)
    
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
    calbrt1: float | None 
    calbrt2: float | None
    calbrt3: float | None
    calbrt4: float | None
    calbrt5: float | None
    calbrt6: float | None
    calbrt7: float | None
    calbrt8: float | None
    calbrt9: float | None
    calbrt10: float | None
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
    calbrt57: float | None
    calbrt58: float | None
    calbrt59: float | None
    calbrt60: float | None


# Properties to receive on CultivarCotton update
class CultivarCottonUpdate(CultivarCottonBase):
    hybridname: str | None = None  # type: ignore


# Database model, database table inferred from class name
class CultivarCottonData(CultivarCottonBase, table=True):
    __tablename__ = "cultivar_cotton"

    id: Optional[int] = Field(default=None, primary_key=True)
    hybridname: Optional[str] = None
    calbrt1: Optional[float] = Field(default=0.9)
    calbrt2: Optional[float] = Field(default=-0.22)
    calbrt3: Optional[float] = Field(default=-2.2)
    calbrt4: Optional[float] = Field(default=0.1)
    calbrt5: Optional[float] = Field(default=-5.5)
    calbrt6: Optional[float] = Field(default=0.5)
    calbrt7: Optional[float] = Field(default=0.5)
    calbrt8: Optional[float] = Field(default=0.1)
    calbrt9: Optional[float] = Field(default=1.65)
    calbrt10: Optional[float] = Field(default=2.15)
    calbrt11: Optional[float] = Field(default=4)
    calbrt12: Optional[float] = Field(default=6.75)
    calbrt13: Optional[float] = Field(default=35)
    calbrt14: Optional[float] = Field(default=0.1)
    calbrt15: Optional[float] = Field(default=0.85)
    calbrt16: Optional[float] = Field(default=-0.9)
    calbrt17: Optional[float] = Field(default=0.9)
    calbrt18: Optional[float] = Field(default=0)
    calbrt19: Optional[float] = Field(default=1.5)
    calbrt20: Optional[float] = Field(default=1)
    calbrt21: Optional[float] = Field(default=1)
    calbrt22: Optional[float] = Field(default=1)
    calbrt23: Optional[float] = Field(default=1)
    calbrt24: Optional[float] = Field(default=1)
    calbrt25: Optional[float] = Field(default=1)
    calbrt26: Optional[float] = Field(default=1.35)
    calbrt27: Optional[float] = Field(default=1)
    calbrt28: Optional[float] = Field(default=1)
    calbrt29: Optional[float] = Field(default=0.9)
    calbrt30: Optional[float] = Field(default=1.15)
    calbrt31: Optional[float] = Field(default=1.1)
    calbrt32: Optional[float] = Field(default=1)
    calbrt33: Optional[float] = Field(default=-0.85)
    calbrt34: Optional[float] = Field(default=1)
    calbrt35: Optional[float] = Field(default=1)
    calbrt36: Optional[float] = Field(default=1.1)
    calbrt37: Optional[float] = Field(default=3)
    calbrt38: Optional[float] = Field(default=0.75)
    calbrt39: Optional[float] = Field(default=1)
    calbrt40: Optional[float] = Field(default=2.5)
    calbrt41: Optional[float] = Field(default=1)
    calbrt42: Optional[float] = Field(default=1)
    calbrt43: Optional[float] = Field(default=0.9)
    calbrt44: Optional[float] = Field(default=1)
    calbrt45: Optional[float] = Field(default=0.8)
    calbrt46: Optional[float] = Field(default=1)
    calbrt47: Optional[float] = Field(default=1.1)
    calbrt48: Optional[float] = Field(default=0.9)
    calbrt49: Optional[float] = Field(default=0.7)
    calbrt50: Optional[float] = Field(default=1)
    calbrt51: Optional[float] = Field(default=1)
    calbrt52: Optional[float] = Field(default=1.35)
    calbrt53: Optional[float] = Field(default=1)
    calbrt54: Optional[float] = Field(default=0)
    calbrt55: Optional[float] = Field(default=0.9)
    calbrt56: Optional[float] = Field(default=1)
    calbrt57: Optional[float] = Field(default=1)
    calbrt58: Optional[float] = Field(default=1)
    calbrt59: Optional[float] = Field(default=1)
    calbrt60: Optional[float] = Field(default=1)
    RRRM: Optional[float] = Field(default=166.7)
    RRRY: Optional[float] = Field(default=31.3)
    RVRL: Optional[float] = Field(default=0.73)
    ALPM: Optional[float] = Field(default=0.6)
    ALPY: Optional[float] = Field(default=0.3)
    RTWL: Optional[float] = Field(default=0.00001)
    RTMinWTperArea: Optional[float] = Field(default=0.0002)
    EPSI: Optional[float] = Field(default=1)
    IUPW: Optional[float] = Field(default=1)
    CourMax: Optional[float] = Field(default=1)
    Diffx: Optional[float] = Field(default=2.4)
    Diffz: Optional[float] = Field(default=2.9)
    VelZ: Optional[float] = Field(default=0)
    lsink: Optional[float] = Field(default=1)
    Rroot: Optional[float] = Field(default=0.03)
    Constl_M: Optional[float] = Field(default=35)
    ConstK_M: Optional[float] = Field(default=0.5)
    Cmin0_M: Optional[float] = Field(default=0.01)
    ConstI_Y: Optional[float] = Field(default=17.2)
    ConstK_Y: Optional[float] = Field(default=0.75)
    Cmin0_Y: Optional[float] = Field(default=0.03)
    owner_id: int | None = Field(default=None, foreign_key="user.id", nullable=False)

# Properties to return via API, id is always required
class CultivarCottonPublic(CultivarCottonBase):
    id: int
    hybridname: str
    calbrt1: float | None 
    calbrt2: float | None
    calbrt3: float | None
    calbrt4: float | None
    calbrt5: float | None
    calbrt6: float | None
    calbrt7: float | None
    calbrt8: float | None
    calbrt9: float | None
    calbrt10: float | None
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
    calbrt58: float | None
    calbrt59: float | None
    calbrt60: float | None


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
    DaylengthSensitive: int | None
    Rmax_LTAR: float | None
    Rmax_LTIR:float | None
    LM_min:   float | None
    PhyllFrmTassel:float | None
    StayGreen:float | None



# Properties to receive on CultivarMaize update
class CultivarMaizeUpdate(CultivarMaizeBase):
    hybridname: str | None = None  # type: ignore


# Database model, database table inferred from class name

from sqlmodel import SQLModel, Field, Column
from sqlalchemy import Float, Integer, String, text
from typing import Optional

class CultivarMaizedata(CultivarMaizeBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hybridname: Optional[str] = Field(default=None)
    juvenileleaves: Optional[int] = Field(default=None)
    DaylengthSensitive: int = Field(
        default=1,
        sa_column=Column(Integer, server_default=text("1"))
    )
    Rmax_LTAR: float = Field(
        default=0.53,
        sa_column=Column(Float, server_default=text("0.53"))
    )
    Rmax_LTIR: float = Field(
        default=0.978,
        sa_column=Column(Float, server_default=text("0.978"))
    )
    PhyllFrmTassel: float = Field(
        default=3,
        sa_column=Column(Float, server_default=text("3"))
    )
    StayGreen: float = Field(
        default=4.5,
        sa_column=Column(Float, server_default=text("4.5"))
    )
    LM_min: float = Field(
        default=120,
        sa_column=Column(Float, server_default=text("120"))
    )
    RRRM: float = Field(
        default=166.7,
        sa_column=Column(Float, server_default=text("166.7"))
    )
    RRRY: float = Field(
        default=31.3,
        sa_column=Column(Float, server_default=text("31.3"))
    )
    RVRL: float = Field(
        default=0.73,
        sa_column=Column(Float, server_default=text("0.73"))
    )
    ALPM: float = Field(
        default=0.55,
        sa_column=Column(Float, server_default=text("0.55"))
    )
    ALPY: float = Field(
        default=0.04,
        sa_column=Column(Float, server_default=text("0.04"))
    )
    RTWL: float = Field(
        default=1.06e-4,
        sa_column=Column(Float, server_default=text("0.000106"))
    )
    RTMinWTperArea: float = Field(
        default=2.00e-4,
        sa_column=Column(Float, server_default=text("0.0002"))
    )
    EPSI: int = Field(
        default=1,
        sa_column=Column(Integer, server_default=text("1"))
    )
    IUPW: int = Field(
        default=1,
        sa_column=Column(Integer, server_default=text("1"))
    )
    CourMax: float = Field(
        default=1,
        sa_column=Column(Float, server_default=text("1"))
    )
    Diffx: float = Field(
        default=2.4,
        sa_column=Column(Float, server_default=text("2.4"))
    )
    Diffz: float = Field(
        default=2.9,
        sa_column=Column(Float, server_default=text("2.9"))
    )
    VelZ: float = Field(
        default=0,
        sa_column=Column(Float, server_default=text("0"))
    )
    lsink: int = Field(
        default=1,
        sa_column=Column(Integer, server_default=text("1"))
    )
    Rroot: float = Field(
        default=0.017,
        sa_column=Column(Float, server_default=text("0.017"))
    )
    Constl_M: float = Field(
        default=35.0,
        sa_column=Column(Float, server_default=text("35.0"))
    )
    ConstK_M: float = Field(
        default=0.5,
        sa_column=Column(Float, server_default=text("0.5"))
    )
    Cmin0_M: float = Field(
        default=0.01,
        sa_column=Column(Float, server_default=text("0.01"))
    )
    ConstI_Y: float = Field(
        default=17.2,
        sa_column=Column(Float, server_default=text("17.2"))
    )
    ConstK_Y: float = Field(
        default=0.75,
        sa_column=Column(Float, server_default=text("0.75"))
    )
    Cmin0_Y: float = Field(
        default=0.03,
        sa_column=Column(Float, server_default=text("0.03"))
    )
    owner_id: Optional[int] = Field(default=None, foreign_key="user.id")

# Properties to return via API, id is always required
class CultivarMaizePublic(CultivarMaizeBase):
    id: int
    hybridname: str
    juvenileleaves: int
    DaylengthSensitive: int | None
    Rmax_LTAR: float | None
    Rmax_LTIR:float | None
    LM_min:   float | None
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
    A1: float =1.5
    A6: float =2.5
    A8: float =2.6
    A9: float =0.8
    A10: float =1.2
    G1: float =0.7
    G2: float =300.0
    G3: float =15.0
    G4: float =0.004




# Properties to receive on CultivarPotato update
class CultivarPotatoUpdate(CultivarPotatoBase):
    hybridname: str | None = None  # type: ignore


# Database model, database table inferred from class name
class CultivarPotatodata(CultivarPotatoBase, table=True):
    __tablename__ = 'cultivar_potato'
# sa-column not needed here as this is a primary key which is handled automatically
    id: Optional[int] = Field(default=None, primary_key=True)

    hybridname: str | None = Field(
        default=None,
        sa_column=Column(String)
    )
    A1: float | None = Field(
        default=1.5,
        sa_column=Column(Float, server_default=text("1.5"))
    )
    A6: float | None = Field(
        default=2.5,
        sa_column=Column(Float, server_default=text("2.5"))
    )
    A8: float | None = Field(
        default=2.6,
        sa_column=Column(Float, server_default=text("2.6"))
    )
    A9: float | None = Field(
        default=0.8,
        sa_column=Column(Float, server_default=text("0.8"))
    )
    A10: float | None = Field(
        default=1.2,
        sa_column=Column(Float, server_default=text("1.2"))
    )
    G1: float | None = Field(
        default=0.7,
        sa_column=Column(Float, server_default=text("0.7"))
    )
    G2: float | None = Field(
        default=300.0,
        sa_column=Column(Float, server_default=text("300.0"))
    )
    G3: float | None = Field(
        default=15.0,
        sa_column=Column(Float, server_default=text("15.0"))
    )
    G4: float | None = Field(
        default=0.004,
        sa_column=Column(Float, server_default=text("0.004"))
    )
    RRRM: float = Field(
        default=166.7,
        sa_column=Column(Float, server_default=text("166.7"))
    )
    RRRY: float = Field(
        default=31.3,
        sa_column=Column(Float, server_default=text("31.3"))
    )
    RVRL: float = Field(
        default=0.73,
        sa_column=Column(Float, server_default=text("0.73"))
    )
    ALPM: float = Field(
        default=0.35,
        sa_column=Column(Float, server_default=text("0.35"))
    )
    ALPY: float = Field(
        default=0.04,
        sa_column=Column(Float, server_default=text("0.04"))
    )
    RTWL: float = Field(
        default=1.06e-4,
        sa_column=Column(Float, server_default=text("1.06E-4"))
    )
    RTMinWTperArea: float = Field(
        default=2.00e-4,
        sa_column=Column(Float, server_default=text("2.00E-4"))
    )
    EPSI: float = Field(
        default=1.0,
        sa_column=Column(Float, server_default=text("1"))
    )
    IUPW: float = Field(
        default=1.0,
        sa_column=Column(Float, server_default=text("1"))
    )
    CourMax: float = Field(
        default=1.0,
        sa_column=Column(Float, server_default=text("1"))
    )
    Diffx: float = Field(
        default=0.5,
        sa_column=Column(Float, server_default=text("0.5"))
    )
    Diffz: float = Field(
        default=0.5,
        sa_column=Column(Float, server_default=text("0.5"))
    )
    VelZ: float = Field(
        default=0.5,
        sa_column=Column(Float, server_default=text("0.5"))
    )
    lsink: float = Field(
        default=1.0,
        sa_column=Column(Float, server_default=text("1"))
    )
    Rroot: float = Field(
        default=0.017,
        sa_column=Column(Float, server_default=text("0.017"))
    )
    Constl_M: float = Field(
        default=35.0,
        sa_column=Column(Float, server_default=text("35.0"))
    )
    ConstK_M: float = Field(
        default=0.5,
        sa_column=Column(Float, server_default=text("0.5"))
    )
    Cmin0_M: float = Field(
        default=0.01,
        sa_column=Column(Float, server_default=text("0.01"))
    )
    ConstI_Y: float = Field(
        default=17.2,
        sa_column=Column(Float, server_default=text("17.2"))
    )
    ConstK_Y: float = Field(
        default=0.75,
        sa_column=Column(Float, server_default=text("0.75"))
    )
    Cmin0_Y: float = Field(
        default=0.03,
        sa_column=Column(Float, server_default=text("0.03"))
    )    
    owner_id: Optional[int] = Field(default=None, foreign_key="user.id")


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
    
    hybridname: str ='93B15'
    matGrp:float = 5.0
    seedLb:float =2800.0
    fill:float =4.0
    v1:float =0.00957
    v2:float = 14.6
    v3:float= 1.0
    r1:float= 0.028
    r2:float= 0.00619
    r3:float=-0.0907
    r4:float= 0.161
    r5:float= 0.522
    r6:float= 120.1
    r7:float= 0.0062
    r8:float= 250.0
    r9:float= 200.0
    r10:float= 0.5
    r11:float= 0.0024
    r12:float=3.8
    g1:float= 0.0024
    g2:float= 0.5
    g3:float= 1.8
    g4:float= 0.8
    g5:float= 0.684
    g6:float= 1.684
    g7:float=0.5
    g8:float= 2.5
    g9:float= 3.2

    RRRM: Optional[float] = Field(default=166.7)
    RRRY: Optional[float] = Field(default=31.3)
    RVRL: Optional[float] = Field(default=0.73)
    ALPM: Optional[float] = Field(default=0.6)
    ALPY: Optional[float] = Field(default=0.3)
    RTWL: Optional[float] = Field(default=0.00001)
    RTMinWTperArea: Optional[float] = Field(default=0.0002)
    EPSI: Optional[float] = Field(default=1)
    IUPW: Optional[float] = Field(default=1)
    CourMax: Optional[float] = Field(default=1)
    Diffx: Optional[float] = Field(default=2.4)
    Diffz: Optional[float] = Field(default=2.9)
    VelZ: Optional[float] = Field(default=0)
    lsink: Optional[float] = Field(default=1)
    Rroot: Optional[float] = Field(default=0.03)
    Constl_M: Optional[float] = Field(default=35)
    ConstK_M: Optional[float] = Field(default=0.5)
    Cmin0_M: Optional[float] = Field(default=0.01)
    ConstI_Y: Optional[float] = Field(default=17.2)
    ConstK_Y: Optional[float] = Field(default=0.75)
    Cmin0_Y: Optional[float] = Field(default=0.03)
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
    status: Optional[int] = None
    odate:  Optional[str] = None
   
def upgrade():
    op.alter_column('pastruns', 'status', nullable=True)
def downgrade():
    op.alter_column('pastruns', 'status', nullable=False)

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

# Geometry table
class Geometry(SQLModel, table=True):
    __tablename__ = "geometry"

    nodeNum: Optional[int] = Field(default=None, primary_key=True)
    X: Optional[float] = None
    Y: Optional[float] = None
    Layer: Optional[int] = None
    Area: Optional[float] = None
    N2OConc: Optional[float] = None
    simID: Optional[int] = None


# --- Auto-generated SQLModel classes from cropOutput.db.sql ---


# --- Maize Table Models ---
# Table: plantStress_maize



# Table: g01_maize
class G01Maize(SQLModel, table=True):
    __tablename__ = "g01_maize"
    id: Optional[int] = Field(default=None, primary_key=True)
    g01_maize_id: int | None = Field(default=None)
    Date_Time: str | None = None
    jday: int | None = None
    Leaves: float | None = None
    MaturLvs: int | None = None
    Dropped: int | None = None
    LA_pl: float | None = None
    LA_dead: float | None = None
    LAI: float | None = None
    RH: float | None = None
    LeafWP: float | None = None
    PFD: float | None = None
    SolRad: float | None = None
    SoilT: float | None = None
    Tair: float | None = None
    Tcan: float | None = None
    ETdmd: float | None = None
    ETsply: float | None = None
    Pn: float | None = None
    Pg: float | None = None
    Respir: float | None = None
    av_gs: float | None = None
    VPD: float | None = None
    Nitr: float | None = None
    N_Dem: float | None = None
    NUpt: float | None = None
    LeafN: float | None = None
    PCRL: float | None = None
    totalDM: float | None = None
    shootDM: float | None = None
    earDM: float | None = None
    grainDM: float | None = None
    TotLeafDM: float | None = None
    DrpLfDM: float | None = None
    stemDM: float | None = None
    rootDM: float | None = None
    SoilRt: float | None = None
    MxRtDep: float | None = None
    AvailW: float | None = None
    solubleC: float | None = None
    Note: str | None = None

# Table: g03_maize
class G03Maize(SQLModel, table=True):
    __tablename__ = "g03_maize"
    id: Optional[int] = Field(default=None, primary_key=True)
    g03_maize_id: int | None = Field(default=None)
    Date_Time: str |None = None
    X: Optional[float] = None
    Y: Optional[float] = None
    hNew: Optional[float] = None
    thNew: Optional[float] = None
    Q: Optional[float] = None
    NO3N: Optional[float] = None
    NH4N: Optional[float] = None
    Temp: Optional[float] = None
    CO2Conc: Optional[float] = None
    O2Conc: Optional[int] = None
    N2OConc: Optional[float] = None

    # Table: g04_maize
class G04Maize(SQLModel, table=True):
    __tablename__ = "g04_maize"
    id: Optional[int] = Field(default=None, primary_key=True)
    g04_maize_id: int | None = Field(default=None)
    Date_Time: str | None = None
    X: float | None = None
    Y: float | None = None
    Node: float | None = None
    RMassM: float | None = None
    RMassY: float | None = None
    RDenM: float | None = None
    RDenY: float | None = None
    WaterSink: float | None = None
    NitSink: float | None = None
    GasSink: float | None = None

# Table: g05_maize
class G05Maize(SQLModel, table=True):
    __tablename__ = "g05_maize"
    id: Optional[int] = Field(default=None, primary_key=True)
    g05_maize_id: int = Field(primary_key=True)
    Date_Time: str | None=None
    PSoilEvap: float | None = None
    ASoilEVap: float | None = None
    PET_PEN: float | None = None
    PE_T_int: float | None = None
    transp: float | None = None
    CumRain: float | None = None
    infil: float | None = None
    FLuxAct: float | None = None
    Drainage: float | None = None
    N_Leach: float | None = None
    Runoff: float | None = None
    cover: float | None = None
    PSIM: float | None = None
    SeasPSoEv: float | None = None
    SeasASoEv: float | None = None
    SeasPTran: float | None = None
    SeasATran: float | None = None
    SeasRain: float | None = None
    SeasInfil: float | None = None
    ThetaAvail: float | None = None
    CO2FLux: float | None = None
    O2FLux: float | None = None
    N2OFLux: float | None = None
    
class G07Maize(SQLModel, table=True):
    __tablename__ = "g07_maize"
    id: Optional[int] = Field(default=None, primary_key=True)
    g07_maize_id: int | None = Field(default=None)
    Date_Time: str | None = None
    X: float | None = None
    Y: float | None = None
    Humus_N: float | None = None
    Humus_C: float | None = None
    Litter_N: float | None = None
    Litter_C: float | None = None
    Manure_N: float | None = None
    Manure_C: float | None = None
    Root_N: float | None = None
    Root_C: float | None = None
    
class PlantStressMaize(SQLModel, table=True):
    __tablename__ = "plantStress_maize"
    id: Optional[int] = Field(default=None, primary_key=True)
    plantStress_maize_id: int | None = Field(default=None)
    Date_Time: str | None=None
    waterstress: float | None = None
    N_stress: float | None = None
    Shade_Stress: float | None = None
    PotentialArea: float | None = None    
    
# --- Potato Table Models ---

# Table: g01_potato
class G01Potato(SQLModel, table=True):
    __tablename__ = "g01_potato"
    id: Optional[int] = Field(default=None, primary_key=True)
    g01_potato_id: int | None = Field(default=None)
    Date_Time: str
    jday: int
    LA_pl: float | None = None
    LAI: float | None = None
    PFD: float | None = None
    SolRad: float | None = None
    Tair: float | None = None
    Tcan: float | None = None
    Pgross: float | None = None
    Rg_Rm: float | None = None
    Tr_Pot: float | None = None
    Tr_Act: float | None = None
    Stage: float | None = None
    totalDM: float | None = None
    leafDM: float | None = None
    stemDM: float | None = None
    rootDM: float | None = None
    tuberDM: float | None = None
    deadDM: float | None = None
    Cdead: float | None = None
    Cpool: float | None = None
    LWPpd: float | None = None
    LWPave: float | None = None
    gs_ave: float | None = None
    Nstress1: float | None = None
    Nstress2: float | None = None
    Wstress1: float | None = None
    Wstress2: float | None = None
    Wstress3: float | None = None


    # Table: g03_potato
class G03Potato(SQLModel, table=True):
    __tablename__ = "g03_potato"
    id: Optional[int] = Field(default=None, primary_key=True)
    g03_potato_id: int | None = Field(default=None)
    Date_Time: str |None= None
    X: Optional[float] = None
    Y: Optional[float] = None
    hNew: Optional[float] = None
    thNew: Optional[float] = None
    Q: Optional[float] = None
    NO3N: Optional[float] = None
    NH4N: Optional[float] = None
    Temp: Optional[float] = None
    CO2Conc: Optional[float] = None
    O2Conc: Optional[int] = None
    N2OConc: Optional[float] = None



# Table: g04_potato
class G04Potato(SQLModel, table=True):
    __tablename__ = "g04_potato"
    id: Optional[int] = Field(default=None, primary_key=True)
    g04_potato_id: int | None = Field(default=None)
    Date_Time: str | None = None
    X: float | None = None
    Y: float | None = None
    Node: int | None = None
    RMassM: float | None = None
    RMassY: float | None = None
    RDenM: float | None = None
    RDenY: float | None = None
    WaterSink: float | None = None
    NitSink: float | None = None
    GasSink: float | None = None
    
    # Table: g05_potato
class G05Potato(SQLModel, table=True):
    __tablename__ = "g05_potato"
    id: Optional[int] = Field(default=None, primary_key=True)
    g05_potato_id: int | None = Field(default=None)
    Date_Time: str
    PSoilEvap: float | None = None
    ASoilEVap: float | None = None
    PET_PEN: float | None = None
    PE_T_int: float | None = None
    transp: float | None = None
    CumRain: float | None = None
    infil: float | None = None
    FLuxAct: float | None = None
    Drainage: float | None = None
    N_Leach: float | None = None
    Runoff: float | None = None
    cover: float | None = None
    PSIM: float | None = None
    SeasPSoEv: float | None = None
    SeasASoEv: float | None = None
    SeasPTran: float | None = None
    SeasATran: float | None = None
    SeasRain: float | None = None
    SeasInfil: float | None = None
    ThetaAvail: float | None = None
    CO2FLux: float | None = None
    O2FLux: float | None = None
    N2OFLux: float | None = None
    
# Table: g07_potato
class G07Potato(SQLModel, table=True):
    __tablename__ = "g07_potato"
    id: Optional[int] = Field(default=None, primary_key=True)
    g07_potato_id: int | None = Field(default=None)
    Date_Time: str | None = None
    X: float | None = None
    Y: float | None = None
    Humus_N: float | None = None
    Humus_C: float | None = None
    Litter_N: float | None = None
    Litter_C: float | None = None
    Manure_N: float | None = None
    Manure_C: float | None = None
    Root_N: float | None = None
    Root_C: float | None = None

    # Table: nitrogen_potato
class NitrogenPotato(SQLModel, table=True):
    __tablename__ = "nitrogen_potato"
    id: Optional[int] = Field(default=None, primary_key=True)
    nitrogen_potato_id: int | None = Field(default=None)
    Date_Time: int | None = None
    tot_N: float | None = None
    leaf_N: float | None = None
    stem_N: float | None = None
    root_N: float | None = None
    tuber_N: float | None = None
    dead_N: float | None = None
    tot_N_C: float | None = None
    leaf_N_C: float | None = None
    stem_N_C: float | None = None
    root_N_C: float | None = None
    tubr_N_C: float | None = None
    N_uptake: float | None = None
    N_demand: float | None = None
    seed_N: float | None = None
    Nstress: float | None = None

# Table: plantStress_potato
class PlantStressPotato(SQLModel, table=True):
    __tablename__ = "plantStress_potato"
    id: Optional[int] = Field(default=None, primary_key=True)
    plantStress_potato_id: int | None = Field(default=None)
    Date_Time: str | None = None
    waterstressfactor: float | None = None
    PSIEffect_leaf: int | None = None
    NEffect_leaf: float | None = None
    PSIEffect_Pn: float | None = None
    NEffect_Pn: float | None = None
    Dev_stage: float | None = None
    Heat_veg: float | None = None
    Heat_repre: float | None = None




# --- Cotton Table Models ---


# Table: g01_cotton
class G01Cotton(SQLModel, table=True):
    __tablename__ = "g01_cotton"
    id: Optional[int] = Field(default=None, primary_key=True)
    g01_cotton_id: int | None = Field(default=None)
    Date_Time: str | None = None
    PlantH: float | None = None
    LAI: float | None = None
    LInt: float | None = None
    Nodes: int | None = None
    Sites: int | None = None
    N_Squares: int | None = None
    N_GB: int | None = None
    N_OB: int | None = None
    NLvsLoss: int | None = None
    NSqLoss: int | None = None
    NBollsLoss: int | None = None
    NFruitShed: int | None = None
    PetShd_DM: float | None = None
    GB_lossDM: float | None = None
    Lf_lossDM: float | None = None
    Rt_lossDM: float | None = None
    Dd_WtDM: float | None = None
    SquareDM: float | None = None
    GB_DM: float | None = None
    OB_DM: float | None = None
    LeafDM: float | None = None
    StemDM: float | None = None
    RootDM: float | None = None
    ResC: float | None = None
    PlantDM: float | None = None
    R_S: float | None = None
    Yield: float | None = None
    Temp: float | None = None
    L_Temp: float | None = None
    Rain: float | None = None
    SRad: int | None = None
    PFD: float | None = None
    RH: float | None = None
    LeafN: float | None = None
    StemN: float | None = None
    SeedN: float | None = None
    BurrN: float | None = None
    RootN: float | None = None
    Nloss: float | None = None
    PlantN: float | None = None
    N_uptake: float | None = None
    S_Psi: float | None = None
    L_Psi: float | None = None
    LArea: float | None = None
    VPD: float | None = None
    StCond: float | None = None
    Pnet: float | None = None
    PGross: float | None = None
    L_Res: float | None = None
    Main_Res: float | None = None
    Resp: float | None = None
    SPnet: float | None = None
    C_Bal: float | None = None
    Nstress_Pn: float | None = None
    Note: str | None = None

# Table: g03_cotton
class G03Cotton(SQLModel, table=True):
    __tablename__ = "g03_cotton"
    id: Optional[int] = Field(default=None, primary_key=True)
    g03_cotton_id: int | None = Field(default=None)
    Date_Time: str | None = None
    X: float | None = None
    Y: float | None = None
    hNew: float | None = None
    thNew: float | None = None
    Q: float | None = None
    NO3N: float | None = None
    NH4N: float | None = None
    Temp: float | None = None
    CO2Conc: float | None = None
    O2Conc: float | None = None
    N2OConc: float | None = None

# Table: g04_cotton
class G04Cotton(SQLModel, table=True):
    __tablename__ = "g04_cotton"
    id: Optional[int] = Field(default=None, primary_key=True)
    g04_cotton_id: int | None = Field(default=None)
    Date_Time: str | None = None
    X: float | None = None
    Y: float | None = None
    Node: int | None = None
    RMassM: float | None = None
    RMassY: float | None = None
    RDenM: float | None = None
    RDenY: float | None = None
    WaterSink: float | None = None
    NitSink: float | None = None
    GasSink: float | None = None

    # Table: g05_cotton
class G05Cotton(SQLModel, table=True):
    __tablename__ = "g05_cotton"
    id: Optional[int] = Field(default=None, primary_key=True)
    g05_cotton_id: int | None = Field(default=None)
    Date_Time: str
    PSoilEvap: float | None = None
    ASoilEVap: float | None = None
    PET_PEN: float | None = None
    PE_T_int: float | None = None
    transp: float | None = None
    CumRain: float | None = None
    infil: float | None = None
    FLuxAct: float | None = None
    Drainage: float | None = None
    N_Leach: float | None = None
    Runoff: float | None = None
    cover: float | None = None
    PSIM: float | None = None
    SeasPSoEv: float | None = None
    SeasASoEv: float | None = None
    SeasPTran: float | None = None
    SeasATran: float | None = None
    SeasRain: float | None = None
    SeasInfil: float | None = None
    ThetaAvail: float | None = None
    CO2FLux: float | None = None
    O2FLux: float | None = None
    N2OFLux: float | None = None
    
# Table: g07_cotton
class G07Cotton(SQLModel, table=True):
    __tablename__ = "g07_cotton"
    id: Optional[int] = Field(default=None, primary_key=True)
    g07_cotton_id: int | None = Field(default=None)
    Date_Time: str | None = None
    X: float | None = None
    Y: float | None = None
    Humus_N: float | None = None
    Humus_C: float | None = None
    Litter_N: float | None = None
    Litter_C: float | None = None
    Manure_N: float | None = None
    Manure_C: float | None = None
    Root_N: float | None = None
    Root_C: float | None = None

class PlantStressCotton(SQLModel, table=True):
    __tablename__ = "plantStress_cotton"

    id: Optional[int] = Field(default=None, primary_key=True)
    plantStress_cotton_id: int | None = Field(default=None)
    Date_Time: datetime
    W_stress: Optional[float] = None
    N_Veg_Str: Optional[float] = None
    N_Fru_Str: Optional[float] = None
    N_Rt_Str: Optional[float] = None
    C_Stress: Optional[float] = None

# --- Soybean Table Models ---


# Table: g01_soybean
class G01Soybean(SQLModel, table=True):
    __tablename__ = "g01_soybean"
    id: Optional[int] = Field(default=None, primary_key=True)
    g01_soybean_id: int | None = Field(default=None)
    Date_Time: str | None = None
    jday: int | None = None
    RSTAGE: float | None = None
    VSTAGE: float | None = None
    PFD: float | None = None
    SolRad: float | None = None
    Tair: float | None = None
    Tcan: float | None = None
    Pgross: float | None = None
    Pnet: float | None = None
    gs: float | None = None
    PSIL: float | None = None
    LAI: float | None = None
    LAREAT: float | None = None
    totalDM: float | None = None
    rootDM: float | None = None
    stemDM: float | None = None
    leafDM: float | None = None
    seedDM: float | None = None
    podDM: float | None = None
    DeadDM: float | None = None
    Tr_pot: float | None = None
    Tr_act: float | None = None
    wstress: float | None = None
    Nstress: float | None = None
    Limit: str | None = None
    
    # Table: g03_soybean
class G03Soybean(SQLModel, table=True):
    __tablename__ = "g03_soybean"
    id: Optional[int] = Field(default=None, primary_key=True)
    g03_soybean_id: int | None = Field(default=None)
    Date_Time: str | None = None
    X: float | None = None
    Y: float | None = None
    hNew: float | None = None
    thNew: float | None = None
    Q: float | None = None
    NO3N: float | None = None
    NH4N: float | None = None
    Temp: float | None = None
    CO2Conc: float | None = None
    O2Conc: float | None = None
    N2OConc: float | None = None

# Table: g04_soybean
class G04Soybean(SQLModel, table=True):
    __tablename__ = "g04_soybean"
    id: Optional[int] = Field(default=None, primary_key=True)
    g04_soybean_id: int | None = Field(default=None)
    Date_Time: str | None = None
    X: float | None = None
    Y: float | None = None
    Node: int | None = None
    RMassM: float | None = None
    RMassY: float | None = None
    RDenM: float | None = None
    RDenY: float | None = None
    WaterSink: float | None = None
    NitSink: float | None = None
    GasSink: float | None = None
# Table: g05_maize
class G05Soybean(SQLModel, table=True):
    __tablename__ = "g05_soybean"
    id: Optional[int] = Field(default=None, primary_key=True)
    g05_soybean_id: int = Field(primary_key=True)
    Date_Time: str
    PSoilEvap: float | None = None
    ASoilEVap: float | None = None
    PET_PEN: float | None = None
    PE_T_int: float | None = None
    transp: float | None = None
    CumRain: float | None = None
    infil: float | None = None
    FLuxAct: float | None = None
    Drainage: float | None = None
    N_Leach: float | None = None
    Runoff: float | None = None
    cover: float | None = None
    PSIM: float | None = None
    SeasPSoEv: float | None = None
    SeasASoEv: float | None = None
    SeasPTran: float | None = None
    SeasATran: float | None = None
    SeasRain: float | None = None
    SeasInfil: float | None = None
    ThetaAvail: float | None = None
    CO2FLux: float | None = None
    O2FLux: float | None = None
    N2OFLux: float | None = None
# Table: g07_soybean
class G07Soybean(SQLModel, table=True):
    __tablename__ = "g07_soybean"
    id: Optional[int] = Field(default=None, primary_key=True)
    g07_soybean_id: int | None = Field(default=None)
    Date_Time: str | None = None
    X: float | None = None
    Y: float | None = None
    Humus_N: float | None = None
    Humus_C: float | None = None
    Litter_N: float | None = None
    Litter_C: float | None = None
    Manure_N: float | None = None
    Manure_C: float | None = None
    Root_N: float | None = None
    Root_C: float | None = None
    
class NitrogenSoybean(SQLModel, table=True):
    __tablename__ = "nitrogen_soybean"
    id: Optional[int] = Field(default=None, primary_key=True)
    nitrogen_soybean_id: int | None = Field(default=None)
    Date_Time: datetime
    total_N: Optional[float] = None
    leaf_N: Optional[float] = None
    stem_N: Optional[float] = None
    pod_N: Optional[float] = None
    seed_N: Optional[float] = None
    root_N: Optional[float] = None
    dead_N: Optional[float] = None
    plant_N_C: Optional[float] = None
    N_uptake: Optional[float] = None
    N_demand: Optional[float] = None
    Nstress: Optional[float] = None
    
class PlantStressSoybean(SQLModel, table=True):
    __tablename__ = "plantStress_soybean"

    id: Optional[int] = Field(default=None, primary_key=True)
    plantStress_soybean_id: int | None = Field(default=None)
    Date_Time: datetime
    wstress: Optional[float] = None
    Nstress: Optional[float] = None
    Cstress: Optional[float] = None
    NEffect_ve: Optional[float] = None
    wstress2: Optional[float] = None


# --- Fallow Table Models ---

# G03_fallow
class G03Fallow(SQLModel, table=True):
    __tablename__ = "g03_fallow"
    id: Optional[int] = Field(default=None, primary_key=True)
    g03_fallow_id:int | None = Field(default=None)
    Date_Time: Optional[float] = None
    X: Optional[float] = None
    Y: Optional[float] = None
    hNew: Optional[float] = None
    thNew: Optional[float] = None
    Q: Optional[float] = None
    NO3N: Optional[float] = None
    NH4N: Optional[float] = None
    Temp: Optional[float] = None
    CO2Conc: Optional[float] = None
    O2Conc: Optional[int] = None
    N2OConc: Optional[float] = None
    
# Table: g05_fallow
class G05Fallow(SQLModel, table=True):
    __tablename__ = "g05_fallow"
    id: Optional[int] = Field(default=None, primary_key=True)
    g05_fallow_id: int | None = Field(default=None)
    Date_Time: float | None = None
    PSoilEvap: float | None = None
    ASoilEVap: float | None = None
    PET_PEN: float | None = None
    PE_T_int: float | None = None
    transp: float | None = None
    CumRain: float | None = None
    infil: float | None = None
    FLuxAct: float | None = None
    Drainage: float | None = None
    N_Leach: float | None = None
    Runoff: float | None = None
    cover: float | None = None
    PSIM: float | None = None
    SeasPSoEv: float | None = None
    SeasASoEv: float | None = None
    SeasPTran: float | None = None
    SeasATran: float | None = None
    SeasRain: float | None = None
    SeasInfil: float | None = None
    ThetaAvail: float | None = None
    CO2FLux: float | None = None
    O2FLux: float | None = None
    N2OFLux: float | None = None

class G07Fallow(SQLModel, table=True):
    __tablename__ = "g07_fallow"
    id: Optional[int] = Field(default=None, primary_key=True)
    g07_fallow_id: int | None = Field(default=None)
    Date_Time: str
    X: Optional[float] = None
    Y: Optional[float] = None
    Humus_N: Optional[float] = None
    Humus_C: Optional[float] = None
    Litter_N: Optional[float] = None
    Litter_C: Optional[float] = None
    Manure_N: Optional[float] = None
    Manure_C: Optional[float] = None
    Root_N: Optional[float] = None
    Root_C: Optional[float] = None

# Table: plantStress_fallow (potato/fallow)
class PlantStressFallow(SQLModel, table=True):
    __tablename__ = "plantStress_fallow"
    id: Optional[int] = Field(default=None, primary_key=True)
    plantStress_fallow_id: int | None = Field(default=None)
    date: str | None = None
    time: str | None = None
    waterstress: str | None = None
    N_stress: str | None = None
    Shade_Stress: str | None = None
    PotentialArea: str | None = None

