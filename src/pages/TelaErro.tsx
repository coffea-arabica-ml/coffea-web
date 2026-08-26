type Props = {
  mensagem: string
  onTentarNovamente: () => void
}

export function TelaErro({ mensagem, onTentarNovamente }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6 text-center">
      <h2 className="text-2xl font-semibold text-red-600">Algo deu errado</h2>
      <p className="text-gray-600">{mensagem}</p>
      <button
        onClick={onTentarNovamente}
        className="bg-green-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-800"
      >
        Tentar novamente
      </button>
    </div>
  )
}