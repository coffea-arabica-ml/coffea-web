type Props = {
  onImagemSelecionada: (arquivo: File) => void
}

export function TelaUpload({ onImagemSelecionada }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-6 text-center">
      <h2 className="text-2xl font-semibold">Envie a foto da folha</h2>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const arquivo = e.target.files?.[0]
          if (arquivo) onImagemSelecionada(arquivo)
        }}
        className="border border-gray-300 rounded-lg p-3"
      />
    </div>
  )
}