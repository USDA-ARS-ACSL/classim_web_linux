import { useState } from "react"
import {
  Button,
  Container,
  Text,
  VStack,
  Image,
  Alert,
  AlertIcon,
  AlertDescription,
  Divider,
  HStack,
  Icon,
} from "@chakra-ui/react"
import { FaUserSecret } from "react-icons/fa"
import {
  createFileRoute,
  redirect,
} from "@tanstack/react-router"

import Logo from "../assets/images/usda-logo-color.svg"
import useAuth, { isLoggedIn } from "../hooks/useAuth"
import { GuestAccessModal } from "../components/Common/GuestAccessModal"

export const Route = createFileRoute("/login")({
  component: Login,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      })
    }
  },
})

function Login() {
  const { error, resetError, initiateOIDCLogin } = useAuth()
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false)

  const handleLogin = () => {
    resetError()
    initiateOIDCLogin()
  }

  const handleGuestAccess = () => {
    resetError()
    setIsGuestModalOpen(true)
  }

  return (
    <>
      <Container
        h="100vh"
        maxW="sm"
        alignItems="stretch"
        justifyContent="center"
        centerContent
      >
        <VStack spacing={6} align="center">
          <Image
            src={Logo}
            alt="USDA logo"
            height="auto"
            maxW="2xs"
            alignSelf="center"
            mb={4}
          />
          
          <VStack spacing={4} align="center">
            <Text fontSize="2xl" fontWeight="bold" textAlign="center">
              CLASSIM Web Application
            </Text>
            
            <Text fontSize="md" color="gray.600" textAlign="center" maxW="md">
              Please sign in with your USDA credentials to access the CLASSIM web application.
            </Text>
          </VStack>

          {error && (
            <Alert status="error" mb={4}>
              <AlertIcon />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <VStack spacing={3} width="full" maxW="300px">
            <Button
              variant="primary"
              size="lg"
              onClick={handleLogin}
              width="full"
            >
              Sign in with USDA eAuth
            </Button>
            
            <HStack width="full" spacing={4}>
              <Divider />
              <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
                or
              </Text>
              <Divider />
            </HStack>
            
            <Button
              variant="outline"
              size="lg"
              onClick={handleGuestAccess}
              width="full"
              leftIcon={<Icon as={FaUserSecret} />}
              colorScheme="blue"
            >
              Try as Guest
            </Button>
          </VStack>
          
          <VStack spacing={2} align="center">
            <Text fontSize="sm" color="gray.500" textAlign="center" maxW="md">
              USDA eAuth provides secure access to USDA applications using login.gov authentication.
              You'll be redirected to login.gov to sign in with your credentials.
            </Text>
            
            <Text fontSize="xs" color="gray.400" textAlign="center" maxW="md">
              Guest access allows you to try CLASSIM without signing in. 
              Guest sessions last 24 hours and all data is automatically deleted.
            </Text>
          </VStack>
        </VStack>
      </Container>
      
      <GuestAccessModal 
        isOpen={isGuestModalOpen} 
        onClose={() => setIsGuestModalOpen(false)} 
      />
    </>
  )
}