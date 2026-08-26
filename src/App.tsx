import { useState } from 'react'
import { TelaInicial } from './pages/TelaInicial'
import { TelaUpload } from './pages/TelaUpload'
import { TelaCarregando } from './pages/TelaCarregando'
import { TelaResultado } from './pages/TelaResultado'
import { TelaErro } from './pages/TelaErro'

type Tela = 'inicial' | 'upload' | 'carregando' | 'resultado' | 'erro'

type Resultado = {
  categoria: string
  severidade: string
}

function App() {
  const [tela, setTela] = useState<Tela>('inicial')
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [erro] = useState('')

  function handleImagemSelecionada(_arquivo: File) {
    setTela('carregando')
    // TODO (Frente 6): trocar isso pela chamada real ao coffea-backend
    setTimeout(() => {
      setResultado({ categoria: 'Ferrugem', severidade: 'Baixa' })
      setTela('resultado')
    }, 1500)
  }

  if (tela === 'inicial') return <TelaInicial onIniciar={() => setTela('upload')} />
  if (tela === 'upload') return <TelaUpload onImagemSelecionada={handleImagemSelecionada} />
  if (tela === 'carregando') return <TelaCarregando />
  if (tela === 'resultado' && resultado) return <TelaResultado resultado={resultado} onNovaAnalise={() => setTela('upload')} />
  if (tela === 'erro') return <TelaErro mensagem={erro} onTentarNovamente={() => setTela('upload')} />

  return null
}

export default App