import type { CategoriaEstresse, DiagnosticoSucesso, FolhaDiagnostico, NivelSeveridade } from '../api'
import { compararSeveridadeDesc } from './severidade'

export function ehProblema(folha: FolhaDiagnostico): boolean {
  return folha.categoria !== 'saudavel'
}

/** Folhas com algum estresse, da mais grave para a menos grave (ordem estável). */
export function problemasDe(diagnostico: DiagnosticoSucesso): FolhaDiagnostico[] {
  return diagnostico.folhas.filter(ehProblema).sort((a, b) => compararSeveridadeDesc(a.severidade, b.severidade))
}

export function estaSaudavel(diagnostico: DiagnosticoSucesso): boolean {
  return !diagnostico.folhas.some(ehProblema)
}

export interface GrupoCategoria {
  categoria: Exclude<CategoriaEstresse, 'saudavel'>
  folhas: FolhaDiagnostico[]
  severidadeMaxima: NivelSeveridade
}

/** Agrupa os problemas por categoria; grupos ordenados pela severidade mais alta. */
export function agruparPorCategoria(folhas: FolhaDiagnostico[]): GrupoCategoria[] {
  const grupos = new Map<GrupoCategoria['categoria'], FolhaDiagnostico[]>()
  for (const folha of folhas) {
    if (folha.categoria === 'saudavel') continue
    grupos.set(folha.categoria, [...(grupos.get(folha.categoria) ?? []), folha])
  }
  return [...grupos.entries()]
    .map(([categoria, doGrupo]) => {
      const ordenadas = [...doGrupo].sort((a, b) => compararSeveridadeDesc(a.severidade, b.severidade))
      return { categoria, folhas: ordenadas, severidadeMaxima: ordenadas[0].severidade }
    })
    .sort((a, b) => compararSeveridadeDesc(a.severidadeMaxima, b.severidadeMaxima))
}
