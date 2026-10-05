import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import { API_BASE_URL } from '@/services/session'

export function LoginPage() {
  const { user, isLoading, login } = useAuth()
  const location = useLocation()
  const state = location.state as { from?: { pathname: string }; registeredEmail?: string } | null
  const [email, setEmail] = useState(state?.registeredEmail ?? '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const destination = state?.from?.pathname ?? '/'

  if (isLoading) return <div className="min-h-screen bg-hero" />
  if (user) return <Navigate to={destination} replace />

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await login(email, password)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível entrar.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-hero px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-white/70 bg-white p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">CMP1058</p>
        <h1 className="mt-3 text-2xl font-bold text-slate-950">Courses Platform</h1>
        <p className="mt-2 text-sm text-slate-600">Entre com sua conta. O painel de gestão é exclusivo para administradores.</p>
        {state?.registeredEmail ? <p role="status" className="mt-4 rounded-xl bg-teal-50 p-3 text-sm text-teal-800">Conta criada com sucesso! Entre com seu email e senha.</p> : null}
        <form className="mt-8 space-y-5" onSubmit={submit}>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Email
            <Input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Senha
            <Input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Ainda não tem uma conta?{' '}
          <Link to="/cadastro" state={{ from: state?.from }} className="font-semibold text-teal-700 hover:underline">Criar conta</Link>
        </p>
        <p className="mt-4 text-center text-xs text-slate-500">
          <a href={`${API_BASE_URL}/docs/`} target="_blank" rel="noreferrer" className="hover:text-teal-700 hover:underline">Documentação da API (Swagger)</a>
        </p>
      </section>
    </main>
  )
}
