export function TelaCarregando() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="w-10 h-10 border-4 border-green-700 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-600">Analisando a imagem...</p>
    </div>
  )
}