import { API_URL } from './config'

const TEMPO_LIMITE_MS = 30_000

/**
 * Adapter do coffea-backend. Devolve um JSON no formato do contrato (ainda não normalizado).
 *
 * TODO(frente-6): hoje o backend responde só `{ categoria, severidade }` (uma folha, sem região).
 * Esse formato é convertido abaixo para uma lista de 1 folha; quando o backend passar a devolver
 * o contrato completo (`{ status, imagemUrl, folhas }`), ele é repassado como está.
 */
export async function httpDiagnosticar(imagem: File, signal?: AbortSignal): Promise<unknown> {
  const formData = new FormData()
  formData.append('imagem', imagem)

  const tempoLimite = AbortSignal.timeout(TEMPO_LIMITE_MS)
  const sinal = signal ? AbortSignal.any([signal, tempoLimite]) : tempoLimite

  let resposta: Response
  try {
    resposta = await fetch(`${API_URL}/diagnostico`, { method: 'POST', body: formData, signal: sinal })
  } catch (e) {
    if (signal?.aborted) throw e
    const mensagem = tempoLimite.aborted ? 'O servidor demorou demais para responder.' : 'Não foi possível conectar ao servidor.'
    return { status: 'erro', tipo: 'erro_desconhecido', mensagem }
  }

  if (resposta.status === 413) return { status: 'erro', tipo: 'arquivo_muito_grande', mensagem: 'HTTP 413' }
  if (resposta.status === 415) return { status: 'erro', tipo: 'formato_invalido', mensagem: 'HTTP 415' }

  const corpo: unknown = await resposta.json().catch(() => null)

  if (!resposta.ok) {
    // Erros tipados vindos do backend (contrato) são repassados; o resto vira erro desconhecido.
    if (typeof corpo === 'object' && corpo !== null && 'tipo' in corpo) return { status: 'erro', ...corpo }
    return { status: 'erro', tipo: 'erro_desconhecido', mensagem: `HTTP ${resposta.status}` }
  }

  if (typeof corpo === 'object' && corpo !== null && !('status' in corpo) && 'categoria' in corpo) {
    const legado = corpo as { categoria: unknown; severidade: unknown }
    return {
      status: 'sucesso',
      imagemUrl: URL.createObjectURL(imagem),
      folhas: [{ id: 'folha-1', categoria: legado.categoria, severidade: legado.severidade }],
    }
  }

  return corpo
}
