BEGIN TRANSACTION;
DROP TABLE IF EXISTS "g03_soybean";
CREATE TABLE IF NOT EXISTS "g03_soybean" (
	"g03_soybean_id"	INTEGER,
	"Date_Time"	TIMESTAMP,
	"X"	NUMERIC,
	"Y"	NUMERIC,
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
