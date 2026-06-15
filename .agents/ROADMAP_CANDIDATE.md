# 🎬 Pelimotion — Roadmap de Melhoria (Orquestrador V4)

*Gerado em: 14/06/2026, 23:58:12 | Sessão #13 | Commit: `d23b656`*
*Branch: `main` | Arquivos TypeScript/TSX: 51*

> **FOCO DESTA SESSÃO:** **Global Navigation, Sidebar & Bento UX**
> **ATENÇÃO AGENTE EXECUTOR:** Esta roadmap NÃO TEM LIMITE DE COMPLEXIDADE.
> Use After Effects, Figma, Cavalry, Canva, CapCut, Jitter.video como referências.
> O Browser DOM está pré-autorizado para todos os testes Playwright desta sessão.

## 1. 🧠 Memória & Aprendizado Histórico

- Group hover via CSS .parent:hover .child-btn { opacity: 1 } is cleaner and more performant than React state for transient UI reveals like delete buttons.
- Semantic <button> elements should always be used for interactive actions — using <div onClick> for the render button was an accessibility anti-pattern.
- When a feature is duplicated across sidebar nav and toolbar, always keep it ONLY in the sidebar nav to reduce cognitive load and keep the toolbar focused on canvas-context tools.
- Session 12 [Bugs, Direct Composition & Layer Controls]: Canvas hiding display conditional resolved ghost blinking element on Star shape. Timeline Settings Popover freed up ~400px of width, preventing UI truncation in 1280px. Direct Composition action simplifies creative workflows by bypassing permanent library storage.
- Session 13 [Global Navigation, Sidebar & Bento UX]: 1 erros, 1 achados UX, FPS=15. TOP: "Adicionar Texto" button NOT found in toolbar — user cannot quickly add text lay

## 2. 🔍 Achados dos Testes Automatizados (Playwright Deep Audit)

**📸 Screenshots capturados:** 00_initial_load.png, 01_typography_panel.png, 01b_typography_add_text.png, 02_generative_panel.png, 02b_generative_shape_active.png, 03_library_panel.png, 04_composition_panel.png, 05_export_panel.png, 06_sidebar_collapsed.png, 07_sidebar_auto_expanded.png, session-result.png
**⚡ FPS medido:** 15 fps
**📊 Painéis auditados:** typography, generative, library, composition, export

### 🎯 UX Findings por Prioridade

**🟠 HIGH (1)**
- [typography] "Adicionar Texto" button NOT found in toolbar — user cannot quickly add text layers.

## 3. 🚀 Plano de Execução Profunda (Deep Sweep)

### Passo 1: Investigação Visual Real (Obrigatório)
- [ ] Abrir `http://localhost:3000/pelimotion-design-system/` no browser integrado (já pré-autorizado)
- [ ] Percorrer TODOS os 5 painéis como um usuário iniciante sem conhecimento prévio
- [ ] Documentar cada momento de confusão, clic em área errada ou fluxo não intuitivo
- [ ] Verificar se **tooltips de atalho de teclado** aparecem em hover nos botões
- [ ] Checar se **estados vazios** de cada painel têm call-to-action claro
- [ ] Testar drag & drop de assets na timeline e canvas
- [ ] Verificar comportamento ao redimensionar a janela do browser

### Passo 2: Pesquisa de Mercado Fundamentada
- [ ] Estudar como **Figma** resolve empty states e onboarding sem tutoriais externos
- [ ] Estudar como **After Effects** organiza painéis e ferramentas em 48px de altura
- [ ] Estudar como **Cavalry** simplifica nós complexos em UI linear para o usuário final
- [ ] Estudar como **Jitter.video** (web-based) faz transições de aba instantâneas sem re-render
- [ ] Pesquisar: `best practices sidebar navigation creative tools 2024`
- [ ] Pesquisar: `empty state design patterns professional software`

### Passo 3: Implementações Prioritárias (Global Navigation, Sidebar & Bento UX)
- [ ] **UX: Tooltip de atalhos** — adicionar `title="...  Atalho: Cmd+X"` em TODOS os botões do TopToolbar
- [ ] **UX: Empty States** — cada painel sem conteúdo deve ter ícone + texto explicativo + botão de ação primário
- [ ] **UX: Sidebar auto-scroll** — quando o usuário seleciona um item, o painel lateral deve fazer scroll para mostrar os controles relevantes
- [ ] **UX: Feedback visual** — adicionar animação de `scale(0.97)` no click de todos os botões de ação primários
- [ ] **UX: Hierarquia de Bento** — os bento cards nos painéis de Composição e Exportar devem ter gradiente de borda sutil para distinguir seções
- [ ] **UX: Zoom display** — o número de % no ViewportControls deve ter transição smooth ao mudar
- [ ] **ACESS: Focus ring** — verificar se Tab navigation tem focus ring visível em alto contraste
- [ ] **PERF: Verificar FPS** — com 3+ camadas ativas, FPS deve manter-se acima de 30fps

### Passo 4: Validação Rigorosa
- [ ] Rodar novamente `npm run agent:research` após as implementações para comparar achados
- [ ] Verificar que todos os erros de console foram eliminados
- [ ] Verificar visualmente que os empty states aparecem corretamente
- [ ] Verificar que tooltips aparecem em todos os botões relevantes
- [ ] Rodar `npm run build` — zero erros de compilação
- [ ] Commitar com mensagem descritiva e criar restore point

## 5. 📈 Histórico de Sessões

| Sessão | Foco | Erros | UX Findings | FPS |
|--------|------|-------|-------------|-----|
| S7 | Keyboard Shortcuts & Accessibility | 0 | 4 | 47 |
| S8 | Typography Engine & Text Layer UX | 0 | 4 | 74 |
| S9 | Generative Shapes & Canvas Interact | 0 | 1 | 57 |
| S10 | Library Panel & Asset Management | 0 | 0 | 56 |
| S11 | Interface Restructure & UX Overhaul | 0 | 10 | null |
| S12 | Bugs, Direct Composition & Layer Co | 0 | 5 | null |
| S13 | Global Navigation, Sidebar & Bento  | 1 | 1 | 15 |

## 6. ⏱️ Finalização e Reagendamento (VITAL)

> **IMPORTANTE:** O timer de 15 minutos SÓ COMEÇA após completar TODOS os passos acima.
> Quando terminar, crie o commit, registre o backup e inicie novo timer:
>
> ```bash
> npm run agent:backup -- --desc "Após Session 13: [descreva o que foi feito]"
> ```
>
> Depois use a tool: `/schedule DurationSeconds=900 Prompt="Execute npm run agent:research e analise a nova roadmap V4."`
