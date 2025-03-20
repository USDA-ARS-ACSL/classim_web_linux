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
  ManagementService,
  SurfResApplType,
  SurfResType,
  TDataDeleteOperation,
  TDataOperationForms,
} from "../../client";
import useCustomToast from "../../hooks/useCustomToast";

interface SurfResComponentProps {
  cropName: string;
  surfResApplTypeList: SurfResApplType[];
  surfResTypeList: SurfResType[];
  onSave: (data: any) => void;
  operationId?: number | null;
  selectedSurfRes: string;
}

const SurfaceResidueForm: React.FC<SurfResComponentProps> = ({
  cropName,
  surfResApplTypeList,
  surfResTypeList,
  onSave,
  operationId,
  selectedSurfRes,
}) => {
  console.log(cropName)
  const [surfResOpt, setSurfResOpt] = useState<string>(selectedSurfRes);
  const [surfResApplType, setSurfResApplType] = useState<string>("");
  const [surfResApplVal, setSurfResApplVal] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const showToast = useCustomToast();

  const handleSave = () => {
    if (date === "" || date === null) {
      showToast("Error", "Date field is empty!", "error");
      return;
    }else if (surfResOpt === "" || surfResOpt === null) {
      showToast("Error", "Surface Residue Type field is empty!", "error");
      return;
    }else if (surfResApplType === "" || surfResApplType === null) {
      showToast("Error", "Surface Residue Application Type field is empty!", "error");
      return;
    }else if (surfResApplVal === "" || surfResApplVal === null) {
      showToast("Error", "Surface Residue Application Value field is empty!", "error");
      return;
    }
    const data = {
      surfResOpt,
      surfResApplType,
      date,
      surfResApplVal,
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

  const handleSurfResType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSurfResOpt(value || selectedSurfRes);
  };
  const handleSurfResApplType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSurfResApplType(value);
  };

  const fetchOperationSR = async (operationId: number) => {
    try {
      const opObj: TDataOperationForms = {
        opid: operationId !== null ? operationId : 0,
      };
      const sr_response =
        await ManagementService.getSRByOperation(opObj);

      if (sr_response) {
        console.log(sr_response);
        setSurfResOpt(sr_response.residueType);
        setSurfResApplType(sr_response.applicationType);
        setSurfResApplVal(sr_response.applicationTypeValue.toString());
        setDate(new Date().toISOString().split("T")[0]); // Assuming you want the current date to be set        
      }
    } catch (error) {
      console.error("Failed to fetch surface residue data", error);
    }
  };

  useEffect(() => {
    console.log(operationId);
    if (operationId) {
      fetchOperationSR(operationId);
    } else {
      // Clear the form fields if operationId is not provided
      setSurfResOpt(surfResOpt);
      setSurfResApplType("");
      setSurfResApplVal("");      
      setDate("");
    }
  }, [operationId, selectedSurfRes]);

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
            <FormLabel>Surface Residue Type</FormLabel>
            <Select
              placeholder='Select Surface Residue Type'
              value={surfResOpt}
              onChange={handleSurfResType}
            >
              {surfResTypeList.map((sr, index) => (
                <option
                  key={index}
                  value={typeof sr === "string" ? sr : sr.residueType}
                >
                  {typeof sr === "string" ? sr : sr.residueType}
                </option>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box>
          <FormControl>
            <FormLabel>Surface Residue Application Type</FormLabel>
            <Select
              placeholder='Select Surface Residue Application Type'
              value={surfResApplType}
              onChange={handleSurfResApplType}
            >
              {surfResApplTypeList.map((sr, index) => (
                <option
                  key={index}
                  value={typeof sr === "string" ? sr : sr.applicationType}
                >
                  {typeof sr === "string" ? sr : sr.applicationType}
                </option>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box>
          <FormControl>
            <FormLabel>Surface Residue Application Value</FormLabel>
            <Input
              placeholder='Enter value'
              value={surfResApplVal}
              onChange={(e) => setSurfResApplVal(e.target.value)}
            />
          </FormControl>
        </Box>

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

export default SurfaceResidueForm;
