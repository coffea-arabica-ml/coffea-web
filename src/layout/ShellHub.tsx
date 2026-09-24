import { useEffect, useRef } from 'react'
import { Link, Navigate, Outlet, useLocation } from 'react-router'
import { FlaskConical } from 'lucide-react'
import { modoApi } from '../api'
import { Logo } from '../components/Logo'
import { AVISO_AGRONOMICO } from '../content/textos'
import { useSessaoAnalise } from '../state/SessaoAnalise'
import { NavegacaoAbas } from './NavegacaoAbas'

function SeloDemonstracao() {
  if (modoApi !== 'mock') return null
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-cereja-50 px-3 py-1 text-xs font-medium text-cereja-700 ring-1 ring-cereja-100"
      title="O modelo de diagnóstico ainda não está conectado: os resultados exibidos são simulados."
    >
      <FlaskConical className="size-3.5" aria-hidden />
      <span>
        Demonstração<span className="hidden xl:inline"> · resultados simulados</span>
      </span>
    </span>
  )
}

/** Moldura das 4 seções do hub: cabeçalho, navegação e conteúdo da aba. */
export function ShellHub() {
  const { pathname } = useLocation()
  const primeiraRenderizacao = useRef(true)

  // Ao trocar de aba, leva o foco ao título da nova tela (leitores de tela anunciam a mudança).
  useEffect(() => {
    if (primeiraRenderizacao.current) {
      primeiraRenderizacao.current = false
      return
    }
    document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-superficie focus:px-4 focus:py-2"
      >
        Pular para o conteúdo
      </a>
      <header className="sticky top-0 z-30 border-b border-linha/70 bg-papel/85 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 md:h-20">
          <Link to="/" aria-label="Cafélens — página inicial" className="shrink-0 rounded-full">
            <span className="md:hidden">
              <Logo tamanho="sm" />
            </span>
            <span className="hidden md:inline">
              <Logo />
            </span>
          </Link>
          <NavegacaoAbas variante="topo" />
          <SeloDemonstracao />
        </div>
      </header>

      <main id="conteudo" className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-28 sm:px-6 md:pt-10 md:pb-16">
        <Outlet />
      </main>

      <footer className="mx-auto hidden w-full max-w-6xl px-6 pb-8 text-xs text-tinta-fraca md:block">{AVISO_AGRONOMICO}</footer>
      <NavegacaoAbas variante="rodape" />
    </div>
  )
}

/** Resumo técnico e Visualização avançada só existem com uma análise em foco. */
export function ExigeAnalise() {
  const { analise } = useSessaoAnalise()
  if (!analise) return <Navigate to="/enviar" replace />
  return <Outlet />
}
