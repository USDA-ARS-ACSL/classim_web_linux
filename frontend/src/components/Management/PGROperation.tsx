import React, { useEffect, useState } from "react";
import {
  Box,
  FormLabel,
  Input,
  Select,
  Button,
  VStack,
} from "@chakra-ui/react";
import {
  ManagementService,
  PGRApplType,
  PGRChemical,
  PGRUnit,
  TDataDeleteOperation,
  TDataOperationForms,
} from "../../client";
import useCustomToast from "../../hooks/useCustomToast";

interface PGRProps {
  onSave: (operationData: any) => void;
  cropName: string;
  PGRList: PGRChemical[];
  selectedPGR: string;
  PGRAppTypeList: PGRApplType[];
  PGRUnit: PGRUnit[];
  operationId?: number | null;
}

const PGROperation: React.FC<PGRProps> = ({
  cropName,
  PGRList,
  selectedPGR,
  PGRAppTypeList,
  PGRUnit,
  onSave,
  operationId,
}) => {
  console.log(cropName);
  const [selectedPGROpt, setSelectedPGROpt] = useState<string>(selectedPGR);
  const [date, setDate] = useState<string>("");
  const [appType, setAppType] = useState<string>("");
  const [unit, setUnit] = useState<string>("");
  const [bandwidth, setBandwidth] = useState<string>("");
  const [rate, setRate] = useState<string>("");
  const showToast = useCustomToast();

  // State management for the visibility of the rows
  const [visibleRows] = useState({
    date: true,
    chemical: true,
    appType: true,
    bandwidth: true,
    appRate: true,
    appUnit: true,
  });

  // Handlers for form changes
  const handlePGRChemicalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedPGROpt(value || selectedPGROpt);
  };

  const handlePGRApplType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setAppType(value || appType);
  };

  const handlePGRUnit = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setUnit(value || unit);
  };

  const handleSave = () => {
    if (date === "" || date === null) {
      showToast("Error", "Date field is empty!", "error");
      return;
    }else if (selectedPGROpt === "" || selectedPGROpt === null) {
      showToast("Error", "PGR Chemical field is empty!", "error");
      return;
    }else if (appType === "" || appType === null) {
      showToast("Error", "PGR Application Type field is empty!", "error");
      return;
    }else if (bandwidth === "" || bandwidth === null) {
      showToast("Error", "PGR Application Bandwidth field is empty!", "error");
      return;
    }else if (rate === "" || rate === null) {
      showToast("Error", "PGR Application Rate field is empty!", "error");
      return;
    }else if (unit === "" || unit === null) {
      showToast("Error", "PGR Application Unit field is empty!", "error");
      return;
    }
    const data = {
      date,
      selectedPGROpt,
      appType,
      bandwidth,
      rate,
      unit,
    };
    console.log(data);
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

  const fetchOperationPGR = async (operationId: number) => {
    try {
      const opObj: TDataOperationForms = {
        opid: operationId !== null ? operationId : 0,
      };
      const pgr_response = await ManagementService.getPGRByOperation(opObj);

      if (pgr_response) {
        console.log(pgr_response);
        setSelectedPGROpt(pgr_response.PGRChemical);
        setAppType(pgr_response.applicationType);
        setUnit(pgr_response.PGRUnit);
        setBandwidth(pgr_response.bandwidth.toString());
        setRate(pgr_response.applicationRate.toString());
        setDate(new Date().toISOString().split("T")[0]);
      
      }
    } catch (error) {
      console.error("Failed to fetch PGR data", error);
    }
  };

  useEffect(() => {
    console.log(operationId);
    if (operationId) {
      fetchOperationPGR(operationId);
    } else {
      // Clear the form fields if operationId is not provided
      setSelectedPGROpt(selectedPGR);
      setAppType("");
      setUnit("");
      setBandwidth("");
      setRate("");
      setDate("");
    }
  }, [operationId, selectedPGR]);

  // JSX structure for the PGR Operation component
  return (
    <Box p={4} borderWidth={1} borderRadius='lg' boxShadow='md'>
      <VStack spacing={4} align='stretch'>
        {visibleRows.date && (
          <>
            <FormLabel>Date</FormLabel>
            <Input
              type='date'
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </>
        )}
        {visibleRows.chemical && (
          <>
            <FormLabel>PGR Chemical</FormLabel>
            <Select
              name='chemical'
              value={selectedPGROpt}
              onChange={handlePGRChemicalChange}
            >
              <option value=''>Select Plant Growth Regulator Chemical</option>
              {PGRList.map((pgr, index) => (
                <option
                  key={index}
                  value={typeof pgr === "string" ? pgr : pgr.PGRChemical}
                >
                  {typeof pgr === "string" ? pgr : pgr.PGRChemical}
                </option>
              ))}
            </Select>
          </>
        )}
        {visibleRows.appType && (
          <>
            <FormLabel>PGR Application Type</FormLabel>
            <Select name='appType' value={appType} onChange={handlePGRApplType}>
              {/* Populate with the application type options */}
              <option value=''>Select Application Type</option>
              {PGRAppTypeList.map((pgr, index) => (
                <option
                  key={index}
                  value={typeof pgr === "string" ? pgr : pgr.applicationType}
                >
                  {typeof pgr === "string" ? pgr : pgr.applicationType}
                </option>
              ))}
            </Select>
          </>
        )}
        {visibleRows.bandwidth && (
          <>
            <FormLabel>PGR Application Bandwidth</FormLabel>
            <Input
              name='bandwidth'
              value={bandwidth}
              onChange={(e) => setBandwidth(e.target.value)}
            />
          </>
        )}
        {visibleRows.appRate && (
          <>
            <FormLabel>PGR Application Rate</FormLabel>
            <Input
              name='appRate'
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
          </>
        )}
        {visibleRows.appUnit && (
          <>
            <FormLabel>PGR Application Unit</FormLabel>
            <Select name='appUnit' value={unit} onChange={handlePGRUnit}>
              {/* Populate with the application unit options */}
              <option value=''>Select Unit</option>
              {PGRUnit.map((pgr, index) => (
                <option
                  key={index}
                  value={typeof pgr === "string" ? pgr : pgr.PGRUnit}
                >
                  {typeof pgr === "string" ? pgr : pgr.PGRUnit}
                </option>
              ))}
            </Select>
          </>
        )}
        {!operationId && (
          <Button mt={4} colorScheme='teal' onClick={handleSave}>
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

export default PGROperation;
