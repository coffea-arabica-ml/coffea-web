# Requisitos relevantes para o Frontend (baseado em Requisitos_CONSOLIDADO v4, 23/09/2026)

Fonte de verdade: documento-mestre da Frente 3. Este arquivo é um recorte, filtrado para o que a Frente
5 precisa implementar ou exibir. Em caso de dúvida, o documento original da Frente 3 prevalece.

## Requisitos Funcionais

| ID | Descrição | Prioridade | Observação para o front |
|---|---|---|---|
| RF01 | Classificar cada folha identificada na imagem da planta em: saudável, ferrugem, bicho-mineiro, phoma ou cercosporiose. | Essencial | Vem do backend/modelo; o front só exibe. |
| RF02 | Para cada folha classificada, estimar a severidade em escala ordinal: saudável, muito baixa, baixa, alta, muito alta. | Essencial | Vem do backend/modelo; o front só exibe. |
| RF03 | Permitir upload de imagem da planta e exibir o diagnóstico de cada folha em poucos segundos. Tratar 5 tipos de erro de upload (ver abaixo). | **Essencial — fluxo principal** | Isso é o que precisa funcionar primeiro, ponta a ponta, antes de qualquer coisa desejável. |
| RF04 | Exibir visualização explicativa: círculos clicáveis por categoria de estresse (não mapa de calor contínuo), cada um com cuidados e prevenção. Saída do modelo precisa ser localizável por folha e por categoria — **viabilidade ainda não confirmada pela Modelagem**. | Desejável | Construir de forma que degrade bem se `regiao` não vier preenchida (ver contrato mock). |
| RF05 | Manter histórico dos diagnósticos realizados por folha, consultável depois. | Desejável | Tela "Histórico", aba do hub. |
| RF06 | Aceitar envio da imagem por câmera do dispositivo ou seleção de arquivo existente. Sempre uma imagem estática por vez (nunca vídeo contínuo). | Essencial | Botões "Escolher arquivo" e "Tirar foto" na tela de upload. |
| RF07 | Sinalizar quando a imagem tiver baixa probabilidade de conter planta de café diagnosticável (confiança abaixo de limiar a definir pela Modelagem), sugerindo reenvio. | Desejável | Limiar exato ainda não definido — tratar como mais um estado/erro possível. |
| RF09 | Identificar individualmente cada folha visível na planta e gerar diagnóstico separado por folha, em vez de tratar múltiplas folhas como erro. | **Essencial (elevado de Desejável)** | ⚠️ Ver pendência técnica abaixo — isso ainda não está confirmado como tecnicamente viável no prazo. |

## Requisitos Não Funcionais relevantes

| ID | Descrição | Prioridade |
|---|---|---|
| RNF02 | Resposta da demonstração (upload → diagnóstico) em até 5 segundos, em ambiente local. | Desejável |
| RNF03 | Detalhamento do RNF02: inferência por folha detectada em até 1s (com GPU) ou 2s (sem GPU). Sem garantia de GPU no ambiente de apresentação final (Render). | Desejável |

Para o front, isso significa: a tela de carregamento deve suportar bem o caso de demora (alguns
segundos), e o app não deve travar/quebrar se a resposta vier mais lenta que o esperado.

## Os 5 tipos de erro de upload (parte do RF03)

Cada um precisa de ícone, mensagem no card e texto lateral próprios (ver `02-fluxo-de-telas.md`, tela 5):

1. **Nenhuma planta identificada** — a imagem não parece conter uma planta.
2. **Formato inválido** — arquivo não é uma imagem aceita (ex.: não é JPEG/PNG).
3. **Espécie incorreta** — uma planta foi identificada, mas não é café.
4. **Arquivo acima do limite de tamanho** — upload excede o limite definido.
5. **Erro desconhecido** — catch-all para falhas não previstas (ex.: erro de rede, erro do servidor).

**Decisão da Frente 5 (24/09/2026):** o Figma ("Uploads erro 5") representa a baixa confiança do RF07, não o
erro desconhecido. Os dois foram mantidos: a UI trata **6 estados** — os 5 acima mais `baixa_confianca` (ver
`03-contrato-api-mock.md`).

## ⚠️ Pendência técnica crítica (RF09)

O dataset BRACOL (RD01), usado no treinamento do modelo, contém apenas folhas já recortadas
individualmente — **sem** fotos de planta inteira e **sem** anotação de localização de múltiplas folhas.
Detectar múltiplas folhas em uma foto é um problema de detecção de objetos/segmentação de instâncias,
distinto da classificação, e nenhuma frente (Dados/Modelagem) confirmou ainda que isso é viável dentro
do prazo. A Frente 3 registrou isso como pendência que pode configurar mudança de escopo sujeita à
aprovação do professor (RI01) — **ainda não resolvida**.

**O que isso significa na prática para este repositório:**

- Construa toda a UI de resultado assumindo uma **lista** de folhas (0, 1 ou N), nunca um único objeto
  fixo — isso já é compatível com qualquer desfecho dessa pendência.
- Não trave a "Visualização avançada" (círculos sobre a imagem) à existência de coordenadas. Se
  `regiao` vier ausente, é razoável cair para uma lista simples de problemas identificados sem os
  círculos posicionados (ver `03-contrato-api-mock.md` e `02-fluxo-de-telas.md`, tela 7).
- Se essa pendência for resolvida de um jeito que muda o formato de dados (ex.: vira sempre 1 folha por
  foto), a mudança deve ficar isolada no contrato/mock — não deve exigir reescrever componentes de tela.
