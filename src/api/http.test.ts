// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import { httpDiagnosticar } from './http'

/** Resposta real do coffea-backend (0e33bce) para 20190831_163104.jpg, do BRACOT de treino. */
const RESPOSTA_REAL = {
  status: 'sucesso',
  folhas: [
    { id: 'folha-1', categoria: 'saudavel', severidade: 'saudavel', regiao: { x: 0.9054, y: 0.8257, raio: 0.1606 }, confianca: 0.1004, scoreDeteccao: 0.9336, caixa: [0.797, 0.6222, 0.9988, 0.9991], cortadaNaBorda: true },
    { id: 'folha-2', categoria: 'saudavel', severidade: 'saudavel', regiao: { x: 0.9297, y: 0.1209, raio: 0.1233 }, confianca: 0.3779, scoreDeteccao: 0.9286, caixa: [0.8319, 0.001, 0.9995, 0.2898], cortadaNaBorda: true },
    { id: 'folha-3', categoria: 'saudavel', severidade: 'saudavel', regiao: { x: 0.8903, y: 0.4788, raio: 0.1573 }, confianca: 0.3586, scoreDeteccao: 0.9281, caixa: [0.7697, 0.2913, 0.9996, 0.7076], cortadaNaBorda: true },
    { id: 'folha-4', categoria: 'ferrugem', severidade: 'muito_baixa', regiao: { x: 0.4903, y: 0.6606, raio: 0.1449 }, confianca: 0.9691, scoreDeteccao: 0.9011, caixa: [0.3808, 0.4716, 0.5858, 0.9068], cortadaNaBorda: false },
  ],
  detalhes: {
    plano: 'deteccao', regra: null, deteccoes: 10, abaixo_do_limiar: 0, cortadas_por_area: 0, cortadas_por_cor: 0,
    cortadas_por_fragmento: 2, cortadas_por_limite: 0, abaixo_da_confianca: 4, recorte: 'B', decisao: 'duas_etapas',
    decisao_configurada: 'por_caminho', limiar_saudavel: 0.083, limiar_doenca: 0.65,
    classificador: 'base_resnet50_bracol', detector: 'detector_base',
  },
}

const foto = () => new File([new Uint8Array([0xff, 0xd8, 0xff])], 'foto.jpg', { type: 'image/jpeg' })

function responder(status: number, corpo?: unknown) {
  const fetchFalso = vi.fn(async () =>
    corpo === undefined ? new Response(null, { status }) : Response.json(corpo, { status }),
  )
  vi.stubGlobal('fetch', fetchFalso)
  return fetchFalso
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('httpDiagnosticar', () => {
  it('envia a foto no campo "imagem" e repassa o sucesso do contrato como está', async () => {
    const fetchFalso = responder(200, RESPOSTA_REAL)
    expect(await httpDiagnosticar(foto())).toEqual(RESPOSTA_REAL)
    const [url, init] = fetchFalso.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toMatch(/\/diagnostico$/)
    expect((init.body as FormData).get('imagem')).toBeInstanceOf(File)
  })

  it('repassa o erro tipado do modelo que vem com HTTP 200', async () => {
    const erro = { status: 'erro', tipo: 'baixa_confianca', mensagem: 'Encontramos folhas, mas o diagnóstico não ficou confiável.' }
    responder(200, erro)
    expect(await httpDiagnosticar(foto())).toEqual(erro)
  })

  it.each([
    [413, 'arquivo_muito_grande', 'A imagem passa de 10 MB. Envie uma foto menor.'],
    [415, 'formato_invalido', 'Formato não aceito. Envie uma foto em JPG ou PNG.'],
  ])('decide o tipo do %i pelo código e usa a mensagem do corpo', async (status, tipo, mensagem) => {
    responder(status, { status: 'erro', tipo, mensagem })
    expect(await httpDiagnosticar(foto())).toEqual({ status: 'erro', tipo, mensagem })
  })

  it.each([
    [413, 'arquivo_muito_grande'],
    [415, 'formato_invalido'],
  ])('sem corpo, o %i chega com mensagem vazia (a tela usa o texto padrão)', async (status, tipo) => {
    responder(status)
    expect(await httpDiagnosticar(foto())).toEqual({ status: 'erro', tipo, mensagem: '' })
  })

  it.each([
    [422, 'formato_invalido', 'O arquivo enviado está vazio. Envie uma foto em JPG ou PNG.'],
    [500, 'erro_desconhecido', 'Erro inesperado no servidor. Tente de novo em instantes.'],
    [503, 'erro_desconhecido', 'O diagnóstico está indisponível no momento. Tente de novo mais tarde.'],
  ])('repassa o tipo do corpo no HTTP %i', async (status, tipo, mensagem) => {
    responder(status, { status: 'erro', tipo, mensagem })
    expect(await httpDiagnosticar(foto())).toEqual({ status: 'erro', tipo, mensagem })
  })

  it('não-OK sem corpo do contrato vira erro desconhecido', async () => {
    responder(502)
    expect(await httpDiagnosticar(foto())).toMatchObject({ status: 'erro', tipo: 'erro_desconhecido' })
  })

  it('falha de rede vira erro desconhecido, sem lançar', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('Failed to fetch'))))
    expect(await httpDiagnosticar(foto())).toEqual({
      status: 'erro',
      tipo: 'erro_desconhecido',
      mensagem: 'Não foi possível conectar ao servidor.',
    })
  })

  it('tempo limite vira erro desconhecido', async () => {
    vi.spyOn(AbortSignal, 'timeout').mockReturnValue(AbortSignal.abort(new DOMException('Tempo esgotado', 'TimeoutError')))
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => Promise.reject(init.signal?.reason)))
    expect(await httpDiagnosticar(foto())).toEqual({
      status: 'erro',
      tipo: 'erro_desconhecido',
      mensagem: 'O servidor demorou demais para responder.',
    })
  })

  it('cancelamento rejeita com AbortError', async () => {
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => Promise.reject(init.signal?.reason)))
    const controle = new AbortController()
    controle.abort()
    await expect(httpDiagnosticar(foto(), controle.signal)).rejects.toMatchObject({ name: 'AbortError' })
  })
})
