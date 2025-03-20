import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Box, Checkbox, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";

// Type for the simulation data
interface Simulation {
  id: number;
  name: string;
}

// Type for the data in the second table
interface SimulationData {
  co2: number;
  water: number;
}

const SeasonalOutput: React.FC = () => {
  // Data for the simulations (could be dynamically fetched or stored elsewhere)
  const simulations: Simulation[] = [
    { id: 1, name: "Simulation 1" },
    { id: 2, name: "Simulation 2" },
    { id: 3, name: "Simulation 3" }
  ];

  // Data for the table (could be dynamic too)
  const data: SimulationData[] = [
    { co2: 100, water: 50 },
    { co2: 120, water: 60 },
    { co2: 90, water: 45 },
  ];

  // State to store selected simulations
  const [selectedSimulations, setSelectedSimulations] = useState<number[]>([]);

  // Handle checkbox change
  const handleCheckboxChange = (simulationId: number): void => {
    setSelectedSimulations((prevState) =>
      prevState.includes(simulationId)
        ? prevState.filter((id) => id !== simulationId)
        : [...prevState, simulationId]
    );
  };

  return (
    <Box padding={4}>
      {/* First Table with Checkboxes */}
      <Table variant="simple">
      <Thead>
          <Tr>
            <Th>Simulation</Th>
            <Th>Action</Th>
            <Th>val1</Th>
            <Th>val2</Th>
            <Th>val3</Th>
            <Th>val4</Th>
          </Tr>
        </Thead>
        <Tbody>
          {simulations.map((simulation) => (
            <Tr key={simulation.id}>
              <Td>{simulation.name}</Td>
              <Td>
                <Checkbox
                  isChecked={selectedSimulations.includes(simulation.id)}
                  onChange={() => handleCheckboxChange(simulation.id)}
                />
              </Td>
              <Td>some1</Td>
              <Td>some2</Td>
              <Td>some3</Td>
              <Td>some4</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Second Table with Dynamic Columns */}
      <Table variant="simple" marginTop={8}>
        <Thead>
          <Tr>
            <Th>Metric</Th>
            {selectedSimulations.map((simulationId) => {
              const simulation = simulations.find((sim) => sim.id === simulationId);
              return <Th key={simulationId}>{simulation?.name}</Th>;
            })}
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>CO2</Td>
            {selectedSimulations.map((simulationId) => {
              const simulation = simulations.find((sim) => sim.id === simulationId);
              return (
                <Td key={simulationId}>
                  {simulation ? data[simulationId - 1]?.co2 : null}
                </Td>
              );
            })}
          </Tr>
          <Tr>
            <Td>Water</Td>
            {selectedSimulations.map((simulationId) => {
              const simulation = simulations.find((sim) => sim.id === simulationId);
              return (
                <Td key={simulationId}>
                  {simulation ? data[simulationId - 1]?.water : null}
                </Td>
              );
            })}
          </Tr>
        </Tbody>
      </Table>
    </Box>
  );
};
export const Route = createFileRoute("/_layout/seasonalOutput copy")({
  component: SeasonalOutput,
});
export default SeasonalOutput;
