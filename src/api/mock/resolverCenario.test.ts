import { beforeEach, describe, expect, it } from 'vitest'
import { definirCenarioForcado, resolverCenario } from './resolverCenario'

const arquivo = (nome: string, tamanho = 1000) => new File([new Uint8Array(tamanho)], nome, { lastModified: 1 })

describe('resolverCenario', () => {
  beforeEach(() => {
    sessionStorage.clear()
    history.replaceState(null, '', '/')
  })

  it('usa a resposta calibrada para fotos conhecidas', () => {
    const r = resolverCenario(arquivo('planta-cafe-doente.jpg'))
    expect(r.tipo).toBe('sucesso')
    if (r.tipo === 'sucesso') {
      expect(r.folhas.filter((f) => f.categoria !== 'saudavel').map((f) => f.categoria)).toEqual(['ferrugem', 'cercosporiose'])
    }
  })

  it('mapeia as fixtures de erro do "modelo"', () => {
    expect(resolverCenario(arquivo('teste-sem-planta.jpg'))).toMatchObject({ erro: 'planta_nao_identificada' })
    expect(resolverCenario(arquivo('teste-especie-incorreta.jpg'))).toMatchObject({ erro: 'especie_incorreta' })
    expect(resolverCenario(arquivo('teste-baixa-qualidade.jpg'))).toMatchObject({ erro: 'baixa_confianca' })
  })

  it('simula o backend atual: 1 folha sem região', () => {
    const r = resolverCenario(arquivo('teste-quadrada.jpg'))
    expect(r.tipo === 'sucesso' && r.folhas).toEqual([{ id: 'folha-1', categoria: 'phoma', severidade: 'baixa' }])
  })

  it('é determinístico para fotos desconhecidas', () => {
    expect(resolverCenario(arquivo('minha-foto.jpg', 5000))).toEqual(resolverCenario(arquivo('minha-foto.jpg', 5000)))
  })

  it('cenário forçado tem prioridade sobre o nome do arquivo', () => {
    definirCenarioForcado('erro:erro_desconhecido')
    expect(resolverCenario(arquivo('planta-cafe-doente.jpg'))).toMatchObject({ tipo: 'erro', erro: 'erro_desconhecido' })
  })

  it('lê ?cenario= da URL', () => {
    history.replaceState(null, '', '/?cenario=saudavel_sem_folhas')
    expect(resolverCenario(arquivo('qualquer.jpg'))).toMatchObject({ tipo: 'sucesso', folhas: [] })
  })

  it('cenário misto tem folhas com e sem região', () => {
    definirCenarioForcado('varias_folhas_mistas')
    const r = resolverCenario(arquivo('x.jpg'))
    const problemas = r.tipo === 'sucesso' ? r.folhas.filter((f) => f.categoria !== 'saudavel') : []
    expect(problemas.some((f) => f.regiao)).toBe(true)
    expect(problemas.some((f) => !f.regiao)).toBe(true)
  })
})
