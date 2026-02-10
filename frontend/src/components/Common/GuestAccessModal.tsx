import { useState } from "react"
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Alert,
  AlertIcon,
  AlertDescription,
  useToast,
} from "@chakra-ui/react"
import { useRouter } from "@tanstack/react-router"

interface GuestAccessModalProps {
  isOpen: boolean
  onClose: () => void
}

interface CreateGuestResponse {
  guest_id: string
  session_expires_at: string
  access_token: string
}

export function GuestAccessModal({ isOpen, onClose }: GuestAccessModalProps) {
  const [guestName, setGuestName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const toast = useToast()

  const handleCreateGuest = async () => {
    if (!guestName.trim()) {
      setError("Please enter a name for your guest session")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/v1/guest/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guest_name: guestName.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to create guest session")
      }

      const data: CreateGuestResponse = await response.json()

      // Store guest access token
      localStorage.setItem("access_token", data.access_token)
      localStorage.setItem("guest_id", data.guest_id)
      localStorage.setItem("guest_session_expires", data.session_expires_at)
      localStorage.setItem("user_type", "guest")

      toast({
        title: "Guest Session Created",
        description: "Welcome to CLASSIM! Your session will expire in 24 hours.",
        status: "success",
        duration: 5000,
        isClosable: true,
      })

      // Redirect to home page
      await router.navigate({ to: "/" })
    } catch (err) {
      console.error("Failed to create guest session:", err)
      setError(err instanceof Error ? err.message : "Failed to create guest session")
    } finally {
      setIsLoading(false)
    }
  }

  const handleModalClose = () => {
    setGuestName("")
    setError("")
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleModalClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Guest Access</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" color="gray.600">
              Guest access allows you to try CLASSIM without creating an account. 
              Your session will last 24 hours and all data will be automatically deleted.
            </Text>

            {error && (
              <Alert status="error" size="sm">
                <AlertIcon />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <FormControl>
              <FormLabel>Your Name</FormLabel>
              <Input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Enter your name"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleCreateGuest()
                  }
                }}
              />
            </FormControl>

            <VStack spacing={2}>
              <Button
                colorScheme="blue"
                width="full"
                onClick={handleCreateGuest}
                isLoading={isLoading}
                loadingText="Creating Session..."
              >
                Start Guest Session
              </Button>
              
              <Button
                variant="ghost"
                width="full"
                onClick={handleModalClose}
              >
                Cancel
              </Button>
            </VStack>

            <Text fontSize="xs" color="gray.500" textAlign="center">
              No email required • Session expires in 24 hours • All data deleted automatically
            </Text>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}