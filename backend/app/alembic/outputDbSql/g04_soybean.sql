BEGIN TRANSACTION;
DROP TABLE IF EXISTS "g04_soybean";
CREATE TABLE IF NOT EXISTS "g04_soybean" (
	"g04_soybean_id"	INTEGER,
	"Date_Time"	TIMESTAMP,
	"X"	REAL,
	"Y"	REAL,
	"Node"	INTEGER,
	"RMassM"	REAL,
	"RMassY"	REAL,
	"RDenM"	REAL,
	"RDenY"	REAL,
	"WaterSink"	REAL,
	"NitSink"	REAL,
	"GasSink"	REAL
);
COMMIT;
