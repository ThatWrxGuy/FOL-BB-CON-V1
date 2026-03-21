import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Pages
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Finance from './pages/Finance'
import Admin from './pages/Admin'
import Analytics from './pages/Analytics'
import UserAnalytics from './pages/UserAnalytics'
import Onboarding from './pages/Onboarding'
import Demo from './pages/Demo'
import Goals from './pages/Goals'
import Tasks from './pages/Tasks'
import Notifications from './pages/Notifications'
import Subscription from './pages/Subscription'
import Help from './pages/Help'
import Domains from './pages/Domains'
import ExecutiveBrief from './pages/ExecutiveBrief'
import TreeOfLife from './pages/TreeOfLife'
import Metatron from './pages/Metatron'

// Design System Layout
import { Layout } from './components'

// Design System Loading State
import { Spinner, LoadingOverlay } from './components'

function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return <LoadingOverlay message="Loading..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function App() {
  const { loading } = useAuth()

  if (loading) {
    return <LoadingOverlay fullScreen message="Loading Busy Bee..." />
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="/onboarding" element={<Onboarding />} />
      
      {/* Protected routes with Design System Layout */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route 
          path="dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="finance" 
          element={
            <ProtectedRoute>
              <Finance />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="settings" 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />
        {/* Admin routes - protected, not shown in sidebar */}
        <Route 
          path="admin" 
          element={
            <ProtectedRoute requireAdmin>
              <Admin />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="analytics" 
          element={
            <ProtectedRoute requireAdmin>
              <Analytics />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="my-analytics" 
          element={
            <ProtectedRoute>
              <UserAnalytics />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="domains" 
          element={
            <ProtectedRoute>
              <Domains />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="briefs" 
          element={
            <ProtectedRoute>
              <ExecutiveBrief />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="tree" 
          element={
            <ProtectedRoute>
              <TreeOfLife />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="metatron" 
          element={
            <ProtectedRoute>
              <Metatron />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="goals" 
          element={
            <ProtectedRoute>
              <Goals />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="tasks" 
          element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="notifications" 
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="subscription" 
          element={
            <ProtectedRoute>
              <Subscription />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="help" 
          element={
            <ProtectedRoute>
              <Help />
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
