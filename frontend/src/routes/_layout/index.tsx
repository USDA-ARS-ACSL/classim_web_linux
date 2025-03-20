import { Box, Container, Text, OrderedList, ListItem, Link, Image } from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import Logo from "../../assets/images/classim.png"
import FaqComponent from "../../components/Faqs/FaqComponent";
import type { UserPublic } from "../../client"
import NextPreviousButtons from "../../components/Common/NextPreviousButtons";

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
})

function Dashboard() {
  const queryClient = useQueryClient()

  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"])

  return (
    <>
      <Container maxW="full">
        <Box pt={12} m={4}>
          <Text fontSize="2xl">
            Welcome, {currentUser?.full_name || currentUser?.email} 👋🏼
          </Text>

          <Text>Crop, Land And Soil SIMulation (CLASSIM) was developed to facilitate the execution of crop models like GLYCIM (soybean), GOSSYM (cotton), MAIZSIM (maize) and SPUDSIM (potato). To run the simulation use the Seasonal Run tab or to build a rotation use the Rotation Builder tab.</Text>


          <Text>Before you proceed with the simulation, verify if the necessary information is already on the system otherwise you can add it going to the following tabs</Text>
          <OrderedList>
            <ListItem>Site</ListItem>
            <ListItem>Soil</ListItem>
            <ListItem>Weather</ListItem>
            <ListItem>Cultivar</ListItem>
            <ListItem>Management</ListItem>
          </OrderedList>

          <Text>The model output can be seen on Seasonal Output or Rotation Output tab. </Text>
          <Link color='blue' href='https://youtu.be/v22tXNg1vCg/' isExternal>
            Click here to watch
            the Welcome Tab video tutorial
          </Link>
        </Box>
        <Box boxSize='sm'>
          <Image
            src={Logo}
            alt="FastAPI logo"
            height="auto"
            maxW="2xs"
            alignSelf="center"
            mb={4}
          />
        </Box>
        <NextPreviousButtons />
        <FaqComponent tabname={'welcome'} />
      </Container>

    </>
  )
}
