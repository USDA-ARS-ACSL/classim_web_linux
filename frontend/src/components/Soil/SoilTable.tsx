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
} from "@chakra-ui/react";
import { SoilFetchPublicTable } from "../../client";

type EditableTableProps = {
  initialData: SoilFetchPublicTable[];
  // onSave: (updatedData: SoilFetchPublicTable[]) => void;
};

const EditableTable: React.FC<EditableTableProps> = ({
  initialData,
  // onSave,
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

  return (
    <Box>
      <FormLabel htmlFor='soilNameInput'>Soil Properties</FormLabel>
      <Box width='100%'>
        <TableContainer overflowX='auto' whiteSpace='nowrap'>
          <Table size={{ base: "sm", md: "md" }} id='soilProfile'>
            <Thead>
              <Tr>
                <Th>Bottom depth (cm)</Th>
                <Th>OM (%)</Th>
                <Th>NO3 (ppm)</Th>
                <Th>NH4 (ppm)</Th>
                <Th>HNew</Th>
                <Th>Unit Type</Th>
                <Th>Tmpr (C)</Th>
                <Th>Sand (%)</Th>
                <Th>Silt (%)</Th>
                <Th>Clay (%)</Th>
                <Th>BD (g/cm3)</Th>
                <Th>TH33 (cm3/cm3)</Th>
                <Th>TH1500 (cm3/cm3)</Th>
                <Th>kh</Th>
                <Th>kl</Th>
                <Th>km</Th>
                <Th>kn</Th>
                <Th>kd</Th>
                <Th>fe</Th>
                <Th>fh</Th>
                <Th>r0</Th>
                <Th>rL</Th>
                <Th>rm</Th>
                <Th>fa</Th>
                <Th>nq</Th>
                <Th>cs</Th> 
                <Th>th</Th>
                <Th>thr</Th>
                <Th>ths</Th>
                <Th>tha</Th>
                <Th>Alfa</Th>
                <Th>n</Th>
                <Th>Ks</Th>
                <Th>Kk</Th>
                <Th>thk</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.map((item, rowIndex) => (
                <Tr
                  key={rowIndex}
                  onContextMenu={(event) => handleContextMenu(event, rowIndex)}
                  bg={selectedRow === rowIndex ? "gray.200" : "white"}
                >
                  {Object.keys(item).map((key) => (
                    <Td
                      key={key}
                      onClick={() =>
                        handleCellClick(
                          rowIndex,
                          key as keyof SoilFetchPublicTable
                        )
                      }
                    >
                      {key === "initType" ? (
                        <Select
                          value={item[key as keyof SoilFetchPublicTable]}
                          onChange={(e) =>
                            handleInputChange(
                              e,
                              rowIndex,
                              key as keyof SoilFetchPublicTable
                            )
                          }
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
                        editingCell.col === key ? (
                        <Input
                          value={item[key as keyof SoilFetchPublicTable]}
                          onChange={(e) =>
                            handleInputChange(
                              e,
                              rowIndex,
                              key as keyof SoilFetchPublicTable
                            )
                          }
                          onBlur={handleBlur}
                          autoFocus
                        />
                      ) : (
                        item[key as keyof SoilFetchPublicTable]
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
              zIndex: 1,
            }}
          >
            <MenuItem
              onClick={() => handleDuplicateRow(contextMenu.rowIndex, "above")}
            >
              Duplicate Row Above
            </MenuItem>
            <MenuItem
              onClick={() => handleDuplicateRow(contextMenu.rowIndex, "below")}
            >
              Duplicate Row Below
            </MenuItem>
            <MenuItem onClick={() => handleDeleteRow(contextMenu.rowIndex)}>
              Delete Row
            </MenuItem>
          </MenuList>
        </Menu>
      )}
      {/* <Button mt={4} colorScheme="teal" onClick={handleSave}>
        Save Table
      </Button> */}
    </Box>
  );
};

export default EditableTable;
