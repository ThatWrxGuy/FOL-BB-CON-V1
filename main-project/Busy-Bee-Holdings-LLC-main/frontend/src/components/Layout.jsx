import { useState, useEffect } from 'react'
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerBody,
  useBreakpointValue,
  Input,
  InputGroup,
  InputLeftElement,
  Badge,
  Tooltip,
} from '@chakra-ui/react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  FiHome,
  FiDollarSign,
  FiUser,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiBell,
  FiSearch,
  FiGrid,
  FiTarget,
  FiCheckSquare,
  FiTrendingUp,
  FiBarChart2,
  FiHelpCircle,
  FiCreditCard,
  FiFolder,
  FiZap,
  FiChevronLeft,
  FiChevronRight,
  FiCommand,
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'

const NavItem = ({ to, icon: Icon, label, isCollapsed, onClick }) => {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Tooltip label={label} placement="right" isDisabled={!isCollapsed} hasArrow>
      <NavLink to={to} onClick={onClick}>
        <HStack
          px={3}
          py={2.5}
          mx={2}
          rounded="lg"
          bg={isActive ? 'brand.50' : 'transparent'}
          color={isActive ? 'brand.600' : 'gray.500'}
          _hover={{ bg: 'brand.50', color: 'brand.600' }}
          transition="all 0.2s"
          justify={isCollapsed ? 'center' : 'flex-start'}
          spacing={isCollapsed ? 0 : 3}
        >
          <Icon size={20} />
          {!isCollapsed && (
            <Text fontWeight={isActive ? '600' : '500'} fontSize="sm">
              {label}
            </Text>
          )}
          {isActive && !isCollapsed && (
            <Box position="absolute" left={0} w="3px" h="24px" bg="brand.500" borderRadius="full" />
          )}
        </HStack>
      </NavLink>
    </Tooltip>
  )
}

function Sidebar({ onClose, isCollapsed, onToggle }) {
  const { user, logout } = useAuth()

  const navSections = [
    {
      title: 'WORKSPACE',
      items: [
        { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
        { to: '/domains', icon: FiFolder, label: 'Life Domains' },
        { to: '/goals', icon: FiTarget, label: 'Goals' },
        { to: '/tasks', icon: FiCheckSquare, label: 'Tasks' },
      ],
    },
    {
      title: 'AI INTELLIGENCE',
      items: [
        { to: '/briefs', icon: FiZap, label: 'Executive Brief' },
        { to: '/tree', icon: FiGrid, label: 'Tree of Life' },
        { to: '/metatron', icon: FiBarChart2, label: 'Metatron' },
      ],
    },
    {
      title: 'INSIGHTS',
      items: [
        { to: '/my-analytics', icon: FiTrendingUp, label: 'My Analytics' },
        { to: '/finance', icon: FiDollarSign, label: 'Finance' },
      ],
    },
    {
      title: 'ACCOUNT',
      items: [
        { to: '/notifications', icon: FiBell, label: 'Notifications' },
        { to: '/subscription', icon: FiCreditCard, label: 'Subscription' },
        { to: '/help', icon: FiHelpCircle, label: 'Help' },
        { to: '/profile', icon: FiUser, label: 'Profile' },
        { to: '/settings', icon: FiSettings, label: 'Settings' },
      ],
    },
  ]

  return (
    <VStack h="full" py={4} spacing={4} align="stretch">
      {/* Logo */}
      <HStack px={3} spacing={3} justify={isCollapsed ? 'center' : 'flex-start'}>
        <Box
          w={10}
          h={10}
          bg="brand.500"
          rounded="lg"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          <Text fontSize="xl" fontWeight="bold" color="white">B</Text>
        </Box>
        {!isCollapsed && (
          <VStack align="start" spacing={0}>
            <Text fontWeight="bold" fontSize="lg">Busy Bee</Text>
            <Text fontSize="xs" color="gray.500">Executive Intelligence</Text>
          </VStack>
        )}
      </HStack>

      {/* Toggle Button */}
      <Box px={2}>
        <IconButton
          icon={isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
          variant="ghost"
          size="sm"
          onClick={onToggle}
          w="full"
          aria-label="Toggle sidebar"
        />
      </Box>

      {/* Navigation */}
      <VStack px={1} spacing={1} align="stretch" flex={1} overflowY="auto">
        {navSections.map((section) => (
          <Box key={section.title}>
            {!isCollapsed && (
              <Text
                fontSize="xs"
                fontWeight="600"
                color="gray.400"
                px={4}
                py={2}
              >
                {section.title}
              </Text>
            )}
            {section.items.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                isCollapsed={isCollapsed}
                onClick={onClose}
              />
            ))}
          </Box>
        ))}
      </VStack>

      {/* User */}
      <Box px={2} pt={2} borderTop="1px" borderColor="gray.100">
        <Menu>
          <MenuButton w="full">
            <HStack
              spacing={3}
              p={2}
              rounded="lg"
              _hover={{ bg: 'gray.50' }}
              justify={isCollapsed ? 'center' : 'flex-start'}
            >
              <Avatar size="sm" name={user?.full_name || user?.email} />
              {!isCollapsed && (
                <VStack align="start" spacing={0} flex={1}>
                  <Text fontSize="sm" fontWeight="500" noOfLines={1}>
                    {user?.full_name || 'User'}
                  </Text>
                  <Text fontSize="xs" color="gray.500" noOfLines={1}>
                    {user?.email}
                  </Text>
                </VStack>
              )}
            </HStack>
          </MenuButton>
          <MenuList>
            <MenuItem icon={<FiUser />}>Profile</MenuItem>
            <MenuItem icon={<FiSettings />}>Settings</MenuItem>
            <MenuItem icon={<FiLogOut />} onClick={logout}>Logout</MenuItem>
          </MenuList>
        </Menu>
      </Box>
    </VStack>
  )
}

function Layout() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const isMobile = useBreakpointValue({ base: true, md: false })

  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true)
    } else {
      setIsCollapsed(false)
    }
  }, [isMobile])

  return (
    <Flex h="100vh">
      {/* Sidebar - Desktop */}
      {!isMobile && (
        <Box
          w={isCollapsed ? '70px' : '220px'}
          bg="white"
          borderRight="1px"
          borderColor="gray.100"
          transition="width 0.2s"
          flexShrink={0}
        >
          <Sidebar
            isCollapsed={isCollapsed}
            onToggle={() => setIsCollapsed(!isCollapsed)}
          />
        </Box>
      )}

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent maxW="260px">
          <DrawerBody p={0}>
            <Sidebar onClose={onClose} isCollapsed={false} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      <Box flex={1} overflow="auto" bg="gray.50">
        {/* Top Header */}
        <Flex
          px={4}
          py={3}
          bg="white"
          borderBottom="1px"
          borderColor="gray.100"
          align="center"
          justify="space-between"
          position="sticky"
          top={0}
          zIndex={10}
        >
          <HStack spacing={4}>
            {isMobile && (
              <IconButton icon={<FiMenu />} variant="ghost" onClick={onOpen} />
            )}
            {/* Search */}
            <InputGroup maxW="400px" display={{ base: 'none', md: 'flex' }}>
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray" />
              </InputLeftElement>
              <Input
                placeholder="Search... (Cmd+K)"
                bg="gray.50"
                border="none"
                _focus={{ bg: 'white', boxShadow: 'sm' }}
              />
            </InputGroup>
          </HStack>

          <HStack spacing={2}>
            {/* Command Palette Hint */}
            <Tooltip label="Command Palette (Cmd+K)">
              <IconButton
                icon={<FiCommand />}
                variant="ghost"
                size="sm"
                display={{ base: 'none', md: 'flex' }}
              />
            </Tooltip>

            {/* Notifications */}
            <Box position="relative">
              <IconButton icon={<FiBell />} variant="ghost" />
              <Badge
                position="absolute"
                top={1}
                right={1}
                colorScheme="red"
                borderRadius="full"
                boxSize={2}
              />
            </Box>
          </HStack>
        </Flex>

        {/* Page Content */}
        <Box p={{ base: 4, md: 6 }}>
          <Outlet />
        </Box>
      </Box>
    </Flex>
  )
}

export default Layout
