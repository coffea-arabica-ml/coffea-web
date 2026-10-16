import { describe, expect, it } from 'vitest'
import { normalizarResposta } from './normalizar'

const url = () => 'blob:padrao'

describe('normalizarResposta', () => {
  it('descarta região fora de 0–1 sem descartar a folha', () => {
    const r = normalizarResposta(
      { status: 'sucesso', imagemUrl: 'x', folhas: [{ id: 'a', categoria: 'ferrugem', severidade: 'alta', regiao: { x: 1.4, y: 0.2, raio: 0.1 } }] },
      url,
    )
    expect(r).toEqual({ status: 'sucesso', imagemUrl: 'x', folhas: [{ id: 'a', categoria: 'ferrugem', severidade: 'alta' }] })
  })

  it('aceita folhas ausentes, ignora categorias desconhecidas e completa ids', () => {
    expect(normalizarResposta({ status: 'sucesso' }, url)).toEqual({ status: 'sucesso', imagemUrl: 'blob:padrao', folhas: [] })
    const r = normalizarResposta(
      { status: 'sucesso', folhas: [{ categoria: 'x' }, { categoria: 'phoma', severidade: 'baixa' }, { categoria: 'phoma', severidade: 'alta' }] },
      url,
    )
    expect(r.status === 'sucesso' && r.folhas.map((f) => f.id)).toEqual(['folha-2', 'folha-3'])
  })

  it('mantém categoria e severidade coerentes', () => {
    const r = normalizarResposta(
      { status: 'sucesso', folhas: [{ id: 'a', categoria: 'saudavel', severidade: 'alta' }, { id: 'b', categoria: 'ferrugem', severidade: 'saudavel' }] },
      url,
    )
    expect(r.status === 'sucesso' && r.folhas.map((f) => f.severidade)).toEqual(['saudavel', 'muito_baixa'])
  })

  it('resposta real do backend: descarta os extras e preenche imagemUrl com a foto local', () => {
    // Folha da resposta do coffea-backend para 20190831_163104.jpg (BRACOT de treino).
    const r = normalizarResposta(
      {
        status: 'sucesso',
        folhas: [
          { id: 'folha-4', categoria: 'ferrugem', severidade: 'muito_baixa', regiao: { x: 0.4903, y: 0.6606, raio: 0.1449 }, confianca: 0.9691, scoreDeteccao: 0.9011, caixa: [0.3808, 0.4716, 0.5858, 0.9068], cortadaNaBorda: false },
        ],
        detalhes: { plano: 'deteccao', decisao: 'duas_etapas' },
      },
      url,
    )
    expect(r).toEqual({
      status: 'sucesso',
      imagemUrl: 'blob:padrao',
      folhas: [{ id: 'folha-4', categoria: 'ferrugem', severidade: 'muito_baixa', regiao: { x: 0.4903, y: 0.6606, raio: 0.1449 } }],
    })
  })

  it('transforma lixo e tipos de erro desconhecidos em erro_desconhecido, sem mensagem técnica', () => {
    const semMensagem = { status: 'erro', tipo: 'erro_desconhecido', mensagem: '' }
    expect(normalizarResposta(null, url)).toEqual(semMensagem)
    expect(normalizarResposta({ status: 'processando' }, url)).toEqual(semMensagem)
    expect(normalizarResposta({ status: 'erro', tipo: 'outro' }, url)).toEqual(semMensagem)
  })
})
