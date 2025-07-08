import React, { useState, useEffect } from "react";
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
import { DeleteIcon } from "@chakra-ui/icons";
import { createFileRoute } from "@tanstack/react-router";
import { SimulationApiResponse } from "../../client/models";
import { SimulationService, ApiError } from "../../client"; // Adjust path as needed
import FaqComponent from "../../components/Faqs/FaqComponent";
import NextPreviousButtons from "../../components/Common/NextPreviousButtons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useCustomToast from "../../hooks/useCustomToast";

// StatusBar component for showing progress/status
function StatusBar({ status }: { status: number | null | undefined }) {
  if (status == null) return <Text color="red.400">Failed</Text>;
  if (status === 101) return <Text color="green.500">Completed</Text>;
  if (status === 1001) return <Text color="orange.400">Started</Text>;
  if (status < 0) return <Text color="red.500">Failed</Text>;
  // Show progress bar for 0-100
  return (
    <Box w="100px" bg="gray.100" borderRadius="md" overflow="hidden">
      <Box style={{ width: `${Math.min(100, status)}%` }} h="8px" bg="blue.400" />
      <Text fontSize="xs" textAlign="center">{status}%</Text>
    </Box>
  );
}

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
  // Status polling state
  const [statusMap, setStatusMap] = useState<Record<number, number | null>>({});

  // Poll status every 3 seconds only if any simulation is in progress
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    const pollStatus = () => {
      SimulationService.readSimulations().then((resp) => {
        const newStatusMap: Record<number, number | null> = {};
        let anyStarted = false;
        (resp.data || []).forEach((sim: any) => {
          newStatusMap[sim.id] = sim.status;
          // Consider "Started" as status === -1, and "in progress" as 0 <= status < 101
          if (sim.status === -1 || (sim.status != null && sim.status >= 0 && sim.status < 101)) {
            anyStarted = true;
          }
        });
        setStatusMap(newStatusMap);
        // If nothing is in started or in progress, stop polling
        if (!anyStarted && interval) {
          clearInterval(interval);
          interval = null;
        }
      });
    };
    // Initial check if any simulation is started or in progress
    const initialCheck = () => {
      SimulationService.readSimulations().then((resp) => {
        const newStatusMap: Record<number, number | null> = {};
        let anyStarted = false;
        (resp.data || []).forEach((sim: any) => {
          newStatusMap[sim.id] = sim.status;
          if (sim.status === -1 || (sim.status != null && sim.status >= 0 && sim.status < 101)) {
            anyStarted = true;
          }
        });
        setStatusMap(newStatusMap);
        if (anyStarted && !interval) {
          interval = setInterval(pollStatus, 3000);
        }
      });
    };
    initialCheck();
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const handleDelete = (simulationId: number): void => {
    SimulationService.deleteSimulation({ id: simulationId })
      .then(() => {
        showToast("Simulation deleted successfully", "", "success");
        // Refetch the simulations data so the deleted one is not shown
        queryClient.invalidateQueries({ queryKey: ["readSimulations"] });
      })
      .catch((err: ApiError) => {
        const errDetail = (err.body as any)?.detail;
        showToast("Failed to delete simulation", String(errDetail), "error");
      });
  };

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
      showToast("Something went wrong.", String(errDetail), "error");
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
                  <Th>status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {simulations.map((sim) => (
                  <Tr key={sim.id}>
                    <Td>
                      <Checkbox
                        isChecked={selectedSimulations.includes(sim.id)}
                        onChange={() => handleCheckboxChange(sim.id)}
                        isDisabled={(statusMap[sim.id] ?? sim.status) !== 101}
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
                    <Td>
                      {/* Show Failed + trash icon inline if status is null or < 0 */}
                      {((statusMap[sim.id] ?? sim.status) == null || (statusMap[sim.id] ?? sim.status) < 0) ? (
                        <Box display="flex" alignItems="center">
                          <Text color="red.500" fontWeight="bold" mr={1}>Failed</Text>
                          <DeleteIcon
                            style={{ cursor: "pointer" }}
                            color="#E53E3E"
                            onClick={() => handleDelete(sim.id)}
                          />
                        </Box>
                      ) : (
                        <StatusBar status={statusMap[sim.id] ?? sim.status} />
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
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
