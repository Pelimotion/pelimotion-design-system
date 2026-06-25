# Execution Roadmap: Ultra-High-Fidelity Motion Portal

## Phase 1: Environment & Strict Configuration
- [x] Bootstrap Vite + React + TypeScript + SWC.
- [x] Configure Tailwind CSS v4 for a dark-mode, minimalist interface (Vercel/Linear/Bento UI aesthetic). Use `lucide-react` for iconography.
- [x] Establish exact path aliases (`@/`) in `tsconfig.json` and `vite.config.ts` to prevent broken import paths.
- [x] Build the Zustand store and strictly typed interfaces for `/src/config/global-motion.json`.

## Phase 2: The Typographic Engine (Lettering)
- [x] Integrate GSAP `SplitText` to handle dynamic text wrapping and character/word splitting.
- [x] Build the Timeline Factory using GSAP. Expose parameters: `opacity`, `y/x position`, `scale`, and support flat 2D trail aesthetics.
- [x] **The Trail Effect Module:** Create a recursive component that clones the text DOM node. Apply mix-blend-modes and inject staggered delays via GSAP to create the pre-animation trail. Implement robust cleanup to prevent DOM bloat.

## Phase 3: The Generative SVG Engine
- [x] Create the SVG Injector that parses `public/assets/svg-generative/` directly into the DOM tree.
- [x] Implement organic wiggles utilizing Simplex Noise mapped to GSAP variables, controlling Transform (Scale, Rotate, Translate). Expose fine-tuning parameters (Amplitude, Frequency, Opacity wiggles).
- [x] **PosterizeTime Implementation:** Override the default `gsap.ticker`. Create a custom update loop that forces the animation to tick only at specific intervals (e.g., 8fps, 12fps) defined in the configuration.

## Phase 4: Pre-Rendered Asset Management
- [x] Build the UI layer that parses `library.json` and supports local library item addition.
- [x] Implement HTML5 Video players specifically optimized to preview Alpha channels (HEVC for Safari, WebM for Chrome/Edge) with checkerboard transparent background.
- [x] Create direct download handlers and edge cloud synchronization via BunnyCDN storage upload.

## Phase 5: The Client-Side Render Pipeline (Critical Path)
- [x] Integrate a high-performance DOM-to-Canvas library (`html-to-image`) for precise frame-by-frame capture.
- [x] Implement deterministic GSAP timeline scrubbing (`timeline.seek()`) during export to guarantee frame-rate synchronization.
- [x] Integrate `fflate` for client-side synchronous/asynchronous ZIP encoding of PNG sequences.
- [x] Integrate `FFmpeg.wasm` for direct MP4 and MOV (with alpha transparency) encoding in the browser.

## Phase 6: Composition Module, Drag & Drop Timeline & Stability
- [x] **Decoupled Background & Composition Shell:** Migrate aspect ratio, framerate, duration, background video/image/color upload, and controls from Export to the new Composition Panel.
- [x] **Bento Grid Refactoring:** Redesign Editor panels to a premium SaaS Bento Grid interface using thin lines, HSL colors, glassmorphism, and responsive CSS grids.
- [x] **Native Pointer Events Timeline:** Build a custom React drag-and-drop timeline track for compositional layers and background trimming without using external layout drag-and-drop engines.
- [x] **Canvas Compositing Pipeline:** Implement dual-pass rendering (capturing transparent DOM overlay while hiding background video, then compositing them via Canvas API).
- [x] **WebAssembly FFmpeg Optimizations:** Optimize MP4 exports by converting frames to JPEG buffers to avoid browser Out-of-Memory crashes and force even-numbered dimensions for the `libx264` codec.

## Phase 7: Scale Optimization, Dual-Library & WebCodecs (v2.0)
- [x] **Active Viewport Scaling & Gizmo Alignment:** Solved canvas cropping and alignment issues (left-side shift) by implementing a dual-layer CSS scaling container (`#canvas-viewport` + `#canvas-fixed-resolution` via `ResizeObserver`).
- [x] **Dynamic Dual-Library System:** Split library storage into `localLibraryItems` (temporary session-only memory) and `globalLibraryItems` (persistent browser cache via `localStorage`), giving users complete control over template storage.
- [x] **WebCodecs MP4 Export Resolution & Codec Fix:** Fixed MP4 export pipeline failures by forcing even-numbered dimensions (`safeWidth`/`safeHeight` multiples of 2) and configuring precise hardware-accelerated profiles (`avc1.4d0028` and `vp09.00.10.08`).

## Phase 8: Spatial Camera, WebCodecs Hotfix & Layout Polish (v2.1)
- [x] **Spatial Camera Navigation (Pan & Zoom):** Enabled mousewheel zoom (Ctrl/Cmd + scroll) and pan (drag with Spacebar or Middle Click), allowing users to navigate large canvases without cropping.
- [x] **Gizmo & Overlay Scale Normalization:** Created a root CSS variable `--inverse-scale` (1 / finalScale) to maintain constant interactive handle sizes on the `InteractiveGizmo` and `FloatingToolbar` during zooming.
- [x] **Full-Screen Gallery Workspace:** Migrated the asset library from the sidebar to a full-screen grid preview workspace in `LibraryPreview`, rendering high-fidelity cloud videos and local session templates.
- [x] **Container Query Typography Resizing:** Swapped rem font sizing with container query width (`cqw`) units, ensuring that trails and text scale proportionally with the resolution container.
- [x] **WebCodecs Deep Copy Fix:** Resolved the WebCodecs encoder crash by utilizing `createImageBitmap()` to copy frames securely without losing context inside strict browser environments.
- [x] **Sidebar Workspace Optimization:** Removed the "Config Loaded" status card and other debug utilities to maximize vertical editing space.

## Phase 9: Analytics, Lighthouse & Motion Dynamics (v2.2)
- [x] **Motion Easing & Blur Dynamics:** Added elastic GSAP curves (`bounceIn`, `elasticWhip`) and implemented a global CSS motion blur toggle during playback/export for increased "WOW" factor.
- [x] **Local Privacy-First Telemetry:** Created a silent logger (`telemetry.ts`) that records export funnel metrics and WebCodecs fallbacks to localStorage.
- [x] **Automated Lighthouse Validator:** Created a programmatic SEO script (`agent:lighthouse`) to continuously audit layout shifts and Core Web Vitals to maintain a 100/100 score.

## Phase 10: Multi-track Audio Mixing & Export Muxing (v2.3)
- [x] **Multi-track Audio Timeline UI:** Integrated audio tracks into `CompositionTimeline.tsx`, allowing volume adjustments, track trimming, and timeline scheduling.
- [x] **Dynamic WebAudio Sync:** Built play, pause, and seek synchronization for all active audio tracks in `<CompositionPreview />` using the Web Audio API.
- [x] **Offline Audio Mixer (`audioMixer.ts`):** Developed an offline audio context mixer that decodes multiple audio streams, aligns sample rates, and compiles them into a clean 16-bit stereo WAV buffer.
- [x] **Stream Copy Multiplexing (Muxing):** Integrated WAV rendering into the export pipeline (`exportPipeline.ts` & `ffmpegEncoder.ts`), utilizing FFmpeg.wasm to fast-mux the WebCodecs video and mixed audio into a single MP4.

## Phase 11: Advanced Timeline Controls & UI/UX Polish (v2.4)
- [x] **Timeline Horizontal Scale Zoom:** Refactored the track container with scrolling overflow (`overflowX: auto`) and added a slider control (100% to 500% zoom) for high-precision timeline inspection.
- [x] **Layer Locking & Opacity Sliders:** Integrated interactive padlocks (`layer.locked`, `track.locked`) to prevent accidental pointer modifications, and inline range controls to adjust layer opacity in real time.
- [x] **Real-Time Playhead Sync (GSAP Ticker):** Shifted playback tracking to manipulate the DOM directly within `gsap.ticker`, bypassing React rendering paths to guarantee a steady 60fps playhead update.
- [x] **Magnetic Snapping (0.5s Grid):** Added snap-to-grid capabilities to drag-and-drop or visual-trim offsets.
- [x] **Dynamic Audio Fades:** Added inputs for Fade-In and Fade-Out seconds, mapping linear scaling curves during WebAudio playback and offline mixer rendering.
- [x] **Canvas Background Color Selector:** Placed global color input in the timeline toolbar to control background color values.
- [x] **Aspect Ratio Auto-Resolution Mapper:** Connected aspect ratio triggers ('16:9', '9:16', '1:1', '4:5') directly to resolution presets inside the store.
- [x] **One-Click Track Duplication:** Added quick-copy buttons on all track timelines.
- [x] **Playhead Split Tool (Scissors):** Placed split actions on all timeline tracks to slice active segments at the exact playhead position.

## Phase 12: Professional NLE Workflow & Integration Loop (v2.5)
- [x] **Universal Clipboard & Copy-Paste Shortcuts:** Standardized cloning of visual layers, audio tracks, typography layers, and generative elements using `Cmd+C` and `Cmd+V`, pasting them at the current playhead position.
- [x] **Global Keyboard Shortcuts & Focus Handling:** Enabled play/pause via Space, navigation via Arrow Left/Right, delete/backspace deletion, and `Cmd+D`/`Cmd+Shift+D` duplication and splitting.
- [x] **Drag & Drop Local Assets Ingestion:** Supported drag-and-drop file ingestion of images, video, and audio from the local system to generate reactive timeline layers instantly via Object URLs.
- [x] **Timeline Track Color Tags:** Added visual color tags in track controllers to easily categorize media families.
- [x] **Audio Track Solo Control:** Integrated solo state toggles on audio tracks to mutely isolate sound paths in the WebAudio context.
- [x] **Interactive Right-Click Context Menu:** Embedded a custom context-sensitive dropdown menu exposing duplicate, copy, paste, delete, split, lock, and color settings directly on timeline tracks.
- [x] **Magnetic Edge Snapping:** Aligned dragged track start/end offsets to adjacent track borders and the playhead position for frame-precise synchrony.
- [x] **Timeline Viewport Auto-Scrolling:** Built horizontal auto-scroll panning when blocks are dragged/trimmed near viewport edges.
- [x] **Export Pipeline Cancellation:** Programmed periodic check loops checking `isExporting` to abort rendering, throwing `EXPORT_CANCELLED` and cleaning up Web Workers/memory on demand.

## Phase 13: Freemium Safeguards, Test Stability, and Glossary Compliance (v6.2)
- [x] **Strict Glossary Enforcement:** Replaced all occurrences of forbidden terms (such as "Camadas", "Nenhuma camada", and "Adicionar Camada") with compliant alternatives ("Elementos", "Escolha um elemento para começar", "+ Elemento") across all UI files.
- [x] **Watermark Overlay:** Implemented responsive, scale-proportional "Pelimotion" watermark overlay inside `#canvas-fixed-resolution` mapped to container width (`2cqw`) for high-fidelity canvas scale consistency.
- [x] **Lead Capture Email Gate:** Integrated an email capture lead gate modal overlay on the export action (`ExportBar.tsx`) to intercept the first export, storing completion status in `localStorage`.
- [x] **Library Premium Badges & CTAs:** Configured distinct "Studio Lock" visual badges on items marked as premium (`isPremium: true`) and placed a prominent "Upgrade Studio" conversion CTA button in `LibraryModal.tsx`.
- [x] **E2E Test Suite Stability:** Resolved parallel execution race conditions and hydration click lag in `user-journey.spec.ts` using click-retry and dynamic `waitFor` state-checking.

## Phase 15: UX Polish, Undo/Redo & Competitive Features Sprint (v6.3)
- [x] **Undo/Redo History (Cmd+Z / Cmd+Shift+Z):** Implemented full undo/redo stack in Zustand store (`useEditorStore.ts`) with atomic snapshots of layers, compositionLayers, audioTracks, generativeLayers, and typoLayers. Max 50 entries per direction.
- [x] **Keyboard Shortcut Fixes:** Fixed Escape key closing the ShortcutsHUD first before deselecting layers (Suite 10 root-cause fix). Added Cmd+Z/Y handlers.
- [x] **ShortcutsHUD Expansion:** Added Histórico (Undo/Redo) and Edição (Esc, ?) groups to the shortcuts reference panel.
- [x] **MOV Alpha Export Reliability:** Added 15s WebCodecs health-check timeout with automatic FFmpeg.wasm fallback in `exportPipeline.ts`.
- [x] **Library Premium Templates:** Seeded 4 premium templates with locked state blur overlay and video thumbnail previews in `LibraryModal.tsx`.
- [x] **Layer Animations:** CSS pulse/glow keyframes for selected layers in `LayersPanel.tsx` and `index.css`.
- [x] **Reference Background:** Reference image overlay at 30% opacity in `ExportBar.tsx` and `App.tsx`.
- [x] **E2E Suite 10 & 11:** Added keyboard shortcuts HUD and reference background to the automated test suite.

## Phase 16: P2 - Qualidade Competitiva
- [x] **Export MOV com alpha nomeado profissionalmente:** Salvar arquivos com nomes padronizados e profissionais (`pelimotion-asset-[timestamp].mov`).
- [x] **Otimização Core Web Vitals (Lighthouse score ≥ 90):** Auditorias automatizadas via script lighthouse e tags de SEO programático.
- [x] **Landing Page SEO por categoria:** Implementação de tags e agrupamento por nicho de SEO no frontend.
- [x] **Presets de Elementos por Nicho:** Presets organizados na biblioteca do elements-library.
- [x] **Análise de Performance de Render por elemento:** Telemetria integrada de performance e renders com WebCodecs.
- [x] **Prevenção de Drag Text Selection:** Bloqueio de seleção de textos acidentais ao arrastar a timeline/Gizmo.
- [x] **Persistência de Render em Background:** Web Worker bypass para throttling em abas inativas.
- [x] **Seleção Direta no Canvas:** Hit-testing via elementFromPoint sob clique no canvas.
- [x] **Edição de Texto In-Canvas:** Edição direta via contentEditable no duplo clique.
- [ ] **Timeline Playhead & Timecode Sync (Próxima Rodada):** Sincronização e funcionalidade da agulha com o timecode e play/pause.
- [ ] **In-Canvas Text Editing & Smart Selection (Próxima Rodada):** Seleção inteligente e edição dupla-clique in-place no canvas.
- [ ] **Simplified Timeline UX (Próxima Rodada):** Consolidar trilhas e esconder botões repetidos nas tracks.

## Phase 17: Future Expansion (Backlog)
- [ ] **Real-time Server-Side Fallback:** Cloud rendering fallback using headless Puppeteer/Chrome for low-compute devices.
- [ ] **AI-Assisted Composition:** LLM prompts to automatically generate typography wiggles, SVG selections, and timing cues.
- [ ] **BunnyCDN Asset Integration:** Real premium video/audio assets from BunnyCDN with signed URL auth.
