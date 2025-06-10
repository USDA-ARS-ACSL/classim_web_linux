import { Fragment, useEffect, useState } from "react";
import {
  Button,
  Container,  
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  SimpleGrid,  
  Link,
} from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronRightIcon, ChevronDownIcon } from "@chakra-ui/icons";
import ExperimentForm from "../../components/Management/ExperimentForm";
import TreatmentForm from "../../components/Management/TreatmentForm";
import OperationForm from "../../components/Management/OperationForm";
import {
  ApiError,
  ExperimentsPublic,
  ManagementService,
  TDataCopy,
  TDataCreateExperiment,
  TDataCreateTreatment,
  TDataDeleteExperiment,
  TDataDeleteTreatment,
  TDataExperimentByCropName,
  TDataExperimentByName,
  TDataOperation,
  TDataTreatment,
} from "../../client";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import useCustomToast from "../../hooks/useCustomToast";
import { Outlet } from "react-router-dom";
import NextPreviousButtons from "../../components/Common/NextPreviousButtons";
import FaqComponent from "../../components/Faqs/FaqComponent";
// import OperationEditForm from "../../components/Management/OperationEditFrom";

interface TreeMenuProps {
  level: number;
  title: string;
  parentTitle?: string;
  children?: React.ReactNode;
  onTitleClick: (title: string, tid: number) => void;
  tid: number;
}

interface CropsPublic {
  id: number;
  cropname: string;
}

const TreeMenu: React.FC<TreeMenuProps> = ({
  level,
  title,
  children,
  onTitleClick,
  tid,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box>
      <HStack>
        <Icon
          as={isOpen ? ChevronDownIcon : ChevronRightIcon}
          onClick={() => setIsOpen(!isOpen)}
          cursor='pointer'
        />
        <Text
          fontWeight={isOpen ? "bold" : "normal"}
          cursor='pointer'
          onClick={() => level !== 0 && onTitleClick(title, tid)}
        >
          {title}
        </Text>
      </HStack>

      {isOpen && <Box pl={4}>{children}</Box>}
    </Box>
  );
};

// Mutation for saving an experiment
const useSaveExperimentMutation = () => {
  const showToast = useCustomToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (experimentData: TDataCreateExperiment) => {
      await ManagementService.submitExperiment(experimentData);
    },
    onSuccess: (data, variables) => {
      console.log(data)
      const crop = variables.requestBody.crop; // Extract the crop name
      if (crop) {
        // Ensure the query key matches the structure used elsewhere
        queryClient.invalidateQueries({
          queryKey: ["getExperimentList", { cropName: crop } as const], // Ensure this matches your query definition
        });
      }
      showToast("Experiment saved successfully!", "", "success");
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail;
      showToast("Something went wrong.", `${errDetail}`, "error");
    },
  });
};

// Mutation for deleting an experiment
const useDeleteExperimentMutation = (currentCropName: string) => {
  const showToast = useCustomToast();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (exid: TDataDeleteExperiment) => {
      await ManagementService.deleteExperiment(exid);
    },
    onSuccess: (_, cropName) => {
      console.log(cropName)
      // Invalidate queries using a single query key string
      if (currentCropName) {
        queryClient.invalidateQueries({
          queryKey: [
            "getExperimentList",
            { cropName: currentCropName } as const,
          ], // Ensure this matches your query definition
        });
      }
      showToast("Experiment deleted successfully!", "", "success");
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail;
      showToast("Something went wrong.", `${errDetail}`, "error");
    },
  });
};

const useDeleteTreatmentMutation = () => {
  const showToast = useCustomToast();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tid: TDataDeleteTreatment) => {
      await ManagementService.deleteTreatment(tid);
    },
    onSuccess: (_, expId) => {
      if (expId) {
        // Ensure correct invalidation of queries
        queryClient.invalidateQueries({
          queryKey: ["getTreatmentList", expId],
          exact: false,
        });
      }
      showToast("Treatment deleted successfully!", "", "success");
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail;
      showToast("Something went wrong.", `${errDetail}`, "error");
    },
  });
};

// Add this function in your React component
const useSaveTreatment = () => {
  const showToast = useCustomToast();

  const mutation = useMutation({
    mutationFn: async (treatmentData: TDataCreateTreatment) => {
      // Replace this with the actual API call to save/update the treatment
      await ManagementService.checkUpdateTreatment(treatmentData);
    },
    onSuccess: (data) => {
      console.log(data);
      showToast("Treatment saved successfully!", "", "success");
      // Invalidate and refetch the queries or data as needed
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail;
      showToast("Something went wrong.", `${errDetail}`, "error");
    },
  });

  return mutation;
};

const userCopyTreatment = () => {
  const showToast = useCustomToast();

  const mutation = useMutation({
    mutationFn: async (treatmentData: TDataCopy) => {
      // Replace this with the actual API call to save/update the treatment
      await ManagementService.copyTreatment(treatmentData);
    },
    onSuccess: (data) => {
      console.log(data);
      showToast("Treatment Copied successfully!", "", "success");
      // Invalidate and refetch the queries or data as needed
    },
    onError: (error) => {
      showToast(
        "Treatment name exists. Please, use a different name!",
        error.message,
        "error"
      );
    },
  });

  return mutation;
};

interface LevelData {
  experimentName: any;
  level: number;
  titles: string[]; // Assuming titles is an array of strings
  cropName: string;
  treatmentName: any;
  operationName: any;
  titleId: number[];
}

interface Operation {
  opID: number;
  name: string | null; // or string if it should not be null
  date: string | null; // or string if it should not be null
}

const Management: React.FC = () => {
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [selectedTitleId, setSelectedTitleId] = useState<number | null>(null);
  const [currentCropName, setCurrentCropName] = useState<string>("");
  const [currentExperimentName, setCurrentExperimentName] =
    useState<string>("");
  const [currentTreatmentName, setCurrentTreatmentName] = useState<string>("");

  const [formType, setFormType] = useState<
    | "NewExperiment"
    | "DeleteExperiment"
    | "NewTreatment"
    | "ViewTreatmentSummary"
    | "DeleteTreatment"
    | "NewOperation"
    | "EditOperation"
    | null
  >(null);
  const [treeLevels, setTreeLevels] = useState<LevelData[]>([]);
  const [Bool, setBool] = useState(false);

  const [fertilizationForm, setFertilizationForm] = useState(false);

  const showToast = useCustomToast();

  const handleNewExperiment = (cropName: string) => {
    setCurrentCropName(cropName);
    setSelectedTitle(cropName);
    setFormType("NewExperiment");
  };

  const handleNewTreatment = (cropName: string, title: string) => {
    setCurrentCropName(cropName);
    setFormType("NewTreatment");
    setSelectedTitle(title);
    setCurrentTreatmentName(title);
  };

  const handleNewOperation = (
    cropName: string,
    title: string,
    expName: string,
    trtName: string
  ) => {
    setCurrentCropName(cropName);
    setFormType("NewOperation");
    setSelectedTitle(title);
    setCurrentExperimentName(expName);
    setCurrentTreatmentName(trtName);
    setFertilizationForm(fertilizationForm);
  };

  const saveExperimentMutation = useSaveExperimentMutation();
  const deleteExperimentMutation = useDeleteExperimentMutation(currentCropName);
  const deleteTreatmentMutation = useDeleteTreatmentMutation();
  const saveTreatmentMutation = useSaveTreatment();
  const copyTreatmentMutation = userCopyTreatment();

  const fetchExperimentByName = async (
    cropName: string,
    experimentName: string
  ) => {
    const data: TDataExperimentByName = {
      cropName: cropName,
      experimentName: experimentName,
    };

    const response = await ManagementService.getExperimentByName(data);
    return response.data.length > 0 ? response.data[0] : null;
  };

  const fetchTreatmentByExpId = async (expId: number) => {
    const data: TDataTreatment = {
      exid: expId,
    };

    const response = await ManagementService.getTreatmentSummary(data);
    return response.data.length > 0 ? response.data[0] : null;
  };

  const handleSaveExperiment = async (experimentName: string) => {
    if (!selectedTitle || !currentCropName) {
      return;
    }

    const experiment = await fetchExperimentByName(
      currentCropName,
      experimentName
    );
    console.log(experiment);
    if (experiment?.name == experimentName) {
      showToast(
        "Experiment already exist in " + currentCropName,
        "Try different name",
        "error"
      );
      return;
    }
    const data: TDataCreateExperiment = {
      requestBody: {
        exid: null,
        name: experimentName,
        crop: currentCropName,
      },
    };

    saveExperimentMutation.mutate(data);
    setBool(false);
  };

  const handleCopyTreatment = async (
    ccropName: any,
    currentTreatmentName: any,
    ctreatmentName: any,
    cexperimentName: any
  ) => {
    console.log(
      ccropName +
        " " +
        currentTreatmentName +
        " " +
        ctreatmentName +
        " " +
        cexperimentName
    );
    const data: TDataCopy = {
      requestBody: {
        treatmentname: currentTreatmentName,
        experimentname: cexperimentName,
        cropname: ccropName,
        newtreatmentname: ctreatmentName,
      },
    };
    copyTreatmentMutation.mutate(data);
    setBool(false);
  };
  const handleExperimentDelete = async () => {
    if (!selectedTitle || !currentCropName) {
      return;
    }

    const experiment = await fetchExperimentByName(
      currentCropName,
      selectedTitle
    );

    if (experiment && experiment.exid) {
      deleteExperimentMutation.mutate({ exid: experiment.exid });
    } else {
      console.error("Experiment not found or exid is null");
    }

    setSelectedTitle(null);
    setFormType(null);
    setBool(false);
  };

  const handleTreatmentDelete = async () => {
    if (!selectedTitle || !currentCropName) {
      return;
    }

    try {
      const experiment = await fetchExperimentByName(
        currentCropName,
        currentExperimentName
      );

      if (experiment && experiment.exid) {
        const treatmentId = await fetchTreatmentByExpId(experiment.exid);
        if (treatmentId && treatmentId.tid) {
          await deleteTreatmentMutation.mutateAsync({ tid: treatmentId.tid });
          setBool(false);
        }
      } else {
        console.error("Experiment not found or exid is null");
      }
    } catch (error) {
      console.error("Error during treatment deletion", error);
    } finally {
      setSelectedTitle(null);
      setFormType(null);
    }
  };

  const handleCancelDelete = () => {
    setSelectedTitle(null);
    setFormType(null);
  };

  const handleSaveTreatment = async (treatmentName: string) => {
    if (treatmentName.trim().length === 0) {
      showToast(
        "Empty string. Please, provide a valid treatment name.",
        "",
        "error"
      );
      return;
    }

    if (!selectedTitle || !currentCropName) {
      return;
    }

    const experiment = await fetchExperimentByName(
      currentCropName,
      selectedTitle
    );

    if (experiment && experiment.exid) {
      const data: TDataCreateTreatment = {
        requestBody: {
          tid: null,
          t_exid: experiment.exid,
          name: treatmentName,
          crop: currentCropName,
          expname: experiment.name,
        },
      };
      saveTreatmentMutation.mutate(data);
      setBool(false);
    }
  };

  const handleCancelTreatment = () => {
    setSelectedTitle(null);
    setFormType(null);
  };

  const handleForms = (
    parentTitle: string,
    level: number,
    title: string,
    expName: string,
    trtName: string
  ) => {
    if (level === 1) {
      handleNewExperiment(parentTitle);
    } else if (level === 2) {
      handleNewTreatment(parentTitle, title);
    } else if (level === 3) {
      handleNewOperation(parentTitle, title, expName, trtName);
    }
  };

  const { data: cropList } = useQuery({
    queryKey: ["readCrop"],
    queryFn: () => ManagementService.readCrop(),
  });

  const validCrops =
    cropList?.data.filter((crop) => crop.cropname != null) || [];

  const queries = validCrops.map((crop) => {
    const cropNameObject: TDataExperimentByCropName = {
      cropName: crop.cropname,
    };

    return {
      queryKey: ["getExperimentList", cropNameObject] as const, // Use a consistent and well-typed structure
      queryFn: () => ManagementService.getExperimentByCropName(cropNameObject),
    };
  });

  const results = useQueries({ queries });

  const allResultsLoaded = results.every((result) => result.isSuccess);

  const fetchTreatmentsAndSetLevels = async (result: ExperimentsPublic) => {
    const experimentTreatmentMap: Record<
      string,
      { treatmentTitles: string[]; operations: Record<string, Operation[]> }
    > = {};

    await Promise.all(
      result.data?.map(async (exp) => {
        const expObj: TDataTreatment = {
          exid: exp.exid !== null ? exp.exid : 0,
        };
        try {
          const treatments =
            await ManagementService.getTreatmentByExperimentId(expObj);
          const treatmentTitles = (treatments.data ?? [])
            .map((treat) => treat.name?.toString())
            .filter((name): name is string => name !== null);

          // Initialize an object to store operations for each treatment
          const operationsMap: Record<string, Operation[]> = {};

          // Fetch operations for each treatment
          await Promise.all(
            (treatments.data ?? []).map(async (treat) => {
              if (treat.tid !== null) {
                try {
                  const operations = (await fetchOperations(treat.tid)) ?? [];
                  operationsMap[treat.name ?? "Unknown Treatment"] = operations;
                } catch (operationError) {
                  console.error(
                    `Failed to fetch operations for treatment ID ${treat.tid}:`,
                    operationError
                  );
                  operationsMap[treat.name ?? "Unknown Treatment"] = []; // Ensure it's an array even on error
                }
              }
            })
          );

          const experimentName = exp.name ?? "Unknown Experiment";
          experimentTreatmentMap[experimentName] = {
            treatmentTitles,
            operations: operationsMap,
          };
        } catch (error) {
          console.error(
            `Failed to fetch treatments for experiment ID ${expObj.exid}:`,
            error
          );
        }
      })
    );

    return experimentTreatmentMap;
  };

  const fetchOperations = async (treatmentId: number): Promise<Operation[]> => {
    const treatObj: TDataOperation = {
      o_t_exid: treatmentId !== null ? treatmentId : 0,
    };

    try {
      const operations =
        await ManagementService.getOperationsByTreatment(treatObj);
      return operations.data.map((opt) => ({
        name: opt.name ?? "Unknown Operation", // Provide default value if needed
        date: opt.odate ?? "Unknown Date", // Provide default value if needed
        opID: opt.opID ?? null,
      }));
    } catch (error) {
      console.error(
        `Failed to fetch operations for treatment ID ${treatObj.o_t_exid}:`,
        error
      );

      // Return an empty array if there was an error
      return [];
    }
  };

  const getTreeLevels = async () => {
    const response = await ManagementService.readCrop();
    const cropData = response.data.filter(
      (crop) => crop.cropname !== null
    ) as CropsPublic[];

    const levels: any[] = [];

    await Promise.all(
      cropData.map(async (crop, index) => {
        const result = results[index];

        if (result.isLoading || result.error) {
          setBool(false);
          levels.push({ level: 1, titles: [], cropName: crop.cropname });
        } else {
          const experiments = result.data?.data.map((exp) => exp.name) || [];
          levels.push({
            level: 1,
            titles: experiments,
            cropName: crop.cropname,
            titleId: [],
          });

          if (result.isSuccess && result.data) {
            const experimentTreatmentMap = await fetchTreatmentsAndSetLevels(
              result.data
            );

            for (const [experimentName, details] of Object.entries(
              experimentTreatmentMap
            )) {
              levels.push({
                level: 2,
                titles: details.treatmentTitles,
                cropName: crop.cropname,
                experimentName: experimentName,
                titleId: [],
              });

              // Fetch operations for each treatment
              for (const treatmentTitle of details.treatmentTitles) {
                const operations = details.operations[treatmentTitle] ?? [];
                console.log(operations);
                levels.push({
                  level: 3,
                  titles: operations.map(
                    (op) => op.name ?? "Unknown Operation"
                  ),
                  titleId: operations.map(
                    (op) => op.opID ?? "Unknown Operation"
                  ),
                  cropName: crop.cropname,
                  experimentName: experimentName,
                  treatmentName: treatmentTitle,
                });

                // Extract and display date values for level 4
                operations.forEach((op) => {
                  levels.push({
                    level: 4,
                    titles: [op.date ?? "Unknown Date"],
                    cropName: crop.cropname,
                    experimentName: experimentName,
                    treatmentName: treatmentTitle,
                    operationName: op.name ?? "Unknown Operation",
                    titleId: [],
                  });
                });
              }
            }
          }
        }
      })
    );
    console.log("Final Levels:", levels);
    return levels;
  };
  const fetchData = async () => {
    try {
      const levels = await getTreeLevels();
      setBool(true);
      setTreeLevels(levels);
    } catch (error) {
      console.error("Error fetching tree levels:", error);
    }
  };
  useEffect(() => {
    if (Bool == false && treeLevels && allResultsLoaded) {
      console.log(allResultsLoaded);
      fetchData();
    }
  }, [treeLevels, cropList, results, Bool, allResultsLoaded]);

  const renderChildTree = (
    index: number,
    cropName?: string,
    title?: string,
    expName?: string
  ) => {
    console.log(expName);
    if (!treeLevels.length) {
      return <Text>Loading...</Text>; // Shows loading until treeLevels has data
    }

    if (index >= treeLevels.length) {
      return <Text>Some text for the last child drop</Text>;
    }

    // Find the current level data based on the level and cropName or experimentName
    const currentLevelData = treeLevels.find((levelData) => {
      if (levelData.level === 1) {
        return levelData.level === index + 1 && levelData.cropName === cropName;
      } else if (levelData.level === 2) {
        return (
          levelData.level === index + 1 &&
          levelData.cropName === cropName &&
          levelData.experimentName === title
        );
      } else if (levelData.level === 3) {
        return (
          levelData.level === index + 1 &&
          levelData.cropName === cropName &&
          levelData.experimentName === expName &&
          levelData.treatmentName === title
        );
      } else if (levelData.level === 4) {
        return (
          levelData.level === index + 1 &&
          levelData.cropName === cropName &&
          levelData.operationName === title
        );
      }
      return false;
    });

    if (!currentLevelData) {
      return null; // No data for this level and cropName or experimentName
    }

    return (
      <>
        {currentLevelData.titles.map((title: string, idx: number) => (
          <Fragment key={`${index}-${title}-${idx}`}>
            {currentLevelData.level !== 4 ? (
              <TreeMenu
                level={currentLevelData.level}
                title={title || ""}
                parentTitle={title}
                tid={currentLevelData.titleId[idx]}
                onTitleClick={(title) => {
                  let actionType:
                    | "DeleteExperiment"
                    | "DeleteTreatment"
                    | "EditOperation"
                    | null = null;
                  if (currentLevelData.level === 1) {
                    actionType = "DeleteExperiment";
                  } else if (currentLevelData.level === 2) {
                    actionType = "DeleteTreatment";
                  } else if (currentLevelData.level === 3) {
                    actionType = "EditOperation";
                  }
                  console.log(currentLevelData);
                  setCurrentTreatmentName(currentLevelData.treatmentName);
                  setCurrentExperimentName(currentLevelData.experimentName);
                  setSelectedTitle(title);
                  setSelectedTitleId(currentLevelData.titleId[idx]);
                  setCurrentCropName(currentLevelData.cropName);

                  setFormType(actionType); // Show delete form on title click
                }}
              >
                {renderChildTree(
                  index + 1,
                  cropName,
                  title,
                  currentLevelData.experimentName
                )}
              </TreeMenu>
            ) : (
              <Text ml={4}>{title}</Text> // Simply display the title as text for level 4
            )}
          </Fragment>
        ))}
        {currentLevelData.level < 4 && (
          <Box>
            <Button
              size='sm'
              ml={2}
              onClick={() => {
                handleForms(
                  cropName || "",
                  currentLevelData.level,
                  title || "",
                  currentLevelData.experimentName,
                  currentLevelData.treatmentName
                );
              }}
            >
              {currentLevelData.level === 1 && "Add new experiment"}
              {currentLevelData.level === 2 && "Add new treatment"}
              {currentLevelData.level === 3 && "Add new operation"}
            </Button>
          </Box>
        )}
      </>
    );
  };

  return (
    <Container maxW='full' mt={[4, 5]} width='80%'>
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
      <Link color='blue' href='https://www.ars.usda.gov/northeast-area/beltsville-md-barc/beltsville-agricultural-research-center/adaptive-cropping-systems-laboratory/' isExternal>
        Click here to watch the Seasonal RunTab Video Tutorial
      </Link><br/><br/>
      <Button variant='primary'>Open Management Report</Button>
      <SimpleGrid columns={2} spacing={10} mt={8}>
        <Box>
          <VStack align='start'>
            {validCrops?.map((crop, index) => (
              <TreeMenu
                key={index}
                level={0}
                title={crop.cropname ?? "Unknown Crop"}
                onTitleClick={(title) => setSelectedTitle(title)}
                tid={crop.id}
              >
                {renderChildTree(0, crop.cropname || "", selectedTitle || "")}
              </TreeMenu>
            ))}
          </VStack>
        </Box>
        <Box>
          {selectedTitle && formType === "NewExperiment" && (
            <ExperimentForm
              formType={formType}
              cropName={currentCropName}
              expName={selectedTitle}
              onSave={handleSaveExperiment}
              onDelete={handleExperimentDelete}
              onCancel={handleCancelDelete}
            />
          )}

          {selectedTitle && formType === "NewTreatment" && (
            <TreatmentForm
              formType={formType}
              ccropName={currentCropName}
              currentTreatmentName={selectedTitle}
              cexperimentName={currentExperimentName}
              onSave={handleSaveTreatment}
              onCopyTo={handleCopyTreatment}
              onCancel={handleCancelTreatment}
              onDelete={handleTreatmentDelete}
            />
          )}
          {selectedTitle && formType === "DeleteTreatment" && (
            <TreatmentForm
              formType={formType}
              ccropName={currentCropName}
              currentTreatmentName={selectedTitle}
              cexperimentName={currentExperimentName}
              onSave={handleSaveTreatment}
              onCopyTo={handleCopyTreatment}
              onCancel={handleCancelTreatment}
              onDelete={handleTreatmentDelete}
            />
          )}
          {selectedTitle && formType === "DeleteExperiment" && (
            <ExperimentForm
              formType={formType}
              cropName={currentCropName}
              expName={selectedTitle}
              onSave={handleSaveExperiment}
              onDelete={handleExperimentDelete}
              onCancel={handleCancelDelete}
            />
          )}

          {selectedTitle && (formType === "NewOperation" || formType === "EditOperation")&& (
            <OperationForm
              formType={formType}
              treatmentName={currentTreatmentName}
              experimentName={currentExperimentName}
              cropName={currentCropName}
              operationName={selectedTitle}
              operationId={selectedTitleId}
            />
          )}
        </Box>
      </SimpleGrid>

      <Outlet />
      <NextPreviousButtons />

      <FaqComponent tabname='management' />
    </Container>
  );
};

export const Route = createFileRoute("/_layout/management_old")({
  component: Management,
});

export default Management;
