BEGIN TRANSACTION;
DROP TABLE IF EXISTS "g01_soybean";
CREATE TABLE IF NOT EXISTS "g01_soybean" (
	"g01_soybean_id"	INTEGER,
	"Date_Time"	TIMESTAMP,
	"jday"	INTEGER,
	"RSTAGE"	REAL,
	"VSTAGE"	REAL,
	"PFD"	REAL,
	"SolRad"	REAL,
	"Tair"	REAL,
	"Tcan"	REAL,
	"Pgross"	REAL,
	"Pnet"	REAL,
	"gs"	REAL,
	"PSIL"	REAL,
	"LAI"	REAL,
	"LAREAT"	REAL,
	"totalDM"	REAL,
	"rootDM"	REAL,
	"stemDM"	REAL,
	"leafDM"	REAL,
	"seedDM"	REAL,
	"podDM"	REAL,
	"DeadDM"	REAL,
	"Tr_pot"	REAL,
	"Tr_act"	REAL,
	"wstress"	REAL,
	"Nstress"	REAL,
	"Limit"	TEXT
);
COMMIT;
