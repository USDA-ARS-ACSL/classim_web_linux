import React, { useState } from "react";
import { Box, Button, HStack, Input, Text } from "@chakra-ui/react";

interface NewTreatmentFormProps {
  formType: "NewTreatment" | "DeleteTreatment" | null;
  ccropName: string;
  cexperimentName: String;
  currentTreatmentName: String;
  onSave: (treatmentName: string) => void;  
  onDelete: () => void;
  onCancel: () => void;
  onCopyTo:(ccropName :String, currentTreatmentName: String, ctreatmentName:String, cexperimentName:String) =>void;
}

const TreatmentForm: React.FC<NewTreatmentFormProps> = ({
  formType,
  ccropName,
  cexperimentName,
  currentTreatmentName,
  onSave,
  onCopyTo,
  onDelete,
  onCancel,
}) => {
  const [treatmentName, setTreatmentName] = useState("");
  const [ctreatmentName, setCopyTreatmentName] = useState("");

  const handleSave = () => {
    onSave(treatmentName);
    setTreatmentName("");
  };

  // Handler function for copy to button click
  const handleCopyTo = () => {
    onCopyTo(ccropName, currentTreatmentName, ctreatmentName, cexperimentName);
  };

  //   const treatmentSummary = `Summary for ${ename}, ${cname}, ${tname}`;

  return (
    <Box p={4} borderWidth={1} borderRadius='lg' boxShadow='md'>
      {/* <VStack spacing={4} align='stretch'> */}
      {formType === "NewTreatment" && (
        <>
          <Text mb={4}>Enter New Treatment</Text>
          <Input
            value={treatmentName}
            onChange={(e) => setTreatmentName(e.target.value)}
            placeholder='Enter treatment name'
          />
          <HStack spacing={4} mt={4}>
            <Button mt={4} onClick={onCancel}>
              Cancel
            </Button>
            <Button mt={4} colorScheme='blue' onClick={handleSave}>
              Save
            </Button>
          </HStack>
        </>
      )}
      {formType === "DeleteTreatment" && (
        <>
          <Text fontSize='lg' fontWeight='bold' mb={2}>
            What do you want to do with treatment?
          </Text>
          <HStack spacing={2} mt={4}>
            <Button colorScheme='red' onClick={onDelete}>
              Delete
            </Button>
            <Button onClick={handleCopyTo}>Copy To</Button>
            <Input
              type='text'
              value={ctreatmentName}
              onChange={(e) => setCopyTreatmentName(e.target.value)}
              placeholder='Enter new treatment name'
            />
          </HStack>
        </>
      )}
      {/* </VStack> */}
    </Box>
  );
};

export default TreatmentForm;
