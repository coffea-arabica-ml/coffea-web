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

## Identidade visual adotada (Frente 5, 24/09/2026)

Os tokens ficam em `src/index.css` (bloco `@theme` do Tailwind v4). Mude a cor lá, nunca direto nos componentes.

- **Conceito "lente de campo":** o círculo, que já está na marca Cafélens e nos círculos do RF04, é o motivo
  visual do app. Aparece na lente que varre a foto durante a análise, nos círculos numerados e na lente
  ampliada do detalhe.
- **Paleta:** papel quente `#f5f3ec`, tinta verde-escura `#17231b` e o verde do logo `#2f6b3b`. O
  vermelho-cereja `#c24a31` marca sinais encontrados e erros.
- **Cores das categorias:** base Okabe-Ito, segura para daltonismo — ferrugem `#d55e00`, bicho-mineiro
  `#c99400`, cercosporiose `#b8538f`, phoma `#0072b2`. Nunca aparecem sozinhas: sempre vêm com número ou texto.
- **Tipografia:** Fraunces (títulos) + Instrument Sans (texto), auto-hospedadas via `@fontsource-variable`,
  sem chamadas a serviços externos.
- **Tema:** a landing é escura, sobre `fundo-1.jpg`; o app é claro, pensando em leitura sob sol.
- **Movimento:** CSS + View Transitions. Tudo é desligado com `prefers-reduced-motion`.
- **Contraste:** todas as telas e estados passaram no axe-core (WCAG AA) em 24/09/2026. Ao criar uma cor de
  texto nova, confira o contraste contra `papel` e `superficie`.

## Ícones: resolvido

Usamos `lucide-react` (câmera, arquivo, os 6 estados de erro, sucesso, navegação). A ilustração do estado
vazio do upload (visor de câmera com um cafeeiro) é um SVG próprio em
`src/components/IlustracaoEnquadramento.tsx`.
