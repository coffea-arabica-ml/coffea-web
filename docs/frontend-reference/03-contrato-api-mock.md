# Contrato de API — coffea-backend real e mock local

O `POST /diagnostico` do coffea-backend implementa este contrato desde o commit `0e33bce` (inferência
real do coffea-ml). O teste de ponta a ponta de 16/10/2026 conferiu, contra esse backend, o formato
de sucesso, os erros tipados e os códigos HTTP descritos abaixo. O mock local (`src/api/mock/`) segue o
mesmo contrato e continua sendo o modo padrão, para trabalhar sem backend.

**Regra de ouro:** tudo que depende do formato de dados vive em `src/api/`. Nenhum componente de tela
deve importar tipos daqui e presumir campos que não estão marcados como obrigatórios.

## Tipos

Estes são os tipos já normalizados, que as telas recebem (`src/api/types.ts`):

```ts
// src/api/types.ts

export type CategoriaEstresse =
  | "saudavel"
  | "ferrugem"
  | "bicho_mineiro"
  | "cercosporiose"
  | "phoma";

export type NivelSeveridade =
  | "saudavel"
  | "muito_baixa"
  | "baixa"
  | "alta"
  | "muito_alta";

export type TipoErroUpload =
  | "planta_nao_identificada"
  | "formato_invalido"
  | "especie_incorreta" // no contrato e no mock; o backend não produz (ver abaixo)
  | "arquivo_muito_grande"
  | "baixa_confianca" // RF07 — adicionado pela Frente 5 (ver "Decisões" abaixo)
  | "erro_desconhecido";

/** Região aproximada da folha na imagem, usada pelos círculos clicáveis (RF04). */
export interface RegiaoFolha {
  /** Coordenadas relativas (0 a 1) em relação à largura/altura da imagem, não pixels absolutos. */
  x: number; // centro, relativo à largura
  y: number; // centro, relativo à altura
  raio: number; // relativo à MENOR dimensão da imagem (círculo de mesma área da folha)
}

export interface FolhaDiagnostico {
  id: string;
  categoria: CategoriaEstresse;
  severidade: NivelSeveridade;
  /**
   * O backend preenche em toda folha, mas continua opcional: o normalizador descarta região
   * inválida, e registros antigos podem não ter. Se ausente, a Visualização avançada degrada
   * para uma lista simples, sem círculos posicionados.
   */
  regiao?: RegiaoFolha;
  /** Texto de cuidado da categoria — o backend não envia; a UI usa o catálogo local. */
  comoCuidar?: string;
  comoPrevenir?: string;
}

export interface DiagnosticoSucesso {
  status: "sucesso";
  /** O backend não envia: o normalizador preenche com a foto local. */
  imagemUrl: string;
  /**
   * Nunca assuma tamanho fixo: pode vir com 0, 1 ou N folhas, e pode incluir folhas saudáveis.
   * "Problema" = folha com categoria diferente de "saudavel".
   */
  folhas: FolhaDiagnostico[];
}

export interface DiagnosticoErro {
  status: "erro";
  tipo: TipoErroUpload;
  mensagem: string;
}

export type DiagnosticoResponse = DiagnosticoSucesso | DiagnosticoErro;

export interface AnaliseSalva {
  id: string;
  titulo: string;
  criadoEm: string; // ISO date
  diagnostico: DiagnosticoSucesso;
}
```

## O que o coffea-backend devolve (conferido em 16/10/2026)

**Sucesso** (HTTP 200), por exemplo:

```json
{"status": "sucesso",
 "folhas": [{"id": "folha-4", "categoria": "ferrugem", "severidade": "muito_baixa",
             "regiao": {"x": 0.4903, "y": 0.6606, "raio": 0.1449},
             "confianca": 0.9691, "scoreDeteccao": 0.9011, "caixa": [0.3808, 0.4716, 0.5858, 0.9068],
             "cortadaNaBorda": false}],
 "detalhes": {"plano": "deteccao", "...": "..."}}
```

- **Extras ignorados:** `confianca`, `scoreDeteccao`, `caixa`, `cortadaNaBorda` (por folha) e `detalhes`.
  O normalizador os descarta, e eles não chegam às telas nem ao histórico.
- **Sem `imagemUrl`:** o backend não guarda fotos. O normalizador usa a foto local.
- **`regiao`:** o centro é o centroide da máscara da folha, relativo à largura e à altura. O raio é o do
  círculo de mesma área, dividido pela menor dimensão (`coffea-ml/model/inferencia.py`, função
  `regiao_da_folha`), limitado a [0,01; 0,5]. As dimensões são as da foto já com a orientação EXIF aplicada,
  a mesma que o navegador mostra.
- **Uma foto de uma folha só** (recorte, como as do BRACOL) volta como 1 folha com raio perto de 0,5.

**Erro:** `{"status": "erro", "tipo": ..., "mensagem": ...}`, com a mensagem em português; os erros do
modelo podem trazer também `detalhes` (ignorado).

| HTTP | `tipo` | quando | como `src/api/http.ts` trata |
|---|---|---|---|
| 200 | `planta_nao_identificada` | o modelo não achou folha de café utilizável | repassa |
| 200 | `baixa_confianca` | todas as folhas abaixo do corte (RF07), ou só pedaços de folha | repassa |
| 200 | `formato_invalido` | começa como JPG/PNG, mas não decodifica | repassa |
| 200 | `arquivo_muito_grande` | mais de 64 megapixels | repassa |
| 413 | `arquivo_muito_grande` | arquivo acima de 10 MB | tipo pelo código, mensagem do corpo |
| 415 | `formato_invalido` | não é JPG nem PNG (magic bytes) | tipo pelo código, mensagem do corpo |
| 422 | `formato_invalido` | sem o campo `imagem`, ou arquivo vazio | repassa o tipo do corpo |
| 503 | `erro_desconhecido` | modelo indisponível | repassa o tipo do corpo |
| 500 | `erro_desconhecido` | erro inesperado | repassa o tipo do corpo |

- **`especie_incorreta` não é produzido:** não há dados de outras plantas para treinar essa recusa. Ele
  continua no contrato, no mock e na tela, para o caso de vir a ser produzido.
- **CORS:** todas as respostas, inclusive 4xx e 5xx, trazem `Access-Control-Allow-Origin`.
- **Sem corpo do contrato** (ex.: um proxy devolvendo HTML): o 413 e o 415 seguem pelo código; os demais viram
  `erro_desconhecido`. Em todos, a mensagem fica vazia e a tela usa o próprio texto.

## Serviço (implementado em `src/api/`)

- `enviarImagemParaDiagnostico(imagem: File, { signal? }): Promise<DiagnosticoResponse>` (`src/api/diagnostico.ts`)
  é o ponto único de entrada. O `signal` opcional cancela o envio (a promessa rejeita com AbortError);
  qualquer outro problema vira `DiagnosticoErro` — a função nunca lança erro esperado.
- `VITE_API_MODE=mock` (padrão) usa `src/api/mock/`; `VITE_API_MODE=http` usa `src/api/http.ts`, que envia a
  foto no campo `imagem` (multipart) para `VITE_API_URL/diagnostico` e repassa o contrato acima. O tempo
  limite é de 30 s; falha de rede e tempo limite viram `erro_desconhecido`. Como subir o backend: `README.md`.
- Antes de qualquer envio, `src/api/validacao.ts` valida no navegador: formato pelos **magic bytes** (JPG/PNG),
  tamanho (**10 MB**) e decodificação da imagem. O que ela barra não chega ao backend.
- Toda resposta, mock ou real, passa por `src/api/normalizar.ts`: coordenadas fora de 0–1 descartam só a região,
  categorias desconhecidas são ignoradas, ids duplicados são corrigidos e campos fora do contrato são descartados.
- **Mensagens na tela:** a tela de erro mostra a `mensagem` em `formato_invalido`, `arquivo_muito_grande` e
  `erro_desconhecido` (nos demais tipos, usa o texto do Cafélens). Por isso, toda mensagem que `src/api/` produz é
  escrita para o usuário, em português, sem código HTTP nem texto de exceção — a exceção vai para o `console.error`.
  Sem mensagem (ex.: falha de conexão), a tela usa o texto padrão do tipo.
- As telas importam apenas de `src/api/index.ts`.
- **Histórico (RF05):** `src/api/historico.ts` grava `AnaliseSalva` no IndexedDB deste navegador (sem login), com a
  foto reduzida e uma miniatura, e permite listar, abrir, salvar e excluir. O coffea-backend também tem um
  histórico (`GET /diagnosticos`), que o site não usa. Se o histórico do site passar para o backend, só
  `historico.ts` muda.

### Como o mock escolhe a resposta

1. **Cenário forçado:** `?cenario=<id>` na URL (fica gravado na sessão; `?cenario=auto` limpa) ou o painel de
   cenários (botão de frasco, só em `npm run dev`). Ids: `saudavel`, `saudavel_sem_folhas`,
   `uma_folha_com_regiao`, `uma_folha_sem_regiao`, `varias_folhas`, `varias_folhas_mistas` e `erro:<tipo>`.
2. **Fotos conhecidas, pelo nome do arquivo:**
   - `planta-cafe-doente`: ferrugem + cercosporiose, com círculos calibrados sobre as folhas reais;
   - `planta-cafe-saudavel` e `teste-retrato`: saudável;
   - `teste-paisagem`: N folhas com região;
   - `teste-quadrada`: 1 folha sem região;
   - `teste-sem-planta`, `teste-especie-incorreta` e `teste-baixa-qualidade`: os erros correspondentes
     (`teste-baixa-qualidade` → `baixa_confianca`).
3. **Qualquer outra foto:** cenário de sucesso sorteado pelo hash do arquivo (mesma foto → mesmo resultado).

Latência de 1,5–2,5 s; `?atraso=<ms>` força outro valor (ex.: `8000` para ver o aviso de demora, `auto` volta ao
padrão). As fixtures de formato e tamanho (`teste-formato-*`, `teste-extensao-trocada.png`,
`teste-arquivo-grande.png`) são barradas pela validação real, não pelo mock.

As respostas do mock para as fixtures são roteiro de teste da tela, não o que o modelo devolve: no backend
real, por exemplo, `teste-sem-planta` e `teste-baixa-qualidade` voltaram como sucesso, e
`teste-especie-incorreta`, como `baixa_confianca`.

## Decisões da Frente 5

- **`baixa_confianca` (RF07)** virou um 6º tipo de erro. O Figma ("Uploads erro 5") mostra baixa confiança, e
  `erro_desconhecido` continua necessário para falhas de rede ou servidor. O backend produz esse tipo.
- **`raio`** é relativo à menor dimensão da imagem; a região é relativa à imagem enviada, sem recorte.
  Confirmado no código do coffea-ml e na tela (círculos sobre as folhas, inclusive com foto em EXIF girado).
- **`folhas`** pode trazer folhas saudáveis; a UI só destaca as demais.

## Casos que a UI precisa suportar

- Sucesso com **0 folhas problemáticas** (planta saudável) — tela 7 no estado vazio.
- Sucesso com **1 folha**, com e sem `regiao` preenchida.
- Sucesso com **N folhas**, cada uma podendo ter categoria/severidade diferente.
- Cada um dos **6 tipos de erro** (`TipoErroUpload`).
- Latência perceptível: a tela de carregamento precisa realmente aparecer, e o aviso de demora (6 s) aparece
  quando o backend está com fila (ele faz uma inferência por vez).

O teste com o backend real não produziu sucesso com 0 folhas (uma imagem cinza lisa, gerada para o teste, voltou
como `planta_nao_identificada`), nem folha sem `regiao`. Esses dois casos continuam cobertos pelo mock.
