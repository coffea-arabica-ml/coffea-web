# Contrato de API — PROVISÓRIO (mock local, sem backend real)

Este contrato é uma suposição de trabalho, não uma especificação fechada pela Frente 6 (Backend) nem
pela Frente 9 (Modelagem). O backend real hoje devolve apenas `{ categoria, severidade }` (uma folha
só, sem lista, sem localização) — o formato abaixo já antecipa o formato que o RF09 exige, mas ainda
**não foi confirmado como viável** (ver pendência em `01-requisitos-frontend.md`).

**Regra de ouro:** tudo que depende do formato de dados vive em `src/api/`. Nenhum componente de tela
deve importar tipos daqui e presumir campos que não estão marcados como obrigatórios.

## Tipos

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
  | "especie_incorreta"
  | "arquivo_muito_grande"
  | "baixa_confianca" // RF07 — adicionado pela Frente 5 (ver "Decisões" abaixo)
  | "erro_desconhecido";

/** Região aproximada da folha na imagem, usada pelos círculos clicáveis (RF04). */
export interface RegiaoFolha {
  /** Coordenadas relativas (0 a 1) em relação à largura/altura da imagem, não pixels absolutos. */
  x: number; // centro, relativo à largura
  y: number; // centro, relativo à altura
  raio: number; // PROVISÓRIO: relativo à MENOR dimensão da imagem
}

export interface FolhaDiagnostico {
  id: string;
  categoria: CategoriaEstresse;
  severidade: NivelSeveridade;
  /**
   * PROVISÓRIO — pode não vir preenchido. Se ausente, a UI (Visualização avançada) deve
   * degradar para uma lista simples, sem tentar desenhar círculos posicionados.
   */
  regiao?: RegiaoFolha;
  /** Texto de cuidado específico da categoria — hoje é placeholder, aguarda conteúdo real da Frente 4. */
  comoCuidar?: string;
  comoPrevenir?: string;
}

export interface DiagnosticoSucesso {
  status: "sucesso";
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

## Serviço (implementado em `src/api/`)

- `enviarImagemParaDiagnostico(imagem: File, { signal? }): Promise<DiagnosticoResponse>` (`src/api/diagnostico.ts`)
  é o ponto único de entrada. O `signal` opcional cancela o envio (a promessa rejeita com AbortError);
  qualquer outro problema vira `DiagnosticoErro` — a função nunca lança erro esperado.
- `VITE_API_MODE=mock` (padrão) usa `src/api/mock/`; `VITE_API_MODE=http` usa `src/api/http.ts`, que converte o
  formato atual do backend (`{ categoria, severidade }`) em 1 folha sem região.
- Antes de qualquer envio, `src/api/validacao.ts` valida no navegador: formato pelos **magic bytes** (JPG/PNG),
  tamanho (**10 MB**) e decodificação da imagem.
- Toda resposta, mock ou real, passa por `src/api/normalizar.ts`: coordenadas fora de 0–1 descartam só a região,
  categorias desconhecidas são ignoradas e ids duplicados são corrigidos.
- As telas importam apenas de `src/api/index.ts`.
- **Histórico (RF05):** `src/api/historico.ts` grava `AnaliseSalva` no IndexedDB deste navegador (sem login), com a
  foto reduzida e uma miniatura, e permite listar, abrir, salvar e excluir. Se o histórico passar para o backend
  (Frente 6), só esse arquivo muda.

### Como o mock escolhe a resposta

1. **Cenário forçado:** `?cenario=<id>` na URL (fica gravado na sessão; `?cenario=auto` limpa) ou o painel de
   cenários (botão de frasco, só em `npm run dev`). Ids: `saudavel`, `saudavel_sem_folhas`,
   `uma_folha_com_regiao`, `uma_folha_sem_regiao`, `varias_folhas`, `varias_folhas_mistas` e `erro:<tipo>`.
2. **Fotos conhecidas, pelo nome do arquivo:**
   - `planta-cafe-doente`: ferrugem + cercosporiose, com círculos calibrados sobre as folhas reais;
   - `planta-cafe-saudavel` e `teste-retrato`: saudável;
   - `teste-paisagem`: N folhas com região;
   - `teste-quadrada`: 1 folha sem região (simula o backend atual);
   - `teste-sem-planta`, `teste-especie-incorreta` e `teste-baixa-qualidade`: os erros correspondentes
     (`teste-baixa-qualidade` → `baixa_confianca`).
3. **Qualquer outra foto:** cenário de sucesso sorteado pelo hash do arquivo (mesma foto → mesmo resultado).

Latência de 1,5–2,5 s; `?atraso=<ms>` força outro valor (ex.: `8000` para ver o aviso de demora, `auto` volta ao
padrão). As fixtures de formato e tamanho (`teste-formato-*`, `teste-extensao-trocada.png`,
`teste-arquivo-grande.png`) são barradas pela validação real, não pelo mock.

## Decisões da Frente 5 (a confirmar com as Frentes 6/9)

- **`baixa_confianca` (RF07)** virou um 6º tipo de erro. O Figma ("Uploads erro 5") mostra baixa confiança, e
  `erro_desconhecido` continua necessário para falhas de rede ou servidor.
- **`raio`** é relativo à menor dimensão da imagem; a região é relativa à imagem enviada, sem recorte.
- **`folhas`** pode trazer folhas saudáveis; a UI só destaca as demais.

## Casos que a UI precisa suportar desde já (mesmo sem backend real)

- Sucesso com **0 folhas problemáticas** (planta saudável) — tela 7 no estado vazio.
- Sucesso com **1 folha**, com e sem `regiao` preenchida.
- Sucesso com **N folhas**, cada uma podendo ter categoria/severidade diferente.
- Cada um dos **6 tipos de erro** (`TipoErroUpload`).
- Latência simulada perceptível (a tela de carregamento precisa realmente aparecer, não só piscar).
