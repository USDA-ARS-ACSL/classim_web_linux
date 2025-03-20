import React, { useState } from 'react';
import {
  Box,
  Button,
  FormLabel,
  Input,
  Select,
  Table,
  Tbody,
  Tr,
  Td,
  useToast,
} from '@chakra-ui/react';
import DatePicker from "react-datepicker";


interface NewOperationFormProps {
    // formType: "NewTreatment" | "DeleteTreatment" | null;
    cropname: string;
    experimentname: string;
    treatmentname: string;   
    operationname: string; 
  }

const OperationEditForm: React.FC<NewOperationFormProps> = ({ cropname, operationname }) => {
  // const [record, setRecord] = useState({});
  // const [formData, setFormData] = useState({});
  const [varietyList] = useState([]);
  // const [selectedDate, setSelectedDate] = useState(new Date());
  const toast = useToast();

//   useEffect(() => {
//     // Mock function to get operation details
//     const readOpDetails = (opId, opName) => ({
//       date: '01/01/2024',
//       variety: 'Variety A',
//       autoIrrig: 1,
//       plantDensity: 10,
//       seedDepth: 5,
//       rowSpacing: 15,
//       seedMass: 20,
//     });

//     const details = readOpDetails(operationDetails.opId, operationname);
//     setRecord(details);
//     setFormData(details);
//     setSelectedDate(new Date(details.date));
//   }, [operationDetails.opId, operationname]);

//   // Mock function to read crop variety list from DB
//   const read_cultivar_DB = (cropName) => {
//     // Replace with actual DB call
//     return ['Variety A', 'Variety B', 'Variety C'];
//   };

//   useEffect(() => {
//     if (cropname !== 'fallow') {
//       const varieties = read_cultivar_DB(cropname);
//       setVarietyList(varieties);
//     }
//   }, [cropname]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSelectChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleDateChange = (date) => {
//     setSelectedDate(date);
//     setFormData((prev) => ({ ...prev, date: date.toISOString() }));
//   };

  const handleSubmit = () => {
    // Handle form submission
    toast({
      title: 'Form Submitted',
      description: 'Your form has been submitted successfully.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  const handleDelete = () => {
    // Handle delete operation
    toast({
      title: 'Operation Deleted',
      description: 'The operation has been deleted successfully.',
      status: 'warning',
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <Box>
      <Table variant="simple">
        <Tbody>
          {operationname !== 'Tillage' && (
            <Tr>
              <Td>
                <FormLabel htmlFor="fertilizerClass">Fertilizer Class</FormLabel>
              </Td>
              <Td>
                <Select
                  id="fertilizerClass"
                  name="fertilizerClass"
                //   value={formData.fertilizerClass || ''}
                //   onChange={handleSelectChange}
                >
                  <option value="">Select Fertilization</option>
                  {/* Populate this list dynamically */}
                  <option value="Manure">Manure</option>
                  <option value="Litter">Litter</option>
                  {/* Add more options */}
                </Select>
              </Td>
            </Tr>
          )}

          <Tr>
            <Td>
              <FormLabel htmlFor="date">Date</FormLabel>
            </Td>
            <Td>
            <DatePicker
                  // selected={formValues.date}
                  // onChange={handleDateChange}
                  dateFormat='MM/dd/yyyy'
                  minDate={new Date(1900, 0, 1)}
                  maxDate={new Date(2200, 11, 31)}
                />
            </Td>
          </Tr>

          {operationname === 'Simulation Start' && cropname !== 'fallow' && (
            <>
              <Tr>
                <Td>
                  <FormLabel htmlFor="cropVariety">Cultivars</FormLabel>
                </Td>
                <Td>
                  <Select
                    id="cropVariety"
                    name="cropVariety"
                    // value={formData.cropVariety || ''}
                    // onChange={handleSelectChange}
                  >
                    {varietyList.map((variety, index) => (
                      <option key={index} value={variety}>
                        {variety}
                      </option>
                    ))}
                  </Select>
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <FormLabel htmlFor="plantDensity">Plant Density (number of plants/m2)</FormLabel>
                </Td>
                <Td>
                  <Input
                    id="plantDensity"
                    name="plantDensity"
                    // value={formData.plantDensity || ''}
                    // onChange={handleInputChange}
                  />
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <FormLabel htmlFor="seedDepth">Seed Depth (cm)</FormLabel>
                </Td>
                <Td>
                  <Input
                    id="seedDepth"
                    name="seedDepth"
                    // value={formData.seedDepth || ''}
                    // onChange={handleInputChange}
                  />
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <FormLabel htmlFor="rowSpacing">Row Spacing (cm)</FormLabel>
                </Td>
                <Td>
                  <Input
                    id="rowSpacing"
                    name="rowSpacing"
                    // value={formData.rowSpacing || ''}
                    // onChange={handleInputChange}
                  />
                </Td>
              </Tr>
              {cropname === 'potato' && (
                <Tr>
                  <Td>
                    <FormLabel htmlFor="seedMass">Seedpiece Mass (g)</FormLabel>
                  </Td>
                  <Td>
                    <Input
                      id="seedMass"
                      name="seedMass"
                    //   value={formData.seedMass || ''}
                    //   onChange={handleInputChange}
                    />
                  </Td>
                </Tr>
              )}
              <Tr>
                <Td>
                  <FormLabel htmlFor="autoIrrig">Auto Irrigation</FormLabel>
                </Td>
                <Td>
                  <Select
                    id="autoIrrig"
                    name="autoIrrig"
                    // value={formData.autoIrrig || ''}
                    // onChange={handleSelectChange}
                  >
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                  </Select>
                </Td>
              </Tr>
            </>
          )}

          {operationname === 'Fertilizer' && (
            <>
              <Tr>
                <Td>
                  <FormLabel htmlFor="fertilizerDepth">Fertilizer Depth (cm)</FormLabel>
                </Td>
                <Td>
                  <Input
                    id="fertilizerDepth"
                    name="fertilizerDepth"
                    // value={formData.fertilizerDepth || ''}
                    // onChange={handleInputChange}
                  />
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <FormLabel htmlFor="quantityC">Carbon (C) (kg/ha)</FormLabel>
                </Td>
                <Td>
                  <Input
                    id="quantityC"
                    name="quantityC"
                    // value={formData.quantityC || ''}
                    // onChange={handleInputChange}
                  />
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <FormLabel htmlFor="quantityN">Nitrogen (N) (kg/ha)</FormLabel>
                </Td>
                <Td>
                  <Input
                    id="quantityN"
                    name="quantityN"
                    // value={formData.quantityN || ''}
                    // onChange={handleInputChange}
                  />
                </Td>
              </Tr>
            </>
          )}

          {operationname === 'Tillage' && (
            <Tr>
              <Td>
                <FormLabel htmlFor="tillageType">Tillage Type</FormLabel>
              </Td>
              <Td>
                <Select
                  id="tillageType"
                  name="tillageType"
                //   value={formData.tillageType || ''}
                //   onChange={handleSelectChange}
                >
                  {/* Populate this list dynamically */}
                  <option value="No tillage">No tillage</option>
                  <option value="Conventional">Conventional</option>
                  {/* Add more options */}
                </Select>
              </Td>
            </Tr>
          )}

          {operationname === 'Plant Growth Regulator' && (
            <>
              <Tr>
                <Td>
                  <FormLabel htmlFor="PGRChemical">Plant Growth Regulator Chemical</FormLabel>
                </Td>
                <Td>
                  <Select
                    id="PGRChemical"
                    name="PGRChemical"
                    // value={formData.PGRChemical || ''}
                    // onChange={handleSelectChange}
                  >
                    {/* Populate this list dynamically */}
                    <option value="Chemical A">Chemical A</option>
                    <option value="Chemical B">Chemical B</option>
                    {/* Add more options */}
                  </Select>
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <FormLabel htmlFor="quantityC">Quantity (kg/ha)</FormLabel>
                </Td>
                <Td>
                  <Input
                    id="quantityC"
                    name="quantityC"
                    // value={formData.quantityC || ''}
                    // onChange={handleInputChange}
                  />
                </Td>
              </Tr>
            </>
          )}

          {operationname === 'Irrigation' && (
            <Tr>
              <Td>
                <FormLabel htmlFor="quantityWater">Quantity Water (mm)</FormLabel>
              </Td>
              <Td>
                <Input
                  id="quantityWater"
                  name="quantityWater"
                //   value={formData.quantityWater || ''}
                //   onChange={handleInputChange}
                />
              </Td>
            </Tr>
          )}

          <Tr>
            <Td colSpan={2}>
              <Button colorScheme="teal" onClick={handleSubmit} mr={3}>
                Update
              </Button>
              <Button colorScheme="red" onClick={handleDelete}>
                Delete
              </Button>
            </Td>
          </Tr>
        </Tbody>
      </Table>
    </Box>
  );
};

export default OperationEditForm;
