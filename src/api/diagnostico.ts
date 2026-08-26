export type ResultadoDiagnostico = {
  categoria: string
  severidade: string
}

// TODO (Frente 6): confirmar a URL real do coffea-backend quando estiver no ar
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export async function diagnosticarFolha(imagem: File): Promise<ResultadoDiagnostico> {
  const formData = new FormData()
  formData.append('imagem', imagem)

  const resposta = await fetch(`${API_URL}/diagnostico`, {
    method: 'POST',
    body: formData,
  })

  if (!resposta.ok) {
    throw new Error('Não foi possível analisar a imagem. Tente novamente.')
  }

  return resposta.json()
}