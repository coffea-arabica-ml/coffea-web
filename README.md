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

O backend faz uma inferência por vez; com fila, o site mostra o aviso de demora. Em produção, o site
(https://coffea-web.vercel.app) usa o backend em https://api.coffealab.tech: na Vercel, `VITE_API_MODE=http` e
`VITE_API_URL=https://api.coffealab.tech` são variáveis do tipo Config, só no ambiente Production. O contrato e
os códigos HTTP estão em `docs/frontend-reference/03-contrato-api-mock.md`.

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
O time trabalha direto na `main` (decisão do gestor, 16/10/2026). Quem é de fora contribui com fork e pull request.
Antes, leia o [guia de contribuição](https://github.com/coffea-arabica-ml/.github/blob/main/CONTRIBUTING.md), o
[código de conduta](https://github.com/coffea-arabica-ml/.github/blob/main/CODE_OF_CONDUCT.md) e a
[política de segurança](https://github.com/coffea-arabica-ml/.github/blob/main/SECURITY.md).

Como citar: veja o [`CITATION.cff`](CITATION.cff).

## Licença e código-fonte
O projeto é software livre sob a [AGPL-3.0](LICENSE). O código está em
[github.com/coffea-arabica-ml](https://github.com/coffea-arabica-ml): `coffea-web`, `coffea-mobile`, `coffea-backend` e
`coffea-ml`. Os modelos foram treinados com conjuntos de dados sob licença CC BY 4.0, com créditos e citações em
[`coffea-ml/data/README.md`](https://github.com/coffea-arabica-ml/coffea-ml/blob/main/data/README.md). Os links no
rodapé do site cumprem a seção 13 da AGPL (oferecer o código a quem usa o serviço).
