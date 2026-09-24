import { createStore, del, get, set, values, type UseStore } from 'idb-keyval'
import { normalizarSucesso } from './normalizar'
import type { AnaliseSalva, DiagnosticoSucesso, FolhaDiagnostico } from './types'

/*
 * Repositório do histórico (RF05). Hoje fica no navegador (IndexedDB, por aparelho, sem login).
 * TODO(frente-6): se o histórico passar a morar no backend, só este arquivo muda — as telas
 * continuam usando listarAnalises/obterAnalise/salvarAnalise.
 */

/** Formato gravado. A imagem é guardada como Blob: object URLs não sobrevivem a um recarregamento. */
interface Registro {
  versao: 1
  id: string
  titulo: string
  criadoEm: string
  nomeArquivo: string
  folhas: FolhaDiagnostico[]
  imagem: Blob
  miniatura: Blob
}

/** Item leve para a grade do histórico. */
export interface ItemHistorico {
  id: string
  titulo: string
  criadoEm: string
  /** Diagnóstico com `imagemUrl` apontando para a miniatura. */
  diagnostico: DiagnosticoSucesso
}

export interface AnaliseCarregada {
  analise: AnaliseSalva
  imagem: Blob
  nomeArquivo: string
}

// ---------- armazenamento: IndexedDB com fallback em memória ----------

type Armazenamento = {
  listar: () => Promise<Registro[]>
  obter: (id: string) => Promise<Registro | undefined>
  gravar: (r: Registro) => Promise<void>
  apagar: (id: string) => Promise<void>
}

function armazenamentoEmMemoria(): Armazenamento {
  const mapa = new Map<string, Registro>()
  return {
    listar: async () => [...mapa.values()],
    obter: async (id) => mapa.get(id),
    gravar: async (r) => void mapa.set(r.id, r),
    apagar: async (id) => void mapa.delete(id),
  }
}

function armazenamentoIndexedDb(store: UseStore): Armazenamento {
  return {
    listar: () => values<Registro>(store),
    obter: (id) => get<Registro>(id, store),
    gravar: (r) => set(r.id, r, store),
    apagar: (id) => del(id, store),
  }
}

let armazenamento: Promise<{ api: Armazenamento; persistente: boolean }> | null = null

/** Abre o IndexedDB uma vez; se falhar (navegação privada antiga, bloqueio), usa memória. */
function abrir() {
  armazenamento ??= (async () => {
    try {
      if (typeof indexedDB === 'undefined') throw new Error('sem IndexedDB')
      const api = armazenamentoIndexedDb(createStore('cafelens', 'analises'))
      await api.listar() // testa a conexão
      return { api, persistente: true }
    } catch {
      return { api: armazenamentoEmMemoria(), persistente: false }
    }
  })()
  return armazenamento
}

/** false quando o histórico só dura até fechar a página. */
export async function historicoPersistente(): Promise<boolean> {
  return (await abrir()).persistente
}

// ---------- imagens ----------

/** Reduz a foto para guardar (regiões são relativas, então não mudam). Sem canvas, guarda a original. */
async function reduzir(imagem: Blob, ladoMaximo: number, qualidade: number): Promise<Blob> {
  if (typeof createImageBitmap !== 'function' || typeof document === 'undefined') return imagem
  try {
    const bitmap = await createImageBitmap(imagem)
    const escala = Math.min(1, ladoMaximo / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * escala)
    canvas.height = Math.round(bitmap.height * escala)
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, 'image/jpeg', qualidade))
    return blob ?? imagem
  } catch {
    return imagem
  }
}

// Miniaturas ficam em cache: uma object URL por análise durante toda a sessão.
const miniaturas = new Map<string, string>()
function urlMiniatura(r: Registro) {
  let url = miniaturas.get(r.id)
  if (!url) {
    url = URL.createObjectURL(r.miniatura)
    miniaturas.set(r.id, url)
  }
  return url
}

function diagnosticoDe(r: Registro, imagemUrl: string): DiagnosticoSucesso {
  // Passa pelo mesmo saneamento das respostas da API: registros antigos ou corrompidos não quebram a tela.
  return normalizarSucesso({ folhas: r.folhas, imagemUrl }, () => imagemUrl)
}

// ---------- API pública ----------

export async function listarAnalises(): Promise<ItemHistorico[]> {
  const { api } = await abrir()
  const registros = (await api.listar()).filter((r) => r?.versao === 1)
  return registros
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
    .map((r) => ({ id: r.id, titulo: r.titulo, criadoEm: r.criadoEm, diagnostico: diagnosticoDe(r, urlMiniatura(r)) }))
}

/** Carrega uma análise salva com a imagem completa. Quem recebe passa a ser dono da `imagemUrl`. */
export async function obterAnalise(id: string): Promise<AnaliseCarregada | null> {
  const { api } = await abrir()
  const r = await api.obter(id)
  if (!r || r.versao !== 1) return null
  return {
    analise: { id: r.id, titulo: r.titulo, criadoEm: r.criadoEm, diagnostico: diagnosticoDe(r, URL.createObjectURL(r.imagem)) },
    imagem: r.imagem,
    nomeArquivo: r.nomeArquivo,
  }
}

export async function salvarAnalise(dados: {
  titulo: string
  diagnostico: DiagnosticoSucesso
  imagem: Blob
  nomeArquivo: string
  realizadaEm: string
}): Promise<ItemHistorico> {
  const { api } = await abrir()
  const [imagem, miniatura] = await Promise.all([reduzir(dados.imagem, 1600, 0.86), reduzir(dados.imagem, 360, 0.8)])
  const registro: Registro = {
    versao: 1,
    id: crypto.randomUUID(),
    titulo: dados.titulo.trim(),
    criadoEm: dados.realizadaEm,
    nomeArquivo: dados.nomeArquivo,
    folhas: dados.diagnostico.folhas,
    imagem,
    miniatura,
  }
  await api.gravar(registro)
  return { id: registro.id, titulo: registro.titulo, criadoEm: registro.criadoEm, diagnostico: diagnosticoDe(registro, urlMiniatura(registro)) }
}

export async function apagarAnalise(id: string): Promise<void> {
  const { api } = await abrir()
  await api.apagar(id)
  const url = miniaturas.get(id)
  if (url) URL.revokeObjectURL(url)
  miniaturas.delete(id)
}
