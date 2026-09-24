import { useEffect } from 'react'
import { act, cleanup, render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import type { FolhaDiagnostico } from '../../api'
import { ToastProvider } from '../../components/Toast'
import { NavegacaoAbas } from '../../layout/NavegacaoAbas'
import { HistoricoProvider } from '../../state/Historico'
import { SessaoAnaliseProvider, useSessaoAnalise, type AnaliseAtual } from '../../state/SessaoAnalise'
import { AbaVisualizacao } from './AbaVisualizacao'

afterEach(cleanup)

function analiseCom(folhas: FolhaDiagnostico[]): AnaliseAtual {
  return {
    id: 'a',
    diagnostico: { status: 'sucesso', imagemUrl: 'data:image/png;base64,', folhas },
    imagem: new Blob(),
    nomeArquivo: 'x.jpg',
    realizadaEm: '2026-09-24T10:00:00.000Z',
  }
}

function Abrir({ analise }: { analise: AnaliseAtual }) {
  const { abrirAnalise } = useSessaoAnalise()
  useEffect(() => abrirAnalise(analise), [abrirAnalise, analise])
  return null
}

function renderizar(analise: AnaliseAtual | null) {
  const router = createMemoryRouter(
    [
      {
        path: '/visualizacao',
        element: (
          <>
            {analise && <Abrir analise={analise} />}
            <NavegacaoAbas variante="topo" />
            <AbaVisualizacao />
          </>
        ),
      },
    ],
    { initialEntries: ['/visualizacao'] },
  )
  return render(
    <ToastProvider>
      <SessaoAnaliseProvider>
        <HistoricoProvider>
          <RouterProvider router={router} />
        </HistoricoProvider>
      </SessaoAnaliseProvider>
    </ToastProvider>,
  )
}

/** Dispara o onLoad da imagem (jsdom não carrega imagens), que é quando os círculos aparecem. */
function carregarImagem() {
  const img = screen.getByRole('img', { name: /Foto analisada/ })
  Object.defineProperty(img, 'naturalWidth', { value: 1000 })
  Object.defineProperty(img, 'naturalHeight', { value: 1500 })
  act(() => void img.dispatchEvent(new Event('load')))
}

const ferrugem: FolhaDiagnostico = { id: 'f1', categoria: 'ferrugem', severidade: 'alta', regiao: { x: 0.7, y: 0.3, raio: 0.1 } }
const phomaSemRegiao: FolhaDiagnostico = { id: 'f2', categoria: 'phoma', severidade: 'baixa' }

describe('Visualização avançada (RF04 + pendência do RF09)', () => {
  it('desenha um círculo clicável por folha com região', async () => {
    renderizar(analiseCom([ferrugem, { id: 's', categoria: 'saudavel', severidade: 'saudavel' }]))
    await screen.findByText('Problemas identificados')
    carregarImagem()
    expect(screen.getAllByRole('button', { name: /^Folha \d/ })).toHaveLength(1)
  })

  it('sem região: degrada para lista, sem círculos e sem ficar em branco', async () => {
    renderizar(analiseCom([phomaSemRegiao]))
    await screen.findByText('Problemas identificados')
    carregarImagem()
    expect(screen.queryAllByRole('button', { name: /^Folha \d/ })).toHaveLength(0)
    expect(screen.getByText(/localização das folhas não está disponível/)).toBeTruthy()
    expect(screen.getByRole('link', { name: /Folha 1/ })).toBeTruthy()
  })

  it('caso misto: círculo só onde há região, as duas folhas na lista', async () => {
    renderizar(analiseCom([ferrugem, phomaSemRegiao]))
    await screen.findByText('Problemas identificados')
    carregarImagem()
    expect(screen.getAllByRole('button', { name: /^Folha \d/ })).toHaveLength(1)
    expect(screen.getAllByRole('link', { name: /^\d?\s*Folha \d/ })).toHaveLength(2)
  })

  it('0 problemas: estado saudável', async () => {
    renderizar(analiseCom([]))
    expect(await screen.findByText('Nenhum problema identificado')).toBeTruthy()
    expect(screen.getByText('Como continuar cuidando')).toBeTruthy()
  })

  it('sem análise: Resumo e Visualização ficam bloqueados na navegação', () => {
    renderizar(null)
    expect(screen.getByRole('button', { name: /Resumo técnico — disponível depois/ }).getAttribute('aria-disabled')).toBe('true')
    expect(screen.getByRole('button', { name: /Visualização avançada — disponível depois/ })).toBeTruthy()
  })
})
