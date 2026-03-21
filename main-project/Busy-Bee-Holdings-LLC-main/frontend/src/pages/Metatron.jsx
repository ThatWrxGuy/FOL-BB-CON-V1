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
  Grid,
  GridItem,
  Tag,
  TagLabel,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { FiPlay, FiActivity, FiBox, FiGitBranch, FiZap, FiLayers } from 'react-icons/fi'
import { metatronAPI } from '../services/api'

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
  MetatronCore: 'gold',
}

function Metatron() {
  const [input, setInput] = useState('')
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [topology, setTopology] = useState(null)
  const [health, setHealth] = useState(null)
  const toast = useToast()

  useEffect(() => {
    checkHealth()
    fetchTopology()
  }, [])

  const checkHealth = async () => {
    try {
      const response = await metatronAPI.health()
      setHealth(response.data)
    } catch (error) {
      console.error('Health check failed:', error)
    }
  }

  const fetchTopology = async () => {
    try {
      const response = await metatronAPI.topology()
      setTopology(response.data)
    } catch (error) {
      console.error('Topology fetch failed:', error)
    }
  }

  const runMetatron = async () => {
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
      const response = await metatronAPI.run(input, domain || null)
      setResult(response.data)
      toast({
        title: 'Metatron Execution Complete',
        description: 'Mesh routing + Tree execution finished',
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      console.error('Metatron run error:', error)
      toast({
        title: 'Error',
        description: 'Failed to run Metatron engine',
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
            <Heading size="lg">🔮 Metatron Cube</Heading>
            <Text color="gray.600">Advanced mesh overlay + Tree-of-Life orchestration</Text>
          </Box>
          <HStack>
            <Icon as={FiActivity} color={health?.status === 'ok' ? 'gold.500' : 'gray.500'} />
            <Text fontSize="sm" color="gray.500">
              {health?.status === 'ok' ? 'Overlay Online' : 'Overlay Offline'}
            </Text>
          </HStack>
        </HStack>

        {/* Quick Info Cards */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
          <Card borderTop="4px" borderTopColor="gold.400">
            <CardBody>
              <HStack>
                <Icon as={FiBox} boxSize={8} color="gold.500" />
                <Box>
                  <Text fontSize="sm" color="gray.500">Metatron</Text>
                  <Text fontWeight="bold">Mesh Overlay</Text>
                </Box>
              </HStack>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <HStack>
                <Icon as={FiGitBranch} boxSize={8} color="purple.500" />
                <Box>
                  <Text fontSize="sm" color="gray.500">Smart Entry</Text>
                  <Text fontWeight="bold">Context-Aware</Text>
                </Box>
              </HStack>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <HStack>
                <Icon as={FiZap} boxSize={8} color="blue.500" />
                <Box>
                  <Text fontSize="sm" color="gray.500">Fast Path</Text>
                  <Text fontWeight="bold">Shortest Route</Text>
                </Box>
              </HStack>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <HStack>
                <Icon as={FiLayers} boxSize={8} color="green.500" />
                <Box>
                  <Text fontSize="sm" color="gray.500">Dual Trace</Text>
                  <Text fontWeight="bold">Mesh + Tree</Text>
                </Box>
              </HStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Topology Visualization */}
        {topology && (
          <Card>
            <CardHeader>
              <Heading size="md">Network Topology</Heading>
            </CardHeader>
            <CardBody>
              <Text fontSize="sm" color="gray.500" mb={4}>
                {topology.nodes?.length || 0} nodes and {topology.edges?.length || 0} edges in the mesh network
              </Text>
              <Wrap spacing={2}>
                {topology.nodes?.map((node) => (
                  <WrapItem key={node.name}>
                    <Tag
                      size="lg"
                      colorScheme={NODE_COLORS[node.name] || 'gray'}
                      borderRadius="full"
                    >
                      <TagLabel>{node.name}</TagLabel>
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
              {topology.edges && topology.edges.length > 0 && (
                <Box mt={4}>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>Connections:</Text>
                  <Text fontSize="xs" color="gray.500">
                    {topology.edges.slice(0, 5).map((edge, i) => (
                      <span key={i}>{edge.from} → {edge.to} | </span>
                    ))}
                    {topology.edges.length > 5 && `... +${topology.edges.length - 5} more`}
                  </Text>
                </Box>
              )}
            </CardBody>
          </Card>
        )}

        {/* Input Form */}
        <Card>
          <CardHeader>
            <Heading size="md">Ask the Metatron</Heading>
            <Text fontSize="sm" color="gray.500">
              Uses intelligent entry point selection based on your question
            </Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <Textarea
                placeholder="e.g., Should I take the new job offer? or What's my financial health score?"
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
                  <option value="intelligence">Intelligence</option>
                  <option value="life_architecture">Life Architecture</option>
                </Select>
                <Button
                  colorScheme="yellow"
                  leftIcon={<FiPlay />}
                  onClick={runMetatron}
                  isLoading={loading}
                  loadingText="Processing..."
                >
                  Run Metatron
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Results */}
        {loading && (
          <Center py={10}>
            <VStack spacing={4}>
              <Spinner size="xl" color="gold.500" thickness="4px" />
              <Text color="gray.500">Metatron is routing through the mesh...</Text>
              <Text fontSize="sm" color="gray.400">Finding optimal path → Executing Tree</Text>
            </VStack>
          </Center>
        )}

        {result && !loading && (
          <>
            {/* Execution Traces */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {/* Mesh Trace */}
              <Card borderTop="4px" borderTopColor="gold.400">
                <CardHeader>
                  <HStack>
                    <Icon as={FiBox} color="gold.500" />
                    <Heading size="sm">Mesh Trace (Lateral)</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <Text fontSize="sm" color="gray.500" mb={2}>Entry Point Selection:</Text>
                  <Badge colorScheme="gold" fontSize="md" mb={2}>{result.selected_entry}</Badge>
                  <Text fontSize="sm" color="gray.500" mb={2}>Path Through Mesh:</Text>
                  <HStack wrap="wrap" spacing={1}>
                    {result.mesh_trace?.map((node, i) => (
                      <>
                        <Badge key={i} colorScheme={NODE_COLORS[node] || 'gray'}>{node}</Badge>
                        {i < result.mesh_trace.length - 1 && <Text>→</Text>}
                      </>
                    ))}
                  </HStack>
                  <Divider my={3} />
                  <Text fontSize="sm" color="gray.500">Reachable Nodes:</Text>
                  <Wrap spacing={1} mt={2}>
                    {result.reachable_nodes?.map((node, i) => (
                      <WrapItem key={i}>
                        <Tag size="sm" colorScheme="gray">{node}</Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                </CardBody>
              </Card>

              {/* Tree Route */}
              <Card borderTop="4px" borderTopColor="purple.400">
                <CardHeader>
                  <HStack>
                    <Icon as={FiGitBranch} color="purple.500" />
                    <Heading size="sm">Tree Execution (Vertical)</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <Text fontSize="sm" color="gray.500" mb={2}>Path Through Tree:</Text>
                  <HStack wrap="wrap" spacing={1}>
                    {result.tree_route?.map((node, i) => (
                      <>
                        <Badge key={i} colorScheme={NODE_COLORS[node] || 'gray'}>{node}</Badge>
                        {i < result.tree_route.length - 1 && <Text>→</Text>}
                      </>
                    ))}
                  </HStack>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Task Info */}
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
              <Card>
                <CardBody>
                  <Text fontSize="sm" color="gray.500">Confidence</Text>
                  <Text fontSize="2xl" fontWeight="bold" color={`${getConfidenceColor(result.confidence)}.500`}>
                    {result.confidence}%
                  </Text>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Text fontSize="sm" color="gray.500">Risk Score</Text>
                  <Text fontSize="2xl" fontWeight="bold" color={`${getRiskColor(result.risk_score)}.500`}>
                    {result.risk_score}
                  </Text>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Text fontSize="sm" color="gray.500">Run ID</Text>
                  <Text fontSize="sm" fontFamily="mono">{result.run_id?.slice(0, 8)}</Text>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Text fontSize="sm" color="gray.500">Start Node</Text>
                  <Badge colorScheme={NODE_COLORS[result.start_node] || 'gray'}>
                    {result.start_node}
                  </Badge>
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

export default Metatron
