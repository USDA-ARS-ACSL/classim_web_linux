import React, { useState } from "react";
import {
  Checkbox,
  Button,
  Box,
  Heading,
  Grid,
  GridItem,
  Stack,
} from "@chakra-ui/react"; // Assuming Chakra UI is being used
import Plot from "react-plotly.js"; // A popular plotting library for React
import { Layout, Data } from "plotly.js";

// Define the type for the props
interface PlantTabProps {
  cropName: string;
  varDescDict: { [key: string]: string }; // Dictionary of variable descriptions
  onClickPlotPlantTab: (selectedParams: string[]) => Data[]; // Callback function for plot button click
}

const PlantTab: React.FC<PlantTabProps> = ({
  cropName,
  varDescDict,
  onClickPlotPlantTab,
}) => {
  const [selectedParams, setSelectedParams] = useState<string[]>([]);
  const [plotData, setPlotData] = useState<Data[]>([]);
  const [plotVisible, setPlotVisible] = useState<boolean>(false);

  // Checkbox toggle handler
  const handleCheckboxChange = (param: string) => {
    setSelectedParams((prev) =>
      prev.includes(param) ? prev.filter((p) => p !== param) : [...prev, param]
    );
  };

  // Plot button click handler
  const handlePlotClick = () => {
    const data = onClickPlotPlantTab(selectedParams);
    setPlotData(data);
    setPlotVisible(true);
  };

  // Render the plot based on selected parameters
  const renderPlot = () => {
    if (!plotVisible || !plotData.length) return null;

    const layout: Partial<Layout> = {
      title: { text:"Plant Graph" },
      hovermode: false, // Disable hover for the entire plot
      xaxis: { title: { text: "X Axis" } },
      yaxis: { title: { text: "Y Axis" } },
    };

    const config = {
      responsive: true,
      displayModeBar: false, // Disables the mode bar
      displaylogo: false, // Disables the Plotly logo
      staticPlot: true,
    };

    return <Plot data={plotData} layout={layout} config={config} />;
  };

  if (cropName === "fallow") {
    return <p>No data to display for fallow crop.</p>;
  }

  return (
    <Box w='100%' maxW='1200px' mx='auto' p={4}>
      <Grid
        templateColumns={{ base: "1fr", md: "30% 70%" }} // Single column on mobile, 30/70 split on larger screens
        gap={4}
        alignItems='start'
      >
        {/* Checkbox Section (30% on larger screens) */}
        <GridItem
          w='100%'
          p={4}
          borderWidth={1}
          borderRadius='lg'
          boxShadow='md'
          bg='white' // Optional background for better contrast
        >
          <Heading size='sm' mb={4} textAlign='center'>
            Select parameter to plot
          </Heading>
          <Stack spacing={4} align='start'>
            {Object.keys(varDescDict).map((varKey) => (
              <Checkbox
                key={varKey}
                isChecked={selectedParams.includes(varKey)}
                onChange={() => handleCheckboxChange(varKey)}
              >
                {varDescDict[varKey]}
              </Checkbox>
            ))}

            <Button
              mt={4}
              colorScheme='teal'
              onClick={() => handlePlotClick()}
            >
              Plot
            </Button>
          </Stack>
        </GridItem>

        {/* Plot Section (70% on larger screens) */}
        <GridItem
          w='100%'
          p={4}
          borderWidth={1}
          borderRadius='lg'
          boxShadow='md'
          bg='white' // Optional background for better contrast
        >
          {renderPlot()}
        </GridItem>
      </Grid>
    </Box>
  );
};

export default PlantTab;
