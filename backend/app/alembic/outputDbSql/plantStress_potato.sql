BEGIN TRANSACTION;
DROP TABLE IF EXISTS "plantStress_potato";
CREATE TABLE IF NOT EXISTS "plantStress_potato" (
	"plantStress_potato_id"	INTEGER NOT NULL,
	"Date_Time"	TEXT,
	"waterstressfactor"	REAL,
	"PSIEffect_leaf"	INTEGER,
	"NEffect_leaf"	REAL,
	"PSIEffect_Pn"	REAL,
	"NEffect_Pn"	REAL,
	"Dev_stage"	REAL,
	"Heat_veg"	REAL,
	"Heat_repre"	REAL
);
COMMIT;
