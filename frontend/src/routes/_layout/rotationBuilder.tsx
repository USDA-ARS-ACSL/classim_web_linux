// import React, { useState } from "react";
import {
    Container,
    Text,
    Link,
    Heading
  } from "@chakra-ui/react";
  import { createFileRoute } from "@tanstack/react-router";
  import FaqComponent from "../../components/Faqs/FaqComponent";
  import Simulation from "../../components/Simulation";
  const RotationBuilderTab = () => {
    return (
      <Container maxW='full' mt={[4, 5]} width={'80%'}>
        <Heading size='lg' textAlign={{ base: "center", md: "left" }} pb={4}>
          Rotation Builder Tab
        </Heading>
        <Text>
        To create your rotation you first need to select in this order: Site, Soil, Station Name and Weather. 
        Please, note that when you select crop, only experiment/treatments that are scheduled to happen in the timeframe that we have weather 
        data will appear in the list. To add or delete a rotation, please select the entire row and right click. 
        It will open a dialog box with simple instructions. Once changes are done, please make sure to press the Execute Rotation button. 
         </Text>
  
        <Link color='blue' href='https://www.ars.usda.gov/northeast-area/beltsville-md-barc/beltsville-agricultural-research-center/adaptive-cropping-systems-laboratory/' isExternal>
          Click here to watch the Rotation Builder Tab video tutorial.
        </Link>
        <Simulation />
        <FaqComponent tabname='rotation' />
      </Container>
    );
  };
  
  export const Route = createFileRoute("/_layout/rotationBuilder")({
    component: RotationBuilderTab,
  });
  
  export default RotationBuilderTab;
  