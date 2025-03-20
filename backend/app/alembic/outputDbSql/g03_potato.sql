BEGIN TRANSACTION;
DROP TABLE IF EXISTS "g03_potato";
CREATE TABLE IF NOT EXISTS "g03_potato" (
	"g03_potato_id"	INTEGER NOT NULL,
	"Date_Time"	TEXT NOT NULL,
	"X"	REAL,
	"Y"	REAL,
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
