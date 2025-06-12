import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
} from "@chakra-ui/react";
import {
  IrrigationClass,
  ManagementService,
  TDataDeleteOperation,
  TDataOperationForms,
} from "../../client";
import useCustomToast from "../../hooks/useCustomToast";

interface IrrigationFormProps {
  onSave: (data: any) => void;  
  irrigationTypeList: IrrigationClass[];
  selectedIrrigationType: string;
  operationId?: number | null;
}

const IrrigationForm: React.FC<IrrigationFormProps> = ({  
  irrigationTypeList,
  selectedIrrigationType,
  operationId,
  onSave,
}) => {
  const [irrigationOpt, setIrrigationOpt] = useState<string>(
    selectedIrrigationType
  );
  const [date, setDate] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const showToast = useCustomToast();

  const handleIrrigationClass = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setIrrigationOpt(value || selectedIrrigationType);
  };

  const handleSave = () => {
    if (date === "" || date === null) {
      showToast("Error", "Date field is empty!", "error");
      return;
    }else if (irrigationOpt === "" || irrigationOpt === null) {
      showToast("Error", "Irrigation Type field is empty!", "error");
      return;
    }else if (amount === "" || amount === null) {
      showToast("Error", "Amount of Irrigation field is empty!", "error");
      return;
    }
    const data = {
      irrigationOpt,
      amount,
      date,
    };

    onSave(data);
  };

  const handleDelete = async () => {
    const data: TDataDeleteOperation = {
      opID: operationId ? operationId : -10,
    };
    const response = await ManagementService.deleteOperation(data);
    if (response) {
      showToast(
        "Successfully",
        "The operation was deleted successfully.",
        "success"
      );
    } else {
      showToast("Failed!", "Failed to delete operation.", "error");
    }
  };

  const fetchOperationIrrigation = async (operationId: number) => {
    try {
      const opObj: TDataOperationForms = {
        opid: operationId !== null ? operationId : 0,
      };
      const sr_response =
        await ManagementService.getIrrigationByOperation(opObj);

      if (sr_response) {
        setIrrigationOpt(sr_response.irrigationClass);
        setAmount(sr_response.AmtIrrAppl.toString());
        setDate(new Date().toISOString().split("T")[0]); // Assuming you want the current date to be set
      }
    } catch (error) {
      console.error("Failed to fetch surface residue data", error);
    }
  };

  useEffect(() => {
    if (operationId) {
      fetchOperationIrrigation(operationId);
    } else {
      // Clear the form fields if operationId is not provided
      setIrrigationOpt(irrigationOpt);
      setAmount("");
      setDate("");
    }
  }, [operationId, selectedIrrigationType]);

  return (
    <Box p={4} borderWidth={1} borderRadius='lg' boxShadow='md'>
      <VStack spacing={4} align='stretch'>
        <Box>
          <FormControl>
            <FormLabel>Date</FormLabel>
            <Input
              type='date'
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </FormControl>
        </Box>

        <Box>
          <FormControl>
            <FormLabel>Irrigation Type</FormLabel>
            <Select
              placeholder='Select Irrigation Type'
              value={irrigationOpt}
              onChange={handleIrrigationClass}
            >
              {irrigationTypeList.map((res, index) => (
                <option
                  key={index}
                  value={typeof res === "string" ? res : res.irrigationClass}
                >
                  {typeof res === "string" ? res : res.irrigationClass}
                </option>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box>
          <FormControl>
            <FormLabel>Amount of Irrigation (mm/day)</FormLabel>
            <Input
              placeholder='Enter amount'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </FormControl>
        </Box>

        {/* <Box>
          <FormControl>
            <FormLabel>Irrigation Method</FormLabel>
            <Select placeholder='Select Irrigation Method'>
              
            </Select>
          </FormControl>
        </Box> */}

        {!operationId && (
          <Button colorScheme='teal' onClick={handleSave}>
            Save
          </Button>
        )}
        {operationId && (
          <>
            <Button colorScheme='teal' onClick={handleSave} mr={3}>
              Update
            </Button>
            <Button colorScheme='red' onClick={handleDelete}>
              Delete
            </Button>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default IrrigationForm;
