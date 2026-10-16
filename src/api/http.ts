import { API_URL } from './config'

const TEMPO_LIMITE_MS = 30_000

/**
 * Adapter do `POST /diagnostico` do coffea-backend (contrato implementado no commit 0e33bce).
 * Devolve o JSON do contrato, ainda não normalizado: o sucesso é repassado como está (os extras
 * do modelo, como `confianca` e `detalhes`, ficam para o normalizador descartar).
 *
 * Códigos HTTP: 200 traz sucesso ou erro tipado do modelo; 413 e 415 viram o tipo pelo código;
 * nos demais não-OK (422, 500, 503), o `tipo` do corpo é repassado. A mensagem do corpo segue
 * junto — sem ela, fica vazia e a tela usa o próprio texto.
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

  const corpo: unknown = await resposta.json().catch(() => null)
  const ehObjeto = typeof corpo === 'object' && corpo !== null
  const mensagem = ehObjeto && 'mensagem' in corpo && typeof corpo.mensagem === 'string' ? corpo.mensagem : ''

  if (resposta.status === 413) return { status: 'erro', tipo: 'arquivo_muito_grande', mensagem }
  if (resposta.status === 415) return { status: 'erro', tipo: 'formato_invalido', mensagem }

  if (!resposta.ok) {
    // Erros tipados vindos do backend (contrato) são repassados; o resto vira erro desconhecido.
    if (ehObjeto && 'tipo' in corpo) return { ...corpo, status: 'erro' }
    return { status: 'erro', tipo: 'erro_desconhecido', mensagem: `HTTP ${resposta.status}` }
  }

  return corpo
}
