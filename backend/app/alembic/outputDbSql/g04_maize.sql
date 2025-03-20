BEGIN TRANSACTION;
DROP TABLE IF EXISTS "g04_maize";
CREATE TABLE IF NOT EXISTS "g04_maize" (
	"g04_maize_id"	INTEGER,
	"Date_Time"	TEXT,
	"X"	REAL,
	"Y"	REAL,
	"Node"	REAL,
	"RMassM"	REAL,
	"RMassY"	REAL,
	"RDenM"	REAL,
	"RDenY"	REAL,
	"WaterSink"	REAL,
	"NitSink"	REAL,
	"GasSink"	REAL
);
COMMIT;
