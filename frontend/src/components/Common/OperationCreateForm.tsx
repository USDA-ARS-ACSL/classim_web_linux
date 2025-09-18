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
  FormErrorMessage,
} from "@chakra-ui/react";
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
  startH?: string;
  endDate?: string;
  stopH?: string;
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


const getOperationTypeLabel = (type: string) => {
  if (type === "s_residue") return "Surface rye mulch residue";
  if (type === "fertilization") return "Fertilization";
  if (type === "irrgationType") return "Irrigation";
  return type.charAt(0).toUpperCase() + type.slice(1);
};
const OperationForm: React.FC<OperationFormProps> = ({ operationType, onClose, treatmentId, operationID = -10, initialData, hideDropdown, editMode = false, onOperationSaved }) => {
  // Set default class to 'Manure' if isFert
  const isFert = operationType === "fertilization";
  const [formData, setFormData] = useState<OperationFormData>(
    initialData ? initialData : (isFert ? { class: "Manure" } : {})
  );
  const [dropdownData, setDropdownData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
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

  const validateFields = (): boolean => {
    const errors: Record<string, string> = {};

    // Fertilization validation
    if (isFert) {
      if (!formData.class) errors.class = "Fertilization Class is mandatory.";
      // if (!formData.date) errors.date = "Date is mandatory.";
      if (!formData.depth) errors.depth = "Fertilizer Depth is mandatory.";
      if (!formData.depth || Number(formData.depth) <= 0 || Number(formData.depth) >= 30) {
        errors.depth = "Fertilizer Depth must be a between 0-30.";
      }
      if (!formData.n) errors.n = "Nitrogen (N) is mandatory.";
      if (!formData.n || Number(formData.n) <= 0 || Number(formData.n) > 6000) {
        errors.n = "Nitrogen (N) must be between 0-6000.";
      }
      if ((formData.class === "Manure" || formData.class === "Litter") && !formData.carbon) {
        errors.carbon = "Carbon (C) is mandatory for Manure or Litter.";
      }
    }

    // Surface Residue validation
    if (isRes) {
      // if (!formData.date) errors.date = "Date is mandatory.";
      if (!formData.appType) errors.appType = "Application Type is mandatory.";
      if (!formData.appValue) errors.appValue = "Application Value is mandatory.";
    }

    // Irrigation validation
    if (isIrr) {
      if (!formData.irrType) errors.irrType = "Irrigation Type is mandatory.";
      if (formData.irrType === "Drip" || formData.irrType === "Furrow") {
        if (!formData.depth) errors.depth = "Depth is mandatory.";
      }
      if (formData.irrType === "Sprinkler") {
        // if (!formData.date) errors.date = "Date is mandatory.";
        if (!formData.rate) errors.rate = "Amount of Irrigation is mandatory.";
      }
      if (formData.irrType === "FloodH") {
        if (!formData.depth) errors.depth = "Pond Depth is mandatory.";
        // if (!formData.startDate) errors.startDate = "Start Date is mandatory.";
        if (!formData.startH) errors.startH = "Start Time is mandatory.";
        // if (!formData.endDate) errors.endDate = "End Date is mandatory.";
        if (!formData.stopH) errors.stopH = "End Time is mandatory.";
      }
      if (formData.irrType === "FloodR") {
        if (!formData.depth) errors.depth = "Pond Depth is mandatory.";
        if (!formData.rate) errors.rate = "Rate is mandatory.";
        // if (!formData.startDate) errors.startDate = "Start Date is mandatory.";
        if (!formData.startH) errors.startH = "Start Time is mandatory.";
        // if (!formData.endDate) errors.endDate = "End Date is mandatory.";
        if (!formData.stopH) errors.stopH = "End Time is mandatory.";
      }
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast({
        title: "Validation Error",
        description: Object.values(errors).join("\n"),
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      if (!validateFields()) {
        setIsSubmitting(false);
        return;
      }
      // Use today's date in MM/DD/YYYY format if date is empty
      let dateToUse = formData.date;
      if ((isRes || isFert || isIrr) && !formData.date) {
        const today = new Date();
        dateToUse = `${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}/${today.getFullYear()}`;
        setFormData((prev) => ({ ...prev, date: dateToUse }));
      }
      if (isIrr && (formData.irrType === "FloodH" || formData.irrType === "FloodR")) {
        if (!formData.startDate) {
         const today = new Date();
        dateToUse = `${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}/${today.getFullYear()}`;
        setFormData((prev) => ({ ...prev, startDate: dateToUse }));
      }
      if (!formData.endDate) {
        const today = new Date();
        dateToUse = `${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}/${today.getFullYear()}`;
        setFormData((prev) => ({ ...prev, endDate: dateToUse }));
      }
        console.log("Updated formData with default dates:", formData);
      }
      if (isRes && !formData.appType) {
        alert("Please select Application Type");
              setIsSubmitting(false);
        return;
    }
      if ((isRes || isFert || isIrr) && !dateToUse) {
        setIsSubmitting(false);
        return;
      }
      let classValue = formData.class || "";
      if (isIrr) {
        classValue = formData.irrType || "";
      } else if (isRes) {
        classValue = "Rye";
      }
      let dateFields: any = {};
      if (isIrr) {
        dateFields = {
          startDate: toInputDateFormat(formData.startDate || ""),
          endDate: toInputDateFormat(formData.endDate || ""),
          startH: formData.startH || "",
          stopH: formData.stopH || "",
          date : toInputDateFormat(formData.date || ""),
        };
      } else {
        dateFields = {
          date: dateToUse || "",
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
    } catch (error: any) {
      // Show error message from server in toast if available
      const serverMsg = error.body?.detail || error.message || "Failed to save operation.";
      toast({
        title: "Error",
        description: serverMsg,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
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

  // Helper to check if a field has an error
  const hasError = (field: string) => !!fieldErrors[field];

  return (
    <Modal isOpen onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {editMode
            ? `Edit ${getOperationTypeLabel(operationType)} Operation`
            : `Create ${getOperationTypeLabel(operationType)} Operation`}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">

            {/* Example for Fertilization Class */}
            {!hideDropdown && isFert && (
              <>
                <FormControl isInvalid={hasError("class")}>
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
                  <FormErrorMessage>{fieldErrors.class}</FormErrorMessage>
                </FormControl>
              </>
            )}
            {isFert && (
              <>
                <FormControl isRequired isInvalid={hasError("date")}>
                  <FormLabel>Date</FormLabel>
                  <Input
                    type="date"
                    value={toInputDateFormat(formData.date || "")}
                    onChange={(e) => handleChange("date", e.target.value)}
                  />
                  <FormErrorMessage>{fieldErrors.date}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={hasError("depth")}>
                  <FormLabel>Fertilizer Depth (CM)</FormLabel>
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.depth || ""}
                    onKeyDown={(e) => {
                      if (e.key === "-" || e.key === "e") {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d*\.?\d*$/.test(val)) {
                        handleChange("depth", val);
                      }
                    }}
                  />
                  <FormErrorMessage>{fieldErrors.depth}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={hasError("n")}>
                  <FormLabel>Nitrogen (N) (kg/ha)</FormLabel>
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.n || ""}
                    onKeyDown={(e) => {
                      if (e.key === "-" || e.key === "e") {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d*\.?\d*$/.test(val)) {
                        handleChange("n", val);
                      }
                    }}
                  />
                  <FormErrorMessage>{fieldErrors.n}</FormErrorMessage>
                </FormControl>
                {(formData.class === "Manure" || formData.class === "Litter") ? (
                  <FormControl isInvalid={hasError("carbon")}>
                    <FormLabel>Carbon (C) (kg/ha)</FormLabel>
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      value={formData.carbon || ""}
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e") {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^\d*\.?\d*$/.test(val)) {
                          handleChange("carbon", val);
                        }
                      }}
                    />
                    <FormErrorMessage>{fieldErrors.carbon}</FormErrorMessage>
                  </FormControl>
                ) : null}
              </>
            )}
            {isRes && (
              <>
                <FormControl isInvalid={hasError("date")}>
                  <FormLabel>Date</FormLabel>
                  <Input
                    type="date"
                    value={toInputDateFormat(formData.date || "")}
                    onChange={(e) => handleChange("date", e.target.value)}
                  />
                  <FormErrorMessage>{fieldErrors.date}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={hasError("residue")}>
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
                  <FormErrorMessage>{fieldErrors.residue}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={hasError("appType")}>
                  <FormLabel>Application Type</FormLabel>
                  <Select
                    value={formData.appType || ""}
                    required
                    onChange={(e) => handleChange("appType", e.target.value)}
                  >
                    <option value="">Select Application Type</option>
                    <option value="Mass">Mass (kg/ha)</option>
                    <option value="Thickness">Thickness (cm)</option>
                  </Select>
                  <FormErrorMessage>{fieldErrors.appType}</FormErrorMessage>
                </FormControl>
                <FormControl isRequired isInvalid={hasError("appValue")}>
                  <FormLabel>Application Value</FormLabel>
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.appValue || ""}
                    placeholder="Enter value"
                    onKeyDown={(e) => {
                      if (e.key === "-" || e.key === "e") {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d*\.?\d*$/.test(val)) {
                        handleChange("appValue", val);
                      }
                    }}
                  />
                  <FormErrorMessage>{fieldErrors.appValue}</FormErrorMessage>
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
                    isDisabled={editMode} // <-- Disable in edit mode
                  >
                    
                    {dropdownData.irrgationType && dropdownData.irrgationType.map((item: string) => (
                      
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                {/* Drip and Furrow: only Depth */}
                {(formData.irrType === "Drip" ) && (
                  <FormControl>
                    <FormLabel>Rate</FormLabel>
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      value={formData.depth || ""}
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e") {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^\d*\.?\d*$/.test(val)) {
                          handleChange("depth", val);
                        }
                      }}
                    />
                  </FormControl>
                )}
                {( formData.irrType === "Furrow") && (
                  <FormControl>
                    <FormLabel>Pond Depth (cm)</FormLabel>
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      value={formData.depth || ""}
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e") {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^\d*\.?\d*$/.test(val)) {
                          handleChange("depth", val);
                        }
                      }}
                    />
                  </FormControl>
                )}
                {/* Sprinkler: Date and Amount of Irrigation */}
                {formData.irrType === "Sprinkler" && (
                  <>
                    <FormControl>
                      <FormLabel>Date</FormLabel>
                      <Input
                        type="date"
                        value={toInputDateFormat(formData.date || "")}
                        onChange={(e) => handleChange("date", e.target.value)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Amount of Irrigation</FormLabel>
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        value={formData.rate || ""}
                        onKeyDown={(e) => {
                          if (e.key === "-" || e.key === "e") {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^\d*\.?\d*$/.test(val)) {
                            handleChange("rate", val);
                          }
                        }}
                      />
                    </FormControl>
                  </>
                )}
                {/* FloodH: Pond Depth, Start Date, Start Time, End Date, End Time */}
                {console.log("Rendering FloodH/FloodR with formData:", formData)}
                {formData.irrType === "FloodH" && (
                  <>
                    <FormControl>
                      <FormLabel>Pond Depth (cm)</FormLabel>
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        value={formData.depth || ""}
                        onKeyDown={(e) => {
                          if (e.key === "-" || e.key === "e") {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^\d*\.?\d*$/.test(val)) {
                            handleChange("depth", val);
                          }
                        }}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Start Date</FormLabel>
                      <Input
                        type="date"
                        value={toInputDateFormat(formData.startDate ||  "")}
                        onChange={(e) => handleChange("startDate", e.target.value)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Start Time</FormLabel>
                      <Input
                        type="time"
                        value={formData.startH || ""}
                        onChange={(e) => handleChange("startH", e.target.value)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>End Date</FormLabel>
                      <Input
                        type="date"
                        value={toInputDateFormat(formData.endDate || "")}
                        onChange={(e) => handleChange("endDate", e.target.value)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>End Time</FormLabel>
                      <Input
                        type="time"
                        value={formData.stopH || ""}
                        onChange={(e) => handleChange("stopH", e.target.value)}
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
                        type="number"
                        min="0"
                        step="any"
                        value={formData.depth || ""}
                        onKeyDown={(e) => {
                          if (e.key === "-" || e.key === "e") {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^\d*\.?\d*$/.test(val)) {
                            handleChange("depth", val);
                          }
                        }}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Start Date</FormLabel>
                      <Input
                        type="date"
                        value={toInputDateFormat(formData.startDate || "")}
                        onChange={(e) => handleChange("startDate", e.target.value)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Start Time</FormLabel>
                      <Input
                        type="time"
                        value={formData.startH || ""}
                        onChange={(e) => handleChange("startH", e.target.value)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>End Date</FormLabel>
                      <Input
                        type="date"
                        value={toInputDateFormat(formData.endDate || "")}
                        onChange={(e) => handleChange("endDate", e.target.value)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>End Time</FormLabel>
                      <Input
                        type="time"
                        value={formData.stopH || ""}
                        onChange={(e) => handleChange("stopH", e.target.value)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Rate</FormLabel>
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        value={formData.rate || ""}
                        onKeyDown={(e) => {
                          if (e.key === "-" || e.key === "e") {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^\d*\.?\d*$/.test(val)) {
                            handleChange("rate", val);
                          }
                        }}
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
              {getOperationTypeLabel(key)}
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

function toInputDateFormat(dateStr: string) {
  // Converts "MM/DD/YYYY" to "YYYY-MM-DD"
  if (!dateStr || dateStr.includes("-")) return dateStr;
  const [month, day, year] = dateStr.split("/");
  if (month && day && year) {
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  return dateStr;
}
