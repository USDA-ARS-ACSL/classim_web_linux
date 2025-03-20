BEGIN TRANSACTION;
DROP TABLE IF EXISTS "g05_maize";
CREATE TABLE IF NOT EXISTS "g05_maize" (
	"g05_maize_id"	INTEGER,
	"Date_Time"	TEXT,
	"PSoilEvap"	NUMERIC,
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
	"ThetaAvail" REAL,
	"SeasPTran"	REAL,
	"SeasATran"	REAL,
	"SeasRain"	REAL,
	"SeasInfil"	REAL,
	"CO2FLux"	REAL,
	"O2FLux"	REAL
);
COMMIT;
