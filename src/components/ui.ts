/** Junta classes ignorando valores falsos. */
export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

export type VarianteBotao = 'primario' | 'secundario' | 'fantasma' | 'claro' | 'destaque' | 'perigo'

const BASE =
  'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 sm:px-5 text-[0.95rem] font-medium transition-[background-color,color,box-shadow,transform] duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-[1.1em] [&_svg]:shrink-0'

const VARIANTES: Record<VarianteBotao, string> = {
  primario: 'bg-folha-700 text-white shadow-[0_6px_16px_-8px_rgb(17_40_26/0.6)] hover:bg-folha-900',
  secundario: 'bg-superficie text-tinta ring-1 ring-linha hover:bg-white hover:ring-folha-300',
  fantasma: 'text-folha-700 hover:bg-folha-50',
  perigo: 'bg-cereja-600 text-white shadow-[0_6px_16px_-8px_rgb(134_48_31/0.6)] hover:bg-cereja-700',
  destaque: 'bg-white text-folha-900 shadow-[0_10px_30px_-10px_rgb(0_0_0/0.5)] hover:bg-folha-50',
  claro: 'bg-white/12 text-white ring-1 ring-white/25 backdrop-blur-md hover:bg-white/20',
}

/** Classes de botão, reaproveitáveis em <button>, <Link> e <label>. */
export function classesBotao(variante: VarianteBotao = 'secundario', extra?: string): string {
  return cx(BASE, VARIANTES[variante], extra)
}

export function formatarBytes(bytes: number): string {
  const mb = bytes / (1024 * 1024)
  if (mb >= 1) return `${mb.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} MB`
  return `${Math.max(1, Math.round(bytes / 1024)).toLocaleString('pt-BR')} KB`
}

export function formatarData(iso: string, comHora = false): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(comHora ? { hour: '2-digit', minute: '2-digit' } : {}),
  })
}
