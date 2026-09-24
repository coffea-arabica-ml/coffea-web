import { CircleCheck, TriangleAlert } from 'lucide-react'
import { cx } from './ui'

/** Rótulo de status junto da imagem: a cor da moldura nunca é o único sinal. */
export function RotuloStatus({ saudavel, texto }: { saudavel: boolean; texto: string }) {
  const Icone = saudavel ? CircleCheck : TriangleAlert
  return (
    <p
      className={cx(
        'inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium',
        saudavel ? 'bg-folha-50 text-folha-700' : 'bg-cereja-50 text-cereja-700',
      )}
    >
      <Icone className="size-4" aria-hidden />
      {texto}
    </p>
  )
}
