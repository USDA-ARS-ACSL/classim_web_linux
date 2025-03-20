BEGIN TRANSACTION;
DROP TABLE IF EXISTS "g03_fallow";
CREATE TABLE IF NOT EXISTS "g03_fallow" (
	"g03_fallow_id"	INTEGER,
	"Date_Time"	REAL,
	"X"	REAL,
	"Y"	REAL,
	"hNew"	REAL,
	"thNew"	REAL,
	"Q"	REAL,
	"NO3N"	REAL,
	"NH4N"	REAL,
	"Temp"	REAL,
	"CO2Conc"	REAL,
	"O2Conc"	INTEGER
);
COMMIT;
