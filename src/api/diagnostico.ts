import { modoApi } from './config'
import { httpDiagnosticar } from './http'
import { mockDiagnosticar } from './mock/mockDiagnostico'
import { normalizarResposta } from './normalizar'
import type { DiagnosticoResponse } from './types'
import { validarImagem } from './validacao'

export interface OpcoesEnvio {
  /** Cancela o envio; a promessa rejeita com AbortError e nenhuma resposta é produzida. */
  signal?: AbortSignal
}

/**
 * Ponto único de entrada do diagnóstico. A assinatura (Promise<DiagnosticoResponse>) é o
 * contrato com as telas: trocar mock ↔ backend real não pode mudar nada fora de src/api/.
 * Erros esperados (validação, rede, servidor) viram `DiagnosticoErro`; só o cancelamento rejeita.
 */
export async function enviarImagemParaDiagnostico(imagem: File, opcoes: OpcoesEnvio = {}): Promise<DiagnosticoResponse> {
  const { signal } = opcoes
  const erroValidacao = await validarImagem(imagem)
  if (erroValidacao) return erroValidacao
  signal?.throwIfAborted()

  try {
    const bruta = modoApi === 'http' ? await httpDiagnosticar(imagem, signal) : await mockDiagnosticar(imagem, signal)
    return normalizarResposta(bruta, () => URL.createObjectURL(imagem))
  } catch (e) {
    if (signal?.aborted) throw e
    return {
      status: 'erro',
      tipo: 'erro_desconhecido',
      mensagem: e instanceof Error ? e.message : 'Falha inesperada ao analisar a imagem.',
    }
  }
}
