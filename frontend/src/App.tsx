import { Navigate, Route, Routes } from 'react-router-dom'
import { CatalogShell } from '@/components/catalog/catalog-shell'
import { AppLayout } from '@/components/layout/app-layout'
import { CatalogCategoryPage } from '@/pages/catalog-category-page'
import { CatalogCoursePage } from '@/pages/catalog-course-page'
import { CatalogStructurePage } from '@/pages/catalog-structure-page'
import { CatalogTrackPage } from '@/pages/catalog-track-page'
import { FinancePage } from '@/pages/finance-page'
import { NotFoundPage } from '@/pages/not-found-page'
import { UsersPage } from '@/pages/users-page'

function App() {
  return (
    <Routes>
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
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
