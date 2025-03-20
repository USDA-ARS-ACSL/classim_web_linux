BEGIN TRANSACTION;
DROP TABLE IF EXISTS "g07_fallow";
CREATE TABLE IF NOT EXISTS "g07_fallow" (
	"g07_fallow_id"	INTEGER,
	"Date_Time"	TEXT,
	"X"	REAL,
	"Y"	REAL,
	"Humus_N"	REAL,
	"Humus_C"	REAL,
	"Litter_N"	REAL,
	"Litter_C"	REAL,
	"Manure_N"	REAL,
	"Manure_C"	REAL,
	"Root_N"	REAL,
	"Root_C"	REAL
);
COMMIT;
