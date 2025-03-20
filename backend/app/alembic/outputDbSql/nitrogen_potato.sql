BEGIN TRANSACTION;
DROP TABLE IF EXISTS "nitrogen_potato";
CREATE TABLE IF NOT EXISTS "nitrogen_potato" (
	"nitrogen_potato_id"	INTEGER NOT NULL,
	"Date_Time"	INTEGER,
	"tot_N"	REAL,
	"leaf_N"	REAL,
	"stem_N"	REAL,
	"root_N"	REAL,
	"tuber_N"	REAL,
	"dead_N"	REAL,
	"tot_N_C"	REAL,
	"leaf_N_C"	REAL,
	"stem_N_C"	REAL,
	"root_N_C"	REAL,
	"tubr_N_C"	REAL,
	"N_uptake"	REAL,
	"N_demand"	REAL,
	"seed_N"	REAL,
	"Nstress"	REAL
);
COMMIT;
