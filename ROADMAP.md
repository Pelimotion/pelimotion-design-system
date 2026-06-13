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
- [x] **Active Viewport Scaling & Gizmo Alignment:** Solved canvas cropping and alignment issues (left-side shift) by implementing a dual-layer CSS scaling container (`#canvas-viewport` + `#canvas-fixed-resolution` via `ResizeObserver`).
- [x] **Dynamic Dual-Library System:** Split library storage into `localLibraryItems` (temporary session-only memory) and `globalLibraryItems` (persistent browser cache via `localStorage`), giving users complete control over template storage.
- [x] **WebCodecs MP4 Export Resolution & Codec Fix:** Fixed MP4 export pipeline failures by forcing even-numbered dimensions (`safeWidth`/`safeHeight` multiples of 2) and configuring precise hardware-accelerated profiles (`avc1.4d0028` and `vp09.00.10.08`).

## Phase 7: Future Expansion (Backlog)
- [ ] **Multi-track Audio Mixing:** Add support for importing and syncing audio tracks directly in the timeline, mixing audio buffers before final WebAssembly encoding.
- [ ] **Real-time Server-Side Fallback:** Establish a cloud rendering fallback (using headless Puppeteer/Chrome instances) for devices with low compute capability.
- [ ] **AI-Assisted Composition:** Integrate LLM prompts directly in the editor to automatically generate typography wiggles, SVG asset selections, and timing cues based on user intent.
