import { useState } from 'react'
import { flushSync } from 'react-dom'
import { Link, useLocation, useNavigate } from 'react-router'
import { ChevronRight, MapPinOff, Sprout } from 'lucide-react'
import type { FolhaDiagnostico } from '../../api'
import { MedidorSeveridade } from '../../components/MedidorSeveridade'
import { MolduraImagem } from '../../components/MolduraImagem'
import { BotaoSalvarAnalise } from './ModalSalvarAnalise'
import { cx } from '../../components/ui'
import { agruparPorCategoria, problemasDe } from '../../domain/analise'
import { CATEGORIAS } from '../../domain/categorias'
import { circuloEmPorcentagem } from '../../domain/geometria'
import { ROTULO_SEVERIDADE } from '../../domain/severidade'
import { useSessaoAnalise } from '../../state/SessaoAnalise'

/** Estado de navegação usado para a transição de volta do Detalhe. */
export interface EstadoVolta {
  deFolha?: string
}

/**
 * Tela 7 — RF04: círculos clicáveis por categoria sobre a foto.
 * Degrada para lista quando as folhas não trazem `regiao` (pendência do RF09).
 */
export function AbaVisualizacao() {
  const { analise } = useSessaoAnalise()
  const navigate = useNavigate()
  const volta = (useLocation().state as EstadoVolta | null)?.deFolha
  const [destacada, setDestacada] = useState<string | null>(null)
  const [clicada, setClicada] = useState<string | null>(null)
  if (!analise) return null

  const { diagnostico } = analise
  const problemas = problemasDe(diagnostico)
  const numero = new Map(problemas.map((f, i) => [f.id, i + 1]))
  const semRegiao = problemas.filter((f) => !f.regiao).length
  // Só um elemento por vez pode ter o nome da transição "lente".
  const comLente = clicada ?? volta

  function abrir(folha: FolhaDiagnostico) {
    flushSync(() => setClicada(folha.id))
    void navigate(`/visualizacao/${folha.id}`, { viewTransition: true })
  }

  if (problemas.length === 0) return <EstadoSaudavel imagemUrl={diagnostico.imagemUrl} />

  return (
    <div className="grid items-start gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:gap-12">
      <div className="animate-surgir md:sticky md:top-28">
        <MolduraImagem
          nomeTransicao="foto"
          src={diagnostico.imagemUrl}
          alt="Foto analisada com as folhas afetadas marcadas" status="problema" alturaMaxima="70vh">
          {(proporcao) =>
            problemas.map((folha) =>
              folha.regiao ? (
                <button
                  key={folha.id}
                  type="button"
                  onClick={() => abrir(folha)}
                  onMouseEnter={() => setDestacada(folha.id)}
                  onMouseLeave={() => setDestacada(null)}
                  onFocus={() => setDestacada(folha.id)}
                  onBlur={() => setDestacada(null)}
                  aria-label={`Folha ${numero.get(folha.id)}: ${CATEGORIAS[folha.categoria].nome}, severidade ${ROTULO_SEVERIDADE[folha.severidade].toLowerCase()}. Ver detalhes`}
                  className={cx(
                    'group absolute aspect-square min-w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] transition-[transform,box-shadow,background-color] duration-200 focus-visible:outline-offset-4',
                    destacada === folha.id ? 'z-10 scale-110 bg-white/15' : destacada ? 'opacity-60' : '',
                  )}
                  style={{
                    ...circuloEmPorcentagem(folha.regiao, proporcao),
                    borderColor: CATEGORIAS[folha.categoria].cor,
                    boxShadow: '0 0 0 2px rgb(255 255 255 / 0.9), 0 4px 18px rgb(0 0 0 / 0.35)',
                    viewTransitionName: comLente === folha.id ? 'lente' : undefined,
                  }}
                >
                  <span
                    className="absolute -top-1 -right-1 grid size-6 place-items-center rounded-full text-xs font-bold text-white ring-2 ring-white tabular-nums"
                    style={{ background: CATEGORIAS[folha.categoria].cor }}
                  >
                    {numero.get(folha.id)}
                  </span>
                </button>
              ) : null,
            )
          }
        </MolduraImagem>
        {semRegiao < problemas.length && (
          <p className="mt-4 text-center text-sm text-tinta-suave">Toque em um círculo para ver o problema de perto.</p>
        )}
      </div>

      <div className="animate-surgir [animation-delay:80ms]">
        <p className="mb-3 text-sm font-medium tracking-wide text-tinta-suave uppercase">Visualização avançada</p>
        <h1 tabIndex={-1} className="font-display-suave text-3xl leading-tight font-semibold tracking-tight outline-none sm:text-4xl">
          Problemas identificados
        </h1>

        {semRegiao > 0 && (
          <p className="mt-4 flex gap-2.5 rounded-2xl bg-papel-2 p-3.5 text-sm leading-relaxed text-tinta-suave">
            <MapPinOff className="mt-0.5 size-4 shrink-0" aria-hidden />
            {semRegiao === problemas.length
              ? 'A localização das folhas não está disponível para esta análise, então os problemas aparecem só em lista.'
              : `${semRegiao === 1 ? '1 folha não tem' : `${semRegiao} folhas não têm`} localização na foto e aparece${semRegiao === 1 ? '' : 'm'} só na lista.`}
          </p>
        )}

        <ul className="mt-6 grid gap-4">
          {agruparPorCategoria(problemas).map((grupo) => {
            const info = CATEGORIAS[grupo.categoria]
            return (
              <li key={grupo.categoria} className="overflow-hidden rounded-cartao bg-superficie shadow-cartao ring-1 ring-linha/60">
                <div className="flex gap-3 p-4 pb-3 sm:p-5 sm:pb-3">
                  <span className="mt-1.5 size-3 shrink-0 rounded-full" style={{ background: info.cor }} aria-hidden />
                  <div>
                    <h2 className="font-display-suave text-lg font-semibold">{info.nome}</h2>
                    <p className="mt-1 text-sm leading-relaxed text-tinta-suave">{info.sintomas}</p>
                  </div>
                </div>
                <ul className="border-t border-linha/70">
                  {grupo.folhas.map((folha) => (
                    <li key={folha.id}>
                      <Link
                        to={`/visualizacao/${folha.id}`}
                        onClick={(e) => {
                          e.preventDefault()
                          abrir(folha)
                        }}
                        onMouseEnter={() => setDestacada(folha.id)}
                        onMouseLeave={() => setDestacada(null)}
                        onFocus={() => setDestacada(folha.id)}
                        onBlur={() => setDestacada(null)}
                        className={cx(
                          'flex min-h-12 items-center gap-3 px-4 py-2.5 text-sm transition-colors sm:px-5',
                          destacada === folha.id ? 'bg-folha-50' : 'hover:bg-folha-50',
                        )}
                      >
                        <span
                          className="grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold text-white tabular-nums"
                          style={{ background: info.cor }}
                        >
                          {numero.get(folha.id)}
                        </span>
                        <span className="flex-1">
                          Folha {numero.get(folha.id)}
                          {!folha.regiao && <span className="ml-2 text-xs text-tinta-fraca">sem localização</span>}
                        </span>
                        <MedidorSeveridade nivel={folha.severidade} compacto />
                        <ChevronRight className="size-4 text-tinta-fraca" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            )
          })}
        </ul>
        <BotaoSalvarAnalise className="mt-6" />
      </div>
    </div>
  )
}

function EstadoSaudavel({ imagemUrl }: { imagemUrl: string }) {
  const cuidado = CATEGORIAS.saudavel
  return (
    <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
      <div className="animate-surgir">
        <MolduraImagem src={imagemUrl} alt="Foto analisada" status="saudavel" alturaMaxima="64vh" />
      </div>
      <div className="animate-surgir [animation-delay:80ms]">
        <p className="mb-3 text-sm font-medium tracking-wide text-tinta-suave uppercase">Visualização avançada</p>
        <h1 tabIndex={-1} className="font-display-suave text-3xl leading-tight font-semibold tracking-tight outline-none sm:text-4xl">
          Nenhum problema identificado
        </h1>
        <p className="mt-4 max-w-prose text-lg leading-relaxed text-tinta-suave">
          A análise não encontrou padrões de estresse biótico nas folhas desta foto. O que foi observado está dentro do esperado para
          uma planta saudável.
        </p>
        <section className="mt-8 rounded-cartao bg-folha-50 p-5 ring-1 ring-folha-100 sm:p-6" aria-labelledby="continuar-cuidando">
          <h2 id="continuar-cuidando" className="font-display-suave flex items-center gap-2 text-xl font-semibold text-folha-700">
            <Sprout className="size-5" aria-hidden /> Como continuar cuidando
          </h2>
          <p className="mt-3 leading-relaxed">{cuidado.comoCuidar}</p>
          <p className="mt-2 leading-relaxed">{cuidado.comoPrevenir}</p>
        </section>
        <BotaoSalvarAnalise variante="primario" className="mt-6" />
      </div>
    </div>
  )
}
