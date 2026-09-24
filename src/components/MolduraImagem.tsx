import { useState, type ReactNode } from 'react'
import { cx } from './ui'

export type StatusMoldura = 'neutro' | 'saudavel' | 'problema'

const ANEL: Record<StatusMoldura, string> = {
  neutro: 'ring-linha',
  saudavel: 'ring-folha-500',
  problema: 'ring-cereja-500',
}

interface Props {
  /** Nome de view transition da moldura inteira (ex.: volta do detalhe). */
  nomeTransicao?: string
  src: string
  alt: string
  status?: StatusMoldura
  /** Altura máxima da imagem (CSS). A largura acompanha a proporção real da foto. */
  alturaMaxima?: string
  /** Camadas posicionadas em % sobre a imagem (ex.: círculos do RF04); a função recebe largura/altura. */
  children?: ReactNode | ((proporcao: number) => ReactNode)
  className?: string
}

/**
 * Mostra a foto na proporção real (retrato, paisagem ou quadrada) com a moldura de status.
 * A caixa tem exatamente o tamanho da imagem, então sobreposições em % caem no lugar certo.
 */
export function MolduraImagem({ nomeTransicao, src, alt, status = 'neutro', alturaMaxima = '60vh', children, className }: Props) {
  const [proporcao, setProporcao] = useState<number | null>(null)

  return (
    <div
      className={cx(
        'relative mx-auto overflow-hidden rounded-[1.25rem] bg-papel-2 ring-4 ring-offset-4 ring-offset-papel transition-shadow duration-500',
        ANEL[status],
        !proporcao && 'animate-pulse',
        className,
      )}
      style={{
        aspectRatio: proporcao ?? 3 / 4,
        width: `min(100%, calc(${alturaMaxima} * ${proporcao ?? 3 / 4}))`,
        viewTransitionName: nomeTransicao,
      }}
    >
      <img
        src={src}
        alt={alt}
        onLoad={(e) => setProporcao(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight)}
        className={cx('size-full object-cover transition-opacity duration-500', proporcao ? 'opacity-100' : 'opacity-0')}
      />
      {proporcao && (typeof children === 'function' ? children(proporcao) : children)}
    </div>
  )
}
