# ROADMAP CANDIDATE — Sessão 12
**Gerado em:** 2026-06-15T02:28:00Z  
**Sessão anterior:** 11 — Interface Restructure & UX Overhaul  
**Commit:** `814b14c`

---

## 🚨 Bugs & Problemas Reportados pelo Usuário (PRIORIDADE MÁXIMA)

> Estes foram observados diretamente pelo usuário durante uso real do app.  
> Devem ser tratados ANTES de qualquer outra melhoria da sessão.

---

### BUG 1 — Elemento piscando no Generativo (Gizmo)
**Reprodução:** Adicionar uma "Estrela" no módulo Generativo → um elemento extra (parece um círculo) fica piscando dentro da área do Gizmo.  
**Causa provável:** O `GlobalGizmo` ou `InteractiveGizmo` está renderizando um elemento residual ou o layer anterior não está sendo limpo ao trocar de shape. Pode ser um `useEffect` com dependência incorreta no `GenerativePreview.tsx`.  
**Ação:** Ler `GlobalGizmo.tsx`, `InteractiveGizmo.tsx`, e `GenerativePreview.tsx`. Identificar qual elemento extra está sendo renderizado e corrigir o ciclo de vida.

---

### BUG 2 — Menu da Timeline cortado (TopToolbar muito largo)
**Reprodução:** Módulo Composição → a barra de controles/menu acima da timeline não aparece inteiro em browser com viewport padrão (~1280px).  
**Causa provável:** A `CompositionTimeline.tsx` tem controles de playback, zoom, e layer controls inline sem overflow handling. Em 1280px de largura total menos a sidebar (320px), restam ~950px — provavelmente insuficiente para todos os controles em linha.  
**Ação:** Ler `CompositionTimeline.tsx` (60KB — arquivo complexo). Implementar:
- Controles essenciais (play/pause/stop + tempo) sempre visíveis
- Controles secundários (zoom, snap, etc.) em overflow ou dropdown
- Usar `flex-wrap` ou `overflow: hidden` com scroll horizontal suave

---

### FEATURE 3 — Adicionar Tipografia/Generativo direto à Composição sem salvar na Biblioteca
**Problema:** Atualmente não é possível adicionar um elemento criado em Tipografia ou Generativo diretamente na Composição sem passar pela Biblioteca permanente. O workflow esperado (como no After Effects/Figma) é:
- Criar um elemento em qualquer módulo
- Clicar "Adicionar à Composição" → vai como uma camada temporária (não salva na biblioteca)
- OU clicar "Salvar na Biblioteca" → salva permanentemente para reutilização
**Ação:**
1. Ler `useEditorStore.ts` para entender `addCompositionLayer` e `saveToLocalLibrary`
2. Adicionar botão **"Usar na Composição"** no `TypographyPanel.tsx` e `GenerativePanel.tsx` que chama `addCompositionLayer` diretamente com os dados atuais do módulo
3. Manter o botão **"Salvar na Biblioteca"** separado para persistência
4. Distinguir visualmente os dois fluxos (camada temporária vs. asset salvo)

---

### FEATURE 4 — Sistema de Camadas: Gestão e Visualização Melhorada
**Problema:** A gestão de assets/peças/elementos como camadas está fragmentada:
- O painel lateral de Composição mostra uma lista simples de camadas
- A timeline mostra as camadas em track lanes
- Não há uma visão unificada de "o que existe na minha composição"
**Ação:**
1. Melhorar o `CompositionPanel.tsx` (já revisado na S11) para mostrar:
   - Ícone de tipo de layer (Tipografia, Generativo, Asset, Áudio)
   - Indicador de visibilidade (olho toggle)
   - Lock/unlock de layer
   - Cor de identificação da track na timeline
2. Sincronizar seleção: clicar na camada do painel lateral → highlight na timeline, e vice-versa
3. Adicionar reordenação de camadas por drag-and-drop no painel lateral

---

### FEATURE 5 — Fluxo de Export sem obrigatoriedade de Composição
**Problema:** Para exportar, o usuário precisa sempre ir até o módulo de Composição primeiro. Em softwares como Canva e Figma, o export é contextual:
- Se está em Tipografia → "Exportar este frame"
- Se está em Composição → "Exportar toda a timeline"
- Botão de export sempre disponível na TopToolbar (com contexto inteligente)
**Ação:**
1. Repensar o botão de Export na TopToolbar (que foi removido na S11 por ser duplicado) → recolocar como um botão **contextual** que muda comportamento por painel:
   - Em Tipografia/Generativo: "Exportar Frame Atual" → vai para ExportPanel com `png-still` pré-selecionado
   - Em Composição: "Exportar Vídeo" → vai para ExportPanel com `mp4` pré-selecionado
   - Em Exportar: já está no painel correto
2. Adicionar CTA de export nos painéis de Tipografia e Generativo (ao lado do preview ou no rodapé do painel)
3. Unificar a experiência: o usuário **nunca deve sentir que está "preso"** em um módulo para realizar uma ação de outro

---

## Prioridades Herdadas da Sessão 11

### 🏗️ Dev Senior — Cleanup Técnico
- [ ] Remover handlers inline redundantes no CompositionPanel (CSS group hover já cobre o delete)
- [ ] Verificar sincronismo `isPlaying` ↔ GSAP ticker no novo botão Play/Pause do CompositionPanel

### 🎨 Product Designer — UX
- [ ] Transição suave entre painéis no sidebar (usar `key={activePanel}` + `panel-slide-in` animation já definida no CSS)
- [ ] Tooltip no sidebar colapsado

---

## Ordem de Execução Recomendada

| # | Tarefa | Prioridade | Tipo |
|---|--------|-----------|------|
| 1 | BUG: Elemento piscando no Gizmo (Generativo/Estrela) | 🔴 Crítico | Bug |
| 2 | BUG: Timeline menu cortado em 1280px | 🔴 Crítico | Bug |
| 3 | FEAT: "Usar na Composição" em Tipografia + Generativo | 🔴 Alta | Feature |
| 4 | FEAT: Export contextual por painel na TopToolbar | 🟡 Alta | Feature |
| 5 | FEAT: Gestão de camadas melhorada (visibilidade, lock, cor) | 🟡 Média | Feature |
| 6 | Transição suave entre painéis | 🟢 Baixa | Polish |
| 7 | Cleanup técnico (handlers inline, isPlaying sync) | 🟢 Baixa | Cleanup |

---

## Métricas de Sucesso da Sessão 12

- [ ] Elemento piscando no Gizmo resolvido
- [ ] Timeline toolbar visível em 1280px sem cortes
- [ ] Botão "Usar na Composição" funcional em Tipografia e Generativo
- [ ] Export contextual implementado na TopToolbar
- [ ] `npm run build` → zero erros TypeScript
- [ ] Commit da sessão feito

---

## Notas Técnicas

- **Commit atual:** `b1d6058` (main)
- **Dev server:** Rodando em background (task-1020) em `localhost:5174`
- **Arquivos-chave para esta sessão:**
  - `src/components/CompositionTimeline.tsx` (60KB — principal para BUG 2)
  - `src/components/GlobalGizmo.tsx` + `InteractiveGizmo.tsx` (para BUG 1)
  - `src/engines/Generative/GenerativePreview.tsx` (para BUG 1)
  - `src/components/TypographyPanel.tsx` (para FEAT 3)
  - `src/components/GenerativePanel.tsx` (para FEAT 3)
  - `src/components/TopToolbar.tsx` (para FEAT 4)
  - `src/store/useEditorStore.ts` (para verificar APIs disponíveis)
