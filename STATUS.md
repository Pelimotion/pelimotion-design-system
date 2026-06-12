# STATUS — Pelimotion Design System

## Active Phase: 🟢 Typography GSAP Engine & Editor UI Stabilized

## 🏁 Pelimotion Design System v1.2 — Online & Updated

All updates for the typographic GSAP architecture, dynamic UI layout, and global motion controls have been successfully implemented and pushed.

### Session Achievements (GSAP Architecture & Editor UI)
- **Gizmo GSAP Transforms:** Decoupled bounding box transforms from React state. Rotation, scale, and positioning are now exclusively driven by GSAP (`gsap.set()`), permanently fixing layout jitter and constraint bugs during user interaction.
- **Global IDLE Wrapper:** Implemented a continuous `globalIdleMotion` property acting on a parent wrapper (`globalWrapperRef`), allowing all typographic layers to float/move as a single unified composition without overriding individual entry/exit presets.
- **Trail 1:1 Parity:** Fixed trailing typography desyncs. Trail clones now strictly inherit the main text node's `word-break`, `white-space`, and `text-transform` properties, ensuring visual parity regardless of font size or bounding box scaling.
- **Resizable Sidebar Split-Pane:** Rewrote the main App layout to support a resizable CSS-grid sidebar (drag-to-resize) with memory persistence for responsive UI debugging.
- **Top Toolbar & Global Layouts:** Migrated status badges to a dedicated `TopToolbar.tsx`. Implemented dynamic Flexbox/Grid CSS engines for "Stack", "Side by Side", "Grid", and "Freeform" layout modes directly in the preview.
- **Generative UI Cleanup:** Merged the "Estilos" tab into the "Camadas" view for a more immediate and premium UX workflow.
- **Color Palette System:** Implemented a systematic color palette architecture with over 30 modern curated palettes (Digital Agency, Brutalist, Editorial, Pop, Earthy). Integrated a "Cores" tab in the Typography panel to instantly apply palettes globally to text layers, trail effects, and canvas backgrounds.
- **Flat 2D Trail Aesthetic:** Permanently removed legacy blur effects and `totalBlur` filter calculations from the GSAP rendering pipeline to enforce a sleek, modern flat/2D drop-shadow aesthetic. Removed the blur configuration slider from the UI.
- **Modern Typography Templates:** Expanded local typography presets inside the Library to include highly sophisticated designs inspired by top digital agencies and brutalist hacker aesthetics (e.g., "Digital Agency" and "Cyber Shield").
- **Library Local Integration:** Integrated local typography presets directly into the main "Biblioteca" panel alongside cloud assets, complete with a detailed specifications visualizer and a direct "Aplicar no Editor" action.

### Phase 6 Completed Tasks (Infrastructure & Per-Layer Engine)
- **Bunny CDN Regional Support:** Added support for `VITE_BUNNY_STORAGE_ENDPOINT` in `src/lib/bunnyStorage.ts` and set it to `https://br.storage.bunnycdn.com` in `.env` to prevent 401 Unauthorized issues with the Brazilian São Paulo storage zone.
- **DNS & Domain Configuration:** Configured both `pelimotion.art` and `www.pelimotion.art` in Vercel. Configured Cloudflare A records (`76.76.21.21`) and CNAMEs. Verified successful SSL propagation and HTTP 200 responses.
- **Per-Layer Appearance Properties:** Migrated `colorMode`, `colors`, `targetMode`, and `opacityMode` from the global config into the individual layer structure (`GenerativeLayer` in `motion.types.ts`).
- **SVG Styling Clear Fix:** Fixed the ghost color/path disappearance bug by clearing inline fill/stroke style attributes before applying Solid, Duotone, or Tritone colors, leaving original attributes untouched underneath.
- **Independent Opacity Modes:** Implemented `opacityMode` options: `fixed` (static slider value), `wiggle-group` (animates group opacity), and `wiggle-paths` (animates each path's opacity individually with independent simplex noise offsets).

### Phase 5 Completed Tasks (Client-Side Render Pipeline)
- **DOM-to-Canvas Capture:** Integrado `html-to-image` para captura frame a frame do DOM sem distorções visuais.
- **GSAP Timeline Scrubbing:** Implementado avanço manual determinístico (`timeline.seek()`) garantindo exportação fluida indepentende de performance da máquina.
- **WASM-Free ZIP Encoding:** Integrado `fflate` para compressão ZIP síncrona/assíncrona in-memory para sequências PNG transparentes.
- **ExportPanel & ExportPreview:** UI de exportação criada com seletor de resolução, FPS e duração, acompanhada de barra de progresso visual em tempo real.
- **Code Audit & Modernization:** Migração de todos os GSAP listeners para o padrão oficial `@gsap/react`, correção de duplicidades de eventos no `noiseEngine.ts`, limpeza de bugs em listeners do `<video>`, e blindagem do HMR.

### Phase 4 Completed Tasks
- **Biblioteca de Assets (UI):** Adicionado `LibraryPanel` e `LibraryPreview` navegando pelos assets em `library.json`.
- **AlphaVideoPlayer:** Player customizado de HTML5 Video desenhado para renderizar arquivos com Alpha Channel (`.webm` VP9 e `.mov` HEVC), com background xadrez para validar transparência.
- **Manipuladores de Download:** Função `downloadFile` implementada forçando trigger via `<a>` DOM element.
- **Mock Data Inject:** Dados de demonstração criados no `library.json` para testar layout.

### Phase 3 Completed Tasks
- **SVG Injector:** Fetch + injeção inline de SVGs de `public/assets/svg-generative/`.
- **Noise Engine (Simplex):** Motor de ruído Simplex 2D/3D com driver lifecycle start/stop/tick. Canais: x, y, rotation, scale, opacity.
- **PosterizeTime:** Substituição do ticker GSAP. Callbacks a 8/12/15/24fps com tweens UI a 60fps.
- **GenerativePreview & Panel:** Painel e canvas de injeção em tempo real.

### Phase 2 Completed Tasks
- **GSAP SplitText Integration:** Globally registered the premium SplitText plugin in the GSAP pipeline.
- **GSAP Timeline Factory:** Created a modular engine factory to drive typographic variables.
- **Trail Effect Module:** Implemented dynamic DOM cloning with customizable mix-blend-modes, staggered sweep delays.
- **Typography Control Panel (PT-BR):** Rebuilt sidebar panel with collapsible sections, portal-based tooltips, trail enable/disable toggle.
- **Advanced Trail Engine:** SVG feMorphology outer-stroke filter.

### Phase 1 Completed Tasks
- **Vite + React + TS + SWC Scaffold Setup**
- **Tailwind CSS v4 Dark-Mode UI Shell**
- **Zustand Store with Strict Config JSON Mapping**
- **GSAP Custom Plugins Registration**
- **VS Code Launch Configuration with Port 3000**
- **SharedArrayBuffer COOP/COEP Headers Active**

## ⚙️ Modo de Operação (SOP)
Para cada alteração ou funcionalidade solicitada pelo usuário neste projeto, a IA deve:
1. Implementar e testar localmente.
2. Garantir o sucesso do build com `npm run build`.
3. Executar o **git commit** de forma automática com mensagem descritiva.
4. Executar o **git push** de forma automática para propagar as alterações e acionar o deploy (CI/CD / Vercel integration).
