import React, { useEffect, useState } from 'react';
import { Box, Button, Checkbox, VStack, Grid, GridItem, Text } from '@chakra-ui/react';
import Plot from 'react-plotly.js';
// import { fetchSurfChaData, genDictOutput } from './dataService'; // Assumed data service functions

interface SurfChaTabProps {
  cropArr: string[];
}

const SurfChaTab: React.FC<SurfChaTabProps> = ({ cropArr }) => {
  const [checkedParams, setCheckedParams] = useState<string[]>([]);
  const [plotData, setPlotData] = useState<any[]>([]);
  const [varSurfChaDescDict, setVarSurfChaDescDict] = useState<any>({});

  const genDictOutput = (cropArr: string[], type: string, level: number) => {
    // This function simulates generation of dictionaries for surface characteristics
    console.log([cropArr,type,level])
    const varSurfChaDescDict: { [key: string]: string } = {
      param1: 'Parameter 1',
      param2: 'Parameter 2',
      param3: 'Parameter 3',
    };
  
    return { varSurfChaDescDict };
  };
  // Initialize description dict for surface characteristics
  useEffect(() => {
    const { varSurfChaDescDict } = genDictOutput(cropArr, 'surfCha', 0);
    setVarSurfChaDescDict(varSurfChaDescDict);
  }, [cropArr]);

  const handleCheckboxChange = (param: string) => {
    setCheckedParams((prev) =>
      prev.includes(param) ? prev.filter((p) => p !== param) : [...prev, param]
    );
  };

  const fetchSurfChaData = async (checkedParams: string[]) => {
    // Simulates fetching data for the selected parameters from an API or dataset
    return checkedParams.map(param => ({
      x: [1, 2, 3, 4], // Dummy date axis
      y: [10, 20, 15, 30], // Dummy values for each param
      type: 'scatter',
      mode: 'lines+markers',
      name: param,
    }));
  };

  const handlePlot = async () => {
    if (checkedParams.length > 0) {
      const data = await fetchSurfChaData(checkedParams); // Fetch data for selected parameters
      setPlotData(data);
    }
  };

  return (
    <Box>
      <Grid templateColumns="270px 1fr" gap={4}>
        {/* GroupBox with checkboxes */}
        <GridItem>
          <Box border="1px" borderColor="gray.200" p={4} maxW="270px">
            <Text fontWeight="bold" mb={4}>Select parameter to plot</Text>
            <VStack align="start">
              {Object.keys(varSurfChaDescDict).map((param, index) => (
                <Checkbox
                  key={index}
                  onChange={() => handleCheckboxChange(param)}
                >
                  {varSurfChaDescDict[param]}
                </Checkbox>
              ))}
            </VStack>
            <Button mt={4} onClick={handlePlot} colorScheme="blue">
              Plot
            </Button>
          </Box>
        </GridItem>

        {/* Plotting Area */}
        <GridItem>
          <Box h="300px" w="100%">
            <Plot
              data={plotData}
              layout={{
                title: { text: 'Surface Characteristics Plot' },
                xaxis: { title: { text: 'Date Axis' } },
                yaxis: { title: { text: 'Selected Parameters' } },
              }}
            />
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default SurfChaTab;
