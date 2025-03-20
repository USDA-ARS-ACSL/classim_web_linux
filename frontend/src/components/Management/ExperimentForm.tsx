import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  HStack,
  VStack,
} from "@chakra-ui/react";
// import { ManagementService, TDataCreateExperiment } from "../../client";
import useCustomToast from "../../hooks/useCustomToast";

interface ExperimentFormProps {
  formType: "NewExperiment" | "DeleteExperiment" | null;
  cropName: string;
  expName: string;
  onSave: (experimentName: string) => void;
  onDelete: () => void;
  onCancel: () => void;
}

const ExperimentForm: React.FC<ExperimentFormProps> = ({
  formType,
  // cropName,
  expName,
  onSave,
  onDelete,
  onCancel,
}) => {
  const [experimentName, setExperimentName] = useState("");

  const showToast = useCustomToast();

  const handleSave = async () => {
    if (experimentName === "" || experimentName === null) {
      showToast("Error", "Experiment name field is empty!", "error");
      return;
    }
    onSave(experimentName);
    setExperimentName("");
  };

  return (
    <Box p={4} borderWidth={1} borderRadius='lg' boxShadow='md'>
      <VStack spacing={4} align='stretch'>
        {formType === "NewExperiment" && (
          <>
            <Text mb={4}>
              EXPERIMENT Name represents a broader hierarchical dataset name,
              for example `Summer 2018`. Underneath it, one can define specific
              TREATMENT. Provide a unique experiment name and click SAVE. Once
              it is registered in the left panel, you can add new treatment(s).
            </Text>
            <FormControl isRequired>
              <FormLabel>Experiment Name</FormLabel>
              <Input
                value={experimentName}
                onChange={(e) => setExperimentName(e.target.value)}
                placeholder='Enter experiment name'
              />
            </FormControl>
            <Button mt={4} colorScheme='blue' onClick={handleSave}>
              Save
            </Button>
          </>
        )}
        {formType === "DeleteExperiment" && (
          <>
            <Text mb={4}>Do you want to delete the experiment?</Text>
            <FormControl isReadOnly>
              <FormLabel>Experiment Name</FormLabel>
              <Input value={expName} readOnly />
            </FormControl>
            <HStack spacing={4} mt={4}>
              <Button colorScheme='red' onClick={onDelete}>
                Yes
              </Button>
              <Button onClick={onCancel}>No</Button>
            </HStack>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default ExperimentForm;
