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
  FertilizerClass,
  ManagementService,
  TDataDeleteOperation,
  TDataOperationForms,
} from "../../client";
import useCustomToast from "../../hooks/useCustomToast";

interface FertilizerFormProps {
  fertilizationOpt: string;
  fertClass: FertilizerClass[];
  onSave: (data: any) => void;
  operationId?: number | null;
  fertilizerCalendar: Date;
  fertilizerDate: string;
}

const FertilizerForm: React.FC<FertilizerFormProps> = ({
  fertilizationOpt,
  fertClass,
  onSave,
  operationId,
  fertilizerCalendar,
  fertilizerDate,
}) => {
  const [fertClassOpt, setFertClassOpt] = useState<string>(fertilizationOpt);
  const [date, setDate] = useState<string>("");
  const [quantityC, setQuantityC] = useState<string>("");
  const [quantityN, setQuantityN] = useState<string>("");
  const [fertilizerDepth, setFertilizerDepth] = useState<string>("");
  const [showCarbon, setShowCarbon] = useState<boolean>(false);
  const [calendar, setCalendar] = useState<Date>();
  const showToast = useCustomToast();

  useEffect(() => {
    if (fertClassOpt === "Manure" || fertClassOpt === "Litter") {
      setShowCarbon(true);
    } else {
      setShowCarbon(false);
    }
  }, [fertClassOpt]);

  const handleFertClass = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFertClassOpt(value || fertilizationOpt);
  };

  const handleSave = () => {
    if (date === "" || date === null) {
      showToast("Error", "Date field is empty!", "error");
      return;
    }else if (fertilizerDepth === "" || fertilizerDepth === null) {
      showToast("Error", "Fertilizer Depth field is empty!", "error");
      return;
    }else if (quantityN === "" || quantityN === null) {
      showToast("Error", "Nitrogen (N) field is empty!", "error");
      return;
    }else if (showCarbon) {
      if (quantityC === "" || quantityC === null) {
      showToast("Error", "Carbon (C) field is empty!", "error");
      return;
      }
    }
    const data = {
      fertClassOpt,
      fertilizerDepth,
      date,
      quantityC: showCarbon ? quantityC : undefined,
      quantityN,
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

  const fetchOperationFertilization = async (operationId: number) => {
    try {
      const opObj: TDataOperationForms = {
        opid: operationId !== null ? operationId : 0,
      };
      const fertilization_response =
        await ManagementService.getFertilizationByOperation(opObj);

      if (fertilization_response) {
        console.log(fertilization_response);
        setFertClassOpt(
          fertilization_response.fertilization.fertilizationClass
        );
        setFertilizerDepth(fertilization_response.fertilization.depth || "");
        setQuantityN(
          fertilization_response.nutrients[0]?.nutrientQuantity?.toString() ||
            ""
        );
        console.log([fertilizerDate, fertilizerCalendar]);
        setDate(fertilizerDate);
        setCalendar(fertilizerCalendar);
        if (fertilization_response.nutrients.length > 1) {
          setQuantityC(
            fertilization_response.nutrients[1]?.nutrientQuantity?.toString() ||
              ""
          );
        }
      }
    } catch (error) {
      console.error("Failed to fetch fertilization data", error);
    }
  };

  useEffect(() => {
    console.log(operationId);
    if (operationId) {
      fetchOperationFertilization(operationId);
    } else {
      // Clear the form fields if operationId is not provided
      setFertClassOpt(fertilizationOpt);
      setFertilizerDepth("");
      setQuantityC("");
      setQuantityN("");
      setDate("");
    }
  }, [operationId, fertilizationOpt]);

  return (
    <Box p={4} borderWidth={1} borderRadius='lg' boxShadow='md'>
      <VStack spacing={4} align='stretch'>
        <FormControl>
          <FormLabel>Fertilizer Class</FormLabel>
          <Select
            placeholder='Select Fertilization'
            value={fertClassOpt}
            onChange={handleFertClass}
          >
            {fertClass.map((fert, index) => (
              <option
                key={index}
                value={
                  typeof fert === "string" ? fert : fert.fertilizationClass
                }
              >
                {typeof fert === "string" ? fert : fert.fertilizationClass}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Date</FormLabel>
          <Input
            type='date'
            value={
              calendar instanceof Date
                ? calendar.toISOString().split("T")[0]
                : date
            }
            onChange={(e) => {
              const newDate = e.target.value;
              setDate(newDate);
              setCalendar(new Date(newDate)); // Update the calendar state as well
            }}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Fertilizer Depth (cm)</FormLabel>
          <Input
            type='number'
            value={fertilizerDepth}
            onChange={(e) => setFertilizerDepth(e.target.value)}
          />
        </FormControl>

        {showCarbon && (
          <FormControl>
            <FormLabel>Carbon (C) (kg/ha)</FormLabel>
            <Input
              type='number'
              value={quantityC}
              onChange={(e) => setQuantityC(e.target.value)}
            />
          </FormControl>
        )}

        <FormControl>
          <FormLabel>Nitrogen (N) (kg/ha)</FormLabel>
          <Input
            type='number'
            value={quantityN}
            onChange={(e) => setQuantityN(e.target.value)}
          />
        </FormControl>
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

export default FertilizerForm;
