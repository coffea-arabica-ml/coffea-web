import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { ArrowRight, CircleCheck, HardDriveDownload, History, LoaderCircle, Trash2, TriangleAlert } from 'lucide-react'
import type { ItemHistorico } from '../../api'
import { Modal } from '../../components/Modal'
import { useToast } from '../../components/Toast'
import { classesBotao, cx, formatarData } from '../../components/ui'
import { estaSaudavel } from '../../domain/analise'
import { resumoCurto } from '../../domain/resumo'
import { useHistorico } from '../../state/Historico'
import { useSessaoAnalise } from '../../state/SessaoAnalise'

/** Tela 10 — análises salvas; abrir uma leva ao Resumo técnico sem reprocessar. */
export function AbaHistorico() {
  const { itens, persistente, carregar, excluir } = useHistorico()
  const { abrirAnalise, analise, marcarComoSalva } = useSessaoAnalise()
  const avisar = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  // O destaque do card recém-salvo vale só para esta visita (o estado do histórico sobrevive a um F5).
  const [destacar] = useState(() => (location.state as { destacar?: string } | null)?.destacar)
  useEffect(() => {
    if (location.state) void navigate(location.pathname, { replace: true, state: null })
  }, [location, navigate])
  const [abrindo, setAbrindo] = useState<string | null>(null)
  const [paraExcluir, setParaExcluir] = useState<ItemHistorico | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  async function confirmarExclusao() {
    if (!paraExcluir) return
    setExcluindo(true)
    try {
      await excluir(paraExcluir.id)
      // A análise em foco pode ser justamente a excluída: ela volta a poder ser salva.
      if (analise?.salvaComoId === paraExcluir.id) marcarComoSalva(undefined)
      avisar(`"${paraExcluir.titulo}" foi excluída.`)
      setParaExcluir(null)
      // Depois que o <dialog> fecha (antes disso o resto da página está inerte), o foco vai para o título.
      requestAnimationFrame(() => document.querySelector<HTMLElement>('main h1')?.focus())
    } catch {
      avisar('Não foi possível excluir agora. Tente de novo.')
    } finally {
      setExcluindo(false)
    }
  }

  async function abrir(id: string) {
    setAbrindo(id)
    const analise = await carregar(id)
    setAbrindo(null)
    if (!analise) {
      avisar('Não foi possível abrir esta análise.')
      return
    }
    abrirAnalise(analise)
    void navigate('/resumo', { viewTransition: true })
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-3 text-sm font-medium tracking-wide text-tinta-suave uppercase">Histórico</p>
          <h1 tabIndex={-1} className="font-display-suave text-3xl leading-tight font-semibold tracking-tight outline-none sm:text-4xl">
            Análises salvas
          </h1>
        </div>
        {itens && itens.length > 0 && (
          <p className="text-sm text-tinta-suave tabular-nums">{itens.length === 1 ? '1 análise' : `${itens.length} análises`}</p>
        )}
      </div>

      {!persistente && (
        <p className="mt-5 flex gap-2.5 rounded-2xl bg-cereja-50 p-3.5 text-sm text-cereja-700">
          <HardDriveDownload className="mt-0.5 size-4 shrink-0" aria-hidden />
          Este navegador não permite guardar dados. As análises salvas somem ao fechar a página.
        </p>
      )}

      {itens === null ? (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2" aria-label="Carregando histórico">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="h-32 animate-pulse rounded-cartao bg-papel-2" />
          ))}
        </ul>
      ) : itens.length === 0 ? (
        <Vazio />
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {itens.map((item, i) => (
            <li key={item.id} className="min-w-0 animate-surgir" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
              <Cartao
                item={item}
                destacado={item.id === destacar}
                carregando={abrindo === item.id}
                aoAbrir={() => void abrir(item.id)}
                aoExcluir={() => setParaExcluir(item)}
              />
            </li>
          ))}
        </ul>
      )}

      {paraExcluir && (
        <Modal aberto aoFechar={() => !excluindo && setParaExcluir(null)} titulo="Excluir análise?">
          <p className="mt-3 leading-relaxed text-tinta-suave">
            <strong className="font-semibold text-tinta">{paraExcluir.titulo}</strong> será removida do histórico deste navegador. Não dá para
            desfazer.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            {/* Ação destrutiva: o foco começa em Cancelar. */}
            <button
              type="button"
              data-autofocus
              onClick={() => setParaExcluir(null)}
              disabled={excluindo}
              className={classesBotao('fantasma')}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => void confirmarExclusao()}
              disabled={excluindo}
              className={classesBotao('perigo')}
            >
              {excluindo ? <LoaderCircle className="animate-spin" aria-hidden /> : <Trash2 aria-hidden />} Excluir
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

interface PropsCartao {
  item: ItemHistorico
  destacado: boolean
  carregando: boolean
  aoAbrir: () => void
  aoExcluir: () => void
}

function Cartao({ item, destacado, carregando, aoAbrir, aoExcluir }: PropsCartao) {
  const ref = useRef<HTMLButtonElement>(null)
  const saudavel = estaSaudavel(item.diagnostico)
  const Icone = saudavel ? CircleCheck : TriangleAlert

  useEffect(() => {
    if (destacado) ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [destacado])

  return (
    <div className="relative">
      <button
        ref={ref}
        type="button"
        onClick={aoAbrir}
        disabled={carregando}
        aria-label={`Abrir ${item.titulo}: ${resumoCurto(item.diagnostico)}, ${formatarData(item.criadoEm, true)}`}
        className={cx(
          'group flex w-full items-stretch gap-4 rounded-cartao bg-superficie p-4 text-left shadow-cartao ring-1 transition hover:-translate-y-0.5 hover:ring-folha-300 sm:p-5',
          destacado ? 'ring-2 ring-folha-500' : 'ring-linha/60',
          carregando && 'opacity-70',
        )}
      >
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="font-display-suave truncate text-xl font-semibold">{item.titulo}</span>
          <span className={cx('mt-2 flex min-w-0 items-center gap-1.5 text-sm', saudavel ? 'text-folha-700' : 'text-cereja-700')}>
            <Icone className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{resumoCurto(item.diagnostico)}</span>
          </span>
          <span className="mt-auto flex items-center justify-between pt-3 text-xs text-tinta-fraca tabular-nums">
            {formatarData(item.criadoEm, true)}
            <span className="inline-flex items-center gap-1 font-medium text-folha-700 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
              Abrir <ArrowRight className="size-3.5" aria-hidden />
            </span>
          </span>
        </span>
        <img
          src={item.diagnostico.imagemUrl}
          alt=""
          className={cx('size-24 shrink-0 rounded-2xl object-cover ring-2 ring-offset-2 ring-offset-superficie', saudavel ? 'ring-folha-500' : 'ring-cereja-500')}
        />
      </button>
      {/* Fora do botão principal: botões não podem ficar aninhados. */}
      <button
        type="button"
        onClick={aoExcluir}
        aria-label={`Excluir ${item.titulo}`}
        title="Excluir análise"
        className="absolute top-2 right-2 grid size-9 place-items-center rounded-full bg-superficie/95 text-tinta-suave shadow-cartao ring-1 ring-linha transition hover:bg-cereja-50 hover:text-cereja-600 hover:ring-cereja-100"
      >
        <Trash2 className="size-4" aria-hidden />
      </button>
    </div>
  )
}

function Vazio() {
  return (
    <div className="mt-10 grid place-items-center rounded-cartao border-2 border-dashed border-linha px-6 py-16 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-folha-50 text-folha-600">
        <History className="size-7" aria-hidden />
      </span>
      <p className="font-display-suave mt-5 text-2xl font-semibold">Nenhuma análise salva ainda</p>
      <p className="mt-2 max-w-sm text-tinta-suave">
        Depois de analisar uma foto, use "Salvar análise" para guardá-la aqui e consultar quando quiser.
      </p>
      <Link to="/enviar" viewTransition className={classesBotao('primario', 'mt-6')}>
        Fazer uma análise <ArrowRight aria-hidden />
      </Link>
    </div>
  )
}
