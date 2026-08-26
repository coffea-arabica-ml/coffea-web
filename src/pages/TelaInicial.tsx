type Props = {
  onIniciar: () => void
}

export function TelaInicial({ onIniciar }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-6 text-center">
      <h1 className="text-3xl font-bold">Diagnóstico de Estresses Bióticos em Café</h1>
      <p className="text-gray-600 max-w-md">
        Envie uma foto de uma folha de café arábica e receba uma estimativa do tipo de estresse e da severidade.
      </p>
      <button
        onClick={onIniciar}
        className="bg-green-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-800"
      >
        Começar
      </button>
    </div>
  )
}