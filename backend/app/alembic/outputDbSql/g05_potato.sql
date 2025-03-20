BEGIN TRANSACTION;
DROP TABLE IF EXISTS "g05_potato";
CREATE TABLE IF NOT EXISTS "g05_potato" (
	"g05_potato_id"	INTEGER NOT NULL,
	"Date_Time"	TEXT NOT NULL,
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
