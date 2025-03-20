"""Add data to faq table

Revision ID: ded1e55af0ec
Revises: fc9bd4c5d198
Create Date: 2024-04-23 14:04:26.387173

"""
from alembic import op
from datetime import date
from sqlalchemy.sql import table, column
from sqlalchemy import String, Integer, Date

# revision identifiers, used by Alembic.
revision = 'ded1e55af0ec'
down_revision = 'fc9bd4c5d198'
branch_labels = None
depends_on = None 

def upgrade():
# Create an ad-hoc table to use for the insert statement.
    faq_table = table(
        "faq",
        column("id", Integer),
        column("tabname", String),
        column("question", String),
        column("answer", String),
    )

    op.bulk_insert(
        faq_table,
    [
        {
        "id": 1,
        "tabname": "general",
        "question": "How do I go to next step?",
        "answer": "On the tab bar, click on the tab for the relevant data category."
        
        },
        {
        "id": 2,
        "tabname": "welcome",
        "question": "Do I always need to start from WELCOME tab?",
        "answer": "No. You can start from the relevant data category. Look up on the tabbar."
        
        },
        {
        "id": 3,
        "tabname": "Cultivar_maize",
        "question": "What is LTAR",
        "answer": "Leaf Tip Appearance Rate. The value is not usually changed. Typical range is from 0.42 to 0.61 and smaller for values for tropical varieties. More details in the manual."
        
        },
        {
        "id": 4,
        "tabname": "Cultivar_maize",
        "question": "How do I enter new cultivar to this interface?",
        "answer": "Open a existing cultivar. Change the parameter setting. Go to the bottom of the screen. Change the name of cultivar. Press SAVEAS button."
        
        },
        {
        "id": 5,
        "tabname": "management",
        "question": "Which CROP type are available?",
        "answer": "At the moment, we have only Corn, Potato and Soybean. Rice and Rye will be added in the future."
        
        },
        {
        "id": 6,
        "tabname": "management",
        "question": "What is CROP Management?",
        "answer": "Crop management is a 4 step process. It begins by A).Identifying the crop to be managed, B). Setting up an experiment by giving it a broader categorical name, C). Setting up a treatment within the experiment by giving it treatment specific name, D). Defining the treatment individual OPERATION(S) by listing operation, date of operation, operation specific parameters and crop cultivar."
        
        },
        {
        "id": 7,
        "tabname": "management",
        "question": "What is an EXPERIMENT?",
        "answer": "Term Experiment is used as a meta tag for a broader categorical name. After clicking on CROP, you can either refine the existing Experiment or set up a new experiment by clicking "
        
        },
        {
        "id": 8,
        "tabname": "management",
        "question": "What is a TREATMENT?",
        "answer": "Term Treatment is used as a meta tag for a treatment specific name. Under Experiment, you can either refine the existing Treatment or set up a new treatment by clicking "
        
        },
        {
        "id": 9,
        "tabname": "management",
        "question": "What is an OPERATION?",
        "answer": "Term OPERATION represent agricultural field activity. For example, planting, irrigation, fertilization, harvest. Depending upon OPERATION type, you may have to select parameters for date, depth, amount etc."
        
        },
        {
        "id": 10,
        "tabname": "management",
        "question": "Where do I choose crop cultivar?",
        "answer": "Cultivar is defined inside the OPERATION."
        
        },
        {
        "id": 11,
        "tabname": "management",
        "question": "What if I need to define my own crop cultivar properties?",
        "answer": "Use CULTIVAR tab and select a CROP from the list. Choose any closest crop specific cultivar. Change the parameters you want to change. Give a name to this new cultivar and and click "
        
        },
        {
        "id": 12,
        "tabname": "management",
        "question": "How do I add crop management?",
        "answer": "Click on the crop. You will see list of experiments. You can add a new experiment by clicking on ",
        "FIELD5": "Simulation Start",
        "FIELD6": "Sowing",
        "FIELD7": "Harvest",
        "FIELD8": "Simulation End"
        },
        {
        "id": 15,
        "tabname": "soil",
        "question": "How do I enter initial soil water conditions?",
        "answer": "Enter either WATER CONTENT (cm3/cm3) or Matric Potential (cm). Matric potential is negative value for unsaturated soil and positive values for saturated soil layer. To reset the box, delete the value."
        
        },
        {
        "id": 16,
        "tabname": "Cultivar_maize",
        "question": "Maize:What is LTIR?",
        "answer": "Leaf Tip Initiation Rate. The value is not usually changed. Typical range is from 0.8 to 0.99 and smaller numbers for tropical varieties. More details in the manual."
        
        },
        {
        "id": 17,
        "tabname": "Cultivar_maize",
        "question": "Maize:What is StayGreen?",
        "answer": "StayGreen is a relative variatal parameter that controls the onset of  senescence. With larger numbers the plant stays green longer. Typical range is 0 to 8. More details in the manual."
        
        },
        {
        "id": 18,
        "tabname": "Cultivar_maize",
        "question": "Maize:What is Phyllochrons from tassel?",
        "answer": "Phyllochrons from tassel is a parameter that delays the time of tassel after the last leaf appears. A value of 3 means that the time is equivalent to the time it takes for 3 leaves to appear. This is the default. With larger numbers the plant stays green longer. Typical range is 2 to 4. More details in the manual."
        
        },
        {
        "id": 19,
        "tabname": "soil",
        "question": "What is Organic Matter (%)?",
        "answer": "Organic Matter, this value of OM from a soil survey or soil test in percentage."
        
        },
        {
        "id": 20,
        "tabname": "soil",
        "question": "What is NO3 (ppm)?",
        "answer": "Initial concentration of N as nitrate in the soil."
        
        },
        {
        "id": 21,
        "tabname": "soil",
        "question": "What is NH4 (ppm)?",
        "answer": "Initial concentration of N as ammonia in the soil."
        
        },
        {
        "id": 22,
        "tabname": "soil",
        "question": "What is Hnew?",
        "answer": "This is initial water content. Hnew is a measure of the soil water potential. This is the ability of the soil to absorb water and is a kind of suction. the more negative this value, the dryer the soil is. A soil that has drained 24 hours after rainfall will have a matric potential varying from -100 to -300 cm. the numbers closer to 100 are for coarse textured soils and nearer to -300 are fine textured. Initial water content can also be input as volumetric water content (cm3/cm3). Use the variable InitType to indicate the type."
        
        },
        {
        "id": 23,
        "tabname": "soil",
        "question": "What are Sand, Silt, Clay (%)?",
        "answer": "These are the three components of soil texture given as percentages. They should add to 100."
        
        },
        {
        "id": 24,
        "tabname": "soil",
        "question": "What is BD, Bulk Density (g/cm3)?",
        "answer": "Mass of the soil particles per unit volume (g/cm3)."
        
        },
        {
        "id": 25,
        "tabname": "soil",
        "question": "What is TH33 (Field Capacity, cm3/cm3)?",
        "answer": "This is the drained water content of the soil (usually water content at -100 [coarse texture] or -330 [silty to fine texture] cm of water pressure)."
        
        },
        {
        "id": 26,
        "tabname": "soil",
        "question": "What is TH1500 (Wilting point, cm3/cm3)?",
        "answer": "Water content where the plants start wilting (15,000 cm suction)."
        
        },
        {
        "id": 27,
        "tabname": "soil",
        "question": "What are thr, ths, tha, th, Alfa, n, Ks, Kk, thk?",
        "answer": "These are parameters for the van Genuchten equation which describes the relationship between water content and matric potential in soil. CLASSIM uses ROSETTA, program that estimates these parameters from soil texture. if the values are -1 then the CLASSIM will estimate these parameters. if you have these parameters from another source, you can enter them here and the program will use them as entered."
        
        },
        {
        "id": 28,
        "tabname": "weather",
        "question": "What is Site?",
        "answer": "Select a site from the dropdown list of available sites. This describes the location of the simulations. This may describe a weather station or location. It is identified as a set of parameters that describes the location (via Site variable)."
        
        },
        {
        "id": 29,
        "tabname": "weather",
        "question": "What is Station?",
        "answer": "This denotes a subset of the site weather station. it is used to describe the weather data that is available from the site and average values for data that are missing from the daily or hourly tables. Station can also be used to use different weather data for the same site as when varying temperture or rainfall."
        
        },
        {
        "id": 31,
        "tabname": "weather",
        "question": "What is Average Wind (km/h)?",
        "answer": "This is the average wind velocity in km/h and is used when observed wind data are not available."
        
        },
        {
        "id": 32,
        "tabname": "weather",
        "question": "What is Average Rain Rate (cm/day)?",
        "answer": "This is the average rain rate (cm/day) this is used to distribute daily rainfall over a 24 hour period. the rain rate on a per hour basis is the maximum amount of rainfall that is assigned to an hourly value of rainfall rate. When hourly rainfall data are available this is not used."
        
        },
        {
        "id": 33,
        "tabname": "weather",
        "question": "What is N content in rainfall (Kg/ha)?",
        "answer": "If the N content of rainfall is known and it is desired to use it, enter a value here."
        
        },
        {
        "id": 34,
        "tabname": "weather",
        "question": "What is Relative Humidity (%)?",
        "answer": "Relative Humidity must be input as a percent (whole number, not a fraction)."
        
        },
        {
        "id": 35,
        "tabname": "weather",
        "question": "What is Average CO2 (PPM)?",
        "answer": "Average CO2 at the site. Use this value to make runs at different CO2 levels."
        
        },
        {
        "id": 37,
        "tabname": "management",
        "question": "What are Initial Field Values?",
        "answer": "Initial field values define the management for a particular growing season. It includes the cultivar, plant density, seed planting depth, the location of the plant in the grid."
        
        },
        {
        "id": 38,
        "tabname": "management",
        "question": "What is Simulation Start?",
        "answer": "Initial field values define the management for a particular growing season. It includes the cultivar, plant density, seed planting depth, the location of the plant in the grid."
        
        },
        {
        "id": 40,
        "tabname": "soil",
        "question": "What is Tmpr (C)?",
        "answer": "Initial temperature (C) of the soil layer."
        
        },
        {
        "id": 42,
        "tabname": "soil",
        "question": "What is UnitType?",
        "answer": "InitType is used to indicate if the initial water content is given as: matric potential (see description of Hnew) or water content."
        
        },
        {
        "id": 43,
        "tabname": "Cultivar_potato",
        "question": "Potato:What is Daily Air Temperature Effect?",
        "answer": "Maximum daily air temperature effect on tuber initiation.  SPUDSIM assumes this maximum is at 15C.  Typical range is from 1.5 to 2.5. Higher values will reduce the time before tuber initiation occurs."
        
        },
        {
        "id": 44,
        "tabname": "Cultivar_potato",
        "question": "Potato:What is Daily Air Temperature Amplitude Effec?",
        "answer": "Maximum daily air temperature amplitude (difference between maximum and minimum temperature) effect on tuber initiation. Temperatures 25C and above will use this maximum value.  Typical range is from 1.5 to 3.0"
        
        },
        {
        "id": 45,
        "tabname": "Cultivar_potato",
        "question": "Potato:What is Photoperiod Effect?",
        "answer": "Maximum influence of photoperiod on tuber initiation rate. SPUDSIM assumes this maximum is at photoperiods of 12 hours or less.  Photoperiods greater than 12 hours linearly decline from this value.  Typical range is from 1 to 3."
        
        },
        {
        "id": 46,
        "tabname": "Cultivar_potato",
        "question": "Potato:What is High Nitrogen Effect?",
        "answer": "Effect of luxury nitrogen status on tuber initiation rate. Typical values range from 0.8 to 1.2.  Higher values will decrease the time before tuber initiation occurs depending on the leaf tissue nitrogen percentage in the plant."
        
        },
        {
        "id": 47,
        "tabname": "Cultivar_potato",
        "question": "Potato:What is Low Nitrogen Effect",
        "answer": "Effect of deficient nitrogen status on tuber initiation rate. Typical values range from 0.8 to 1.2.  Higher values will decrease the time before tuber initiation occurs depending on level of nitrogen deficiency in the plant leaves."
        
        },
        {
        "id": 48,
        "tabname": "Cultivar_potato",
        "question": "Potato:What is Determinacy?",
        "answer": "Plant determinacy. Typical range is from 0 to 1. A completely determinant plant (=1) is generally a faster maturing variety where tubers have 100% prior for photosynthate.  Lower values mean the plant will allocate photosynthate to both haulm and tubers depending on plant carbon status and other factors."
        
        },
        {
        "id": 49,
        "tabname": "Cultivar_potato",
        "question": "Potato:What is Maximum Canopy Leaf Expansion Rate?",
        "answer": "Maximum daily canopy leaf expansion rate with units of square centimeters per plant per day. Typical range is between 100 to 450. This value is modified in the model by plant physiological age, air temperature, plant carbon status, and water and nitrogen stress."
        
        },
        {
        "id": 50,
        "tabname": "Cultivar_potato",
        "question": "Potato:What is Maximum Tuber Growth Rate?",
        "answer": "Maximum daily tuber growth rate with units of grants per plant per day. Typical range is between 5 to 25. This value is modified in the model based on plant carbon status, physiological age, and temperature."
        
        },
        {
        "id": 51,
        "tabname": "Cultivar_potato",
        "question": "Potato:What is Specific Leaf Weight?",
        "answer": "Specific leaf weight for new leaves with units of grams per square centimeter.  Typical range is 0.002 to 0.008."
        
        },
        {
        "id": 52,
        "tabname": "Site",
        "question": "What is a SITE?",
        "answer": "A SITE is a name for a physical location that defines the location where the crop is grown"
        
        },
        {
        "id": 53,
        "tabname": "Site",
        "question": "What is Latitude?",
        "answer": "Latitude is the location (in degrees with fraction) on the globe from north (positive) to south (negative) of the equator"
        
        },
        {
        "id": 54,
        "tabname": "Site",
        "question": "What is Longitude?",
        "answer": "Longtidude is the location (in degrees with a fraction) east (negative) and west (positive) of the Meridian line on the globe"
        
        },
        {
        "id": 55,
        "tabname": "Site",
        "question": "What is Altitude?",
        "answer": "Height (meters) of location above mean sea level"
        
        },
        {
        "id": 56,
        "tabname": "Cultivar_soybean",
        "question": "Soybean:What is maturity group?",
        "answer": "Maturity Group - defines the length of time from planting until physiological maturity. The larger the number, the shorter the time. Typical values range from 0 to 10."
        
        },
        {
        "id": 57,
        "tabname": "Cultivar_soybean",
        "question": "Soybean:Wha is number of seeds per pound weight typical for cultivar?",
        "answer": "number per lb (need to change to Kg). Typical values range from 2400 to 3800."
        
        },
        {
        "id": 58,
        "tabname": "Cultivar_soybean",
        "question": "Soybean:What is seed fill rate at 24oC?",
        "answer": "mg of seed wt per day per plant. Typical values range from 7.5 to 8.5."
        
        },
        {
        "id": 59,
        "tabname": "Cultivar_soybean",
        "question": "Soybean:What is slope of the dependence of leaf addition rate on cumulative temperature?",
        "answer": "Rate of the appearance of leaves as a function of GDD (leaf/GDD). Typical values range from 0.0067 to 0.0132."
        
        },
        {
        "id": 60,
        "tabname": "Cultivar_soybean",
        "question": "Soybean:What is maximum of Vegetative stage?",
        "answer": "Maximum number of leaves on the main stem before flowering. Typical values range from  11 to 24."
        
        },
        {
        "id": 61,
        "tabname": "Cultivar_soybean",
        "question": "Soybean:What is correction factor for the early Vegetative rate to account for clay content?",
        "answer": "probably more of an adjustment for soil temperature not commonly used. Typical values range from 0.6 to 1.0."
        
        },
        {
        "id": 62,
        "tabname": "Cultivar_soybean",
        "question": "Soybean:What is progress rate towards Floral Initiation at solstice?",
        "answer": "Controls time of flower initiation at June 21 or Dec 21 ,per day. Typical values range from 0.0192 to 0.0525."
        
        },
        {
        "id": 63,
        "tabname": "Cultivar_soybean",
        "question": "Soybean:What is daily rate of the progress to Floral Initiation before solstice?",
        "answer": "Controls time of flower initiation before June 21 or Dec 21, per day.  Typical values range from 0.0022 to 0.0501."
        
        },
        {
        "id": 64,
        "tabname": "Cultivar_soybean",
        "question": "Soybean:What is daily rate of the progress to Floral Initiation after solstice?",
        "answer": "Controls time of flower initiation after June 21 or Dec 21, per day. Typical values range from -0.197 to -0.003."
        
        },
        {
        "id": 65,
        "tabname": "Cultivar_soybean",
        "question": "Soybean:What is progress rate from Floral Initiation towards Full Bloom?",
        "answer": "Controls time when full bloom occurs, per day. Typical values range from 0.0882 to 0.3."
        
        },
        {
        "id": 66,
        "tabname": "Cultivar_soybean",
        "question": "Soybean:What is slope of the dependence of Full Bloom end on the day of emergence?",
        "answer": "Controls the rate of days to  full bloom from emergence, per day. Typical values range from 0.398 to 0.812."
        
        },
        {
        "id": 67,
        "tabname": "Cultivar_soybean",
        "question": "Soybean:What is intercept of the dependence of Full Bloom end on the day of emergence?",
        "answer": "Controls how the day of emergence affects timing of full bloom, per day. Typical values range from 66.4 to 190."
        
        },
        {
        "id": 68,
        "tabname": "Cultivar_soybean",
        "question": "Soybean:What is progress rate from Full Bloom towards full seed?",
        "answer": "GDD. Typical values range from 0.0039 to 0.0053."
        
        },
        {
        "id": 69,
        "tabname": "Cultivar_soybean",
        "question": "Soybean:What is length of the plateau before full seed?",
        "answer": "A plateau of no reproductive stages between the time seeds first appear and full seed, GDD. Typical values range from 13 to 213."
        
        },
        {
        "id": 70,
        "tabname": "Cultivar_soybean",
        "question": "Soybean:What is length of the plateau before full seed with no stress?",
        "answer": "A plateau of no reproductive stages between the time seeds first appear and full seed with no stress, GDD. Typical values range from 250 to 700."
        
        },
        {
        "id": 71,
        "tabname": "Cultivar_soybean",
        "question": "Soybean:What is rate of the decay of the full seed plateau as the stress increases?",
        "answer": "Decrease in the time of the plateau as stress increases, GDD. Typical values range from 0.5 to 2.0."
        
        },
        {
        "id": 72,
        "tabname": "Cultivar_soybean",
        "question": "Soybean:What is rate of the progress towards physiological maturity?",
        "answer": "GDD. Typical values range from 0.0018 to 0.0075."
        
        },
        {
        "id": 73,
        "tabname": "Cultivar_soybean",
        "question": "Soybean:What is reproductive stage to stop vegetative growth?",
        "answer": "Reproductive stage plant is at when leaf addition stops. Typical values range from 2.0 to 5.0."
        
        },
        {
        "id": 74,
        "tabname": "Cultivar_soybean",
        "question": "Soybean: What is potential elongation and dry weight increase of petioles?",
        "answer": "Dry weight increase in petiole as a function of length gr/cm. Typical values range from 0.0024 to 0.004."
        
        },
        {
        "id": 75,
        "tabname": "Cultivar_soybean",
        "question": "Soybean:What is potential rate of the root weight increase?",
        "answer": "A percent of current roots that grow. Typical values range from  0.3 to 0.7."
        
        },
        {
        "id": 76,
        "tabname": "Cultivar_soybean",
        "question": "Soybean:What is increase in pod weight and progress in R stages?",
        "answer": "Rate at which pod weight increases as the reproductive stages proceed, gr per R stage. Typical values range from 0.5 to 1.5."
        
        },
        {
        "id": 77,
        "tabname": "Cultivar_soybean",
        "question": "Soybean:What is the effect of temperature on the potential rate (FILL) of seed fill?",
        "answer": "Relates to the increase in seed weight toward the potential rate. Typical values range from 0.5 to 1.5."
        
        },
        {
        "id": 78,
        "tabname": "Cultivar_soybean",
        "question": "Soybean:What is intercept coefficient ",
        "answer": "Relationship between height and the number of leaves. Typical values range from 0.6 to 2.7."
        
        },
        {
        "id": 79,
        "tabname": "Cultivar_soybean",
        "question": "Soybean:What is slope coefficient ",
        "answer": "Relationship between height and the number of leaves. Typical values range from 1.32 to 2.0."
        
        },
        {
        "id": 80,
        "tabname": "Cultivar_soybean",
        "question": "Soybean:What is number of branches with the plant density?",
        "answer": "Number of branches per plants per m2. Typical values range from 0.05 to 0.5."
        
        },
        {
        "id": 81,
        "tabname": "Cultivar_soybean",
        "question": "Soybean:Relates stem weight to stem elongation.",
        "answer": "gm/cm. Typical values range from  1.0 to 2.0."
        
        },
        {
        "id": 82,
        "tabname": "Cultivar_soybean",
        "question": "Soybean:Relates increment in leaf area to increment in vegetative stages.",
        "answer": "cm2/leaf number. Typical values range from 0.5 to 2.0."
        
        },
        {
        "id": 83,
        "tabname": "Cultivar_cotton",
        "question": "Cotton: Relates boll safe age from abscission with age of the boll, C and N-stress",
        "answer": "The susceptibility of each boll to shedding is simulated as a function of its physiological age and severity of stress. This is a parameter in the functional relationship between the age of boll below which boll is susceptible to loss (boll safe age) and physiological age and severity of stresses. An increase in this parameter increases the boll safe age. A typical value is 4.0"
        
        },
        {
        "id": 84,
        "tabname": "Cultivar_cotton",
        "question": "Cotton: what is maximum cotton boll size?",
        "answer": "In GOSSYM, the potential boll growth is reduced if individual boll size exceeds maximum boll size. A typical value is 6 g"
        
        },
        {
        "id": 85,
        "tabname": "Cultivar_cotton",
        "question": "Cotton: Number of days after emergence that controls C-allocation in to stem",
        "answer": "This represents the number of days after which the cotton crop retires biomass from active stem growth. A typical value is 35 days"
        
        },
        {
        "id": 86,
        "tabname": "Cultivar_cotton",
        "question": "Cotton: Factor for C-allocation to stem for days after emergence > variety parameter 13",
        "answer": "This parameter controls the potential stem growth. An increase in this value increases the potential stem growth. Starting from a value of 1.0, this parameter can take values greater than or less than 1.0."
        
        },
        {
        "id": 87,
        "tabname": "Cultivar_cotton",
        "question": "Cotton: what is minimum leaf water potential for the day in well-watered soil in estimation of stem growth water stress?",
        "answer": "This represents the minimum leaf water potential in a well-watered condition. A typical value can be -0.9 bar"
        
        },
        {
        "id": 88,
        "tabname": "Cultivar_cotton",
        "question": "Cotton: Parameter in the estimation of potential square growth",
        "answer": "This parameter controls the potential square growth. An increase in this value increases the potential square growth. Starting from a value of 1.0, this parameter can take values greater than or less than 1.0."
        
        },
        {
        "id": 89,
        "tabname": "Cultivar_cotton",
        "question": "Cotton: Parameter in the estimation of potential boll growth  if the night time temperature>35 degree C",
        "answer": "This parameter controls the potential boll growth. An increase in this value increases the potential boll growth. A typical value is 0.0"
        
        },
        {
        "id": 90,
        "tabname": "Cultivar_cotton",
        "question": "Cotton: Parameter in the estimation of morphogenetic delays due to N-stress",
        "answer": "An increase in this value increases the morphogenetic delay due to N stress. Starting from a value of 1.0, this parameter can take values greater than or less than 1.0."
        
        },
        {
        "id": 91,
        "tabname": "Cultivar_cotton",
        "question": "Cotton: What is correction factor for root/shoot ratio?",
        "answer": "This parameter controls the allocation of the C to root and shoot components. An increase in this value increases the C allocation to the root and vice versa. Starting from a value of 1.0, this parameter can take values greater than or less than 1.0."
        
        },
        {
        "id": 92,
        "tabname": "Cultivar_cotton",
        "question": "Cotton: Parameter in the estimation time interval between pre-fruiting node",
        "answer": "An increase in this value increases the time interval between the pre-fruiting nodes. Starting from a value of 1.0, this parameter can take values greater than or less than 1.0."
        
        },
        {
        "id": 93,
        "tabname": "Cultivar_cotton",
        "question": "Cotton: Parameter in the estimation of time interval between nodes in the main stem and fruiting branch",
        "answer": "An increase in this value increases the time interval between the main stem nodes. Starting from a value of 1.0, this parameter can take values greater than or less than 1.0."
        
        },
        {
        "id": 94,
        "tabname": "Cultivar_cotton",
        "question": "Cotton: Parameter in the estimation of time interval between nodes in the vegetative branches",
        "answer": "An increase in this value increases the time interval between the vegetative branch nodes. Starting from a value of 1.0, this parameter can take values greater than or less than 1.0."
        
        },
        {
        "id": 95,
        "tabname": "Cultivar_cotton",
        "question": "Cotton: Parameter in the estimation of time from emergence to first square",
        "answer": "An increase in this value increases the time from emergence to first square. Starting from a value of 1.0, this parameter can take values greater than or less than 1.0."
        
        },
        {
        "id": 96,
        "tabname": "Cultivar_cotton",
        "question": "Cotton: Parameter in the estimation of time from first square to bloom",
        "answer": "An increase in this value increases the time from emergence to first bloom. Starting from a value of 1.0, this parameter can take values greater than or less than 1.0."
        
        },
        {
        "id": 97,
        "tabname": "Cultivar_cotton",
        "question": "Cotton: Parameter in the estimation of time from emergence to open boll",
        "answer": "An increase in this value increases the time from emergence to first open boll. Starting from a value of 1.0, this parameter can take values greater than or less than 1.0."
        
        },
        {
        "id": 98,
        "tabname": "Cultivar_cotton",
        "question": "Cotton: Parameter in the estimation of leaf growth water stress",
        "answer": "This is used in the estimation of the potential daily change in the leaf weight. An increase in this value increases the potential change in the leaf weight. Starting from a value of 1.0, this parameter can take values greater than or less than 1.0."
        
        },
        {
        "id": 99,
        "tabname": "Cultivar_cotton",
        "question": "Cotton: What is minimum leaf water potential in well-watered soil in the estimation of leaf growth water stress?",
        "answer": "This represents the minimum leaf water potential in a well-watered condition.  A typical value can be -0.85 bar"
        
        },
        {
        "id": 100,
        "tabname": "Cultivar_cotton",
        "question": "Cotton: Parameter in the estimation of potential daily change in pre-fruiting leaf area",
        "answer": "An increase in this value increases the potential daily change in leaf area of the prefruting node leaves. Starting from a value of 1.0, this parameter can take values greater than or less than 1.0."
        
        },
        {
        "id": 101,
        "tabname": "Cultivar_cotton",
        "question": "Cotton: Parameter in the estimation of potential daily change in mainstem leaf area",
        "answer": "An increase in this value increases the potential daily change in leaf area of the main stem node leaves. Starting from a value of 1.0, this parameter can take values greater than or less than 1.0."
        
        },
        {
        "id": 102,
        "tabname": "Cultivar_cotton",
        "question": "Cotton: Parameter in the estimation of potential daily change in mainstem and pre fruiting leaf weight",
        "answer": "An increase in this value increases the potential daily change in leaf weight of the mainstem and pre-fruiting leaves. Starting from a value of 1.0, this parameter can take values greater than or less than 1.0."
        
        },
        {
        "id": 103,
        "tabname": "Cultivar_cotton",
        "question": "Cotton: Minimum LAI that affects boll temperature",
        "answer": "This is the leaf area index below which it controls the boll temperature. A typical value can be 3.0."
        
        },
        {
        "id": 104,
        "tabname": "Cultivar_cotton",
        "question": "Cotton: Parameter in the estimation of leaf age",
        "answer": "An increase in this value increases the leaf age. A typical value can be 0.75"
        
        },
        {
        "id": 105,
        "tabname": "Cultivar_cotton",
        "question": "Cotton: Parameter in the estimation of the physiological days for leaf abscission",
        "answer": "An  increase in this value increases the physiological days after which leaves are abscised. Starting from a value of 1.0, this parameter can take values greater than or less than 1.0."
        
        },
        {
        "id": 106,
        "tabname": "Cultivar_cotton",
        "question": "Cotton: Parameter in the estimation of duration of leaf area expansion",
        "answer": "An increase in this value increases the pre-fruiting leaf age. Starting from a value of 1.0, this parameter can take values greater than or less than 1.0."
        
        },
        {
        "id": 107,
        "tabname": "Cultivar_cotton",
        "question": "Cotton: Parameter in the estimation of pre-fruiting leaf area at unfolding",
        "answer": "An increase in this value increases pre-fruiting leaf area at unfolding. Starting from a value of 1.0, this parameter can take values greater than or less than 1.0."
        
        },
        {
        "id": 108,
        "tabname": "Cultivar_cotton",
        "question": "Cotton: Parameter in the estimation of  mainstem leaf area at unfolding",
        "answer": "An increase in this value increase the mainstem leaf area at unfolding. Starting from a value of 1.0, this parameter can take values greater than or less than 1.0."
        
        },
        {
        "id": 109,
        "tabname": "Cultivar_cotton",
        "question": "Cotton: Parameter in the estimation of fruiting branch leaf area at unfolding",
        "answer": "An increase in this value increases fruiting branch leaf area at unfolding. Starting from a value of 1.0, this parameter can take values greater than or less than 1.0."
        
        },
        {
        "id": 110,
        "tabname": "Cultivar_cotton",
        "question": "Cotton: Parameter in the estimation of internode elongation duration in plant height calculation",
        "answer": "An increase in this value increases internode elongation duration. Starting from a value of 1.0, this parameter can take values greater than or less than 1.0."
        
        },
        {
        "id": 111,
        "tabname": "Cultivar_cotton",
        "question": "Cotton: Parameter in the estimation of initial internode length in plant height calculation",
        "answer": "An increase in this value increases initial internode length. Starting from a value of 1.0, this parameter can take values greater than or less than 1.0."
        
        },
        {
        "id": 112,
        "tabname": "Cultivar_cotton",
        "question": "Cotton: Parameter in the estimation of reduction to initial internode length when the number of main stem nodes < 14",
        "answer": "An increase in this value increases the initial internode length when the number of main stem nodes < 14. Starting from a value of 1.0, this parameter can take values greater than or less than 1.0."
        
        },
        {
        "id": 113,
        "tabname": "Cultivar_cotton",
        "question": "Cotton: Parameter in the estimation of reduction to initial internode length when the number of main stem nodes>= 14",
        "answer": "An increase in this value increases the initial internode length when the number of main stem nodes >=14. Starting from a value of 1.0, this parameter can take values greater than or less than 1.0."
        
        },
        {
        "id": 114,
        "tabname": "Cultivar_cotton",
        "question": "Cotton: Parameter in the estimation of current internode length",
        "answer": "An increase in this value increases the internode length. Starting from a value of 1.0, this parameter can take values greater than or less than 1.0."
        
        },
        {
        "id": 115,
        "tabname": "Cultivar_cotton",
        "question": "Cotton: Parameter in the estimation of bolls lost due to heat injury",
        "answer": "An increase in this value increases the number of bolls that are susceptible to lose due to heat injury. Starting from a value of 1.0, this parameter can take values greater than or less than 1.0."
        
        },
        {
        "id": 116,
        "tabname": "Cultivar_cotton",
        "question": "Cotton: Relates potential fruit growth with temperature stress",
        "answer": "An increase in this value increases the potential boll growth. Starting from a value of 1.0, this parameter can take values greater than or less than 1.0."
        
        },
        {
        "id": 117,
        "tabname": "Cultivar_cotton",
        "question": "Cotton: Relates potential fruit growth with water and temperature stress",
        "answer": "An increase in this value increases the potential boll growth. Starting from a value of 1.0, this parameter can take values greater than or less than 1.0."
        
        },
        {
        "id": 118,
        "tabname": "weather",
        "question": "Which variables should be in the .CSV for upload?",
        "answer": "The weather .CSV file can contain hourly or daily data. For daily values, minimum information includes date (date), solar radiation (srad), maximum daily temperature (tmax), minimum daily temperature (tmin), and rainfall (rain). For hourly values, minimum information includes date (date), hour (hour), solar radiation (srad), temperature (temperature), and rainfall (rain).  Values for relative humidity (rh) and CO2 (co2) are optional in both files.  For the file header, please use the words in parentheses for each variable, the order of the columns doesn’t matter."
        
        },
        {
        "id": 119,
        "tabname": "seasonal",
        "question": "Why daily and hourly output values for soil parameters are slightly different for the same model run? ",
        "answer": "For daily output, 2dsoil does not average hourly values, it samples one hour a day (5 am). The slight difference between daily and hourly output can be on the first day if the soil for example starts out really wet and drains substantially. If there is little drainage or infiltration, there won't be much difference. "
        
        },
        {
        "id": 120,
        "tabname": "rotation",
        "question": "Why daily and hourly output values for soil parameters are slightly different for the same model run? ",
        "answer": "For daily output, 2dsoil does not average hourly values, it samples one hour a day (5 am). The slight difference between daily and hourly output can be on the first day if the soil for example starts out really wet and drains substantially. If there is little drainage or infiltration, there won't be much difference. "
        
        }
    ]
    )