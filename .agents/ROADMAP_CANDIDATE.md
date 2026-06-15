# ROADMAP CANDIDATE — Sessão 12
**Gerado em:** 2026-06-15T02:17:00Z  
**Sessão anterior:** 11 — Interface Restructure & UX Overhaul  
**Commit:** `814b14c`

---

## Resumo Executivo

A Sessão 11 removeu as 10 principais duplicações e inconsistências de UX identificadas na varredura de código. O sistema está agora mais limpo e alinhado com os padrões Figma/After Effects. A Sessão 12 deve focar em:

1. **Verificação visual pós-reestruturação** — garantir que as mudanças renderizam corretamente
2. **TypographyPanel e GenerativePanel** — os maiores e mais complexos componentes, ainda não auditados em detalhe quanto a duplicações internas
3. **Interatividade da timeline** — pending issue de sincronia play/pause  
4. **Refinamentos de micro-interação** — hover states, transições entre painéis

---

## Prioridades Identificadas (por agente)

### 🏗️ Dev Senior — Qualidade Técnica
- [ ] **Cleanup de inline onMouseEnter desnecessários** no `CompositionPanel.tsx` — o botão delete agora usa CSS group hover, os handlers React são redundantes
- [ ] **Verificar sincronismo isPlaying ↔ GSAP ticker** — garantir que o botão Play/Pause no CompositionPanel está sincronizado com o estado real de playback
- [ ] **Auditoria de imports não usados** em `TypographyPanel.tsx` e `GenerativePanel.tsx` — estes são os maiores arquivos (54k e 44k respectivamente)

### 🎨 Product Designer — UX/UI
- [ ] **Transição suave entre painéis** — ao clicar em outro item do sidebar nav, o conteúdo do painel deveria fazer um fade/slide in, não apenas aparecer abruptamente
- [ ] **Tooltip de atalhos no sidebar** — ao colapsar o sidebar, o ícone deve mostrar um tooltip com o nome do painel
- [ ] **TypographyPanel**: verificar se o fluxo "Adicionar Texto → configurar → ver preview" é fluido e sem etapas ocultas
- [ ] **GenerativePanel**: verificar se os controles de ruído (Simplex/Perlin) têm feedback visual adequado durante a edição

### 🎬 Diretor de Criação — Motion Quality
- [ ] **CompositionTimeline**: verificar UX de drag-drop de camadas na timeline — é o fluxo mais complexo do sistema
- [ ] **Play/Pause visual feedback** — o botão no CompositionPanel deve ter uma animação de transição entre os dois estados (não só troca de ícone)
- [ ] **Export progress**: barra de progresso do render é muito simples — adicionar ETA e nome do frame atual sendo processado

### 📊 Analista — Dados e Fluxo
- [ ] **Empty states acionáveis**: medir quantas vezes o usuário chega a um painel vazio e não encontra o CTA — LibraryPanel agora tem botão de import mas os outros painéis precisam verificação
- [ ] **Onboarding flow**: a tela de boas-vindas (Home) ainda usa 3 cards de quick-start com descrição genérica — refinar para ser mais específico sobre o workflow (Typography → Generative → Composition → Export)

---

## Plano de Execução Sugerido (Sessão 12)

### Fase 1 — Verificação Visual (15min)
1. Abrir browser em `http://localhost:5174`
2. Navegar por todos os 5 painéis e documentar se as mudanças da Sessão 11 estão renderizando corretamente
3. Testar: import de arquivo na LibraryPanel, delete de camada, Play/Pause no CompositionPanel

### Fase 2 — Cleanup Técnico (15min)
4. Remover handlers inline redundantes no CompositionPanel (o CSS group hover é suficiente)
5. Auditar e limpar imports não usados em TypographyPanel e GenerativePanel

### Fase 3 — Transições de Painel (20min)
6. Implementar transição suave entre painéis no sidebar usando CSS animation `panel-slide-in` (já definida no index.css)
7. Adicionar tooltip no sidebar colapsado (usando o atributo `title` já existente — verificar se está funcionando)

### Fase 4 — Play/Pause Sync e Timeline (20min)
8. Verificar e corrigir sincronismo do botão Play/Pause com GSAP ticker
9. Auditar fluxo de drag-drop na CompositionTimeline

### Fase 5 — Home Screen & Onboarding (10min)
10. Refinar os 3 cards de quick-start com descrições mais acionáveis e indicador de workflow sequencial

---

## Métricas de Sucesso

- `npm run build` → zero erros TypeScript ✅
- Todos os 5 painéis navegáveis sem duplicações visíveis
- Botão Play/Pause em CompositionPanel visualmente sincronizado com playback
- Import de arquivo via LibraryPanel adiciona camada à composição corretamente
- Transição suave (200ms) ao trocar de painel no sidebar

---

## Notas Técnicas

- **Commit atual:** `814b14c` (main)
- **Dev server:** Rodando em background (task-1020) em `localhost:5174`
- **GSAP ticker:** Gerenciado em `CompositionPreview.tsx` e `CompositionTimeline.tsx`
- **Store principal:** `useEditorStore.ts` — `isPlaying` e `togglePlayback` já existem
