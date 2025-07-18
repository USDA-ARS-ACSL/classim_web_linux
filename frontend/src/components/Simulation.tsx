import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Radio,
  RadioGroup,
  Select,
  SimpleGrid,
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  TableContainer,
  Progress,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Text,
  FormErrorMessage
} from '@chakra-ui/react';
import { DeleteIcon, AddIcon } from "@chakra-ui/icons";
import GraphComponent from "./GraphComponentmaize";
import { SiteService, SoilService, WeatherService, SeasonalRun } from '../client';
import { useQueries } from "@tanstack/react-query";
import { CROP_DATA } from '../constants';
import useCustomToast from '../hooks/useCustomToast';
import type { ExpOtData } from '../../src/client/models';

const Simulation: React.FC = () => {

  type Row = {
    crop: string;
    experiment: string;
    startDate: string;
    endDate: string;
    waterStress: string;
    nitrogenStress: string;
    tempVariance: string;
    rainVariance: string;
    co2Variance: string;
  };
  type Treatment = {
    t_experiment_name: string;
  };
  const [site, setSite] = useState<string>('');
  const [soil, setSoil] = useState<string>('');
  const [stationName, setStationName] = useState<string>('');
  const [weather, setWeather] = useState<string>('');
  const [stations, setStations] = useState<any>(null);
  const [weathers, setWeathers] = useState<any>(null);
  const [eTreatments, setETreatments] = useState<any>([]);
  const [treatmentData, setTreatmentData] = useState<{ [key: number]: ExpOtData }>({});

  const [isLoad, setIsLoad] = useState(false);
  const [expertSystem, setExpertSystem] = useState<boolean>(false); // State for Expert System checkbox
  const [selectedDate, setSelectedDate] = useState<string>(''); // State for selected date
  const [outputInterval, setOutputInterval] = useState<string>('Hourly');
  const [rows, setRows] = useState([{
    crop: '',
    experiment: '',
    startDate: '',
    endDate: '',
    waterStress: 'Yes',
    nitrogenStress: 'Yes',
    tempVariance: 0,
    rainVariance: 0,
    co2Variance: 'None',
  }]);

  const [progress, setProgress] = useState<number>(0);
  const [simulationID, setSimulationId] = useState<number>(0);
  const [showGraph, setShowGraph] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const showToast = useCustomToast();
  const results = useQueries({
    queries: [
      {
        queryKey: ["readSites"],
        queryFn: () => SiteService.readSites(),
      },
      {
        queryKey: ["readSoils"],
        queryFn: () => SoilService.readSoils(),
      },
    ],
  });
  const [sitesResult, soilsResult] = results;
  const sites = sitesResult?.data;
  const soils = soilsResult?.data;
  const crops = CROP_DATA.map(c => c.value);
  // const [chartData, setChartData] = useState<any[]>([]); // State for chart data
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({}); // State for field-specific errors

  const validateFields = (): boolean => {
    const errors: Record<string, string> = {};

    if (!site) errors.site = "Site is mandatory.";
    if (!soil) errors.soil = "Soil is mandatory.";
    if (!stationName) errors.stationName = "Station Name is mandatory.";
    if (!weather) errors.weather = "Weather is mandatory.";
    rows.forEach((row, index) => {
      if (!row.crop) errors[`row-${index}-crop`] = "Crop is mandatory.";
      if (!row.experiment) errors[`row-${index}-experiment`] = "Experiment is mandatory.";
      if (!row.startDate) errors[`row-${index}-startDate`] = "Start Date is mandatory.";
      if (!row.endDate) errors[`row-${index}-endDate`] = "End Date is mandatory.";
      if (!row.waterStress) errors[`row-${index}-waterStress`] = "Water Stress is mandatory.";
      if (!row.nitrogenStress) errors[`row-${index}-nitrogenStress`] = "Nitrogen Stress is mandatory.";
      if (!row.co2Variance) errors[`row-${index}-co2Variance`] = "CO2 Variance is mandatory.";
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFieldChange = (field: string, value: string) => {
    setFieldErrors((prevErrors) => {
      console.log(value)
      const updatedErrors = { ...prevErrors };
      delete updatedErrors[field]; // Remove the error for the field when data is selected
      return updatedErrors;
    });
  };

  const handleRun = async () => {
    if (!validateFields()) {
      showToast("Error!", "Please fill all mandatory fields.", "error");
      return;
    }

    try {
      setIsLoad(true); // Start loading
      setProgress(0); // Reset progress

      // Prepare data for the SeasonalRun
      const data = {
        id: 1234243,
        expertSystem, // Include expertSystem in the payload
        selectedDate: expertSystem ? selectedDate : null, // Include selectedDate if Expert System is enabled
      };

      // Wait for the response from SeasonalRun
      const response = await SeasonalRun.RunSeasonalSim(data);

      if (response) {
        if (response.id === -1) {
          showToast("Error!", response.message, "error");
          return;
        }
        setSimulationId(response.id);
        showToast("Success", "Simulation Started", "success");
        setShowGraph(true);
        setIsDrawerOpen(true);
      }
    } catch (error) {
      showToast("Error!", "Failed to download data", "error");
    } finally {
      setIsLoad(false); // End loading
    }
  };


  const handleSiteChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSite = event.target.value;
    setSite(selectedSite);
    setStationName(""); // Clear station name
    setStations('');
    setWeathers('');
    if (selectedSite) {
      try {
        const station_response = await WeatherService.fetchWeatherdata({ site: selectedSite });
        setStations(station_response);
      } catch (error) {
        console.error("Failed to fetch weather data:", error);
      }
    }
  };

  const handleStationChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    setStationName(event.target.value);
    setWeathers(event.target.value);
  };

  const handleCropChange = async (index: number, event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCrop = event.target.value;

    // Create a copy of the rows to update the specific row
    const updatedRows = [...rows];
    updatedRows[index].crop = selectedCrop;
    if (selectedCrop) {
      try {
        const t_experiments: Treatment[] = await WeatherService.getTreatmentsByCrop({ crop: selectedCrop });
        const updatedETreatments = [...eTreatments];
        updatedETreatments[index] = t_experiments;
        setETreatments(updatedETreatments);
        updatedRows[index].experiment = t_experiments[0]?.t_experiment_name || '';
        updatedETreatments[index].site = site;
        updatedETreatments[index].soil = soil;
        updatedETreatments[index].station = stationName;
        updatedETreatments[index].weather = weather;
        setRows(updatedRows);
      } catch (error) {
        console.error("Failed to fetch weather data:", error);
      }
    }
  };

  const handleTreatmentChange = async (index: number, event: React.ChangeEvent<HTMLSelectElement>) => {

    const expTreatment = event.target.value;
    if (expTreatment) {
      try {
        const allData: ExpOtData = await WeatherService.getDatesByExpTreatment({ expTreatment: expTreatment }) || {

          co2_variance: {
            options: [],
            default: '',
          },
          temperature_variance: {
            options: [],
            default: '',
          },
          rain_variance: {
            options: [],
            default: '',
          },
          end_year: '',
          start_year: '',
        };
        setTreatmentData((prevData) => ({
          ...prevData,
          [index]: {
            co2_variance: allData.co2_variance,
            temperature_variance: allData.temperature_variance,
            rain_variance: allData.rain_variance,
            end_year: allData.end_year,
            start_year: allData.start_year
          },
        }));
        handleexpChange(index, 'experiment', event.target.value, allData.start_year, allData.end_year)
        // console.log(treatmentData[0]['co2_variance']['options'])
      } catch (error) {
        console.error("Failed to fetch weather data:", error);
      }
    }
  };
  const handleReset = () => {
    setSite('');
    setSoil('');
    setStationName('');
    setWeather('');
    setStations('');
    setSelectedDate(''); // Reset selected date
    setExpertSystem(false); // Reset Expert System checkbox
    setRows([{
      crop: '',
      experiment: '',
      startDate: '',
      endDate: '',
      waterStress: 'Yes',
      nitrogenStress: 'Yes',
      tempVariance: 0,
      rainVariance: 0,
      co2Variance: 'None'
    }]);
    setOutputInterval('Hourly');
  };

  const handleAddRow = () => {
    setRows([...rows, {
      crop: '',
      experiment: '',
      startDate: '',
      endDate: '',
      waterStress: 'Yes',
      nitrogenStress: 'Yes',
      tempVariance: 0,
      rainVariance: 0,
      co2Variance: 'None',
    }]);
  };

  const handleRemoveRow = (index: number) => {
    if (rows.length > 1) {
      setRows(rows.filter((_, i) => i !== index));
    } else {
      showToast("Error!", "Not Allowed", "error");
    }
  };

  const handleexpChange = <K extends keyof Row>(index: number, field: K, value: Row[K], start_year: string, end_year: string) => {
    setRows(prevRows => {
      const updatedRows = [...prevRows];
      updatedRows[index]['startDate'] = start_year;
      updatedRows[index]['endDate'] = end_year;
      updatedRows[index] = {
        ...updatedRows[index],
        [field]: value
      };
      return updatedRows;
    });
  };
  const handleRowChange = <K extends keyof Row>(index: number, field: K, value: Row[K]) => {
    setRows(prevRows => {
      const updatedRows = [...prevRows];
      updatedRows[index]['startDate'] = treatmentData[index]['start_year'];
      updatedRows[index]['endDate'] = treatmentData[index]['end_year'];
      updatedRows[index] = {
        ...updatedRows[index],
        [field]: value
      };
      return updatedRows;
    });
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };
  const handleChangeSelectedDate = (date: string) => {
    setSelectedDate(date);
  };

  useEffect(() => {
    const data = { site: site, weather: weather, soil:soil, station:stationName, expertSystem:expertSystem, selectedDate:selectedDate, rows: rows };
    localStorage.setItem('SimulationInput', JSON.stringify(data));

  }, [rows, treatmentData, site, soil, stationName, weather, expertSystem, selectedDate, outputInterval]);

  return (

    <Box p={5} border='Highlight' borderRadius="md" mt={10} overflowX="auto">
      <Heading size="md" mb={5}>Simulator</Heading>

      <SimpleGrid columns={2} spacing={2} pb={10} alignItems="center">
        <FormControl isInvalid={!!fieldErrors.site}>
          <FormLabel>
            Site <Text as="span" color="red.500">*</Text>
          </FormLabel>
          {
            sites && (
              <Select placeholder="Select from list" value={site} id="dropdown" onChange={(e) => {
                handleSiteChange(e);
                handleFieldChange("site", e.target.value);
              }}>
                {sites.data.map((eachSite) => (
                  <option key={eachSite.sitename} value={eachSite.sitename}>{eachSite.sitename}</option>
                ))}
              </Select>
            )
          }
          <FormErrorMessage>{fieldErrors.site}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!fieldErrors.soil}>
          <FormLabel>
            Soil <Text as="span" color="red.500">*</Text>
          </FormLabel>
          {
            soils && (
              <Select placeholder="Select from list" value={soil} id="dropdown" onChange={(e) => {
                setSoil(e.target.value);
                handleFieldChange("soil", e.target.value);
              }}>
                {soils.data.map((eachSoil) => (
                  <option key={eachSoil.soilname} value={eachSoil.soilname}>{eachSoil.soilname}</option>
                ))}
              </Select>
            )
          }
          <FormErrorMessage>{fieldErrors.soil}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!fieldErrors.stationName}>
          <FormLabel>
            Station Name <Text as="span" color="red.500">*</Text>
          </FormLabel>
          <Select
            placeholder="Select Station"
            value={stationName}
            onChange={(e) => {
              handleStationChange(e);
              handleFieldChange("stationName", e.target.value);
            }}
          >
            {stations && stations.data.map((stat: { stationtype: string | number }) => (
              <option key={stat.stationtype} value={stat.stationtype}>
                {stat.stationtype}
              </option>
            ))}
          </Select>
          <FormErrorMessage>{fieldErrors.stationName}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!fieldErrors.weather}>
          <FormLabel>
            Weather <Text as="span" color="red.500">*</Text>
          </FormLabel>
          <Select placeholder="Select Type" value={weather} onChange={(e) => {
            setWeather(e.target.value);
            handleFieldChange("weather", e.target.value);
          }}>
            {
              weathers && (
                <option key={weathers} value={weathers}>{weathers}</option>
              )
            }
          </Select>
          <FormErrorMessage>{fieldErrors.weather}</FormErrorMessage>
        </FormControl>
      </SimpleGrid>
      <TableContainer overflowX='auto' whiteSpace='nowrap' >
        <Table variant="simple" width="max-content">
          <Thead padding={'5px'}>
            <Tr>
              <Th>CROP</Th>
              <Th>EXPERIMENT/ TREATMENT</Th>
              <Th>START DATE</Th>
              <Th>END DATE</Th>
              <Th>WATER STRESS</Th>
              <Th>NITROGEN STRESS</Th>
              <Th>TEMP VARIANCE (°C)</Th>
              <Th>RAIN VARIANCE (%)</Th>
              <Th>CO2 VARIANCE (PPM)</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rows.map((row, index) => (
              <Tr key={index}>
                <Td>
                  <FormControl isInvalid={!!fieldErrors[`row-${index}-crop`]}>
                    <Select placeholder="Select Crop" value={row.crop} onChange={(e) => { handleCropChange(index, e); handleFieldChange(`row-${index}-crop`, e.target.value); }}>
                      {crops && crops.map((cropValue) => (
                        <option key={cropValue} value={cropValue}>{cropValue}</option>
                      ))}
                    </Select>
                    <FormErrorMessage>{fieldErrors[`row-${index}-crop`]}</FormErrorMessage>
                  </FormControl>
                </Td>
                <Td>
                  <FormControl isInvalid={!!fieldErrors[`row-${index}-experiment`]}>
                    <Select placeholder="Select from list" onChange={(e) => { handleTreatmentChange(index, e); handleFieldChange(`row-${index}-experiment`, e.target.value); }}>
                      {eTreatments[index] && eTreatments[index]?.map((eTreatment: any) => (
                        <option key={eTreatment['t_experiment_name']} value={eTreatment['t_experiment_name']}>{eTreatment['t_experiment_name']}</option>
                      ))}
                    </Select>
                    <FormErrorMessage>{fieldErrors[`row-${index}-experiment`]}</FormErrorMessage>
                  </FormControl>
                </Td>
                <Td>
                  <FormControl isInvalid={!!fieldErrors[`row-${index}-startDate`]}>
                    <Input type="number" value={row.startDate || treatmentData[index]?.start_year || ''} onChange={(e) => handleRowChange(index, 'startDate', e.target.value)} />
                    <FormErrorMessage>{fieldErrors[`row-${index}-startDate`]}</FormErrorMessage>
                  </FormControl>
                </Td>
                <Td>
                  <FormControl isInvalid={!!fieldErrors[`row-${index}-endDate`]}>
                    <Input type="number" value={row.endDate || treatmentData[index]?.end_year || ''} onChange={(e) => handleRowChange(index, 'endDate', e.target.value)} />
                    <FormErrorMessage>{fieldErrors[`row-${index}-endDate`]}</FormErrorMessage>
                  </FormControl>
                </Td>
                <Td>
                  <FormControl isInvalid={!!fieldErrors[`row-${index}-waterStress`]}>
                    <Select placeholder="Select from list" value={row.waterStress} onChange={(e) => handleRowChange(index, 'waterStress', e.target.value)}>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </Select>
                    <FormErrorMessage>{fieldErrors[`row-${index}-waterStress`]}</FormErrorMessage>
                  </FormControl>
                </Td>
                <Td>
                  <FormControl isInvalid={!!fieldErrors[`row-${index}-nitrogenStress`]}>
                    <Select placeholder="Select from list" value={row.nitrogenStress} onChange={(e) => handleRowChange(index, 'nitrogenStress', e.target.value)}>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </Select>
                    <FormErrorMessage>{fieldErrors[`row-${index}-nitrogenStress`]}</FormErrorMessage>
                  </FormControl>
                </Td>
                <Td>
                  <FormControl isInvalid={!!fieldErrors[`row-${index}-tempVariance`]}>
                    <Select placeholder="Select from list" value={row.tempVariance} onChange={(e) => handleRowChange(index, 'tempVariance', e.target.value)}>
                      {treatmentData[index] && treatmentData[index]['temperature_variance']['options']?.map((tempVariance: string) => (
                        <option key={tempVariance} value={tempVariance}>{tempVariance}</option>
                      ))}
                    </Select>
                    <FormErrorMessage>{fieldErrors[`row-${index}-tempVariance`]}</FormErrorMessage>
                  </FormControl>
                </Td>
                <Td>
                  <FormControl isInvalid={!!fieldErrors[`row-${index}-rainVariance`]}>
                    <Select placeholder="Select from list" value={row.rainVariance} onChange={(e) => handleRowChange(index, 'rainVariance', e.target.value)}>
                      {treatmentData[index] && treatmentData[index]['rain_variance']['options']?.map((rainVariance: string) => (
                        <option key={rainVariance} value={rainVariance}>{rainVariance}</option>
                      ))}
                    </Select>
                    <FormErrorMessage>{fieldErrors[`row-${index}-rainVariance`]}</FormErrorMessage>
                  </FormControl>
                </Td>
                <Td>
                  <FormControl isInvalid={!!fieldErrors[`row-${index}-co2Variance`]}>
                    <HStack spacing={4}>
                      <Select placeholder="Select from list" value={row.co2Variance} onChange={(e) => handleRowChange(index, 'co2Variance', e.target.value)}>
                        {treatmentData[index] && treatmentData[index]['co2_variance']?.['options']?.map((treatmentDat: string) => (
                          <option key={treatmentDat} value={treatmentDat}>{treatmentDat}</option>
                        ))}
                      </Select>
                      <DeleteIcon color={'red'} name="warning" onClick={() => handleRemoveRow(index)} />
                    </HStack>
                    <FormErrorMessage>{fieldErrors[`row-${index}-co2Variance`]}</FormErrorMessage>
                  </FormControl>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      <Button mt={4} colorScheme="blue" onClick={handleAddRow}><AddIcon /></Button>
      {
        isLoad && (<Box mb={4}>
          <Progress
            value={progress}
            size="lg"
            colorScheme="teal"
          />
        </Box>)
      }
      {/* Additional inputs */}
      <SimpleGrid columns={2} spacing={2} py={5} alignItems="center">
        <FormControl>
          <FormLabel>Expert System</FormLabel>
          <HStack>
        <input
          type="checkbox"
          checked={expertSystem}
          onChange={(e) => {
            setExpertSystem(e.target.checked);
            if (!e.target.checked) {
          setSelectedDate(''); // Reset the selected date if unchecked
            }
          }}
        />
        <Text>Enable Expert System</Text>
          </HStack>
        </FormControl>
        {expertSystem && (
            <FormControl>
          <FormLabel>Select Date</FormLabel>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => handleChangeSelectedDate(e.target.value)}
          />
            </FormControl>
        )}
      </SimpleGrid>
      <SimpleGrid columns={2} spacing={2} py={5} alignItems="center">
        <FormControl>
          <FormLabel>Output Interval</FormLabel>
          <RadioGroup onChange={setOutputInterval} value={outputInterval}>
            <HStack spacing={1}>
              <Radio value="Hourly">Hourly</Radio>
              <Radio value="Daily">Daily</Radio>
            </HStack>
          </RadioGroup>
        </FormControl>
      </SimpleGrid>

      {/* Action buttons */}
      <Flex justifyContent="space-between">

        <HStack spacing={5}>
          <Button colorScheme="blue" onClick={handleRun}
            isLoading={isLoad} // Show loading spinner on button
            isDisabled={isLoad} // Disable button while loading
          >

            {isLoad ? <Spinner size='xl' color='ui.main' /> : "Run"}
          </Button>
          <Button colorScheme="red" onClick={handleReset}>Reset</Button>
        </HStack>
      </Flex>
      <Drawer
        isOpen={isDrawerOpen}
        placement="right"
        onClose={closeDrawer}
        size="full"
        closeOnOverlayClick={false} // Prevent closing on overlay click
        closeOnEsc={false} // Prevent closing on Esc key
      >
        <DrawerOverlay />
        <DrawerContent maxWidth="500px" height="100vh">
          <DrawerCloseButton />
          <DrawerHeader>Simulation Results</DrawerHeader>

          <DrawerBody>
            {showGraph && <GraphComponent simulationID={simulationID} />}
          </DrawerBody>

          <DrawerFooter>
            
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Box>
  );
  
};

export default Simulation;