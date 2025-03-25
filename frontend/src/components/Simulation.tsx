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
 
  Progress
} from '@chakra-ui/react';
import { DeleteIcon, AddIcon } from "@chakra-ui/icons";
import GraphComponent from "./GraphComponent";
import { SiteService, SoilService, WeatherService, SeasonalRun } from '../client';
import { useQueries } from "@tanstack/react-query";
import { CROP_DATA } from '../constants';
import useCustomToast from '../hooks/useCustomToast';
import type { ExpOtData } from '../../src/client/models';

const Simulation: React.FC = () => {

  type Row = {
    site: string,
    soil: string,
    station: string,
    weather: string,
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
  const [rows, setRows] = useState([{
    site: site,
    soil: soil,
    station: stationName,
    weather: weather,
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

  const [outputInterval, setOutputInterval] = useState<string>('Hourly');
  const [progress, setProgress] = useState<number>(0);
  const [simulationID, setSimulationId] = useState<number>(0);
  const [showGraph, setShowGraph] = useState(false);
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
  // const isLoading = results.some(result => result.isLoading);
  const [sitesResult, soilsResult] = results;
  const sites = sitesResult?.data;
  const soils = soilsResult?.data;
  const crops = CROP_DATA.map(c => c.value);
  // const [chartData, setChartData] = useState<any[]>([]); // State for chart data
  const handleRun = async () => {
    try {
      setIsLoad(true); // Start loading
      setProgress(0); // Reset progress


      // Prepare data for the SeasonalRun
      let data = { id: 1234243 };

      // Wait for the response from SeasonalRun
      const response = await SeasonalRun.RunSeasonalSim(data);

      if (response) {
        setSimulationId(response.id);
        console.log(simulationID)
        showToast("Success", "Simulation Started", "success");
        setShowGraph(true);
        // Handle response if needed (e.g., showing a success message)
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
    setRows([{
      site: site,
      soil: soil,
      station: stationName,
      weather: weather,
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
    setOutputInterval('Hourly');
  };

  const handleAddRow = () => {
    setRows([...rows, {
      site: '',
      soil: '',
      station: '',
      weather: '',
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
        [field]: value,
        ['site']: site,
        ['soil']: soil,
        ['station']: stationName,
        ['weather']: weather
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
        [field]: value,
        ['site']: site,
        ['soil']: soil,
        ['station']: stationName,
        ['weather']: weather
      };
      return updatedRows;
    });
  };

  useEffect(() => {

    localStorage.setItem('SimulationInput', JSON.stringify(rows));

  }, [rows, treatmentData]);

  return (

    <Box p={5} border='Highlight' borderRadius="md" mt={10} overflowX="auto">
      <Heading size="md" mb={5}>Simulator</Heading>
      <SimpleGrid columns={2} spacing={2} pb={10} alignItems="center">
        <FormControl>
          <FormLabel>Site</FormLabel>
          {
            sites && (
              <Select placeholder="Select from list" value={site} id="dropdown" onChange={handleSiteChange}>
                {sites.data.map((eachSite) => (
                  <option key={eachSite.sitename} value={eachSite.sitename}>{eachSite.sitename}</option>
                ))}
              </Select>
            )
          }
        </FormControl>

        <FormControl>
          <FormLabel>Soil</FormLabel>
          {
            soils && (
              <Select placeholder="Select from list" value={soil} id="dropdown" onChange={(e) => setSoil(e.target.value)}>
                {soils.data.map((eachSoil) => (
                  <option key={eachSoil.soilname} value={eachSoil.soilname}>{eachSoil.soilname}</option>
                ))}
              </Select>
            )
          }
        </FormControl>

        <FormControl>
          <FormLabel>Station Name</FormLabel>
          <Select
            placeholder="Select Station"
            value={stationName}
            onChange={handleStationChange}
          >
            {stations && stations.data.map((stat: { stationtype: string | number }) => (
              <option key={stat.stationtype} value={stat.stationtype}>
                {stat.stationtype}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Weather</FormLabel>
          <Select placeholder="Select Type" value={weather} onChange={(e) => setWeather(e.target.value)}>
            {
              weathers && (
                <option key={weathers} value={weathers}>{weathers}</option>
              )
            }
          </Select>
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
                  <Select placeholder="Select Crop" value={row.crop} onChange={(e) => { handleCropChange(index, e); }}>
                    {crops && crops.map((cropValue) => (
                      <option key={cropValue} value={cropValue}>{cropValue}</option>
                    ))}
                  </Select>
                </Td>
                <Td>
                  <Select placeholder="Select from list" onChange={(e) => { handleTreatmentChange(index, e); }}>
                    {eTreatments[index] && eTreatments[index]?.map((eTreatment: any) => (
                      <option key={eTreatment['t_experiment_name']} value={eTreatment['t_experiment_name']}>{eTreatment['t_experiment_name']}</option>
                    ))}
                  </Select>
                </Td>
                <Td>
                  <Input type="number" value={row.startDate || treatmentData[index]?.start_year || ''} onChange={(e) => handleRowChange(index, 'startDate', e.target.value)} />
                </Td>
                <Td>
                  <Input type="number" value={row.endDate || treatmentData[index]?.end_year || ''} onChange={(e) => handleRowChange(index, 'endDate', e.target.value)} />
                </Td>
                <Td>
                  <Select placeholder="Select from list" value={row.waterStress} onChange={(e) => handleRowChange(index, 'waterStress', e.target.value)}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </Select>
                </Td>
                <Td>
                  <Select placeholder="Select from list" value={row.nitrogenStress} onChange={(e) => handleRowChange(index, 'nitrogenStress', e.target.value)}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </Select>
                </Td>
                <Td>
                  <Select placeholder="Select from list" value={row.tempVariance} onChange={(e) => handleRowChange(index, 'tempVariance', e.target.value)}>
                    {treatmentData[index] && treatmentData[index]['temperature_variance']['options']?.map((tempVariance: string) => (
                      <option key={tempVariance} value={tempVariance}>{tempVariance}</option>
                    ))}
                  </Select>
                </Td>
                <Td>
                  <Select placeholder="Select from list" value={row.rainVariance} onChange={(e) => handleRowChange(index, 'rainVariance', e.target.value)}>
                    {treatmentData[index] && treatmentData[index]['rain_variance']['options']?.map((rainVariance: string) => (
                      <option key={rainVariance} value={rainVariance}>{rainVariance}</option>
                    ))}
                  </Select>
                </Td>
                <Td>
                  <HStack spacing={4}>
                    <Select placeholder="Select from list" value={row.co2Variance} onChange={(e) => handleRowChange(index, 'co2Variance', e.target.value)}>
                      {treatmentData[index] && treatmentData[index]['co2_variance']?.['options']?.map((treatmentDat: string) => (
                        <option key={treatmentDat} value={treatmentDat}>{treatmentDat}</option>
                      ))}
                    </Select>
                    <DeleteIcon color={'red'} name="warning" onClick={() => handleRemoveRow(index)} />
                  </HStack>
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
      <SimpleGrid columns={2} spacing={2} py={10} alignItems="center">
        <FormControl>
          <FormLabel>Output Interval</FormLabel>
          <RadioGroup onChange={setOutputInterval} value={outputInterval}>
            <HStack spacing={5}>
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
      {showGraph && <GraphComponent simulationID={simulationID} />}
    </Box>
  );
  
};

export default Simulation;