import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cx } from './ui'

interface Props {
  aberto: boolean
  aoFechar: () => void
  titulo: string
  children: ReactNode
  className?: string
}

/**
 * <dialog> nativo: foco preso, Esc fecha e o fundo fica inerte sem código extra.
 * Marque com `data-autofocus` o elemento que deve receber o foco ao abrir.
 */
export function Modal({ aberto, aoFechar, titulo, children, className }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialogo = ref.current
    if (!dialogo) return
    if (aberto && !dialogo.open) {
      dialogo.showModal()
      // showModal foca o primeiro controle (o X); quem abre pode indicar o campo certo.
      dialogo.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    }
    if (!aberto && dialogo.open) dialogo.close()
  }, [aberto])

  return (
    // Clique no fundo fecha; teclado já é coberto pelo Esc nativo do <dialog>.
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={ref}
      aria-label={titulo}
      onClose={aoFechar}
      onClick={(e) => {
        // Clique no fundo (fora da caixa) fecha.
        if (e.target === e.currentTarget) aoFechar()
      }}
      className={cx(
        'm-auto w-[min(92vw,34rem)] rounded-cartao bg-superficie p-0 text-tinta shadow-flutuante backdrop:bg-folha-900/45 backdrop:backdrop-blur-sm open:animate-surgir',
        className,
      )}
    >
      <div className="relative p-6 sm:p-7">
        <button
          type="button"
          onClick={aoFechar}
          aria-label="Fechar"
          className="absolute top-4 right-4 grid size-10 place-items-center rounded-full text-tinta-suave hover:bg-papel-2"
        >
          <X aria-hidden />
        </button>
        <h2 className="font-display-suave pr-10 text-2xl font-semibold tracking-tight">{titulo}</h2>
        {children}
      </div>
    </dialog>
  )
}
