# STATUS — Pelimotion Design System

## Active Phase: 🟢 Analytics, Lighthouse & Motion Dynamics (v2.2)

## 🏁 Pelimotion Design System v2.2 — Performance & Growth Ready

All critical bugs involving viewport scaling (cropping/gizmo shift), asset library retention (Session vs. Global Storage), WebCodecs exports, and typography resizing have been resolved. The workspace is fully integrated, responsive, verified, and stable. Additional SEO, Telemetry, and advanced Motion features were shipped in v2.2.

### Session Achievements (v2.2 - Analytics, Lighthouse & Motion Dynamics)
- **Motion Easing & Blur Dynamics:** Added new presets `bounceIn`, `elasticWhip`, `bounceOut`, `elasticSnap`. Integrated global toggle for CSS motion blur filtering in `<CompositionPreview />`.
- **Local Privacy-First Telemetry:** Developed `src/lib/telemetry.ts` logger. Instrumented `exportPipeline.ts` to capture `EXPORT_STARTED`, `EXPORT_COMPLETED`, and `WEBCODECS_FALLBACK` metrics directly to localStorage.
- **Automated Lighthouse Validator:** Introduced `agent:lighthouse` script using `npx lighthouse` in headless mode to generate `.agents/reports/lighthouse-report.html` to guarantee strict 100/100 SEO and Performance targets.

### Session Achievements (v2.1 - Spatial Camera, UI Scaling & WebCodecs Hotfix)
- **WebCodecs Deep Copy Validation Fix:** Solved the export error (`Error: source must be a VideoSource`) inside `src/engines/Export/exportPipeline.ts` by replacing the `transferToImageBitmap()` call with an asynchronous `createImageBitmap()` deep copy. This ensures the output frame remains origin-clean, preventing memory detachments when the frame is constructed inside the WebCodecs hardware encoder.
- **Infinite Spatial Camera Navigation (Pan & Zoom):** Built an intuitive canvas-navigation system directly inside `src/App.tsx` using Zustand state mapping. Users can now zoom in/out (from 10% up to 1000%) using `Ctrl/Cmd + Mouse Wheel` or the zoom controls overlay, and pan the canvas by holding the `Spacebar + Left Click Drag` or utilizing `Middle-Click Drag`.
- **UI Control Inverse Scaling (`--inverse-scale`):** Solved the bug where transform gizmos and overlay toolbars became tiny/blurry or huge when zooming. A dynamic CSS custom variable `--inverse-scale` (computed as `1 / (camera.z * fitScale)`) is calculated on the root viewport. It is applied via CSS transforms (`scale(var(--inverse-scale))`) to the handles in `InteractiveGizmo.tsx` and the `FloatingToolbar.tsx` buttons to keep their interactive physical size constant and accessible at any zoom depth.
- **Full-Screen Gallery Migration:** Eliminated the cramped `LibraryPanel` from the Left Sidebar in `src/App.tsx`. The entire Library tab system (Tipografia, Generativo, Logo, Transição) is now rendered directly inside `src/engines/Library/LibraryPreview.tsx` as a full-page workspace gallery. It includes cloud video autoplay on hover, regional download shortcuts, and single-click timeline composition injection.
- **Container Query Typography Resizing (`cqw`):** Fixed layout scaling bugs where text nodes broke layout alignment or overflowed relative bounds. The typography engine in `TypographyPreview.tsx` now uses container query width units (`cqw`) coupled with `containerType: inline-size` on the target canvas, making letters scale in exact proportion to the canvas resolution.
- **Viewport Layout Polish & Sidebar Cleanup:** Removed the "Config Loaded" status card and debug logs from the sidebar footer to maximize workspace space. Configured flex constraints (`minWidth: 0`, `minHeight: 0`) across the main panels to prevent layout overflow and cropping on smaller desktop monitors.

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

### Phase 3 Completed Tasks
- **SVG Injector:** Fetch + injeção inline de SVGs de `public/assets/svg-generative/`.
- **Noise Engine (Simplex):** Motor de ruído Simplex 2D/3D com driver lifecycle start/stop/tick. Canais: x, y, rotation, scale, opacity.
- **PosterizeTime:** Substituição do ticker GSAP. Callbacks a 8/12/15/24fps com tweens UI a 60fps.

### Phase 2 Completed Tasks
- **GSAP SplitText Integration:** Globally registered the premium SplitText plugin in the GSAP pipeline.
- **GSAP Timeline Factory:** Created a modular engine factory to drive typographic variables.
- **Trail Effect Module:** Implemented dynamic DOM cloning with customizable mix-blend-modes, staggered sweep delays.
- **Typography Control Panel (PT-BR):** Rebuilt sidebar panel with collapsible sections, portal-based tooltips, trail enable/disable toggle.

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
