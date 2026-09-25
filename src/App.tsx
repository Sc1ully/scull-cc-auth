import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Layout from '@/components/Layout'
import LandingPage from '@/features/LandingPage'
import LoginPage from '@/features/auth/LoginPage'
import RegisterPage from '@/features/auth/RegisterPage'
import Dashboard from '@/features/dashboard/Dashboard'
import AdminLayout from '@/features/admin/AdminLayout'
import AdminOverview from '@/features/admin/OverviewPage'
import KeyInventoryPage from '@/features/admin/KeyInventoryPage'
import UsersPage from '@/features/admin/UsersPage'
import LootLabsSettingsPage from '@/features/admin/LootLabsSettingsPage'

function App() {
  const { user, loading, profile } = useAuth()

  if (loading) {
    return (
      <div className="page text-center">
        <p>Loading...</p>
      </div>
    )
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>

      <Route
        path="/dashboard"
        element={user ? <Layout /> : <Navigate to="/login" replace />}
      >
        <Route index element={<Dashboard />} />
      </Route>

      <Route
        path="/admin"
        element={user && isAdmin ? <AdminLayout /> : <Navigate to="/dashboard" replace />}
      >
        <Route index element={<AdminOverview />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="keys" element={<KeyInventoryPage />} />
        <Route path="lootlabs" element={<LootLabsSettingsPage />} />
      </Route>

      <Route
        path="*"
        element={
          <div className="page text-center">
            <h1>404</h1>
            <p>Page not found</p>
          </div>
        }
      />
    </Routes>
  )
}

export default App
