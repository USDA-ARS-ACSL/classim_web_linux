INSERT INTO "biologydefault" ("dthH","dthL","es","Th_m","tb","QT","dThD","Th_d","id") VALUES (0.1,0.08,0.6,1.0,25.0,3.0,0.1,2.0,1);
INSERT INTO "classimVersion" ("id","version","date","comment") VALUES (1,'2.2.0.1','5/15/2023','Added map to the site tab.');
INSERT INTO "crops" ("cropname") VALUES ('maize');
INSERT INTO "crops" ("cropname") VALUES ('potato');
INSERT INTO "crops" ("cropname") VALUES ('soybean');
INSERT INTO "crops" ("cropname") VALUES ('fallow');
INSERT INTO "crops" ("cropname") VALUES ('cotton');
INSERT INTO "dispersivity" ("id","texturecl","alpha") VALUES (1,'clay loam',8.1);
INSERT INTO "dispersivity" ("id","texturecl","alpha") VALUES (2,'clay',12.8);
INSERT INTO "dispersivity" ("id","texturecl","alpha") VALUES (3,'loam',4.6);
INSERT INTO "dispersivity" ("id","texturecl","alpha") VALUES (4,'loamy sand',1.6);
INSERT INTO "dispersivity" ("id","texturecl","alpha") VALUES (5,'sand',0.8);
INSERT INTO "dispersivity" ("id","texturecl","alpha") VALUES (6,'sandy clay',10.9);
INSERT INTO "dispersivity" ("id","texturecl","alpha") VALUES (7,'sandy clay loam',6.0);
INSERT INTO "dispersivity" ("id","texturecl","alpha") VALUES (8,'sandy loam',3.4);
INSERT INTO "dispersivity" ("id","texturecl","alpha") VALUES (9,'silt',7.0);
INSERT INTO "dispersivity" ("id","texturecl","alpha") VALUES (10,'silty clay',11.0);
INSERT INTO "dispersivity" ("id","texturecl","alpha") VALUES (11,'silty clay loam',9.6);
INSERT INTO "dispersivity" ("id","texturecl","alpha") VALUES (12,'silt loam',5.6);
INSERT INTO "fertilizationClass" ("fertilizationClass") VALUES ('Fertilizer-N');
INSERT INTO "fertilizationClass" ("fertilizationClass") VALUES ('Manure');
INSERT INTO "fertilizationClass" ("fertilizationClass") VALUES ('Litter');
INSERT INTO "gas" ("id","name","EPSI","bTort","Diffusion_Coeff") VALUES (1,'CO2Default',1.0,0.65,11920.0);
INSERT INTO "gas" ("id","name","EPSI","bTort","Diffusion_Coeff") VALUES (2,'O2Default',1.0,0.65,15400.0);
INSERT INTO "gas" ("id","name","EPSI","bTort","Diffusion_Coeff") VALUES (3,'N2ODefault',1.0,0.65,12355.2);
INSERT INTO "fertNutrient" ("fertilizationClass","Nutrient") VALUES ('Fertilizer-N','Nitrogen (N)');
INSERT INTO "fertNutrient" ("fertilizationClass","Nutrient") VALUES ('Manure','Nitrogen (N)');
INSERT INTO "fertNutrient" ("fertilizationClass","Nutrient") VALUES ('Manure','Carbon (C)');
INSERT INTO "fertNutrient" ("fertilizationClass","Nutrient") VALUES ('Litter','Nitrogen (N)');
INSERT INTO "fertNutrient" ("fertilizationClass","Nutrient") VALUES ('Litter','Carbon (C)');
INSERT INTO "irrigationType" ("id","irrigation","description") VALUES (1,'Center pivot','Center pivot');
INSERT INTO "irrigationType" ("id","irrigation","description") VALUES (2,'Drip','Drip');
INSERT INTO "irrigationType" ("id","irrigation","description") VALUES (3,'Furrow','Furrow');
INSERT INTO "irrigationType" ("id","irrigation","description") VALUES (4,'Flood','Flood');
INSERT INTO "mulchDecomp" ("nutrient","contactFraction","alphaFeeding","carbMass","cellMass","lignMass","carbNMass","cellNMass","lignNMass","carbDecomp","cellDecomp","lignDecomp") VALUES ('Rye',0.6,0.1,0.2,0.7,0.1,0.08,0.01,0.01,0.425,0.24,0.0228);
INSERT INTO "mulchGeo" ("nutrient","minHoriSize","diffusionRestriction","longWaveRadiationCtrl","decompositionCtrl","deltaRShort","deltaRLong","omega","epsilonMulch","alphaMulch","maxStepInPicardIteration","toleranceHead","rhoMulch","poreSpace","maxPondingDepth") VALUES ('Rye',2.0,0.0,0.0,1.0,0.3,0.3,0.6,1.0,0.3,10.0,0.01,400000.0,0.8,1.0);
INSERT INTO "PGRApplType" ("id","applicationType","code") VALUES (1,'Banded',0);
INSERT INTO "PGRApplType" ("id","applicationType","code") VALUES (2,'Sprinkler',1);
INSERT INTO "PGRApplType" ("id","applicationType","code") VALUES (3,'Broadcast',2);
INSERT INTO "PGRChemical" ("id","PGRChemical") VALUES (1,'Pix');
INSERT INTO "PGRChemical" ("id","PGRChemical") VALUES (2,'Prep');
INSERT INTO "PGRChemical" ("id","PGRChemical") VALUES (3,'Def');
INSERT INTO "PGRChemical" ("id","PGRChemical") VALUES (4,'Dropp');
INSERT INTO "PGRChemical" ("id","PGRChemical") VALUES (5,'Harvade');
INSERT INTO "PGRChemical" ("id","PGRChemical") VALUES (6,'Gramoxon');
INSERT INTO "PGRUnit" ("id","PGRUnit","code") VALUES (1,'pts/ac',0);
INSERT INTO "PGRUnit" ("id","PGRUnit","code") VALUES (2,'gal/ac',1);
INSERT INTO "PGRUnit" ("id","PGRUnit","code") VALUES (3,'oz/ac',2);
INSERT INTO "PGRUnit" ("id","PGRUnit","code") VALUES (4,'lb/ac',3);
INSERT INTO "PGRUnit" ("id","PGRUnit","code") VALUES (5,'ac/lb',4);
INSERT INTO "PGRUnit" ("id","PGRUnit","code") VALUES (6,'ac/gal',5);
INSERT INTO "solute" ("id","name","EPSI","IUPW","CourMax","Diffusion_Coeff") VALUES (1,'NitrogenDefault',0.8,0.0,0.5,1.2);
INSERT INTO "surfResApplType" ("id","applicationType") VALUES (2,'Thickness (cm)');
INSERT INTO "surfResApplType" ("id","applicationType") VALUES (1,'Mass (kg/ha)');
INSERT INTO "surfResType" ("id","residueType") VALUES (1,'Rye');
INSERT INTO "tillageType" ("id","tillage","description") VALUES (1,'Moldboard plow','Tillage deeper than 10 inches.');
INSERT INTO "tillageType" ("id","tillage","description") VALUES (2,'Chisel plow','Tillage between 5 to 10 inches.');
INSERT INTO "tillageType" ("id","tillage","description") VALUES (3,'Vertical tillage','Tillage between 1 to 4 inches.');
INSERT INTO "tillageType" ("id","tillage","description") VALUES (4,'No tillage','No tillage');
CREATE TABLE "Irrig_pivotOp" (

	"opID"	INTEGER,

	"irrigationClass"	TEXT,

	"AmtIrrAppl"	REAL

);
 
CREATE TABLE "Irr_options" (

	"opID"	INTEGER,

	"irrOption"	INTEGER,

	PRIMARY KEY("opID")

);