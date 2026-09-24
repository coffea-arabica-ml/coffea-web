import { Link } from 'react-router'
import { ArrowRight, MapPinOff } from 'lucide-react'
import { MedidorSeveridade } from '../../components/MedidorSeveridade'
import { MolduraImagem } from '../../components/MolduraImagem'
import { BotaoSalvarAnalise } from './ModalSalvarAnalise'
import { SeletorImagem } from '../../components/SeletorImagem'
import { classesBotao, formatarData } from '../../components/ui'
import { estaSaudavel, problemasDe } from '../../domain/analise'
import { CATEGORIAS } from '../../domain/categorias'
import { resumirDiagnostico } from '../../domain/resumo'
import { useSessaoAnalise } from '../../state/SessaoAnalise'
import { RotuloStatus } from '../../components/RotuloStatus'

/** Tela 6 — resumo textual e ficha por folha, sem a complexidade da visualização avançada. */
export function AbaResumo() {
  const { analise } = useSessaoAnalise()
  if (!analise) return null

  const { diagnostico } = analise
  const saudavel = estaSaudavel(diagnostico)
  const resumo = resumirDiagnostico(diagnostico)
  const problemas = problemasDe(diagnostico)
  const saudaveis = diagnostico.folhas.length - problemas.length

  return (
    <div className="grid items-start gap-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-12">
      <div className="flex animate-surgir flex-col items-center gap-4 md:sticky md:top-28">
        <Link to="/visualizacao" viewTransition aria-label="Abrir a visualização avançada" className="block w-full rounded-[1.25rem]">
          <MolduraImagem src={diagnostico.imagemUrl} alt="Foto analisada" status={saudavel ? 'saudavel' : 'problema'} alturaMaxima="58vh" />
        </Link>
        <RotuloStatus saudavel={saudavel} texto={resumo.status} />
      </div>

      <div className="animate-surgir [animation-delay:80ms]">
        <p className="mb-3 text-sm font-medium tracking-wide text-tinta-suave uppercase">Resumo técnico</p>
        <h1 tabIndex={-1} className="font-display-suave text-3xl leading-tight font-semibold tracking-tight text-balance outline-none sm:text-4xl">
          {resumo.titulo}
        </h1>
        <p className="mt-4 max-w-prose text-lg leading-relaxed text-tinta-suave">{resumo.paragrafo}</p>

        {problemas.length > 0 && (
          <div className="mt-8 overflow-hidden rounded-cartao bg-superficie shadow-cartao ring-1 ring-linha/60">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Diagnóstico por folha</caption>
              <thead className="border-b border-linha bg-papel/60 text-xs tracking-wide text-tinta-fraca uppercase">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium sm:px-5">Folha</th>
                  <th scope="col" className="px-4 py-3 font-medium">Estresse</th>
                  <th scope="col" className="px-4 py-3 font-medium sm:px-5">Severidade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-linha/70">
                {problemas.map((folha, i) => (
                  <tr key={folha.id}>
                    <td className="px-4 py-3.5 tabular-nums sm:px-5">
                      <span className="inline-flex items-center gap-1.5">
                        {i + 1}
                        {!folha.regiao && <MapPinOff className="size-3.5 text-tinta-fraca" aria-label="sem localização na foto" />}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-2 font-medium">
                        <span className="size-2.5 shrink-0 rounded-full" style={{ background: CATEGORIAS[folha.categoria].cor }} aria-hidden />
                        {CATEGORIAS[folha.categoria].nome}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 sm:px-5">
                      <MedidorSeveridade nivel={folha.severidade} compacto />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {saudaveis > 0 && (
              <p className="border-t border-linha bg-folha-50/60 px-5 py-3 text-sm text-folha-700">
                + {saudaveis === 1 ? '1 folha saudável' : `${saudaveis} folhas saudáveis`}
              </p>
            )}
          </div>
        )}

        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-tinta-fraca">Analisada em</dt>
            <dd className="mt-0.5 tabular-nums">{formatarData(analise.realizadaEm, true)}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-tinta-fraca">Arquivo</dt>
            <dd className="mt-0.5 truncate">{analise.nomeArquivo}</dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/visualizacao" viewTransition className={classesBotao('primario')}>
            {saudavel ? 'Ver orientações de cuidado' : 'Localizar na foto'} <ArrowRight aria-hidden />
          </Link>
          <BotaoSalvarAnalise />
        </div>

        <div className="mt-8 border-t border-linha pt-6">
          <p className="mb-3 text-sm text-tinta-suave">Nova análise</p>
          <SeletorImagem enfase="discreto" />
        </div>
      </div>
    </div>
  )
}
