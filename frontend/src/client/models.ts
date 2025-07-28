export type Body_login_login_access_token = {
  grant_type?: string | null;
  username: string;
  password: string;
  scope?: string;
  client_id?: string | null;
  client_secret?: string | null;
};

export type HTTPValidationError = {
  detail?: Array<ValidationError>;
};

export type ItemCreate = {
  title: string;
  description?: string | null;
};

export type ItemPublic = {
  title: string;
  description?: string | null;
  id: number;
  owner_id: number;
};

export type ItemUpdate = {
  title?: string | null;
  description?: string | null;
};

export type ItemsPublic = {
  data: Array<ItemPublic>;
  count: number;
};

export type Message = {
  message: string;
};

export type DownloadMessage = {
  message: string;
  error: string;
};

export type NewPassword = {
  token: string;
  new_password: string;
};

export type Token = {
  access_token: string;
  token_type?: string;
};

export type UpdatePassword = {
  current_password: string;
  new_password: string;
};

export type UserCreate = {
  email: string;
  is_active?: boolean;
  is_superuser?: boolean;
  full_name?: string | null;
  password: string;
};

export type UserPublic = {
  email: string;
  is_active?: boolean;
  is_superuser?: boolean;
  full_name?: string | null;
  id: number;
};

export type Simulation = {
  id: number;
  site: string;
  soil: string;
  stationtype: string;
  weather: string;
  treatment: string;
  startyear: number;
  endyear: number;
  waterstress: number;
  nitrostress: number;
  tempVar: number;
  rainVar: number;
  CO2Var: number;
  status: number
}

export type SimulationApiResponse = {
  data: Array<Simulation>; // The actual simulations are inside the `data` field
}

export type UserRegister = {
  email: string;
  password: string;
  full_name?: string | null;
};

export type UserUpdate = {
  email?: string | null;
  is_active?: boolean;
  is_superuser?: boolean;
  full_name?: string | null;
  password?: string | null;
};

export type UserUpdateMe = {
  full_name?: string | null;
  email?: string | null;
};

export type UsersPublic = {
  data: Array<UserPublic>;
  count: number;
};

export type ValidationError = {
  loc: Array<string | number>;
  msg: string;
  type: string;
};

export type FaqPublic = {
  tabname: string;
  question: string;
  answer: string;
  id: number;
};

export type FaqsPublic = {
  data: Array<FaqPublic>;
  count: number;
};

export type SitePublic = {
  id: number;
  sitename: string;
  rlat: number;
  rlon: number;
  altitude?: number | 0;
  owner_id: number;
};

export type SitesPublic = {
  data: Array<SitePublic>;
  count: number;
};

export type Simulations = {
  id: number;
  message: string;
}

export type SoilWithLatLon = {
  data: Array<{
    [key: string]: number | string | string[];
  }>;
};

export type SiteCreate = {
  sitename: string;
  rlat: number;
  rlon: number;
  altitude?: number | 0;
};

export type SiteUpdate = {
  sitename: string | null;
  rlat: number | null;
  rlon: number | null;
  altitude?: number | 0;
};

export type SoilPublic = {
  id: number;
  soilname: string;
  site_id: number;
  o_gridratio_id: number;
  owner_id: number;
};

export type SoilsPublic = {
  data: Array<SoilPublic>;
  count: number;
};

export type SoilCreate = {
  soilname: string;
  site_id: number;
  o_gridratio_id: number;
};

export type SoilUpdate = {
  soilname: string | null;
  site_id: number | null;
  o_gridratio_id: number | null;
};

export type SoilPublicTable = {
  id: number;
  o_sid: number;
  initType: number | null;
  Bottom_depth: number | null;
  OM_pct: number | null;
  NO3: number | null;
  NH4: number | null;
  HnNew: number | null;
  Tmpr: number | null;
  Sand: number | null;
  Silt: number | null;
  Clay: number | null;
  TH33: number | null;
  TH1500: number | null;
  kh: number | null;
  kl: number | null;
  km: number | null;
  kn: number | null;
  kd: number | null;
  fe: number | null;
  fh: number | null;
  r0: number | null;
  rL: number | null;
  rm: number | null;
  fa: number | null;
  nq: number | null;
  cs: number | null;
  thr: number | null;
 th: number | null;
  ths: number | null;
  tha: number | null;
  Alfa: number | null;
  n: number | null;
  Ks: number | null;
  Kk: number | null;
  thk: number | null;
  BD: any | null;
  CO2: any | null;
  O2: any | null;
  N2O: any | null;
};

export type SoilFetchPublicTable = {
  Bottom_depth: number | null;
  OM_pct: number | null;
  NO3: number | null;
  NH4: number | null;
  HnNew: number | null;
  Tmpr: number | null;
  Sand: number | null;
  Silt: number | null;
  Clay: number | null;
  initType: number | null;
  TH33: number | null;
  TH1500: number | null;
  kh: number | null;
  kl: number | null;
  km: number | null;
  kn: number | null;
  kd: number | null;
  fe: number | null;
  fh: number | null;
  r0: number | null;
  rL: number | null;
  rm: number | null;
  fa: number | null;
  nq: number | null;
  cs: number | null;
  thr: number | null;
 th: number | null;
  ths: number | null;
  tha: number | null;
  Alfa: number | null;
  n: number | null;
  Ks: number | null;
  Kk: number | null;
  thk: number | null;
  BD: any | null;
  CO2: any | null;
  O2: any | null;
  N2O: any | null;
};

export type SoilsPublicTable = {
  data: Array<SoilPublicTable>;
  count: number;
};

export type SoilCreateTable = {
  o_sid: number;
  initType: number | null;
  Bottom_depth: number | null;
  OM_pct: number | null;
  NO3: number | null;
  NH4: number | null;
  HnNew: number | null;
  Tmpr: number | null;
  Sand: number | null;
  Silt: number | null;
  Clay: number | null;
  TH33: number | null;
  TH1500: number | null;
  kh: number | null;
  kl: number | null;
  km: number | null;
  kn: number | null;
  kd: number | null;
  fe: number | null;
  fh: number | null;
  r0: number | null;
  rL: number | null;
  rm: number | null;
  fa: number | null;
  nq: number | null;
  cs: number | null;
  thr: number | null;
 th: number | null;
  ths: number | null;
  tha: number | null;
  Alfa: number | null;
  n: number | null;
  Ks: number | null;
  Kk: number | null;
  thk: number | null;
  BD: any | null;
  CO2: any | null;
  O2: any | null;
  N2O: any | null;
};

export type SoilUpdateTable = {
  o_sid: number;
  initType: number | null;
  Bottom_depth: number | null;
  OM_pct: number | null;
  NO3: number | null;
  NH4: number | null;
  HnNew: number | null;
  Tmpr: number | null;
  Sand: number | null;
  Silt: number | null;
  Clay: number | null;
  TH33: number | null;
  TH1500: number | null;
  kh: number | null;
  kl: number | null;
  km: number | null;
  kn: number | null;
  kd: number | null;
  fe: number | null;
  fh: number | null;
  r0: number | null;
  rL: number | null;
  rm: number | null;
  fa: number | null;
  nq: number | null;
  cs: number | null;
  thr: number | null;
 th: number | null;
  ths: number | null;
  tha: number | null;
  Alfa: number | null;
  n: number | null;
  Ks: number | null;
  Kk: number | null;
  thk: number | null;
  BD: any | null;
  CO2: any | null;
  O2: any | null;
  N2O: any | null;
};

export type SoilAPIData = {
  id?: number;
  one: number;
  two: number;
  three: number;
  four: number;
  five: string;
  six: number;
  seven: number;
  eight: number;
  nine: number;
  ten: number;
  eleven: number;
  twelve: number;
  default: string;
};

// Gridratio

export type GridRatioList = {
  gridratio_id: number | null;
  SR1: number | null;
  SR2: number | null;
  IR1: number | null;
  IR2: number | null;
  PlantingDepth: number | null;
  XLimitRoot: number | null;
  BottomBC: number | null;
  GasBCTop: number | null;
  GasBCBottom: number | null;
};

export type GridRatiosList = {
  data: Array<GridRatioList>;
  count: number;
};

// Weather Meta

export type WeatherMetaPublic = {
  id: number;
  stationtype: string | null;
  site: string | null;
  Bsolar: number | null;
  Btemp: number | null;
  Atemp: number | null;
  BWInd: number | null;
  BIR: number | null;
  AvgWind: number | null;
  AvgRainRate: number | null;
  ChemCOnc: number | null;
  AvgCO2: number | null;
};

export type WeatherMetasPublic = {
  data: Array<WeatherMetaPublic>;
  count: number;
};

export type WeatherMetaCreate = {
  id: number | null;
  stationtype: string | null;
  site: string | null;
  Bsolar: number | null;
  Btemp: number | null;
  Atemp: number | null;
  BWInd: number | null;
  BIR: number | null;
  AvgWind: number;
  AvgRainRate: number;
  ChemCOnc: number | null;
  AvgCO2: number;
};

export type WeatherMetaUpdate = {
  stationtype: string | null;
  site: string | null;
  Bsolar: number | null;
  Btemp: number | null;
  Atemp: number | null;
  BWInd: number | null;
  BIR: number | null;
  AvgWind: number;
  AvgRainRate: number;
  ChemCOnc: number | null;
  AvgCO2: number;
};

export type WeatherDataPublic = {
  id: number;
  stationtype: string | null;
  weather_id: string | null;
  jday: number | null;
  date: string | null;
  hour: number | null;
  srad: string | null;
  wind: string | null;
  rh: string | null;
  rain: string | null;
  tmax: string | null;
  tmin: string | null;
  temperature: string | null;
  co2: string | null;
};

export type WeatherDataCreate = {
  id: number;
  stationtype: string | null;
  weather_id: string | null;
  jday: number | null;
  date: string | null;
  hour: number | null;
  srad: string | null;
  wind: string | null;
  rh: string | null;
  rain: string | null;
  tmax: string | null;
  tmin: string | null;
  temperature: string | null;
  co2: string | null;
};

export type WeatherDatasPublic = {
  data: Array<WeatherDataPublic>;
  count: number;
};

export type WeatherAggrigateData = {
  data: {
    weather_id: number;
    date_min: string;
    date_max: string;
    srad_min: number;
    srad_max: number;
    wind_min: number;
    wind_max: number;
    rh_min: number;
    rh_max: number;
    rain_min: number;
    rain_max: number;
    tmax_min: number;
    tmax_max: number;
    tmin_min: number;
    tmin_max: number;
    temperature_min: number;
    temperature_max: number;
  };

};

export type CropsMetaPublic = {
  id: number;
  cropname: string | null;
};

export type CropsMetasPublic = {
  length: number;
  data: Array<CropsMetaPublic>;
  count: number;
};



export type CultivarCropPublic = {
  id: number;
  hybridname: string;
};

export type CultivarCropsPublic = {
  data: Array<CultivarCropPublic>;
};
export type CultivarsPublic = {
  data: Array<{}>
}
export type Experiment = {
  exid: number | null;
  name: string | null;
  crop: string | null;
  treatments: Treatment[];
};

export type Treatment = {
  t_exid: number | null;
  name: string | null;
  operations: Operation[];
}

export type ExperimentPublic = {
  exid: number;
  name: string;
  crop: string;
  treatments: Treatment[];
};

export type ExperimentDataCreate = {
  exid: number | null;
  name: string | null;
  crop: string | null;
};

export type ExperimentsPublic = {
  data: Array<ExperimentPublic>;
  count: number;
};

export type TreatmentPublic = {
  tid: number;
  t_exid: number;
  name: string;  
};

export type TreatmentsPublic = {
  data: Array<TreatmentPublic>;
  count: number;
};

export type TreatmentDataCreate = {
  tid: number | null;
  t_exid: number | null;
  name: string | null; 
  crop: string | null;
  expname: string | null;
};

export type TreatmentDataCopy = {
  experimentname: string | null;
  treatmentname: string | null; 
  cropname: string | null;
  newtreatmentname: string | null;
};

export type Operation = {
  name: string;
  odate: string;
  o_t_exid: number | null;
}

export type OperationPublic = {
  opID: number;
  name: string;
  odate: string;
  o_t_exid: number | null;  
};

export type OperationDataCreate = {
  opID?: number | null;
  name?: string | null;
  exid?: string | null;
  cropname?: string | null;
  treatmentname?: string | null;
  operation_record?: string[] | null;
  initCond_record?: string[] | null;
  tillage_record?: string[] | null;
  fert_record?: string[] | null;
  fertNut_record?: number[] | null;
  PGR_record?: any[] | null;
  SR_record?: string[] | null;
  irrAmt_record?: string[] | null;
};


export type OperationRequest = {  
  treatmentname: string
  experimentname: string
  cropname: string
  opname: string
}




export type OperationsPublic = {
  data: Array<OperationPublic>;
  count: number;
};

export type  OperationDateResponse = {
  [x: string]: string;
  date: string
}    

export type FertilizerClass = {  
  fertilizationClass: string
}

export type TillageType = {
  id: number;
  tillage: string;
  description: string;
}

export type TillageTypes = {
  data: Array<TillageType>;
  count: number;
};
export type TillageOp = {
  tillage: string;
}
export type TillageOpResponse = {
  opID: number;
  tillage: string;
}


export type FertilizationOp = {
  fertilization: any;
  nutrients: any;  
  opID: number;
  fertilizationClass: string;
  depth: number;
}

export type PGROp = {
  PGRChemical: string;
  applicationType: string;
  bandwidth: number;
  applicationRate: number;
  PGRUnit: string;
}

export type SrOp = {
  residueType: string;
  applicationType: string;
  applicationTypeValue: number;
}

export type IrrigationOp = {
  irrigationClass: string;
  AmtIrrAppl: number;
}

export type PGRChemical = {
  id: number;
  PGRChemical: string;
}

export type SurfResType = {
  id: number;
  residueType: string;
}

export type SurfResApplType = {
  id: number;
  applicationType: string;
}

export type IrrigationClass = {
  irrigationClass: string;
}

export type PGRApplType = {
  id: number;
  applicationType: string;
  code: number;
}

export type PGRUnit = {
  id: number;
  PGRUnit: string;
  code: number;
}

export type InitCondOp = {
  pop: number;
  autoirrigation: number;
  xseed: number;
  yseed: number;
  cec: number;
  eomult: number;
  rowSpacing: number;
  cultivar: string;
  seedpieceMass: number;
}
export type InitCondOpPublic = {
  pop: number;
  autoirrigation: number;
  xseed: number;
  yseed: number;
  cec: number;
  eomult: number;
  rowSpacing: number;
  cultivar: string;
  seedpieceMass: number;
  odate: string;
}

export type OperationData = {
  op_id: number | null;
  opName: string | null;
  treatmentid: number | null;
  opDate: string | null;
  tillageType: string | null;
}
export type OperationDataUpdate = {
  requestBody: OperationData
}
export type InitCondOpDataUpdate = {
  treatmentid: number;
  pop: number | null;
  autoirrigation: number | null;
  xseed: number | null;
  yseed: number | null;
  cec: number | null;
  eomult: number | null;
  rowSpacing: number | null;
  cultivar: string | null;
  seedpieceMass: number | null;
  odate?: string | null;
};

export type ExpOtData = {
  co2_variance: {
    options: string[];
    default: string;
  };
  temperature_variance: {
    options: string[];
    default: string;
  };
  rain_variance:{
    options: string[];
    default: string;
  };
  end_year: string;
  start_year: string;
};