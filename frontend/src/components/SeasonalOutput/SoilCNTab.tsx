import React, { useState } from 'react';
import {
  Checkbox,
  Button,
  Box,
  Heading,
  Grid,
  GridItem,
  Stack,
} from '@chakra-ui/react';
import Plot from 'react-plotly.js';
import { Layout, Data } from 'plotly.js';

// Define the type for the props
interface SoilCNTabProps {
  varSoilCNDescDict: { [key: string]: string }; // Dictionary of variable descriptions
  onClickSoilCNTab: (selectedParams: string[]) => void; // Callback function for plot button click
}

const SoilCNTab: React.FC<SoilCNTabProps> = ({
  varSoilCNDescDict,
  onClickSoilCNTab,
}) => {
  const [selectedParams, setSelectedParams] = useState<string[]>([]);
  const [plotData, setPlotData] = useState<Data[]>([]);

  // Checkbox toggle handler
  const handleCheckboxChange = (param: string) => {
    setSelectedParams((prev) =>
      prev.includes(param) ? prev.filter((p) => p !== param) : [...prev, param]
    );
  };

  // Plotting function
  const handlePlot = () => {
    const data: Data[] = selectedParams.map((param) => {
      const x = [1, 2, 3, 4, 5]; // Example x values
      const y = [1, 4, 9, 16, 25]; // Example y values

      return {
        x,
        y,
        type: 'scatter',
        mode: 'lines+markers',
        name: varSoilCNDescDict[param] || param, // Use the variable description for legend
      };
    });

    setPlotData(data);
    onClickSoilCNTab(selectedParams);
  };

  // Render the plot
  const renderPlot = () => {
    if (!plotData.length) return null;

    const layout: Partial<Layout> = {
      title: { text: 'Soil CN Graph' },
      hovermode: false,
      xaxis: { title: { text: 'X Axis' } },
      yaxis: { title: { text: 'Y Axis' } },
    };

    const config = {
      responsive: true,
      displayModeBar: false,
      displaylogo: false,
      staticPlot: true,
    };

    return <Plot data={plotData} layout={layout} config={config} />;
  };

  return (
    <Box w='100%' maxW='1200px' mx='auto' p={4}>
      <Grid
        templateColumns={{ base: '1fr', md: '30% 70%' }} // Single column on mobile, 30/70 split on larger screens
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
          bg='white'
        >
          <Heading size='sm' mb={4} textAlign='center'>
            Select parameter to plot
          </Heading>
          <Stack spacing={4} align='start'>
            {Object.keys(varSoilCNDescDict).map((varKey) => (
              <Checkbox
                key={varKey}
                isChecked={selectedParams.includes(varKey)}
                onChange={() => handleCheckboxChange(varKey)}
              >
                {varSoilCNDescDict[varKey]}
              </Checkbox>
            ))}

            <Button
              mt={4}
              colorScheme='teal'
              onClick={handlePlot}
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
          bg='white'
        >
          {renderPlot()}
        </GridItem>
      </Grid>
    </Box>
  );
};

export default SoilCNTab;
