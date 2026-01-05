import { useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Text,
  Checkbox,
  Input,
  Button,
  Alert,
  AlertIcon,
  Divider,
  HStack,
  Icon
} from '@chakra-ui/react'
import { FaUserSecret, FaEnvelope } from 'react-icons/fa'
import { useNavigate } from '@tanstack/react-router'
import { client } from '../../client'

interface GuestAccessModalProps {
  isOpen: boolean
  onClose: () => void
}

export const GuestAccessModal = ({ isOpen, onClose }: GuestAccessModalProps) => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [useEmail, setUseEmail] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGuestAccess = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await client.POST('/api/v1/guest/create', {
        body: { email: useEmail ? email : null }
      })

      if (response.data) {
        // Store guest token and session info
        localStorage.setItem('access_token', response.data.access_token)
        localStorage.setItem('guest_session', response.data.guest_session_id)
        localStorage.setItem('is_guest', 'true')
        
        onClose()
        navigate({ to: '/' })
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create guest session')
    } finally {
      setIsLoading(false)
    }
  }

  const isEmailValid = !useEmail || (email.includes('@') && email.includes('.'))

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Icon as={FaUserSecret} color="blue.500" />
            <Text>Guest Access</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            <Alert status="info">
              <AlertIcon />
              <Text fontSize="sm">
                Try CLASSIM without creating an account. Guest sessions last 24 hours 
                and all data will be automatically deleted.
              </Text>
            </Alert>

            <Divider />

            <VStack spacing={3} align="stretch">
              <Text fontWeight="semibold">Optional: Get Reports via Email</Text>
              
              <Checkbox 
                isChecked={useEmail} 
                onChange={(e) => setUseEmail(e.target.checked)}
                colorScheme="blue"
              >
                <HStack>
                  <Icon as={FaEnvelope} />
                  <Text>I'd like to receive simulation reports via email</Text>
                </HStack>
              </Checkbox>

              {useEmail && (
                <VStack spacing={2} align="stretch">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    isInvalid={useEmail && !isEmailValid}
                  />
                  <Text fontSize="xs" color="gray.500">
                    We'll only use this email to send you reports. No spam, ever.
                  </Text>
                </VStack>
              )}
            </VStack>

            <Divider />

            {error && (
              <Alert status="error">
                <AlertIcon />
                <Text fontSize="sm">{error}</Text>
              </Alert>
            )}

            <VStack spacing={3}>
              <Button 
                onClick={handleGuestAccess}
                colorScheme="blue" 
                width="100%"
                size="lg"
                isLoading={isLoading}
                isDisabled={!isEmailValid}
                loadingText="Creating Guest Session..."
              >
                Continue as Guest
              </Button>
              
              <Text fontSize="xs" color="gray.500" textAlign="center">
                By continuing as a guest, you agree to our terms of service.
                Your session will expire in 24 hours.
              </Text>
            </VStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
