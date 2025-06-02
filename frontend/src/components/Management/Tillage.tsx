import React, { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  FormLabel,
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
// @ts-ignore
import CustomDatePicker from "../Common/CustomDatePicker";
// @ts-ignore
import { customFormatDate } from "../Utils/dateUtil";
interface TillageProps {
  cropName: string;
  onSave: (data: any) => void;
  operationId?: number | null;
  tillageList: TillageType[];
  tillageDate: string | null | undefined;
}

const Tillage: React.FC<TillageProps> = ({
  cropName,
  onSave,
  operationId,
  tillageList,
  tillageDate,
}) => {
  const [tillage, setTillage] = useState<string>();
  const [date, setDate] = useState<String | null>("");
  const [dateVisible, setDateVisible] = useState<boolean>(false);
  console.log('tillageDate', tillageDate)
  const handleDateChange = (newDate: String | null) => {
    if (newDate) {
      setDate(newDate);
    } else {
      setDate(null);
    }
  };
  // const showToast = useCustomToast();

  const handleTillage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setTillage(value);
    if (value == "No tillage") {
      setDateVisible(false);
      setDate(null);
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
      setDate(date || tillageDate?.toString() || null);
    } else {
      setTillage("");
      setDate(date|| tillageDate?.toString() || null);
    }
    if(!dateVisible)
        setDate('');
  }, [cropName, tillageDate, date, dateVisible]);
  return (
    <Box p={4} borderWidth={1} borderRadius='lg' boxShadow='md'>
      <VStack spacing={4} align='stretch'>
        {dateVisible && (
          <FormControl>
            <FormLabel>Date</FormLabel>
            <CustomDatePicker date={date} onDateChange={handleDateChange} />
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
