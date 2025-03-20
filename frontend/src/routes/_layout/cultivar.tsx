import React, { useState, useEffect } from "react";
import {
  Container,
  Text,
  Link,
  VStack,
  Box,
  Heading,
  Select,
  Input,
  Button,
  FormControl,
  FormLabel,
  Flex,
  Radio,
  RadioGroup,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { CultivarTabApis,ApiError } from "../../client";
import FaqComponent from "../../components/Faqs/FaqComponent";
import { useMutation,useQueryClient } from "@tanstack/react-query";
import useCustomToast from "../../hooks/useCustomToast";
import NextPreviousButtons from "../../components/Common/NextPreviousButtons";

const CultivarTab = () => {
  const [cropOption, setCropOption] = useState("");
  const [cultivarOption, setCultivarOption] = useState("");
  const [eachCropCultivars, setEachCropCultivars] = useState<any>(null);
  const [eachCultivarData, setEachCultivarData] = useState<any>(null);
  const [createNew, setCreateNew] = useState(true);
  const queryClient = useQueryClient()

  const handleCropSelectChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setCultivarOption("")
    setCropOption(event.target.value);
    if (event.target.value) {
      const soil_response = CultivarTabApis.readCultivars({
        cropType: event.target.value,
      });
      setEachCropCultivars(soil_response)
    }
  };
  const handleDelete = () => {
    deleteMutation.mutate(); 
  };

  const UpdateMutation = useMutation({
    mutationFn:()=>
      CultivarTabApis.updateCultivars(eachCultivarData, cropOption),
    onSuccess: () =>{
      showToast("Success!", "Cultivar Created successfully.", "success")
      location.reload();
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail
      showToast("Something went wrong.", `${errDetail}`, "error")
    },
    onSettled: () => {
      // TODO: can we do just one call now?
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
    },

  })
  const SaveMutation = useMutation({
    mutationFn:()=>
      CultivarTabApis.createCultivars(eachCultivarData, cropOption),
    onSuccess: () =>{
      showToast("Success!", "Cultivar Created successfully.", "success")
      location.reload();
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail
      showToast("Something went wrong.", `${errDetail}`, "error")
    },
    onSettled: () => {
      // TODO: can we do just one call now?
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
    },

  })
  const deleteMutation = useMutation({
    mutationFn: () =>
      CultivarTabApis.deleteCultivar({ cropType:cropOption,id: parseInt(cultivarOption) }),
    onSuccess: () => {
      showToast("Success!", "Cultivar Deleted successfully.", "success")
      location.reload();
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail
      showToast("Something went wrong.", `${errDetail}`, "error")
    },
    onSettled: () => {
      // TODO: can we do just one call now?
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
    },
  })
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await CultivarTabApis.readCultivars({
          cropType: cropOption,
        });
        const data1 = await response.data;

        setEachCropCultivars(data1);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (cropOption) {
      fetchData();
    }
  }, [cropOption]);

  const handleInputChange = (event:any) => {
    setEachCultivarData({
      ...eachCultivarData,
      [event.target.name]: event.target.value
    });
  };

  const handleCultivarSelectChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setCultivarOption(event.target.value);
    options.map((option) => {
      if (option.value === cropOption) {

        const fields = option.fields
        const defaultVals = option.defaultVals
        const keyValuePair = fields.reduce((acc, field, index) => ({
          ...acc,
          [field]: defaultVals[index]
        }), {});
        setEachCultivarData(keyValuePair)
      }

    })
    if (event.target.value == 'new') {
      setCreateNew(true)
    }
    else {
      setCreateNew(false)
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await CultivarTabApis.getEachCultivarData({
          id: parseInt(cultivarOption),
          cropType: cropOption
        });
        const data1 = await response.data;
        setEachCultivarData(data1[0])
        console.log(data1[0])
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (cultivarOption && cultivarOption != 'new') {
      fetchData();
    }
  }, [cultivarOption]);


   const showToast = useCustomToast();

  const handleFormSubmit = async (event: any) => {
    event.preventDefault();
    if (createNew) {
      SaveMutation.mutate(); 
    }
    else {
      UpdateMutation.mutate();
    }
  }
  const options = [
    {
      value: "cotton",
      label: "Cotton",
      inputs: [
        "Relates boll safe age from abscission with age fo the boll, C and N-stress",
        "Maximum boll size",
        "Number of days after emergence that controls C-allocation in to stem",
        "Factor for C-allocation to stem for days after emergence = variety parameter 13",
        "Minimum leaf water potential for the day in well-watered soil in the estimation of stem growth water stress",
        "Parameter in the estimation of potential square growth",
        "Parameter in the estimation of potential boll growth",
        "Parameter in the estimation of morphogenetic delays due to N-stress",
        "Correction factor for root/shoot ratio",
        "Parameter in the estimation time interval between pre-fruiting node",
        "Parameter in the estimation of time interval between nodes in the main stem and fruiting branch",
        "Parameter in the estimation of time interval between nodes in the vegetative branches",
        "Parameter in the estimation of time from emergence to first square",
        "Parameter in the estimation of time from first square to bloom",
        "Parameter in the estimation of time from emergence to open boll",
        "Parameter in the estimation of leaf growth water stress",
        "Minimum leaf water potential in well-watered soil in the estimation of leaf growth water stress",
        "Parameter in the estimation of potential daily change in pre-fruiting leaf area",
        "Parameter in the estimation of potential daily change in mainstem leaf area",
        "Parameter in the estimation of potential daily change in mainstem and pre fruiting leaf weight",
        "Minimum LAI that affects boll temperature",
        "Parameter in the estimation of leaf age",
        "Parameter in the estimation of the physiological days for leaf abscission",
        "Parameter in the estimation of duration of leaf area expansion",
        "Parameter in the estimation of pre-fruiting leaf area at unfolding",
        "Parameter in the estimation of mainstem leaf area at unfolding",
        "Parameter in the estimation of fruiting branch leaf area at unfolding",
        "Parameter in the estimation of internode elongation duration in plant height calculation",
        "Parameter in the estimation of initial internode length in plant height calculation",
        "Parameter in the estimation of reduction to initial internode length when the number of main stem nodes < 14",
        "Parameter in the estimation of reduction to initial internode length when the number of main stem nodes >= 14",
        "Parameter in the estimation of current internode length",
        "Parameter in the estimation of bolls lost due to heat injury",
        "Relates potential fruit growth with temperature stress",
        "Relates potential fruit growth with water and temperature stress",
      ],
      fields: ['calbrt11', 'calbrt12', 'calbrt13', 'calbrt15', 'calbrt16', 'calbrt17', 'calbrt18', 'calbrt19', 'calbrt22', 'calbrt26', 'calbrt27', 'calbrt28', 'calbrt29', 'calbrt30', 'calbrt31', 'calbrt32', 'calbrt33', 'calbrt34', 'calbrt35', 'calbrt36', 'calbrt37', 'calbrt38', 'calbrt39', 'calbrt40', 'calbrt41', 'calbrt42', 'calbrt43', 'calbrt44', 'calbrt45', 'calbrt47', 'calbrt48', 'calbrt49', 'calbrt50', 'calbrt52', 'calbrt57'],
      defaultVals: [4, 6.75, 35, 0.85, -0.9, 0.9, 0, 1.5, 1, 1.35, 1, 1, 0.9, 1.15, 1.1, 1, -0.85, 1, 1, 1.1, 3, 0.75, 1, 2.5, 1, 1, 0.9, 1, 0.8, 1.1, 0.9, 0.7, 1, 1.35, 1],

    },
    {
      value: "maize",
      label: "Maize",
      inputs: [
        "Daylength Sensitive",
        "JuvenileLeaves",
        "Rmax_LTAR",
        "Rmax_LTIR",
        "PhyllFrmTassel",
        "StayGreen",
      ],
      fields: ["DaylengthSensitive", "juvenileleaves", "Rmax_LTAR", "Rmax_LTIR", "PhyllFrmTassel", "StayGreen"],
      defaultVals: ['1', "", "0.53", "0.978", "3", "4.5"],
    },
    {
      value: "potato",
      label: "Potato",
      inputs: [
        "Daily Air Temperature Effect",
        "Daily Air Temperature Amplitude Effect",
        "Photoperiod Effect",
        "High Nitrogen Effect",
        "Low Nitrogen Effect",
        "Determinacy",
        "Maximum Canopy Leaf Expansion Rate",
        "Maximum Tuber Growth Rate",
        "Specific Leaf Weight",
      ],
      fields: ["A1", "A6", "A8", "A9", "A10", "G1", "G2", "G3", "G4"],
      defaultVals: ["1.7", "2.0", "2.1", "1.2", "0.8", "0.5", "450", "20", "0.004"],

    },
    {
      value: "soybean",
      label: "Soybean",
      inputs: [
        "Maturity Group",
        "Number of Seeds per Pound Weight Typical for Cultivar",
        "Seed Fill Rate at 24oC",
        "lope of the Dependence of Vegetative Stage on Temperature Integral",
        "Maximum Vegetative Stage",
        "Correction Factor for the Early Vegetative Rate to Account for Clay Content",
        "Progress Rate towards Floral Initiation Before Solstice",
        "Daily Rate of the Progress to Floral Initiation at Solstice",
        "Daily Rate of the Progress to Floral Initiation After Solstice",
        "Progress Rate from Floral Initiation towards Full Bloom",
        "Slope of the Dependence of Full Bloom End on the Julian Day First",
        "Intercept of the Dependence of Full Bloom End on the Julian Day First",
        "Progress Rate from Full Bloom towards Full Seed",
        "Length of the Plateau First Seed",
        "Length of the Plateau Full Seed with no Stress",
        "Rate of the Decay of the Full Seed Plateau as the Stress Increases",
        "Rate of the Progress towards Physiological Maturity",
        "Reproductive Stage to Stop Vegetative Growth",
        "Relates Potential Elongation and Dry Weight Increase Petioles",
        "Potential Rate of the Root Weight Increase",
        "Relates to Increase in Pod Weight and Progress in Reproductive Stages",
        "Relates to Increase in Seed Weight and Fill",
        "Coefficient 'a' in Relationship between Height and Vegetative Stages",
        "Coefficient 'b' in Relationship between Height and Vegetative Stages",
        "Relates Number of Branches with the Plant Density",
        "Relates Stem Weight to Stem Elongation",
        "Relates Increment in Leaf Area to Increment in Vegetative Stages",
      ],
      fields: ["matGrp", "seedLb", "fill", "v1", "v2", "v3", "r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8", "r9", "r10", "r11", "r12", "g1", "g2", "g3", "g4", "g5", "g6", "g7", "g8", "g9"],
      defaultVals: ["2.7", "3800", "7.5", "0.00894", "14.6", "0.5", "0.0198", "0.0119", "-0.0907", "0.194", "0.522", "132.1", "0.00402", "42", "250", "0.5", "0.008", "5", "0.0024", "0.5", "2.2", "2.8", "1", "1.684", "0.5", "1.3", "1"],

    },
  ];

  return (
    <Container maxW='full' mt={[4, 5]}>
      <Heading size='lg' textAlign={{ base: "center", md: "left" }} pb={4}>
        Cultivar Tab
      </Heading>
      <Text>
        CULITVAR means different varieties of a CROP. For example, maize crop
        could be 90 or 120 maturity day crop. There are other specific
        parameters related to a crop variety. This tab allows to build a new
        crop variety from the default one and customize it further needs.
      </Text>

      <Link color='blue' href='https://youtu.be/a6B1Ud4LGhk/' isExternal>
        Click here to watch the Cultivar tab video tutorial.
      </Link>

      <Box py={12} width='100%'>
        <form onSubmit={handleFormSubmit}>
          <VStack spacing={2}>
            <Flex direction='column' pb={8} width='100%'>
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6} pb={8}>
                <FormControl>
                  <FormLabel htmlFor='cropSelect'>Select Crop</FormLabel>
                  <Select
                    onChange={handleCropSelectChange}
                    value={cropOption}
                    id='cropSelect'
                    placeholder='Select Crop'
                    size='md'
                  >
                    {options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                {cropOption && (
                  <FormControl>
                    <FormLabel htmlFor='cultivarSelect'>Cultivar List</FormLabel>
                    <Select
                      id='cultivarSelect'
                      placeholder='Select Cultivar'
                      size='md'
                      onChange={handleCultivarSelectChange}
                      value={cultivarOption}
                    >
                      <option id="newCreate" value='new'>Create New</option>

                      {Array.isArray(eachCropCultivars) && eachCropCultivars.map((cultivar) => (
                        <option key={cultivar.id} value={cultivar.id}>
                          {cultivar.hybridname}
                        </option>
                      ))}

                    </Select>
                  </FormControl>
                )}
              </Grid>

              {cultivarOption && (
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                  {options.map((option) => {
                    if (option.value === cropOption) {
                      return (
                        <React.Fragment key={option.value}>
                          {option.fields.map((field, index) => (
                            <GridItem key={option.inputs[index]}>
                              <FormControl>
                                <FormLabel htmlFor={option.fields[index]}>{option.inputs[index]}</FormLabel>
                                {option.inputs[index] === "Daylength Sensitive" ? (

                                  <RadioGroup value={eachCultivarData[field].toString()} name={option.fields[index]} onChange={handleInputChange}>
                                    <Flex direction='row' align='center'>
                                      <Radio value='1' mr={2}>Yes</Radio>
                                      <Radio value='0' mr={2}>No</Radio>
                                    </Flex>
                                  </RadioGroup>
                                ) : (
                                  <Input id={option.fields[index]}
                                    value={eachCultivarData[field]}
                                    name={option.fields[index]}
                                    onChange={handleInputChange}
                                    required
                                    type='text' />
                                )}
                              </FormControl>
                            </GridItem>

                          ))}
                          <GridItem key='hybridname'>
                          <FormLabel htmlFor='hybridname'> Cultivar Name</FormLabel>
                          <Input id="hybridname"
                            value={eachCultivarData['hybridname'] || ''}
                            name='hybridname'
                            readOnly={!createNew}
                            onChange={handleInputChange}
                            required
                            type='text' />
                            </GridItem>
                        </React.Fragment>

                      );

                    }
                    return null;
                  })}
                </Grid>
              )}
            </Flex>
          </VStack>

          <Flex direction={{ base: "column", md: "row" }} pt={8} justifyContent='center'>
            <Button variant='primary' type='submit' mr={{ base: 0, md: 4 }} mb={{ base: 4, md: 0 }}>
              {createNew ? 'Save' : 'Update'}
            </Button>
            <Button variant='danger' type='button' onClick={handleDelete}>
              Delete
            </Button>
          </Flex>
        </form>
      </Box>
      <NextPreviousButtons />
      <FaqComponent tabname={'Cultivar_' + cropOption} />
    </Container>
  );
};
export const Route = createFileRoute("/_layout/cultivar")({
  component: CultivarTab,
});

export default CultivarTab;
