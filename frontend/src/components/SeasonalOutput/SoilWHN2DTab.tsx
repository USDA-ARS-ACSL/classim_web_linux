import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Select,
  VStack,
} from '@chakra-ui/react';
import Plot from 'react-plotly.js';
import { Layout, Data } from 'plotly.js';

// Define the type for the props
interface SoilWHN2DTabProps {
  cropArr: string[]; // Array of crop data
  g03Tablename: string;
  simulationID: string;
  onClickPlotSoil2DTab: (date: string) => void; // Callback function for plot button click
}

const SoilWHN2DTab: React.FC<SoilWHN2DTabProps> = ({
  onClickPlotSoil2DTab,
}) => {
  const [dateList, setDateList] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [plotData, setPlotData] = useState<Data[]>([]);

  // Simulate fetching data for date selection
  useEffect(() => {
    // Replace with actual data fetching
    const fetchDateList = async () => {
      // Simulate a data fetching operation
      const response = await fetch('/api/getDateList'); // Replace with your API endpoint
      const data = await response.json();
      setDateList(data.dates); // Assuming the API returns an object with a dates array
    };

    fetchDateList();
  }, []);

  // Handle date selection
  const handleDateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDate(event.target.value);
  };

  // Plotting function
  const handlePlot = () => {
    // Simulate generating plot data based on selected date
    const data: Data[] = [{
      x: [1, 2, 3, 4, 5], // Example x values
      y: [1, 4, 9, 16, 25], // Example y values
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Soil WHN Data', // Example name
    }];

    setPlotData(data);
    onClickPlotSoil2DTab(selectedDate);
  };

  // Render the plot
  const renderPlot = () => {
    if (!plotData.length) return null;

    const layout: Partial<Layout> = {
      title: { text: 'Soil WHN 2D Graph' },
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
      <VStack spacing={4} align='start'>
        <FormControl>
          <FormLabel>Select Date</FormLabel>
          <Select placeholder='Select date' value={selectedDate} onChange={handleDateChange}>
            {dateList.map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </Select>
        </FormControl>

        <Button colorScheme='teal' onClick={handlePlot}>
          Plot
        </Button>

        {renderPlot()}
      </VStack>
    </Box>
  );
};

export default SoilWHN2DTab;
