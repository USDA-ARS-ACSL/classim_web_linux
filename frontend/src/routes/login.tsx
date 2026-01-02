import {
  Button,
  Container,
  Text,
  VStack,
  Image,
  Alert,
  AlertIcon,
  AlertDescription,
} from "@chakra-ui/react"
import {
  createFileRoute,
  redirect,
} from "@tanstack/react-router"

import Logo from "../assets/images/usda-logo-color.svg"
import useAuth, { isLoggedIn } from "../hooks/useAuth"

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

  const handleLogin = () => {
    resetError()
    initiateOIDCLogin()
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
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Button
            variant="primary"
            size="lg"
            onClick={handleLogin}
            width="full"
            maxW="300px"
          >
            Sign in with USDA eAuth
          </Button>
          
          <Text fontSize="sm" color="gray.500" textAlign="center" maxW="md">
            USDA eAuth provides secure access to USDA applications using login.gov authentication.
            You'll be redirected to login.gov to sign in with your credentials.
          </Text>
        </VStack>
      </Container>
    </>
  )
}