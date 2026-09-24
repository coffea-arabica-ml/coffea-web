import { useEffect, useState, type DragEvent, type ReactNode } from 'react'
import { Link } from 'react-router'
import {
  ArrowRight,
  CircleCheck,
  CloudOff,
  FileX2,
  Focus,
  RotateCcw,
  ScanSearch,
  SearchX,
  Sprout,
  Weight,
  type LucideIcon,
} from 'lucide-react'
import { LIMITES, type TipoErroUpload } from '../../api'
import exemploDoente from '../../assets/exemplos/planta-cafe-doente.jpg'
import exemploSaudavel from '../../assets/exemplos/planta-cafe-saudavel.jpg'
import { IlustracaoEnquadramento } from '../../components/IlustracaoEnquadramento'
import { MolduraImagem } from '../../components/MolduraImagem'
import { RotuloStatus } from '../../components/RotuloStatus'
import { SeletorImagem } from '../../components/SeletorImagem'
import { useToast } from '../../components/Toast'
import { classesBotao, formatarBytes } from '../../components/ui'
import { CAPTURA, ERROS } from '../../content/textos'
import { estaSaudavel } from '../../domain/analise'
import { resumirDiagnostico } from '../../domain/resumo'
import { useSessaoAnalise, type AnaliseAtual, type EstadoSessao } from '../../state/SessaoAnalise'

const ICONES_ERRO: Record<TipoErroUpload, LucideIcon> = {
  planta_nao_identificada: SearchX,
  formato_invalido: FileX2,
  especie_incorreta: Sprout,
  arquivo_muito_grande: Weight,
  baixa_confianca: Focus,
  erro_desconhecido: CloudOff,
}

const EXEMPLOS = [
  { src: exemploDoente, nome: 'planta-cafe-doente.jpg', rotulo: 'Com sinais' },
  { src: exemploSaudavel, nome: 'planta-cafe-saudavel.jpg', rotulo: 'Saudável' },
]

/** Telas 2 a 5: estado vazio, carregamento, sucesso e erros — todas na mesma estrutura. */
export function AbaUpload() {
  const { estado, enviarArquivo } = useSessaoAnalise()
  const avisar = useToast()
  const [arrastando, setArrastando] = useState(false)

  function receber(arquivos: FileList | File[]) {
    const lista = [...arquivos]
    if (lista.length === 0) return
    if (lista.length > 1) avisar('Analisamos uma foto por vez — usamos a primeira.')
    void enviarArquivo(lista[0])
  }

  // Colar uma imagem (Ctrl+V) também envia.
  useEffect(() => {
    function aoColar(e: ClipboardEvent) {
      const imagens = [...(e.clipboardData?.files ?? [])]
      if (imagens.length) receber(imagens)
    }
    window.addEventListener('paste', aoColar)
    return () => window.removeEventListener('paste', aoColar)
  })

  const eventosArrastar = {
    onDragOver: (e: DragEvent) => {
      e.preventDefault()
      setArrastando(true)
    },
    onDragLeave: (e: DragEvent) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node)) setArrastando(false)
    },
    onDrop: (e: DragEvent) => {
      e.preventDefault()
      setArrastando(false)
      receber(e.dataTransfer.files)
    },
  }

  return (
    <section {...eventosArrastar} className="relative">
      <Conteudo estado={estado} />
      {arrastando && (
        <div className="pointer-events-none absolute -inset-3 z-20 grid place-items-center rounded-[2rem] border-2 border-dashed border-folha-500 bg-folha-50/85 backdrop-blur-sm">
          <p className="font-display-suave text-2xl font-semibold text-folha-700">Solte a foto para analisar</p>
        </div>
      )}
    </section>
  )
}

function Conteudo({ estado }: { estado: EstadoSessao }) {
  switch (estado.fase) {
    case 'vazia':
      return <EstadoVazio />
    case 'enviando':
      return <EstadoEnviando previewUrl={estado.previewUrl} lento={estado.lento} />
    case 'sucesso':
      return <EstadoSucesso analise={estado.analise} />
    case 'erro':
      return (
        <EstadoErro
          tipo={estado.erro.tipo}
          mensagem={estado.erro.mensagem}
          nomeArquivo={estado.arquivo.name}
          tamanho={estado.arquivo.size}
          previewUrl={estado.previewUrl}
        />
      )
  }
}

/** Layout comum: card da imagem à esquerda, texto e ações ao lado. */
function Layout({ card, children }: { card: ReactNode; children: ReactNode }) {
  return (
    <div className="grid items-center gap-8 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:gap-12">
      <div className="animate-surgir">{card}</div>
      <div className="animate-surgir [animation-delay:80ms]">{children}</div>
    </div>
  )
}

function Titulo({ children, sobretitulo }: { children: ReactNode; sobretitulo?: ReactNode }) {
  return (
    <>
      {sobretitulo && <p className="mb-3 text-sm font-medium tracking-wide text-tinta-suave uppercase">{sobretitulo}</p>}
      <h1 tabIndex={-1} className="font-display-suave text-3xl leading-tight font-semibold tracking-tight text-balance outline-none sm:text-4xl">
        {children}
      </h1>
    </>
  )
}

function EstadoVazio() {
  const { enviarArquivo } = useSessaoAnalise()

  async function usarExemplo(src: string, nome: string) {
    const blob = await (await fetch(src)).blob()
    void enviarArquivo(new File([blob], nome, { type: blob.type || 'image/jpeg' }))
  }

  return (
    <Layout
      card={
        <div className="relative grid aspect-[4/3] max-h-[62vh] w-full place-items-center overflow-hidden rounded-cartao border-2 border-dashed border-folha-300 bg-superficie/70 md:aspect-[4/5]">
          <div className="pointer-events-none absolute -right-16 -bottom-16 size-64 rounded-full bg-folha-50" aria-hidden />
          <div className="relative flex flex-col items-center gap-4 p-6 text-center">
            <IlustracaoEnquadramento className="h-32 sm:h-44 md:h-52" />
            <p className="text-sm text-tinta-suave">
              {LIMITES.formatosRotulo}, até {LIMITES.tamanhoMaximoRotulo} · uma foto por vez
              <span className="hidden md:inline"> · ou arraste a imagem para cá</span>
            </p>
          </div>
        </div>
      }
    >
      <Titulo sobretitulo="Novo diagnóstico">Envie uma foto do seu cafeeiro</Titulo>
      <p className="mt-4 max-w-prose leading-relaxed text-tinta-suave">{CAPTURA.instrucao}</p>
      <ul className="mt-5 grid gap-2 text-sm">
        {CAPTURA.dicas.map((dica) => (
          <li key={dica} className="flex items-center gap-2">
            <CircleCheck className="size-4 text-folha-500" aria-hidden /> {dica}
          </li>
        ))}
      </ul>
      <SeletorImagem className="mt-7" />

      <div className="mt-8 border-t border-linha pt-6">
        <p className="text-sm text-tinta-suave">Sem uma foto agora? Experimente com um exemplo:</p>
        <div className="mt-3 flex gap-3">
          {EXEMPLOS.map((ex) => (
            <button
              key={ex.nome}
              type="button"
              onClick={() => void usarExemplo(ex.src, ex.nome)}
              aria-label={`Analisar a foto de exemplo: planta ${ex.rotulo.toLowerCase()}`}
              className="group flex min-w-0 flex-1 items-center gap-3 rounded-2xl sm:flex-none bg-superficie p-1.5 pr-4 text-left text-sm ring-1 ring-linha transition hover:ring-folha-300"
            >
              <img src={ex.src} alt="" className="size-12 rounded-xl object-cover transition group-hover:scale-105" />
              <span>
                <span className="block font-medium">{ex.rotulo}</span>
                <span className="text-xs whitespace-nowrap text-tinta-fraca">Exemplo</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </Layout>
  )
}

function EstadoEnviando({ previewUrl, lento }: { previewUrl: string; lento: boolean }) {
  const { cancelar } = useSessaoAnalise()
  return (
    <Layout
      card={
        <MolduraImagem src={previewUrl} alt="Foto enviada, em análise">
          <div className="absolute inset-0 bg-folha-900/35" aria-hidden />
          {/* lente de varredura */}
          <div className="absolute inset-0 overflow-hidden" aria-hidden>
            <div className="absolute inset-x-0 h-px animate-varrer bg-white/80 shadow-[0_0_24px_6px_rgb(255_255_255/0.45)]" />
            <div className="absolute top-1/2 left-1/2 -mt-16 -ml-16 size-32 animate-orbitar rounded-full border-2 border-white/80 shadow-[0_0_0_9999px_rgb(17_40_26/0.25)]" />
          </div>
        </MolduraImagem>
      }
    >
      <output aria-live="polite" className="block">
        <Titulo sobretitulo={<span className="inline-flex items-center gap-2"><ScanSearch className="size-4" aria-hidden /> Em análise</span>}>
          Analisando as folhas…
        </Titulo>
        <p className="mt-4 max-w-prose leading-relaxed text-tinta-suave">
          {lento
            ? 'Está levando mais tempo que o normal, mas continuamos trabalhando. Você pode aguardar ou cancelar.'
            : 'Estamos localizando cada folha e procurando sinais de estresse. Isso costuma levar poucos segundos.'}
        </p>
      </output>
      <div className="mt-6 h-1.5 max-w-sm overflow-hidden rounded-full bg-papel-2">
        <div className="h-full w-1/3 animate-barra rounded-full bg-folha-500" />
      </div>
      <button type="button" onClick={cancelar} className={classesBotao('fantasma', 'mt-6 -ml-3')}>
        Cancelar
      </button>
    </Layout>
  )
}

function EstadoSucesso({ analise }: { analise: AnaliseAtual }) {
  const saudavel = estaSaudavel(analise.diagnostico)
  const resumo = resumirDiagnostico(analise.diagnostico)
  return (
    <Layout
      card={
        <div className="flex flex-col items-center gap-4">
          <Link to="/resumo" viewTransition aria-label="Abrir o resumo técnico" className="block w-full rounded-[1.25rem]">
            <MolduraImagem src={analise.diagnostico.imagemUrl} alt="Foto analisada" status={saudavel ? 'saudavel' : 'problema'} alturaMaxima="56vh" />
          </Link>
          <RotuloStatus saudavel={saudavel} texto={resumo.status} />
        </div>
      }
    >
      {/* Anunciado por leitores de tela quando o carregamento termina. */}
      <output aria-live="polite" className="block">
        <Titulo sobretitulo="Análise concluída">{resumo.titulo}</Titulo>
        <p className="mt-4 max-w-prose leading-relaxed text-tinta-suave">{resumo.paragrafo}</p>
      </output>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/resumo" viewTransition className={classesBotao('primario')}>
          Ver resumo técnico <ArrowRight aria-hidden />
        </Link>
        <Link to="/visualizacao" viewTransition className={classesBotao('fantasma')}>
          Visualização avançada
        </Link>
      </div>
      <div className="mt-8 border-t border-linha pt-6">
        <p className="mb-3 text-sm text-tinta-suave">Quer analisar outra planta?</p>
        <SeletorImagem enfase="discreto" />
      </div>
    </Layout>
  )
}

function EstadoErro(props: { tipo: TipoErroUpload; mensagem: string; nomeArquivo: string; tamanho: number; previewUrl: string | null }) {
  const { tentarNovamente } = useSessaoAnalise()
  const texto = ERROS[props.tipo]
  const Icone = ICONES_ERRO[props.tipo]
  return (
    <Layout
      card={
        <div className="relative grid aspect-[4/3] max-h-[62vh] w-full place-items-center overflow-hidden rounded-cartao border-2 border-dashed border-cereja-500 bg-superficie md:aspect-[4/5]">
          {props.previewUrl && (
            <img src={props.previewUrl} alt="" className="absolute inset-0 size-full object-cover opacity-15 grayscale" />
          )}
          <div className="relative flex flex-col items-center gap-4 p-6 text-center">
            <span className="grid size-20 place-items-center rounded-full bg-cereja-50 text-cereja-600 ring-8 ring-cereja-50/50">
              <Icone className="size-9" aria-hidden strokeWidth={1.6} />
            </span>
            <p className="font-display-suave text-xl font-semibold text-cereja-700">{texto.rotulo}</p>
            <p className="max-w-full truncate rounded-full bg-papel px-3 py-1 text-xs text-tinta-suave">
              {props.nomeArquivo} · {formatarBytes(props.tamanho)}
            </p>
          </div>
        </div>
      }
    >
      <div role="alert">
        <Titulo sobretitulo="Não foi possível analisar">{texto.titulo}</Titulo>
        <p className="mt-4 max-w-prose leading-relaxed text-tinta-suave">
          {/* A validação local diz qual formato recebeu (ex.: GIF); é mais útil que o texto genérico. */}
          {props.tipo === 'formato_invalido' && props.mensagem ? props.mensagem : texto.explicacao}
        </p>
        <p className="mt-3 max-w-prose leading-relaxed font-medium">{texto.sugestao}</p>
      </div>
      {props.tipo === 'erro_desconhecido' && (
        <button type="button" onClick={tentarNovamente} className={classesBotao('primario', 'mt-6')}>
          <RotateCcw aria-hidden /> Tentar de novo
        </button>
      )}
      <SeletorImagem className="mt-6" enfase={props.tipo === 'erro_desconhecido' ? 'discreto' : 'principal'} />
    </Layout>
  )
}
