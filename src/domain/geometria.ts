import type { RegiaoFolha } from '../api'

/**
 * Posição do círculo em % da caixa da imagem. `proporcao` = largura / altura.
 * O raio do contrato é relativo à menor dimensão, então o diâmetro vira % da largura assim.
 */
export function circuloEmPorcentagem(regiao: RegiaoFolha, proporcao: number) {
  const menorSobreLargura = proporcao >= 1 ? 1 / proporcao : 1
  return {
    left: `${regiao.x * 100}%`,
    top: `${regiao.y * 100}%`,
    width: `${regiao.raio * 2 * menorSobreLargura * 100}%`,
  }
}

const FRACAO_LENTE = 0.8
const ZOOM_MAXIMO = 8

/**
 * Enquadramento da lente do Detalhe: a região ocupa ~80% do círculo.
 * Retorna largura/posição da imagem em % do quadrado da lente.
 */
export function enquadramentoLente(regiao: RegiaoFolha, largura: number, altura: number) {
  const raioPx = regiao.raio * Math.min(largura, altura)
  // Tamanho da imagem em "lentes": a região (2·raio px) deve medir FRACAO_LENTE da lente.
  const larguraEmLentes = Math.min((FRACAO_LENTE * largura) / (2 * raioPx), (ZOOM_MAXIMO * largura) / Math.min(largura, altura))
  const alturaEmLentes = larguraEmLentes * (altura / largura)
  return {
    width: `${larguraEmLentes * 100}%`,
    left: `${(0.5 - regiao.x * larguraEmLentes) * 100}%`,
    top: `${(0.5 - regiao.y * alturaEmLentes) * 100}%`,
  }
}
