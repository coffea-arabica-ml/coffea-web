import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet, RouterProvider, ScrollRestoration } from 'react-router'
import { ToastProvider } from './components/Toast'
import { ExigeAnalise, ShellHub } from './layout/ShellHub'
import { TelaInicial } from './pages/TelaInicial'
import { AbaUpload } from './pages/hub/AbaUpload'
import { HistoricoProvider } from './state/Historico'
import { SessaoAnaliseProvider } from './state/SessaoAnalise'

// Carregado sob demanda e só em desenvolvimento — some do build de produção.
const PainelCenarios = import.meta.env.DEV ? lazy(() => import('./dev/PainelCenarios')) : null

function Raiz() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
      {PainelCenarios && (
        <Suspense>
          <PainelCenarios />
        </Suspense>
      )}
    </>
  )
}

// Landing e Enviar entram no bundle inicial; as telas de resultado e o histórico carregam sob demanda.
const router = createBrowserRouter([
  {
    element: <Raiz />,
    children: [
      { path: '/', element: <TelaInicial /> },
      {
        element: <ShellHub />,
        children: [
          { path: '/enviar', element: <AbaUpload /> },
          { path: '/historico', lazy: async () => ({ Component: (await import('./pages/hub/AbaHistorico')).AbaHistorico }) },
          {
            element: <ExigeAnalise />,
            children: [
              { path: '/resumo', lazy: async () => ({ Component: (await import('./pages/hub/AbaResumo')).AbaResumo }) },
              { path: '/visualizacao', lazy: async () => ({ Component: (await import('./pages/hub/AbaVisualizacao')).AbaVisualizacao }) },
              {
                path: '/visualizacao/:folhaId',
                lazy: async () => ({ Component: (await import('./pages/hub/DetalheProblema')).DetalheProblema }),
              },
            ],
          },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])

function App() {
  return (
    <ToastProvider>
      <SessaoAnaliseProvider>
        <HistoricoProvider>
          <RouterProvider router={router} />
        </HistoricoProvider>
      </SessaoAnaliseProvider>
    </ToastProvider>
  )
}

export default App
