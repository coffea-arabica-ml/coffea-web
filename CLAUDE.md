# Coffea Web — Contexto do Projeto

> Leia este arquivo por completo antes de qualquer tarefa. Os documentos citados abaixo, em
> `docs/frontend-reference/`, só devem ser abertos quando a tarefa específica exigir aquele nível de
> detalhe (requisitos, telas, contrato de API ou design/assets).

## O que é o projeto

Sistema acadêmico (UNIFRAN) que recebe uma foto de uma planta de café inteira, identifica cada folha
visível e classifica o estresse biótico de cada uma — saudável, ferrugem, bicho-mineiro, cercosporiose
ou phoma — com estimativa de severidade (saudável, muito baixa, baixa, alta, muito alta), via
aprendizado por transferência. Prazo final do projeto: **06/11/2026**.

O projeto é dividido em 14 "frentes" (módulos de trabalho). Este repositório (`coffea-web`) pertence à
**Frente 5 — Frontend**, e implementa a interface web definida pela **Frente 4 (UX/UI)**, seguindo os
requisitos da **Frente 3 (Requisitos, versão consolidada v4, 23/09/2026)**.

O nome voltado ao usuário é **Cafélens** (não "Coffea" — esse é só o nome
técnico dos repositórios, ex. coffea-web). Todo texto visível na UI deve
usar "Cafélens".

## Fase atual: SÓ o frontend web, sem depender do backend real

O desenvolvimento segue um modelo "em escada": cada frente pode adiantar trabalho antes de sua vez
chegar, mas a versão final de uma frente só se consolida depois que a frente anterior está fechada. Hoje:

- O `coffea-backend` existe apenas como esqueleto, com resposta simulada — **não é a versão final**.
- A Frente 9 (Modelagem) ainda não confirmou se a detecção individual de folhas é viável no prazo (ver
  pendência crítica abaixo).
- **Por isso, esta etapa constrói o `coffea-web` inteiro contra um serviço mock local**, isolado em
  `src/api/`, seguindo o contrato provisório descrito em `docs/frontend-reference/03-contrato-api-mock.md`.
  Quando o backend real estiver pronto, só essa camada deve mudar — nenhum componente de tela deve
  fazer suposições diretas sobre o formato da resposta da API.

## Pendência crítica que afeta toda a Frente 5 (leia antes de decidir estrutura de dados)

O requisito RF09 (identificar cada folha individualmente na foto da planta) foi elevado de Desejável
para **Essencial** na v4 dos Requisitos, mas a própria Frente 3 registra que o dataset BRACOL não
sustenta essa detecção — só tem folhas já recortadas — e nenhuma frente confirmou ainda um caminho
técnico viável no prazo. Isso pode virar mudança de escopo sujeita a aprovação do professor.

**Implicação prática para este repositório:** o contrato mock assume uma **lista de folhas**, mas cada
folha tem localização (`regiao`) **opcional**. Nenhum componente deve assumir "sempre existe uma
localização" nem "sempre existe mais de uma folha" — o app precisa funcionar tanto se a resposta final
vier com 1 folha sem coordenadas quanto com N folhas com coordenadas. Ver detalhes no contrato mock.

## Stack e stack decisions (já fixadas, não renegociar sem motivo forte)

- React + Vite + TypeScript + TailwindCSS v4 (via `@tailwindcss/vite`)
- Oxlint como linter
- Deploy alvo: Vercel

## Estrutura de pastas (hub com abas)

```
src/
├── api/         # ÚNICO lugar que conhece o formato do backend: types, validação (magic bytes/10 MB),
│                # normalização, adapter http e mock/ (cenários). Telas importam só de api/index.ts
├── domain/      # regras puras sobre os tipos do contrato: categorias (textos/cores), severidade, resumo
├── state/       # SessaoAnalise: a análise "em foco" (vazia | enviando | sucesso | erro);
│                # Historico: lista/salvar/abrir/excluir sobre src/api/historico.ts (IndexedDB)
├── components/  # UI reutilizável (MolduraImagem, SeletorImagem, CapturaWebcam, Modal, Toast…)
├── layout/      # ShellHub + NavegacaoAbas (topo no desktop, barra no rodapé no celular)
├── pages/       # TelaInicial + hub/ (AbaUpload, AbaResumo, AbaVisualizacao, DetalheProblema,
│                #   ModalSalvarAnalise, AbaHistorico) — mapa completo em 02-fluxo-de-telas.md
├── content/     # textos.ts — microcopy central (instrução de captura, mensagens de erro)
├── dev/         # PainelCenarios — só em `npm run dev`
├── assets/      # logo, fundos, fotos de exemplo; assets/exemplos/teste-* são fixtures de dev,
│                # nunca importadas pelo código (o painel de dev as busca pelo servidor do Vite)
└── App.tsx      # rotas (react-router, modo data)
```

Rotas: `/` (T1), `/enviar` (T2–T5), `/resumo` (T6), `/visualizacao` (T7), `/visualizacao/:folhaId` (T8),
`/historico` (T10); a T9 é um modal. Resumo, Visualização e Detalhe redirecionam para `/enviar` sem uma
análise em foco. Pastas em inglês, identificadores em português. `VITE_API_MODE=mock|http` escolhe mock
(padrão) ou backend real; o mock aceita `?cenario=` e `?atraso=` (detalhes em `03-contrato-api-mock.md`).

## Documentos de referência

| Arquivo | Quando abrir |
|---|---|
| `docs/frontend-reference/01-requisitos-frontend.md` | Dúvida sobre o que é obrigatório vs. desejável, ou sobre os 5 tipos de erro |
| `docs/frontend-reference/02-fluxo-de-telas.md` | Implementar ou revisar qualquer tela, navegação ou estado visual |
| `docs/frontend-reference/03-contrato-api-mock.md` | Mexer em `src/api/`, tipos de dados, ou no serviço mock |
| `docs/frontend-reference/04-design-e-assets.md` | Precisar de cor, ícone, imagem de referência, ou saber o que já está resolvido em termos de assets |
| `docs/design-assets/` | Wireframes de baixa fidelidade (Excalidraw) e as 19 telas de alta fidelidade já exportadas do Figma (PDF + PNG) |

## Regras não negociáveis

1. **Fluxo essencial (RF03) vem antes do desejável (RF04/RF05).** Não gaste tempo em visualização
   avançada ou histórico antes do upload → carregamento → resultado básico estar sólido.
2. **Os wireframes/Figma são referência estrutural, não especificação visual final.**
   Eles fixam QUAIS telas existem, QUAIS estados cada uma tem e QUE informação
   precisa aparecer (isso vem dos requisitos da Frente 3). Cor, tipografia,
   ilustração, layout e todo o texto/copy são livres — pode e deve elevar para
   um design mais criativo e profissional, e reescrever qualquer texto, sem
   precisar perguntar antes.
3. **Exceção:** o RF04 define que a visualização explicativa usa círculos
   clicáveis por categoria (não mapa de calor) — isso está escrito no próprio
   requisito da Frente 3, não é só estética da Frente 4, então esse
   comportamento específico deve ser mantido mesmo com redesign.
4. **Toda suposição sobre o formato de dados do backend fica isolada em `src/api/`**, nunca espalhada
   pelos componentes de tela.
5. Este arquivo e os documentos de `frontend-reference/` são vivos — se uma decisão mudar durante a
   implementação (ex.: a pendência do RF09 for resolvida), atualize o documento correspondente também.
