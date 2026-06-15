# 🎬 Pelimotion — Roadmap de Melhoria (Orquestrador V4)

*Gerado em: 14/06/2026, 21:49:22 | Sessão #7 | Commit: `e0125cd`*
*Branch: `main` | Arquivos TypeScript/TSX: 51*

> **FOCO DESTA SESSÃO:** **Keyboard Shortcuts & Accessibility**
> **ATENÇÃO AGENTE EXECUTOR:** Esta roadmap NÃO TEM LIMITE DE COMPLEXIDADE.
> Use After Effects, Figma, Cavalry, Canva, CapCut, Jitter.video como referências.
> O Browser DOM está pré-autorizado para todos os testes Playwright desta sessão.

## 1. 🧠 Memória & Aprendizado Histórico

- Sidebar auto-expansion when clicking nav tabs on a collapsed sidebar provides much higher UX coherence than forcing a manual expansion.
- Decoupling canvas/generative overlays to accept partial motionConfig structures allows independent rendering states during static and composition playbacks.
- Zoom-to-mouse-position requires offsetting the camera coordinates proportionally to the delta zoom and target canvas bounds to prevent layout drift.
- Session 7 [Keyboard Shortcuts & Accessibility]: 0 erros, 4 achados UX, FPS=47. TOP: Composition timeline not found or not visible — main workflow broken.

## 2. 🔍 Achados dos Testes Automatizados (Playwright Deep Audit)

**📸 Screenshots capturados:** 00_initial_load.png, 01_typography_panel.png, 01b_typography_add_text.png, 02_generative_panel.png, 02b_generative_shape_active.png, 03_library_panel.png, 04_composition_panel.png, 05_export_panel.png, 06_sidebar_collapsed.png, 07_sidebar_auto_expanded.png, session-result.png
**⚡ FPS medido:** 47 fps
**📊 Painéis auditados:** typography, generative, library, composition, export

### 🎯 UX Findings por Prioridade

**🟠 HIGH (1)**
- [composition] Composition timeline not found or not visible — main workflow broken.

**🟡 MEDIUM (2)**
- [library] Library panel shows no items and no empty state — user is confused about what to do here.
- [viewport] Viewport controls (zoom/fit) not visible — user has no camera control affordance.

**🟢 LOW (1)**
- [composition] Only 1 bento card(s) found in composition sidebar — layout may feel sparse.

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

### Passo 3: Implementações Prioritárias (Keyboard Shortcuts & Accessibility)
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

## 6. ⏱️ Finalização e Reagendamento (VITAL)

> **IMPORTANTE:** O timer de 15 minutos SÓ COMEÇA após completar TODOS os passos acima.
> Quando terminar, crie o commit, registre o backup e inicie novo timer:
>
> ```bash
> npm run agent:backup -- --desc "Após Session 7: [descreva o que foi feito]"
> ```
>
> Depois use a tool: `/schedule DurationSeconds=900 Prompt="Execute npm run agent:research e analise a nova roadmap V4."`
