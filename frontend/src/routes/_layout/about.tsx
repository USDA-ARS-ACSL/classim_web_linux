// import React, { useState } from "react}";
import {
  Container,
  Heading,
  Text,
  Box,
  List,
  ListItem,
  ListIcon,
  Divider,
} from "@chakra-ui/react";
import { MdCheckCircle } from "react-icons/md";
import { createFileRoute } from "@tanstack/react-router";

const AboutTab = () => {
  return (
    <Container maxW="full" mt={[4, 5]} width={"80%"}>
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pb={4}>
        About CLASSIM
      </Heading>
      <Text fontWeight="bold" mb={2}>
        CLASSIM Version 1
      </Text>
      <Text mb={2}>
        If you have any suggestions or questions, please email{" "}
        <b>ARS-CLASSIM-Help@usda.gov</b>.
      </Text>
      <Divider my={4} />
      <Text fontWeight="bold" mb={2}>
        Development Team
      </Text>
      <Box mb={2}>
        <Text fontWeight="semibold">Models</Text>
        <List spacing={1} pl={4}>
          <ListItem>
            <ListIcon as={MdCheckCircle} color="green.500" />
            2DSoil: Dennis Timlin, Zhuangji Wang and David Fleisher
          </ListItem>
          <ListItem>
            <ListIcon as={MdCheckCircle} color="green.500" />
            Glycim: Wenguang Sun, Vangimalla Reddy and Dennis Timlin
          </ListItem>
          <ListItem>
            <ListIcon as={MdCheckCircle} color="green.500" />
            Gossym: Sahila Beegum and Vangimalla Reddy
          </ListItem>
          <ListItem>
            <ListIcon as={MdCheckCircle} color="green.500" />
            Maizsim: Dennis Timlin and Soo-hyung Kim
          </ListItem>
          <ListItem>
            <ListIcon as={MdCheckCircle} color="green.500" />
            Spudsim: David Fleisher
          </ListItem>
        </List>
      </Box>
      <Box mb={2}>
        <Text fontWeight="semibold">Programmers</Text>
        <Text pl={4}>
          Santhosh Kumar Bethi, Alakananda Mitra, David Fleisher and Dennis
          Timlin.
        </Text>
      </Box>
      <Box mb={2}>
        <Text fontWeight="semibold">Design &amp; Testing</Text>
        <Text pl={4}>
          Santhosh Kumar Bethi, Alakananda Mitra, David Fleisher, Dennis
          Timlin, Vangimalla Reddy, Wayne Roper III, Kirsten Paff, Eunjin Han, Sahila Beegum,
          Zhuangji Wang and Wenguang Sun.
        </Text>
      </Box>
      <Divider my={4} />
      <Text mt={4}>
        Developed by{" "}
        <a
          href="https://www.ars.usda.gov/northeast-area/beltsville-md-barc/beltsville-agricultural-research-center/adaptive-cropping-systems-laboratory/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#3182ce", textDecoration: "underline", fontWeight: "bold" }}
        >
          USDA ARS Adaptive Cropping Systems Laboratory
        </a>
        .
      </Text>
    </Container>
  );
};

export const Route = createFileRoute("/_layout/about")({
  component: AboutTab,
});

export default AboutTab;
