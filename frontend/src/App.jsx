import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageProvider'
import { AuthProvider } from './context/AuthProvider'
import Layout from './components/Layout'
import BrowseOpportunities from './pages/BrowseOpportunities'
import AuthPage from './pages/AuthPage'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import OpportunityDetails from './pages/OpportunityDetails'
import VerifyEmail from './pages/VerifyEmail'
import { useAuth } from './context/useAuth'
import './index.css'

function DashboardEntry() {
  const { user, isInitializing } = useAuth()

  if (isInitializing) return <div className="empty-state">Checking your session...</div>
  if (!user) return <Navigate to="/signin" replace state={{ from: '/dashboard' }} />
  return <Navigate to={`/${user.role}`} replace />
}

function RoleDashboard({ role }) {
  const { user, isInitializing } = useAuth()

  if (isInitializing) return <div className="empty-state">Checking your session...</div>
  if (!user) return <Navigate to="/signin" replace state={{ from: `/${role}` }} />
  if (user.role !== role) return <Navigate to={`/${user.role}`} replace />
  return <Dashboard />
}

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/opportunities" element={<BrowseOpportunities />} />
              <Route path="/opportunities/:id" element={<OpportunityDetails />} />
              <Route path="/signin" element={<AuthPage mode="signin" />} />
              <Route path="/register" element={<AuthPage mode="register" />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/dashboard" element={<DashboardEntry />} />
              <Route path="/admin" element={<RoleDashboard role="admin" />} />
              <Route path="/admin/dashboard" element={<RoleDashboard role="admin" />} />
              <Route path="/employer" element={<RoleDashboard role="employer" />} />
              <Route path="/employer/dashboard" element={<RoleDashboard role="employer" />} />
              <Route path="/seeker" element={<RoleDashboard role="seeker" />} />
              <Route path="/seeker/dashboard" element={<RoleDashboard role="seeker" />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  )
}

export default App
