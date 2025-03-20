import React, { useState } from "react";
import {
  Box,
  Container,
  Link,
  Checkbox,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
  Text,
  Tabs,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  FormLabel,
} from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { SimulationApiResponse } from "../../client/models";
import { SimulationService, ApiError } from "../../client"; // Adjust path as needed
import FaqComponent from "../../components/Faqs/FaqComponent";
import NextPreviousButtons from "../../components/Common/NextPreviousButtons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useCustomToast from "../../hooks/useCustomToast";

const SeasonalOutput: React.FC = () => {
  const queryClient = useQueryClient();
  const showToast = useCustomToast();
  const { data: response, isLoading, error } = useQuery<SimulationApiResponse>({
    queryKey: ["readSimulations"],
    queryFn: SimulationService.readSimulations,
  });

  const simulations = response?.data || [];
  const [selectedSimulations, setSelectedSimulations] = useState<number[]>([]);
  const [simulationOutputs, setSimulationOutputs] = useState<Record<number, { Yield: any; Nitrogen: any; Total_biomass: any }>>({});

  const handleCheckboxChange = (simulationId: number): void => {
    if (selectedSimulations.length >= 4 && !selectedSimulations.includes(simulationId)) {
      showToast("You can only select up to 4 simulations.", "", "error");
      return; // Do not allow more selections
    }
    setSelectedSimulations((prevState) =>
      prevState.includes(simulationId)
        ? prevState.filter((id) => id !== simulationId)
        : [...prevState, simulationId]
    );
    fetchMutation.mutate(simulationId);
  };

  const fetchMutation = useMutation({
    mutationFn: (simulationId: number) =>
      SimulationService.readOutputdata({ id: simulationId }),
    onSuccess: (data, simulationId) => {
      setSimulationOutputs((prev) => ({
        ...prev,
        [simulationId]: {
          Yield: data.Yield,
          Nitrogen: data.Nitrogen_Uptake,
          Total_biomass: data.Total_biomass,
        },
      }));
      showToast("Success!", "", "success");
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail;
      showToast("Something went wrong.", `${errDetail}`, "error");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });

  // Handle loading state
  if (isLoading) {
    return <Text>Loading simulations...</Text>;
  }

  // Handle error state
  if (error) {
    return <Text>Error fetching simulations. Please try again later.</Text>;
  }

  // Handle if simulations data is undefined or empty
  if (!simulations || simulations.length === 0) {
    return <Text>No simulations found.</Text>;
  }

  return (
    <Container maxW="full" mt={[4, 5]} width={"80%"}>
      <VStack spacing={4} align="stretch">
        <Text>
          Choose simulation by checking from the list box. Simulation outputs
          are categorized into 5 types and are displayed individually in bottom
          tabbed panel.
        </Text>
        <Link
          isExternal
          color="blue"
          href="https://www.ars.usda.gov/northeast-area/beltsville-md-barc/beltsville-agricultural-research-center/adaptive-cropping-systems-laboratory/"
        >
          Click here to watch the Seasonal RunTab Video Tutorial
        </Link>

        {/* Simulation Selection Table */}
        <Box maxW="100%" overflowX="auto" maxHeight="350px" whiteSpace="nowrap">
          <Box maxHeight="400px" overflowY="auto">
            <Table variant="simple" minWidth="1000px" size="sm">
              <Thead>
                <Tr>
                  <Th></Th>
                  <Th>id</Th>
                  <Th>Site</Th>
                  <Th>Soil</Th>
                  <Th>Station Name</Th>
                  <Th>Weather</Th>
                  <Th>Crop/Experiment/Treatment</Th>
                  <Th>Start Year</Th>
                  <Th>End Year</Th>
                  <Th>Water Stress</Th>
                  <Th>Nitrogen Stress</Th>
                  <Th>Temp Variance (°C)</Th>
                  <Th>Rain Variance (%)</Th>
                  <Th>CO2 Variance (ppm)</Th>
                </Tr>
              </Thead>
              <Tbody>
                {simulations.map((sim) => (
                  <Tr key={sim.id}>
                    <Td>
                      <Checkbox
                        isChecked={selectedSimulations.includes(sim.id)}
                        onChange={() => handleCheckboxChange(sim.id)}
                      />
                    </Td>
                    <Td>{sim.id}</Td>
                    <Td>{sim.site}</Td>
                    <Td>{sim.soil}</Td>
                    <Td>{sim.stationtype}</Td>
                    <Td>{sim.weather}</Td>
                    <Td>{sim.treatment}</Td>
                    <Td>{sim.startyear}</Td>
                    <Td>{sim.endyear}</Td>
                    <Td>{sim.waterstress == 0 ? "No" : sim.waterstress}</Td>
                    <Td>{sim.nitrostress === 0 ? "No" : sim.nitrostress}</Td>
                    <Td>{sim.tempVar}</Td>
                    <Td>{sim.rainVar}</Td>
                    <Td>{sim.CO2Var === 0 ? "None" : sim.CO2Var}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>

        <Tabs>
          <TabList>
            <Tab>Simulation Summary</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Table variant="simple" marginTop={8}>
                <Thead>
                  <Tr>
                    <Th>Metric</Th>
                    {selectedSimulations.map((simulationId) => {
                      const simulation = simulations.find(
                        (sim) => sim.id === simulationId
                      );
                      return (
                        <Th key={simulationId}>
                          <FormLabel>Simulation {simulation?.id}</FormLabel>
                        </Th>
                      );
                    })}
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>Yield</Td>
                    {selectedSimulations.map((simulationId) => {
                      const output = simulationOutputs[simulationId];
                      return <Td key={simulationId}>{output?.Yield}</Td>;
                    })}
                  </Tr>
                  <Tr>
                    <Td>Total Biomass</Td>
                    {selectedSimulations.map((simulationId) => {
                      const output = simulationOutputs[simulationId];
                      return <Td key={simulationId}>{output?.Total_biomass}</Td>;
                    })}
                  </Tr>
                  <Tr>
                    <Td>Nitrogen Uptake</Td>
                    {selectedSimulations.map((simulationId) => {
                      const output = simulationOutputs[simulationId];
                      return <Td key={simulationId}>{output?.Nitrogen}</Td>;
                    })}
                  </Tr>
                </Tbody>
              </Table>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      <NextPreviousButtons />
      <FaqComponent tabname="seasonal_output" />
    </Container>
  );
};

export const Route = createFileRoute("/_layout/seasonalOutput")({
  component: SeasonalOutput,
});

export default SeasonalOutput;
