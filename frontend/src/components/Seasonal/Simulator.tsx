import React, { useState } from 'react';
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
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr
} from '@chakra-ui/react';
import { SiteService, SoilService } from '../../client';
import {  useQueries } from "@tanstack/react-query"

const Simulator: React.FC = () => {
  const [site, setSite] = useState<string>('');
  const [soil, setSoil] = useState<string>('');
  const [stationName, setStationName] = useState<string>('');
  const [weather, setWeather] = useState<string>('');
  const [crop, setCrop] = useState<string>('');
  const [experiment, setExperiment] = useState<string>('');
  const [startYear, setStartYear] = useState<string>('1934');
  const [endYear, setEndYear] = useState<string>('');
  const [waterStress, setWaterStress] = useState<string>('Yes');
  const [nitrogenStress, setNitrogenStress] = useState<string>('Yes');
  const [tempVariance, setTempVariance] = useState<number>(0);
  const [rainVariance, setRainVariance] = useState<number>(0);
  const [co2Variance, setCo2Variance] = useState<string>('None');
  const [outputInterval, setOutputInterval] = useState<string>('Hourly');
  console.log([stationName, crop, weather,experiment,waterStress,nitrogenStress,tempVariance,rainVariance,co2Variance])
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
  const isLoading = results.some(result => result.isLoading);
  const [sitesResult, soilsResult] = results;
  const sites = sitesResult.data;
  const soils = soilsResult.data;
  const handleRun = () => {
    console.log('Run Simulation');
  };

  const handleReset = () => {
    setSite('');
    setSoil('');
    setStationName('');
    setWeather('');
    setCrop('');
    setExperiment('');
    setStartYear('');
    setEndYear('');
    setWaterStress('Yes');
    setNitrogenStress('Yes');
    setTempVariance(0);
    setRainVariance(0);
    setCo2Variance('None');
    setOutputInterval('Hourly');
  };

  return (
    <Box p={5} bg="green.50" borderRadius="md" mt={10} overflowX="auto"  >
      <Heading size="md" mb={5}>Simulator</Heading>
      <Table variant="simple" width="max-content" overflow={'auto'}>
        <Thead bg="green.100">
          <Tr>
          <Th>Site </Th>
          <Th>Soil</Th>
          <Th>Station Name</Th>
          <Th>Weather</Th>
          <Th>Crop</Th>
          <Th>Experiment/Treatment</Th>
          <Th>Start Year</Th>
          <Th>End Year</Th>
          <Th>Water Stress</Th>
          <Th>Nitrogen Stress</Th>
          <Th>Temp Variance (°C)</Th>
          <Th>Rain Variance (%)</Th>
          <Th>CO2 Variance (ppm)</Th>
          </Tr>
        </Thead>
        <Tbody bg="green.200">
          <Tr>
            <Td>
              {isLoading ? (
              <Flex justify="center" align="center" height="100vh" width="full">
                <Spinner size="xl" color="ui.main" />
              </Flex>
            ) : (
              sites && (
                <Select placeholder="Select Site" value={site} onChange={(e) => setSite(e.target.value)}>
                  {sites.data.map((eachSite) => (
                    <option key={eachSite.id} value={eachSite.id}>{eachSite.sitename}</option>
                  ))}

                </Select>
              ))}
            </Td>
            <Td>
            {isLoading ? (
              <Flex justify="center" align="center" height="100vh" width="full">
                <Spinner size="xl" color="ui.main" />
              </Flex>
            ) : (
              soils && (
                <Select placeholder="Select Soil" value={soil} onChange={(e) => setSoil(e.target.value)}>
                  {soils.data.map((eachSoil) => (
                    <option key={eachSoil.id} value={eachSoil.id}>{eachSoil.soilname}</option>
                  ))}

                </Select>
              ))}
            </Td>
            <Td>
              <Select placeholder="Select from list" value={soil} onChange={(e) => setSoil(e.target.value)}>
                {/* Add options here */}
              </Select>
            </Td>
            <Td>
              <Select placeholder="Select from list" value={soil} onChange={(e) => setSoil(e.target.value)}>
                {/* Add options here */}
              </Select>
            </Td>
            <Td>
              <Select placeholder="Select from list" value={soil} onChange={(e) => setSoil(e.target.value)}>
                {/* Add options here */}
              </Select>
            </Td>
            <Td>
              <Select placeholder="Select from list" value={soil} onChange={(e) => setSoil(e.target.value)}>
                {/* Add options here */}
              </Select>
            </Td>
            <Td>
            <Input value={startYear} onChange={(e) => setStartYear(e.target.value)}/>
            </Td>
            <Td>
              <Input value={endYear} onChange={(e) => setEndYear(e.target.value)}/>
            </Td>
            <Td>
              <Select placeholder="Select from list" value={soil} onChange={(e) => setSoil(e.target.value)}>
                {/* Add options here */}
              </Select>
            </Td>
            <Td>
              <Select placeholder="Select from list" value={soil} onChange={(e) => setSoil(e.target.value)}>
                {/* Add options here */}
              </Select>
            </Td>
            <Td>
              <Select placeholder="Select from list" value={soil} onChange={(e) => setSoil(e.target.value)}>
                {/* Add options here */}
              </Select>
            </Td>
            <Td>
              <Select placeholder="Select from list" value={soil} onChange={(e) => setSoil(e.target.value)}>
                {/* Add options here */}
              </Select>
            </Td>
            <Td>
              <Select placeholder="Select from list" value={soil} onChange={(e) => setSoil(e.target.value)}>
                {/* Add options here */}
              </Select>
            </Td>
            {/* Add other table cells similarly with inputs */}
          </Tr>
        </Tbody>
      </Table>

      <FormControl mt={4}>
        <FormLabel>Simulation Output Interval:</FormLabel>
        <RadioGroup onChange={setOutputInterval} value={outputInterval}>
          <HStack spacing={5}>
            <Radio value="Hourly">Hourly</Radio>
            <Radio value="Daily">Daily</Radio>
          </HStack>
        </RadioGroup>
      </FormControl>

      <HStack spacing={4} mt={4}>
        <Button colorScheme="green" onClick={handleRun}>Run</Button>
        <Button variant="outline" colorScheme="green" onClick={handleReset}>Reset</Button>
      </HStack>
    </Box>
  );
};

export default Simulator;
