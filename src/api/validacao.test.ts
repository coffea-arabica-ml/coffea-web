import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { detectarFormato, validarImagem } from './validacao'

const PASTA = join(__dirname, '..', 'assets', 'exemplos')

function fixture(nome: string, tipo = ''): File {
  return new File([readFileSync(join(PASTA, nome))], nome, { type: tipo })
}

describe('validarImagem', () => {
  it('aceita JPEG real', async () => {
    expect(await validarImagem(fixture('planta-cafe-doente.jpg', 'image/jpeg'))).toBeNull()
  })

  it('aceita PNG real dentro do limite', async () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d])
    expect(await validarImagem(new File([png], 'mini.png', { type: 'image/png' }))).toBeNull()
  })

  it('rejeita .txt disfarçado de .png pelo conteúdo, não pela extensão', async () => {
    const r = await validarImagem(fixture('teste-extensao-trocada.png', 'image/png'))
    expect(r?.tipo).toBe('formato_invalido')
  })

  it.each(['teste-formato-gif.gif', 'teste-formato-webp.webp'])('rejeita %s', async (nome) => {
    expect((await validarImagem(fixture(nome)))?.tipo).toBe('formato_invalido')
  })

  it('rejeita arquivo acima de 10 MB', async () => {
    expect((await validarImagem(fixture('teste-arquivo-grande.png')))?.tipo).toBe('arquivo_muito_grande')
  })
})

describe('detectarFormato', () => {
  it('identifica GIF e WEBP para a mensagem de erro', () => {
    expect(detectarFormato(new Uint8Array(readFileSync(join(PASTA, 'teste-formato-gif.gif')).subarray(0, 16)))).toBe('gif')
    expect(detectarFormato(new Uint8Array(readFileSync(join(PASTA, 'teste-formato-webp.webp')).subarray(0, 16)))).toBe('webp')
  })
})
