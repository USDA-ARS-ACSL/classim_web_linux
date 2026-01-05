import { useState } from 'react'
import {
  Card,
  CardHeader,
  CardBody,
  Heading,
  VStack,
  Text,
  Input,
  Button,
  Alert,
  AlertIcon,
  HStack,
  Icon
} from '@chakra-ui/react'
import { FaEnvelope, FaPlus } from 'react-icons/fa'
import { OpenAPI } from '../../client'

export const AddEmailComponent = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleAddEmail = async () => {
    setIsLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${OpenAPI.BASE}/api/v1/guest/add-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email })
      })

      if (!response.ok) {
        throw new Error('Failed to add email')
      }
      
      setSuccess(true)
      setEmail('')
    } catch (err: any) {
      setError(err.message || 'Failed to add email')
    } finally {
      setIsLoading(false)
    }
  }

  const isEmailValid = email.includes('@') && email.includes('.')

  if (success) {
    return (
      <Alert status="success">
        <AlertIcon />
        <Text>Email added successfully! You can now receive reports.</Text>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <Heading size="md">
          <HStack>
            <Icon as={FaEnvelope} color="blue.500" />
            <Text>Add Email for Reports</Text>
          </HStack>
        </Heading>
      </CardHeader>
      
      <CardBody>
        <VStack spacing={4} align="stretch">
          <Text fontSize="sm" color="gray.600">
            Add your email address to receive simulation reports. We'll only use this 
            for sending you reports - no spam, ever.
          </Text>

          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            isInvalid={!isEmailValid && email.length > 0}
          />

          {error && (
            <Alert status="error">
              <AlertIcon />
              <Text fontSize="sm">{error}</Text>
            </Alert>
          )}

          <Button 
            onClick={handleAddEmail}
            colorScheme="blue" 
            leftIcon={<FaPlus />}
            isLoading={isLoading}
            isDisabled={!isEmailValid}
            loadingText="Adding Email..."
          >
            Add Email
          </Button>
        </VStack>
      </CardBody>
    </Card>
  )
}