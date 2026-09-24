import { useRef, useState } from 'react'
import { Camera, FolderOpen } from 'lucide-react'
import { LIMITES } from '../api'
import { useSessaoAnalise } from '../state/SessaoAnalise'
import { CapturaWebcam } from './CapturaWebcam'
import { classesBotao, cx } from './ui'

function usaCameraNativa(): boolean {
  // Em telas de toque o <input capture> abre o app de câmera; no desktop ele é ignorado.
  return typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches
}

interface Props {
  className?: string
  /** "principal" destaca "Escolher arquivo"; "discreto" usa dois botões secundários. */
  enfase?: 'principal' | 'discreto'
}

/** Os dois caminhos de envio do RF06 — arquivo existente ou câmera — sempre uma imagem por vez. */
export function SeletorImagem({ className, enfase = 'principal' }: Props) {
  const { enviarArquivo } = useSessaoAnalise()
  const inputArquivo = useRef<HTMLInputElement>(null)
  const inputCamera = useRef<HTMLInputElement>(null)
  const [webcamAberta, setWebcamAberta] = useState(false)

  function aoSelecionar(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    e.target.value = '' // permite escolher o mesmo arquivo de novo
    if (arquivo) void enviarArquivo(arquivo)
  }

  function tirarFoto() {
    if (usaCameraNativa()) inputCamera.current?.click()
    else setWebcamAberta(true)
  }

  return (
    <div className={cx('flex flex-wrap gap-3', className)}>
      <button
        type="button"
        className={classesBotao(enfase === 'principal' ? 'primario' : 'secundario', 'flex-1 sm:flex-none')}
        onClick={() => inputArquivo.current?.click()}
      >
        <FolderOpen aria-hidden /> Escolher arquivo
      </button>
      <button type="button" className={classesBotao('secundario', 'flex-1 sm:flex-none')} onClick={tirarFoto}>
        <Camera aria-hidden /> Tirar foto
      </button>

      <input ref={inputArquivo} type="file" accept={LIMITES.accept} onChange={aoSelecionar} hidden />
      <input ref={inputCamera} type="file" accept="image/*" capture="environment" onChange={aoSelecionar} hidden />

      {webcamAberta && (
        <CapturaWebcam
          aoFechar={() => setWebcamAberta(false)}
          aoCapturar={(arquivo) => {
            setWebcamAberta(false)
            void enviarArquivo(arquivo)
          }}
          aoEscolherArquivo={() => {
            setWebcamAberta(false)
            inputArquivo.current?.click()
          }}
        />
      )}
    </div>
  )
}
