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

  it('transforma lixo e tipos de erro desconhecidos em erro_desconhecido', () => {
    expect(normalizarResposta(null, url)).toMatchObject({ status: 'erro', tipo: 'erro_desconhecido' })
    expect(normalizarResposta({ status: 'erro', tipo: 'outro' }, url)).toMatchObject({ tipo: 'erro_desconhecido' })
  })
})
