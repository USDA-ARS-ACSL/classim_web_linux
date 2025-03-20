// import React, { useState } from "react";
import {
    Container,
    Text,
    Link,
    Heading
  } from "@chakra-ui/react";
  import { createFileRoute } from "@tanstack/react-router";
  import FaqComponent from "../../components/Faqs/FaqComponent";
  const RotationBuilderTab = () => {
    return (
      <Container maxW='full' mt={[4, 5]} width={'80%'}>
        <Heading size='lg' textAlign={{ base: "center", md: "left" }} pb={4}>
          Rotation Builder Tab
        </Heading>
        <Text>
        Choose rotation by checking from the list box.
         </Text>
  
        <Link color='blue' href='https://www.ars.usda.gov/northeast-area/beltsville-md-barc/beltsville-agricultural-research-center/adaptive-cropping-systems-laboratory/' isExternal>
          Click here to watch the Rotation Output Tab video tutorial.
        </Link>
        <FaqComponent tabname='rotation' />
      </Container>
    );
  };
  
  export const Route = createFileRoute("/_layout/rotationBuilderOutput")({
    component: RotationBuilderTab,
  });
  
  export default RotationBuilderTab;
  