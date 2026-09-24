import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { apagarAnalise, historicoPersistente, listarAnalises, obterAnalise, salvarAnalise, type ItemHistorico } from '../api'
import type { AnaliseAtual } from './SessaoAnalise'

interface ContextoHistorico {
  /** null enquanto carrega. */
  itens: ItemHistorico[] | null
  /** false quando o navegador não permite guardar dados (o histórico some ao fechar a página). */
  persistente: boolean
  salvar: (analise: AnaliseAtual, titulo: string) => Promise<string>
  /** Carrega uma análise salva no formato da sessão, sem reprocessar. */
  carregar: (id: string) => Promise<AnaliseAtual | null>
  excluir: (id: string) => Promise<void>
}

const Contexto = createContext<ContextoHistorico | null>(null)

export function HistoricoProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ItemHistorico[] | null>(null)
  const [persistente, setPersistente] = useState(true)

  useEffect(() => {
    let ativo = true
    void Promise.all([listarAnalises(), historicoPersistente()]).then(([lista, ok]) => {
      if (!ativo) return
      setItens(lista)
      setPersistente(ok)
    })
    return () => {
      ativo = false
    }
  }, [])

  const salvar = useCallback(async (analise: AnaliseAtual, titulo: string) => {
    const item = await salvarAnalise({
      titulo,
      diagnostico: analise.diagnostico,
      imagem: analise.imagem,
      nomeArquivo: analise.nomeArquivo,
      realizadaEm: analise.realizadaEm,
    })
    setItens((atuais) => [item, ...(atuais ?? [])])
    return item.id
  }, [])

  const carregar = useCallback(async (id: string): Promise<AnaliseAtual | null> => {
    const carregada = await obterAnalise(id)
    if (!carregada) return null
    return {
      id: crypto.randomUUID(),
      diagnostico: carregada.analise.diagnostico,
      imagem: carregada.imagem,
      nomeArquivo: carregada.nomeArquivo,
      realizadaEm: carregada.analise.criadoEm,
      salvaComoId: carregada.analise.id,
    }
  }, [])

  const excluir = useCallback(async (id: string) => {
    await apagarAnalise(id)
    setItens((atuais) => (atuais ?? []).filter((i) => i.id !== id))
  }, [])

  const valor = useMemo(() => ({ itens, persistente, salvar, carregar, excluir }), [itens, persistente, salvar, carregar, excluir])
  return <Contexto value={valor}>{children}</Contexto>
}

// oxlint-disable-next-line react/only-export-components -- hook acompanha o provider
export function useHistorico(): ContextoHistorico {
  const contexto = use(Contexto)
  if (!contexto) throw new Error('useHistorico precisa estar dentro de <HistoricoProvider>')
  return contexto
}
