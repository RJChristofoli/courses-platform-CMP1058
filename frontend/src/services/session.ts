import type { User } from '@/types/models'

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'
export const SESSION_KEY = 'courses-platform.session'
export const SESSION_EXPIRED_EVENT = 'courses-platform.session-expired'

export interface UserSession {
  accessToken: string
  user: User
}

export function getSession(): UserSession | null {
  try {
    const value = window.sessionStorage.getItem(SESSION_KEY)
    if (!value) return null
    const session = JSON.parse(value) as UserSession
    if (!session.accessToken || !session.user) return null
    return session
  } catch {
    return null
  }
}

export function getSessionToken() {
  return getSession()?.accessToken ?? null
}

export function saveSession(session: UserSession) {
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearStoredSession() {
  window.sessionStorage.removeItem(SESSION_KEY)
}

export function clearSession() {
  clearStoredSession()
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
}
