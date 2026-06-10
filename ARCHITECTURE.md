# Architecture Definition: Client-Side Motion System

## 1. Core Principles
- **Headless Administration:** All global configurations (timings, colors, eases, typography setups) are stored in strictly typed JSON dictionaries under `/src/config/`.
- **DOM to Video Pipeline:** Heavy lifting is done strictly in the browser.
- **Type Safety:** TypeScript is mandatory to prevent runtime failures during generative rendering.
- **Memory Discipline:** Aggressive garbage collection on DOM clones, GSAP instances, and Canvas buffers.
- **Apple Silicon Optimized:** Build tooling and WASM threads configured for ARM64 performance.

## 2. Directory & Path Structure
Maintain strict adherence to this tree to prevent synchronization errors:

```
├── public/
│   ├── assets/
│   │   ├── alpha-movs/       # High-fidelity pre-rendered .MOV files.
│   │   ├── svg-generative/   # Raw SVG files ready for DOM injection.
│   │   └── fonts/            # WOFF2 and OTF formats.
├── src/
│   ├── config/
│   │   ├── global-motion.json  # Bezier curves, posterizeTime master fps, trail logic.
│   │   ├── library.json        # Maps pre-rendered assets.
│   ├── engines/
│   │   ├── Generative/         # SVG parsing, CustomWiggle logic, Ticker manipulation.
│   │   ├── Typography/         # SplitText initialization, Timeline builders, DOM Cloning.
│   ├── export/
│   │   ├── VideoEncoder.ts     # WebCodecs API logic (VP9) + FFmpeg.wasm fallback.
│   │   ├── CanvasCapture.ts    # Logic to snapshot DOM to Canvas at 60fps.
│   ├── store/
│   │   ├── useEditorStore.ts   # Zustand state management (no prop drilling).
│   ├── lib/
│   │   ├── gsap-register.ts    # Single GSAP plugin registration entry point.
│   ├── types/
│   │   ├── motion.types.ts     # Strict TypeScript interfaces for all configs.
│   ├── components/             # React UI components.
│   ├── App.tsx                 # Root application shell.
│   └── main.tsx                # Entry point with GSAP registration.
```

## 3. Import Path Convention
All imports MUST use the `@/` alias mapped to `src/`:
```typescript
// ✅ Correct
import { useEditorStore } from '@/store/useEditorStore';
import motionConfig from '@/config/global-motion.json';

// ❌ Never use relative paths beyond one level
import { useEditorStore } from '../../../store/useEditorStore';
```

## 4. Motion Quality Standards
- **NO linear easing** — all motion uses cubic-bezier curves or GSAP CustomEase.
- **Organic noise only** — wiggles use Simplex Noise, never `Math.random()`.
- **PosterizeTime isolation** — ticker overrides NEVER affect UI responsiveness.
- **Trail cleanup** — every cloned DOM node MUST be destroyed in `useEffect` cleanup.

## 5. Export Pipeline Architecture
```
DOM → Canvas (60fps capture) → WebCodecs VideoEncoder (VP9)
                                      ↓ (fallback)
                               FFmpeg.wasm → PNG Sequence → ZIP
```
- Canvas background MUST be `rgba(0,0,0,0)` for alpha channel preservation.
- COOP/COEP headers required for SharedArrayBuffer (FFmpeg multi-threading).
