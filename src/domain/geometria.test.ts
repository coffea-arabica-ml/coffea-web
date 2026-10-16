import { describe, expect, it } from 'vitest'
import type { RegiaoFolha } from '../api'
import { seloDoCirculo } from './geometria'

const REM = 16
const RAIO_SELO = 14 // size-6 (24 px) / 2 + ring-2
const CANTO = 20 // rounded-[1.25rem] da moldura

/** Calcula, como o navegador, as expressões geradas (calc/clamp/max com cqw, rem e px) numa moldura de `largura` px. */
function avaliar(css: string, largura: number): number {
  const js = css
    .replace(/(\d+(?:\.\d+)?)cqw/g, `($1 * ${largura / 100})`)
    .replace(/(\d+(?:\.\d+)?)rem/g, `($1 * ${REM})`)
    .replace(/(\d+(?:\.\d+)?)px/g, '$1')
    .replace(/calc\(/g, '(')
  if (!/^[\d\s.+\-*/(),a-z]*$/.test(js)) throw new Error(`expressão inesperada: ${js}`)
  const clamp = (min: number, valor: number, max: number) => Math.max(min, Math.min(valor, max))
  return new Function('clamp', 'max', `return ${js}`)(clamp, Math.max) as number
}

/** O círculo de raio `r` (px) centrado em (x, y) cabe na moldura de cantos arredondados? */
function cabe(x: number, y: number, r: number, largura: number, altura: number) {
  const cx = Math.min(Math.max(x, CANTO), largura - CANTO)
  const cy = Math.min(Math.max(y, CANTO), altura - CANTO)
  return x >= r && y >= r && x <= largura - r && y <= altura - r && Math.hypot(x - cx, y - cy) <= CANTO - r + 1e-9
}

/** Centro do selo no referencial da moldura, a partir da posição do botão (como em circuloEmPorcentagem). */
function centroDoSelo(regiao: RegiaoFolha, proporcao: number, largura: number) {
  const altura = largura / proporcao
  const diametro = Math.max(regiao.raio * 2 * Math.min(1, 1 / proporcao) * largura, 2.25 * REM)
  const { left, top } = seloDoCirculo(regiao, proporcao)
  const centro = { x: regiao.x * largura, y: regiao.y * altura }
  const selo = {
    x: centro.x - diametro / 2 + 3 + avaliar(left, largura),
    y: centro.y - diametro / 2 + 3 + avaliar(top, largura),
  }
  return { altura, diametro, centro, selo }
}

const REGIOES: [string, RegiaoFolha][] = [
  ['21.jpg do BRACOL', { x: 0.505, y: 0.4957, raio: 0.4718 }],
  ['20190831_163104', { x: 0.4903, y: 0.6606, raio: 0.1449 }],
  ...[0, 1].flatMap((x) => [0, 1].flatMap((y) => [0.5, 0.01].map((raio): [string, RegiaoFolha] => [`quina ${x},${y} r ${raio}`, { x, y, raio }]))),
  ['borda de cima', { x: 0.5, y: 0, raio: 0.1 }],
  ['borda direita', { x: 1, y: 0.5, raio: 0.1 }],
  ['borda de baixo', { x: 0.5, y: 1, raio: 0.2 }],
  ['borda esquerda', { x: 0, y: 0.5, raio: 0.3 }],
]
const LARGURAS = [343, 600] // moldura no celular de 375 px e no desktop
const PROPORCOES = [4 / 3, 3 / 4, 2, 1]

describe('seloDoCirculo', () => {
  it.each(REGIOES)('fica inteiro na moldura, em repouso e ampliado pelo destaque: %s', (_, regiao) => {
    for (const largura of LARGURAS) {
      for (const proporcao of PROPORCOES) {
        const { altura, centro, selo } = centroDoSelo(regiao, proporcao, largura)
        expect(cabe(selo.x, selo.y, RAIO_SELO, largura, altura), `${largura} px, proporção ${proporcao}`).toBe(true)
        const ampliado = { x: centro.x + 1.1 * (selo.x - centro.x), y: centro.y + 1.1 * (selo.y - centro.y) }
        expect(cabe(ampliado.x, ampliado.y, RAIO_SELO * 1.1, largura, altura), `${largura} px, proporção ${proporcao}, destaque`).toBe(true)
      }
    }
  })

  it('com espaço, fica sobre o contorno a 45° (no alto, à direita)', () => {
    const { diametro, centro, selo } = centroDoSelo({ x: 0.4903, y: 0.6606, raio: 0.1449 }, 4 / 3, 600)
    expect(selo.x - centro.x).toBeCloseTo((diametro / 2) * Math.SQRT1_2, 6)
    expect(centro.y - selo.y).toBeCloseTo((diametro / 2) * Math.SQRT1_2, 6)
  })
})
