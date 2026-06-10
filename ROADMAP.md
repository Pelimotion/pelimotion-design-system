# Execution Roadmap: Ultra-High-Fidelity Motion Portal

## Phase 1: Environment & Strict Configuration
- [x] Bootstrap Vite + React + TypeScript + SWC.
- [x] Configure Tailwind CSS v4 for a dark-mode, minimalist interface (Vercel/Linear aesthetic). Use `lucide-react` for iconography.
- [x] Establish exact path aliases (`@/`) in `tsconfig.json` and `vite.config.ts` to prevent broken import paths.
- [x] Build the Zustand store and strictly typed interfaces for `/src/config/global-motion.json`.

## Phase 2: The Typographic Engine (Lettering)
- [x] Integrate GSAP `SplitText` to handle dynamic text wrapping and character/word splitting.
- [x] Build the Timeline Factory using GSAP. Expose parameters: `opacity`, `y/x position`, `scale`, and `filter: blur()`.
- [x] **The Trail Effect Module:** Create a recursive component that clones the text DOM node based on `config.instances`. Apply mix-blend-modes and inject staggered delays via GSAP to create the pre-animation trail. Implement robust cleanup to prevent DOM bloat.

## Phase 3: The Generative SVG Engine
- [ ] Create the SVG Injector that parses `public/assets/svg-generative/` directly into the DOM tree.
- [ ] Implement organic wiggles utilizing Simplex Noise mapped to GSAP variables, controlling Transform (Scale, Rotate, Translate). Expose fine-tuning parameters (Amplitude, Frequency).
- [ ] **PosterizeTime Implementation:** Override the default `gsap.ticker`. Create a custom update loop that forces the animation to tick only at specific intervals (e.g., 8fps, 12fps) defined in the configuration.

## Phase 4: Pre-Rendered Asset Management
- [ ] Build the UI layer that parses `library.json`.
- [ ] Implement HTML5 Video players specifically optimized to preview Alpha channels (HEVC for Safari, WebM for Chrome/Edge).
- [ ] Create direct download handlers for the `.MOV` delivery files.

## Phase 5: The Client-Side Render Pipeline (Critical Path)
- [ ] Integrate a high-performance DOM-to-Canvas library (e.g., `modern-screenshot` or heavily optimized `html2canvas-pro`).
- [ ] Implement the `WebCodecs API` as the primary encoder to generate `WebM` with Alpha channel (VP9) directly in-browser.
- [ ] Setup `FFmpeg.wasm` (multi-threaded, optimized for ARM/M-series chips) as a fallback mechanism for rendering PNG sequences in a `.ZIP` file.
