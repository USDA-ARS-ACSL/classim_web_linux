import { useState, useEffect } from "react";
import {
  Button,
  Select,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  FormControl,
  FormLabel,
  VStack,
  HStack,
} from "@chakra-ui/react";
import CustomDatePicker from "./CustomDatePicker";
import { ManagementService } from "../../client/services";

// Helper to fetch dropdown data from backend
const getOperationDropDown = async (opType?: string) => {
  try {
    const response = await ManagementService.getOperationTypesToAdd();
    if (opType) return response[opType] || [];
    return response;
  } catch (error) {
    console.error("Failed to fetch operation dropdown data", error);
    return {};
  }
}

// Use string for operation type
// type OperationType = keyof typeof dropdownData;
type OperationType = string;

type FertilizationClass = "Fertilizer-N" | "Manure" | "litter";
type SurfaceResidue = "Rye";
type IrrigationType = "Drip" | "FloodH" | "FloodR" | "Furrow" | "Sprinkler";

type OperationFormData = {
  class?: FertilizationClass;
  date?: string;
  depth?: string;
  n?: string;
  carbon?: string;
  residue?: SurfaceResidue;
  appType?: string;
  appValue?: string;
  irrType?: IrrigationType;
  rate?: string;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
};

interface OperationFormProps {
  operationType: OperationType;
  onClose: () => void;
}

const OperationForm: React.FC<OperationFormProps> = ({ operationType, onClose }) => {
  const [formData, setFormData] = useState<OperationFormData>({});
  const [dropdownData, setDropdownData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch dropdown data from backend
    getOperationDropDown().then(setDropdownData);
  }, []);

  const handleChange = (field: keyof OperationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const payload = { ...formData, operationType };
      await ManagementService.createOrUpdateOperation(payload);
      onClose();
    } catch (error) {
      console.error("Failed to save operation", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFert = operationType === "fertilization";
  const isRes = operationType === "s_residue";
  const isIrr = operationType === "irrgationType";

  return (
    <Modal isOpen onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{`Create ${String(operationType)} Operation`}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {isFert && (
              <>
                <FormControl>
                  <FormLabel>Fertilization Class</FormLabel>
                  <Select
                    onChange={(e) => handleChange("class", e.target.value as FertilizationClass)}
                  >
                    {dropdownData.fertilization && dropdownData.fertilization.map((item: string) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </Select>
                <FormControl>
                  <FormLabel>Date</FormLabel>
                  <CustomDatePicker
                    date={formData.date || ""}
                    onDateChange={(value: string) => handleChange("date", value)}
                  />
                </FormControl>
                </FormControl>
                <FormControl>
                  <FormLabel>Fertilizer Depth (CM)</FormLabel>
                  <Input onChange={(e) => handleChange("depth", e.target.value)} />
                </FormControl>
                <FormControl>
                  <FormLabel>Nitrogen (N) (kg/ha)</FormLabel>
                  <Input onChange={(e) => handleChange("n", e.target.value)} />
                </FormControl>
                {(formData.class === "Manure" || formData.class === "litter") && (
                  <FormControl>
                    <FormLabel>Carbon (C) (kg/ha)</FormLabel>
                    <Input
                      onChange={(e) => handleChange("carbon", e.target.value)}
                    />
                  </FormControl>
                )}
              </>
            )}
            {isRes && (
              <>
                <FormControl>
                  <FormLabel>Date</FormLabel>
                  <CustomDatePicker
                    date={formData.date || ""}
                    onDateChange={(value: string) => handleChange("date", value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Surface Residue</FormLabel>
                  <Select
                    onChange={(e) => handleChange("residue", e.target.value as SurfaceResidue)}
                  >
                    {dropdownData.s_residue && dropdownData.s_residue.map((item: string) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Application Type</FormLabel>
                  <Select
                    onChange={(e) => handleChange("appType", e.target.value)}
                  >
                    <option value="Mass">Mass</option>
                    <option value="Thickness">Thickness</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Application Value</FormLabel>
                  <Input
                    onChange={(e) => handleChange("appValue", e.target.value)}
                  />
                </FormControl>
              </>
            )}
            {isIrr && (
              <>
                <FormControl>
                  <FormLabel>Irrigation Type</FormLabel>
                  <Select
                    onChange={(e) => handleChange("irrType", e.target.value as IrrigationType)}
                  >
                    {dropdownData.irrgationType && dropdownData.irrgationType.map((item: string) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Pond Depth (cm)</FormLabel>
                  <Input
                    onChange={(e) => handleChange("depth", e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Rate</FormLabel>
                  <Input onChange={(e) => handleChange("rate", e.target.value)} />
                <FormControl>
                  <FormLabel>Start Date</FormLabel>
                  <CustomDatePicker
                    date={formData.startDate || ""}
                    onDateChange={(value: string) => handleChange("startDate", value)}
                  />
                </FormControl>
                </FormControl>
                <FormControl>
                  <FormLabel>Start Time</FormLabel>
                  <Input
                    type="time"
                    onChange={(e) => handleChange("startTime", e.target.value)}
                  />
                <FormControl>
                  <FormLabel>End Date</FormLabel>
                  <CustomDatePicker
                    date={formData.endDate || ""}
                    onDateChange={(value: string) => handleChange("endDate", value)}
                  />
                </FormControl>
                </FormControl>
                <FormControl>
                  <FormLabel>End Time</FormLabel>
                  <Input
                    type="time"
                    onChange={(e) => handleChange("endTime", e.target.value)}
                  />
                </FormControl>
              </>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={handleSave} isLoading={isSubmitting}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const OperationCreateForm = () => {
  const [selectedType, setSelectedType] = useState<string>("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [dropdownData, setDropdownData] = useState<any>({});
  const [operations, setOperations] = useState<any[]>([]); // Store all operations
  // TODO: Replace with actual treatment id from props/context
  const treatmentId = 1; // Hardcoded for now, replace as needed

  useEffect(() => {
    getOperationDropDown().then(setDropdownData);
    // Fetch all operations for the current treatment
    if (treatmentId) {
      ManagementService.getOperationsByTreatment({ o_t_exid: treatmentId }).then((data) => {
        setOperations(data.data || []);
      });
    }
  }, [treatmentId]);

  const handleOperationCreated = () => {
    // Refresh operations after creation
    if (treatmentId) {
      ManagementService.getOperationsByTreatment({ o_t_exid: treatmentId }).then((data) => {
        setOperations(data.data || []);
      });
    }
    onClose();
  };

  return (
    <HStack 
      spacing={2}
      mb={4}
      width={{ base: "100%", sm: "100%", md: "100%", lg: "70%", "xl": "50%" }}
      flexDirection={{ base: "column", md: "row" }}
    >
      <FormControl>
        <Select
          onChange={(e) => setSelectedType(e.target.value)}
          value={selectedType}
        >
          <option value="">Select Operation</option>
          {Object.keys(dropdownData).map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </Select>
      </FormControl>
      <Button
        colorScheme="blue"
        width={{ base: "100%", md: "50%" }}
        isDisabled={!selectedType}
        onClick={onOpen}
      >
        Create Operation
      </Button>
      {isOpen && selectedType && (
        <OperationForm operationType={selectedType} onClose={handleOperationCreated} />
      )}
      {/* Show all operations */}
      <VStack align="start" mt={4} width="100%">
        {operations.map((op) => (
          <div key={op.opID}>{op.name} - {op.odate}</div>
        ))}
      </VStack>
    </HStack>
  );
};

export default OperationCreateForm;
