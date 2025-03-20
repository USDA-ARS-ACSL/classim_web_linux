BEGIN TRANSACTION;
DROP TABLE IF EXISTS "g05_fallow";
CREATE TABLE IF NOT EXISTS "g05_fallow" (
	"g05_fallow_id"	INTEGER,
	"Date_Time"	REAL,
	"PSoilEvap"	REAL,
	"ASoilEVap"	REAL,
	"PET_PEN"	REAL,
	"PE_T_int"	REAL,
	"transp"	REAL,
	"CumRain"	REAL,
	"infil"	REAL,
	"FLuxAct"	REAL,
	"Drainage"	REAL,
	"N_Leach"	REAL,
	"Runoff"	REAL,
	"cover"	REAL,
	"PSIM"	REAL,
	"SeasPSoEv"	REAL,
	"SeasASoEv"	REAL,
	"SeasPTran"	REAL,
	"SeasATran"	REAL,
	"SeasRain"	REAL,
	"SeasInfil"	REAL,
	"CO2Flux"	REAL,
	"O2Flux"	REAL
);
COMMIT;
