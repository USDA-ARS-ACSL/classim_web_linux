BEGIN TRANSACTION;
DROP TABLE IF EXISTS "plantStress_fallow";
CREATE TABLE IF NOT EXISTS "plantStress_fallow" (
	"date"	TEXT,
	"time"	TEXT,
	"waterstress"	TEXT,
	"N_stress"	TEXT,
	"Shade_Stress"	TEXT,
	"PotentialArea"	TEXT,
	"plantStress_fallow_id"	INTEGER
);
COMMIT;
