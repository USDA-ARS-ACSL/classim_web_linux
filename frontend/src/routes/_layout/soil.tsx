import React, { useState, useEffect } from "react";
import {
  Box,
  FormLabel,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Input,
  Select,
  Menu,  
  MenuItem,
  MenuList,
  Button,
  useColorModeValue,
  Tooltip,
  Container,
  Text,
  Link,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  useDisclosure,
  Switch,
  FormControl,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import {
  GridRatioService,
  SiteService,
  SoilFetchPublicTable,
  SoilService,
  TDataCreateGridRatio,
  TDataCreateSoil,
  TDataCreateSoilTable,
  TDataUpdateGridRatio,
  TDataUpdateSoil,
} from "../../client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useCustomToast from "../../hooks/useCustomToast";
import {
  Flex,
  Spinner,
  Heading,
} from "@chakra-ui/react";
import { useRef } from "react";
import NextPreviousButtons from "../../components/Common/NextPreviousButtons";
import FaqComponent from "../../components/Faqs/FaqComponent";

type EditableTableProps = {
  initialData: SoilFetchPublicTable[];
  onSave?: (updatedData: SoilFetchPublicTable[]) => void;
};

// Update the columnConfig and advancedColumns arrays with display and tooltip information
const columnConfig = [
  { key: "Bottom_depth", label: "Bottom\ndepth (cm)", tooltip: "Bottom depth in centimeters" },
  { key: "OM_pct", label: "OM (%)", tooltip: "Organic Matter percentage" },
  { key: "NO3", label: "NO3 (ppm)", tooltip: "Nitrate concentration in parts per million" },
  { key: "NH4", label: "NH4 (ppm)", tooltip: "Ammonium concentration in parts per million" },
  { key: "HnNew", label: "HNew", tooltip: "Initial pressure head" },
  { key: "initType", label: "Unit Type", tooltip: "m: matric potential, w: water content" },
  { key: "Tmpr", label: "Tmpr (C)", tooltip: "Temperature in Celsius" },
  { key: "Sand", label: "Sand (%)", tooltip: "Sand percentage" },
  { key: "Silt", label: "Silt (%)", tooltip: "Silt percentage" },
  { key: "Clay", label: "Clay (%)", tooltip: "Clay percentage" },
  { key: "BD", label: "BD\n(g/cm3)", tooltip: "Bulk Density in g/cm³" },
  { key: "TH33", label: "TH33\n(cm3/cm3)", tooltip: "Water content at -33 kPa" },
  { key: "TH1500", label: "TH1500\n(cm3/cm3)", tooltip: "Water content at -1500 kPa" },
];

// Advanced columns shown when expanded
const advancedColumns = [
  { key: "th", label: "th", tooltip: "Initial water content" },
  { key: "thr", label: "thr", tooltip: "Residual water content" },
  { key: "ths", label: "ths", tooltip: "Saturated water content" },
  { key: "tha", label: "tha", tooltip: "Parameter in water retention function" },
  { key: "Alfa", label: "Alfa", tooltip: "Parameter in water retention function" },
  { key: "n", label: "n", tooltip: "Parameter in water retention function" },
  { key: "Ks", label: "Ks", tooltip: "Saturated hydraulic conductivity" },
  { key: "Kk", label: "Kk", tooltip: "Unsaturated hydraulic conductivity parameter" },
  { key: "thk", label: "thk", tooltip: "Water content parameter" },
  { key: "kl", label: "kl", tooltip: "Longitudinal dispersivity" },
  { key: "kh", label: "kh", tooltip: "Transverse dispersivity" },
  { key: "km", label: "km", tooltip: "Molecular diffusion coefficient" },
  { key: "kn", label: "kn", tooltip: "Kinematic dispersivity" },
  { key: "kd", label: "kd", tooltip: "Distribution coefficient" },
  { key: "fe", label: "fe", tooltip: "Fraction of exchange sites" },
  { key: "fh", label: "fh", tooltip: "Fraction of kinetic sites" },
  { key: "r0", label: "r0", tooltip: "Rate coefficient for zero-order reactions" },
  { key: "rL", label: "rL", tooltip: "Rate coefficient for first-order reactions" },
  { key: "rm", label: "rm", tooltip: "Rate coefficient for microbial reactions" },
  { key: "fa", label: "fa", tooltip: "Parameter in water retention function" },
  { key: "nq", label: "nq", tooltip: "Parameter in water retention function" },
  { key: "cs", label: "cs", tooltip: "Specific storage coefficient" },
  { key: "CO2", label: "CO2", tooltip: "Carbon dioxide concentration" },
  { key: "O2", label: "O2", tooltip: "Oxygen concentration" },
  { key: "N2O", label: "N2O", tooltip: "Nitrous oxide concentration" },
];

const EditableTable: React.FC<EditableTableProps> = ({
  initialData,
}) => {
  const [data, setData] = useState<SoilFetchPublicTable[]>(initialData);
  const [editingCell, setEditingCell] = useState<{
    row: number;
    col: keyof SoilFetchPublicTable;
  } | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    rowIndex: number;
  } | null>(null);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const visibleColumns = showAdvanced 
    ? [...columnConfig, ...advancedColumns] 
    : columnConfig;
  
  const highlightBg = useColorModeValue("gray.100", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.600");

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  useEffect(() => {
    localStorage.setItem("soil_table", JSON.stringify(data));
  }, [data]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    rowIndex: number,
    key: keyof SoilFetchPublicTable
  ) => {
    const value = e.target.value;
    const updatedData = data.map((row, index) =>
      index === rowIndex ? { ...row, [key]: value } : row
    );
    setData(updatedData);
  };

  const handleCellClick = (
    rowIndex: number,
    key: keyof SoilFetchPublicTable
  ) => {
    setEditingCell({ row: rowIndex, col: key });
  };

  const handleBlur = () => {
    setEditingCell(null);
  };

  const handleContextMenu = (event: React.MouseEvent, rowIndex: number) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, rowIndex });
    setSelectedRow(rowIndex);
  };

  const handleAddRow = () => {
    // Add a new row with default values from the last row or set defaults
    const lastRow = data.length > 0 ? {...data[data.length-1]} : null;
    const newRow: SoilFetchPublicTable = lastRow ? {
      ...lastRow,
      Bottom_depth: Number(lastRow.Bottom_depth) + 15, // Increase depth by 15cm
    } : {
      Bottom_depth: 15,
      OM_pct: 0.5,
      NO3: 25,
      NH4: 4,
      HnNew: -200,
      initType: 1,
      Tmpr: 25,
      Sand: 33,
      Silt: 33,
      Clay: 33,
      BD: 1.3,
      TH33: 0.3,
      TH1500: 0.1,
      kl: -0.035,
      kh: 0.00007,
      km: 0.07,
      kn: 0.2,
      kd: 0.00001,
      fe: 0.6,
      fh: 0.2,
      r0: 10.0,
      rL: 50.0,
      rm: 10.0,
      fa: 0.1,
      nq: 8,
      cs: 0.00001,
      thr: -1,
      th: -1,
      ths: -1,
      tha: -1,
      Alfa: -1,
      n: -1,
      Ks: -1,
      Kk: -1,
      thk: -1,
      CO2: 400,
      O2: 206000,
      N2O: 0,
    };
    
    setData([...data, newRow]);
  };

  const handleDuplicateRow = (
    rowIndex: number,
    position: "above" | "below"
  ) => {
    const rowToDuplicate = data[rowIndex];
    const newData = [...data];
    const insertIndex = position === "above" ? rowIndex : rowIndex + 1;
    newData.splice(insertIndex, 0, { ...rowToDuplicate });
    setData(newData);
    setContextMenu(null);
    setSelectedRow(null);
  };

  const handleDeleteRow = (rowIndex: number) => {
    // Don't allow deleting the last row
    if (data.length <= 1) {
      return;
    }
    
    const newData = data.filter((_, index) => index !== rowIndex);
    setData(newData);
    setContextMenu(null);
    setSelectedRow(null);
  };

  const reverseUnitTypeMapping: { [key: string]: number } = {
    m: 1,
    w: 2,
  };

  const unitTypes = Object.keys(reverseUnitTypeMapping);
  
  // Get unit type display value
  const getUnitTypeDisplay = (value: any): string => {
    if (value === 1) return "m";
    if (value === 2) return "w";
    return value?.toString() || "";
  };

  return (
    <Box>
      <Flex width="100%" justifyContent="flex-end" mb={2} alignItems="center">
        <Text mr={2}>Show All Columns</Text>
        <Switch 
          isChecked={showAdvanced} 
          onChange={() => setShowAdvanced(!showAdvanced)} 
          colorScheme="blue"
        />
      </Flex>
      
      <Box width='100%'>
        <TableContainer overflowX='auto' whiteSpace='nowrap' maxHeight="500px" overflowY="auto">
          <Table size={{ base: "sm", md: "md" }} id='soilProfile' variant="striped">
            <Thead position="sticky" top={0} bg="white" zIndex={1}>
              <Tr>
                {visibleColumns.map((col) => (
                  <Th key={col.key} p={2} maxW="80px">
                    <Tooltip label={col.tooltip} placement="top" hasArrow>
                      <Box whiteSpace="pre-line" fontSize="xs" textAlign="center">
                        {col.label}
                      </Box>
                    </Tooltip>
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {data.map((item, rowIndex) => (
                <Tr
                  key={rowIndex}
                  onContextMenu={(event) => handleContextMenu(event, rowIndex)}
                  bg={selectedRow === rowIndex ? highlightBg : "transparent"}
                  _hover={{ bg: hoverBg }}
                >
                  {visibleColumns.map((col) => (
                    <Td
                      key={`${rowIndex}-${col.key}`}
                      onClick={() =>
                        handleCellClick(
                          rowIndex,
                          col.key as keyof SoilFetchPublicTable
                        )
                      }
                      p={2}
                    >
                      {col.key === "initType" ? (
                        <Select
                          value={item[col.key as keyof SoilFetchPublicTable] || 1}
                          onChange={(e) =>
                            handleInputChange(
                              e,
                              rowIndex,
                              col.key as keyof SoilFetchPublicTable
                            )
                          }
                          size="sm"
                        >
                          {unitTypes.map((unit) => (
                            <option
                              key={unit}
                              value={reverseUnitTypeMapping[unit]}
                            >
                              {unit}
                            </option>
                          ))}
                        </Select>
                      ) : editingCell &&
                        editingCell.row === rowIndex &&
                        editingCell.col === col.key ? (
                        <Input
                          value={item[col.key as keyof SoilFetchPublicTable] || ''}
                          onChange={(e) =>
                            handleInputChange(
                              e,
                              rowIndex,
                              col.key as keyof SoilFetchPublicTable
                            )
                          }
                          onBlur={handleBlur}
                          autoFocus
                          size="sm"
                          width="100%"
                        />
                      ) : col.key === "initType" ? (
                        getUnitTypeDisplay(item[col.key as keyof SoilFetchPublicTable])
                      ) : (
                        item[col.key as keyof SoilFetchPublicTable]
                      )}
                    </Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
      {contextMenu && (
        <Menu isOpen={true} onClose={() => setContextMenu(null)}>
          <MenuList
            style={{
              position: "absolute",
              top: contextMenu.y,
              left: contextMenu.x,
              zIndex: 10,
            }}
          >
            <MenuItem
              onClick={() => handleDuplicateRow(contextMenu.rowIndex, "above")}
            >
              Duplicate Layer Above
            </MenuItem>
            <MenuItem
              onClick={() => handleDuplicateRow(contextMenu.rowIndex, "below")}
            >
              Duplicate Layer Below
            </MenuItem>
            <MenuItem onClick={() => handleDeleteRow(contextMenu.rowIndex)}>
              Delete Layer
            </MenuItem>
            <MenuItem onClick={handleAddRow}>
              Add New Layer
            </MenuItem>
          </MenuList>
        </Menu>
      )}
    </Box>
  );
};

const SoilTab = () => {
  const [selectedSoilOption, setSelectedSoilOption] = useState("");
  const [selectedSiteOption, setSelectedSiteOption] = useState<number | null>(null);
  const [oGridratioId, setOGridratioId] = useState<number | null>(-7); // Default to Unsaturated Drainage
  const [gridRatio, setGridRatio] = useState<number | null>(null);
  const [soilName, setSoilName] = useState("");
  const [siteName, setSiteName] = useState("");
  const [selectedSoilData, setSelectedSoilData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tableData, setTableData] = useState<SoilFetchPublicTable[]>([]);
  const [showTable, setShowTable] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const showToast = useCustomToast();
  const queryClient = useQueryClient();

  // Query for existing soils, sites, and grid ratios
  const { data: soils, isLoading: soilsLoading } = useQuery({
    queryKey: ["readSoils"],
    queryFn: () => SoilService.readSoils(),
  });

  const { data: sites, isLoading: sitesLoading } = useQuery({
    queryKey: ["readSites"],
    queryFn: () => SiteService.readSites(),
  });

  const { data: grlist } = useQuery({
    queryKey: ["readGr"],
    queryFn: () => GridRatioService.readGridRatioList(),
  });

  // Reset form to initial state
  const resetForm = () => {
    setSelectedSoilOption("");
    setSoilName("");
    setSelectedSiteOption(null);
    setSiteName("");
    setOGridratioId(-7);
    setGridRatio(null);
    setSelectedSoilData(null);
    setTableData([]);
    setShowTable(false);
    // Clear localStorage data
    localStorage.removeItem("soil_table");
  };

  // Handle soil selection from dropdown
  const handleSoilSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSoil = event.target.value;
    setSelectedSoilOption(selectedSoil);
    
    if (selectedSoil === "0") {
      // Reset form for new soil creation
      setSoilName("");
      setSelectedSiteOption(null);
      setSiteName("");
      setOGridratioId(-7); // Default to Unsaturated Drainage
      setTableData([]);
      setShowTable(false);
    } else if (selectedSoil === "") {
      // Reset form completely
      resetForm();
    } else {
      // Populate form with selected soil data
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
      setOGridratioId(selectedGR?.BottomBC || -7);
      setGridRatio(selectedGR?.gridratio_id || null);
      
      // Load soil data table
      fetchSoilTableData(selectedSoilData?.id);
    }
  };

  // Handle boundary condition selection
  const handleBoundaryCondition = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setOGridratioId(value === "" ? -7 : parseInt(value));
  };

  // Handle site selection
  const handleSiteSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const siteId = e.target.value;
    if (!siteId) return;
    
    setSelectedSiteOption(Number(siteId));
    
    // Find site name
    const siteData = sites?.data.find(site => site.id === Number(siteId));
    if (siteData) {
      setSiteName(siteData.sitename);
    }
    
    // Reset table data when site changes
    setTableData([]);
    
    // Automatically fetch NRCS data when site is selected for new soil
    if (selectedSoilOption === "0") {
      fetchNRCSData(Number(siteId));
    }
  };

  // Fetch NRCS soil data
  const fetchNRCSData = async (siteId: number) => {
    if (!siteId) {
      showToast("Error", "Please select a site first", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await SoilService.fetchSoildata({
        siteId: siteId,
      });
      
      const mapDataArr: SoilFetchPublicTable[] = [];
      response.data.forEach((data: any) => {
        const mapData = {
          Bottom_depth: Number(data.Bottom_depth),
          OM_pct: Number(data.OM_pct),
          NO3: Number(data.NO3),
          NH4: Number(data.NH4),
          HnNew: Number(data.HnNew),
          initType: data.initType === "m" ? 1 : (data.initType === "w" ? 2 : 1),
          Tmpr: Number(data.Tmpr), 
          Sand: Number(data.Sand),
          Silt: Number(data.Silt),
          Clay: Number(data.Clay),
          BD: parseFloat(data.BD),
          TH33: Number(data.TH33),
          TH1500: Number(data.TH1500 || -1),
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
          th: Number(data.th || -1),
          thr: Number(data.thr || -1),
          ths: Number(data.ths || -1),
          tha: Number(data.tha || -1),
          Alfa: Number(data.Alfa || -1),
          n: Number(data.n || -1),
          Ks: Number(data.Ks || -1),
          Kk: Number(data.Kk || -1),
          thk: Number(data.thk || -1),
          CO2: Number(data.CO2),
          O2: Number(data.O2),
          N2O: Number(data.N2O),
        };
        mapDataArr.push(mapData);
      });
      
      setTableData(mapDataArr);
      setShowTable(true);
      showToast("Success", "NRCS soil data loaded successfully", "success");
    } catch (error) {
      console.error("Error fetching NRCS data:", error);
      showToast("Error", "Failed to fetch NRCS soil data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch soil table data for an existing soil
  const fetchSoilTableData = async (soilId: number | undefined) => {
    if (!soilId) return;
    
    setIsLoading(true);
    try {
      const response = await SoilService.fetchSoilTableBySid({ 
        o_sid: soilId 
      });
      
      if (response.data.length > 0) {
        const formattedData = response.data.map(item => ({
          Bottom_depth: Number(item.Bottom_depth),
          OM_pct: Number(item.OM_pct),
          NO3: Number(item.NO3),
          NH4: Number(item.NH4),
          HnNew: Number(item.HnNew),
          initType: Number(item.initType),
          Tmpr: Number(item.Tmpr),
          Sand: Number(item.Sand),
          Silt: Number(item.Silt),
          Clay: Number(item.Clay),
          BD: parseFloat(item.BD.toString()),
          TH33: Number(item.TH33),
          TH1500: Number(item.TH1500),
          kh: Number(item.kh),
          kl: Number(item.kl),
          km: Number(item.km),
          kn: Number(item.kn),
          kd: Number(item.kd),
          fe: Number(item.fe),
          fh: Number(item.fh),
          r0: Number(item.r0),
          rL: Number(item.rL),
          rm: Number(item.rm),
          fa: Number(item.fa),
          nq: Number(item.nq),
          cs: Number(item.cs),
          th: Number(item.th),
          thr: Number(item.thr),
          ths: Number(item.ths),
          tha: Number(item.tha),
          Alfa: Number(item.Alfa),
          n: Number(item.n),
          Ks: Number(item.Ks),
          Kk: Number(item.Kk),
          thk: Number(item.thk),
          CO2: parseFloat(item.CO2.toString()),
          O2: parseFloat(item.O2.toString()),
          N2O: parseFloat(item.N2O.toString()),
        }));
        
        setTableData(formattedData);
        setShowTable(true);
      } else {
        setShowTable(false);
      }
    } catch (error) {
      console.error("Error fetching soil table data:", error);
      setShowTable(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle saving soil and soil table data
  const handleSave = async () => {
    // Validation
    if (soilName.trim() === "") {
      showToast("Error", "Please enter a soil name", "error");
      return;
    }
    
    if (selectedSiteOption === null) {
      showToast("Error", "Please select a site", "error");
      return;
    }
    
    if (oGridratioId === null) {
      showToast("Error", "Please select a soil boundary condition", "error");
      return;
    }

    setIsLoading(true);
    try {
      let soilId: number | null = null;
      
      if (selectedSoilOption === "0") {
        // Create new soil
        // Create grid ratio
        const gridRatioData: TDataCreateGridRatio = {
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
        
        const gridRatioResponse = await GridRatioService.createGridRatio(gridRatioData);
        if (!gridRatioResponse || !gridRatioResponse.gridratio_id) {
          throw new Error("Failed to create grid ratio");
        }
        
        // Create soil
        const soilData: TDataCreateSoil = {
          requestBody: {
            soilname: soilName,
            site_id: Number(selectedSiteOption),
            o_gridratio_id: Number(gridRatioResponse.gridratio_id),
          },
        };
        
        const soilResponse = await SoilService.createSoil(soilData);
        soilId = soilResponse.id;
      } else {
        // Update existing soil
        soilId = Number(selectedSoilOption);
        
        if (gridRatio) {
          const gridRatioData: TDataUpdateGridRatio = {
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
          
          await GridRatioService.updateGridRatio(gridRatioData);
        }
        
        const updatedSoil: TDataUpdateSoil = {
          requestBody: {
            soilname: soilName,
            site_id: Number(selectedSiteOption),
            o_gridratio_id: Number(gridRatio),
          },
          id: Number(selectedSoilOption),
        };
        
        await SoilService.updateSoil(updatedSoil);
      }
      
      // Save soil table data
      if (soilId) {
        // Get table data from localStorage
        const storedData = localStorage.getItem("soil_table");
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            // Delete existing soil data
            await SoilService.deleteSoilTable({ o_sid: soilId });
            
            // Create new soil data entries
            for (const data of parsedData) {
              const soilTableData: TDataCreateSoilTable = {
                requestBody: {
                  o_sid: soilId,
                  initType: Number(data.initType) || 1,
                  Bottom_depth: Number(data.Bottom_depth),
                  OM_pct: Number(data.OM_pct),
                  NO3: Number(data.NO3),
                  NH4: Number(data.NH4),
                  HnNew: Number(data.HnNew),
                  Tmpr: Number(data.Tmpr),
                  Sand: Number(data.Sand),
                  Silt: Number(data.Silt),
                  Clay: Number(data.Clay),
                  TH33: Number(data.TH33),
                  TH1500: Number(data.TH1500 || -1),
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
                  thr: Number(data.thr || -1),
                  th: Number(data.th || -1),
                  ths: Number(data.ths || -1),
                  tha: Number(data.tha || -1),
                  Alfa: Number(data.Alfa || -1),
                  n: Number(data.n || -1),
                  Ks: Number(data.Ks || -1),
                  Kk: Number(data.Kk || -1),
                  thk: Number(data.thk || -1),
                  BD: parseFloat(data.BD?.toString() || "1.3"),
                  CO2: parseFloat(data.CO2?.toString() || "400"),
                  O2: parseFloat(data.O2?.toString() || "206000"),
                  N2O: parseFloat(data.N2O?.toString() || "0"),
                },
              };
              
              await SoilService.createSoilTable(soilTableData);
            }
          } else {
            showToast("Warning", "No soil layer data to save", "error");
          }
        } else {
          showToast("Warning", "No soil layer data to save", "error");
        }
      }
      
      showToast("Success", `Soil ${selectedSoilOption === "0" ? "created" : "updated"} successfully`, "success");
      
      // Refresh data
      await queryClient.invalidateQueries({ queryKey: ["readSoils"] });
      
      if (selectedSoilOption === "0") {
        // For a new soil, reset the form
        resetForm();
      } else if (soilId) {
        // For existing soil, refresh the data
        fetchSoilTableData(soilId);
      }
    } catch (error: any) {
      const errDetail = error.body?.detail || error.message;
      showToast("Error", `Failed to save soil: ${errDetail}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete button click
  const handleDelete = async () => {
    onClose();
    
    if (!selectedSoilOption || selectedSoilOption === "0" || !selectedSoilData?.id) {
      showToast("Error", "No valid soil selected for deletion", "error");
      return;
    }
    
    setIsLoading(true);
    try {
      // Delete soil data first
      await SoilService.deleteSoilTable({ o_sid: Number(selectedSoilData.id) });
      
      // Delete soil record
      await SoilService.deleteSoil({
        id: Number(selectedSoilData.id)
      });
      
      // Delete grid ratio if it exists
      if (gridRatio) {
        await GridRatioService.deleteGridRatio({
          gridratio_id: Number(gridRatio)
        });
      }
      
      // Reset form
      resetForm();
      
      showToast("Success", "Soil deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["readSoils"] });
    } catch (error: any) {
      console.error("Error deleting soil:", error);
      showToast("Error", `Failed to delete soil: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Check if table should be displayed
  const shouldShowTable = () => {
    return showTable && tableData.length > 0 && (
      (selectedSoilOption !== "0" && selectedSoilOption !== "") || 
      (selectedSoilOption === "0" && selectedSiteOption !== null)
    );
  };

  return (
    <Container maxW='full' mt={[4, 5]} width='80%'>
      <Heading size='lg' textAlign={{ base: "center", md: "left" }} pb={4}>
        Soil Management
      </Heading>
      <Text mb={4}>
        This tab allows you to add a new soil profile or modify an existing one.
        Soil profile is linked with an existing site. If the soil you are
        creating is located within the USA territory, data will be retrieved
        from the Natural Resources Conservation Services (NRCS) for the most
        prominent soil profile for that location. You can edit or delete the values.
        A soil profile can have one or more layers.
      </Text>

      <Link color='blue' href='https://youtu.be/JoaKV-NHcA0/' isExternal>
        Click here to watch the video tutorial for existing soil.
      </Link>
      <br />
      <Link color='blue' href='https://youtu.be/a6B1Ud4LGhk/' isExternal mb={4}>
        Click here to watch the video tutorial to add new soil.
      </Link>

      {/* Form using Grid layout similar to site.tsx */}
      <Grid
        templateColumns={["1fr", "1fr", "repeat(3, 1fr)"]}
        gap={6}
        mb={6}
        mt={8}
      >
        <GridItem>
          <FormControl>
            <FormLabel>Soil</FormLabel>
            {soilsLoading ? (
              <Spinner size='sm' color='blue.500' />
            ) : (
              <Select
                id='soilSelect'
                placeholder='Select Soil'
                onChange={handleSoilSelect}
                value={selectedSoilOption}
              >
                <option value='0'>Create New Soil</option>
                {soils?.data.map((soil) => (
                  <option key={soil.id} value={soil.id}>
                    {soil.soilname}
                  </option>
                ))}
              </Select>
            )}
          </FormControl>
        </GridItem>

        <GridItem>
          <FormControl>
            <FormLabel>Site</FormLabel>
            {sitesLoading ? (
              <Spinner size='sm' color='blue.500' />
            ) : selectedSoilOption !== "0" && selectedSoilOption !== "" ? (
              <Input 
                id='siteNameInput'
                value={siteName}
                isReadOnly
              />
            ) : (
              <Select
                id='siteSelect'
                placeholder='Select Site'
                onChange={handleSiteSelect}
                value={selectedSiteOption || ""}
              >
                {sites?.data.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.sitename}
                  </option>
                ))}
              </Select>
            )}
          </FormControl>
        </GridItem>

        <GridItem>
          <FormControl>
            <FormLabel>Soil Boundary Condition</FormLabel>
            <Select
              id='boundarySelect'
              onChange={handleBoundaryCondition}
              value={oGridratioId?.toString() || ""}
            >
              <option value='-7'>Unsaturated Drainage</option>
              <option value='1'>Water Table</option>
              <option value='-2'>Seepage</option>
            </Select>
          </FormControl>
        </GridItem>

        <GridItem>
          <FormControl>
            <FormLabel>Soil Name</FormLabel>
            <Input
              id='soilNameInput'
              placeholder='Enter soil name'
              value={soilName}
              onChange={(e) => setSoilName(e.target.value)}
              isDisabled={selectedSoilOption !== "0" && selectedSoilOption !== ""}
            />
          </FormControl>
        </GridItem>
      </Grid>

      {/* Soil Table - Only show when needed */}
      {shouldShowTable() && (
        <Box mt={6}>
          {isLoading ? (
            <Flex justify="center" p={8}>
              <Spinner size="xl" />
            </Flex>
          ) : (
            <EditableTable 
              initialData={tableData} 
              onSave={undefined} 
            />
          )}
        </Box>
      )}

      {/* Action Buttons */}
      <Flex justify="center" mt={6} gap={4}>
        <Button 
          colorScheme="teal" 
          onClick={handleSave}
          isLoading={isLoading}
          isDisabled={selectedSoilOption === "" && !soilName}
        >
          {selectedSoilOption === "0" ? "Create Soil" : "Update Soil"}
        </Button>
        
        {selectedSoilOption !== "0" && selectedSoilOption !== "" && (
          <Button 
            colorScheme="red" 
            onClick={onOpen}
            isLoading={isLoading}
          >
            Delete Soil
          </Button>
        )}
      </Flex>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Soil
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this soil? This will delete all soil layer data and cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <NextPreviousButtons />
      <FaqComponent tabname='soil' />
    </Container>
  );
};

export const Route = createFileRoute("/_layout/soil")({
  component: SoilTab,
});