import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  // Input,
  Select,
  VStack,
} from "@chakra-ui/react";
import {
  FertilizerClass,
  // InitCondOp,
  IrrigationClass,
  ManagementService,
  PGRApplType,
  PGRChemical,
  PGRUnit,
  SurfResApplType,
  SurfResType,
  TDataCreateOperation,
  TDataOperationForms,
  TillageType,
  // TDataOperationFirstDate,
} from "../../client";
import FertilizerForm from "./FertilizerForm";
import PGROperation from "./PGROperation";
import SurfaceResidueForm from "./SurfaceResidueForm";
import IrrigationForm from "./IrrigationForm";
import useCustomToast from "../../hooks/useCustomToast";
// import Simulation from "./SimulationStart";
import Tillage from "./Tillage";
// @ts-ignore
import CustomDatePicker from "../Common/CustomDatePicker";

interface NewOperationFormProps {
  formType: string;
  cropName: string;
  experimentName: string;
  treatmentName: string;
  operationName: string;
  operationId?: number | null;
  opDateVal?: string | null | undefined;
  onSave?: (data: any) => void;
}

const OperationForm: React.FC<NewOperationFormProps> = ({
  formType,
  cropName,
  experimentName,
  treatmentName,
  operationName,
  operationId,
  opDateVal,
  onSave,
}) => {

  const [calendar, setCalendar] = useState<Date | null>(null);
  const [fertClass, setFertClass] = useState<FertilizerClass[]>([]);
  const [selectedFertClass, setSelectedFertClass] = useState("");
  const [tillageTypeList, setTillageTypeList] = useState<TillageType[]>([]);
  const [PGRList, setPGRList] = useState<PGRChemical[]>([]);
  const [selectedPGR, setSelectedPGR] = useState("");
  const [PGRAppTypeList, setPGRAppTypeList] = useState<PGRApplType[]>([]);
  const [PGRAppUnitList, setPGRAppUnitList] = useState<PGRUnit[]>([]);
  const [surfResTypeList, setSurfResTypeList] = useState<SurfResType[]>([]);
  const [selectedSurfResType, setSelectedSurfResType] = useState("");
  const [surfResApplTypeList, setSurfResApplTypeList] = useState<
    SurfResApplType[]
  >([]);
  const [irrigationTypeList, setIrrigationTypeList] = useState<
    IrrigationClass[]
  >([]);
  const [selectedIrrigationType, setSelectedIrrigationType] = useState("");
  // const [operationList, setOperationList] = useState<OperationPublic[]>([]);
  const [surfResFlag, setSurfResFlag] = useState(false);

  const [fertilizationClassForm, setFertilizationClassForm] = useState(false);
  const [pGRChemicalForm, setPGRChemicalForm] = useState(false);
  const [surfaceResidue, setSurfaceResidue] = useState(false);
  const [irrigationForm, setIrrigationForm] = useState(false);
  const [date, setDate] = useState<String | null>(null);
  const showToast = useCustomToast();
  const handleDateChange = (newDate: String | null) => {
    if (newDate) {
      setDate(newDate);
    } else {
      setDate(null);
    }
  };
console.log(calendar, "calendar")
  useEffect(() => {
    if (opDateVal) {
      setDate(opDateVal);
    }
    console.log("opDateVal", opDateVal);
  }, [opDateVal]);
  useEffect(() => {
    // Fetch initial data
    const fetchFirstOperationDate = async () => {
      const fertClassData = await ManagementService.readFertilizationClass();
      const tillageTypeData = await ManagementService.readTillageTypeDB();
      const PGRData = await ManagementService.readPGRChemicalDB();
      const PGRAppTypeData = await ManagementService.readPGRAppTypeDB();
      const PGRAppUnitData = await ManagementService.readPGRAppUnitDB();
      const surfResTypeData = await ManagementService.readSurfResTypeDB();
      const surfResApplTypeData =
        await ManagementService.readSurfResApplTypeDB();
      const irrigationTypeData = await ManagementService.readIrrigationType();

      if (operationId) {
        const opid: TDataOperationForms = {
          opid: operationId,
        };
        const operations = await ManagementService.getOperationData(opid);        
        
        if (
          operations.name === operationName &&
          operations.odate &&
          typeof operations.odate === "string"
        ) {
          setCalendar(new Date(operations.odate));
        }
      }

      setFertClass(fertClassData);
      setTillageTypeList(tillageTypeData);
      setPGRList(PGRData);
      setPGRAppTypeList(PGRAppTypeData);
      setPGRAppUnitList(PGRAppUnitData);
      setSurfResTypeList(surfResTypeData);
      setSurfResApplTypeList(surfResApplTypeData);
      setIrrigationTypeList(irrigationTypeData);
      setSurfResFlag(false);
    };

    fetchFirstOperationDate();
  }, [cropName, experimentName, treatmentName, operationName, operationId]);

  const handleFertClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFertClass(e.target.value);
    setFertilizationClassForm(true);
  };

  const handlePGRChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPGR(e.target.value);
    setPGRChemicalForm(true);
  };

  const handleSurfResTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSurfResType(e.target.value);
    setSurfaceResidue(true);
  };

  const handleIrrigationTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedIrrigationType(e.target.value);
    setIrrigationForm(true);
  };

  const getCurrentDate = () => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const handleFertilizationSave = async (data: any) => {
    try {
      let response;
      const fertNut_record = [
        "Nitrogen (N)",
        data.quantityN,
        ...(data.quantityC ? ["Carbon (C)", data.quantityC] : []),
      ];

      const opData: TDataCreateOperation = {
        requestBody: {
          opID: operationId ? operationId : -10,
          name: "Fertilizer",
          exid: experimentName,
          cropname: cropName,
          treatmentname: treatmentName,
          operation_record: ["Fertilizer", data.date],
          initCond_record: [],
          tillage_record: [],
          fert_record: [data.fertClassOpt, data.fertilizerDepth],
          fertNut_record: fertNut_record,
          PGR_record: [],
          SR_record: [],
          irrAmt_record: [],
        },
      };

      response = await ManagementService.submitOperation(opData);
      if (onSave) {
        onSave(response);
      }
      if (response) {
        showToast("Successfully", "Operation created successfully.", "success");
      } else {
        showToast("Failed", "Operation creation failed.", "error");
      }
    } catch (error) {
      showToast("Failed", "Operation creation failed.", "error");
    }
  };

  const handlePGRSave = async (data: any) => {
    try {
      let response;
      
      const opData: TDataCreateOperation = {
        requestBody: {
          opID: operationId ? operationId : -10,
          name: "Plant Growth Regulator",
          exid: experimentName,
          cropname: cropName,
          treatmentname: treatmentName,
          operation_record: ["Plant Growth Regulator", data.date??getCurrentDate()],
          initCond_record: [],
          tillage_record: [],
          fert_record: [],
          fertNut_record: [],
          PGR_record: [
            data.selectedPGROpt,
            data.appType,
            data.bandwidth,
            data.rate,
            data.unit,
          ],
          SR_record: [],
          irrAmt_record: [],
        },
      };

      response = await ManagementService.submitOperation(opData);
      if (onSave) {
        onSave(response);
      }
      if (response) {
        showToast("Successfully", "Operation created successfully.", "success");
      } else {
        showToast("Failed", "Operation creation failed.", "error");
      }
    } catch (error) {
      showToast("Failed", "Operation creation failed.", "error");
    }
  };

  const handleSurfaceResidueSave = async (data: any) => {
    try {
      let response;

      const opData: TDataCreateOperation = {
        requestBody: {
          opID: operationId ? operationId : -10,
          name: "Surface Residue",
          exid: experimentName,
          cropname: cropName,
          treatmentname: treatmentName,
          operation_record: ["Surface Residue", getCurrentDate()],
          initCond_record: [],
          tillage_record: [],
          fert_record: [],
          fertNut_record: [],
          PGR_record: [],
          SR_record: [
            data.surfResOpt,
            data.surfResApplType,
            data.surfResApplVal,
          ],
          irrAmt_record: [],
        },
      };

      response = await ManagementService.submitOperation(opData);
      if (onSave) {
        onSave(response);
      }
      if (response) {
        showToast("Successfully", "Operation created successfully.", "success");
      } else {
        showToast("Failed", "Operation creation failed.", "error");
      }
    } catch (error) {
      showToast("Failed", "Operation creation failed.", "error");
    }
  };

  const handleIrrigationSave = async (data: any) => {
    try {
      let response;

      const opData: TDataCreateOperation = {
        requestBody: {
          opID: operationId ? operationId : -10,
          name: "Irrigation Type",
          exid: experimentName,
          cropname: cropName,
          treatmentname: treatmentName,
          operation_record: ["Irrigation Type", getCurrentDate()],
          initCond_record: [],
          tillage_record: [],
          fert_record: [],
          fertNut_record: [],
          PGR_record: [],
          SR_record: [],
          irrAmt_record: [data.irrigationOpt, data.amount],
        },
      };

      response = await ManagementService.submitOperation(opData);
      if (onSave) {
        onSave(response);
      }
      if (response) {
        showToast("Successfully", "Operation created successfully.", "success");
      } else {
        showToast("Failed", "Operation creation failed.", "error");
      }
    } catch (error) {
      showToast("Failed", "Operation creation failed.", "error");
    }
  };

  // const handleSimulationStartSave = async (data: any) => {
  //   try {
  //     let response;

  //     const opData: TDataCreateOperation = {
  //       requestBody: {
  //         opID: operationId ? operationId : -10,
  //         name: "Simulation Start",
  //         exid: experimentName,
  //         cropname: cropName,
  //         treatmentname: treatmentName,
  //         operation_record: ["Simulation Start", data.formatedDate],
  //         initCond_record: [
  //           parseFloat(data.plantDensity),
  //           parseFloat(data.autoIrrigation),
  //           0.0,
  //           parseFloat(data.seedDepth),
  //           0.65,
  //           parseFloat(data.plantingGrid),
  //           parseFloat(data.rowSpacing),
  //           data.cultivar.toString(),
  //           0,
  //         ],
  //         tillage_record: [],
  //         fert_record: [],
  //         fertNut_record: [],
  //         PGR_record: [],
  //         SR_record: [],
  //         irrAmt_record: [],
  //       },
  //     };

  //     response = await ManagementService.submitOperation(opData);
  //     if (onSave) {
  //       onSave(response);
  //     }
  //     if (response) {
  //       showToast("Successfully", "Operation created successfully.", "success");
  //     } else {
  //       showToast("Failed", "Operation creation failed.", "error");
  //     }
  //   } catch (error) {
  //     showToast("Failed", "Operation creation failed.", "error");
  //   }
  // };

  const handleTillageSave = async (data: any) => {
    try {
      let response;

      const opData: TDataCreateOperation = {
        
        requestBody: {
          opID: operationId ? operationId : -10,
          name: "Tillage",
          exid: experimentName,
          cropname: cropName,
          treatmentname: treatmentName,
          operation_record: ["Tillage", data.date],
          initCond_record: [],
          tillage_record: [data.tillage],
          fert_record: [],
          fertNut_record: [],
          PGR_record: [],
          SR_record: [],
          irrAmt_record: [],
        },
      };
      response = await ManagementService.submitOperation(opData);
      if (onSave) {
        onSave(response);
      }
      if (response) {
        showToast("Successfully", "Operation created successfully.", "success");
      } else {
        showToast("Failed", "Operation creation failed.", "error");
      }
    } catch (error) {
      showToast("Failed", "Operation creation failed.", "error");
    }
  };

  const handleSaveOperationData = async () => {
    try {
      let response;

      const opData: TDataCreateOperation = {
        requestBody: {
          opID: operationId ? operationId : -10,
          name: operationName,
          exid: experimentName,
          cropname: cropName,
          treatmentname: treatmentName,
          operation_record: [operationName, date?.toString() || ''],
          initCond_record: [],
          tillage_record: [],
          fert_record: [],
          fertNut_record: [],
          PGR_record: [],
          SR_record: [],
          irrAmt_record: [],
        },
      };

      response = await ManagementService.submitOperation(opData);
      if (onSave) {
        onSave(response);
      }
      if (response) {
        
        showToast("Successfully", "Operation created successfully.", "success");
      } else {
        showToast("Failed", "Operation creation failed.", "error");
      }
    } catch (error) {
      showToast("Failed", "Operation creation failed.", "error");
    }
  };  

  useEffect(() => {
    if (opDateVal !== undefined && opDateVal !== null) {
      setDate(opDateVal);
    }
  }, [opDateVal]);

  if (fertilizationClassForm || operationName == "Fertilizer") {
    return (
      <FertilizerForm
        fertilizationOpt={selectedFertClass}
        fertClass={fertClass}
        onSave={handleFertilizationSave}
        operationId={operationId}
        fertilizerDate= {opDateVal}
      />
    );
  } else if (pGRChemicalForm || operationName == "Plant Growth Regulator") {
    return (
      <PGROperation
        cropName={cropName}
        PGRList={PGRList}
        selectedPGR={selectedPGR}
        PGRAppTypeList={PGRAppTypeList}
        PGRUnit={PGRAppUnitList}
        onSave={handlePGRSave}
        operationId={operationId}
      />
    );
  } else if (surfaceResidue || operationName == "Surface Residue") {
    return (
      <SurfaceResidueForm
        cropName={cropName}
        selectedSurfRes={selectedSurfResType}
        surfResApplTypeList={surfResApplTypeList}
        surfResTypeList={surfResTypeList}
        onSave={handleSurfaceResidueSave}
        operationId={operationId}
      />
    );
  } else if (irrigationForm || operationName == "Irrigation Type") {
    return (
      <IrrigationForm
        irrigationTypeList={irrigationTypeList}
        selectedIrrigationType={selectedIrrigationType}
        onSave={handleIrrigationSave}
        operationId={operationId}
      />
    );
  }
  //  else if (operationName == "Simulation Start") {
  //   return (
  //     <Simulation
  //       cropName={cropName}
  //       onSave={handleSimulationStartSave}
  //       opDateVal={opDateVal}
  //       operationId={operationId}
  //     />
  //   );
  // } 
  else if (operationName == "Tillage") {
    return (
      <Tillage
        cropName={cropName}
        onSave={handleTillageSave}
        operationId={operationId}
        tillageList={tillageTypeList}
        tillageDate={opDateVal}
      />
    );
  } else {
    // console.log([operationId, operationName, opDateVal]);
    // console.log(typeof opDateVal)
    
    return (
      <Box p={4} borderWidth={1} borderRadius='lg' boxShadow='md'>
        <VStack spacing={4} align='stretch'>
          {(operationName === "Sowing" ||
            operationName === "Harvest" ||
            operationName === "Simulation End" ||
            operationName === "Emergence") && (
            <FormControl>
              <FormLabel>Date</FormLabel>
              <CustomDatePicker date={date} onDateChange={handleDateChange} />
            </FormControl>
          )}

          {formType == "NewOperation" && (
            <>
              <FormControl>
                <FormLabel>Fertilizer Class</FormLabel>
                <Select
                  value={selectedFertClass}
                  onChange={handleFertClassChange}
                >
                  <option value=''>Select Fertilization</option>
                  {fertClass.map((fert, index) => (
                    <option
                      key={index}
                      value={
                        typeof fert === "string"
                          ? fert
                          : fert.fertilizationClass
                      }
                    >
                      {typeof fert === "string"
                        ? fert
                        : fert.fertilizationClass}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {formType == "NewOperation" && cropName === "cotton" && (
                <FormControl>
                  <FormLabel>Plant Growth Regulator Chemical</FormLabel>
                  <Select value={selectedPGR} onChange={handlePGRChange}>
                    <option value=''>
                      Select Plant Growth Regulator Chemical
                    </option>

                    {PGRList.map((pgr, index) => (
                      <option
                        key={index}
                        value={typeof pgr === "string" ? pgr : pgr.PGRChemical}
                      >
                        {typeof pgr === "string" ? pgr : pgr.PGRChemical}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              )}
              {formType == "NewOperation" && !surfResFlag && (
                <FormControl>
                  <FormLabel>Surface Residue</FormLabel>
                  <Select
                    value={selectedSurfResType}
                    onChange={handleSurfResTypeChange}
                  >
                    <option value=''>Select Surface Residue Type</option>
                    {surfResTypeList.map((res, index) => (
                      <option
                        key={index}
                        value={typeof res === "string" ? res : res.residueType}
                      >
                        {typeof res === "string" ? res : res.residueType}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              )}

              {formType == "NewOperation" && (
                <FormControl>
                  <FormLabel>Irrigation Type</FormLabel>
                  <Select
                    value={selectedIrrigationType}
                    onChange={handleIrrigationTypeChange}
                  >
                    <option value=''>Select Irrigation Type</option>
                    {irrigationTypeList.map((res, index) => (
                      <option
                        key={index}
                        value={
                          typeof res === "string" ? res : res.irrigationClass
                        }
                      >
                        {typeof res === "string" ? res : res.irrigationClass}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              )}
            </>
          )}
          {operationId && (
            <>
              <Button
                colorScheme='teal'
                mr={3}
                onClick={handleSaveOperationData}
              >
                Update xyz
              </Button>
            </>
          )}
        </VStack>
      </Box>
    );
  }
};

export default OperationForm;
