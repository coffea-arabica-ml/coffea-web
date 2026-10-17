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

Por padrão (`VITE_API_MODE=mock`) o app **não precisa** do [coffea-backend](../coffea-backend).

### Usando o backend real
O site chama o `POST /diagnostico` do coffea-backend, que roda o modelo do coffea-ml na mesma máquina.

1. Deixe os repositórios lado a lado (`coffea-arabica-ml/coffea-web`, `coffea-backend` e `coffea-ml`, com os
   pesos do modelo) e suba o backend conforme o README dele. Ele escuta na porta 8000.
2. Espere `http://localhost:8000/` mostrar `"carregado": true` no bloco `modelo` (alguns segundos; se vier
   `false`, o campo `motivo` diz por quê, e o diagnóstico responde 503).
3. No `.env` deste repositório:
   ```
   VITE_API_MODE=http
   VITE_API_URL=http://localhost:8000
   ```
4. Rode (ou reinicie) o `npm run dev`: o Vite só lê o `.env` na subida.

O backend faz uma inferência por vez; com fila, o site mostra o aviso de demora. O deploy na Vercel não
alcança um backend rodando no PC: a URL de produção fica para a Frente 10. O contrato e os códigos HTTP
estão em `docs/frontend-reference/03-contrato-api-mock.md`.

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
Trabalhamos direto na `main`, sem branch nem PR (decisão do gestor, 16/10/2026). Commits no imperativo.
