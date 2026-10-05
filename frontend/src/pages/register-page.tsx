import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import { registerUser } from '@/services/api'

export function RegisterPage() {
  const { user, isLoading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const from = (location.state as { from?: { pathname: string } } | null)?.from

  if (isLoading) return <div className="min-h-screen bg-hero" />
  if (user) return <Navigate to={from?.pathname ?? '/'} replace />

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return
    setError(null)
    if (!fullName.trim()) {
      setError('Informe seu nome completo.')
      return
    }
    if (password !== confirmation) {
      setError('As senhas não coincidem.')
      return
    }
    if (new TextEncoder().encode(password).length > 72) {
      setError('A senha é muito longa. Use no máximo 72 bytes em UTF-8.')
      return
    }
    setIsSubmitting(true)
    try {
      const account = await registerUser({ fullName: fullName.trim(), email: email.trim(), password })
      navigate('/login', { replace: true, state: { from, registeredEmail: account.email } })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível criar sua conta. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-hero px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-white/70 bg-white p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">CMP1058</p>
        <h1 className="mt-3 text-2xl font-bold text-slate-950">Criar conta</h1>
        <p className="mt-2 text-sm text-slate-600">Cadastre sua conta de aluno na Courses Platform.</p>
        <form className="mt-8 space-y-5" onSubmit={submit}>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Nome completo
            <Input autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} maxLength={150} required disabled={isSubmitting} />
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Email
            <Input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} required disabled={isSubmitting} />
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Senha
            <Input type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} maxLength={72} aria-describedby="password-hint" required disabled={isSubmitting} />
            <span id="password-hint" className="block text-xs font-normal text-slate-500">Use pelo menos 8 caracteres.</span>
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Confirmar senha
            <Input type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} minLength={8} maxLength={72} required disabled={isSubmitting} />
          </label>
          {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Criando conta...' : 'Criar conta'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Já tem uma conta?{' '}
          <Link to="/login" state={{ from }} className="font-semibold text-teal-700 hover:underline">Entrar</Link>
        </p>
      </section>
    </main>
  )
}
