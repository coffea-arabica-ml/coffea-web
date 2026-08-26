# coffea-web

Frontend web do projeto de estimativa de severidade e classificação de
estresses bióticos em folhas de Coffea arabica via aprendizado por
transferência.

## Stack
React + Vite + TypeScript + Tailwind CSS (v4). Ver justificativa completa
no Guia Técnico (Drive, pasta 05 - Frontend).

## Rodando localmente
\`\`\`bash
npm install
cp .env.example .env   # ajuste VITE_API_URL se necessário
npm run dev
\`\`\`

Requer o [coffea-backend](../coffea-backend) rodando em paralelo.

## Estrutura
- `src/pages` — as 5 telas do fluxo (inicial, upload, carregando, resultado, erro)
- `src/api` — chamada ao backend
- `src/App.tsx` — controla qual tela é exibida

## Contribuindo
Uma branch por tarefa (`feature/nome-da-tarefa`), commits no imperativo,
PR obrigatório antes de merge na `main`.
