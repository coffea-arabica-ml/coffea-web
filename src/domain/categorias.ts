import type { CategoriaEstresse } from '../api'

export interface InfoCategoria {
  /** Nome curto, para listas e rótulos. */
  nome: string
  /** Nome completo, para títulos. */
  nomeCompleto: string
  /** Agente causal (nome científico, exibido em itálico). */
  agente: string
  tipoAgente: string
  /** Variável CSS da cor da categoria (definida em index.css). */
  cor: string
  sintomas: string
  comoCuidar: string
  comoPrevenir: string
}

// TODO(frente-4): textos agronômicos escritos a partir de referências gerais (Embrapa Café);
// precisam ser validados por um especialista antes da versão final.
export const CATEGORIAS: Record<CategoriaEstresse, InfoCategoria> = {
  saudavel: {
    nome: 'Saudável',
    nomeCompleto: 'Folha saudável',
    agente: '',
    tipoAgente: '',
    cor: 'var(--color-folha-600)',
    sintomas: 'Sem manchas, lesões ou padrões associados a estresses bióticos conhecidos do cafeeiro.',
    comoCuidar:
      'Mantenha a irrigação regular sem encharcar o solo, a adubação equilibrada e o espaçamento que favoreça a ventilação entre as plantas.',
    comoPrevenir:
      'Continue observando as folhas periodicamente, principalmente depois de chuvas fortes, frio intenso ou períodos quentes e secos.',
  },
  ferrugem: {
    nome: 'Ferrugem',
    nomeCompleto: 'Ferrugem do cafeeiro',
    agente: 'Hemileia vastatrix',
    tipoAgente: 'fungo',
    cor: 'var(--color-cat-ferrugem)',
    sintomas:
      'Manchas amarelo-alaranjadas e pulverulentas na face inferior da folha; na face superior aparecem manchas amareladas. Em ataques fortes, provoca queda de folhas.',
    comoCuidar:
      'Procure um engenheiro agrônomo para definir o controle com fungicidas no momento certo. Acompanhe a evolução nas plantas vizinhas, sobretudo no período chuvoso.',
    comoPrevenir:
      'Prefira cultivares resistentes, mantenha a nutrição equilibrada, evite excesso de umidade na copa e faça monitoramento periódico da lavoura.',
  },
  bicho_mineiro: {
    nome: 'Bicho-mineiro',
    nomeCompleto: 'Bicho-mineiro do cafeeiro',
    agente: 'Leucoptera coffeella',
    tipoAgente: 'inseto',
    cor: 'var(--color-cat-bicho-mineiro)',
    sintomas:
      'Lesões marrons e irregulares na face superior da folha, formadas pela larva que se alimenta por dentro do tecido. A película da lesão se destaca com facilidade.',
    comoCuidar:
      'Faça amostragens de folhas para medir a infestação e, se ela passar do nível de controle, busque orientação técnica para o controle químico ou biológico.',
    comoPrevenir:
      'Preserve os inimigos naturais, como vespas predadoras, evite produtos de amplo espectro sem necessidade e redobre a atenção em períodos quentes e secos.',
  },
  cercosporiose: {
    nome: 'Cercosporiose',
    nomeCompleto: 'Cercosporiose (mancha-de-olho-pardo)',
    agente: 'Cercospora coffeicola',
    tipoAgente: 'fungo',
    cor: 'var(--color-cat-cercosporiose)',
    sintomas:
      'Manchas circulares castanhas com centro acinzentado e halo amarelado, lembrando um olho. Também pode atingir os frutos.',
    comoCuidar:
      'Revise a adubação, especialmente nitrogênio e potássio, e consulte um engenheiro agrônomo sobre o uso de fungicidas.',
    comoPrevenir:
      'Evite estresse hídrico e desequilíbrio nutricional, e proteja mudas e plantas jovens do excesso de sol.',
  },
  phoma: {
    nome: 'Phoma',
    nomeCompleto: 'Mancha-de-phoma',
    agente: 'Phoma spp.',
    tipoAgente: 'fungo',
    cor: 'var(--color-cat-phoma)',
    sintomas:
      'Lesões escuras e necróticas em folhas novas, ramos e botões florais, mais comuns em regiões altas, frias e com ventos constantes.',
    comoCuidar:
      'Pode os ramos secos e procure orientação técnica sobre fungicidas nos períodos críticos, como a pré-florada.',
    comoPrevenir: 'Use quebra-ventos, evite baixadas frias e mantenha a nutrição da lavoura equilibrada.',
  },
}
