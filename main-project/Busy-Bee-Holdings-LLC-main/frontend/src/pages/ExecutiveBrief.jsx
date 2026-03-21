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
  Select,
  Divider,
  SimpleGrid,
  Progress,
  useToast,
} from '@chakra-ui/react'
import { FiAlertTriangle, FiCheckCircle, FiTrendingUp, FiActivity } from 'react-icons/fi'
import { briefAPI } from '../services/api'

function ExecutiveBrief() {
  const [brief, setBrief] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('Weekly')
  const [generating, setGenerating] = useState(false)
  const toast = useToast()

  useEffect(() => {
    fetchBrief()
  }, [])

  const fetchBrief = async () => {
    setLoading(true)
    try {
      const response = await briefAPI.getLatest()
      setBrief(response.data)
    } catch (error) {
      console.error('Error fetching brief:', error)
      toast({
        title: 'Error',
        description: 'Failed to load executive brief',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const generateBrief = async () => {
    setGenerating(true)
    try {
      const response = await briefAPI.generate(period)
      setBrief(response.data)
      toast({
        title: 'Success',
        description: 'Executive brief generated',
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      console.error('Error generating brief:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate brief',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setGenerating(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational': return 'green'
      case 'warning': return 'orange'
      case 'critical': return 'red'
      default: return 'gray'
    }
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'red'
      case 'medium': return 'orange'
      case 'low': return 'green'
      default: return 'gray'
    }
  }

  if (loading) {
    return (
      <Center h="400px">
        <Spinner size="xl" color="brand.500" />
      </Center>
    )
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <Box>
            <Heading size="lg">Executive Brief</Heading>
            <Text color="gray.600">AI-powered strategic overview</Text>
          </Box>
          <HStack>
            <Select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              w="150px"
            >
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
            </Select>
            <Button
              colorScheme="brand"
              onClick={generateBrief}
              isLoading={generating}
            >
              Generate Brief
            </Button>
          </HStack>
        </HStack>

        {brief && (
          <>
            {/* System Status */}
            <Card>
              <CardHeader pb={2}>
                <HStack>
                  <FiActivity />
                  <Heading size="md">System Status</Heading>
                </HStack>
              </CardHeader>
              <CardBody pt={0}>
                <HStack spacing={4}>
                  <Badge colorScheme={getStatusColor(brief.system_status)} fontSize="md" px={3} py={1}>
                    {brief.system_status?.toUpperCase() || 'UNKNOWN'}
                  </Badge>
                  <Text color="gray.600">Strategic Posture: <strong>{brief.strategic_posture}</strong></Text>
                  <Text color="gray.500">Confidence: <strong>{brief.confidence_score}%</strong></Text>
                </HStack>
              </CardBody>
            </Card>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {/* Top Priorities */}
              <Card>
                <CardHeader pb={2}>
                  <HStack>
                    <FiTrendingUp />
                    <Heading size="md">Top Priorities</Heading>
                  </HStack>
                </CardHeader>
                <CardBody pt={0}>
                  <VStack align="stretch" spacing={2}>
                    {(brief.top_priorities || []).map((priority, index) => (
                      <HStack key={index} p={2} bg="gray.50" borderRadius="md">
                        <Badge colorScheme="brand">{index + 1}</Badge>
                        <Text>{priority}</Text>
                      </HStack>
                    ))}
                    {(!brief.top_priorities || brief.top_priorities.length === 0) && (
                      <Text color="gray.500">No priorities set</Text>
                    )}
                  </VStack>
                </CardBody>
              </Card>

              {/* Critical Risks */}
              <Card>
                <CardHeader pb={2}>
                  <HStack>
                    <FiAlertTriangle />
                    <Heading size="md">Critical Risks</Heading>
                  </HStack>
                </CardHeader>
                <CardBody pt={0}>
                  <VStack align="stretch" spacing={2}>
                    {(brief.critical_risks || []).map((risk, index) => (
                      <HStack key={index} p={2} bg="red.50" borderRadius="md">
                        <Badge colorScheme="red">{index + 1}</Badge>
                        <Text>{risk}</Text>
                      </HStack>
                    ))}
                    {(!brief.critical_risks || brief.critical_risks.length === 0) && (
                      <Text color="gray.500">No critical risks</Text>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Domain Scores */}
            <Card>
              <CardHeader pb={2}>
                <HStack>
                  <FiCheckCircle />
                  <Heading size="md">Domain Scores</Heading>
                </HStack>
              </CardHeader>
              <CardBody pt={0}>
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                  {Object.entries(brief.domain_scores || {}).map(([domain, score]) => (
                    <Box key={domain} p={3} bg="gray.50" borderRadius="md">
                      <Text fontWeight="bold" textTransform="capitalize">{domain}</Text>
                      <Progress
                        value={score}
                        colorScheme={score >= 70 ? 'green' : score >= 50 ? 'orange' : 'red'}
                        mt={2}
                      />
                      <Text fontSize="sm" color="gray.600" mt={1}>{score}%</Text>
                    </Box>
                  ))}
                </SimpleGrid>
              </CardBody>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader pb={2}>
                <HStack>
                  <FiTrendingUp />
                  <Heading size="md">AI Recommendations</Heading>
                </HStack>
              </CardHeader>
              <CardBody pt={0}>
                <VStack align="stretch" spacing={3}>
                  {(brief.recommendations || []).map((rec, index) => (
                    <Box key={index} p={4} border="1px" borderColor="gray.200" borderRadius="md">
                      <HStack justify="space-between">
                        <HStack>
                          <Badge colorScheme={getUrgencyColor(rec.urgency)}>{rec.urgency}</Badge>
                          <Text fontWeight="bold">{rec.title}</Text>
                        </HStack>
                        <Badge>{rec.domain}</Badge>
                      </HStack>
                      <Text mt={2} color="gray.600">{rec.why}</Text>
                      <Text mt={2} fontWeight="medium" color="brand.600">
                        Action: {rec.action_text}
                      </Text>
                    </Box>
                  ))}
                  {(!brief.recommendations || brief.recommendations.length === 0) && (
                    <Text color="gray.500">No recommendations available</Text>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </>
        )}

        {!brief && (
          <Center py={10}>
            <VStack>
              <Text color="gray.500">No executive brief available</Text>
              <Button colorScheme="brand" onClick={generateBrief}>
                Generate Your First Brief
              </Button>
            </VStack>
          </Center>
        )}
      </VStack>
    </Box>
  )
}

export default ExecutiveBrief
