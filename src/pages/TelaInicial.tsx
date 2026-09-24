import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import fundo from '../assets/fundo-1.jpg'
import { Logo } from '../components/Logo'
import { classesBotao } from '../components/ui'
import { AVISO_AGRONOMICO } from '../content/textos'

const PASSOS = [
  { titulo: 'Fotografe a planta', texto: 'Pelo celular ou computador, uma foto do cafeeiro inteiro.' },
  { titulo: 'A IA examina cada folha', texto: 'Cada folha visível é localizada e classificada em poucos segundos.' },
  { titulo: 'Receba o diagnóstico', texto: 'Tipo de estresse, severidade e orientações de cuidado.' },
]

/** Tela 1 — apresenta o Cafélens e convida a começar. */
export function TelaInicial() {
  return (
    <div className="relative isolate min-h-dvh overflow-hidden bg-folha-900 text-white">
      <img src={fundo} alt="" className="absolute inset-0 -z-20 size-full animate-respirar object-cover object-[70%_center]" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-folha-900 via-folha-900/80 to-folha-900/20" aria-hidden />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-folha-900 via-transparent to-transparent" aria-hidden />

      {/* A lente: o motivo visual do Cafélens, pousado sobre uma folha da foto */}
      <div
        className="pointer-events-none absolute top-[38%] right-[12%] -z-10 hidden size-56 rounded-full border border-white/60 shadow-[0_0_0_1px_rgb(255_255_255/0.15),0_0_80px_rgb(255_255_255/0.12)] lg:block"
        aria-hidden
      >
        <span className="absolute -bottom-3 left-1/2 h-6 w-px bg-white/60" />
      </div>

      <div className="mx-auto flex min-h-dvh max-w-6xl flex-col px-6 pt-8 pb-10 sm:px-10">
        <header>
          <Logo claro tamanho="sm" />
        </header>

        <main className="flex flex-1 flex-col justify-center py-14">
          <p className="animate-surgir text-sm font-medium tracking-[0.2em] text-folha-300 uppercase">Diagnóstico de cafeeiros por imagem</p>
          <h1 className="font-display-suave mt-5 max-w-3xl animate-surgir text-5xl leading-[1.02] font-semibold tracking-tight text-balance [animation-delay:60ms] sm:text-7xl">
            Da folha ao diagnóstico, em segundos.
          </h1>
          <p className="mt-6 max-w-xl animate-surgir text-lg leading-relaxed text-white/80 [animation-delay:120ms]">
            O Cafélens usa visão computacional para encontrar sinais de ferrugem, bicho-mineiro, cercosporiose e phoma em
            cada folha do cafeeiro — antes que eles comprometam a lavoura. Sem equipamento especial, sem conhecimento técnico.
          </p>
          <div className="mt-9 flex animate-surgir flex-wrap items-center gap-4 [animation-delay:180ms]">
            <Link to="/enviar" className={classesBotao('destaque', 'min-h-13 px-7 text-base')}>
              Começar diagnóstico <ArrowRight aria-hidden />
            </Link>
            <Link to="/historico" className={classesBotao('claro', 'min-h-13 px-6')}>
              Ver histórico
            </Link>
          </div>
        </main>

        <section aria-labelledby="como-funciona" className="border-t border-white/15 pt-8">
          <h2 id="como-funciona" className="text-xs font-medium tracking-[0.2em] text-white/60 uppercase">
            Como funciona
          </h2>
          <ol className="mt-5 grid gap-6 sm:grid-cols-3">
            {PASSOS.map((passo, i) => (
              <li key={passo.titulo} className="flex gap-4">
                <span className="font-display-suave text-3xl leading-none text-folha-300 tabular-nums">{i + 1}</span>
                <span>
                  <span className="block font-medium">{passo.titulo}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-white/65">{passo.texto}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <footer className="mt-10 text-xs leading-relaxed text-white/45">
          <p>
            Projeto de pesquisa aplicada da UNIFRAN — Estimativa de Severidade e Classificação de Estresses Bióticos em Folhas
            de <i>Coffea arabica</i> via Aprendizado por Transferência.
          </p>
          <p className="mt-1">{AVISO_AGRONOMICO}</p>
        </footer>
      </div>
    </div>
  )
}
