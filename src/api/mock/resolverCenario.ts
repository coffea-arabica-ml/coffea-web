import type { TipoErroUpload } from '../types'
import { CENARIOS, CENARIOS_POR_ARQUIVO, gerarFolhas, type CenarioId, type CenarioSucesso } from './cenarios'
import type { FolhaDiagnostico } from '../types'

const CHAVE_CENARIO = 'cafelens:mock-cenario'
const CHAVE_ATRASO = 'cafelens:mock-atraso'

function armazenamento(): Storage | null {
  try {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage
  } catch {
    return null
  }
}

/** `?cenario=` e `?atraso=` na URL ficam gravados na sessão, para sobreviver à navegação. */
function lerParametrosDaUrl() {
  if (typeof location === 'undefined') return
  const params = new URLSearchParams(location.search)
  const cenario = params.get('cenario')
  const atraso = params.get('atraso')
  if (cenario !== null) definirCenarioForcado(cenario === 'auto' ? null : (cenario as CenarioId))
  if (atraso !== null) definirAtrasoForcado(atraso === 'auto' ? null : Number(atraso))
}

export function definirCenarioForcado(cenario: CenarioId | null) {
  const s = armazenamento()
  if (!s) return
  if (cenario && CENARIOS.some((c) => c.id === cenario)) s.setItem(CHAVE_CENARIO, cenario)
  else s.removeItem(CHAVE_CENARIO)
}

export function obterCenarioForcado(): CenarioId | null {
  lerParametrosDaUrl()
  const valor = armazenamento()?.getItem(CHAVE_CENARIO)
  return CENARIOS.some((c) => c.id === valor) ? (valor as CenarioId) : null
}

export function definirAtrasoForcado(ms: number | null) {
  const s = armazenamento()
  if (!s) return
  if (ms !== null && Number.isFinite(ms) && ms >= 0) s.setItem(CHAVE_ATRASO, String(Math.round(ms)))
  else s.removeItem(CHAVE_ATRASO)
}

export function obterAtrasoForcado(): number | null {
  lerParametrosDaUrl()
  const valor = armazenamento()?.getItem(CHAVE_ATRASO)
  return valor === null || valor === undefined ? null : Number(valor)
}

/** Hash FNV-1a de nome + tamanho + data: a mesma foto sempre gera o mesmo resultado simulado. */
export function hashArquivo(arquivo: File): number {
  const chave = `${arquivo.name}|${arquivo.size}|${arquivo.lastModified}`
  let h = 0x811c9dc5
  for (let i = 0; i < chave.length; i++) {
    h ^= chave.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

function nomeBase(nome: string) {
  return nome.toLowerCase().replace(/\.[a-z0-9]+$/, '')
}

export type ResultadoCenario =
  | { tipo: 'sucesso'; folhas: FolhaDiagnostico[]; origem: string }
  | { tipo: 'erro'; erro: TipoErroUpload; origem: string }

const SORTEAVEIS: CenarioSucesso[] = ['saudavel', 'uma_folha_com_regiao', 'varias_folhas', 'varias_folhas_mistas']

/** Ordem: cenário forçado → foto conhecida (fixtures/exemplos) → sorteio determinístico pelo hash. */
export function resolverCenario(arquivo: File): ResultadoCenario {
  const semente = hashArquivo(arquivo)
  const comIds = (folhas: Omit<FolhaDiagnostico, 'id'>[]) => folhas.map((folha, i) => ({ id: `folha-${i + 1}`, ...folha }))

  const forcado = obterCenarioForcado()
  if (forcado) {
    if (forcado.startsWith('erro:')) return { tipo: 'erro', erro: forcado.slice(5) as TipoErroUpload, origem: `forçado: ${forcado}` }
    return { tipo: 'sucesso', folhas: comIds(gerarFolhas(forcado as CenarioSucesso, semente)), origem: `forçado: ${forcado}` }
  }

  const conhecido = CENARIOS_POR_ARQUIVO[nomeBase(arquivo.name)]
  if (typeof conhecido === 'string') return { tipo: 'erro', erro: conhecido, origem: `arquivo: ${arquivo.name}` }
  if (conhecido) return { tipo: 'sucesso', folhas: comIds(conhecido), origem: `arquivo: ${arquivo.name}` }

  const cenario = SORTEAVEIS[semente % SORTEAVEIS.length]
  return { tipo: 'sucesso', folhas: comIds(gerarFolhas(cenario, semente)), origem: `sorteado: ${cenario}` }
}
