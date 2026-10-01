import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'

export function LoginPage() {
  const { user, isLoading, login } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const destination = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/'

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
        <p className="mt-2 text-sm text-slate-600">Entre com a conta de administrador para acessar o painel.</p>
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
      </section>
    </main>
  )
}
