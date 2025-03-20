import React, { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  VStack,
} from "@chakra-ui/react";
import {
  CultivarCropPublic,
  ManagementService,
  TDataOperationForms,
  CultivarTabApis,
} from "../../client";
import useCustomToast from "../../hooks/useCustomToast";

interface SimulationProps {
  cropName: string;
  onSave: (data: any) => void;
  operationId?: number | null;
}

const Simulation: React.FC<SimulationProps> = ({
  cropName,
  onSave,
  operationId,
}) => {
  const [cultivar, setCultivar] = useState<string>();
  const [eachCropCultivars, seteachCropCultivars] = useState<CultivarCropPublic[]>([]);
  const [date, setDate] = useState<string>("");
  const [plantDensity, setPlantDensity] = useState<number>();
  const [seedDepth, setSeedDepth] = useState<number>();
  const [rowSpacing, setRowSpacing] = useState<number>();
  const [autoIrrigation, setAutoIrrigation] = useState<number>();
  const [plantingGrid, setPlantingGrid] = useState<number>();

  const showToast = useCustomToast();

  const handleCultivar = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCultivar(value);
  };

  const handlePlantingGrid = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setPlantingGrid(Number(value));
  };

  const handleAutoIrrigation = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setAutoIrrigation(Number(value));
  };

  const fetchCultivarByCrop = async (cropName: string) => {
      try {
        const response = await CultivarTabApis.readCultivars({
          cropType: cropName,
        });
        const data1 = await response.data;

        seteachCropCultivars(data1);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
  };

  const fetchInitCondOp = async (operationId: number) => {
    try {
      const opObj: TDataOperationForms = {
        opid: operationId !== null ? operationId : 0,
      };
      const ss_response =
        await ManagementService.getSimulationStart(opObj);

      if (ss_response) {
        console.log(ss_response);        
        setDate(new Date().toISOString().split("T")[0]); // Assuming you want the current date to be set       
        setCultivar(ss_response.cultivar);      
      setPlantDensity(ss_response.pop);
      setSeedDepth(ss_response.yseed);
      setRowSpacing(ss_response.rowSpacing);
      setPlantingGrid(ss_response.eomult);
      setAutoIrrigation(ss_response.autoirrigation); 
      }
    } catch (error) {
      console.error("Failed to fetch surface residue data", error);
    }
  };
  function formatDate(dateString: string) {
    const [year, month, day] = dateString.split("-");
    return `${month}/${day}/${year}`;
  }
  const handleSave = () => {
    if (date === "" || date === null) {
      showToast("Error", "Date field is empty!", "error");
      return;
    }else if (cultivar === "" || cultivar === null) {
      showToast("Error", "Cultivars field is empty!", "error");
      return;
    }else if (plantDensity === null) {
      showToast("Error", "Plant Density field is empty!", "error");
      return;
    }else if (seedDepth === null) {
      showToast("Error", "Seed Depth field is empty!", "error");
      return;
    }else if (rowSpacing === null) {
      showToast("Error", "Row Spacing field is empty!", "error");
      return;
    }else if (autoIrrigation === null) {
      showToast("Error", "Location of planting grid field is empty!", "error");
      return;
    }else if (plantingGrid === null) {
      showToast("Error", "Auto Irrigation field is empty!", "error");
      return;
    }
    const formatedDate = formatDate(date);
    const data = {
      cultivar,
      rowSpacing,
      formatedDate,
      plantDensity,
      seedDepth,
      plantingGrid,
      autoIrrigation
    };

    onSave(data);
  };

  useEffect(() => {
    console.log(cropName);
    if (cropName) {
      fetchCultivarByCrop(cropName);
    } 
    if (operationId) {
      fetchInitCondOp(operationId);
    } else {
      setCultivar("");
      setDate("");
      setPlantDensity(6.5);
      setSeedDepth(5);
      setRowSpacing(0.5);
      setPlantingGrid(0.65);
      setAutoIrrigation(0);
    }
  }, [cropName]);
  return (
    <Box p={4} borderWidth={1} borderRadius='lg' boxShadow='md'>
      <VStack spacing={4} align='stretch'>
        <FormControl>
          <FormLabel>Date</FormLabel>
          <Input
            type='date'
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Cultivars</FormLabel>
          <Select
            placeholder='Select Cultivar'
            value={cultivar}
            onChange={handleCultivar}
          >
                      {Array.isArray(eachCropCultivars) && eachCropCultivars.map((cultivar) => (
                        <option key={cultivar.id} value={cultivar.hybridname}>
                          {cultivar.hybridname}
                        </option>
                      ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Plant Density (number of plants/m2)</FormLabel>
          <Input
            type='number'
            value={plantDensity}
            onChange={(e) => setPlantDensity(Number(e.target.value))}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Seed Depth (cm)</FormLabel>
          <Input
            type='number'
            value={seedDepth}
            onChange={(e) => setSeedDepth(Number(e.target.value))}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Row Spacing (cm)</FormLabel>
          <Input
            type='number'
            value={rowSpacing}
            onChange={(e) => setRowSpacing(Number(e.target.value))}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Location of planting grid</FormLabel>
          <Select
            placeholder='Select location of planting grid'
            value={plantingGrid}
            onChange={handlePlantingGrid}
          >
            <option value={0.5}>Left</option>
            <option value={1.0}>Right</option>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Auto Irrigation</FormLabel>
          <Select
            placeholder='Select Auto Irrigation'
            value={autoIrrigation}
            onChange={handleAutoIrrigation}
          >
            <option value={1}>Yes</option>
            <option value={0}>No</option>
          </Select>
        </FormControl>
        
        {operationId && (
          <>
            <Button colorScheme='teal' onClick={handleSave} mr={3}>
              Update a
            </Button>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default Simulation;
