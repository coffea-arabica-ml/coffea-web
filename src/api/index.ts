// Superfície pública de src/api/ — telas e estado importam só daqui.
export type * from './types'
export { LIMITES, modoApi } from './config'
export { validarImagem } from './validacao'
export { enviarImagemParaDiagnostico, type OpcoesEnvio } from './diagnostico'
export {
  listarAnalises,
  obterAnalise,
  salvarAnalise,
  apagarAnalise,
  historicoPersistente,
  type ItemHistorico,
  type AnaliseCarregada,
} from './historico'
