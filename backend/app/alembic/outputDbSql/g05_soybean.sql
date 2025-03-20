BEGIN TRANSACTION;
DROP TABLE IF EXISTS "g05_soybean";
CREATE TABLE IF NOT EXISTS "g05_soybean" (
	"g05_soybean_id"	INTEGER,
	"Date_Time"	TIMESTAMP,
	"PSoilEvap"	REAL,
	"ASoilEVap"	REAL,
	"PET_PEN"	REAL,
	"PE_T_int"	REAL,
	"transp"	REAL,
	"CumRain"	REAL,
	"infil"	REAL,
	"FLuxAct"	REAL,
	"Drainage"	REAL,
	"N_Leach"	REAL DEFAULT 0,
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
