import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { CatalogShell } from '@/components/catalog/catalog-shell'
import { AppLayout } from '@/components/layout/app-layout'
import { CatalogCategoryPage } from '@/pages/catalog-category-page'
import { CatalogCoursePage } from '@/pages/catalog-course-page'
import { CatalogStructurePage } from '@/pages/catalog-structure-page'
import { CatalogTrackPage } from '@/pages/catalog-track-page'
import { FinancePage } from '@/pages/finance-page'
import { NotFoundPage } from '@/pages/not-found-page'
import { UsersPage } from '@/pages/users-page'
import { LoginPage } from '@/pages/login-page'
import { RegisterPage } from '@/pages/register-page'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'

function AdminRoute() {
  const { user, isLoading, logout } = useAuth()
  const location = useLocation()
  if (isLoading) return <div className="min-h-screen bg-hero" />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  if (user.role !== 'admin') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-hero px-4">
        <section className="max-w-md rounded-3xl bg-white p-8 text-center">
          <h1 className="text-xl font-bold text-slate-950">Painel exclusivo para administradores</h1>
          <p className="mt-2 text-sm text-slate-600">Esta conta pode acessar seus dados pelo Swagger da API.</p>
          <Button className="mt-6" onClick={logout}>Sair</Button>
        </section>
      </main>
    )
  }
  return <Outlet />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route element={<AdminRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate replace to="/catalogo/curso" />} />
          <Route path="/catalogo" element={<CatalogShell />}>
            <Route index element={<Navigate replace to="/catalogo/categoria" />} />
            <Route path="categoria" element={<CatalogCategoryPage />} />
            <Route path="curso" element={<CatalogCoursePage />} />
            <Route path="estrutura" element={<CatalogStructurePage />} />
            <Route path="trilha" element={<CatalogTrackPage />} />
          </Route>
          <Route path="/usuarios" element={<UsersPage />} />
          <Route path="/financeiro" element={<FinancePage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
