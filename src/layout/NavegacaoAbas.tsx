import { useState } from 'react'
import { NavLink } from 'react-router'
import { FileText, History, ImagePlus, LoaderCircle, Lock, ScanSearch, type LucideIcon } from 'lucide-react'
import { cx } from '../components/ui'
import { useToast } from '../components/Toast'
import { useSessaoAnalise } from '../state/SessaoAnalise'

interface Aba {
  para: string
  rotulo: string
  rotuloCurto: string
  Icone: LucideIcon
  /** Só libera depois de uma análise bem-sucedida. */
  exigeAnalise?: boolean
}

const ABAS: Aba[] = [
  { para: '/historico', rotulo: 'Histórico', rotuloCurto: 'Histórico', Icone: History },
  { para: '/enviar', rotulo: 'Enviar foto', rotuloCurto: 'Enviar', Icone: ImagePlus },
  { para: '/resumo', rotulo: 'Resumo técnico', rotuloCurto: 'Resumo', Icone: FileText, exigeAnalise: true },
  { para: '/visualizacao', rotulo: 'Visualização avançada', rotuloCurto: 'Visualizar', Icone: ScanSearch, exigeAnalise: true },
]

/** Abas no topo (tablet/desktop) ou barra fixa no rodapé (celular). */
export function NavegacaoAbas({ variante }: { variante: 'topo' | 'rodape' }) {
  const { analise, estado } = useSessaoAnalise()
  const avisar = useToast()
  const [tremendo, setTremendo] = useState<string | null>(null)
  const topo = variante === 'topo'

  return (
    <nav
      aria-label="Seções do Cafélens"
      className={cx(
        topo
          ? 'hidden items-center gap-1 rounded-full bg-papel-2/80 p-1 ring-1 ring-linha/70 md:flex'
          : 'pb-seguro fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-linha bg-superficie/95 px-2 pt-1.5 backdrop-blur-lg md:hidden',
      )}
    >
      {ABAS.map(({ para, rotulo, rotuloCurto, Icone, exigeAnalise }) => {
        const bloqueada = exigeAnalise && !analise
        const processando = para === '/enviar' && estado.fase === 'enviando'
        const IconeAtual = bloqueada ? Lock : processando ? LoaderCircle : Icone
        const conteudo = (
          <>
            <IconeAtual aria-hidden className={cx(topo ? 'size-4' : 'size-5', processando && 'animate-spin')} />
            {topo ? (
              <span className="whitespace-nowrap">
                <span className="lg:hidden">{rotuloCurto}</span>
                <span className="hidden lg:inline">{rotulo}</span>
              </span>
            ) : (
              <span className="text-[0.7rem] leading-tight">{rotuloCurto}</span>
            )}
          </>
        )
        const classeBase = topo
          ? 'flex min-h-10 items-center gap-2 rounded-full px-3 text-sm font-medium transition-colors lg:px-4'
          : 'flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl font-medium transition-colors'

        if (bloqueada) {
          return (
            <button
              key={para}
              type="button"
              aria-disabled="true"
              aria-label={`${rotulo} — disponível depois de enviar uma foto`}
              onClick={() => {
                setTremendo(para)
                avisar('Envie uma foto para liberar esta seção.')
              }}
              onAnimationEnd={() => setTremendo(null)}
              className={cx(classeBase, 'cursor-not-allowed text-tinta-fraca', tremendo === para && 'animate-tremer')}
            >
              {conteudo}
            </button>
          )
        }

        return (
          <NavLink
            key={para}
            to={para}
            viewTransition
            className={({ isActive }) =>
              cx(
                classeBase,
                isActive
                  ? topo
                    ? 'bg-superficie text-folha-700 shadow-cartao'
                    : 'text-folha-700 [&_svg]:rounded-full [&_svg]:bg-folha-50'
                  : 'text-tinta-suave hover:text-tinta',
              )
            }
          >
            {conteudo}
          </NavLink>
        )
      })}
    </nav>
  )
}
