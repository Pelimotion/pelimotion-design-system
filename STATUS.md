# STATUS — Pelimotion Design System

## Active Phase: 🟢 Estabilidade Arquitetural, Encerramento do Massive Loop e Refinamento do Editor (v2.6)

## 🏁 Pelimotion Design System v2.6 — Arquitetura de Ponta Estabilizada

O ciclo autônomo (Massive Loop Phase 20-25) foi oficialmente encerrado. O Pelimotion agora opera com paridade de recursos a editores NLE de desktop profissionais, possuindo gestão de memória blindada e física de arraste com 60fps cravados.

### Session Achievements (v2.6 - Session 12: Bugs, Direct Composition & Layer Controls)
- **BUG 1 — Gizmo Shape Blinking Solved:** Conditional canvas display in `GenerativePreview.tsx` prevents OffscreenCanvas from rendering background circles when colorMode is not tritone.
- **BUG 2 — Timeline Toolbar Width Optimization:** Restructured secondary controls (Resolution, FPS, Background, Duration) in `CompositionTimeline.tsx` to live inside a Settings popover, freeing up ~400px of space to prevent truncation on 1280px screen widths.
- **FEAT 3 — Direct Composition Injection:** Added "Usar na Composição" buttons in both `TypographyPanel.tsx` and `GenerativePanel.tsx` to instantly add created items to the timeline without requiring permanent library storage.
- **FEAT 4 — Contextual Topbar Export:** Embedded a dynamic export CTA button in `TopToolbar.tsx` which changes from "Exportar Frame" (png-still) to "Exportar Vídeo" (mp4) contextually based on the active panel.
- **FEAT 5 — Layer List Interactive Controls:** Added eye (hidden), lock (locked), and track colorTag selectors inside `CompositionPanel.tsx` list items, mirroring properties perfectly to the timeline tracks.
- **GSAP Ticker Playhead Sync:** Playhead now queries Zustand state directly inside high-frequency requestAnimationFrame, eliminating delays.
- **Clean Transitions:** sidebar panels now feature smooth slide-in transitions on tab switches via key-based DOM updates in `App.tsx`.

### Session Achievements (v2.6 - Massive Loop Conclusion)
- **Virtual Auto-Scroll (requestAnimationFrame):** Implementado um motor assíncrono para rolagem infinita da régua do tempo. Quando o mouse atinge a zona de "threshold" (40px) das bordas da tela durante um arraste (drag), a timeline rola automaticamente enquanto recalcula tempos magnéticos de forma invisível.
- **Panic Button & Thread Ejection:** Adicionado cancelamento abrupto de exportação no `ExportPanel.tsx`. Se abortado, o sistema ejetará um erro `EXPORT_CANCELLED` dentro do loop crítico de frames, forçando o término de workers WebCodecs/FFmpeg.wasm para zerar vazamentos de memória (RAM Leaks) e travas no navegador.
- **Encerramento da Malha Autônoma:** Finalização segura dos scripts cronológicos e orquestradores agenticos, cimentando a *codebase* estável atual.

### Session Achievements (v2.5 - Professional NLE Workflow & Integration Loop)
- **Universal Clipboard & Hotkeys (Cmd+C / Cmd+V):** Implemented clipboard state mapping in Zustand. Copy layers or audio tracks with `Cmd+C` and paste them with `Cmd+V` at the current playhead position (`currentTime`).
- **Global Keyboard Shortcuts (`useKeyboardShortcuts.ts`):** Unified keyboard listener handling Space (play/pause), Left/Right Arrows (0.1s playhead seeks), Backspace/Delete (remove active visual layer or audio track), and `Cmd+D`/`Cmd+Shift+D` for duplication and splitting.
- **Drag & Drop Local Assets Ingestion:** Enabled drag-and-drop of local media (images, video, audio) directly onto the editor viewport or library gallery, creating fast local blob object URLs and registering them as active timeline assets without server roundtrips.
- **Timeline Track Color Tags:** Embedded interactive track color tags in `CompositionTimeline.tsx` to visually categorize different layers (e.g. green for audio, purple for typography, blue for generic layers).
- **Audio Track Solo Control:** Integrated solo button toggles on individual audio tracks, muting all other audio layers to isolate audio during playback preview.
- **Right-Click Context Menu:** Built a floating, context-sensitive right-click menu in `CompositionTimeline.tsx` offering easy access to common track commands (Copy, Paste, Cut/Split, Duplicate, Lock, Delete, Color Tag selection).
- **Magnetic Edge Snapping:** Integrated magnetic snapping mechanics, aligning dragged or trimmed block edges (start/end) perfectly to adjacent track boundaries and the active playhead position.
- **Timeline Auto-Scroll on Drag/Trim:** Enhanced track dragging to automatically scroll the timeline view left or right when layers are moved near the left or right screen borders of the timeline viewport.
- **Render Execution Cancellation:** Added continuous cancel polling inside the frame capture loop of `exportPipeline.ts`. The updated `ExportPanel.tsx` replaces the render button with a "Cancel" action during export, allowing immediate termination, throwing `EXPORT_CANCELLED` and safely flushing workers and memory heap to avoid leaks.
- **Robust Telemetry Logging:** Patched type compile errors in `telemetry.ts` and `exportPipeline.ts` by registering new lifecycle event states such as `EXPORT_CANCELLED` and `EXPORT_FAILED`.

### Session Achievements (v2.4 - Advanced Timeline, Playhead Sync & UI/UX Polish)
- **Real-Time Playhead Sync (GSAP Ticker):** Optimized the timeline's playhead by shifting updates to direct DOM style manipulation within `gsap.ticker`. This eliminates React state rendering overhead during playback, achieving a smooth 60fps tracking.
- **Playhead Split Tool (Scissors):** Integrated a split/cut action represented by a `Scissors` icon on track blocks. When clicked, it cuts the active video layer or audio track precisely at the current playhead (`currentTime`), scaling down the duration of the first segment and duplicating the rest as a new aligned track block.
- **Magnetic Snapping (0.5s Grid):** Integrated snapping mechanics on layer dragging and trimming, mapping actions to exact 0.5s increments when the magnet toggle is active.
- **Timeline Horizontal Zoom:** Designed a track multiplier scale slider (100% to 500%) with `overflowX: auto` support, allowing users to zoom in horizontally for micro-frame editing on long timelines.
- **Enforced Layer Locking:** Implemented active padlock states (`layer.locked`, `track.locked`) to dynamically restrict pointer gestures (move and trim) for locked composition or audio layers.
- **Inline Track Opacity Sliders:** Embedded range inputs (0.0 to 1.0) on timeline track items to scale `layer.transform.opacity` in real time.
- **Dynamic Audio Fading:** Added fade-in and fade-out seconds controls directly onto audio tracks, dynamically rendering volume scaling curves during both playback (`AudioEngine.tsx`) and offline mixing.
- **Track Duplication Actions:** Placed copy buttons on both composition and audio tracks, cloning settings with a new ID and automatically offsetting the starting time by `+0.5s`.
- **Global Canvas Background Picker:** Positioned a master background color input within the timeline toolbar, allowing direct color updates to `exportConfig.backgroundColor`.
- **Cleaned Sidebar & Preset Actions:** Cleaned up the Typography panel by removing manual session/global save buttons, routing asset presets to load directly from the library.
- **Multi-track Audio Timeline & UI:** Added support for audio tracks in `CompositionTimeline.tsx`, enabling users to add, visual-trim, adjust volume, and shift starting offsets for multiple concurrent sound assets.
- **Dynamic WebAudio Playback Sync:** Built a robust synchronization mechanism in `<CompositionPreview />` using the Web Audio API. Playback, pausing, and scrubbing on the GSAP global timeline automatically schedules and shifts active audio source nodes to coordinate frame-perfect audio-to-video alignment.
- **Offline Audio Mixer (`audioMixer.ts`):** Developed an in-browser audio mixer that decodes multiple audio streams into buffers, resamples them to a unified project sample rate (typically 44100Hz or 48000Hz), maps their corresponding timelines (offsets, durations, loops), applies volume gain nodes, and merges them into a single high-fidelity, uncompressed WAV file.
- **Hybrid Audio-Video Muxing:** Upgraded `exportPipeline.ts` and `ffmpegEncoder.ts` to multiplex the generated video and mixed audio. When audio tracks are active, the pipeline captures video frames via fast WebCodecs, saves the video container, and then utilizes FFmpeg.wasm to perform a stream copy multiplexing (`-c:v copy -c:a aac`) combining the video and mixed WAV output instantly without re-encoding frames.
- **Strict Compile-Time Safety:** Resolved complex TypeScript errors related to `noUncheckedIndexedAccess` during audio buffering and Float32Array operations by enforcing index safety guards.

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
