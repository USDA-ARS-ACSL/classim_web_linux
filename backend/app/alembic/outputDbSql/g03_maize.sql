BEGIN TRANSACTION;
DROP TABLE IF EXISTS "g03_maize";
CREATE TABLE IF NOT EXISTS "g03_maize" (
	"g03_maize_id"	INTEGER,
	"Date_Time"	TEXT,
	"X"	NUMERIC,
	"Y"	NUMERIC,
	"hNew"	REAL,
	"thNew"	REAL,
	"Q"	REAL,
	"NO3N"	REAL,
	"NH4N"	REAL,
	"Temp"	REAL,
	"CO2Conc"	REAL,
	"O2Conc"	REAL
);
COMMIT;
