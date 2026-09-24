import { createContext, use, useCallback, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react'
import { enviarImagemParaDiagnostico, validarImagem, type DiagnosticoErro, type DiagnosticoSucesso } from '../api'

/** A análise "em foco" no hub — recém-feita ou aberta do histórico. */
export interface AnaliseAtual {
  id: string
  diagnostico: DiagnosticoSucesso
  /** Imagem original, necessária para salvar no histórico. */
  imagem: Blob
  nomeArquivo: string
  realizadaEm: string
  /** Preenchido quando a análise já está no histórico. */
  salvaComoId?: string
}

type EstadoEstavel =
  | { fase: 'vazia' }
  | { fase: 'sucesso'; analise: AnaliseAtual }
  | { fase: 'erro'; erro: DiagnosticoErro; arquivo: File; previewUrl: string | null }

export type EstadoSessao =
  | EstadoEstavel
  | { fase: 'enviando'; arquivo: File; previewUrl: string; lento: boolean; anterior: EstadoEstavel }

type Acao =
  | { tipo: 'iniciar'; arquivo: File; previewUrl: string }
  | { tipo: 'lento' }
  | { tipo: 'concluir'; estado: EstadoEstavel }
  | { tipo: 'cancelar' }
  | { tipo: 'marcarSalva'; id: string | undefined }

function reducer(estado: EstadoSessao, acao: Acao): EstadoSessao {
  switch (acao.tipo) {
    case 'iniciar': {
      const anterior = estado.fase === 'enviando' ? estado.anterior : estado
      return { fase: 'enviando', arquivo: acao.arquivo, previewUrl: acao.previewUrl, lento: false, anterior }
    }
    case 'lento':
      return estado.fase === 'enviando' ? { ...estado, lento: true } : estado
    case 'concluir':
      return acao.estado
    case 'cancelar':
      return estado.fase === 'enviando' ? estado.anterior : estado
    case 'marcarSalva':
      return estado.fase === 'sucesso' ? { ...estado, analise: { ...estado.analise, salvaComoId: acao.id } } : estado
  }
}

/** URLs blob: referenciadas por um estado — as demais podem ser revogadas. */
function urlsEmUso(estado: EstadoSessao, urls = new Set<string>()): Set<string> {
  if (estado.fase === 'enviando') {
    urls.add(estado.previewUrl)
    urlsEmUso(estado.anterior, urls)
  } else if (estado.fase === 'sucesso') urls.add(estado.analise.diagnostico.imagemUrl)
  else if (estado.fase === 'erro' && estado.previewUrl) urls.add(estado.previewUrl)
  return urls
}

const TEMPO_LENTO_MS = 6000

interface ContextoSessao {
  estado: EstadoSessao
  /** Resumo técnico e Visualização avançada só abrem com uma análise bem-sucedida. */
  analise: AnaliseAtual | null
  enviarArquivo: (arquivo: File) => Promise<void>
  cancelar: () => void
  tentarNovamente: () => void
  abrirAnalise: (analise: AnaliseAtual) => void
  /** undefined desfaz a marca (a análise foi excluída do histórico). */
  marcarComoSalva: (id: string | undefined) => void
}

const Contexto = createContext<ContextoSessao | null>(null)

export function SessaoAnaliseProvider({ children }: { children: ReactNode }) {
  const [estado, dispatch] = useReducer(reducer, { fase: 'vazia' })
  const sequencia = useRef(0)
  const controlador = useRef<AbortController | null>(null)
  const urlsCriadas = useRef(new Set<string>())

  // Revoga object URLs que nenhum estado usa mais (evita vazamento de memória com fotos grandes).
  useEffect(() => {
    const emUso = urlsEmUso(estado)
    for (const url of urlsCriadas.current) {
      if (!emUso.has(url)) {
        URL.revokeObjectURL(url)
        urlsCriadas.current.delete(url)
      }
    }
    for (const url of emUso) if (url.startsWith('blob:')) urlsCriadas.current.add(url)
  }, [estado])

  // Um temporizador por envio (identificado pela URL da prévia).
  const envioAtual = estado.fase === 'enviando' ? estado.previewUrl : null
  useEffect(() => {
    if (!envioAtual) return
    const timer = setTimeout(() => dispatch({ tipo: 'lento' }), TEMPO_LENTO_MS)
    return () => clearTimeout(timer)
  }, [envioAtual])

  const enviarArquivo = useCallback(async (arquivo: File) => {
    controlador.current?.abort()
    const minha = ++sequencia.current
    const atual = () => minha === sequencia.current

    // Formato e tamanho são verificados antes do carregamento: o erro aparece na hora.
    const erroValidacao = await validarImagem(arquivo)
    if (!atual()) return
    if (erroValidacao) {
      const previewUrl = erroValidacao.tipo === 'formato_invalido' ? null : URL.createObjectURL(arquivo)
      dispatch({ tipo: 'concluir', estado: { fase: 'erro', erro: erroValidacao, arquivo, previewUrl } })
      return
    }

    const abort = new AbortController()
    controlador.current = abort
    dispatch({ tipo: 'iniciar', arquivo, previewUrl: URL.createObjectURL(arquivo) })

    try {
      const resposta = await enviarImagemParaDiagnostico(arquivo, { signal: abort.signal })
      if (!atual()) return
      if (resposta.status === 'sucesso') {
        const analise: AnaliseAtual = {
          id: crypto.randomUUID(),
          diagnostico: resposta,
          imagem: arquivo,
          nomeArquivo: arquivo.name,
          realizadaEm: new Date().toISOString(),
        }
        dispatch({ tipo: 'concluir', estado: { fase: 'sucesso', analise } })
      } else {
        dispatch({ tipo: 'concluir', estado: { fase: 'erro', erro: resposta, arquivo, previewUrl: URL.createObjectURL(arquivo) } })
      }
    } catch {
      // Cancelado: o estado já foi restaurado por cancelar() ou substituído por um novo envio.
    }
  }, [])

  const cancelar = useCallback(() => {
    sequencia.current++
    controlador.current?.abort()
    dispatch({ tipo: 'cancelar' })
  }, [])

  const arquivoComErro = estado.fase === 'erro' ? estado.arquivo : null
  const tentarNovamente = useCallback(() => {
    if (arquivoComErro) void enviarArquivo(arquivoComErro)
  }, [arquivoComErro, enviarArquivo])

  const abrirAnalise = useCallback((analise: AnaliseAtual) => {
    sequencia.current++
    controlador.current?.abort()
    dispatch({ tipo: 'concluir', estado: { fase: 'sucesso', analise } })
  }, [])

  const marcarComoSalva = useCallback((id: string | undefined) => dispatch({ tipo: 'marcarSalva', id }), [])

  const valor = useMemo<ContextoSessao>(
    () => ({
      estado,
      analise: estado.fase === 'sucesso' ? estado.analise : null,
      enviarArquivo,
      cancelar,
      tentarNovamente,
      abrirAnalise,
      marcarComoSalva,
    }),
    [estado, enviarArquivo, cancelar, tentarNovamente, abrirAnalise, marcarComoSalva],
  )

  return <Contexto value={valor}>{children}</Contexto>
}

// oxlint-disable-next-line react/only-export-components -- hook acompanha o provider
export function useSessaoAnalise(): ContextoSessao {
  const contexto = use(Contexto)
  if (!contexto) throw new Error('useSessaoAnalise precisa estar dentro de <SessaoAnaliseProvider>')
  return contexto
}
