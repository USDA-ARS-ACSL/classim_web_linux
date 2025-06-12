import {
  Box,
  Button,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Text,
  VStack,
  HStack,
  Input,
  useToast,
  Link,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
  IconButton,
  ModalBody,
  ModalFooter
  // useBreakpointValue
} from "@chakra-ui/react"
import { HiDotsVertical } from "react-icons/hi";
import { FiTrash2, FiCopy, FiEdit } from "react-icons/fi";
import {
  ApiError,
  // ExperimentsPublic,
  ManagementService,
  // TDataCopy,
  // TDataCreateExperiment,
  // TDataCreateTreatment,
  // TDataDeleteExperiment,
  // TDataDeleteTreatment,
  // TDataExperimentByCropName,
  // TDataExperimentByName,
  // TDataOperation,
  // TDataTreatment,
} from "../../client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
// import { FaPen } from "react-icons/fa"
import { useState, useEffect } from "react"
import { createFileRoute } from "@tanstack/react-router"
import FaqComponent from "../../components/Faqs/FaqComponent";
import SimulationStart from "../../components/Management/SimulationStart";
import { useDisclosure } from "@chakra-ui/react"; // For modal control
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import CustomDatePicker from "../../components/Common/CustomDatePicker";
import OperationUI from "../../components/Common/OperationCreateForm";

const managementApi = {
  getCrops: async () => {
    try {
      const response = await ManagementService.readCrop();
      // Return the full crop objects
      return response.data.map((crop: { id: number; cropname: string | null }) => ({
        id: crop.id,
        cropname: crop.cropname,
      }));
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("API Error:", error.message);
      } else {
        console.error("Unexpected Error:", error);
      }
      return [];
    }
  },
  getExperiments: async (crop: string) => {
    try {
      const response = await ManagementService.getExperimentByCropName({ cropName: crop });
      // Extract experiment names from the response
      return response.data.map((experiment: { exid: number; name: string; crop: string; }) => ({
        id: experiment.exid,
        name: experiment.name,
        crop: experiment.crop,
      }));
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("API Error:", error.message);
      } else {
        console.error("Unexpected Error:", error);
      }
      return [];
    }
  },
  getTreatments: async (exp: number) => {
    try {
      const response = await ManagementService.getTreatmentByExperimentId({ exid: exp });
      return response.data.map((treatment: { tid: number; name: string }) => ({
        id: treatment.tid, // Include the treatment ID
        name: treatment.name, // Include the treatment name
      }));
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("API Error:", error.message);
      } else {
        console.error("Unexpected Error:", error);
      }
      return [];
    }
  },
  getOperations: async (tmt: number) => {
    try {
      const response = await ManagementService.getOperationsByTreatment({ o_t_exid: tmt });
      return response.data.map((operation: { name: string; odate: string, opID: number,}) => ({
        name: operation.name, // Operation name
        date: operation.odate, // Operation date
        op_id: operation.opID, // Operation ID (if available)
      }));
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("API Error:", error.message);
      } else {
        console.error("Unexpected Error:", error);
      }
      return [];
    }
  },
  updateOperations: async (ops: any) => {
    await new Promise((res) => setTimeout(res, 500)) // Simulate delay
    return ops
  },
}

  const handleEditOperation = async (op: any) => {
    try {
      const data = await ManagementService.getFullOperationById(op);
      console.log("Fetched operation data:", data);
      // Add operationType for edit form
    } catch (e) {
      console.error("Error fetching operation data:", e);
    }
  };
const cropManager = () => {

  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure(); // For modal control

  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [selectedExp, setSelectedExp] = useState<number | null>(null);
  const [selectedTmt, setSelectedTmt] = useState<number | null>(null);
  // const [selectedOperation, setSelectedOperation] = useState<string | null>(null);
  const [selectedTmtName, setSelectedTmtName] = useState<string | null>(null);
  const [selectedExpName, setSelectedExpName] = useState<string | null>(null);
  const [newExperimentName, setNewExperimentName] = useState<string>("");
  // const [editableOps, setEditableOps] = useState<Record<string, string>>({})
  // const [addOpType, setAddOpType] = useState<string>("")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [newTreatmentName, setNewTreatmentName] = useState<string>("");
  const [simulationStartData, setSimulationStartData] = useState<{ name: string; date: string; id?: number } | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number | 0, name: string | null, module: string | null }>({
    id: 0,
    name: '',
    module: '',
  });
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [copyTreatmentName, setCopyTreatmentName] = useState<string>("");

  // Add state for editing operation dates
  const [editingOp, setEditingOp] = useState<string | null>(null);
  const [editedDate, setEditedDate] = useState<string>("");
  // const inputRef = useRef<HTMLInputElement>(null);
  const { data: crops } = useQuery({ queryKey: ["crops"], queryFn: managementApi.getCrops })
  const { data: experiments } = useQuery({
    queryKey: ["experiments", selectedCrop],
    queryFn: () => managementApi.getExperiments(selectedCrop!),
    enabled: !!selectedCrop,
  })
  const { data: treatments } = useQuery({
    queryKey: ["treatments", selectedExp],
    queryFn: () => managementApi.getTreatments(selectedExp!),
    enabled: !!selectedExp,
  })
  const { data: operations } = useQuery({
    queryKey: ["operations", selectedTmt],
    queryFn: () => managementApi.getOperations(selectedTmt!),
    enabled: !!selectedTmt,
  })

  const handleNavigation = (callback: () => void) => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm("You have unsaved changes. Do you want to leave?")
      if (!confirmLeave) return
      setHasUnsavedChanges(false)
    }
    callback()
  }
console.log(simulationStartData)
  const handleCropSelection = (crop: string) => {
    setSelectedCrop(crop)
    setSelectedExp(null) // Reset experiment selection
    setSelectedTmt(null) // Reset treatment selection
    setSelectedTmtName("")
  }

  const handleExperimentSelection = (id: number, expName: string ) => {
    setSelectedExp(id);
    setSelectedExpName(expName); // Store the selected experiment name
    setSelectedTmt(null); // Reset treatment selection
    setSelectedTmtName("")
  };

  const handleTreatmentSelection = (tmt: number, name: string) => {
    setSelectedTmt(tmt)
    setSelectedTmtName(name) // Store the selected treatment name
  }

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasUnsavedChanges])

  // Mutation for creating a new experiment
  const createExperimentMutation = useMutation({
    mutationFn: (experimentName: string) =>
      ManagementService.submitExperiment({
        requestBody: {
          exid:selectedExp,
          name: experimentName,
          crop: selectedCrop!,
        },
      }),
    onSuccess: (newExperiment) => {
      // Update the experiments list immediately
      queryClient.setQueryData(["experiments", selectedCrop], (old: any) => [
        ...(old || []),
        {
          id: newExperiment.exid,
          name: newExperiment.name,
          crop: selectedCrop,
        },
      ]);

      toast({
        title: "Experiment Created",
        description: `Experiment "${newExperiment.name}" has been created successfully.`,
        status: "success",
      });

      setNewExperimentName(""); // Clear the input field
    },
    onError: (error: any) => {
      if (error?.body?.detail) {
        toast({
          title: "Error",
          description: error.body.detail || "Failed to create experiment.",
          status: "error",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create experiment.",
          status: "error",
        });
      }
    },
  });

  const handleCreateExperiment = () => {
    if (!newExperimentName) {
      toast({
        title: "Error",
        description: "Experiment name cannot be empty.",
        status: "error",
      });
      return;
    }
    createExperimentMutation.mutate(newExperimentName);
  };

  const createTreatmentMutation = useMutation({
    mutationFn: (treatmentName: string) =>
      ManagementService.checkUpdateTreatment({
        requestBody: {
          tid: selectedTmt,
          name: treatmentName,
          t_exid: selectedExp!,
          expname: selectedExpName!,
          crop: selectedCrop!,
        },
      }),
    onSuccess: (newTreatment) => {
      // Update the treatments list immediately
      queryClient.setQueryData(["treatments", selectedExp], (old: any) => {
        if (Array.isArray(old)) {
          return [
            ...old,
            {
              id: newTreatment.tid, // Ensure the new treatment has an ID
              name: newTreatment.name, // Ensure the new treatment has a name
            },
          ];
        }
        return [
          {
            id: newTreatment.tid,
            name: newTreatment.name,
          },
        ];
      });

      toast({
        title: "Treatment Created",
        description: `Treatment "${newTreatment.name}" has been created successfully.`,
        status: "success",
      });

      setNewTreatmentName(""); // Clear the input field
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create treatment.",
        status: "error",
      });
    },
  });
  // const formatDateForInput = (dateString: string) => {
  //   console.log("Formatting date:", dateString); // Debug the date string
  //   if (!dateString || !dateString.includes("/")) {
  //     console.error("Invalid date string:", dateString);
  //     return ""; // Return an empty string if the date is invalid
  //   }
  
  //   const [month, day, year] = dateString.split("/");
  //   return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`; // Format as YYYY-MM-DD
  // };
  const handleCreateTreatment = () => {
    if (!newTreatmentName) {
      toast({
        title: "Error",
        description: "Treatment name cannot be empty.",
        status: "error",
      });
      return;
    }
    createTreatmentMutation.mutate(newTreatmentName);
  };

  const handleDeleteExperiment = async () => {
    try {
      await ManagementService.deleteExperiment({ exid: deleteTarget.id });
      queryClient.setQueryData(["experiments", selectedCrop], (old: any) =>
        (old || []).filter((exp: any) => exp.id !== deleteTarget.id)
      );
      setIsDeleteModalOpen(false);
      setSelectedExp(null);
      toast({
        title: "Experiment Deleted",
        description: `Experiment "${deleteTarget.name}" has been deleted successfully.`,
        status: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete experiment.",
        status: "error",
      });
    }
  };

  // const handleCopyTreatment = (tmtId: number, tmtName: string) => {
  //   // Create a copy of the treatment with a new name
  //   const newTreatmentName = `${tmtName} (Copy)`;
  //   console.log("Copying treatment:", tmtId, tmtName, "to", newTreatmentName);
  //   // createTreatmentMutation.mutate(newTreatmentName);
  // };
  const handleDeleteTreatment = async () => {
    try {
      await ManagementService.deleteTreatment({ tid: deleteTarget.id });
      queryClient.setQueryData(["treatments", selectedExp], (old: any) =>
        (old || []).filter((treatment: any) => treatment.id !== deleteTarget.id)
      );
      setIsDeleteModalOpen(false);
      setSelectedTmt(null);
      toast({
        title: "Treatment Deleted",
        description: `Treatment "${deleteTarget.name}" has been deleted successfully.`,
        status: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete treatment.",
        status: "error",
      });
    }
  };

  const handleConfirmCopyTreatment = () => {
    if (!copyTreatmentName) {
      toast({
        title: "Error",
        description: "Treatment name cannot be empty.",
        status: "error",
      });
      return;
    }
    createTreatmentMutation.mutate(copyTreatmentName);
    setIsCopyModalOpen(false);
    setCopyTreatmentName("");
  };

  // Helper to check if operation is editable
  const isEditableOp = (name: string) => {
    return ["Emergence", "Simulation End", "Sowing", "Harvest","Tillage"].includes(name);
  };

  // Format date as m/d/yyyy
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    }
    // fallback: try to parse m/d/yyyy
    const parts = dateStr.split("/");
    if (parts.length === 3) return dateStr;
    return dateStr;
  };

  // Mutation for updating operation date
  const updateOperationDateMutation = useMutation({
    mutationFn: (data: { op_id: number; opName: string; treatmentid: number; opDate: string }) =>
      ManagementService.updateOperationsDate({
        requestBody: {
          op_id: data.op_id,
          opName: data.opName,
          treatmentid: selectedTmt!,
          opDate: data.opDate,
        },
      }),
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Operation date updated.",
        status: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["operations", selectedTmt] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not update operation date.",
        status: "error",
      });
    },
  });

  // Save edited date (for now, just update local state)  handleDateSave(op.name, editedDate, op.op_id)
  const handleDateSave = (opName: string, opDate: string, op_id:number) => {
    // Call mutation to update the backend
    updateOperationDateMutation.mutate({
      op_id,
      opName,
      treatmentid: selectedTmt!,
      opDate,
    });
    setEditingOp(null);
    setEditedDate("");
  };



  return (

    <Box p={6}>
      <Text>
        Crop management is a 4 step process and is implemented in a panel below.
        This panel occasionally opens up another panel on its right side to
        collect supplement but necessary inputs. Process begins by A).Clicking
        the CROP to be managed, B). ADD NEW Experiment by giving it a broader
        categorical name like `Summer2018`. C). Experiment is further defined by
        ADD NEW Treatment plan by giving it treatment specific name. Note
        EXPERIMENT can have multiple treatments plans like `With Fertilizer`,
        `Without Fertilizer`. D). Defining the treatment individual OPERATION(S)
        by listing operation, date of operation, operation specific parameters
        and crop cultivar. NOTE: If you are modeling multiple treatments that
        only vary in one management aspect (ex. multiple N levels), use the
        CopyTo button to create copies of the treatment information so you do
        not need to fill in all of the management data multiple times.
      </Text>
      <Link
        color="blue"
        href="https://www.ars.usda.gov/northeast-area/beltsville-md-barc/beltsville-agricultural-research-center/adaptive-cropping-systems-laboratory/"
        isExternal
      >
        Click here to watch the Seasonal RunTab Video Tutorial
      </Link>
      <br />
      <br />

      {/* Card Design */}
      <Box
        p={6}
        borderWidth="1px"
        borderRadius="md"
        boxShadow="lg"
        bg="white"
        maxW="100%"
        mx="auto"
      >
        <Breadcrumb fontSize={{ base: "sm", md: "md" }} isTruncated>
          <BreadcrumbItem>
            <BreadcrumbLink
              fontWeight="bold"
              color="blue.600"
              _hover={{ textDecoration: "underline", color: "blue.800" }}
              onClick={() => handleNavigation(() => {
                setSelectedCrop(null);
                setSelectedExp(null);
                setSelectedTmt(null);
              })}
            >
              Crops
            </BreadcrumbLink>
          </BreadcrumbItem>
          {selectedCrop && (
            <BreadcrumbItem>
              <BreadcrumbLink
                fontWeight="bold"
                color="blue.600"
                _hover={{ textDecoration: "underline", color: "blue.800" }}
                onClick={() => handleNavigation(() => {
                  setSelectedExp(null);
                  setSelectedTmt(null);
                })}
              >
                Crop- {selectedCrop}
              </BreadcrumbLink>
            </BreadcrumbItem>
          )}
          {selectedExp && (
            <BreadcrumbItem>
              <BreadcrumbLink
                fontWeight="bold"
                color="blue.600"
                _hover={{ textDecoration: "underline", color: "blue.800" }}
                onClick={() => handleNavigation(() => setSelectedTmt(null))}
              >
                Experiment- {selectedExpName}
              </BreadcrumbLink>
            </BreadcrumbItem>
          )}
          {selectedTmt && (
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink
                fontWeight="bold"
                color="blue.600"
                _hover={{ textDecoration: "underline", color: "blue.800" }}
              >
                Treatment- {selectedTmtName}
              </BreadcrumbLink>
            </BreadcrumbItem>
          )}
        </Breadcrumb>

        <VStack align="start" spacing={4} mt={6} width={{ base: "100%"}}>
          {!selectedCrop && (
            <VStack align="start" spacing={4}>
              <Text fontSize="lg" mb={2}>
                Select a Crop to Proceed:
              </Text>
              {crops?.map((crop: { id: number; cropname: string | null }) => (
                <Box
                  key={crop.id}
                  p={4}
                  borderWidth="0px" // No border outline
                  borderRadius="md"
                  boxShadow="sm"
                  cursor="pointer"
                  onClick={() => handleCropSelection(crop.cropname!)}
                >
                  <Text color="black">{crop.cropname}</Text>
                </Box>
              ))}
            </VStack>
          )}

          {selectedCrop && !selectedExp && (
            <VStack align="start" spacing={4} width={{ base: "100%"}}>
              <Text fontSize="lg" mb={2}>
                Select an Experiment for Crop: {selectedCrop}
              </Text>

              {/* Input and Button to Create a New Experiment */}
                <HStack
                spacing={2}
                mb={4}
                width={{ base: "100%", sm: "100%", md: "100%", lg: "70%", "xl": "50%" }}
                flexDirection={{ base: "column", md: "row" }}
                align={{ base: "stretch", md: "center" }}
                >
                   {/* Current Breakpoint: <strong>{currentBreakpoint}</strong> */}
                <Input
                  placeholder="Enter new experiment name"
                  value={newExperimentName}
                  width="100%"
                  onChange={(e) => setNewExperimentName(e.target.value)}
                />
                <Button
                  colorScheme="blue"
                  onClick={handleCreateExperiment}
                  width={{ base: "100%", md: "50%" }}
                >
                  Create Experiment
                </Button>
                </HStack>

              {experiments && experiments.length > 0 ? (
                experiments.map((exp: { id: number; name: string; crop: string }) => (
                  <Box p={6} width={"45%"} key={exp.id} borderWidth="0px" >
                    <VStack align="stretch" >
                        <Flex
                          key={exp.id}
                          justify="space-between"
                          align="center"
                          px={2}
                          py={1}
                          _hover={{ bg: "gray.50" }}
                          borderRadius="md"
                        >
                          <Text fontSize="md" color="black" noOfLines={1} cursor={"pointer"} onClick={() => handleExperimentSelection(exp.id, exp.name)}>
                            {exp.name}
                          </Text>

                          <Menu>
                            <MenuButton
                              as={IconButton}
                              icon={<HiDotsVertical />}
                              variant="ghost"
                              size="sm"
                              minW="auto"
                              aria-label="Options"
                            />
                            <MenuList>
                              <MenuItem
                                icon={<Icon as={FiTrash2} color="red.500" />}
                                color="red.600"
                                onClick={() => {
                                  setDeleteTarget({ id: exp.id, name: exp.name, module: 'experiment' });
                                  setIsDeleteModalOpen(true);
                                }}
                              >
                                Delete
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </Flex>
                    </VStack>
                  </Box>
                ))
              ) : (
                <Text>No experiments available</Text>
              )}
            </VStack>
          )}

          {selectedExp && !selectedTmt && (
            <VStack align="start" spacing={4} width={{ base: "100%"}}>
              <Text fontSize="lg" mb={2}>
                Select a Treatment for Experiment: {selectedExpName}
              </Text>

              {/* Input and Button to Create a New Treatment */}
              <HStack 
                spacing={2}
                mb={4}
                width={{ base: "100%", sm: "100%", md: "100%", lg: "70%", "xl": "50%" }}
                flexDirection={{ base: "column", md: "row" }}
              >
                <Input
                  placeholder="Enter new treatment name"
                  value={newTreatmentName}
                  onChange={(e) => setNewTreatmentName(e.target.value)}
                />
                <Button colorScheme="blue" onClick={handleCreateTreatment} width={{ base: "100%", md: "50%" }}>
                  Create Treatment
                </Button>
              </HStack>

              {treatments && treatments.length > 0 ? (
                treatments.map((tmt: { id: number; name: string }) => (
                  <Box
                    key={tmt.id}
                    p={4}
                    borderWidth="0px"
                    borderRadius="md"
                    boxShadow="sm"
                    cursor="pointer"
                    width={"45%"}
                  >
                    <Flex
                      justify="space-between"
                      align="center"
                      px={2}
                      py={1}
                      _hover={{ bg: "gray.50" }}
                      borderRadius="md"
                    >
                      <Text
                        fontSize="md"
                        color="black"
                        noOfLines={1}
                        cursor={"pointer"}
                        onClick={() => handleTreatmentSelection(tmt.id, tmt.name)}
                      >
                        {tmt.name}
                      </Text>

                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<HiDotsVertical />}
                          variant="ghost"
                          size="sm"
                          minW="auto"
                          aria-label="Options"
                        />
                        <MenuList>
                          <MenuItem
                            icon={<Icon as={FiTrash2} color="red.500" />}
                            color="red.600"
                            onClick={() => {
                              setDeleteTarget({ id: tmt.id, name: tmt.name, module: 'treatment' });
                              setIsDeleteModalOpen(true);
                            }}
                          >
                            Delete
                          </MenuItem>
                          <MenuItem
                            icon={<Icon as={FiCopy} color="blue.500" />}
                            color="blue.600"
                            onClick={() => {
                              // setSelectedTmt(tmt.id);
                              setCopyTreatmentName(`${tmt.name} (Copy)`); // Pre-fill with default name
                              setIsCopyModalOpen(true);
                            }}
                          >
                            Copy
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Flex>
                  </Box>
                ))
              ) : (
                <Text>No treatments available</Text>
              )}
            </VStack>
          )}

          {selectedTmt && operations && (
            <VStack align="start" spacing={4}  width={"100%"}>
              <Text fontSize="lg" mb={2}>
                Operations for Treatment: {selectedTmtName}
              </Text>
      {/* Operation Creation Dropdown and Button */}
            <HStack spacing={2} mb={4} width={"100%"}>
              <OperationUI treatmentId={selectedTmt} operationID={-10}/>
            </HStack>
              {operations.length > 0 ? (
                operations.map((op) => (
                  // Only show Tillage if it has a date, otherwise show all other ops
                  op.name !== "" && (
                    <Box
                      key={op.name}
                      p={4}
                      borderWidth="0px"
                      borderRadius="md"
                      boxShadow="sm"
                      cursor="pointer"
                    >
                      <HStack justify="space-between" width="100%">
                        <Text color="black">{op.name}</Text>
                        <HStack>
                          {isEditableOp(op.name) ? (
                            editingOp === op.name ? (
                              <HStack>
                                <CustomDatePicker
                                  date={editedDate}
                                  onDateChange={(val: string) => setEditedDate(val)}
                                />
                                <IconButton
                                  aria-label="Save date"
                                  icon={<CheckIcon color="white" />} 
                                  size="xs"
                                  colorScheme="green"
                                  variant="solid"
                                  onClick={() => {
                                    handleDateSave(op.name, editedDate, op.op_id);
                                    setEditingOp(null);
                                  }}
                                />
                                <IconButton
                                  aria-label="Cancel edit"
                                  icon={<CloseIcon color="white" />} 
                                  size="xs"
                                  colorScheme="red"
                                  variant="solid"
                                  onClick={() => { setEditingOp(null); setEditedDate(""); }}
                                />
                              </HStack>
                            ) : (
                              <HStack>
                                <Text color="black">{formatDate(op.date)}</Text>
                                <IconButton
                                  aria-label="Edit date"
                                  icon={<FiEdit />}
                                  size="xs"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingOp(op.name);
                                    setEditedDate(op.date);
                                  }}
                                />
                              </HStack>
                            )
                          ) : (
                            <Text color="black">{op.date}</Text>
                          )}
                          {op.name === "Simulation Start" && (
                            <Button
                              size="sm"
                              colorScheme="blue"
                              onClick={() => {
                                setSimulationStartData(op);
                                onOpen();
                              }}
                            >
                              Update Data
                            </Button>
                          )}
                          {["Surface Residue", "Irrigation", "Fertilizer"].includes(op.name) && (
                            <Button
                              size="sm"
                              colorScheme="blue"
                              onClick={() => handleEditOperation(op.op_id)} 
                            >
                              Edit
                            </Button>
                          )}
                        </HStack>
                      </HStack>
                    </Box>
                  )
                ))
              ) : (
                <Text>No operations available</Text>
              )}
              {/* Modal for SimulationStart */}
              <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>Update Simulation Start</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    <SimulationStart
                      treatmentId={selectedTmt}
                      onClose={onClose}
                    />
                  </ModalBody>
                  <ModalFooter>
                    <Button onClick={onClose}>Close</Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            </VStack>
          )}
        </VStack>
      </Box>
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete {deleteTarget.module}</ModalHeader>
          <ModalBody>
            <Text>
              Are you sure you want to delete the {deleteTarget.module} <b>"{deleteTarget.name}"</b>? This action cannot be undone.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" mr={3}   
            onClick={() =>
              deleteTarget.module === 'experiment'
                ? handleDeleteExperiment()
                : handleDeleteTreatment()
            }>
              Delete
            </Button>
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isCopyModalOpen} onClose={() => setIsCopyModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Copy Treatment</ModalHeader>
          <ModalBody>
            <Text mb={4}>
              Enter a name for the new treatment copied from <b>"{selectedTmtName}"</b>:
            </Text>
            <Input
              placeholder="Enter new treatment name"
              value={copyTreatmentName}
              onChange={(e) => setCopyTreatmentName(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleConfirmCopyTreatment}>
              Copy
            </Button>
            <Button variant="ghost" onClick={() => setIsCopyModalOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <FaqComponent tabname="management" />

    </Box>
  )
}

export const Route = createFileRoute("/_layout/management")({
  component: cropManager,
})

export default cropManager