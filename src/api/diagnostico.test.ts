import { afterEach, describe, expect, it, vi } from 'vitest'
import { enviarImagemParaDiagnostico } from './diagnostico'
import { httpDiagnosticar } from './http'
import { MENSAGENS_ERRO } from './mock/cenarios'
import { mockDiagnosticar } from './mock/mockDiagnostico'

vi.mock('./http', () => ({ httpDiagnosticar: vi.fn() }))
vi.mock('./mock/mockDiagnostico', () => ({ mockDiagnosticar: vi.fn() }))

const foto = () => new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe0])], 'foto.jpg', { type: 'image/jpeg' })

afterEach(() => {
  vi.resetAllMocks()
  vi.restoreAllMocks()
})

describe('enviarImagemParaDiagnostico', () => {
  it('exceção inesperada: vai para o console, e a tela recebe uma mensagem em português', async () => {
    // Ex.: navegador sem AbortSignal.any. Vale para os dois modos (mock e http).
    const excecao = new TypeError('AbortSignal.any is not a function')
    vi.mocked(httpDiagnosticar).mockRejectedValue(excecao)
    vi.mocked(mockDiagnosticar).mockRejectedValue(excecao)
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    const resposta = await enviarImagemParaDiagnostico(foto())

    expect(resposta).toEqual({
      status: 'erro',
      tipo: 'erro_desconhecido',
      mensagem: 'Ocorreu uma falha inesperada ao analisar a foto.',
    })
    expect(consoleError).toHaveBeenCalledWith(expect.any(String), excecao)
  })

  it('cancelamento continua rejeitando, sem virar erro na tela', async () => {
    const controle = new AbortController()
    controle.abort()
    await expect(enviarImagemParaDiagnostico(foto(), { signal: controle.signal })).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('o erro desconhecido do mock não traz código HTTP', () => {
    expect(MENSAGENS_ERRO.erro_desconhecido).not.toMatch(/HTTP|\d{3}/)
  })
})
