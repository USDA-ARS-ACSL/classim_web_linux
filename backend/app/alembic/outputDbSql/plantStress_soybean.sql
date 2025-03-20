BEGIN TRANSACTION;
DROP TABLE IF EXISTS "plantStress_soybean";
CREATE TABLE IF NOT EXISTS "plantStress_soybean" (
	"plantStress_soybean_id"	INTEGER,
	"Date_Time"	TIMESTAMP,
	"wstress"	REAL,
	"Nstress"	REAL,
	"Cstress"	REAL,
	"NEffect_ve"	REAL,
	"wstress2"	REAL
);
COMMIT;
