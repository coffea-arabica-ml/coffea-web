import { Link, Navigate, useParams } from 'react-router'
import { ArrowLeft, ChevronLeft, ChevronRight, HeartPulse, ShieldCheck, Stethoscope } from 'lucide-react'
import { Lente } from '../../components/Lente'
import { MedidorSeveridade } from '../../components/MedidorSeveridade'
import { cx } from '../../components/ui'
import { problemasDe } from '../../domain/analise'
import { CATEGORIAS } from '../../domain/categorias'
import { useSessaoAnalise } from '../../state/SessaoAnalise'
import type { EstadoVolta } from './AbaVisualizacao'
import { BotaoSalvarAnalise } from './ModalSalvarAnalise'

/** Tela 8 — um problema de perto: a folha ampliada, o que é, como cuidar e como prevenir. */
export function DetalheProblema() {
  const { folhaId } = useParams()
  const { analise } = useSessaoAnalise()
  if (!analise) return null

  const { diagnostico } = analise
  const problemas = problemasDe(diagnostico)
  const indice = problemas.findIndex((f) => f.id === folhaId)
  if (indice === -1) return <Navigate to="/visualizacao" replace />

  const folha = problemas[indice]
  const info = CATEGORIAS[folha.categoria]
  const anterior = problemas[indice - 1]
  const proxima = problemas[indice + 1]
  const volta: EstadoVolta = { deFolha: folha.id }

  const secoes = [
    { titulo: 'O que é', Icone: Stethoscope, texto: info.sintomas },
    { titulo: 'Como cuidar', Icone: HeartPulse, texto: folha.comoCuidar ?? info.comoCuidar },
    { titulo: 'Como prevenir', Icone: ShieldCheck, texto: folha.comoPrevenir ?? info.comoPrevenir },
  ]

  return (
    <div className="grid items-start gap-8 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-14">
      <div className="flex flex-col items-center gap-6 md:sticky md:top-28">
        <Lente
          key={folha.id}
          src={diagnostico.imagemUrl}
          alt={`Folha ${indice + 1} ampliada`}
          regiao={folha.regiao}
          cor={info.cor}
          nomeTransicao="lente"
          className="w-[min(78vw,24rem)]"
        />
        {!folha.regiao && <p className="-mt-2 text-sm text-tinta-fraca">Localização indisponível — mostrando a foto inteira.</p>}

        <div className="flex items-center gap-4">
          <Link
            to="/visualizacao"
            state={volta}
            viewTransition
            className="group flex items-center gap-3 rounded-2xl bg-superficie p-1.5 pr-4 text-sm font-medium ring-1 ring-linha transition hover:ring-folha-300"
          >
            <img
              src={diagnostico.imagemUrl}
              alt=""
              className="size-12 rounded-xl object-cover"
              style={{ viewTransitionName: 'foto' }}
            />
            <span className="flex items-center gap-1.5">
              <ArrowLeft className="size-4 transition group-hover:-translate-x-0.5" aria-hidden /> Foto inteira
            </span>
          </Link>
          <BotaoSalvarAnalise />
        </div>
      </div>

      <article className="animate-surgir">
        <p className="flex items-center gap-2 text-sm font-medium tracking-wide text-tinta-suave uppercase">
          <span className="grid size-6 place-items-center rounded-full text-xs font-bold text-white" style={{ background: info.cor }}>
            {indice + 1}
          </span>
          Folha {indice + 1} de {problemas.length}
        </p>
        <h1 tabIndex={-1} className="font-display-suave mt-3 text-3xl leading-tight font-semibold tracking-tight outline-none sm:text-4xl">
          {info.nomeCompleto}
        </h1>
        <p className="mt-2 text-tinta-suave">
          Causada pelo {info.tipoAgente} <i>{info.agente}</i>
        </p>
        <div className="mt-5 inline-flex items-center gap-3 rounded-full bg-superficie px-4 py-2 ring-1 ring-linha">
          <span className="text-sm text-tinta-fraca">Severidade estimada</span>
          <MedidorSeveridade nivel={folha.severidade} />
        </div>

        <div className="mt-8 grid gap-6">
          {secoes.map(({ titulo, Icone, texto }) => (
            <section key={titulo} aria-labelledby={`secao-${titulo}`}>
              <h2 id={`secao-${titulo}`} className="font-display-suave flex items-center gap-2 text-xl font-semibold">
                <Icone className="size-5 text-folha-600" aria-hidden /> {titulo}
              </h2>
              <p className="mt-2 max-w-prose leading-relaxed text-tinta-suave">{texto}</p>
            </section>
          ))}
        </div>

        {problemas.length > 1 && (
          <nav aria-label="Outras folhas com problema" className="mt-10 flex justify-between gap-3 border-t border-linha pt-6">
            <NavFolha folhaId={anterior?.id} rotulo={anterior && `Folha ${indice}`} direcao="anterior" />
            <NavFolha folhaId={proxima?.id} rotulo={proxima && `Folha ${indice + 2}`} direcao="proxima" />
          </nav>
        )}
      </article>
    </div>
  )
}

function NavFolha({ folhaId, rotulo, direcao }: { folhaId?: string; rotulo?: string; direcao: 'anterior' | 'proxima' }) {
  if (!folhaId) return <span />
  const Icone = direcao === 'anterior' ? ChevronLeft : ChevronRight
  return (
    <Link
      to={`/visualizacao/${folhaId}`}
      replace
      viewTransition
      className={cx(
        'flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-medium text-folha-700 hover:bg-folha-50',
        direcao === 'proxima' && 'flex-row-reverse',
      )}
    >
      <Icone className="size-4" aria-hidden />
      {rotulo}
    </Link>
  )
}
