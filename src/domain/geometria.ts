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

// Medidas do círculo da Visualização avançada (manter iguais às classes de AbaVisualizacao.tsx).
const DIAMETRO_MINIMO = '2.25rem' // min-w-9
const BORDA = '3px' // border-[3px]
const ESCALA_DESTAQUE = 1.1 // scale-110 do círculo em destaque
const FOLGA_DESTAQUE = 0.1 // ESCALA_DESTAQUE - 1
/** Meio selo com o anel (size-6 + ring-2 = 14 px) × 1,1, com folga para o canto arredondado (20 px) da moldura. */
const MARGEM_SELO = '1.125rem'

/**
 * Posição do selo numerado, em relação ao botão do círculo. A conta, em cada eixo da moldura:
 * - ponto a 45° = centro ± (diâmetro / 2) · √½ — o selo fica sobre o contorno, no alto à direita;
 * - limite = de (M + 0,1 · centro) / 1,1 até (extensão − M + 0,1 · centro) / 1,1, com M = MARGEM_SELO —
 *   assim, mesmo ampliado 1,1× em torno do centro do círculo (destaque), o selo fica a M da borda;
 * - o ponto limitado volta para o referencial do botão (− centro + diâmetro / 2 − borda).
 * Medidas em `cqw` (largura da moldura): a moldura precisa da classe `@container`.
 */
export function seloDoCirculo(regiao: RegiaoFolha, proporcao: number) {
  const larguraDoCirculo = regiao.raio * 2 * (proporcao >= 1 ? 1 / proporcao : 1) // como em circuloEmPorcentagem
  const diametro = `max(${larguraDoCirculo * 100}cqw, ${DIAMETRO_MINIMO})`
  const altura = `(100cqw / ${proporcao})`

  function eixo(centro: string, extensao: string, sentido: '+' | '-') {
    const alvo = `${centro} ${sentido} ${diametro} * ${Math.SQRT1_2 / 2}`
    const minimo = `(${MARGEM_SELO} + ${FOLGA_DESTAQUE} * ${centro}) / ${ESCALA_DESTAQUE}`
    const maximo = `(${extensao} - ${MARGEM_SELO} + ${FOLGA_DESTAQUE} * ${centro}) / ${ESCALA_DESTAQUE}`
    return `calc(clamp(${minimo}, ${alvo}, ${maximo}) - ${centro} + ${diametro} / 2 - ${BORDA})`
  }

  return {
    left: eixo(`(${regiao.x} * 100cqw)`, '100cqw', '+'),
    top: eixo(`(${regiao.y} * ${altura})`, altura, '-'),
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
