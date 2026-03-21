import { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Spinner,
  Center,
  Button,
  Input,
  Textarea,
  Select,
  Divider,
  SimpleGrid,
  useToast,
  Icon,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  StepTitle,
  StepDescription,
  StepSeparator,
} from '@chakra-ui/react'
import { FiPlay, FiActivity, FiCpu, FiTarget, FiShield } from 'react-icons/fi'
import { treeAPI } from '../services/api'

const NODE_COLORS = {
  Keter: 'purple',
  Chokmah: 'blue',
  Binah: 'cyan',
  Chesed: 'green',
  Gevurah: 'red',
  Tiferet: 'yellow',
  Netzach: 'teal',
  Hod: 'orange',
  Yesod: 'pink',
  Malkuth: 'gray',
}

function TreeOfLife() {
  const [input, setInput] = useState('')
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [health, setHealth] = useState(null)
  const toast = useToast()

  useEffect(() => {
    checkHealth()
  }, [])

  const checkHealth = async () => {
    try {
      const response = await treeAPI.health()
      setHealth(response.data)
    } catch (error) {
      console.error('Health check failed:', error)
    }
  }

  const runTree = async () => {
    if (!input.trim()) {
      toast({
        title: 'Input required',
        description: 'Please enter a question or task',
        status: 'warning',
        duration: 3000,
      })
      return
    }

    setLoading(true)
    setResult(null)
    try {
      const response = await treeAPI.run(input, domain || null)
      setResult(response.data)
      toast({
        title: 'Tree Execution Complete',
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      console.error('Tree run error:', error)
      toast({
        title: 'Error',
        description: 'Failed to run Tree-of-Life engine',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const getConfidenceColor = (score) => {
    if (score >= 70) return 'green'
    if (score >= 50) return 'orange'
    return 'red'
  }

  const getRiskColor = (score) => {
    if (score >= 0.7) return 'red'
    if (score >= 0.4) return 'orange'
    return 'green'
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <Box>
            <Heading size="lg">🌳 Tree of Life Engine</Heading>
            <Text color="gray.600">Graph-based AI decision orchestration</Text>
          </Box>
          <HStack>
            <Icon as={FiActivity} color={health?.status === 'ok' ? 'green.500' : 'gray.500'} />
            <Text fontSize="sm" color="gray.500">
              {health?.status === 'ok' ? 'Engine Online' : 'Engine Offline'}
            </Text>
          </HStack>
        </HStack>

        {/* Quick Info Cards */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Card>
            <CardBody>
              <HStack>
                <Icon as={FiCpu} boxSize={8} color="purple.500" />
                <Box>
                  <Text fontSize="sm" color="gray.500">10 Nodes</Text>
                  <Text fontWeight="bold">Specialized Advisors</Text>
                </Box>
              </HStack>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <HStack>
                <Icon as={FiTarget} boxSize={8} color="blue.500" />
                <Box>
                  <Text fontSize="sm" color="gray.500">22 Paths</Text>
                  <Text fontWeight="bold">Decision Routes</Text>
                </Box>
              </HStack>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <HStack>
                <Icon as={FiShield} boxSize={8} color="green.500" />
                <Box>
                  <Text fontSize="sm" color="gray.500">Max 20 Steps</Text>
                  <Text fontWeight="bold">Loop Prevention</Text>
                </Box>
              </HStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Input Form */}
        <Card>
          <CardHeader>
            <Heading size="md">Ask a Question</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <Textarea
                placeholder="e.g., Should I invest in crypto? or Help me plan my retirement"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={3}
              />
              <HStack w="full" justify="space-between">
                <Select
                  placeholder="Select domain (optional)"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  w="300px"
                >
                  <option value="career">Career</option>
                  <option value="finance">Finance</option>
                  <option value="health">Health</option>
                  <option value="relationships">Relationships</option>
                  <option value="life_architecture">Life Architecture</option>
                </Select>
                <Button
                  colorScheme="brand"
                  leftIcon={<FiPlay />}
                  onClick={runTree}
                  isLoading={loading}
                  loadingText="Processing..."
                >
                  Run Decision Tree
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Results */}
        {loading && (
          <Center py={10}>
            <VStack spacing={4}>
              <Spinner size="xl" color="purple.500" thickness="4px" />
              <Text color="gray.500">Tree of Life is processing your request...</Text>
              <Text fontSize="sm" color="gray.400">Consulting 10 specialized advisors</Text>
            </VStack>
          </Center>
        )}

        {result && !loading && (
          <>
            {/* Execution Route */}
            <Card>
              <CardHeader>
                <Heading size="md">Execution Path</Heading>
              </CardHeader>
              <CardBody>
                <Stepper index={result.route?.length - 1} orientation="horizontal" size="sm">
                  {result.route?.map((node, index) => (
                    <Step key={index}>
                      <StepIndicator bg={`${NODE_COLORS[node] || 'gray'}.500`}>
                        <StepStatus complete={<StepIcon />} incomplete={<StepNumber />} />
                      </StepIndicator>
                      <Box flexShrink="0">
                        <StepTitle>{node}</StepTitle>
                      </Box>
                      <StepSeparator />
                    </Step>
                  ))}
                </Stepper>
              </CardBody>
            </Card>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {/* Task Info */}
              <Card>
                <CardHeader>
                  <Heading size="md">Task Analysis</Heading>
                </CardHeader>
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    <HStack justify="space-between">
                      <Text color="gray.500">Objective:</Text>
                      <Text fontWeight="medium">{result.objective}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="gray.500">Task Type:</Text>
                      <Badge colorScheme="purple" textTransform="capitalize">{result.task_type}</Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="gray.500">Confidence:</Text>
                      <Badge colorScheme={getConfidenceColor(result.confidence)}>
                        {result.confidence}%
                      </Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="gray.500">Risk Score:</Text>
                      <Badge colorScheme={getRiskColor(result.risk_score)}>
                        {result.risk_score}
                      </Badge>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Metrics */}
              <Card>
                <CardHeader>
                  <Heading size="md">Execution Metrics</Heading>
                </CardHeader>
                <CardBody>
                  {result.metrics && Object.keys(result.metrics).length > 0 ? (
                    <VStack align="stretch" spacing={2}>
                      {Object.entries(result.metrics).map(([key, value]) => (
                        <HStack key={key} justify="space-between">
                          <Text color="gray.500" textTransform="capitalize">{key}:</Text>
                          <Text fontWeight="medium">{typeof value === 'number' ? value.toFixed(2) : value}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  ) : (
                    <Text color="gray.500">No metrics available</Text>
                  )}
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Final Output */}
            <Card>
              <CardHeader>
                <Heading size="md">Final Output</Heading>
              </CardHeader>
              <CardBody>
                <Text fontSize="lg" fontWeight="medium" mb={4}>
                  {result.final_output || 'No output generated'}
                </Text>
                {result.explanation && (
                  <>
                    <Divider my={4} />
                    <Text color="gray.600">{result.explanation}</Text>
                  </>
                )}
              </CardBody>
            </Card>
          </>
        )}
      </VStack>
    </Box>
  )
}

export default TreeOfLife
