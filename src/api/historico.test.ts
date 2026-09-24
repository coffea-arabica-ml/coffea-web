import { describe, expect, it } from 'vitest'
import type { DiagnosticoSucesso } from './types'
import { apagarAnalise, listarAnalises, obterAnalise, salvarAnalise, historicoPersistente } from './historico'

const diagnostico: DiagnosticoSucesso = {
  status: 'sucesso',
  imagemUrl: 'blob:antiga',
  folhas: [{ id: 'f1', categoria: 'ferrugem', severidade: 'alta', regiao: { x: 0.5, y: 0.5, raio: 0.1 } }],
}

describe('repositório do histórico', () => {
  it('sem IndexedDB (jsdom) cai para memória e avisa que não persiste', async () => {
    expect(await historicoPersistente()).toBe(false)
  })

  it('salva, lista do mais novo para o mais antigo e recarrega sem reprocessar', async () => {
    const imagem = new Blob([new Uint8Array([1, 2, 3])], { type: 'image/jpeg' })
    const antiga = await salvarAnalise({ titulo: '  Talhão 1 ', diagnostico, imagem, nomeArquivo: 'a.jpg', realizadaEm: '2026-09-01T10:00:00.000Z' })
    const nova = await salvarAnalise({ titulo: 'Talhão 2', diagnostico, imagem, nomeArquivo: 'b.jpg', realizadaEm: '2026-09-20T10:00:00.000Z' })

    expect((await listarAnalises()).map((i) => i.titulo)).toEqual(['Talhão 2', 'Talhão 1'])

    const carregada = await obterAnalise(antiga.id)
    expect(carregada?.analise.titulo).toBe('Talhão 1')
    expect(carregada?.nomeArquivo).toBe('a.jpg')
    expect(carregada?.analise.diagnostico.folhas).toEqual(diagnostico.folhas)
    // A URL antiga (blob da sessão) nunca é reaproveitada.
    expect(carregada?.analise.diagnostico.imagemUrl).not.toBe('blob:antiga')
    expect(nova.id).not.toBe(antiga.id)
    expect(await obterAnalise('inexistente')).toBeNull()
  })
})

describe('exclusão', () => {
  it('remove do histórico e deixa de ser encontrada', async () => {
    const imagem = new Blob([new Uint8Array([9])], { type: 'image/jpeg' })
    const item = await salvarAnalise({ titulo: 'Apagar', diagnostico, imagem, nomeArquivo: 'x.jpg', realizadaEm: '2026-09-24T10:00:00.000Z' })
    await apagarAnalise(item.id)
    expect((await listarAnalises()).some((i) => i.id === item.id)).toBe(false)
    expect(await obterAnalise(item.id)).toBeNull()
  })
})
