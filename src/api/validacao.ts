import { LIMITES } from './config'
import type { DiagnosticoErro } from './types'

type FormatoDetectado = 'jpeg' | 'png' | 'gif' | 'webp' | 'heic' | 'bmp' | 'pdf' | 'desconhecido'

const NOMES_FORMATO: Record<FormatoDetectado, string> = {
  jpeg: 'JPEG',
  png: 'PNG',
  gif: 'GIF',
  webp: 'WEBP',
  heic: 'HEIC',
  bmp: 'BMP',
  pdf: 'PDF',
  desconhecido: 'desconhecido',
}

function comeca(bytes: Uint8Array, assinatura: number[], deslocamento = 0) {
  return assinatura.every((b, i) => bytes[deslocamento + i] === b)
}

/** Identifica o formato pelo conteúdo real do arquivo (magic bytes), nunca pela extensão. */
export function detectarFormato(bytes: Uint8Array): FormatoDetectado {
  if (comeca(bytes, [0xff, 0xd8, 0xff])) return 'jpeg'
  if (comeca(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'png'
  if (comeca(bytes, [0x47, 0x49, 0x46, 0x38])) return 'gif'
  if (comeca(bytes, [0x52, 0x49, 0x46, 0x46]) && comeca(bytes, [0x57, 0x45, 0x42, 0x50], 8)) return 'webp'
  if (comeca(bytes, [0x66, 0x74, 0x79, 0x70], 4)) return 'heic'
  if (comeca(bytes, [0x42, 0x4d])) return 'bmp'
  if (comeca(bytes, [0x25, 0x50, 0x44, 0x46])) return 'pdf'
  return 'desconhecido'
}

function erro(tipo: DiagnosticoErro['tipo'], mensagem: string): DiagnosticoErro {
  return { status: 'erro', tipo, mensagem }
}

async function lerCabecalho(arquivo: Blob): Promise<Uint8Array> {
  const fatia = arquivo.slice(0, 16)
  // FileReader cobre ambientes onde Blob.arrayBuffer não existe (ex.: jsdom).
  if (typeof fatia.arrayBuffer === 'function') return new Uint8Array(await fatia.arrayBuffer())
  return new Promise((resolve, reject) => {
    const leitor = new FileReader()
    leitor.onload = () => resolve(new Uint8Array(leitor.result as ArrayBuffer))
    leitor.onerror = () => reject(leitor.error)
    leitor.readAsArrayBuffer(fatia)
  })
}

/**
 * Pré-validação feita no próprio navegador, antes de qualquer envio.
 * Roda nos modos mock e http — o backend também deve validar, isto só dá resposta instantânea.
 * Retorna `null` se a imagem pode seguir para o diagnóstico.
 */
export async function validarImagem(arquivo: File): Promise<DiagnosticoErro | null> {
  const formato = detectarFormato(await lerCabecalho(arquivo))

  if (formato !== 'jpeg' && formato !== 'png') {
    return erro(
      'formato_invalido',
      formato === 'desconhecido'
        ? 'O arquivo não é uma imagem reconhecida.'
        : `O arquivo é ${NOMES_FORMATO[formato]}; aceitamos apenas ${LIMITES.formatosRotulo}.`,
    )
  }

  if (arquivo.size > LIMITES.tamanhoMaximoBytes) {
    return erro('arquivo_muito_grande', `O arquivo excede o limite de ${LIMITES.tamanhoMaximoRotulo}.`)
  }

  // Cabeçalho válido mas conteúdo corrompido/truncado.
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(arquivo)
      bitmap.close()
    } catch {
      return erro('formato_invalido', 'Não foi possível abrir a imagem — o arquivo pode estar corrompido.')
    }
  }

  return null
}
