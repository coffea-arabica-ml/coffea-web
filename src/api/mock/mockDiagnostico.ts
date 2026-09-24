import { MENSAGENS_ERRO } from './cenarios'
import { hashArquivo, obterAtrasoForcado, resolverCenario } from './resolverCenario'

function esperar(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason)
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        reject(signal.reason)
      },
      { once: true },
    )
  })
}

/**
 * Substitui o coffea-backend enquanto ele não está pronto. Devolve o JSON "cru", como o
 * servidor devolveria — a normalização acontece em diagnostico.ts, igual ao modo http.
 */
export async function mockDiagnosticar(imagem: File, signal?: AbortSignal): Promise<unknown> {
  // Latência perceptível (1,5–2,5 s), estável por arquivo; ?atraso=ms força outro valor.
  const atraso = obterAtrasoForcado() ?? 1500 + (hashArquivo(imagem) % 1000)
  await esperar(atraso, signal)

  const cenario = resolverCenario(imagem)
  if (import.meta.env.DEV) console.info(`[mock] ${imagem.name} → ${cenario.origem}`)

  if (cenario.tipo === 'erro') return { status: 'erro', tipo: cenario.erro, mensagem: MENSAGENS_ERRO[cenario.erro] }
  return { status: 'sucesso', imagemUrl: URL.createObjectURL(imagem), folhas: cenario.folhas }
}
