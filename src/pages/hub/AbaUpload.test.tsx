import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import type { TipoErroUpload } from '../../api'
import { ERROS } from '../../content/textos'
import { SessaoAnaliseProvider } from '../../state/SessaoAnalise'
import { EstadoErro } from './AbaUpload'

afterEach(cleanup)

function renderizar(tipo: TipoErroUpload, mensagem: string) {
  render(
    <SessaoAnaliseProvider>
      <EstadoErro tipo={tipo} mensagem={mensagem} nomeArquivo="foto.png" tamanho={206_000} previewUrl={null} />
    </SessaoAnaliseProvider>,
  )
  return screen.getByRole('alert').textContent ?? ''
}

const COM_MENSAGEM: [TipoErroUpload, string][] = [
  ['arquivo_muito_grande', 'A imagem tem 8200 x 8200 pixels (67,2 megapixels); o limite é 64,0 megapixels.'],
  ['formato_invalido', 'O arquivo é GIF; aceitamos apenas JPG ou PNG.'],
  ['erro_desconhecido', 'O diagnóstico está indisponível no momento. Tente de novo mais tarde.'],
]

describe('EstadoErro (tela 5)', () => {
  it.each(COM_MENSAGEM)('%s: mostra a mensagem quando ela existe', (tipo, mensagem) => {
    const texto = renderizar(tipo, mensagem)
    expect(texto).toContain(mensagem)
    expect(texto).not.toContain(ERROS[tipo].explicacao)
  })

  it.each(COM_MENSAGEM)('%s: sem mensagem, usa a explicação padrão', (tipo) => {
    expect(renderizar(tipo, '')).toContain(ERROS[tipo].explicacao)
  })

  it('nos erros do modelo, a mensagem do backend não substitui o texto do Cafélens', () => {
    const texto = renderizar('planta_nao_identificada', 'Nenhuma folha de café foi encontrada.')
    expect(texto).toContain(ERROS.planta_nao_identificada.explicacao)
    expect(texto).not.toContain('Nenhuma folha de café foi encontrada.')
  })

  it('arquivo_muito_grande: título neutro, que serve aos 10 MB e aos 64 megapixels', () => {
    renderizar('arquivo_muito_grande', '')
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Essa foto é grande demais')
    expect(screen.getByText('Acima do limite')).toBeTruthy()
  })

  it('erro_desconhecido: oferece "Tentar de novo" e a sugestão não manda só verificar a internet', () => {
    const texto = renderizar('erro_desconhecido', '')
    expect(screen.getByRole('button', { name: /Tentar de novo/ })).toBeTruthy()
    expect(texto).toContain('Se o problema continuar, verifique sua conexão ou volte daqui a pouco.')
  })
})
