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
import { client } from '../../client'

export const AddEmailComponent = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleAddEmail = async () => {
    setIsLoading(true)
    setError('')

    try {
      await client.POST('/api/v1/guest/add-email', {
        body: { email }
      })
      
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
        <HStack>
          <Icon as={FaEnvelope} color="green.500" />
          <Heading size="md">Get Reports via Email</Heading>
        </HStack>
      </CardHeader>
      
      <CardBody>
        <VStack spacing={4}>
          <Text color="gray.600">
            Add your email address to receive simulation reports and results.
          </Text>
          
          <Input
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            isInvalid={!!error}
          />
          
          {error && (
            <Alert status="error">
              <AlertIcon />
              <Text fontSize="sm">{error}</Text>
            </Alert>
          )}
          
          <Button 
            onClick={handleAddEmail}
            colorScheme="green" 
            leftIcon={<FaPlus />}
            width="100%"
            isLoading={isLoading}
            isDisabled={!isEmailValid}
            loadingText="Adding Email..."
          >
            Add Email Address
          </Button>
        </VStack>
      </CardBody>
    </Card>
  )
}
