BEGIN TRANSACTION;
DROP TABLE IF EXISTS "nitrogen_soybean";
CREATE TABLE IF NOT EXISTS "nitrogen_soybean" (
	"nitrogen_soybean_id"	INTEGER,
	"Date_Time"	TIMESTAMP,
	"total_N"	REAL,
	"leaf_N"	REAL,
	"stem_N"	REAL,
	"pod_N"	REAL,
	"seed_N"	REAL,
	"root_N"	REAL,
	"dead_N"	REAL,
	"plant_N_C"	REAL,
	"N_uptake"	REAL,
	"N_demand"	REAL,
	"Nstress"	REAL
);
COMMIT;
