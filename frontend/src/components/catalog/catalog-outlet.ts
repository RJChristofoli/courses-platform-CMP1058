import { useOutletContext } from 'react-router-dom'
import { useAcademicCatalog } from '@/hooks/use-academic-catalog'

export type CatalogOutletContext = ReturnType<typeof useAcademicCatalog>

export function useCatalogOutlet() {
  return useOutletContext<CatalogOutletContext>()
}
