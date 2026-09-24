import { useState } from 'react'
import type { RegiaoFolha } from '../api'
import { enquadramentoLente } from '../domain/geometria'
import { cx } from './ui'

interface Props {
  src: string
  alt: string
  /** Sem região, a lente mostra a foto inteira. */
  regiao?: RegiaoFolha
  cor: string
  nomeTransicao?: string
  className?: string
}

/** A folha ampliada dentro de um círculo — só CSS, sem canvas nem recorte no servidor. */
export function Lente({ src, alt, regiao, cor, nomeTransicao, className }: Props) {
  const [dimensoes, setDimensoes] = useState<{ w: number; h: number } | null>(null)
  const estilo = regiao && dimensoes ? enquadramentoLente(regiao, dimensoes.w, dimensoes.h) : null

  return (
    <div
      className={cx('relative aspect-square overflow-hidden rounded-full bg-papel-2 shadow-flutuante', className)}
      style={{ viewTransitionName: nomeTransicao, boxShadow: `0 0 0 6px var(--color-papel), 0 0 0 9px ${cor}` }}
    >
      <img
        src={src}
        alt={alt}
        onLoad={(e) => setDimensoes({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
        className={cx(
          'absolute max-w-none transition-opacity duration-300',
          estilo ? 'h-auto' : 'inset-0 size-full object-cover',
          regiao && !dimensoes && 'opacity-0',
        )}
        style={estilo ?? undefined}
      />
    </div>
  )
}
