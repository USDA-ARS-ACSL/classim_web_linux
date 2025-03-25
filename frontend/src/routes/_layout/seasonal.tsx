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
import NextPreviousButtons from "../../components/Common/NextPreviousButtons";
const SeasonalTab = () => {
  return (
    <Container maxW='full' mt={[4, 5]} width={'80%'}>
      <Heading size='lg' textAlign={{ base: "center", md: "left" }} pb={4}>
        Seasonal Tab
      </Heading>
      <Text>
      This tab allows to add or update a weather station. 
      A weather station can have more than one weather data, 
      if you are uploading a weather file and you don't want this data to have the same weather_id as the weather station name, 
      please provide a column named weather_id with the identifier you want. 
       For sites within the US territory there is an option to download hourly data for the past 5 years. 
       This data is from NLDAS and MRMS databases (NASA and NOAA administrations respectively).      
       </Text>

      <Link color='blue' href='https://youtu.be/m22yAianoFw/' isExternal>
        Click here to watch the Seasonal Tab video tutorial.
      </Link>
      <Simulation />
      <NextPreviousButtons />
      
      <FaqComponent tabname='seasonal' />
    </Container>
  );
};

export const Route = createFileRoute("/_layout/seasonal")({
  component: SeasonalTab,
});

export default SeasonalTab;
