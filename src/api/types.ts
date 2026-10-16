// Contrato entre o coffea-web e o coffea-backend (implementado no backend no commit 0e33bce).
// Fonte: docs/frontend-reference/03-contrato-api-mock.md — mantenha os dois em sincronia.
// Estes são os tipos já normalizados que as telas recebem; o JSON do backend passa antes por normalizar.ts.

export type CategoriaEstresse =
  | 'saudavel'
  | 'ferrugem'
  | 'bicho_mineiro'
  | 'cercosporiose'
  | 'phoma'

export type NivelSeveridade =
  | 'saudavel'
  | 'muito_baixa'
  | 'baixa'
  | 'alta'
  | 'muito_alta'

export type TipoErroUpload =
  | 'planta_nao_identificada'
  | 'formato_invalido'
  /** Fica no contrato e no mock, mas o backend não produz (não há dados de outras plantas). */
  | 'especie_incorreta'
  | 'arquivo_muito_grande'
  /** RF07: a imagem tem baixa probabilidade de conter um cafeeiro diagnosticável. */
  | 'baixa_confianca'
  | 'erro_desconhecido'

/** Região aproximada da folha na imagem, usada pelos círculos clicáveis (RF04). */
export interface RegiaoFolha {
  /** Centro, relativo (0 a 1) à largura da imagem. */
  x: number
  /** Centro, relativo (0 a 1) à altura da imagem. */
  y: number
  /** Raio relativo (0 a 1) à MENOR dimensão da imagem: o do círculo de mesma área da folha. */
  raio: number
}

export interface FolhaDiagnostico {
  id: string
  categoria: CategoriaEstresse
  severidade: NivelSeveridade
  /**
   * O backend preenche em toda folha, mas continua opcional: o normalizador descarta região
   * inválida, e registros antigos podem não ter. Se ausente, a Visualização avançada
   * degrada para uma lista simples, sem círculos posicionados.
   */
  regiao?: RegiaoFolha
  /** Texto de cuidado da categoria — o backend não envia; a UI usa o catálogo local. */
  comoCuidar?: string
  comoPrevenir?: string
}

export interface DiagnosticoSucesso {
  status: 'sucesso'
  /** O backend não envia: o normalizador preenche com a foto local (object URL). */
  imagemUrl: string
  /**
   * Nunca assuma tamanho fixo: pode vir com 0, 1 ou N folhas, e pode incluir
   * folhas saudáveis. "Problema" é qualquer folha com categoria diferente de 'saudavel'.
   */
  folhas: FolhaDiagnostico[]
}

export interface DiagnosticoErro {
  status: 'erro'
  tipo: TipoErroUpload
  mensagem: string
}

export type DiagnosticoResponse = DiagnosticoSucesso | DiagnosticoErro

export interface AnaliseSalva {
  id: string
  titulo: string
  criadoEm: string // ISO date
  diagnostico: DiagnosticoSucesso
}
