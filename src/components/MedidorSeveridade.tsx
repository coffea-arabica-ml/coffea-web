import type { NivelSeveridade } from '../api'
import { ESCALA_SEVERIDADE, ROTULO_SEVERIDADE, ordemSeveridade } from '../domain/severidade'
import { cx } from './ui'

const TONS = ['bg-cereja-100', 'bg-cereja-100', 'bg-cereja-500/60', 'bg-cereja-500', 'bg-cereja-700']

/** Escala ordinal em 4 degraus (muito baixa → muito alta), sempre acompanhada do rótulo em texto. */
export function MedidorSeveridade({ nivel, compacto = false }: { nivel: NivelSeveridade; compacto?: boolean }) {
  const ordem = ordemSeveridade(nivel)
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="flex gap-0.5" aria-hidden>
        {ESCALA_SEVERIDADE.slice(1).map((n, i) => (
          <span
            key={n}
            className={cx('h-2 rounded-full', compacto ? 'w-3' : 'w-5', i + 1 <= ordem ? TONS[ordem] : 'bg-papel-2')}
          />
        ))}
      </span>
      <span className={cx('text-sm tabular-nums', ordem >= 3 && 'font-semibold text-cereja-700')}>
        <span className="sr-only">Severidade </span>
        {ROTULO_SEVERIDADE[nivel]}
      </span>
    </span>
  )
}
