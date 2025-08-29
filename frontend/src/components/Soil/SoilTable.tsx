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
} from "@chakra-ui/react";
import { SoilFetchPublicTable } from "../../client";

type EditableTableProps = {
  initialData: SoilFetchPublicTable[];
  onSave?: (updatedData: SoilFetchPublicTable[]) => void;
};

// Columns to display in the soil table with their display names
const columnConfig = [
  { key: "Bottom_depth", label: "Bottom depth (cm)" },
  { key: "OM_pct", label: "OM (%)" },
  { key: "NO3", label: "NO3 (ppm)" },
  { key: "NH4", label: "NH4 (ppm)" },
  { key: "HnNew", label: "HNew" },
  { key: "initType", label: "Unit Type" },
  { key: "Tmpr", label: "Tmpr (C)" },
  { key: "Sand", label: "Sand (%)" },
  { key: "Silt", label: "Silt (%)" },
  { key: "Clay", label: "Clay (%)" },
  { key: "BD", label: "BD (g/cm3)" },
  { key: "TH33", label: "TH33 (cm3/cm3)" },
  { key: "TH1500", label: "TH1500 (cm3/cm3)" },
];

// Advanced columns shown when expanded
const advancedColumns = [
  { key: "th", label: "th" },
  { key: "thr", label: "thr" },
  { key: "ths", label: "ths" },
  { key: "tha", label: "tha" },
  { key: "Alfa", label: "Alfa" },
  { key: "n", label: "n" },
  { key: "Ks", label: "Ks" },
  { key: "Kk", label: "Kk" },
  { key: "thk", label: "thk" },
  { key: "kl", label: "kl" },
  { key: "kh", label: "kh" },
  { key: "km", label: "km" },
  { key: "kn", label: "kn" },
  { key: "kd", label: "kd" },
  { key: "fe", label: "fe" },
  { key: "fh", label: "fh" },
  { key: "r0", label: "r0" },
  { key: "rL", label: "rL" },
  { key: "rm", label: "rm" },
  { key: "fa", label: "fa" },
  { key: "nq", label: "nq" },
  { key: "cs", label: "cs" },
  { key: "CO2", label: "CO2" },
  { key: "O2", label: "O2" },
  { key: "N2O", label: "N2O" },
];

const EditableTable: React.FC<EditableTableProps> = ({
  initialData,
  onSave,
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

  const handleSave = () => {
    if (onSave) {
      onSave(data);
    }
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
      <FormLabel htmlFor='soilNameInput'>Soil Properties</FormLabel>
      <Box width='100%' mb={4}>
        <Button 
          onClick={() => setShowAdvanced(!showAdvanced)} 
          size="sm" 
          colorScheme="blue"
          mb={2}
        >
          {showAdvanced ? "Show Basic Columns" : "Show All Columns"}
        </Button>
        <Button 
          onClick={handleAddRow} 
          size="sm" 
          colorScheme="green" 
          ml={2}
          mb={2}
        >
          Add New Layer
        </Button>
        {onSave && (
          <Button 
            onClick={handleSave} 
            size="sm" 
            colorScheme="teal" 
            ml={2}
            mb={2}
          >
            Save Table Data
          </Button>
        )}
      </Box>
      <Box width='100%'>
        <TableContainer overflowX='auto' whiteSpace='nowrap' maxHeight="500px" overflowY="auto">
          <Table size={{ base: "sm", md: "md" }} id='soilProfile' variant="striped">
            <Thead position="sticky" top={0} bg="white" zIndex={1}>
              <Tr>
                {visibleColumns.map((col) => (
                  <Th key={col.key}>
                    <Tooltip label={col.label} placement="top">
                      {col.label}
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
          </MenuList>
        </Menu>
      )}
    </Box>
  );
};

export default EditableTable;