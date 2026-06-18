import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import { Layout } from '@/components/layout/layout'
import LoginPage from '@/pages/login'
import DashboardPage from '@/pages/dashboard'
import CompartmentsPage from '@/pages/inventory/compartments'
import PlotsPage from '@/pages/inventory/plots'
import TreesPage from '@/pages/inventory/trees'
import PermitsPage from '@/pages/permits/index'
import NewPermitPage from '@/pages/permits/new'
import PermitDetailsPage from '@/pages/permits/[id]'
import InspectionPage from '@/pages/inspection/index'
import NewInspectionPage from '@/pages/inspection/new'
import InspectionDetailsPage from '@/pages/inspection/[id]'
import EditInspectionPage from '@/pages/inspection/edit'
import GisExplorerPage from '@/pages/gis-explorer'
import ReportsPage from '@/pages/reports/index'
import MonitoringPage from '@/pages/monitoring/index'
import UsersPage from '@/pages/admin/users/index'
import NewUserPage from '@/pages/admin/users/new'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="forest-ui-theme">
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/gis" element={<GisExplorerPage />} />
              <Route path="/inventory/compartments" element={<CompartmentsPage />} />
              <Route path="/inventory/plots" element={<PlotsPage />} />
              <Route path="/inventory/trees" element={<TreesPage />} />
              <Route path="/inventory/*" element={<div>Inventory (Coming Soon)</div>} />

              {/* Permits Routes */}
              <Route path="/permits" element={<PermitsPage />} />
              <Route path="/permits/new" element={<NewPermitPage />} />
              <Route path="/permits/:id" element={<PermitDetailsPage />} />

              <Route path="/permits/:id" element={<PermitDetailsPage />} />

              <Route path="/inspection" element={<InspectionPage />} />
              <Route path="/inspection/new" element={<NewInspectionPage />} />
              <Route path="/inspection/:id" element={<InspectionDetailsPage />} />
              <Route path="/inspection/:id/edit" element={<EditInspectionPage />} />
              <Route path="/monitoring" element={<MonitoringPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/admin/users" element={<UsersPage />} />
              <Route path="/admin/users/new" element={<NewUserPage />} />
              <Route path="/admin/*" element={<div>Admin (Coming Soon)</div>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
