# STATUS — Pelimotion Design System

## Active Phase: 🟢 Scale Optimization, Dual-Library & WebCodecs Fixes (v2.0)

## 🏁 Pelimotion Design System v2.0 — Production-Ready Motion Suite

All critical bugs involving viewport scaling (cropping/gizmo shift), asset library retention (Session vs. Global Storage), and MP4 WebCodecs exports have been resolved. The workspace is fully integrated, verified, and stable.

### Session Achievements (v2.0 - Scale Fixing, Dual-Library & WebCodecs Export)
- **Dual-Layer Canvas Viewport & Gizmo Alignment (Canvas Scaling):** Solved canvas cropping and left-side misalignment by introducing a dual-layer container structure: an outer `#canvas-viewport` container that scales dynamically via CSS `transform: scale()` to fit the workspace, and an inner `#canvas-fixed-resolution` wrapper that locks the exact target resolution pixels (e.g., 1080x1080, 1920x1080). This ensures the Gizmo bounding box matches coordinates perfectly, avoiding scaling distortions.
- **Dynamic Dual-Library System (Session vs. Global):** Re-architected library storage to distinguish session-only projects from persistent, cross-session templates. `localLibraryItems` now represents temporary, memory-only session files, whereas `globalLibraryItems` leverages `localStorage` persistence under key `pelimotion_global_library`, allowing users to explicitly choose where to save.
- **WebCodecs MP4 Export Resolution & Codec Fix:** Fixed MP4 export pipeline failures by implementing automatic dimensions normalization (ensuring width and height are multiples of 2 using `safeWidth` and `safeHeight`). Additionally, updated the VideoEncoder configuration to use detailed profile codec strings (e.g., `avc1.4d0028` for High Profile, `avc1.42e01f` for Baseline Profile) based on frame height, replacing the generic `'avc'` string which failed on many browsers.

### Session Achievements (v1.5 - Overhauled Composition & Local Dev Testing)
- **Horizontal Full-Screen Timeline Layout:** Repositioned the timeline to the bottom of the main editor workspace when in Composition mode, providing a professional and spacious NLE (Non-Linear Editor) UI.
- **BunnyCDN Asset Previews & Timeline Injection:** Added full `.mp4`/`.mov` previews to the `LibraryPreview` panel. Integrated "Add to Composition" buttons to inject library presets and cloud assets directly as timeline layers.
- **Real Render Previews in Composition:** Substituted static placeholders inside `CompositionPreview` with real, active components (`TypographyPreview` and `GenerativePreview`) and `<video>` nodes, synchronized frame-by-frame with the global timeline.
- **Multi-Video Frame Sync & Render Bypass:** Overhauled `exportPipeline.ts` to coordinate, pause, and step through all video layers. Solved canvas-bleeding/CORS limitations by drawing current frames of timeline video layers onto an offscreen canvas and swapping them to temporary inline `<img>` tags during the capture phase.
- **Removed Auto-Upload on Export:** Disabled automatic BunnyCDN uploads on every export to conserve bandwidth and guarantee high performance.
- **Local Dev Server Activated:** Launched the local dev server successfully on `http://localhost:3000/pelimotion-design-system/` for comprehensive end-to-end testing.

### Session Achievements (v1.4 - Documentation & Vibe Coding Standards)
- **Detailed Vibe Coding Manifesto:** Expanded `manifesto_vibe_coding_ux_ui.md` with guidelines on state management, atomic selectors for scrubbing, bento grid layout conventions, and native Pointer Events.
- **Detailed Engineering Architecture:** Updated `ARCHITECTURE.md` to document the dual-pass Canvas Compositing trick (handling transparent overlays and video background) and browser-based FFmpeg.wasm buffer optimization.
- **Roadmap Verification:** Fully updated `ROADMAP.md` marking previous milestones (Phases 1-6) as complete and defining future backlog targets (audio mixing, cloud rendering, AI prompts).

### Session Achievements (v1.3 - Composition Engine & Global Stability)
- **Reference Error & Black Screen Fixes:** Resolved critical Javascript reference errors (`exportConfig` undefined in `App.tsx` and `ColorManager` undefined in `LibraryPanel.tsx`) that caused the workspace to crash (black screen) when switching panels.
- **Top Toolbar Alignment:** Corrected active panel title display in `TopToolbar.tsx` to display "Composição" when the Composition module is active instead of defaulting to "Exportar".
- **Decoupled Background Styling:** Color palettes no longer dictate or overwrite the canvas background color. Backgrounds are now fully managed by the Composition panel (`exportConfig.backgroundColor`), guaranteeing absolute visual control.
- **Centralized Composition Controls:** Moved framerate, resolution (aspect ratio preset guides), duration, base background solid colors, and media uploader controls from the Export Panel directly into the **Composition Panel**. The Export panel now exclusively handles render target formats (MP4, PNG sequence, MOV) and the render pipeline trigger.
- **Composition Preview Layout:** Rendered the global background (color/image/video) in the central canvas viewport across all editing modules (Typography, Generative, Composition), making it easier to edit elements over the active background canvas.
- **Duotone & Tritone Generative Colors:** Standardized the color mapping for Duotone (2 colors) and Tritone (3 cores) generative SVGs to map directly to CSS variables (`--canvas-text-primary`, `--canvas-accent`, `--canvas-text-secondary`) controlled by the global palette manager, disabling custom color pickers in these modes to enforce brand alignment.
- **Local Library Specifications Visualizer:** The Library now displays dynamic detailed specification cards for custom local typography and generative presets (e.g. layout gaps, number of layers, active noise parameters) with an interactive "Aplicar no Editor" action.
- **Flat 2D Trail Aesthetic:** Permanently removed legacy blur effects from the GSAP typography trails to support high-contrast flat 2D designs.
- **Bunny CDN Regional Support:** Added support for regional storage endpoints (specifically São Paulo `br.storage.bunnycdn.com`) in the upload pipeline to prevent authentication issues.

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
