import { Box, HStack, SimpleGrid, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import React, { useState, useEffect } from "react";

interface SimulationSummaryProps {
  sitename: string;
  soilname: string;
  stationtypename: string;
  cropname: string;
  cultivar: string;
  experimentname: string;
  treatmentname: string;
  BeginDate: string;
  TillageDate: string;
  SowingDate: string;
  FertilizerDateList: string[];
  IrrigationDateList: string[];
  PGRDate: string;
  HarvestDate: string;
  plantDensity: number;
  totalNAppl: number;
  totalirrAppl: number;
  simulationID: number;
  // getTuberInitDate: (simulationID: number) => string;
  // getMaturityDate: (simulationID: number) => string;
  // getMaizeDateByDev: (simulationID: number, development: string) => string;
  // getSoybeanDevDate: (simulationID: number, developmentStage: number) => string;
  // getPotatoAgronomicData: (
  //   simulationID: number,
  //   HarvestDate: string
  // ) => number[];
  // getSoybeanAgronomicData: (
  //   simulationID: number,
  //   HarvestDate: string
  // ) => number[];
  // getNitrogenUptake: (
  //   simulationID: number,
  //   HarvestDate: string,
  //   cropname: string
  // ) => number[];
  // getEnvironmentalData: (
  //   simulationID: number,
  //   HarvestDate: string,
  //   cropname: string
  // ) => number[];
  // getMaizeAgronomicData: (
  //   simulationID: number,
  //   MaturityDate: string
  // ) => number[];
  // getCottonAgronomicData: (simulationID: number) => number[];
  // getCottonDevDate: (simulationID: number, stage: string) => string;
  // getNitroWaterStressDates: (simulationID: number, cropname: string) => any[];
}

const SimulationSummary: React.FC<SimulationSummaryProps> = ({
  sitename,
  soilname,
  stationtypename,
  cropname,
  cultivar,
  experimentname,
  treatmentname,
  BeginDate,
  TillageDate,
  SowingDate,
  FertilizerDateList,
  IrrigationDateList,
  PGRDate,
  HarvestDate,
  simulationID,
  //   getTuberInitDate,
  //   getMaturityDate,
  //   getMaizeDateByDev,
  //   getSoybeanDevDate,
  //   getPotatoAgronomicData,
  //   getSoybeanAgronomicData,
  //   getNitrogenUptake,
  //   getEnvironmentalData,
  //   getMaizeAgronomicData,
  //   getCottonAgronomicData,
  //   getCottonDevDate,
//   getNitroWaterStressDates
}) => {
  const [simSummaryGen, setSimSummaryGen] = useState<string>("");
  const [simSummaryDates, setSimSummaryDates] = useState<string>("");
  const [simSummaryAgroDates, setSimSummaryAgroDates] = useState<string>("");
  const [envSummaryData, setEnvSummaryData] = useState<string>("");
  // const [nitroWaterStressData, setNitroWaterStressData] = useState<any[]>([]);

  useEffect(() => {
    // General Information
    let summaryGen = `<b>General Information </b><br>Site:${sitename}`;
    summaryGen += `<br>Soil: ${soilname}`;
    summaryGen += `<br>Weather: ${stationtypename}`;
    summaryGen += `<br>Crop:${cropname}`;
    summaryGen += `<br>Cultivar:${cultivar}`;
    summaryGen += `<br>Experiment:${experimentname}`;
    summaryGen += `<br>Treatment:${treatmentname}`;
    setSimSummaryGen(summaryGen);

    // Simulation Dates
    let summaryDates = `<b>Simulation Dates </b><br>Start Date:${BeginDate}`;
    summaryDates += `<br>Tillage Date:${TillageDate}`;
        if (cropname !== "fallow" && cropname !== "cotton") {
          summaryDates += `<br>Planting Date:${SowingDate}`;
        }
        if (FertilizerDateList.length > 0) {
          summaryDates += `<br>Fertilization Date:${FertilizerDateList.join("<br>----")}`;
        }
        if (IrrigationDateList.length > 0) {
          summaryDates += `<br>Irrigation Date:${IrrigationDateList.join("<br>----")}`;
        }
        if (PGRDate) {
          summaryDates += `<br>Plant Growth Regulator Application Date:${PGRDate}`;
        }
    //     if (cropname === "potato") {
    //       const TuberInitDate = getTuberInitDate(simulationID);
    //       const MaturityDate = getMaturityDate(simulationID);
          summaryDates += `<br>Emergence Date:${BeginDate}`;
          summaryDates += `<br>Tuber Initiation Date: Test`;
          summaryDates += `<br>Maturity Date: Test`;
    //     } else if (cropname === "maize") {
    //       const EmergenceDate = getMaizeDateByDev(simulationID, "Emerged");
    //       const TasseledDate = getMaizeDateByDev(simulationID, "Tasseled");
    //       const SilkedDate = getMaizeDateByDev(simulationID, "Silked");
    //       const MaturityDate = getMaizeDateByDev(simulationID, "Matured");
          summaryDates += `<br>Emergence Date:Test `;
          summaryDates += `<br>Tasseled Date:Test `;
          summaryDates += `<br>Silked Date:Test `;
          summaryDates += `<br>Maturity Date:Test `;
    //     }
    setSimSummaryDates(summaryDates);

    let argonomicDates = `Simulation Argonomic Data at<br>08/18/1998 (harvest date)`;
    argonomicDates += `<br>Yield:Test `;
    argonomicDates += `<br>Total biomass:Test `;
    argonomicDates += `<br>Nitrogen uptake:Test `;
    argonomicDates += `<br>Transpiration:Test `;
    argonomicDates += `<br>Total Nitrogen Applied:Test `;
    argonomicDates += `<br>Total Irrigation Applied:Test `;
    setSimSummaryAgroDates(argonomicDates);

    let environmentalDates = `Simulation Environmental Data at<br>08/18/1998 (harvest date)`;
    environmentalDates += `<br>Total Potential Transpiration:Test `;
    environmentalDates += `<br>Total biomass:Test `;
    environmentalDates += `<br>Nitrogen uptake:Test `;
    environmentalDates += `<br>Transpiration:Test `;
    environmentalDates += `<br>Total Nitrogen Applied:Test `;
    environmentalDates += `<br>Total Irrigation Applied:Test `;
    setEnvSummaryData(environmentalDates);

    // Fetch and set Nitrogen and Water Stress Data
    // const stressData = getNitroWaterStressDates(simulationID, cropname);
    // setNitroWaterStressData(stressData);
  }, [
    sitename,
    soilname,
    stationtypename,
    cropname,
    cultivar,
    experimentname,
    treatmentname,
    BeginDate,
    TillageDate,
    SowingDate,
    FertilizerDateList,
    IrrigationDateList,
    PGRDate,
    HarvestDate,
    simulationID,
    // getTuberInitDate,
    // getMaturityDate,
    // getMaizeDateByDev,
    // getNitroWaterStressDates
  ]);

  return (
    <div>
      <HStack spacing={4} flexWrap='wrap' justify='center'>
        <SimpleGrid
          columns={{ base: 1, md: 4 }} // 1 column on small screens, 2 columns on medium and larger
          spacing={3}
          mt={8}
          w='100%' // Ensures it takes full width
        >
          <Box p={4} borderWidth={1} borderRadius='lg' boxShadow='md'>
            <div dangerouslySetInnerHTML={{ __html: simSummaryGen }} />
          </Box>
          <Box p={4} borderWidth={1} borderRadius='lg' boxShadow='md'>
            <div dangerouslySetInnerHTML={{ __html: simSummaryDates }} />
          </Box>
          <Box p={4} borderWidth={1} borderRadius='lg' boxShadow='md'>
            <div dangerouslySetInnerHTML={{ __html: simSummaryAgroDates }} />
          </Box>
          <Box p={4} borderWidth={1} borderRadius='lg' boxShadow='md'>
            <div dangerouslySetInnerHTML={{ __html: envSummaryData }} />
          </Box>
        </SimpleGrid>

        {/* Nitro and Water Stress Table */}
        <TableContainer w="100%" mt={6} overflowY="auto" maxH="250px">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Water Stress</Th>
                <Th>Nitrogen Stress</Th>
                <Th>Carbon Stress</Th>
                <Th>Predominant Factor</Th>
              </Tr>
            </Thead>
            <Tbody>
              {/* {nitroWaterStressData.slice(0, 8).map((record, i) => (
                <Tr key={i}>
                  <Td>{record.date}</Td>
                  <Td color={record.waterStress <= 0.75 ? "red" : "black"}>
                    {record.waterStress.toFixed(3)}
                  </Td>
                  <Td color={record.nitrogenStress <= 0.75 ? "red" : "black"}>
                    {record.nitrogenStress.toFixed(3)}
                  </Td>
                  <Td>{record.carbonStress.toFixed(3)}</Td>
                  <Td>{record.predominantFactor}</Td>
                </Tr>
              ))} */}
              <Tr>
                  <Td>test</Td>
                  <Td>
                    test
                  </Td>
                  <Td>
                    test
                  </Td>
                  <Td>test</Td>
                  <Td>test</Td>
                </Tr>
            </Tbody>
          </Table>
        </TableContainer>
      </HStack>
      
    </div>
  );
};

export default SimulationSummary;
