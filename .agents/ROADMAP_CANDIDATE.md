# Pelimotion Agent Loops Candidate Roadmap

*Generated at: 13/06/2026, 16:20:29*
*Current Commit Hash: `fc65e8e`*

## 1. Conflitos & Sinergias Identificados (Cross-Analysis)

### ⚠️ Conflitos & Soluções (Compromissos)
- **Auto-Save Restoration Strategy** (analista_senior vs dev_senior):
  - *Descrição:* O Auto-save está rodando. O Analista quer que o sistema restaure a sessão silenciosamente no boot. O Dev Sênior alerta para Zustand Hydration mismatches.
  - *Compromisso Proposto:* **Criar um hook no `App.tsx` que lê o LocalStorage no `mount` inicial, valida a integridade estrutural, e injeta as camadas de volta silenciosamente via uma nova action `restoreState()` na store.**

### 🤝 Sinergias
- **Layer Visibility Toggles** (diretor_criacao + product_designer):
  - *Descrição:* Composições complexas ficam impossíveis de enxergar. Precisamos de um botão de "Olho" (Visibility Toggle) no header de cada Track na Timeline para habilitar o modo "Solo" visual.

- **Dynamic Tick Ruler** (product_designer + diretor_criacao):
  - *Descrição:* A régua de tempo está rústica mostrando apenas 0 e o Fim. Vamos criar uma grade matemática gerando traços (Ticks) a cada 1 segundo dinamicamente, permitindo a precisão cirúrgica no arrasto da agulha.

## 2. Recomendações Priorizadas por Persona

### 👤 Senior Software Engineer / Architect
- **Foco:** Performance, Memory Leaks, WebCodecs, WebAssembly, Code Quality, Type Safety, Rendering Pipeline, Fallbacks
### [DEV SENIOR REPORT] Technical Feasibility & Performance (Modules 1-3)
*   **Typography:** GSAP SplitText is functioning, but DOM node cloning for trails can cause severe memory bloat. We need strict cleanup logic on component unmount and debounce on text input.
*   **Generative SVG:** Custom GSAP ticker with PosterizeTime is efficient, but Simplex noise calculations on the JS thread might block main thread if node count exceeds 500. Consider moving Simplex to a Web Worker.
*   **Library:** Local persistence mapping via localLibraryItems and globalLibraryItems works, but loading large video blobs into memory without pagination will cause browser crashes. Need virtualized scrolling and objectURL cleanup.

### 👤 Chief Executive Officer (CEO)
- **Foco:** Business Model, Enterprise Value, Cost Reduction, Zero-Server Rendering, Competitive Landscape, Long-term Scalability
### [CEO REPORT] Business Strategy (Modules 1-3)
*   **Typography:** The lettering engine is our core appeal for social media marketers. We must ensure robust, glitch-free typography presets that compete with After Effects.
*   **Generative SVG:** Unique generative patterns (wiggles, noise) provide a "differentiator" against static Canva templates. Emphasize this capability for enterprise branding.
*   **Library:** The ability to seamlessly mix local and edge-cloud assets keeps users engaged. Ensure the BunnyCDN sync is bulletproof so premium users feel their assets are secure.

### 👤 SEO Specialist & Programmatic Marketing Analyst
- **Foco:** Google Lighthouse, Core Web Vitals, Indexability, Programmatic Landing Pages, Metadata, Site Load Speed, Schema.org
### [SEO REPORT] Indexability (Modules 1-3)
*   **Typography & Generative:** Since these are canvas/WebGL heavy, they are invisible to search engines. We must generate static HTML/CSS fallbacks or server-side pre-rendered snapshots of popular generative typography templates for indexation.
*   **Library:** Public templates in the library need dedicated, canonical URLs (e.g., /templates/generative-neon-text) with descriptive meta tags.

### 👤 Senior Product Designer (UX/UI)
- **Foco:** Bento Grid Layout, Glassmorphism, Micro-animations, Spatial Camera UX, Transform Gizmos, Canvas Guides, Fluidity, Consistency
### [PRODUCT DESIGNER REPORT] User Experience (Modules 1-3)
*   **Typography:** Text editing inline needs to feel like Figma. Currently, text property controls (HSL, thin lines) need better alignment in the Bento grid.
*   **Generative SVG:** Users need a visual, intuitive "Wiggle/Noise Intensity" slider. Math-heavy parameters (Amplitude, Frequency) should be abstracted into friendly names like "Wildness" and "Speed".
*   **Library:** Full-page gallery preview is good, but needs drag-and-drop support directly from the Library to the Composition canvas with micro-animations.

### 👤 Senior Product & Data Analyst
- **Foco:** Metrics tracking, User Flows, Conversion Funnels, Telemetry, Error Monitoring, User Action Logging
### [ANALYST REPORT] Telemetry (Modules 1-3)
*   **Typography:** Track which font families and GSAP easing curves are used most frequently to prioritize future premium preset packs.
*   **Generative SVG:** Log the average number of nodes generated before user framerate drops below 30fps.
*   **Library:** Track upload failure rates to BunnyCDN and local file loading times to detect UX friction.

### 👤 Creative Director / Motion Lead
- **Foco:** Aesthetics, Typography Presets, Kinetic Curves, Generative Visual Noise, Sensory WOW factor, Asset Quality
### [CREATIVE DIRECTOR REPORT] Visual Feeling (Modules 1-3)
*   **Typography:** Trails are currently too flat. We need organic fade-outs, variable opacity on trails, and elastic overshoot on letter appearances.
*   **Generative SVG:** The wiggles are a bit sterile. Add tritonal gradient maps, blend modes (Overlay/Screen), and subtle chromatic aberration on the generative SVG edges.
*   **Library:** Ensure library previews auto-play with smooth hover states and a polished "WOW" factor. No generic loading spinners.

## 3. Próximos Passos de Implementação (MASSIVE LOOP PHASE 6)

- [x] **Auto-Save Restoration:** Criar a action `restoreState(payload)` em `useEditorStore.ts` e acioná-la no Mount inicial do `App.tsx` lendo os bytes persistidos do localStorage (Analista).
- [x] **Layer Visibility Toggle:** Adicionar o ícone de Olho (Eye/EyeOff) no track header em `CompositionTimeline.tsx` para injetar `hidden: true/false` em cada camada (Product Designer).
- [x] **Dynamic Tick Ruler:** Refatorar a régua (Axis) do `CompositionTimeline.tsx` gerando um array numérico que renderiza marcas `|` a cada segundo exato do vídeo para auxiliar a precisão de edição (Diretor de Criação).
