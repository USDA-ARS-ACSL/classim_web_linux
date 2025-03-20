BEGIN TRANSACTION;
DROP TABLE IF EXISTS "plantStress_maize";
CREATE TABLE IF NOT EXISTS "plantStress_maize" (
	"plantStress_maize_id"	INTEGER NOT NULL,
	"Date_Time"	TEXT NOT NULL,
	"waterstress"	REAL,
	"N_stress"	REAL,
	"Shade_Stress"	REAL,
	"PotentialArea"	REAL
);
COMMIT;
