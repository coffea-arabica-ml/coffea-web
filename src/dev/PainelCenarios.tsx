import { useState } from 'react'
import { FlaskConical, X } from 'lucide-react'
import { CENARIOS, type CenarioId } from '../api/mock/cenarios'
import {
  definirAtrasoForcado,
  definirCenarioForcado,
  obterAtrasoForcado,
  obterCenarioForcado,
} from '../api/mock/resolverCenario'
import { useSessaoAnalise } from '../state/SessaoAnalise'

// Servidas pelo dev server a partir do caminho de origem: nunca entram no bundle de produção.
const FIXTURES = [
  'teste-sem-planta.jpg',
  'teste-especie-incorreta.jpg',
  'teste-baixa-qualidade.jpg',
  'teste-formato-gif.gif',
  'teste-formato-webp.webp',
  'teste-extensao-trocada.png',
  'teste-arquivo-grande.png',
  'teste-paisagem.jpg',
  'teste-retrato.jpg',
  'teste-quadrada.jpg',
]

const ATRASOS = [
  { rotulo: 'Padrão (1,5–2,5 s)', valor: null },
  { rotulo: 'Rápido (300 ms)', valor: 300 },
  { rotulo: 'Lento (8 s)', valor: 8000 },
]

/** Só em desenvolvimento: força cenários do mock e envia as fixtures `teste-*` pelo fluxo real. */
export default function PainelCenarios() {
  const { enviarArquivo } = useSessaoAnalise()
  const [aberto, setAberto] = useState(false)
  const [cenario, setCenario] = useState<CenarioId | 'auto'>(() => obterCenarioForcado() ?? 'auto')
  const [atraso, setAtraso] = useState<number | null>(() => obterAtrasoForcado())

  async function enviarFixture(nome: string) {
    const resposta = await fetch(`/src/assets/exemplos/${nome}`)
    const blob = await resposta.blob()
    void enviarArquivo(new File([blob], nome, { type: blob.type }))
  }

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="fixed bottom-24 left-3 z-50 grid size-11 place-items-center rounded-full bg-tinta text-white shadow-flutuante md:bottom-4"
        aria-label="Abrir painel de cenários (dev)"
      >
        <FlaskConical className="size-5" aria-hidden />
      </button>
    )
  }

  return (
    <aside
      aria-label="Painel de cenários (dev)"
      className="fixed bottom-24 left-3 z-50 w-72 rounded-2xl bg-tinta p-4 text-sm text-white shadow-flutuante md:bottom-4"
    >
      <div className="flex items-center justify-between">
        <p className="font-semibold">Cenários do mock · DEV</p>
        <button type="button" onClick={() => setAberto(false)} aria-label="Fechar painel" className="rounded-full p-1 hover:bg-white/10">
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <label className="mt-3 block text-xs text-white/70">
        Cenário
        <select
          value={cenario}
          onChange={(e) => {
            const valor = e.target.value as CenarioId | 'auto'
            setCenario(valor)
            definirCenarioForcado(valor === 'auto' ? null : valor)
          }}
          className="mt-1 w-full rounded-lg bg-white/10 px-2 py-1.5 text-white"
        >
          <option value="auto" className="text-tinta">Automático (pelo arquivo)</option>
          {CENARIOS.map((c) => (
            <option key={c.id} value={c.id} className="text-tinta">
              {c.rotulo}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-3 block text-xs text-white/70">
        Latência
        <select
          value={atraso ?? ''}
          onChange={(e) => {
            const valor = e.target.value === '' ? null : Number(e.target.value)
            setAtraso(valor)
            definirAtrasoForcado(valor)
          }}
          className="mt-1 w-full rounded-lg bg-white/10 px-2 py-1.5 text-white"
        >
          {ATRASOS.map((a) => (
            <option key={a.rotulo} value={a.valor ?? ''} className="text-tinta">
              {a.rotulo}
            </option>
          ))}
        </select>
      </label>

      <p className="mt-3 text-xs text-white/70">Enviar fixture</p>
      <div className="mt-1 grid max-h-44 gap-1 overflow-y-auto">
        {FIXTURES.map((nome) => (
          <button
            key={nome}
            type="button"
            onClick={() => void enviarFixture(nome)}
            className="rounded-lg px-2 py-1 text-left font-mono text-xs hover:bg-white/10"
          >
            {nome}
          </button>
        ))}
      </div>
    </aside>
  )
}
