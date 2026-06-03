import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/app-layout'
import { CatalogPage } from '@/pages/catalog-page'
import { DashboardPage } from '@/pages/dashboard-page'
import { FinancePage } from '@/pages/finance-page'
import { NotFoundPage } from '@/pages/not-found-page'
import { UsersPage } from '@/pages/users-page'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate replace to="/dashboard" />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/catalogo" element={<CatalogPage />} />
        <Route path="/usuarios" element={<UsersPage />} />
        <Route path="/financeiro" element={<FinancePage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
