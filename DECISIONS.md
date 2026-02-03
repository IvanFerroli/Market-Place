# NCART — Tech Decisions (DECISIONS.md)

## 0) Contexto e objetivo

Este projeto foi desenvolvido para o desafio técnico de Frontend Jr da Uncode (ecossistema Nuvemshop / VNDA): construir um **mini e-commerce funcional**, avaliando organização, componentização, lógica de carrinho e comunicação técnica. O enunciado exige API lendo `products.json`, páginas (home + produto), header/footer, minicarrinho, responsividade, deploy público e documentação das decisões.

Além de cumprir o mínimo, o projeto foi deliberadamente elevado com **TypeScript, testes, SEO básico, documentação automática (TypeDoc) e um bootstrap DX (one-command)**, porque os diferenciais também pontuam e reforçam maturidade técnica para avaliação.

---

## 1) Estratégia de execução (por que fiz nessa ordem)

A ordem de construção seguiu um critério “**risco + peso de avaliação + alavancas de qualidade**”:

1. **Garantir o contrato do desafio** (API + páginas + carrinho com totais corretos).
2. **Definir arquitetura mínima de time** (camadas, domínio, store do carrinho, separação UI/core) pra evitar reescrita depois.
3. **Componentizar UI** (produtos, carrinho, layout) com foco em reuso e legibilidade.
4. **Polir experiência** (microinterações e padrão de overlay) e só então “subir o nível” (SPA premium).
5. **Cobrir com testes e documentação** (unit + E2E + TypeDoc) após os fluxos estabilizarem.
6. **Fechar DX** (script `dx` e ajustes WSL) para reduzir atrito de avaliação e reproduzibilidade.

Essa ordem é intencional: primeiro “**funciona e cumpre**”; depois “**fica robusto e demonstrável**”.

---

## 2) Decisões arquiteturais (ADR-style)

### TD-001 — Framework: Next.js (App Router)

**Decisão:** usar **Next.js** (App Router) como framework principal.

**Contexto:** o desafio permite Next.js ou outras stacks; também exige endpoints de API e páginas.

**Motivo (por que):**
- Permite **UI + API no mesmo repo** com rotas bem definidas (sem “colar” servidor separado).
- Facilita **SSR/SEO básico** e rotas de produto com deep link real.
- Melhor experiência para avaliação: menos setup externo e deploy naturalmente simples.

**Evidência no projeto:**
- `app/(shop)/page.tsx`
- `app/(shop)/product/[id]/page.tsx`
- `app/api/products/...`

**Trade-off:** stack mais “opiniosa” que Vite puro; compensado pela coerência full-stack do desafio.

---

### TD-002 — API: Route Handlers lendo `products.json` (contrato `/products` + compat `/api`)

**Decisão:** implementar a API via Route Handlers do Next, lendo `products.json`, e manter compatibilidade de consumo tanto pelo contrato do desafio (`/products`) quanto pelo padrão Next (`/api/products`).

**Contexto:** o enunciado exige a API ler `products.json` e expor `GET /products` e `GET /products/:id`.

**Motivo:**
- Fonte de dados local e determinística (bom para avaliador rodar).
- Mantém o contrato do desafio e reduz acoplamento com backends externos (Express/Nest/Fastify).
- Permite “hardening” por ambiente (ex.: fallback para `/api` em setups onde `/products` é proxy/rewrite).

**Evidência:**
- Implementação base: `app/api/products/route.ts` e `app/api/products/[id]/route.ts`
- Dados: `public/data/products.json`

**Consequência:** API simples e direta, suficiente para o escopo; sem complexidade de banco.

---

### TD-003 — Camadas e separação de responsabilidades (Domínio → Dados → Estado → UI)

**Decisão:** organizar o projeto em camadas previsíveis:
- **Domain:** tipos/guards e invariantes (`lib/domain/*`)
- **Data:** leitura/parsing de `products.json` (`lib/data/*`)
- **API client:** HTTP e cliente (`lib/api/*`)
- **Cart core:** regras, store, selectors, persist (`lib/cart/*`)
- **UI:** componentes (`components/*`)

**Motivo:**
- Evita acoplamento (UI não “vira” regra de negócio).
- Facilita testes e refactors (ex.: trocar drawer por overlay sem quebrar o core do carrinho).

**Evidência:** estrutura `lib/domain`, `lib/data`, `lib/cart`, `components/cart`, `components/products`, etc.

---

### TD-004 — Modelagem de dinheiro: centavos + utilitários (anti-float)

**Decisão:** representar preço/total em **centavos** com helpers centralizados (`Money`).

**Motivo:**
- Evita bugs clássicos de ponto flutuante.
- Centraliza formatação e cálculos, garantindo total correto no carrinho.

**Evidência:** `lib/domain/Money.ts`, `components/products/ProductPrice.tsx`, regras do carrinho (`lib/cart/rules.ts`).

**Trade-off:** exige disciplina no codebase (sempre trabalhar em cents); compensado por confiabilidade.

---

### TD-005 — Carrinho como “core testável” (store + regras + persistência)

**Decisão:** implementar carrinho com:
- **regras** (`computeCartTotals`, etc.)
- **store** (ações pequenas e previsíveis)
- **selectors** (derivações)
- **persist** (localStorage isolado)

**Motivo:**
- Carrinho é parte central do desafio; precisava ser **correto e robusto**.
- Estrutura facilita troca de UI e cobre casos de borda (qty, remove, total).

**Evidência:** `lib/cart/rules.ts`, `lib/cart/store.ts`, `lib/cart/selectors.ts`, `lib/cart/persist.ts`; UI em `components/cart/*`.

---

### TD-006 — UI componentizada por domínio (Products / Cart / Search / Layout / UI kit)

**Decisão:** separar componentes por “domínio de tela”:
- `components/products/*` (card, grid, carousel, quick view)
- `components/cart/*` (badge, item row, qty stepper, summary, overlay provider)
- `components/search/*` (filtros, busca, sort)
- `components/layout/*` (header/footer/container)
- `components/ui/*` (Button, Input, Modal, ToastProvider etc.)

**Motivo:**
- Maximiza reuso e clareza para avaliação (organização/componentização).
- Evita “componentes deus” e reduz acoplamento.

**Evidência:** diretórios e arquivos listados em `components/*`.

---

### TD-007 — “SPA premium”: Overlay/Toast como padrão, mantendo requisito de Drawer/Sidebar

**Decisão:** implementar minicarrinho/quick view como **overlay/toast** (padrão único de interação), ancorado visualmente como **painel lateral à direita** (drawer/sidebar), mantendo a essência funcional do enunciado.

**Contexto:** o desafio pede “minicarrinho (drawer/sidebar)”, abrindo pelo ícone do header, com lista, qty, remoção e total em tempo real.

**Motivo (por que foi feito):**
- **Equivalência funcional:** minicarrinho “fora do fluxo”, aberto pelo header, com as operações exigidas.
- **Melhoria de UX:** reduz troca de contexto (usuário continua navegando/filtrando).
- **Consistência:** quick view e carrinho compartilham o mesmo sistema de overlay.
- **Prova de esforço (não atalho):** exige infra de provider/eventos e cuidado de interação.

**Evidência:**
- `components/cart/MiniCartToast.tsx`
- `components/cart/MiniCartToastProvider.tsx`
- `components/products/ProductQuickViewToast*.tsx`
- eventos: `lib/toast/events.ts` e `lib/cart/events.ts`

**Risco gerenciado:** caso um avaliador exija “formato literal drawer”, o core isolado do carrinho permite alterar apenas a apresentação (layout/estilo) sem reescrever regras/estado.

---

### TD-008 — Rotas de produto: `/product/[id]` como canônico (legibilidade)

**Decisão:** usar `app/(shop)/product/[id]/page.tsx` (rota explícita) para detalhe do produto.

**Motivo:**
- Mais autoexplicativa para leitura rápida do avaliador do que uma rota curta tipo `/p/[id]`.
- Mantém deep link e página completa (quick view é enhancement, não substituto).

**Evidência:** `app/(shop)/product/[id]/page.tsx`.

**Observação:** se necessário para aderência máxima, é fácil adicionar alias/redirect `/p/[id]` sem alterar a página canônica (hardening opcional).

---

### TD-009 — Busca/Filtros: UX de listagem “de loja real”

**Decisão:** implementar barra de busca, filtros e sort como camada separada do grid de produtos.

**Motivo:**
- Diferencial valorizado e aumenta “cara de produto real”.
- Reduz fricção de navegação e melhora demonstração do catálogo.

**Evidência:** `components/search/*` e `components/products/ProductGrid.tsx`.

---

### TD-010 — Acessibilidade e UX: controles, ARIA e comportamento previsível

**Decisão:** tratar padrões de interação (ex.: botões com `aria-label`, controle de overlay, foco/fechamento) como parte do “done”.

**Motivo:**
- A11y é diferencial e também evita falhas comuns em UI (principalmente em overlays).

**Evidência indireta:** presença de `components/ui/Modal.tsx`, `ToastProvider.tsx` e o racional de “polimento” descrito no relatório.

---

### TD-011 — Testes: unit + E2E (Jest + Playwright)

**Decisão:** cobrir regras e UI crítica com testes unitários e adicionar E2E para fluxo do carrinho.

**Motivo:**
- Carrinho e API são o coração funcional; testes reduzem risco e elevam a entrega.
- Diferencial explícito do desafio.

**Evidência:** `tests/unit/*` (cart, search, api, domain, etc.) e `tests/e2e/cart-flow.spec.ts`; relatórios `playwright-report/`.

---

### TD-012 — Documentação automática: TypeDoc publicado em `docs/typedoc`

**Decisão:** gerar documentação de módulos/funções/types com TypeDoc.

**Motivo:**
- Aumenta clareza técnica e dá “prova navegável” da arquitetura.
- Ajuda o avaliador a entender rapidamente o core (`lib/cart`, `lib/api`, `lib/domain`).

**Evidência:** `docs/typedoc/*`, `typedoc.json`, `tsconfig.typedoc.json`, `typedoc_reflections.json`.

---

### TD-013 — DX “one command”: `pnpm run dx` para setup + validação

**Decisão:** criar um bootstrap de desenvolvimento que automatiza setup, inicialização, docs e validações.

**Motivo:**
- Reduz “tribal knowledge” e o atrito de avaliação (clone → rodar → validar).
- Demonstra maturidade de engenharia além do “só funciona na minha máquina”.

**Evidência:** `scripts/dx.mjs` e seção de DX no relatório final.

---

### TD-014 — Integração com IA (chatbot): isolada como módulo e opcional

**Decisão:** encapsular integração de chatbot (ex.: Botpress) em componente próprio para não contaminar o core do e-commerce.

**Motivo:**
- IA é diferencial; porém não pode aumentar risco do fluxo principal.
- Mantém o projeto “avaliável” mesmo sem configurar o bot.

**Evidência:** `components/botpress/SkippyWebchat.tsx` e `lib/ai/*` (prompts/recommend/search).

---

## 3) Como as decisões atendem diretamente os critérios do desafio

- **Organização/componentização**: camadas + diretórios por domínio + UI kit.
- **CSS/Responsividade**: identidade consistente + tokens + componentes de layout (direção descrita no relatório).
- **Lógica do carrinho**: regras centralizadas + store + persist + selectors + UI dedicada.
- **Servidor/API**: endpoints implementados lendo `products.json` (com compat do contrato).
- **Deploy/Docs/Comunicação**: README/DECISIONS + TypeDoc + DX script para reproduzibilidade.

---

## 4) Checklist de evidências (para o avaliador)

- Endpoints: `app/api/products/route.ts`, `app/api/products/[id]/route.ts`
- Página home: `app/(shop)/page.tsx`
- Página produto: `app/(shop)/product/[id]/page.tsx`
- Carrinho UI: `components/cart/*`
- Core do carrinho: `lib/cart/*`
- Testes unit: `tests/unit/*` | E2E: `tests/e2e/cart-flow.spec.ts`
- TypeDoc: `docs/typedoc/index.html`
- DX script: `scripts/dx.mjs`
