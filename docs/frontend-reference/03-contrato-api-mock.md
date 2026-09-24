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
  | "erro_desconhecido";

/** Região aproximada da folha na imagem, usada pelos círculos clicáveis (RF04). */
export interface RegiaoFolha {
  /** Coordenadas relativas (0 a 1) em relação à largura/altura da imagem, não pixels absolutos. */
  x: number;
  y: number;
  raio: number;
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
  /** Nunca assuma tamanho fixo: pode vir com 0 (nenhum problema), 1 ou N folhas. */
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

## Serviço mock

```ts
// src/api/diagnostico.ts
import type { DiagnosticoResponse } from "./types";

const ATRASO_SIMULADO_MS = 1500;

/**
 * Substitui a chamada real ao coffea-backend enquanto ele não estiver pronto.
 * Quando o backend real chegar, só esta função deve mudar — a assinatura
 * (Promise<DiagnosticoResponse>) deve continuar igual para não afetar as telas.
 */
export async function enviarImagemParaDiagnostico(
  imagem: File
): Promise<DiagnosticoResponse> {
  await new Promise((resolve) => setTimeout(resolve, ATRASO_SIMULADO_MS));

  // TODO(frente-5): trocar por lógica de mock configurável (ex.: querystring ou botão de
  // debug) para forçar cada um dos 5 tipos de erro e os estados "0 folhas" / "1 folha sem
  // região" / "N folhas com região" durante o desenvolvimento das telas.
  return {
    status: "sucesso",
    imagemUrl: URL.createObjectURL(imagem),
    folhas: [
      {
        id: "folha-1",
        categoria: "ferrugem",
        severidade: "alta",
        regiao: { x: 0.3, y: 0.4, raio: 0.08 },
      },
    ],
  };
}
```

## Casos que a UI precisa suportar desde já (mesmo sem backend real)

- Sucesso com **0 folhas problemáticas** (planta saudável) — tela 7 no estado vazio.
- Sucesso com **1 folha**, com e sem `regiao` preenchida.
- Sucesso com **N folhas**, cada uma podendo ter categoria/severidade diferente.
- Cada um dos **5 tipos de erro** (`TipoErroUpload`).
- Latência simulada perceptível (a tela de carregamento precisa realmente aparecer, não só piscar).
