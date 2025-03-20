BEGIN TRANSACTION;
DROP TABLE IF EXISTS "g05_cotton";
CREATE TABLE IF NOT EXISTS "g05_cotton" (
	"g05_cotton_id"	INTEGER,
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
