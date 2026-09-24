import type {
  CategoriaEstresse,
  DiagnosticoResponse,
  DiagnosticoSucesso,
  FolhaDiagnostico,
  NivelSeveridade,
  RegiaoFolha,
  TipoErroUpload,
} from './types'

const CATEGORIAS: readonly CategoriaEstresse[] = ['saudavel', 'ferrugem', 'bicho_mineiro', 'cercosporiose', 'phoma']
const SEVERIDADES: readonly NivelSeveridade[] = ['saudavel', 'muito_baixa', 'baixa', 'alta', 'muito_alta']
const TIPOS_ERRO: readonly TipoErroUpload[] = [
  'planta_nao_identificada',
  'formato_invalido',
  'especie_incorreta',
  'arquivo_muito_grande',
  'baixa_confianca',
  'erro_desconhecido',
]

function ehObjeto(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

function numeroFinito(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v)
}

const limitar = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

function normalizarRegiao(bruta: unknown): RegiaoFolha | undefined {
  if (!ehObjeto(bruta)) return undefined
  const { x, y, raio } = bruta
  if (!numeroFinito(x) || !numeroFinito(y) || !numeroFinito(raio) || raio <= 0) return undefined
  if (x < 0 || x > 1 || y < 0 || y > 1) return undefined
  return { x, y, raio: limitar(raio, 0.01, 0.5) }
}

function textoOpcional(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined
}

function normalizarFolha(bruta: unknown, indice: number, idsUsados: Set<string>): FolhaDiagnostico | null {
  if (!ehObjeto(bruta)) return null
  const categoria = CATEGORIAS.find((c) => c === bruta.categoria)
  if (!categoria) return null

  let severidade = SEVERIDADES.find((s) => s === bruta.severidade) ?? 'baixa'
  // Mantém categoria e severidade coerentes entre si.
  if (categoria === 'saudavel') severidade = 'saudavel'
  else if (severidade === 'saudavel') severidade = 'muito_baixa'

  let id = typeof bruta.id === 'string' && bruta.id !== '' ? bruta.id : `folha-${indice + 1}`
  while (idsUsados.has(id)) id = `${id}-${indice + 1}`
  idsUsados.add(id)

  const folha: FolhaDiagnostico = { id, categoria, severidade }
  const regiao = normalizarRegiao(bruta.regiao)
  if (regiao) folha.regiao = regiao
  const comoCuidar = textoOpcional(bruta.comoCuidar)
  if (comoCuidar) folha.comoCuidar = comoCuidar
  const comoPrevenir = textoOpcional(bruta.comoPrevenir)
  if (comoPrevenir) folha.comoPrevenir = comoPrevenir
  return folha
}

export function normalizarSucesso(bruto: Record<string, unknown>, imagemUrlPadrao: () => string): DiagnosticoSucesso {
  const idsUsados = new Set<string>()
  const folhasBrutas = Array.isArray(bruto.folhas) ? bruto.folhas : []
  const folhas = folhasBrutas
    .map((f, i) => normalizarFolha(f, i, idsUsados))
    .filter((f): f is FolhaDiagnostico => f !== null)
  const imagemUrl = typeof bruto.imagemUrl === 'string' && bruto.imagemUrl !== '' ? bruto.imagemUrl : imagemUrlPadrao()
  return { status: 'sucesso', imagemUrl, folhas }
}

/**
 * Fronteira de confiança: toda resposta (mock ou backend real) passa por aqui antes de chegar
 * às telas. Qualquer coisa fora do contrato vira um formato válido ou um erro desconhecido.
 */
export function normalizarResposta(bruta: unknown, imagemUrlPadrao: () => string): DiagnosticoResponse {
  if (!ehObjeto(bruta)) {
    return { status: 'erro', tipo: 'erro_desconhecido', mensagem: 'Resposta vazia ou inválida do servidor.' }
  }
  if (bruta.status === 'erro') {
    const tipo = TIPOS_ERRO.find((t) => t === bruta.tipo) ?? 'erro_desconhecido'
    const mensagem = textoOpcional(bruta.mensagem) ?? ''
    return { status: 'erro', tipo, mensagem }
  }
  if (bruta.status === 'sucesso') return normalizarSucesso(bruta, imagemUrlPadrao)
  return { status: 'erro', tipo: 'erro_desconhecido', mensagem: 'Resposta fora do formato esperado.' }
}
