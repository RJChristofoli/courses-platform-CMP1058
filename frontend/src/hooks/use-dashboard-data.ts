import { useEffect, useState } from 'react'
import { getDashboardData } from '@/services/api'
import type { DashboardData } from '@/types/models'

interface DashboardState {
  data: DashboardData | null
  isLoading: boolean
  error: string | null
}

export function useDashboardData() {
  const [state, setState] = useState<DashboardState>({
    data: null,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    let isMounted = true

    void getDashboardData()
      .then((data) => {
        if (!isMounted) {
          return
        }

        setState({
          data,
          isLoading: false,
          error: null,
        })
      })
      .catch(() => {
        if (!isMounted) {
          return
        }

        setState({
          data: null,
          isLoading: false,
          error: 'Nao foi possivel carregar os dados iniciais da plataforma.',
        })
      })

    return () => {
      isMounted = false
    }
  }, [])

  return state
}
