# Design e assets — o que existe e o que falta

## O que já está disponível (em `docs/design-assets/`)

| Arquivo | O que é |
|---|---|
| `excalidraw-fluxo-celular.png` | Mapa completo das 19 telas/estados, baixa fidelidade, recorte pensado para celular |
| `excalidraw-fluxo-tablet.png` | Mesmo mapa, recorte para tablet |
| `excalidraw-fluxo-monitor.png` | Mesmo mapa, recorte para monitor médio (o mais legível dos quatro) |
| `excalidraw-fluxo-telas-grandes.png` | Mesmo mapa, recorte para telas grandes |

**Importante:** os 4 arquivos acima têm o **mesmo conteúdo** (o mesmo mapa de telas), só exportado em
tamanhos de referência diferentes — não são 4 layouts visualmente distintos por dispositivo, e não têm
paleta de cores, tipografia ou imagens reais ainda. São wireframes estruturais (baixa fidelidade,
Excalidraw), úteis para entender fluxo e conteúdo de cada tela — não para copiar posições/cores.

A pasta `figma-alta-fidelidade/` está criada e vazia, esperando os exports da Frente 4 quando a
migração para alta fidelidade avançar.

## O que ainda falta pedir à Frente 4 (bloqueadores de polish visual, não do fluxo)

Sem isso, dá para implementar toda a estrutura e o comportamento das telas, mas não o acabamento visual
final — o que é uma ordem de prioridade razoável (estrutura antes de estilo). Quando a Frente 4 entregar:

1. **Paleta de cores oficial** (hex/tokens) — hoje só se sabe que há um estado "verde" (sem problema) e
   "vermelho" (com problema); tom exato, cor de marca, cores neutras/fundo etc. ainda não existem.
2. **Tipografia** — nome da fonte e pesos usados (título, corpo, botões).
3. **Logo/ícone do app "Coffea"** — nos wireframes aparece só como um losango genérico de placeholder.
4. **Exports individuais de alta fidelidade por tela**, idealmente um arquivo por tela × breakpoint
   (não só o mapa geral) — isso facilita comparar a implementação com o protótipo tela a tela.
5. **Ícones de estado e ação** — câmera, upload/escolher arquivo, cada um dos 5 ícones de erro, ícone de
   "salvar".
6. **Microcopy definitivo**: texto exato de cada uma das 5 mensagens de erro, texto de cada categoria em
   "Resumo técnico", e os textos de "Como cuidar" / "Como prevenir" por categoria de estresse (ferrugem,
   bicho-mineiro, cercosporiose, phoma) — hoje só existem exemplos soltos vistos no wireframe do monitor
   (ex.: "Ferrugem do cafeeiro", "Cercosporiose (mancha-de-olho-pardo)"), não o conjunto completo.
7. **Cores específicas por categoria de estresse**, se a Frente 4 definir uma cor fixa por categoria para
   os círculos da Visualização avançada (hoje os wireframes mostram cores diferentes, mas sem indicar
   qual cor é qual categoria de forma consistente).

## Como usar isso durante a implementação

- Construa a estrutura e o comportamento das telas (`02-fluxo-de-telas.md`) com uma paleta/tipografia
  provisória e neutra (ex.: tema básico do Tailwind), deixando claro no código onde os tokens definitivos
  vão entrar — não trave o desenvolvimento estrutural esperando o visual final.
- Assim que qualquer item da lista acima chegar, atualize este arquivo e a pasta `design-assets/`, e
  sinalize no código (`// TODO(frente-4): aplicar paleta oficial`) os pontos que precisam de ajuste.
