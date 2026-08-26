type Resultado = {
  categoria: string
  severidade: string
}

type Props = {
  resultado: Resultado
  onNovaAnalise: () => void
}

export function TelaResultado({ resultado, onNovaAnalise }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6 text-center">
      <h2 className="text-2xl font-semibold">Resultado</h2>
      <p className="text-lg">Categoria: <span className="font-bold">{resultado.categoria}</span></p>
      <p className="text-lg">Severidade: <span className="font-bold">{resultado.severidade}</span></p>
      <button
        onClick={onNovaAnalise}
        className="mt-4 bg-green-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-800"
      >
        Analisar outra imagem
      </button>
    </div>
  )
}