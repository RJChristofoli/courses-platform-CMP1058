import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-hero px-6">
      <div className="max-w-lg rounded-[2rem] border border-white/70 bg-white/80 p-10 text-center shadow-soft backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">
          404
        </p>
        <h1 className="mt-4 text-4xl font-bold">Pagina nao encontrada</h1>
        <p className="mt-4">
          O caminho solicitado nao existe nesta etapa do projeto. Vamos te levar de volta ao painel.
        </p>
        <Button asChild className="mt-8">
          <Link to="/dashboard">Voltar ao dashboard</Link>
        </Button>
      </div>
    </main>
  )
}
