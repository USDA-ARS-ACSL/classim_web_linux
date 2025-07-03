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
  useToast,
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

type FertilizationClass = "Fertilizer-N" | "Manure" | "Litter";
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
  treatmentId: number;
  operationID?: number;
  initialData?: OperationFormData;
  hideDropdown?: boolean;
  editMode?: boolean;
  onOperationSaved?: () => void;
}

const OperationForm: React.FC<OperationFormProps> = ({ operationType, onClose, treatmentId, operationID = -10, initialData, hideDropdown, editMode = false, onOperationSaved }) => {
  // Set default class to 'Manure' if isFert
  const isFert = operationType === "fertilization";
  const [formData, setFormData] = useState<OperationFormData>(
    initialData ? initialData : (isFert ? { class: "Manure" } : {})
  );
  const [dropdownData, setDropdownData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const isRes = operationType === "s_residue";
  const isIrr = operationType === "irrgationType";

  useEffect(() => {
    // Fetch dropdown data from backend
    getOperationDropDown().then(setDropdownData);
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      if (isFert) {
        setFormData((prev) => ({ ...prev, class: "Manure" }));
      }
      if (isIrr && dropdownData.irrgationType && dropdownData.irrgationType.length > 0) {
        // Set default irrType and class to first available option if present
        const firstIrrType = dropdownData.irrgationType[0];
        setFormData((prev) => ({ ...prev, irrType: firstIrrType, class: firstIrrType }));
      }
    }
  }, [isFert, isIrr, dropdownData, initialData]);

  const handleChange = (field: keyof OperationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      if (isFert && !formData.date) {
        alert("Date is required for fertilization.");
        setIsSubmitting(false);
        return;
      }
      let classValue = formData.class || "";
      if (isIrr) {
        classValue = formData.irrType || "";
      } else if (isRes) {
        classValue = "Rye";
      }
      // Build payload with only relevant date fields
      let dateFields: any = {};
      if (isIrr) {
        dateFields = {
          startDate: formData.startDate || "",
          endDate: formData.endDate || "",
          startTime: formData.startTime || "",
          endTime: formData.endTime || "",
        };
      } else {
        dateFields = {
          date: formData.date || "",
        };
      }
      const payload = {
        data: {
          operationID, // Always send operationID, default -10
          operationType,
          treatmentId,
          class: classValue,
          ...formData,
          ...dateFields,
        }
      };
      await ManagementService.createOrUpdateOperation({ requestBody: payload });
      if (onOperationSaved) onOperationSaved();
      onClose();
    } catch (error) {
      console.error("Failed to save operation", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await ManagementService.deleteOperation({ opID: operationID });
      toast({
        title: "Operation Deleted",
        description: "The operation has been deleted successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      if (onOperationSaved) onOperationSaved();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete operation.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{editMode ? `Edit ${String(operationType)} Operation` : `Create ${String(operationType)} Operation`}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">

            {!hideDropdown && isFert && (
              <>
                <FormControl>
                  <FormLabel>Fertilization Class</FormLabel>
                  <Select
                    value={formData.class || ""}
                    onChange={(e) => handleChange("class", e.target.value as FertilizationClass)}
                    isDisabled={editMode}
                  >
                    {dropdownData.fertilization && dropdownData.fertilization.map((item: string) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}
            {isFert && (
              <>
                <FormControl isRequired>
                  <FormLabel>Date</FormLabel>
                  <CustomDatePicker
                    date={formData.date || ""}
                    onDateChange={(value: string) => handleChange("date", value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Fertilizer Depth (CM)</FormLabel>
                  <Input value={formData.depth || ""} onChange={(e) => handleChange("depth", e.target.value)} />
                </FormControl>
                <FormControl>
                  <FormLabel>Nitrogen (N) (kg/ha)</FormLabel>
                  <Input value={formData.n || ""} onChange={(e) => handleChange("n", e.target.value)} />
                </FormControl>
                {(formData.class === "Manure" || formData.class === "Litter") ? (
                  <FormControl>
                    <FormLabel>Carbon (C) (kg/ha)</FormLabel>
                    <Input
                      value={formData.carbon || ""}
                      onChange={(e) => handleChange("carbon", e.target.value)}
                    />
                  </FormControl>
                ) : null}
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
                    value={formData.residue || ""}
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
                    value={formData.appType || ""}
                    onChange={(e) => handleChange("appType", e.target.value)}
                  >
                    <option value="Mass">Mass</option>
                    <option value="Thickness">Thickness</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Application Value</FormLabel>
                  <Input
                    value={formData.appValue || ""}
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
                    value={formData.irrType || ""}
                    onChange={(e) => {
                      handleChange("irrType", e.target.value as IrrigationType);
                      handleChange("class", e.target.value as IrrigationType);
                    }}
                  >
                    {dropdownData.irrgationType && dropdownData.irrgationType.map((item: string) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                {/* Drip and Furrow: only Depth */}
                {(formData.irrType === "Drip" || formData.irrType === "Furrow") && (
                  <FormControl>
                    <FormLabel>Pond Depth (cm)</FormLabel>
                    <Input
                      value={formData.depth || ""}
                      onChange={(e) => handleChange("depth", e.target.value)}
                    />
                  </FormControl>
                )}
                {/* Sprinkler: Date and Amount of Irrigation */}
                {formData.irrType === "Sprinkler" && (
                  <>
                    <FormControl>
                      <FormLabel>Date</FormLabel>
                      <CustomDatePicker
                        date={formData.date || ""}
                        onDateChange={(value: string) => handleChange("date", value)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Amount of Irrigation</FormLabel>
                      <Input
                        value={formData.rate || ""}
                        onChange={(e) => handleChange("rate", e.target.value)}
                      />
                    </FormControl>
                  </>
                )}
                {/* FloodH: Pond Depth, Start Date, Start Time, End Date, End Time */}
                {formData.irrType === "FloodH" && (
                  <>
                    <FormControl>
                      <FormLabel>Pond Depth (cm)</FormLabel>
                      <Input
                        value={formData.depth || ""}
                        onChange={(e) => handleChange("depth", e.target.value)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Start Date</FormLabel>
                      <CustomDatePicker
                        date={formData.startDate || ""}
                        onDateChange={(value: string) => handleChange("startDate", value)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Start Time</FormLabel>
                      <Input
                        type="time"
                        value={formData.startTime || ""}
                        onChange={(e) => handleChange("startTime", e.target.value)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>End Date</FormLabel>
                      <CustomDatePicker
                        date={formData.endDate || ""}
                        onDateChange={(value: string) => handleChange("endDate", value)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>End Time</FormLabel>
                      <Input
                        type="time"
                        value={formData.endTime || ""}
                        onChange={(e) => handleChange("endTime", e.target.value)}
                      />
                    </FormControl>
                  </>
                )}
                {/* FloodR: All FloodH fields + Rate */}
                {formData.irrType === "FloodR" && (
                  <>
                    <FormControl>
                      <FormLabel>Pond Depth (cm)</FormLabel>
                      <Input
                        value={formData.depth || ""}
                        onChange={(e) => handleChange("depth", e.target.value)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Start Date</FormLabel>
                      <CustomDatePicker
                        date={formData.startDate || ""}
                        onDateChange={(value: string) => handleChange("startDate", value)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Start Time</FormLabel>
                      <Input
                        type="time"
                        value={formData.startTime || ""}
                        onChange={(e) => handleChange("startTime", e.target.value)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>End Date</FormLabel>
                      <CustomDatePicker
                        date={formData.endDate || ""}
                        onDateChange={(value: string) => handleChange("endDate", value)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>End Time</FormLabel>
                      <Input
                        type="time"
                        value={formData.endTime || ""}
                        onChange={(e) => handleChange("endTime", e.target.value)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Rate</FormLabel>
                      <Input
                        value={formData.rate || ""}
                        onChange={(e) => handleChange("rate", e.target.value)}
                      />
                    </FormControl>
                  </>
                )}
              </>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={handleSave} isLoading={isSubmitting}>
            {editMode ? "Update" : "Save"}
          </Button>
          {editMode && (
            <Button colorScheme="red" ml={3} onClick={handleDelete} isLoading={isSubmitting}>
              Delete
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const OperationCreateForm = ({ treatmentId, operationID = -10, editMode = false, initialData, operationType, onOperationSaved }: { treatmentId: number; operationID?: number; editMode?: boolean; initialData?: OperationFormData; operationType?: string; onOperationSaved?: () => void }) => {
  const [selectedType, setSelectedType] = useState<string>(operationType || "");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [dropdownData, setDropdownData] = useState<any>({});

  useEffect(() => {
    getOperationDropDown().then(setDropdownData);
  }, []);

  const handleOperationCreated = () => {
    // No need to fetch operations here, handled by parent
    if (onOperationSaved) onOperationSaved();
    onClose();
  };

  // If in edit mode, open modal immediately and pass props
  if (editMode && operationType && initialData) {
    return (
      <OperationForm
        operationType={operationType}
        onClose={onClose}
        treatmentId={treatmentId}
        operationID={operationID}
        initialData={initialData}
        hideDropdown={true}
        editMode={true}
        onOperationSaved={handleOperationCreated}
      />
    );
  }

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
        <OperationForm operationType={selectedType} onClose={handleOperationCreated} treatmentId={treatmentId} operationID={operationID} onOperationSaved={handleOperationCreated} />
      )}
    </HStack>
  );
};

export default OperationCreateForm;
export { OperationForm };
