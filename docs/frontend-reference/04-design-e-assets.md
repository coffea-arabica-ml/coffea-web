# Design e assets — o que existe e o que falta

## Já resolvido

- **Estrutura/fluxo**: as 19 telas de alta fidelidade (PDF + PNG) estão completas em
  `docs/design-assets/figma-alta-fidelidade/`, cobrindo as 10 telas do fluxo (`02-fluxo-de-telas.md`) e
  suas variações de estado.
- **Wireframes de baixa fidelidade** (Excalidraw), em `docs/design-assets/`, mostram o mesmo mapa de
  telas em 4 tamanhos de referência.
- **Assets de produção**, já em `src/assets/`: `logo-cafelens.png`, `fundo-1.jpg`, `fundo-2.jpg`,
  `fundo-3.jpg`.
- **Fotos de exemplo** exibidas na tela de upload, em `src/assets/exemplos/`: `planta-cafe-doente.jpg`,
  `planta-cafe-saudavel.jpg`.
- **Fixtures de teste** (dev only, nunca exibidas ao usuário final), também em `src/assets/exemplos/`:
  os 10 arquivos `teste-*` — cobrem os 5 erros de upload do RF03, mais variações de proporção de imagem.

## Sobre paleta de cores, tipografia e microcopy: agora é decisão livre

O `CLAUDE.md` já estabelece que cor, tipografia, ilustração e todo texto são livres para reformular —
não é necessário esperar a Frente 4 definir isso, nem replicar fielmente os PDFs de
`figma-alta-fidelidade/`. Se algum PDF tiver uma cor ou fonte que sirva de inspiração, é opcional usá-la
como ponto de partida — não é obrigatória.

Se quiser extrair alguma cor específica de um PDF como referência, o jeito mais simples é abrir o `.png`
correspondente (mesma imagem, mais fácil de inspecionar) num editor de imagem e usar o conta-gotas de
cor, em vez de adivinhar a olho.

## O único ponto ainda não resolvido: ícones de estado/ação

Não há, em nenhum lugar do repositório, ícones prontos para: câmera, escolher arquivo, os 5 estados de
erro (tela 5) e confirmação de sucesso. Duas opções, ambas válidas:

1. Usar uma biblioteca de ícones pronta (ex. `lucide-react`) — mais rápido, consistente, sem depender de
   mais uma rodada de geração de imagem.
2. Gerar/desenhar ícones específicos, se quiser um estilo mais autoral.

Não é bloqueante — pode ser decidido durante a implementação da tela que primeiro precisar de um ícone,
não precisa ser resolvido antes de começar.