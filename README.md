# coffea-web

Frontend web do **Cafélens**: projeto de estimativa de severidade e classificação de estresses bióticos em
folhas de *Coffea arabica* via aprendizado por transferência.

## Stack
React + Vite + TypeScript + Tailwind CSS (v4), react-router, Vitest e Oxlint. A justificativa completa está no
Guia Técnico (Drive, pasta 05 - Frontend).

## Rodando localmente
```bash
npm install
cp .env.example .env   # opcional: por padrão o app usa o serviço simulado (mock)
npm run dev
```

Por padrão (`VITE_API_MODE=mock`) o app **não precisa** do [coffea-backend](../coffea-backend). Para usar o
backend real, defina `VITE_API_MODE=http` e `VITE_API_URL` no `.env`.

No modo mock, `?cenario=<id>` e `?atraso=<ms>` na URL forçam um resultado ou uma latência. Em `npm run dev` há
também um painel de cenários (botão de frasco, canto inferior esquerdo) que envia as fixtures de teste. Veja
`docs/frontend-reference/03-contrato-api-mock.md`.

## Scripts
| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Checagem de tipos + build de produção |
| `npm test` | Testes (Vitest) |
| `npm run typecheck` | Só a checagem de tipos |
| `npm run lint` | Oxlint (inclui regras de acessibilidade) |

## Estrutura
Veja `CLAUDE.md` (seção "Estrutura de pastas") e `docs/frontend-reference/`.

## Contribuindo
Uma branch por tarefa (`feature/nome-da-tarefa`), commits no imperativo e PR obrigatório antes do merge na
`main`.
