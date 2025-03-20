import React, { useEffect } from "react";
import {
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { WeatherAggrigateData } from "../../client";

interface WeatherTableProps {
  weatherData: WeatherAggrigateData | undefined;
  selectedStation: string | null;
  onStationChange: (station: any) => void;
}

const WeatherTable: React.FC<WeatherTableProps> = ({
  weatherData,
  selectedStation,
}) => {
  useEffect(() => {
    console.log("Weather data:", weatherData?.data); // Log the weather data
    console.log("Selected station:", selectedStation); // Log the selected station
  }, [weatherData?.data, selectedStation]);



  
    if(!weatherData || weatherData?.data === null ) {
      if(selectedStation){
    return <div>No Weather Data. Please use import method to <b>upload/donwnload</b> Weather Data</div>;
      }
      else{
        return <div>Please select a station to show weather data.</div>;
      }
}


  const weather = weatherData?.data;
  // ? weatherData?.data?.filter((weather) => weather.stationtype === selectedStation)
  // : weatherData?.data;
  return (
    <TableContainer overflowX='auto'>
      <Table size={{ base: "sm", md: "md" }}>
        <Thead>
          <Tr>
            <Th textAlign='center'>weather_id</Th>
            <Th colSpan={2} textAlign='center'>
              date
            </Th>
            <Th colSpan={2} textAlign='center'>
              srad
            </Th>
            <Th colSpan={2} textAlign='center'>
              wind
            </Th>
            <Th colSpan={2} textAlign='center'>
              rh
            </Th>
            <Th colSpan={2} textAlign='center'>
              rain
            </Th>
            {weather.tmax_min !== 0.0 && weather.tmax_max !== 0.0 && (
              <>
                <Th colSpan={2} textAlign='center'>
                  tmin
                </Th>
              </>
            )}
            {weather.tmin_min !== 0.0 && weather.tmin_max !== 0.0 && (
              <>
                <Th colSpan={2} textAlign='center'>
                  tmax
                </Th>
              </>
            )}
            {weather.temperature_min !== 0.0 &&
              weather.temperature_max !== 0.0 && (
                <>
                  <Th colSpan={2} textAlign='center'>
                    temperature
                  </Th>
                </>
              )}
          </Tr>
          <Tr>
            <Th></Th>
            <Th textAlign='center'>min</Th>
            <Th textAlign='center'>max</Th>
            <Th textAlign='center'>min</Th>
            <Th textAlign='center'>max</Th>
            <Th textAlign='center'>min</Th>
            <Th textAlign='center'>max</Th>
            <Th textAlign='center'>min</Th>
            <Th textAlign='center'>max</Th>
            <Th textAlign='center'>min</Th>
            <Th textAlign='center'>max</Th>
            {weather.tmax_min !== 0.0 && weather.tmax_max !== 0.0 && (
              <>
                <Th textAlign='center'>min</Th>
                <Th textAlign='center'>max</Th>
              </>
            )}
            {weather.tmin_min !== 0.0 && weather.tmin_max !== 0.0 && (
              <>
                <Th textAlign='center'>min</Th>
                <Th textAlign='center'>max</Th>
              </>
            )}
            {weather.temperature_min !== 0.0 &&
              weather.temperature_max !== 0.0 && (
                <>
                  <Th textAlign='center'>min</Th>
                  <Th textAlign='center'>max</Th>
                </>
              )}
          </Tr>
        </Thead>
        <Tbody>
          {weather ? (
            <Tr key='o'>
              <Td>{weather.weather_id}</Td>
              <Td>{weather.date_min}</Td>
              <Td>{weather.date_max}</Td>
              <Td>{weather.srad_min}</Td>
              <Td>{weather.srad_max}</Td>
              <Td>{weather.wind_min}</Td>
              <Td>{weather.wind_max}</Td>
              <Td>{weather.rh_min}</Td>
              <Td>{weather.rh_max}</Td>
              <Td>{weather.rain_min}</Td>
              <Td>{weather.rain_max}</Td>
              {weather.tmax_min !== 0.0 && weather.tmax_max !== 0.0 && (
                <>
                  <Td>{weather.tmax_min}</Td>
                  <Td>{weather.tmax_max}</Td>
                </>
              )}
              {weather.tmin_min !== 0.0 && weather.tmin_max !== 0.0 && (
                <>
                  <Td>{weather.tmin_min}</Td>
                  <Td>{weather.tmin_max}</Td>
                </>
              )}
              {weather.temperature_min !== 0.0 &&
                weather.temperature_max !== 0.0 && (
                  <>
                    <Td>{weather.temperature_min}</Td>
                    <Td>{weather.temperature_max}</Td>
                  </>
                )}
            </Tr>
          ) : null}
        </Tbody>
      </Table>
    </TableContainer>
  );
};
export const Route = createFileRoute("/_layout/WeatherTable")({
  component: WeatherTable,
});
export default WeatherTable;
