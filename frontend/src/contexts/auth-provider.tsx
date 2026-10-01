import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { User } from '@/types/models'
import { AuthContext } from '@/contexts/auth-context'
import {
  API_BASE_URL,
  clearStoredSession,
  getSession,
  getSessionToken,
  saveSession,
  SESSION_EXPIRED_EVENT,
} from '@/services/session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    const existing = getSession()
    if (!existing) {
      setIsLoading(false)
      return
    }

    void fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${existing.accessToken}` },
    }).then(async (response) => {
      if (response.status === 401) {
        if (getSessionToken() === existing.accessToken) clearStoredSession()
        return null
      }
      if (!response.ok) throw new Error('Não foi possível restaurar a sessão')
      return response.json() as Promise<User>
    }).then((currentUser) => {
      if (active && currentUser && getSessionToken() === existing.accessToken) setUser(currentUser)
    }).catch(() => {
      if (active && getSessionToken() === existing.accessToken) setUser(null)
    }).finally(() => {
      if (active) setIsLoading(false)
    })

    return () => { active = false }
  }, [])

  useEffect(() => {
    const expire = () => setUser(null)
    window.addEventListener(SESSION_EXPIRED_EVENT, expire)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, expire)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const body = await response.json().catch(() => null) as
      | { accessToken: string; user: User; message?: string }
      | null
    if (!response.ok || !body?.accessToken || !body.user) {
      throw new Error(body?.message ?? 'Não foi possível entrar. Confira email e senha.')
    }

    saveSession({ accessToken: body.accessToken, user: body.user })
    setUser(body.user)
    return body.user
  }, [])

  const logout = useCallback(() => {
    clearStoredSession()
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, isLoading, login, logout }), [user, isLoading, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
