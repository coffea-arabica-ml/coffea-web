# Fluxo de telas (baseado nos wireframes de baixa fidelidade da Frente 4)

**Fonte:** exports do Excalidraw em `docs/design-assets/` (4 arquivos, um por tamanho de tela de
referência: celular, tablet, monitor médio, telas grandes — mesmo conteúdo, ainda sem paleta de cores,
tipografia ou imagens reais definitivas). A Frente 4 está migrando isso para alta fidelidade no Figma;
até chegar, este documento é a referência mais próxima do comportamento esperado.

**Sobre este documento:** ele descreve *comportamento e conteúdo*, não pixels. Não invente medidas,
cores ou fontes a partir daqui — isso vem de `04-design-e-assets.md` (hoje, incompleto) ou do Figma
quando chegar. Onde a referência visual for ambígua, prefira uma implementação simples e funcional a
uma suposição elaborada.

## Mudança de arquitetura importante em relação ao esqueleto atual

O esqueleto do repositório (`TelaInicial → TelaUpload → TelaCarregando → TelaResultado → TelaErro`)
representa um fluxo linear. Os wireframes da Frente 4 descrevem, a partir da tela 2, um **hub com
navegação persistente em abas**: Histórico | Upload | Resumo técnico | Visualização avançada. As abas
"Resumo técnico" e "Visualização avançada" ficam **bloqueadas** até existir uma imagem enviada com
sucesso na sessão atual.

Recomendação: pensar a aplicação como um shell com 4 seções + um modal ("Salvar análise") + uma
sub-view dentro de "Visualização avançada" ("Detalhe de um problema"), em vez de forçar tudo dentro da
máquina de estado linear original. As telas de carregamento e erro continuam sendo estados dentro da
aba Upload, não telas de nível superior separadas.

---

## Tela 1 — Página inicial

- **Objetivo:** apresentar brevemente o projeto e a plataforma, convidar o usuário a começar.
- **Requisito atendido:** contexto (suporte ao RF03).
- **Elementos:** título/nome do app ("Coffea"), texto curto sobre o projeto, um card com botão
  ("Ir para upload") que leva à página principal.
- **Nota:** pode evoluir para uma landing page mais completa depois — não é prioridade agora.

## Tela 2 — Página principal (hub)

- **Objetivo:** reunir as 4 seções da aplicação.
- **Elementos:** navegação persistente com 4 abas — **Histórico**, **Upload**, **Resumo técnico**,
  **Visualização avançada**.
- **Estado inicial:** aba Upload ativa; Resumo técnico e Visualização avançada bloqueadas (sem análise
  ainda nesta sessão).
- **Conteúdo da aba Upload (estado vazio):** ilustração indicando onde a imagem deve aparecer, texto
  curto recomendando como enviar a foto, texto explicando o processo, botões **"Escolher arquivo"** e
  **"Tirar foto"**.

## Tela 3 — Carregamento

- **Objetivo:** indicar visualmente que o modelo está processando a imagem enviada.
- **Requisitos atendidos:** RF03, RNF02.
- **Comportamento:** ocupa o espaço onde a ilustração/imagem estava, dentro da aba Upload, até a
  resposta (sucesso ou erro) chegar.

## Tela 4 — Upload após o carregamento (sucesso)

- **Objetivo:** confirmar o resultado do envio antes/junto de levar aos detalhes.
- **Elementos:** o card que antes tinha a ilustração passa a mostrar a própria imagem enviada, com
  **borda verde** se nenhum problema foi encontrado, ou **borda vermelha** se algo foi identificado. Os
  botões "Escolher arquivo" / "Tirar foto" migram para abaixo da imagem, permitindo nova análise a
  qualquer momento sem sair da tela.

## Tela 5 — Erros de upload (5 variações)

- **Objetivo:** informar um problema de forma clara e permitir nova tentativa.
- **Requisito atendido:** RF03 (tratamento de erro), RNF02.
- **Comportamento:** o card muda de ícone e mensagem interna conforme o tipo de erro; o texto ao lado
  também muda para explicar melhor a situação. Ver a lista dos 5 tipos em `01-requisitos-frontend.md`.
- Cada tipo de erro é um **estado**, não uma tela separada — mesma estrutura visual, conteúdo diferente.

## Tela 6 — Resumo técnico

- **Objetivo:** dar um resumo textual rápido do resultado, sem a complexidade da visualização avançada.
- **Acesso:** aba do hub, ou clicando na imagem na aba Upload.
- **Elementos:** imagem com borda verde/vermelha (mesmo padrão da tela 4), texto curto abaixo dizendo
  se algo foi encontrado, e ao lado um texto resumindo tudo o que foi analisado (o texto muda conforme o
  resultado). Abaixo, os botões "Escolher arquivo" / "Tirar foto" continuam disponíveis para facilitar
  uma nova análise sem voltar à aba Upload.

## Tela 7 — Visualização avançada

- **Objetivo:** localizar visualmente os problemas identificados sobre a própria imagem.
- **Requisito atendido:** RF04 (⚠️ depende da pendência técnica do RF09 — ver `01-requisitos-frontend.md`).
- **Estado com problemas:** imagem enviada com **círculos coloridos** ao redor de cada problema
  identificado (uma cor por categoria); ao lado, uma lista de tópicos correspondentes, um por cor/folha.
- **Estado vazio (nada identificado):** em vez dos círculos e da lista, aparece só a imagem e, ao lado,
  um texto explicando que nada foi identificado, mais um texto de orientação geral de cuidado com a
  planta.
- **Nota de implementação:** se a resposta não trouxer coordenadas de região (`regiao` ausente no
  contrato mock), esta tela deve degradar para uma lista simples de problemas identificados, sem tentar
  posicionar círculos — nunca falhar ou ficar em branco.

## Tela 8 — Detalhe de um problema

- **Objetivo:** aprofundar em um problema específico identificado na Visualização avançada.
- **Como se chega:** clique em um dos círculos da tela 7; transição em que a área daquele círculo cresce
  até ocupar a área principal.
- **Elementos:** a categoria específica (ex.: "Ferrugem do cafeeiro", "Cercosporiose (mancha-de-olho-
  pardo)") com texto explicativo, mais duas seções: **"Como cuidar"** e **"Como prevenir"**. Abaixo da
  imagem ampliada: uma miniatura da imagem completa (clique nela volta para a tela anterior, com
  transição) e o botão **"Salvar análise"**.

## Tela 9 — Salvar análise (modal)

- **Objetivo:** nomear a análise antes de mandá-la para o histórico.
- **Como se chega:** botão "Salvar análise" na tela 8 (ou de outro ponto do fluxo de resultado).
- **Elementos:** card centralizado sobreposto à tela (o conteúdo de fundo fica mais discreto/escurecido);
  frase indicando que ali é o campo de título; campo de texto abaixo para digitar o título.

## Tela 10 — Histórico

- **Objetivo:** listar análises salvas anteriormente.
- **Acesso:** aba "Histórico" do hub.
- **Elementos:** grid de cards em fileiras de dois (rolagem se necessário); cada card tem o título no
  canto superior esquerdo, um texto curto resumindo a análise, e a imagem usada em miniatura à direita.
- **Navegação:** clicar em um card leva direto ao **Resumo técnico** daquela análise salva, sem refazer
  o processamento.
- **Estado vazio:** nenhuma análise salva → mensagem central confirmando isso (sem cards, sem grid).

---

## Mapa de navegação (resumo)

```
Tela 1 (inicial) → Tela 2 (hub, aba Upload vazia)
  → [envia imagem] → Tela 3 (carregamento)
    → [sucesso] → Tela 4 (upload com imagem confirmada)
        → aba Resumo técnico → Tela 6
        → aba Visualização avançada → Tela 7
            → [clique num círculo] → Tela 8 (detalhe)
                → [Salvar análise] → Tela 9 (modal)
                    → [confirma] → entra na Tela 10 (histórico)
    → [erro] → Tela 5 (uma das 5 variações de erro) → [nova tentativa] → Tela 3
  → aba Histórico (a qualquer momento) → Tela 10
      → [clique num card salvo] → Tela 6 (Resumo técnico daquela análise)
```
