import { useEffect, useRef, useState } from 'react'
import { Camera, CameraOff, FolderOpen } from 'lucide-react'
import { Modal } from './Modal'
import { classesBotao } from './ui'

interface Props {
  aoFechar: () => void
  aoCapturar: (arquivo: File) => void
  /** Plano B quando não há câmera ou permissão. */
  aoEscolherArquivo: () => void
}

type Estado = { fase: 'iniciando' } | { fase: 'pronta' } | { fase: 'falha'; motivo: string }

function motivoDaFalha(e: unknown): string {
  const nome = e instanceof DOMException ? e.name : ''
  if (nome === 'NotAllowedError') return 'O acesso à câmera foi bloqueado. Libere a permissão no navegador ou envie um arquivo.'
  if (nome === 'NotFoundError' || nome === 'OverconstrainedError') return 'Não encontramos nenhuma câmera neste dispositivo.'
  if (nome === 'NotReadableError') return 'A câmera está sendo usada por outro programa.'
  return 'Não foi possível abrir a câmera neste navegador.'
}

/**
 * "Tirar foto" no computador. A prévia ao vivo serve só para enquadrar: o botão captura
 * um único quadro estático (RF06 — nunca vídeo contínuo).
 */
// Em contexto inseguro (http fora de localhost) mediaDevices não existe.
const temCamera = () => typeof navigator.mediaDevices?.getUserMedia === 'function'

const SEM_SUPORTE: Estado = { fase: 'falha', motivo: 'Este navegador não permite usar a câmera.' }

/** Montado só enquanto aberto: cada abertura pede a câmera de novo e a libera ao fechar. */
export function CapturaWebcam({ aoFechar, aoCapturar, aoEscolherArquivo }: Props) {
  const video = useRef<HTMLVideoElement>(null)
  const [estado, setEstado] = useState<Estado>(() =>
    temCamera() ? { fase: 'iniciando' } : SEM_SUPORTE,
  )

  useEffect(() => {
    if (!temCamera()) return
    let stream: MediaStream | null = null
    let cancelado = false
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1440 } }, audio: false })
      .then((s) => {
        if (cancelado) return s.getTracks().forEach((t) => t.stop())
        stream = s
        if (video.current) video.current.srcObject = s
        setEstado({ fase: 'pronta' })
      })
      .catch((e: unknown) => !cancelado && setEstado({ fase: 'falha', motivo: motivoDaFalha(e) }))

    return () => {
      cancelado = true
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  function capturar() {
    const v = video.current
    if (!v || !v.videoWidth) return
    const canvas = document.createElement('canvas')
    canvas.width = v.videoWidth
    canvas.height = v.videoHeight
    canvas.getContext('2d')?.drawImage(v, 0, 0)
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const carimbo = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
        aoCapturar(new File([blob], `foto-${carimbo}.jpg`, { type: 'image/jpeg' }))
      },
      'image/jpeg',
      0.92,
    )
  }

  return (
    <Modal aberto aoFechar={aoFechar} titulo="Tirar foto" className="w-[min(94vw,44rem)]">
      <p className="mt-1 text-sm text-tinta-suave">Enquadre a planta inteira e capture quando a imagem estiver nítida.</p>
      <div className="relative mt-5 aspect-[4/3] overflow-hidden rounded-2xl bg-folha-900">
        <video ref={video} autoPlay playsInline muted className="size-full object-cover" />
        {estado.fase === 'iniciando' && (
          <p className="absolute inset-0 grid place-items-center text-sm text-white/80">Abrindo a câmera…</p>
        )}
        {estado.fase === 'falha' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-white">
            <CameraOff className="size-8 text-white/70" aria-hidden />
            <p className="max-w-sm text-sm leading-relaxed">{estado.motivo}</p>
          </div>
        )}
      </div>
      <div className="mt-5 flex flex-wrap justify-end gap-3">
        {estado.fase === 'falha' ? (
          <button type="button" className={classesBotao('primario')} onClick={aoEscolherArquivo}>
            <FolderOpen aria-hidden /> Escolher arquivo
          </button>
        ) : (
          <button type="button" className={classesBotao('primario')} onClick={capturar} disabled={estado.fase !== 'pronta'}>
            <Camera aria-hidden /> Capturar foto
          </button>
        )}
      </div>
    </Modal>
  )
}
