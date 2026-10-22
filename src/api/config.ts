export type ModoApi = 'mock' | 'http'

/** "mock" (padrão) usa src/api/mock; "http" chama o coffea-backend em VITE_API_URL. */
export const modoApi: ModoApi = import.meta.env.VITE_API_MODE === 'http' ? 'http' : 'mock'

// Produção: a Vercel define VITE_API_MODE=http e VITE_API_URL=https://api.coffealab.tech (tipo Config, só no ambiente Production)
export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export const LIMITES = {
  tamanhoMaximoBytes: 10 * 1024 * 1024,
  tamanhoMaximoRotulo: '10 MB',
  formatosRotulo: 'JPG ou PNG',
  /** Valor do atributo `accept` do seletor de arquivo. */
  accept: 'image/jpeg,image/png,.jpg,.jpeg,.png',
} as const
