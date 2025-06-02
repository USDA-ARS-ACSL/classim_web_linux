import { Container, Text, Link } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import {
  GridRatioService,
  Message,
  SiteService,
  SoilFetchPublicTable,
  SoilService,
  TDataCreateGridRatio,
  TDataCreateSoil,
  TDataCreateSoilTable,
  TDataDeleteGridRatio,
  TDataDeleteSoil,
  TDataSoilTableHtmlContent,
  TDataUpdateGridRatio,
  TDataUpdateSoil,
} from "../../client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useCustomToast from "../../hooks/useCustomToast";
import {
  Flex,
  Spinner,
  Box,
  Heading,
  Select,
  Input,
  Button,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import EditableTable from "../../components/Soil/SoilTable";
import NextPreviousButtons from "../../components/Common/NextPreviousButtons";
import FaqComponent from "../../components/Faqs/FaqComponent";

const SoilTab = () => {
  const [selectedSoilOption, setSelectedSoilOption] = useState("");
  const [selectedSiteOption, setSelectedSiteOption] = useState<number | null>(
    null
  );
  const [oGridratioId, setOGridratioId] = useState<number | null>(null);
  const [gridRatio, setGridRatio] = useState<number | null>(null);
  const [soilName, setSoilName] = useState("");
  const [siteName, setSiteName] = useState("");
  const [selectedSoilData, setSelectedSoilData] = useState<any>(null);
  const [soilDeleted, setSoilDeleted] = useState<Message>({ message: "" });
  const { data: soils, isLoading: soilsLoading } = useQuery({
    queryKey: ["readSite"],
    queryFn: () => SoilService.readSoils(),
  });
  console.log(soilDeleted)
  const { data: sites, isLoading: sitesLoading } = useQuery({
    queryKey: ["readSoil"],
    queryFn: () => SiteService.readSites(),
  });

  const { data: grlist } = useQuery({
    queryKey: ["readGr"],
    queryFn: () => GridRatioService.readGridRatioList(),
  });

  const handleSoilSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSoil = event.target.value;
    setSelectedSoilOption(selectedSoil);
    if (selectedSoil === "0") {
      setSoilName("");
      setSelectedSiteOption(null);
      setOGridratioId(null);
    } else {
      // Fetch and set soilName for selected soil
      const selectedSoilData = soils?.data.find(
        (soil) => soil.id === Number(selectedSoil)
      );

      const selectedSiteData = sites?.data.find(
        (site) => site.id === Number(selectedSoilData?.site_id)
      );
      const selectedGR = grlist?.data.find(
        (gr) => gr.gridratio_id === Number(selectedSoilData?.o_gridratio_id)
      );

      setSiteName(selectedSiteData?.sitename || "");
      setSelectedSoilData(selectedSoilData);
      setSoilName(selectedSoilData?.soilname || "");
      setSelectedSiteOption(selectedSoilData?.site_id || null);
      setOGridratioId(selectedGR?.BottomBC || null);
      setGridRatio(selectedGR?.gridratio_id || null);
      handleSiteSelect(selectedSoilData?.site_id.toString() || "");
    }
  };

  const handleBoundaryCondition = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setOGridratioId(value === "" ? null : parseInt(value));
  };

  const [datas, setDatas] = useState<SoilFetchPublicTable[]>([]);
  const handleSiteSelect = (siteId: string) => {
    const selectedSite = Number(siteId);
    setSelectedSiteOption(selectedSite);
    fetchSoilProfile(selectedSite.toString()).then((data) => {
      const mapDataArr: SoilFetchPublicTable[] = [];

      data.forEach((data: any) => {
        const mapData = {
          Bottom_depth: Number(data.Bottom_depth) ?? Number(data.one),
          OM_pct: Number(data.OM_pct),
          NO3: Number(data.NO3) ?? Number(data.three),
          NH4: Number(data.NH4) ?? Number(data.four),
          HnNew: Number(data.HnNew) ?? Number(data.five),
          initType: 1,
          Tmpr: Number(data.Tmpr),
          Sand: Number(data.Sand) ?? Number(data.seven),
          Silt: Number(data.Silt) ,
          Clay: Number(data.Clay) ?? Number(data.nine),
          BD: parseFloat(data.BD) ?? parseFloat(data.default),
          TH33: Number(data.TH33) ?? Number(data.ten),
          TH1500: Number(data.TH1500) ?? Number(data.eleven),
          kh: Number(data.kh) ?? Number(data.twelve),
          kl: Number(data.kl) ?? Number(data.default),
          km: Number(data.km) ?? Number(data.default),
          kn: Number(data.kn) ?? Number(data.default),
          kd: Number(data.kd) ?? Number(data.default),
          fe: Number(data.fe) ?? Number(data.default),
          fh: Number(data.fh) ?? Number(data.default),
          r0: Number(data.r0) ?? Number(data.default),
          rL: Number(data.rL) ?? Number(data.default),
          rm: Number(data.rm) ?? Number(data.default),
          fa: Number(data.fa) ?? Number(data.default),
          nq: Number(data.nq) ?? Number(data.default),
          cs: Number(data.cs) ?? Number(data.default),
          th: Number(data.th) ?? Number(data.default),
          thr: Number(data.thr) ?? Number(data.default),
          ths: Number(data.ths) ?? Number(data.default),
          tha: Number(data.tha) ?? Number(data.default),
          Alfa: Number(data.Alfa) ?? Number(data.default),
          n: Number(data.n) ?? Number(data.default),
          Ks: Number(data.Ks) ?? Number(data.default),
          Kk: Number(data.Kk) ?? Number(data.default),
          thk: Number(data.thk) ?? Number(data.default),
          CO2: parseFloat(data.CO2) ?? parseFloat(data.default),
          O2: parseFloat(data.O2) ?? parseFloat(data.default),
          N2O: parseFloat(data.N2O) ?? parseFloat(data.default),
        };

        mapDataArr.push(mapData);
      });

      setDatas(mapDataArr);
    });
  };

  let responsea: any;
  const fetchSoilProfile = async (selectedSite: string) => {
    if (selectedSite && selectedSite != "") {
      const siteIdTable: TDataSoilTableHtmlContent = {
        o_sid: Number(selectedSite),
      };
      const mapDataArr: SoilFetchPublicTable[] = [];
      const existingEntry = await SoilService.fetchSoilTableBySid(siteIdTable);

      if (existingEntry.data.length > 0) {
        console.log(existingEntry.data,"this is data")
        existingEntry.data.forEach((data: any) => {
          const mapData = {
            Bottom_depth: Number(data.Bottom_depth),
            OM_pct: Number(data.OM_pct),
            NO3: Number(data.NO3),
            initType: Number(data.initType),
            NH4: Number(data.NH4),
            HnNew: Number(data.HnNew),
            Tmpr: Number(data.Tmpr),
            Sand: Number(data.Sand),
            Silt: Number(data.Silt),
            Clay: Number(data.Clay),
            TH33: Number(data.TH33),
            TH1500: Number(data.TH1500),
            kh: Number(data.kh),
            kl: Number(data.kl),
            km: Number(data.km),
            kn: Number(data.kn),
            kd: Number(data.kd),
            fe: Number(data.fe),
            fh: Number(data.fh),
            r0: Number(data.r0),
            rL: Number(data.rL),
            rm: Number(data.rm),
            fa: Number(data.fa),
            nq: Number(data.nq),
            cs: Number(data.cs),
            thr: Number(data.thr),
            th: Number(data.thr),
            ths: Number(data.ths),
            tha: Number(data.tha),
            Alfa: Number(data.Alfa),
            n: Number(data.n),
            Ks: Number(data.Ks),
            Kk: Number(data.Kk),
            thk: Number(data.thk),
            BD: parseFloat(data.BD),
            CO2: parseFloat(data.CO2),
            O2: parseFloat(data.O2),
            N2O: parseFloat(data.N2O),
          };

          mapDataArr.push(mapData);
        });
        responsea = mapDataArr;
      } else {
        const soil_response = await SoilService.fetchSoildata({
          siteId: parseInt(selectedSite),
        });
        soil_response.data.forEach((data: any) => {
          const mapData = {
            Bottom_depth: Number(data.Bottom_depth),
            OM_pct: Number(data.OM_pct),
            NO3: Number(data.NO3),
            NH4: Number(data.NH4),
            HnNew: Number(data.HnNew),
            initType: data.initType,
            Tmpr: Number(data.Tmpr), 
            Sand: Number(data.Sand),
            Silt: Number(data.Silt),
            Clay: Number(data.Clay),
            BD: parseFloat(data.BD),
            TH33: Number(data.TH33),
            TH1500: Number(data.default),
            kh: Number(data.kh),
            kl: Number(data.kl),
            km: Number(data.km),
            kn: Number(data.km),
            kd: Number(data.kd),
            fe: Number(data.fe),
            fh: Number(data.fh),
            r0: Number(data.r0),
            rL: Number(data.rL),
            rm: Number(data.rm),
            fa: Number(data.fa),
            nq: Number(data.nq),
            cs: Number(data.cs),
            th: Number(data.default),
            thr: Number(data.default),
            
            ths: Number(data.default),
            tha: Number(data.default),
            Alfa: Number(data.default),
            n: Number(data.default),
            Ks: Number(data.default),
            Kk: Number(data.default),
            thk: Number(data.default),
            CO2:Number(data.CO2),
            O2:Number(data.O2),
            N2O:Number(data.N2O),
            
          };

          mapDataArr.push(mapData);
        });
        responsea = mapDataArr;
      }
    }
    return responsea;
  };

  const handleSaveData = async (updatedData: SoilFetchPublicTable[]) => {
    try {
      const siteIdTable: TDataSoilTableHtmlContent = {
        o_sid: Number(selectedSiteOption),
      };
      const existingEntry = await SoilService.fetchSoilTableBySid(siteIdTable);

      if (existingEntry.data.length > 0) {
        const deleted = await SoilService.deleteSoilTable(siteIdTable);
        setSoilDeleted(deleted);
      }

      for (const data of updatedData) {
        const updatedSoilTableData: TDataCreateSoilTable = {
          requestBody: {
            o_sid: Number(selectedSiteOption),
            initType: Number(data.initType),
            Bottom_depth: Number(data.Bottom_depth),
            OM_pct: Number(data.OM_pct),
            NO3: Number(data.NO3),
            NH4: Number(data.NH4),
            HnNew: Number(data.HnNew),
            Tmpr: data.Tmpr ? Number(data.Tmpr) : 1,
            Sand: Number(data.Sand),
            Silt: Number(data.Silt),
            Clay: Number(data.Clay),
            TH33: Number(data.TH33),
            TH1500: Number(data.TH1500),
            kh: Number(data.kh),
            kl: Number(data.kl),
            km: Number(data.km),
            kn: Number(data.kn),
            kd: Number(data.kd),
            fe: Number(data.fe),
            fh: Number(data.fh),
            r0: Number(data.r0),
            rL: Number(data.rL),
            rm: Number(data.rm),
            fa: Number(data.fa),
            nq: Number(data.nq),
            cs: Number(data.cs),
            thr: Number(data.thr),
            th: Number(data.thr),
            ths: Number(data.ths),
            tha: Number(data.tha),
            Alfa: Number(data.Alfa),
            n: Number(data.n),
            Ks: Number(data.Ks),
            Kk: Number(data.Kk),
            thk: Number(data.thk),
            BD: parseFloat(data.BD),
            CO2: parseFloat(data.CO2),
            O2: parseFloat(data.O2),
            N2O: parseFloat(data.N2O),
          },
        };
        await SoilService.createSoilTable(updatedSoilTableData);
      }
    } catch (error) {
      console.error("Error saving data:", error);
      showToast("Error", "Failed to save soil properties", "error");
    }
  };

  const handleSave = async () => {
    let errMess = "";
    if (soilName.trim() === "") {
      errMess += "- Please enter a soil name.<br/>";
    }
    if (selectedSiteOption === null) {
      errMess += "- Please select a site option.<br/>";
    }
    if (oGridratioId === null) {
      errMess += "- Please select a soil boundary condition option.<br/>";
    }

    if (errMess !== "") {
      showToast(
        "Validation Error",
        `You might want to check the following information:<br/>${errMess}`,
        "error"
      );
      return;
    }

    try {
      if (selectedSoilOption === "0") {
        // Create new soil
        const gridRationData: TDataCreateGridRatio = {
          requestBody: {
            gridratio_id: null,
            SR1: 1.2,
            SR2: 0.5,
            IR1: 2.1,
            IR2: 3,
            PlantingDepth: 10,
            XLimitRoot: 23,
            BottomBC: oGridratioId,
            GasBCTop: -4,
            GasBCBottom: 1,
          },
        };
        const createGridRatioResponse =
          await GridRatioService.createGridRatio(gridRationData);

        if (createGridRatioResponse) {
          const gridratioId = createGridRatioResponse.gridratio_id;
          const soilData: TDataCreateSoil = {
            requestBody: {
              soilname: soilName,
              site_id: Number(selectedSiteOption),
              o_gridratio_id: Number(gridratioId),
            },
          };
          await SoilService.createSoil(soilData);
          showToast("Success", "Soil profile saved successfully", "success");
          queryClient.invalidateQueries({ queryKey: ["readSoil"] });
        }
      } else {
        // Update existing soil
        const gridRationData: TDataUpdateGridRatio = {
          requestBody: {
            gridratio_id: Number(gridRatio),
            SR1: 1.2,
            SR2: 0.5,
            IR1: 2.1,
            IR2: 3,
            PlantingDepth: 10,
            XLimitRoot: 23,
            BottomBC: oGridratioId,
            GasBCTop: -4,
            GasBCBottom: 1,
          },
          gridratio_id: Number(gridRatio),
        };

        await GridRatioService.updateGridRatio(gridRationData);

        const updatedSoil: TDataUpdateSoil = {
          requestBody: {
            soilname: soilName,
            site_id: Number(selectedSiteOption),
            o_gridratio_id: Number(gridRatio),
          },
          id: Number(selectedSoilOption),
        };
        await SoilService.updateSoil(updatedSoil);
        showToast("Success", "Soil profile updated successfully", "success");
      }
    } catch (error:any) {
      const errDetail = (error as any).body?.detail
      showToast("Something went wrong.", `${errDetail}`, "error")
    }

    const storedData = localStorage.getItem("soil_table");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        if (Array.isArray(parsedData)) {
          handleSaveData(parsedData);
        } else {
          console.error("Stored data is not an array");
        }
      } catch (error) {
        console.error("Error parsing stored data", error);
      }
    }
  };

  const showToast = useCustomToast();

  const queryClient = useQueryClient();
  const handleDelete = async () => {
    if (!selectedSoilOption || selectedSoilOption === "0") {
      showToast("Error", "No soil selected for deletion.", "error");
      return;
    }
    if (selectedSoilData && selectedSoilData.id) {
      try {
        const data: TDataDeleteSoil = {
          id: parseInt(selectedSoilData.id, 10),
        };
        const response = await SoilService.deleteSoil(data);

        const datagr: TDataDeleteGridRatio = {
          gridratio_id: Number(gridRatio),
        };
        const delResponse = await GridRatioService.deleteGridRatio(datagr);
        if (response && delResponse) {
          showToast(
            "Successfully",
            "The soil was deleted successfully.",
            "success"
          );
          // Reset fields after deletion
          setSoilName("");
          setSelectedSiteOption(null);
          setOGridratioId(null);

          queryClient.invalidateQueries({
            queryKey: ["readSoil"],
          });
        } else {
          showToast("Failed!", "Failed to delete soil.", "error");
        }
      } catch (error) {
        // showToast("Error!", `Error occurred: ${error.message}`, "error");
      }
    } else {
      showToast(
        "Error!",
        "Selected soil data or its ID is undefined.",
        "error"
      );
    }
  };

  // Effect to set initial soilName when selectedSoilOption changes
  useEffect(() => {
    if (selectedSoilOption !== "0") {
      const selectedSoilData = soils?.data.find(
        (soil) => soil.id === Number(selectedSoilOption)
      );
      setSoilName(selectedSoilData?.soilname || "");
    }
  }, [selectedSoilOption, soils]);

  return (
    <Container maxW='full' mt={[4, 5]} width='80%'>
      <Heading size='lg' textAlign={{ base: "center", md: "left" }} pb={4}>
        Soil Tab
      </Heading>
      <Text>
        This tab allows to add a new soil profile or modify an existing one.
        Soil profile is linked with an existing site. If the soil you are
        creating is located within the USA territory, data will be retrieved
        from the Natural Resources Conservation Services (NRCS) for the most
        prominent soil profile for that location. You will have the ability to
        edit or delete the values. A soil profile can have one or more layers,
        to add or delete a soil layer, select the entire row and right click. It
        will open a dialog box with simple instructions. Once changes are done,
        please make sure to press the UPDATE/SAVE button.
      </Text>

      <Link color='blue' href='https://youtu.be/JoaKV-NHcA0/' isExternal>
        Click here to watch the video tutorial for existing soil.
      </Link>
      <br />
      <Link color='blue' href='https://youtu.be/a6B1Ud4LGhk/' isExternal>
        Click here to watch the video tutorial to add new soil.
      </Link>

      <Box py={12} width='100%'>
        <Flex
          direction={{ base: "column", md: "row" }}
          justify='space-between'
          alignItems='center'
          pb={8}
          width='100%'
        >
          <FormControl flex='1' mr={{ base: 0, md: 4 }} mb={{ base: 4, md: 0 }}>
            <FormLabel htmlFor='soilSelect'>Soil</FormLabel>

            {soilsLoading ? (
              <Spinner size='xl' color='ui.main' />
            ) : (
              <Select
                id='soilSelect'
                placeholder='Select Soil'
                size='md'
                onChange={handleSoilSelect}
                value={selectedSoilOption}
              >
                <option value='0'>Create New Soil</option>
                {soils?.data.map((eachSoil) => (
                  <option key={eachSoil.id} value={eachSoil.id}>
                    {eachSoil.soilname}
                  </option>
                ))}
              </Select>
            )}
          </FormControl>
          <FormControl flex='1' mr={{ base: 0, md: 4 }} mb={{ base: 4, md: 0 }}>
            <FormLabel htmlFor='siteSelect'>Site</FormLabel>
            {sitesLoading ? (
              <Spinner size='xl' color='ui.main' />
            ) : selectedSoilOption === "0" ? (
              <Select
                id='siteSelect'
                placeholder='Select Site'
                size='md'
                onChange={(e) => handleSiteSelect(e.target.value)}
                value={selectedSiteOption ?? ""}
              >
                {sites?.data.map((eachSite) => (
                  <option key={eachSite.id} value={eachSite.id}>
                    {eachSite.sitename}
                  </option>
                ))}
              </Select>
            ) : (
              <Input
                id='siteInput'
                type='text'
                value={siteName ?? ""}
                isReadOnly
              />
            )}
          </FormControl>

          <FormControl flex='1'>
            <FormLabel htmlFor='boundarySelect'>
              Soil Boundary Condition
            </FormLabel>
            <Select
              id='boundarySelect'
              placeholder='Select Boundary Condition'
              size='md'
              onChange={handleBoundaryCondition}
              value={oGridratioId ?? ""}
            >
              <option value='-7'>Unsaturated Drainage</option>
              <option value='1'>Water Table</option>
              <option value='-2'>Seepage</option>
            </Select>
          </FormControl>
        </Flex>

        {selectedSiteOption && selectedSiteOption !== null && (
          <EditableTable initialData={datas} /*onSave={handleSaveData}*/ />
        )}

        <Flex direction={{ base: "column", md: "row" }} pb={8} width='100%'>
          <FormControl flex='1' mr={{ base: 0, md: 4 }} mb={{ base: 4, md: 0 }}>
            <FormLabel htmlFor='soilNameInput'>Soil Name</FormLabel>
            <Input
              id='soilNameInput'
              type='text'
              placeholder='Enter Soil Name'
              value={soilName}
              onChange={(e) => setSoilName(e.target.value)} // Allow manual input as well
              required
              isDisabled={selectedSoilOption !== "0"}
            />
          </FormControl>
        </Flex>
        <Flex direction='row' justify='center' pt={8}>
          {selectedSoilOption === "0" ? (
            <Button onClick={handleSave} colorScheme='teal'>
              Save Changes
            </Button>
          ) : (
            <>
              <Button
                variant='primary'
                type='submit'
                mr={{ base: 0, md: 4 }}
                onClick={handleSave}
              >
                Update
              </Button>
              <Button variant='danger' type='submit' onClick={handleDelete}>
                Delete
              </Button>
            </>
          )}
        </Flex>
      </Box>
      <NextPreviousButtons />
      <FaqComponent tabname='soil' />
    </Container>
    
  );
};

export const Route = createFileRoute("/_layout/soil")({
  component: SoilTab,
});
