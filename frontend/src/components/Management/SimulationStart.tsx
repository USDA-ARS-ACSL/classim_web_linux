import React, { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  VStack,
  Spinner,
  Text,
} from "@chakra-ui/react";
import {
  CultivarCropPublic,
  ManagementService,
  TDataOperationForms,
  CultivarTabApis,
} from "../../client";
import useCustomToast from "../../hooks/useCustomToast";
import CustomDatePicker from "../Common/CustomDatePicker";

interface SimulationProps {
  treatmentId: number;
  onClose: () => void;
  onSaved?: (newDate: string) => void; // <-- add this
}

const SimulationStart: React.FC<SimulationProps> = ({
  treatmentId,
  onClose,
  onSaved, // <-- add this
}) => {
  const [cultivar, setCultivar] = useState<string>("");
  const [eachCropCultivars, seteachCropCultivars] = useState<CultivarCropPublic[]>(
    []
  );
  const [date, setDate] = useState<string | null>(null);
  const [plantDensity, setPlantDensity] = useState<number>(6.5);
  const [seedDepth, setSeedDepth] = useState<number>(5);
  const [rowSpacing, setRowSpacing] = useState<number>(0.5);
  const [autoIrrigation, setAutoIrrigation] = useState<number>(0);
  const [plantingGrid, setPlantingGrid] = useState<number>(0.65);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cropName, setCropName] = useState<string>("");
  const [seedpieceMass, setSeedpieceMass] = useState<number>(10);

  const showToast = useCustomToast();

  // Fetch crop name and operationId for the treatment
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Get treatment details (to get experimentId and cropName)
        const tmtResp = await ManagementService.getTreatmentById({
          tid: treatmentId,
        });
        const treatment = Array.isArray(tmtResp?.data) ? tmtResp.data[0] : tmtResp?.data;
        if (!treatment) throw new Error("Treatment not found");

        // 2. Get experiment details (to get cropName)
        const expResp = await ManagementService.getExperimentById({
          exid: treatment.t_exid,
        });
        console.log(expResp)
        const experiment = Array.isArray(expResp?.data) ? expResp.data[0] : expResp?.data;
        if (!experiment) throw new Error("Experiment not found");

        const cropName = experiment.crop;

        // 3. Get operations for this treatment, find "Simulation Start"
        const opsResp = await ManagementService.getOperationsByTreatment({
          o_t_exid: treatmentId,
        });
        const simStartOp = opsResp?.data?.find(
          (op: any) => op.name === "Simulation Start"
        );
        if (!simStartOp) throw new Error("Simulation Start operation not found");

        // 4. Fetch cultivars for this crop
        const cultivarsResp = await CultivarTabApis.readCultivars({
          cropType: cropName,
        });
        seteachCropCultivars(cultivarsResp.data);

        // 5. Fetch simulation start operation details
        const opObj: TDataOperationForms = { opid: simStartOp.opID };
        const ss_response = await ManagementService.getSimulationStart(opObj);

        setDate(simStartOp.odate || null);
        setCultivar(ss_response?.cultivar || "");
        setPlantDensity(ss_response?.pop ?? 6.5);
        setSeedDepth(ss_response?.yseed ?? 5);
        setRowSpacing(ss_response?.rowSpacing ?? 0.5);
        setPlantingGrid(ss_response?.eomult ?? 0.65);
        setAutoIrrigation(ss_response?.autoirrigation ?? 0);
        setCropName(cropName);
        setSeedpieceMass(ss_response?.seedpieceMass ?? 0);
      } catch (err: any) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    if (treatmentId) fetchInitialData();
  }, [treatmentId]);

  const handleSave = async () => {
    if (!date) {
      showToast("Error", "Date field is empty!", "error");
      return;
    }
    if (!cultivar) {
      showToast("Error", "Cultivars field is empty!", "error");
      return;
    }
    if (plantDensity == null) {
      showToast("Error", "Plant Density field is empty!", "error");
      return;
    }
    if (seedDepth == null) {
      showToast("Error", "Seed Depth field is empty!", "error");
      return;
    }
    if (rowSpacing == null) {
      showToast("Error", "Row Spacing field is empty!", "error");
      return;
    }
    if (autoIrrigation == null) {
      showToast("Error", "Auto Irrigation field is empty!", "error");
      return;
    }
    if (plantingGrid == null) {
      showToast("Error", "Location of planting grid field is empty!", "error");
      return;
    }

    // Required fields for InitCondOpDataUpdate
    const requestBody = {
      pop: plantDensity,
      autoirrigation: autoIrrigation,
      xseed: 0, // TODO: Replace with actual value if available
      yseed: seedDepth,
      cec: 0.65, // TODO: Replace with actual value if available
      eomult: plantingGrid,
      rowSpacing: rowSpacing,
      cultivar: cultivar,
      seedpieceMass: seedpieceMass, // TODO: Replace with actual value if available
      odate: date,
      // treatmentid removed from here
    };
    console.log({ treatmentid: treatmentId, requestBody });

    try {
      await ManagementService.updateInitCondOpData({ treatmentid: treatmentId, requestBody });
      showToast("Success", "Simulation start data saved!", "success");
      if (onSaved && date) onSaved(date); // <-- notify parent
      onClose();
    } catch (err: any) {
      showToast("Error", err?.message || "Failed to save data", "error");
    }
  };

  if (loading) {
    return (
      <Box p={4} textAlign="center">
        <Spinner />
        <Text mt={2}>Loading...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4} textAlign="center">
        <Text color="red.500">{error}</Text>
        <Button mt={2} onClick={onClose}>
          Close dgdg
        </Button>
      </Box>
    );
  }

  return (
    <Box p={4} borderWidth={1} borderRadius="lg" boxShadow="md">
      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel>Date</FormLabel>
          <CustomDatePicker date={date} onDateChange={setDate} />
        </FormControl>
        <FormControl>
          <FormLabel>Cultivars for {cropName}</FormLabel>
          <Select
            placeholder="Select Cultivar"
            value={cultivar}
            onChange={(e) => setCultivar(e.target.value)}
          >
            {Array.isArray(eachCropCultivars) &&
              eachCropCultivars.map((cultivar) => (
                <option key={cultivar.id} value={cultivar.hybridname}>
                  {cultivar.hybridname}
                </option>
              ))}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Plant Density (number of plants/m2)</FormLabel>
          <Input
            type="number"
            value={plantDensity}
            onChange={(e) => setPlantDensity(Number(e.target.value))}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Seed Depth (cm)</FormLabel>
          <Input
            type="number"
            value={seedDepth}
            onChange={(e) => setSeedDepth(Number(e.target.value))}
          />
        </FormControl>
                {cropName === "potato" && (
          <FormControl>
            <FormLabel>Seed Piece Mass (g)</FormLabel>
            <Input
              type="number"
              value={seedpieceMass}
              onChange={(e) => setSeedpieceMass(Number(e.target.value))}
            />
          </FormControl>
        )}
        <FormControl>
          <FormLabel>Row Spacing (cm)</FormLabel>
          <Input
            type="number"
            value={rowSpacing}
            onChange={(e) => setRowSpacing(Number(e.target.value))}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Location of planting grid</FormLabel>
          <Box>
            <label>
              <input
                type="radio"
                name="plantingGrid"
                value={0.5}
                checked={plantingGrid === 0.5}
                onChange={() => setPlantingGrid(0.5)}
              />
              Left
            </label>
            <label style={{ marginLeft: '1em' }}>
              <input
                type="radio"
                name="plantingGrid"
                value={1.0}
                checked={plantingGrid === 1.0}
                onChange={() => setPlantingGrid(1.0)}
              />
              Right
            </label>
          </Box>
        </FormControl>
        <FormControl>
          <FormLabel>Auto Irrigation</FormLabel>
          <Box>
            <label>
              <input
                type="radio"
                name="autoIrrigation"
                value={1}
                checked={autoIrrigation === 1}
                onChange={() => setAutoIrrigation(1)}
              />
              Yes
            </label>
            <label style={{ marginLeft: '1em' }}>
              <input
                type="radio"
                name="autoIrrigation"
                value={0}
                checked={autoIrrigation === 0}
                onChange={() => setAutoIrrigation(0)}
              />
              No
            </label>
          </Box>
        </FormControl>
        <VStack direction="row" spacing={4}>
          <Button colorScheme="teal" onClick={handleSave} mr={3}>
            Save
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
};

export default SimulationStart;

