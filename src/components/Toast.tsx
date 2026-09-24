import { createContext, use, useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { Info } from 'lucide-react'

interface Aviso {
  id: number
  texto: string
}

const Contexto = createContext<((texto: string) => void) | null>(null)

/** Avisos curtos e não bloqueantes, anunciados para leitores de tela. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const proximoId = useRef(0)

  const avisar = useCallback((texto: string) => {
    const id = ++proximoId.current
    setAvisos((atuais) => [...atuais.filter((a) => a.texto !== texto), { id, texto }].slice(-3))
    setTimeout(() => setAvisos((atuais) => atuais.filter((a) => a.id !== id)), 3800)
  }, [])

  const valor = useMemo(() => avisar, [avisar])

  return (
    <Contexto value={valor}>
      {children}
      <output
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4 sm:bottom-8"
      >
        {avisos.map((a) => (
          <p
            key={a.id}
            className="flex animate-surgir items-center gap-2 rounded-full bg-folha-900 px-4 py-2.5 text-sm text-white shadow-flutuante"
          >
            <Info className="size-4 shrink-0 text-folha-300" aria-hidden />
            {a.texto}
          </p>
        ))}
      </output>
    </Contexto>
  )
}

// oxlint-disable-next-line react/only-export-components -- hook acompanha o provider
export function useToast() {
  const avisar = use(Contexto)
  if (!avisar) throw new Error('useToast precisa estar dentro de <ToastProvider>')
  return avisar
}
