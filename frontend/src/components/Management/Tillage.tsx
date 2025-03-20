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
  // CultivarCropPublic,
  ManagementService,
  // TDataCropName,
  TDataOperationForms,
  TillageType,
} from "../../client";
// import useCustomToast from "../../hooks/useCustomToast";

interface TillageProps {
  cropName: string;
  onSave: (data: any) => void;
  operationId?: number | null;
  tillageList: TillageType[];
  tillageCalendar: Date;
  tillageDate: string;
}

const Tillage: React.FC<TillageProps> = ({
  cropName,
  onSave,
  operationId,
  tillageList,
  tillageCalendar,
  tillageDate,
}) => {
  const [tillage, setTillage] = useState<string>();
  const [calendar, setCalendar] = useState(new Date());
  const [date, setDate] = useState<string>("");
  const [dateVisible, setDateVisible] = useState<boolean>(false);

  // const showToast = useCustomToast();

  const handleTillage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setTillage(value);
    console.log(value);
    if (value == "No tillage") {
      setDateVisible(false);
    } else {
      setDateVisible(true);
    }
  };

  const fetchTillage = async (operationId: number) => {
    try {
      const opObj: TDataOperationForms = {
        opid: operationId !== null ? operationId : 0,
      };
      const tillage_response = await ManagementService.getTillage(opObj);

      if (tillage_response) {
        console.log(tillage_response);
        setDate(tillageDate);
        setCalendar(tillageCalendar);
        setTillage(tillage_response.tillage);
        if (tillage_response.tillage == "No tillage") {
          setDateVisible(false);
        } else {
          setDateVisible(true);
        }
      }
    } catch (error) {
      console.error("Failed to fetch surface residue data", error);
    }
  };

  const handleSave = () => {
    const data = {
      tillage,
      date,
    };

    onSave(data);
  };

  useEffect(() => {
    if (operationId) {
      fetchTillage(operationId);
    } else {
      setTillage("");
      setDate("");
      setCalendar(new Date());
    }
  }, [cropName]);
  return (
    <Box p={4} borderWidth={1} borderRadius='lg' boxShadow='md'>
      <VStack spacing={4} align='stretch'>
        {dateVisible && (
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
        )}
        <FormControl>
          <FormLabel>Tillage Type</FormLabel>
          <Select
            placeholder='Select Tillage'
            value={tillage}
            onChange={handleTillage}
          >
            {tillageList.map((till, index) => (
              <option
                key={index}
                value={typeof till === "string" ? till : till.tillage}
              >
                {typeof till === "string" ? till : till.tillage}
              </option>
            ))}
          </Select>
        </FormControl>

        {operationId && (
          <>
            <Button colorScheme='teal' onClick={handleSave} mr={3}>
              Update
            </Button>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default Tillage;
