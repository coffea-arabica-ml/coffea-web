import logo from '../assets/logo-cafelens.png'
import { cx } from './ui'

interface Props {
  tamanho?: 'sm' | 'md' | 'lg'
  /** Versão para fundos escuros: o símbolo ganha uma pastilha clara. */
  claro?: boolean
  className?: string
}

const TAMANHOS = {
  sm: { img: 'size-7', texto: 'text-xl' },
  md: { img: 'size-9', texto: 'text-2xl' },
  lg: { img: 'size-14', texto: 'text-5xl sm:text-6xl' },
}

export function Logo({ tamanho = 'md', claro = false, className }: Props) {
  const t = TAMANHOS[tamanho]
  return (
    <span className={cx('inline-flex items-center gap-2.5', className)}>
      <span className={cx('grid place-items-center rounded-full', claro && 'bg-white/90 p-1.5 shadow-lg')}>
        <img src={logo} alt="" className={cx(t.img, 'object-contain')} />
      </span>
      <span className={cx('font-display-suave font-semibold tracking-tight', t.texto, claro ? 'text-white' : 'text-tinta')}>
        Cafélens
      </span>
    </span>
  )
}
