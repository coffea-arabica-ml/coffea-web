import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { BookmarkCheck, BookmarkPlus, LoaderCircle } from 'lucide-react'
import { Modal } from '../../components/Modal'
import { useToast } from '../../components/Toast'
import { classesBotao, cx, type VarianteBotao } from '../../components/ui'
import { useHistorico } from '../../state/Historico'
import { useSessaoAnalise, type AnaliseAtual } from '../../state/SessaoAnalise'

const LIMITE_TITULO = 60

function tituloSugerido(analise: AnaliseAtual) {
  const quando = new Date(analise.realizadaEm).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
  return `Cafeeiro · ${quando}`
}

/** "Salvar análise" (Tela 9): abre o modal de título; depois de salvo, vira um atalho para o histórico. */
export function BotaoSalvarAnalise({ variante = 'secundario', className }: { variante?: VarianteBotao; className?: string }) {
  const { analise } = useSessaoAnalise()
  const [aberto, setAberto] = useState(false)
  if (!analise) return null

  if (analise.salvaComoId) {
    return (
      <Link to="/historico" viewTransition className={classesBotao('fantasma', className)}>
        <BookmarkCheck aria-hidden /> Salva no histórico
      </Link>
    )
  }

  return (
    <>
      <button type="button" onClick={() => setAberto(true)} className={classesBotao(variante, className)}>
        <BookmarkPlus aria-hidden /> Salvar análise
      </button>
      {aberto && <ModalSalvarAnalise analise={analise} aoFechar={() => setAberto(false)} />}
    </>
  )
}

function ModalSalvarAnalise({ analise, aoFechar }: { analise: AnaliseAtual; aoFechar: () => void }) {
  const { salvar, persistente } = useHistorico()
  const { marcarComoSalva } = useSessaoAnalise()
  const avisar = useToast()
  const navigate = useNavigate()
  const [titulo, setTitulo] = useState(() => tituloSugerido(analise))
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function aoEnviar(e: FormEvent) {
    e.preventDefault()
    const limpo = titulo.trim()
    if (!limpo) {
      setErro('Dê um título para encontrar esta análise depois.')
      return
    }
    setSalvando(true)
    try {
      const id = await salvar(analise, limpo)
      marcarComoSalva(id)
      aoFechar()
      avisar('Análise salva no histórico.')
      void navigate('/historico', { state: { destacar: id }, viewTransition: true })
    } catch {
      setErro('Não foi possível salvar agora. Tente de novo.')
      setSalvando(false)
    }
  }

  return (
    <Modal aberto aoFechar={aoFechar} titulo="Salvar análise">
      <form onSubmit={aoEnviar} className="mt-5" noValidate>
        <label htmlFor="titulo-analise" className="text-sm font-medium">
          Título da análise
        </label>
        <input
          id="titulo-analise"
          value={titulo}
          onChange={(e) => {
            setTitulo(e.target.value)
            setErro(null)
          }}
          onFocus={(e) => e.currentTarget.select()}
          maxLength={LIMITE_TITULO}
          data-autofocus
          aria-invalid={erro ? true : undefined}
          aria-describedby="titulo-ajuda"
          className={cx(
            'mt-2 block w-full rounded-2xl bg-papel px-4 py-3 text-base ring-1 outline-none focus:ring-2',
            erro ? 'ring-cereja-500' : 'ring-linha focus:ring-folha-500',
          )}
        />
        <p id="titulo-ajuda" className={cx('mt-2 text-sm', erro ? 'text-cereja-700' : 'text-tinta-fraca')}>
          {erro ??
            (persistente
              ? 'Ex.: "Talhão 3 — pé perto da cerca". Fica guardada neste navegador.'
              : 'Este navegador não permite guardar dados: o histórico some ao fechar a página.')}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={aoFechar} className={classesBotao('fantasma')}>
            Cancelar
          </button>
          <button type="submit" disabled={salvando} className={classesBotao('primario')}>
            {salvando ? <LoaderCircle className="animate-spin" aria-hidden /> : <BookmarkPlus aria-hidden />}
            Salvar
          </button>
        </div>
      </form>
    </Modal>
  )
}
