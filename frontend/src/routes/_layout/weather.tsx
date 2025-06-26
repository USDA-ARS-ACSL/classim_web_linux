import {
  Box,
  Flex,
  Heading,
  Select,
  Input,
  Button,
  FormControl,
  FormLabel,
  Spinner,
  Container,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  SiteService,
  TDataCreateStation,
  TDataCreateWeatherTable,
  TDataDeleteStation,
  TDataUpdateStation,
  TDataWeatherStationTypeHtmlContent,
  WeatherDataCreate,
  WeatherService,
} from "../../client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useCustomToast from "../../hooks/useCustomToast";
import WeatherTable from "../../components/Weather/WeatherTable";
import Papa, { ParseResult } from "papaparse";
import FaqComponent from "../../components/Faqs/FaqComponent";
import NextPreviousButtons from "../../components/Common/NextPreviousButtons";
import { Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/weather")({
  component: Weather,
});

function Weather() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedStation, setSelectedStation] = useState("");
  const [stationName, setStationName] = useState<string>(""); // State to store the station name
  const [averageWind, setAverageWind] = useState<number | null>(null);
  const [averageRainRate, setAverageRainRate] = useState<number | null>(null);
  const [averageCO2, setAverageCO2] = useState<number | null>(420); // Default to 1
  const [nContentRainfall, setNContentRainfall] = useState<number | null>(null);
  const [selectedStationData, setSelectedStationData] = useState<any>(null);
  const [tdata, setTData] = useState<WeatherDataCreate[]>([]);
  const [site, setSite] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [importType, setImportType] = useState<string>("");  

  const fileInputRef = useRef<HTMLInputElement>(null);
  const showToast = useCustomToast();

  const { data: sites } = useQuery({
    queryKey: ["readSites"],
    queryFn: () => SiteService.readSites(),
  });

  const { data: stations } = useQuery({
    queryKey: ["readStation"],
    queryFn: () => WeatherService.readStations(),
  });

  const stationType: TDataWeatherStationTypeHtmlContent = {
    stationType: selectedStationData?.stationtype,
  };

  const { data: weatherData } = useQuery({
    queryKey: ["readStationTable", stationType],
    queryFn: () => WeatherService.readStationTable(stationType),
  });

  useEffect(() => {
    if (!selectedStationData && selectedStation !== "") {
      // Reset all fields when no station is selected
      setSelectedStation("0");
      setStationName("");
      setSite("");
      setAverageWind(null);
      setAverageRainRate(null);
      setAverageCO2(420);
      setNContentRainfall(null);
    }
    // console.log(selectedStationData)
  }, [selectedStationData]);

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImportMethod = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVal = event.target.value;
    setImportType(selectedVal);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("File selected:", file.name);
      setSelectedFile(file);
      parseCSV(file);
    } else {
      setSelectedFile(null);
    }
  };

  const parseCSV = (file: File) => {
    Papa.parse<WeatherDataCreate>(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: function (results: ParseResult<WeatherDataCreate>) {
        // Skip the header row by using the data directly from results.data
        const data = results.data;
        validateAndSetData(data);
      },
    });
  };

  const validateAndSetData = (csvData: WeatherDataCreate[]) => {
    const requiredColumns = ["date", "srad", "rain"];
    const errors: string[] = [];

    const columns = csvData.length ? Object.keys(csvData[0]) : [];

    // Check for required columns
    requiredColumns.forEach((col) => {
      if (!columns.includes(col)) {
        errors.push(`Column ${col} is missing.`);
      }
    });

    if (!columns.includes("hour")) {
      if (!columns.includes("tmax"))
        errors.push("Maximum temperature (tmax) is missing.");
      if (!columns.includes("tmin"))
        errors.push("Minimum temperature (tmin) is missing.");
    } else {
      if (!columns.includes("temperature"))
        errors.push("Column temperature is missing.");
    }

    if (errors.length) {
      showToast("Validation Error", errors.join("\n"), "error");
      return false;
    } else {
      const processedData: WeatherDataCreate[] = csvData;
      setTData(processedData);
      return true;
    }
  };

  useEffect(() => {
    // console.log("fileSelected state changed:", selectedFile);
  }, [selectedFile]);

  const handleUpload = async () => {
    if (selectedFile) {
      const userConfirmed = window.confirm(
        "Would you like to proceed with the ingestion of the data?"
      );
      if (userConfirmed) {
        // console.log("User confirmed ingestion of data.");
        // Process the data before submitting
        const processedData: WeatherDataCreate[] = [];

        tdata.forEach((row) => {
          let dateString: string | null = null;
          let jday: number | null = null;

          if (row.date !== null && row.date !== undefined) {
            const date = new Date(row.date);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");

            // dateString = `${year}-${month}-${day}`;
            dateString = `${month}/${day}/${year}`;
            jday = Math.floor(date.getTime() / (1000 * 60 * 60 * 24)); // Calculate Julian day
          }

          const processedRow: WeatherDataCreate = {
            id: 0, // Assign appropriate value for 'id'
            stationtype: selectedStationData?.stationtype ?? "", // Assign appropriate value for 'stationtype'
            weather_id: selectedStation, // Assign appropriate value for 'weather_id'
            date: dateString,
            jday: jday ?? 0, // Assign a default value for 'jday' if it's null
            // Assign values for other properties
            hour: row.hour ?? null,
            srad: row.srad ?? null,
            wind: row.wind ?? null,
            rh: row.rh ?? null,
            rain: row.rain ?? null,
            tmax: row.tmax ?? null,
            tmin: row.tmin ?? null,
            temperature: row.temperature ?? null,
            co2: row.co2 ?? null,
          };

          // Push the processed row to 'processedData'
          processedData.push(processedRow);
        });
        // Create the request body
        const data: TDataCreateWeatherTable = {
          requestBody: processedData,
        };

        try {
          // Submit the processed data
          await WeatherService.submitWeatherTable(data);
          showToast(
            "Data Submitted",
            "The weather data has been successfully submitted.",
            "success"
          );
        } catch (error) {
          // console.log(error);
          showToast(
            "Submission Error",
            "There was an error submitting the data.",
            "error"
          );
        }
      }
    }
  };

  const handleStationChange = (station: any) => {
    setSelectedStation(station);
  };

  const handleStationChangeAdapted = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const stationId = event.target.value;
    const selectedStation = event.target.value;
    setSelectedStation(selectedStation);
    // console.log({stationId, selectedStation})

    if (stationId === "0") {
      // If "Create New Station" is selected, reset station name
      setStationName("");
      setSite("");
      setImportType("");
      setSelectedStation("0");
    }
    // Find the selected station from the stations.data array
    const selectedStationData = stations?.data.find(
      (station) => station.id === parseInt(stationId, 10)
    );
    setSelectedStationData(selectedStationData || null);

    // Update other fields based on the selected station data
    if (selectedStationData) {
      setAverageWind(selectedStationData.AvgWind);
      setAverageRainRate(selectedStationData.AvgRainRate);
      setAverageCO2(selectedStationData.AvgCO2);
      setNContentRainfall(selectedStationData.ChemCOnc);
      setSite(selectedStationData.site?.toString() || "");
    } else {
      // Reset fields if no station is selected
      setAverageWind(null);
      setAverageRainRate(null);
      setAverageCO2(420);
      setNContentRainfall(null);
      setSite("");
      setImportType("");
    }

    // Call the handleStationChange function
    handleStationChange(selectedStation.toString());
  };

  const handleAverageWindChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAverageWind(value === "" ? null : parseFloat(value));
  };

  const handleAverageRainRateChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setAverageRainRate(value === "" ? null : parseFloat(value));
  };

  const handleAverageCO2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAverageCO2(value === "" ? null : parseFloat(value));
  };

  const handleNContentRainfallChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setNContentRainfall(value === "" ? null : parseFloat(value));
  };

  const handleSubmit = async () => {
    let errMess = "";

    if (
      averageRainRate === null ||
      averageRainRate < 0 ||
      averageRainRate > 10
    ) {
      errMess += "- The average rain rates range from 0 to 10 cm/day.<br>";
    }

    if (averageWind === null || averageWind < 0 || averageWind > 25) {
      errMess += "- The average wind ranges from 0 to 25 km/h.<br>";
    }

    if (averageCO2 === null || averageCO2 < 0 || averageCO2 > 2000) {
      errMess += "- The average CO2 ranges from 0 to 2000 ppm.<br>";
    }

    if (stationName === "" && selectedStation === "0") {
      errMess += "- Please enter a station name.<br>";
    } else {
      // Check for duplicate station names against database values
      const existingStation = stations?.data.find(
        (station) => station.stationtype === stationName
      );
      if (existingStation) {
        errMess += "- The station name is already in use.<br>";
      }
    }

    if (
      nContentRainfall === null ||
      nContentRainfall < 0 ||
      nContentRainfall > 10
    ) {
      errMess +=
        "- The average content of N in rainfall ranges from 0 to 10 kg/ha.<br>";
    }

    if (errMess !== "") {
      showToast(
        "You might want to check the following information:",
        `${errMess}`,
        "error"
      );
      return; // Exit the function if there are validation errors
    }

    try {
      let response;
      if (selectedStation === "0") {
        const data: TDataCreateStation = {
          requestBody: {
            id: null,
            stationtype:
              selectedStation === "0"
                ? stationName
                : selectedStationData?.stationtype || "",
            site:
              selectedStation === "0" ? site : selectedStationData?.site || "",
            Bsolar: 1000000,
            Btemp: 1,
            Atemp: 0,
            BWInd: 1,
            BIR: 1,
            AvgWind: averageWind || 0, // Provide a default value if null
            AvgRainRate: averageRainRate || 0, // Provide a default value if null
            ChemCOnc: nContentRainfall || 0,
            AvgCO2: averageCO2 || 0,
          },
        };
        response = await WeatherService.submitWeatherData(data);
      } else {
        const data: TDataUpdateStation = {
          requestBody: {
            stationtype: selectedStationData?.stationtype || "",
            site: selectedStationData?.site || "",
            Bsolar: 1000000,
            Btemp: 1,
            Atemp: 0,
            BWInd: 1,
            BIR: 1,
            AvgWind: averageWind || 0,
            AvgRainRate: averageRainRate || 0,
            ChemCOnc: nContentRainfall || 0,
            AvgCO2: averageCO2 || 0,
          },
          id: selectedStationData?.id,
        };
        response = await WeatherService.updateWeather(data);
      }
      if (response) {
        setStationName("");
        setSite("");
        setAverageWind(null);
        setAverageRainRate(null);
        setAverageCO2(null);
        setNContentRainfall(null);
        setSelectedStation("");
        setImportType("");
        queryClient.invalidateQueries({
          queryKey: ["readStation"],
        });
        showToast(
          "Successfully",
          selectedStation === "0"
            ? "A new station was created."
            : "A station was updated.",
          "success"
        );
        setSelectedStation("0")
        setSelectedStationData('')
      } else {
        showToast(
          "Failed",
          selectedStation === "0"
            ? "A new station was not created."
            : "A station was not updated.",
          "error"
        );
      }
    } catch (error) {
      // Handle error
    }
  };
  const queryClient = useQueryClient();
  const handleDelete = async () => {
    if (!selectedStation || selectedStation === "0") {
      showToast("Error", "No station selected for deletion.", "error");
      return;
    }
    if (selectedStationData && selectedStationData.id) {
      try {
        const data: TDataDeleteStation = {
          id: parseInt(selectedStationData.id, 10),
        };
        const response = await WeatherService.deleteStation(data);
        if (response) {
          showToast(
            "Successfully",
            "The station was deleted successfully.",
            "success"
          );
          // Reset fields after deletion
          setStationName("");
          setSite("");
          setAverageWind(null);
          setAverageRainRate(null);
          setAverageCO2(null);
          setNContentRainfall(null);
          setSelectedStation("0"); // Reset to default value for selecting new station
          setSelectedStationData(null); // Clear the selected station data
          setImportType("");

          queryClient.invalidateQueries({
            queryKey: ["readStation"],
          });
        } else {
          showToast("Failed!", "Failed to delete station.", "error");
        }
      } catch (error) {
        // showToast("Error!", `Error occurred: ${error.message}`, "error");
      }
    } else {
      showToast(
        "Error!",
        "Selected station data or its ID is undefined.",
        "error"
      );
    }
  };

  const downloadWeatherTable = async () => {
    if (!selectedStation || selectedStation === "0") {
      showToast("Error", "Select station to download.", "error");
      return;
    }
    if (selectedStationData && selectedStationData.id) {
      try {
        setIsLoading(true); // Start loading
        let data = {
          id: parseInt(selectedStationData.id, 10),
          con: false,
        };
        const response = await WeatherService.downloadWeatherTable(data);
        if (response) {
          if (response?.message === "data existed") {
            const userConfirmed = window.confirm(
              "There is already data for this site and weather type for this date range.  Would you like to replace this data?"
            );
            if (userConfirmed) {
              data.con = true;
              const response = await WeatherService.downloadWeatherTable(data);
              if (!response?.error) {
                showToast("Successfully", response.message, "success");
                setSelectedStation("0")
                setSelectedStationData('')
              } else {
                showToast(
                  "Failed!",
                  response?.error,
                  "error"
                );
              }
            } else {
              return false;
            }
          } else {
            if(response.error)
              showToast("Failed!", response.error, "error");
            else
              showToast("Successfully", response.message, "success");
              setSelectedStation("0")
              setSelectedStationData('')
          }
        } else {
          showToast("Failed!", "Failed to download station data.", "error");
        }
      } catch (error) {
        showToast("Error!", "Failed to download data", "error");
      } finally {
        setIsLoading(false); // End loading
      }
    } else {
      showToast(
        "Error!",
        "Selected station data or its ID is undefined.",
        "error"
      );
    }
  };

  return (
    <Container maxW='full' mt={[4, 5]} width='80%'>
      <Heading size='lg' textAlign={{ base: "center", md: "left" }} pb={4}>
        Weather
      </Heading>
      <Flex
        direction='row'
        flexWrap='wrap'
        pb={8}
        width='100%'
        justifyContent='space-between'
      >
        <FormControl
          flexBasis={{ base: "100%", md: "48%" }}
          mb={{ base: 4, md: 0 }}
        >
          <FormLabel htmlFor='stationSelect'>Station</FormLabel>
          {stations && (
            <Select
              id='stationSelect'
              placeholder='Select Station'
              size='md'
              value={selectedStation}
              onChange={handleStationChangeAdapted}
            >
              <option key='0' value='0'>
                Create New Station
              </option>
              {stations?.data.map((eachStation: any) => (
                <option key={eachStation.id} value={eachStation.id}>
                  {eachStation.stationtype}
                </option>
              ))}
            </Select>
          )}
        </FormControl>

        <FormControl
          flexBasis={{ base: "100%", md: "48%" }}
          mb={{ base: 4, md: 0 }}
        >
          <FormLabel htmlFor='siteSelect'>Site</FormLabel>
          {selectedStation === "0" ? (
            <Select
              id='siteSelect'
              placeholder='Select Site'
              size='md'
              value={site}
              onChange={(e) => setSite(e.target.value)}
            >
              {sites?.data.map((eachSite: any) => (
                <option key={eachSite.id} value={eachSite.sitename}>
                  {eachSite.sitename}
                </option>
              ))}
            </Select>
          ) : (
            <Input id='siteInput' type='text' value={site} isReadOnly />
          )}
        </FormControl>
      </Flex>

      <Flex
        direction='row'
        flexWrap='wrap'
        pb={8}
        width='100%'
        justifyContent='space-between'
      >
        <FormControl
          flexBasis={{ base: "100%", md: "48%" }}
          mb={{ base: 4, md: 0 }}
        >
          <FormLabel htmlFor='averageWindInput'>Average Wind (Km/h)</FormLabel>
          <Input
            id='averageWindInput'
            type='text'
            placeholder='Enter Average Wind (Km/h)'
            value={averageWind ?? ""}
            onChange={handleAverageWindChange}
            required
          />
        </FormControl>
        <FormControl
          flexBasis={{ base: "100%", md: "48%" }}
          mb={{ base: 4, md: 0 }}
        >
          <FormLabel htmlFor='averageRainRateInput'>
            Average Rain Rate (cm/hr)
          </FormLabel>
          <Input
            id='averageRainRateInput'
            type='text'
            placeholder='Average Rain Rate (cm/hr)'
            value={averageRainRate ?? ""}
            onChange={handleAverageRainRateChange}
            required
          />
        </FormControl>
      </Flex>
      <Flex
        direction='row'
        flexWrap='wrap'
        pb={8}
        width='100%'
        justifyContent='space-between'
      >
        <FormControl
          flexBasis={{ base: "100%", md: "48%" }}
          mb={{ base: 4, md: 0 }}
        >
          <FormLabel htmlFor='averageCO2Input'>Average CO2 (ppm)</FormLabel>
          <Input
            id='averageCO2Input'
            type='text'
            placeholder='Average CO2 (ppm)'
            value={averageCO2 ?? ""}
            onChange={handleAverageCO2Change}
            required
          />
        </FormControl>
        <FormControl
          flexBasis={{ base: "100%", md: "48%" }}
          mb={{ base: 4, md: 0 }}
        >
          <FormLabel htmlFor='nContentRainfallInput'>
            N Content Rainfall (ppm)
          </FormLabel>
          <Input
            id='nContentRainfallInput'
            type='text'
            placeholder='N Content Rainfall (ppm)'
            value={nContentRainfall ?? ""}
            onChange={handleNContentRainfallChange}
            required
          />
        </FormControl>
      </Flex>
      {selectedStation === "0" || !selectedStation ? (
        <Flex
          direction='row'
          flexWrap='wrap'
          pb={8}
          width='100%'
          justifyContent='space-between'
        >
          <FormControl
            flexBasis={{ base: "100%", md: "48%" }}
            mb={{ base: 4, md: 0 }}
          >
            <FormLabel htmlFor='stationNameInput'>Station Name</FormLabel>
            <Input
              id='stationNameInput'
              type='text'
              placeholder='Enter Station Name'
              value={stationName}
              onChange={(e) => setStationName(e.target.value)}
              required
            />
          </FormControl>
        </Flex>
      ) : null}
      
      {selectedStation && selectedStation !="0" && (
      <Flex
        direction='row'
        flexWrap='wrap'
        pb={8}
        width='100%'
        justifyContent='space-between'
      >
        <FormControl
          flexBasis={{ base: "100%", md: "48%" }}
          mb={{ base: 4, md: 0 }}
        >
          <FormLabel htmlFor='importSelect'>Import method</FormLabel>

          <Select
            id='importSelect'
            placeholder='Select Import Method'
            size='md'
            onChange={handleImportMethod}
          >
            <option key='1' value='1'>
              Upload
            </option>
            <option key='2' value='2'>
              Download
            </option>
          </Select>
        </FormControl>

        {importType && importType === "1" && (
          <>
            <FormControl
              flexBasis={{ base: "100%", md: "48%" }}
              mb={{ base: 4, md: 0 }}
            >
              <FormLabel htmlFor='uploadWeatherFileInput'>
                Upload Weather File (.csv format)
              </FormLabel>
              <input
                type='file'
                id='uploadWeatherFileInput'
                accept='.csv'
                onChange={handleFileChange}
                ref={fileInputRef}
                style={{ display: "none" }}
              />
              {/* Show Choose File button only if no file is selected */}
              {!selectedFile && (
                <Button variant='primary' onClick={handleClick}>
                  Choose File
                </Button>
              )}
              {/* Show file name and X if file is selected */}
              {selectedFile && (
                <Flex align="center">
                  <Box mr={2}>{selectedFile.name}</Box>
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    aria-label="Remove file"
                  >
                    &#10006;
                  </Button>
                </Flex>
              )}
              {/* Removed the Update button here */}
            </FormControl>
          </>
        )}
        {importType === "2" && (
          <>
            <FormControl
              flexBasis={{ base: "100%", md: "48%" }}
              mb={{ base: 4, md: 0 }}
            >
              <FormLabel htmlFor='downloadWeatherDataInput'>
                Download Weather Data (last 5 years)
              </FormLabel>
              <Button
                variant='primary'
                onClick={downloadWeatherTable}
                isLoading={isLoading} // Show loading spinner on button
                isDisabled={isLoading} // Disable button while loading
              >
                {isLoading ? <Spinner size='xl' color='ui.main' /> : "Download"}
              </Button>
            </FormControl>
          </>
        )}
      </Flex>
)}
      <Flex
        direction='row'
        flexWrap='wrap'
        pb={8}
        width='100%'
        justifyContent='space-between'
      ></Flex>
      <Box>
        <Box width='100%' overflowX='auto'>
          <WeatherTable
            weatherData={weatherData}
            selectedStation={selectedStationData?.stationtype}
            onStationChange={setSelectedStation}
          />
        </Box>
      </Box>


      
      <Flex direction='row' justifyContent='center' pt={8} wrap='wrap'>
      {selectedStation && selectedStation === "0"&& (
        <Button
          variant='primary'
          type='submit'
          mr={4}
          mb={{ base: 4, md: 0 }}
          onClick={handleSubmit}
        >
          Save
        </Button>
            )}
        {selectedStation && selectedStation != "0"&& (
        <Button
          variant='primary'
          type='submit'
          mr={4}
          mb={{ base: 4, md: 0 }}
          onClick={async () => {
            await handleSubmit();
            if (importType === "1" && selectedFile) {
              await handleUpload();
            }
          }}
          isDisabled={importType === "1" && !selectedFile}
        >
          Update
        </Button>
            )}
            {selectedStation&& selectedStation != "0"&&(
        <Button variant='danger' type='submit' onClick={handleDelete}>
          Delete
        </Button>
            )}
      </Flex>
  

      <Outlet />
      <NextPreviousButtons />
      
      <FaqComponent tabname='weather' />
    </Container>
  );
}
