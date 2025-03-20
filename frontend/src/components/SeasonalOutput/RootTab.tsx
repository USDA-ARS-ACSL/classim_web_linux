// import React, { useState, useEffect } from 'react';
// import { Box, Button, VStack, HStack, Select, Text } from '@chakra-ui/react';
// import Plot from 'react-plotly.js';
// import { fetchRootData, extractCropOutputData } from './dataService'; // Assuming you have these functions

// interface RootTabProps {
//   cropName: string;
//   g04Tablename: string;
//   simulationID: string;
// }

// const RootTab: React.FC<RootTabProps> = ({ cropName, g04Tablename, simulationID }) => {
//   const [dateList, setDateList] = useState<string[]>([]);
//   const [selectedDate, setSelectedDate] = useState<string>('');
//   const [plotData, setPlotData] = useState<any[]>([]);

//   useEffect(() => {
//     if (cropName !== "fallow") {
//       // Fetch crop output data
//       const fetchData = async () => {
//         const cropOutputData = await extractCropOutputData(g04Tablename, simulationID);

//         // Extract and clean data
//         const tableID = `${g04Tablename}_id`;
//         cropOutputData.drop(columns=[tableID], inplace=true); // If using something like pandas.js or need manual cleanup
//         const dateTimeSplit = cropOutputData['Date_Time'].map((dt: string) => dt.split(' ')[0]);
//         const uniqueDates = [...new Set(dateTimeSplit)];
//         setDateList(uniqueDates);
//       };

//       fetchData();
//     }
//   }, [cropName, g04Tablename, simulationID]);

//   const handlePlot = () => {
//     if (selectedDate) {
//       // Fetch the data for the selected date and update plotData
//       console.log('Plotting data for selected date:', selectedDate);
//       // Example of data fetching logic, replace with actual data processing:
//       const rootData = fetchRootData(g04Tablename, simulationID, selectedDate);
//       setPlotData(rootData);
//     }
//   };

//   return (
//     <Box>
//       {cropName !== "fallow" && (
//         <VStack spacing={4}>
//           <HStack spacing={4}>
//             <Text>Select Date:</Text>
//             <Select onChange={(e) => setSelectedDate(e.target.value)} placeholder="Select date">
//               {dateList.map((date, index) => (
//                 <option key={index} value={date}>{date}</option>
//               ))}
//             </Select>
//           </HStack>
//           <Button onClick={handlePlot}>Plot</Button>

//           <Box w="100%" h="500px">
//             <Plot
//               data={plotData}
//               layout={{
//                 title: 'Root Data Plot',
//                 xaxis: { title: 'X Axis Label' },
//                 yaxis: { title: 'Y Axis Label' }
//               }}
//             />
//           </Box>
//         </VStack>
//       )}
//     </Box>
//   );
// };

// export default RootTab;
