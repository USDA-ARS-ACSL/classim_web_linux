// import React, { useState } from "react";
import {
    Container,
    Heading
  } from "@chakra-ui/react";
  import { createFileRoute } from "@tanstack/react-router";
  const AboutTab = () => {
    return (
      <Container maxW='full' mt={[4, 5]} width={'80%'}>
        <Heading size='lg' textAlign={{ base: "center", md: "left" }} pb={4}>
          About Tab
        </Heading>  
      </Container>
    );
  };
  
  export const Route = createFileRoute("/_layout/about")({
    component: AboutTab,
  });
  
  export default AboutTab;
  