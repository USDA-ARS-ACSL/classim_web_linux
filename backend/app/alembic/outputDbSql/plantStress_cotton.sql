BEGIN TRANSACTION;
DROP TABLE IF EXISTS "plantStress_cotton";
CREATE TABLE IF NOT EXISTS "plantStress_cotton" (
	"plantStress_cotton_id"	INTEGER,
	"Date_Time"	TIMESTAMP,
	"W_stress"	REAL,
	"N_Veg_Str"	REAL,
	"N_Fru_Str"	REAL,
	"N_Rt_Str"	REAL,
	"C_Stress"	REAL
);
COMMIT;
