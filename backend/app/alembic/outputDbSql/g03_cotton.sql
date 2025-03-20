BEGIN TRANSACTION;
DROP TABLE IF EXISTS "g03_cotton";
CREATE TABLE IF NOT EXISTS "g03_cotton" (
	"g03_cotton_id"	INTEGER,
	"Date_Time"	TIMESTAMP,
	"X"	REAL,
	"Y"	REAL,
	"hNew"	NUMERIC,
	"thNew"	REAL,
	"Q"	REAL,
	"NO3N"	REAL,
	"NH4N"	REAL,
	"Temp"	REAL,
	"CO2Conc"	REAL,
	"O2Conc"	REAL
);
COMMIT;
