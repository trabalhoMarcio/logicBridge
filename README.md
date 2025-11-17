<div align="center">

# LogicBridge – Conecte lógica à linguagem ⚖️🧠

Traduza entre linguagem natural (PT-BR) e lógica proposicional (CPC) de forma confiável, interativa e didática.

![LogicBridge OG](/public/og-image.svg)

</div>

## Visão Geral

O LogicBridge é uma aplicação web que cria uma ponte entre a linguagem natural e a lógica proposicional. Ele permite:

- NL → CPC: converter frases em português para fórmulas lógicas rigorosas. ✍️  → ∧ ∨ ¬ ↔
- CPC → NL: explicar fórmulas como sentenças naturais, respeitando mapeamentos de proposições. 🔤
- UI robusta: evita respostas nulas, exibe mapeamentos, possui botões de conectivos e animações suaves. 💡
- Backend resiliente: parser determinístico para CPC→NL, heurísticas para NL→CPC e fallback com Genkit + Gemini. 🛡️

## Funcionalidades

- Conversão bidirecional NL ↔ CPC com validações e fallbacks.
- Parser/tokenizador determinístico (CPC → NL) com geração de frase em PT-BR.
- Heurísticas NL → CPC para casos sem JSON válido (ex.: “se ... então ...”, “se e somente se”, conjunções, disjunções e negação).
- Mapeamento de proposições (P..V) com UI dedicada no modo CPC → NL.
- Botões de conectivos no input (¬, ∧, ∨, →, ↔, (, )) para facilitar a escrita de fórmulas. 🔘
- API única `POST /api/generate` com contrato simples e estável.
- Páginas dedicadas para cada modo e um Dashboard amigável.

## Tecnologias

- Next.js 16 (App Router) ⚡
- React 19 + TypeScript 🧩
- Tailwind CSS 4 🎨
- Framer Motion (animações) 🎞️
- Supabase (auth e helpers) 🔐
- Genkit + Google Gemini (fallback LLM) 🤖
- Zod (tipagem/validação pontual) ✅

## Estrutura do Projeto

```
logicbridge/
├─ next-env.d.ts
├─ next.config.ts
├─ package.json
├─ postcss.config.mjs
├─ tsconfig.json
├─ public/
│  ├─ favicon.svg
│  └─ og-image.svg
└─ src/
	├─ app/
	│  ├─ globals.css
	│  ├─ layout.tsx
	│  ├─ page.tsx                # Landing com rotas e features
	│  ├─ dashboard/
	│  │  └─ page.tsx
	│  ├─ login/
	│  │  └─ page.tsx
	│  ├─ register/
	│  │  └─ page.tsx
	│  ├─ profile/
	│  │  └─ page.tsx
	│  ├─ complete-profile/
	│  │  └─ page.tsx
	│  ├─ auth/
	│  │  └─ callback/
	│  │     └─ page.tsx
	│  ├─ converter/
	│  │  ├─ nl-to-cpc/
	│  │  │  └─ page.tsx         # NL → CPC
+   │  │  └─ cpc-to-nl/
	│  │     └─ page.tsx         # CPC → NL
	│  └─ api/
	│     └─ generate/
	│        └─ route.ts         # Endpoint único de geração/parse
	├─ components/
	│  ├─ AuthProvider.tsx
	│  ├─ Footer.tsx
	│  ├─ GenkitInference.tsx    # UI unificada + conectivos + mapeamento
	│  └─ Header.tsx
	├─ hooks/
	│  └─ useRequireAuth.ts
	└─ lib/
		├─ genkit.ts              # Config Genkit + Gemini
		├─ supabase-browser.ts    # Cliente Supabase (browser)
		└─ services/
			└─ userService.ts
```

## API

Endpoint: `POST /api/generate`

- NL → CPC

```json
{
  "mode": "nl-to-cpc",
  "input": "Se chover, então a grama ficará molhada."
}
```

Resposta típica (texto consolidado):

```
Fórmula: P → Q
Proposições:
P: chover
Q: a grama ficará molhada
```

- CPC → NL

```json
{
  "mode": "cpc-to-nl",
  "input": "(P ∧ Q) → R",
  "propositions": {
	 "P": "chover",
	 "Q": "fizer frio",
	 "R": "a aula será cancelada"
  }
}
```

Resposta típica:

```json
{ "text": "se chover e fizer frio, então a aula será cancelada" }
```

Observações:

- O backend sempre tenta retornar `text` útil, com fallbacks determinísticos.
- Quando possível, o LLM responde com JSON rígido, mas o servidor repara/ajusta a resposta.

## Configuração de Ambiente

Crie um arquivo `.env.local` na raiz com:

```bash
NEXT_PUBLIC_SUPABASE_URL=...        # URL do seu projeto Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=...   # Chave anônima do Supabase
NEXT_PUBLIC_GEMINI_API_KEY=...      # API Key do Google Gemini
```

## Scripts

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm run start
```

Requisitos: Node.js LTS 18+ (recomendado), npm 9+. 🛠️

## Como Usar

1. Inicie o servidor: `npm run dev` e acesse `http://localhost:3000`.
2. Crie sua conta ou vá direto ao Dashboard.
3. Escolha o modo:
	- NL → CPC: escreva uma frase em português. O sistema devolverá a fórmula e tentará mapear proposições.
	- CPC → NL: digite a fórmula. Use a barra de conectivos (¬, ∧, ∨, →, ↔, (, )) e, se quiser, defina mapeamentos P..V.
4. Veja o resultado detalhado e ajuste as proposições conforme necessário.

## Desenvolvimento

- Estilo: Tailwind CSS. Classes utilitárias e componentes simples.
- Animações: Framer Motion em destaque na landing e dashboard.
- Parser: implementado em `src/app/api/generate/route.ts` (tokenize/parseCPC/astToPortuguese).
- Heurísticas NL→CPC: cobrem padrões comuns (“se ... então ...”, “se e somente se”, conjunções, disjunções e negação).

## Arquitetura do Sistema

Explicação rápida:

- Frontend envia `mode`, `input` e, opcionalmente, `propositions` para `POST /api/generate`.
- CPC → NL: o backend prioriza parser determinístico (tokenize → parseCPC) e lineariza o AST em português; se falhar, usa LLM (Genkit+Gemini).
- NL → CPC: o backend tenta obter JSON válido do LLM; se vier inválido, aplica heurísticas para construir fórmula e mapeamento.
- Em ambos os casos, há tratamento para retornar sempre `text` útil, evitando respostas nulas.

## Estratégia de Tradução

- Regras do Parser (CPC → NL):
	- Conectivos permitidos: `→ ∧ ∨ ¬ ↔ ( )`.
	- Precedência: `¬` > `∧` > `∨` > `→` > `↔`. Parênteses têm precedência máxima.
	- Gramática recursiva: `Equiv` → `Impl` (↔ associativo); `Impl` → `Or` (→ right-assoc); `Or` → `And` (∨ assoc. à esquerda); `And` → `Unary` (∧ assoc. à esquerda); `Unary` → `¬Unary | (Expr) | Atom`.
- Linearização PT-BR (AST → frase):
	- `atom(P)`: usa `propositions.P` ou “proposição P”.
	- `¬X`: “não X” (usa parênteses quando X é binário).
	- `A ∧ B`: “A e B”; `A ∨ B`: “A ou B”.
	- `A → B`: “se A, então B”.
	- `A ↔ B`: “A se e somente se B”.
	- Parênteses inseridos quando a precedência exige.
- Mapeamento de Proposições:
	- No modo CPC → NL, o usuário pode informar mapeamentos P..V; sem mapeamento, nomes genéricos são usados.
	- No modo NL → CPC, o backend tenta extrair mapeamentos do JSON do LLM; se falhar, heurísticas montam `P: …, Q: …` em ordem.
- Uso de LLMs (NL → CPC principal; CPC → NL fallback):
	- Prompt rígido exigindo JSON, sem explicações, com exemplo de resposta válida e de erro.
	- Pós-processamento robusto: remoção de code fences, detecção de objeto JSON “embutido”, validação de campos.
- Heurísticas (NL → CPC):
	- Reconhece “se e somente se” → `↔`.
	- Reconhece “se … então …” → `→` e particiona antecedente/consequente.
	- Reconhece conjunções “A e B” → `∧` e disjunções “A ou B” → `∨`.
	- Reconhece negação inicial “não …” → `¬P`.
	- Fallback: `P` com a sentença como descrição.

### Exemplos com Análise

1) NL → CPC: “Se chover e fizer frio, então a aula será cancelada.”

```
Esperado: (P ∧ Q) → R
Saída típica: Fórmula: (P ∧ Q) → R
Proposições: P: chover; Q: fizer frio; R: a aula será cancelada
Análise: Acerto. Heurística identifica padrão condicional e conjunção.
```

2) NL → CPC: “A grama está molhada se e somente se choveu.”

```
Esperado: P ↔ Q
Análise: Acerto. Padrão “se e somente se” mapeado para bicondicional.
Possível variação: ordem das proposições depende da extração.
```

3) CPC → NL: `¬(P ∧ Q) → R` com mapeamentos P: “chover”, Q: “fizer frio”, R: “a aula será cancelada”.

```
Saída: “se não (chover e fizer frio), então a aula será cancelada”
Análise: Acerto. Parênteses preservados na negação de binário.
```

4) NL → CPC: “João estuda ou Maria trabalha.”

```
Esperado: P ∨ Q
Análise: Acerto. Heurística identifica disjunção. Sem mapeamento explícito, nomes genéricos podem surgir até o usuário ajustá-los.
```

5) NL → CPC: “Se não fizer sol, irei ao cinema ou lerei um livro.”

```
Resultado possível: P → (Q ∨ R), com P: “não fizer sol”, Q: “irei ao cinema”, R: “lerei um livro”.
Análise: Geralmente correto; nuances de escopo/virgulação podem exigir revisão manual.
```

## Limitações e Melhorias

- Linguagem Natural é ambígua: o mesmo enunciado pode ter múltiplas formalizações aceitáveis (escopo de negação, associação de “ou”, pontuação).
- Dependência de prompt/LLM no NL → CPC: apesar dos guardrails, respostas podem vir fora do formato; coberto por heurísticas, mas nem sempre perfeito.
- Vocabulário e morfologia: a linearização PT-BR é clara, porém não lida com todas as variações estilísticas.
- Variáveis proposicionais: parser aceita átomos de uma letra (A..Z). UI prioriza P..V.
- Operadores ASCII: atualmente focado em símbolos matemáticos; suporte a `! & | -> <->` pode ser adicionado.

Melhorias propostas:

- Expandir heurísticas NL → CPC (negações internas, prioridades múltiplas, “nem…nem…”, “ou…ou…” exclusivo).
- Suportar operadores em ASCII e normalização automática para símbolos.
- Sugerir mapeamentos automáticos no modo CPC → NL (LLM assistido).
- Avaliação automática de casos de teste e relatório de ambiguidade.
- Cache/Rate limiting e logs estruturados para observabilidade.
- i18n (EN/ES) e acessibilidade mais profunda.

## Roadmap (resumo)

- [ ] Sugerir mapeamentos automáticos de proposições no modo CPC → NL.
- [ ] Exportar resultados em PDF/Markdown.
- [ ] Exemplos guiados e desafios de lógica.

## Licença

Este projeto é licenciado sob a licença MIT, uma licença livre e permissiva. ✅

```
MIT License

Copyright (c) 2025 LogicBridge contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```


