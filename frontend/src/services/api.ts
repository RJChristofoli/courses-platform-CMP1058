import type { DashboardData } from '@/types/models'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

async function request<T>(resource: string) {
  const response = await fetch(`${API_BASE_URL}/${resource}`)

  if (!response.ok) {
    throw new Error(`Falha ao carregar ${resource}`)
  }

  return (await response.json()) as T
}

export async function getDashboardData(): Promise<DashboardData> {
  const [
    users,
    categories,
    courses,
    modules,
    lessons,
    tracks,
    plans,
    enrollments,
    subscriptions,
    payments,
    certificates,
  ] = await Promise.all([
    request<DashboardData['users']>('users'),
    request<DashboardData['categories']>('categories'),
    request<DashboardData['courses']>('courses'),
    request<DashboardData['modules']>('modules'),
    request<DashboardData['lessons']>('lessons'),
    request<DashboardData['tracks']>('tracks'),
    request<DashboardData['plans']>('plans'),
    request<DashboardData['enrollments']>('enrollments'),
    request<DashboardData['subscriptions']>('subscriptions'),
    request<DashboardData['payments']>('payments'),
    request<DashboardData['certificates']>('certificates'),
  ])

  return {
    users,
    categories,
    courses,
    modules,
    lessons,
    tracks,
    plans,
    enrollments,
    subscriptions,
    payments,
    certificates,
  }
}
