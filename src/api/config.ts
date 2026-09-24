export type ModoApi = 'mock' | 'http'

/** "mock" (padrão) usa src/api/mock; "http" chama o coffea-backend em VITE_API_URL. */
export const modoApi: ModoApi = import.meta.env.VITE_API_MODE === 'http' ? 'http' : 'mock'

// TODO(frente-6): confirmar a URL real do coffea-backend quando estiver no ar
export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export const LIMITES = {
  tamanhoMaximoBytes: 10 * 1024 * 1024,
  tamanhoMaximoRotulo: '10 MB',
  formatosRotulo: 'JPG ou PNG',
  /** Valor do atributo `accept` do seletor de arquivo. */
  accept: 'image/jpeg,image/png,.jpg,.jpeg,.png',
} as const
