# 🎬 WEB VIDEO EDITOR — ARSENAL COMPLETO 2025/2026
> **Guia de vibe-coding** para editor de vídeo em Vite+React  
> Atualizado: Junho 2026 | Stack: Vite · React · TypeScript · Tailwind  
> Por: Pelimotion Studio — uso interno

---

## ÍNDICE RÁPIDO
1. [Filosofia de Arquitetura](#1-filosofia-de-arquitetura)
2. [Projetos Open Source para Estudar (GOLD)](#2-projetos-open-source-para-estudar-gold)
3. [Core: Video Processing no Browser](#3-core-video-processing-no-browser)
4. [Muxers, Encoders e Parsers](#4-muxers-encoders-e-parsers)
5. [Canvas & Rendering (Preview Engine)](#5-canvas--rendering-preview-engine)
6. [Timeline — O Coração do Editor](#6-timeline--o-coração-do-editor)
7. [Drag & Drop](#7-drag--drop)
8. [Áudio: Processamento e Visualização](#8-áudio-processamento-e-visualização)
9. [State Management](#9-state-management)
10. [UI Components & Design System](#10-ui-components--design-system)
11. [Animação & Motion](#11-animação--motion)
12. [Armazenamento no Browser](#12-armazenamento-no-browser)
13. [Web Workers & Performance](#13-web-workers--performance)
14. [Mídia: Upload, Thumbnails, Proxy](#14-mídia-upload-thumbnails-proxy)
15. [Internacionalização & Teclado](#15-internacionalização--teclado)
16. [AI Integration (Captions, TTS, Script)](#16-ai-integration-captions-tts-script)
17. [Cloud Render & Export Backends](#17-cloud-render--export-backends)
18. [DevTools & DX para o Projeto](#18-devtools--dx-para-o-projeto)
19. [Fonts, Ícones e Assets Visuais](#19-fonts-ícones-e-assets-visuais)
20. [Referências de Arquitetura & Artigos Técnicos](#20-referências-de-arquitetura--artigos-técnicos)
21. [Tendências Cutting-Edge (2026+)](#21-tendências-cutting-edge-2026)

---

## 1. FILOSOFIA DE ARQUITETURA

### O Modelo Mental de um Editor Web Moderno

```
┌──────────────────────────────────────────────────────────┐
│                    CAMADAS DO EDITOR                     │
├──────────────────────────────────────────────────────────┤
│  UI Layer        │ React + shadcn/ui + Tailwind           │
│  State Layer     │ Zustand (global) + Jotai (atomic)      │
│  Timeline Layer  │ dnd-timeline / custom virtualized      │
│  Preview Layer   │ OffscreenCanvas + WebGL/WebGPU shaders │
│  Audio Layer     │ Web Audio API + WaveSurfer.js          │
│  Media Layer     │ WebCodecs API (decode/encode)          │
│  Storage Layer   │ OPFS + IndexedDB (idb-keyval)          │
│  Export Layer    │ WebCodecs Encoder + mp4-muxer          │
│  Worker Layer    │ Web Workers + Comlink                  │
└──────────────────────────────────────────────────────────┘
```

### Regras de Ouro

- **WebCodecs > FFmpeg.wasm** para decode/encode — 3-5x mais rápido, usa hardware
- **OPFS > IndexedDB** para arquivos grandes — filesystem real no browser
- **OffscreenCanvas** para render em worker thread — não bloca UI
- **Zustand** para estado global; atoms (Jotai) para estado de componentes isolados
- **Virtual DOM mínimo** na timeline — use canvas ou virtualização agressiva
- **SharedArrayBuffer + Atomics** para comunicação zero-copy entre workers
- Safari/Firefox **NÃO suportam** WebCodecs para encode — sempre ter fallback server-side
- Exportação client-side: OK para clips curtos (<3min 1080p); acima disso → servidor

---

## 2. PROJETOS OPEN SOURCE PARA ESTUDAR (GOLD)

> **Estes são os repositórios mais importantes.** Leia o código. São referências diretas de como grandes projetos resolvem cada problema.

### 🔴 TIER 1 — Leitura Obrigatória

#### FreeCut (walterlow)
- **GitHub:** https://github.com/walterlow/freecut
- **Stack:** React + TypeScript + Vite + WebGPU + WebCodecs + MediaBunny + shadcn/ui
- **Por que estudar:** NLE profissional completo no browser. Tem: multi-track timeline, keyframe editor, transitions, waveforms, export pipeline, OPFS workspace, compound clips. Usa WebGPU para shaders de efeito. Arquitetura de features em `src/features/`. É o mais avançado atualmente.
- **Estrutura de pastas:**
  ```
  src/
  ├── features/
  │   ├── editor/        # Shell, toolbar, panels
  │   ├── effects/       # Effect registry + UI
  │   ├── export/        # WebCodecs export pipeline
  │   ├── keyframes/     # Graph editor, dopesheet
  │   ├── media-library/ # Import, metadata, proxies
  │   └── timeline/      # Timeline engine
  ```

#### react-video-editor (openvideodev)
- **GitHub:** https://github.com/openvideodev/react-video-editor
- **Stack:** React + WebCodecs + AI (OpenAI, Gemini, ElevenLabs, Deepgram)
- **Por que estudar:** Tem AI Copilot, auto-captions, TTS, multi-track. CapCut/Canva alternative completo. Ver como integram AI na pipeline de edição.

#### FreeCut (DwareLab)
- **GitHub:** https://github.com/DwareLab/freecut-videoeditor
- **Stack:** React + WebCodecs + OPFS + File System Access API
- **Por que estudar:** Versão mais limpa da arquitetura, com bezier curve editor, easing functions, transitions com variantes direcionais.

#### Twick
- **GitHub:** https://github.com/ncounterspecialist/twick
- **npm:** `@twick/studio`, `@twick/timeline`, `@twick/canvas`, `@twick/live-player`
- **Por que estudar:** SDK modular. Pode usar só o `@twick/timeline` ou `@twick/canvas`. MIT license. Boa separação de responsabilidades. Suporta browser export (WebCodecs) e server export.

#### Etro (JavaScript Video Framework)
- **GitHub:** https://github.com/etro-js/etro
- **Stack:** TypeScript, Canvas API
- **Por que estudar:** API de vídeo declarativa — layers, effects, audio. Funciona como uma versão JS do After Effects. Estuda a arquitetura de layers/effects.

### 🟡 TIER 2 — Referência Pontual

| Projeto | GitHub | Estudar Para |
|---------|--------|-------------|
| WebCut | https://github.com/wangrongding/WebCut | WebCodecs puro sem libs externas |
| capcut-web clone | https://github.com/topics/video-editor | Ver pattern de timeline em Vue3 |
| KubeezCut | https://dev.to/sebyx07/i-built-a-free... | WebGPU shaders para efeitos |
| LosslessCut | https://github.com/mifi/lossless-cut | Electron + FFmpeg, ver UX patterns |
| MotionCanvas | https://github.com/motion-canvas/motion-canvas | Animação programática com timeline |
| Remotion | https://github.com/remotion-dev/remotion | React → vídeo, player + render |

---

## 3. CORE: VIDEO PROCESSING NO BROWSER

### WebCodecs API (NATIVO — sem instalar nada)
- **MDN Docs:** https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API
- **Chrome Status:** https://chromestatus.com/feature/5669293909868544
- **Suporte:** Chrome 94+, Edge 94+. Firefox e Safari: **decode parcial apenas**
- **O que faz:** decode/encode de vídeo e áudio com aceleração de hardware (GPU)
- **Key interfaces:** `VideoDecoder`, `VideoEncoder`, `VideoFrame`, `AudioDecoder`, `AudioEncoder`

```typescript
// Decode frames de um vídeo
const decoder = new VideoDecoder({
  output: (videoFrame) => {
    // Desenha no canvas
    ctx.drawImage(videoFrame, 0, 0);
    videoFrame.close(); // OBRIGATÓRIO — evita memory leak
  },
  error: (e) => console.error(e),
});

decoder.configure({
  codec: 'avc1.42001f', // H.264
  codedWidth: 1920,
  codedHeight: 1080,
});
```

### MediaBunny (2025 — O novo padrão)
- **Site:** https://mediabunny.io
- **npm:** `npm install mediabunny`
- **Por que usar:** Substituto moderno do FFmpeg.wasm. Construído em cima de WebCodecs. Streaming de arquivos grandes (2GB+) sem carregar tudo na RAM. Remotion agora recomenda MediaBunny para novos projetos.
- **Features:** Frame-accurate seeking, waveform extraction, thumbnail generation, hardware-accelerated encode/decode, microsecond precision.
- **GitHub topics:** https://github.com/topics/mediabunny

```typescript
import { createMediaSource } from 'mediabunny';

const source = await createMediaSource(file);
const frame = await source.seekToTime(2.5); // seek preciso em segundos
// frame é um VideoFrame nativo
```

### FFmpeg.wasm (Legacy mas ainda muito usado)
- **GitHub:** https://github.com/ffmpegwasm/ffmpeg.wasm
- **npm:** `@ffmpeg/ffmpeg` + `@ffmpeg/core` ou `@ffmpeg/core-mt` (multi-thread)
- **Quando usar:** Conversões de formato, muxing complexo, quando não tem WebCodecs disponível (Safari/Firefox fallback), extração de áudio.
- **Limitação crítica:** 2GB max por arquivo, sem aceleração de GPU.

```typescript
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

const ffmpeg = new FFmpeg();
await ffmpeg.load({
  coreURL: await toBlobURL(`/ffmpeg-core.js`, 'text/javascript'),
  wasmURL: await toBlobURL(`/ffmpeg-core.wasm`, 'application/wasm'),
  workerURL: await toBlobURL(`/ffmpeg-core.worker.js`, 'text/javascript'),
});

await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));
await ffmpeg.exec(['-i', 'input.mp4', '-c', 'copy', 'output.mp4']);
const data = await ffmpeg.readFile('output.mp4');
```

### @remotion/webcodecs (Remotion's WebCodecs wrapper)
- **npm:** `@remotion/webcodecs`
- **Docs:** https://www.remotion.dev/docs/webcodecs
- **Por que:** 3x mais rápido que FFmpeg.wasm em benchmarks. Wrapper de alto nível sobre WebCodecs.

### @remotion/media-parser
- **npm:** `@remotion/media-parser`
- **Docs:** https://www.remotion.dev/docs/media-parser
- **Por que:** Parser de containers de vídeo (MP4, WebM, MKV). Extrai tracks, metadata, duração.

---

## 4. MUXERS, ENCODERS E PARSERS

### mp4-muxer
- **GitHub:** https://github.com/Vanilagy/mp4-muxer
- **npm:** `mp4-muxer`
- **Uso:** Receber frames do `VideoEncoder` (WebCodecs) e montar arquivo MP4. O padrão da indústria para export client-side.
- **Compatível com:** `VideoEncoder`, `AudioEncoder` do WebCodecs

```typescript
import Mp4Muxer from 'mp4-muxer';

const muxer = new Mp4Muxer({
  target: new Mp4Muxer.ArrayBufferTarget(),
  video: { codec: 'avc', width: 1920, height: 1080 },
  audio: { codec: 'aac', sampleRate: 44100, numberOfChannels: 2 },
  fastStart: 'in-memory',
});

// Passa chunks do VideoEncoder
encoder.encode(videoFrame);

// Finaliza
muxer.finalize();
const buffer = muxer.target.buffer; // ArrayBuffer pronto para download
```

### webm-muxer
- **GitHub:** https://github.com/Vanilagy/webm-muxer
- **npm:** `webm-muxer`
- **Quando usar:** Export para WebM (menor, sem licença de codec). Mesmo autor do mp4-muxer.

### mp4box.js
- **GitHub:** https://github.com/gpac/mp4box.js
- **npm:** `mp4box`
- **Uso:** Parser completo de MP4. Extrair tracks, metadata, segmentar para DASH/HLS streaming.

### mux.js
- **GitHub:** https://github.com/videojs/mux.js
- **npm:** `mux.js`
- **Por que:** Transmuxer de TS→MP4 no browser. Usado pelo video.js. Para HLS playback.

---

## 5. CANVAS & RENDERING (PREVIEW ENGINE)

### Konva.js (RECOMENDADO para Preview Canvas)
- **Site:** https://konvajs.org
- **GitHub:** https://github.com/konvajs/konva
- **npm:** `konva` + `react-konva`
- **Por que:** Abstração sobre Canvas 2D com interatividade pronta (drag, resize, rotate). Ideal para camadas de texto, imagens, shapes sobre o frame de vídeo.
- **react-konva:** https://github.com/konvajs/react-konva

```typescript
import { Stage, Layer, Text, Image, Transformer } from 'react-konva';

// Video como layer → Text/Image sobreposto → Transformer para resize
<Stage width={1920} height={1080}>
  <Layer>
    <VideoFrame ref={videoRef} />
    <Text text="TÍTULO" fontSize={48} draggable />
    <Transformer />
  </Layer>
</Stage>
```

### PixiJS (WebGL/WebGPU Renderer — para efeitos avançados)
- **Site:** https://pixijs.com
- **GitHub:** https://github.com/pixijs/pixijs
- **npm:** `pixi.js`
- **Por que:** WebGL/WebGPU por padrão. 60fps mesmo com muitas layers. Suporte a shaders GLSL custom. Usado por Disney, Spotify, GoodGames. v8+ tem WebGPU.
- **@pixi/react:** https://github.com/pixijs/pixi-react

### Fabric.js (Canvas com interatividade — alternativa ao Konva)
- **Site:** http://fabricjs.com
- **GitHub:** https://github.com/fabricjs/fabric.js
- **npm:** `fabric`
- **Por que:** Mais features built-in que Konva (path drawing, SVG import/export, free drawing). Porém mais pesado.

### Three.js (3D e efeitos 3D)
- **Site:** https://threejs.org
- **GitHub:** https://github.com/mrdoob/three.js
- **npm:** `three` + `@types/three`
- **Quando usar:** Transições 3D, títulos em 3D, efeitos de partículas.
- **react-three-fiber:** https://github.com/pmndrs/react-three-fiber

### WebGPU (NATIVO — bleeding edge)
- **API:** `navigator.gpu`
- **Docs:** https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API
- **Quando usar:** Shaders de color grading, LUTs, filtros em tempo real com GPU pura. FreeCut usa WebGPU para todos os efeitos visuais.
- **wgpu (Rust/WASM):** https://github.com/gfx-rs/wgpu

### OffscreenCanvas (Render em Worker)
```typescript
// main.ts
const canvas = document.createElement('canvas');
const offscreen = canvas.transferControlToOffscreen();
worker.postMessage({ canvas: offscreen }, [offscreen]);

// render.worker.ts
self.onmessage = ({ data: { canvas } }) => {
  const ctx = canvas.getContext('2d');
  // Render sem bloquear UI thread
};
```

### react-moveable (Transform gizmo — mover, resize, rotacionar)
- **GitHub:** https://github.com/daybrush/moveable
- **npm:** `react-moveable`
- **Por que:** O gizmo padrão para editors web. Usado em Canva, CapCut web. Handle de resize com snap, ratio lock.

---

## 6. TIMELINE — O CORAÇÃO DO EDITOR

### dnd-timeline (RECOMENDADO — headless)
- **GitHub:** https://github.com/samuelarbibe/dnd-timeline
- **npm:** `dnd-timeline`
- **Por que:** Headless timeline para React, construída sobre `@dnd-kit`. Você traz o CSS. Suporte a multi-track, snap, resize de clips, drag entre tracks.

### @xzdarcy/react-timeline-editor
- **GitHub:** https://github.com/xzdarcy/react-timeline-editor
- **npm:** `@xzdarcy/react-timeline-editor`
- **Por que:** Timeline completa com playhead, zoom, action segments. Muito usado como base em projetos de editor.

### Planby (EPG / Schedule Timeline)
- **Site:** https://planby.netlify.app
- **GitHub:** https://github.com/karolkozer/planby
- **npm:** `planby`
- **Quando usar:** Timelines de broadcast/scheduling. Renderização de alto desempenho para muitos itens.

### Construindo do Zero (Pattern recomendado por seniors)

```typescript
// Virtualização da timeline — só renderiza o que está visível
// Use react-virtual ou @tanstack/react-virtual

import { useVirtualizer } from '@tanstack/react-virtual';

// Cada track é uma row virtual
// Cada clip é um item posicionado por transform: translateX()
// NUNCA use margin-left ou left: X% — use transform para GPU composite
const clipStyle = {
  transform: `translateX(${startPx}px)`,
  width: `${durationPx}px`,
  willChange: 'transform', // hint para browser criar compositing layer
};
```

### Pattern: Ruler / Timecode
```typescript
// Ruler customizado com Canvas — não SVG (SVG é lento para zoom dinâmico)
function drawRuler(ctx: CanvasRenderingContext2D, startTime: number, zoom: number) {
  // Calcular intervalo de marcadores baseado no zoom
  const interval = getTickInterval(zoom); // ex: 1s, 5s, 10s, 1min
  // Desenhar ticks e labels
}
```

---

## 7. DRAG & DROP

### @dnd-kit (PADRÃO — usado por todos grandes projetos)
- **Site:** https://dndkit.com
- **GitHub:** https://github.com/clauderic/dnd-kit
- **npm:** `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities`
- **Por que:** O Atlassian, Linear, e todos usam. Acessível, performático, sem dependências. Suporte a touch, teclado, screen readers.

```typescript
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';

// Clip draggável na timeline
function Clip({ id, clip }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform) }}
      {...listeners} {...attributes}>
      {clip.name}
    </div>
  );
}
```

### @atlaskit/pragmatic-drag-and-drop (Atlassian — para casos complexos)
- **GitHub:** https://github.com/atlassian/pragmatic-drag-and-drop
- **npm:** `@atlaskit/pragmatic-drag-and-drop`
- **Por que:** O que o Jira, Trello, Confluence usam. Menor overhead que dnd-kit em scenarios muito complexos.

### react-dnd (Legacy mas estável)
- **GitHub:** https://github.com/react-dnd/react-dnd
- **npm:** `react-dnd` + `react-dnd-html5-backend`
- **Quando usar:** Projetos legacy ou quando você quer backend customizado (touch, mouse, etc.)

---

## 8. ÁUDIO: PROCESSAMENTO E VISUALIZAÇÃO

### WaveSurfer.js (PADRÃO para waveforms)
- **Site:** https://wavesurfer.xyz
- **GitHub:** https://github.com/katspaugh/wavesurfer.js
- **npm:** `wavesurfer.js` + `@wavesurfer/react`
- **Plugins:** Regions, Timeline, Spectrogram, Minimap, Record, Envelope, Hover
- **Por que:** O padrão. Plugins prontos. Shadow DOM para isolamento de CSS.

```typescript
import WaveSurfer from 'wavesurfer.js';
import Regions from 'wavesurfer.js/dist/plugins/regions.esm.js';

const ws = WaveSurfer.create({
  container: '#waveform',
  waveColor: '#4F4A85',
  progressColor: '#383351',
  plugins: [Regions.create()],
});

ws.load('/audio.mp3');
ws.on('ready', () => {
  // Adicionar regiões de corte
  const regions = ws.getActivePlugins()[0];
  regions.addRegion({ start: 1, end: 3, color: 'rgba(255,0,0,0.2)' });
});
```

### Tone.js (Síntese e processamento de áudio)
- **Site:** https://tonejs.github.io
- **GitHub:** https://github.com/Tonejs/Tone.js
- **npm:** `tone`
- **Quando usar:** Geração de áudio, efeitos (reverb, delay, compressor), scheduling preciso.

### Web Audio API (NATIVO)
- **MDN:** https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- **Por que:** Base de tudo. Grafo de processamento de áudio no browser. Use para: análise de frequência (AnalyserNode), ganho, panning, playback sincronizado.

```typescript
// Extrair waveform data de um arquivo de áudio
async function extractWaveform(file: File, samples = 1000) {
  const arrayBuffer = await file.arrayBuffer();
  const audioCtx = new AudioContext();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  const channelData = audioBuffer.getChannelData(0);
  
  const blockSize = Math.floor(channelData.length / samples);
  const peaks = Array.from({ length: samples }, (_, i) => {
    const block = channelData.slice(i * blockSize, (i + 1) * blockSize);
    return Math.max(...block.map(Math.abs));
  });
  return peaks;
}
```

### peaks.js (BBC — Waveform profissional)
- **GitHub:** https://github.com/bbc/peaks.js
- **npm:** `peaks.js`
- **Por que:** Feito pela BBC. Waveform interativa, multi-channel, zoom, regiões. Mais pesado que WaveSurfer mas mais features pro.

### @miffed/audio-waveform-player
- Para casos simples onde wavesurfer é overkill.

---

## 9. STATE MANAGEMENT

### Zustand (PRINCIPAL — global state do editor)
- **GitHub:** https://github.com/pmndrs/zustand
- **npm:** `zustand`
- **Por que:** Mínimo boilerplate, sem providers, fácil de debugar, performance excelente. Usado em todos os projetos de editor citados.

```typescript
// store/editor.ts — Pattern do FreeCut e react-video-editor
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { temporal } from 'zundo'; // undo/redo

interface EditorState {
  clips: Clip[];
  currentTime: number;
  duration: number;
  selectedIds: Set<string>;
  addClip: (clip: Clip) => void;
  seek: (time: number) => void;
  selectClip: (id: string, multi?: boolean) => void;
}

export const useEditorStore = create<EditorState>()(
  temporal( // undo/redo automático
    immer((set) => ({
      clips: [],
      currentTime: 0,
      duration: 0,
      selectedIds: new Set(),
      addClip: (clip) => set((state) => { state.clips.push(clip); }),
      seek: (time) => set({ currentTime: time }),
      selectClip: (id, multi = false) => set((state) => {
        if (!multi) state.selectedIds.clear();
        state.selectedIds.add(id);
      }),
    }))
  )
);
```

### Jotai (atoms — estado isolado de componentes)
- **GitHub:** https://github.com/pmndrs/jotai
- **npm:** `jotai`
- **Quando usar:** Estado de UI local que precisa ser compartilhado entre componentes (painel de propriedades, inspector, tooltip state).

### Immer (imutabilidade sem boilerplate)
- **GitHub:** https://github.com/immerjs/immer
- **npm:** `immer`
- **Por que:** Escreve mutations diretas, Immer faz o trabalho de criar novo estado imutável. Essencial para state de editor complexo.

### Zundo (Undo/Redo para Zustand)
- **GitHub:** https://github.com/charkour/zundo
- **npm:** `zundo`
- **Por que:** Adiciona histórico temporal ao Zustand com `temporal()`. Suporte a undo/redo com throttle.

### Valtio (Proxy-based — alternativa)
- **GitHub:** https://github.com/pmndrs/valtio
- **npm:** `valtio`
- **Quando usar:** Quando você quer estado mutável com reatividade automática. Mais intuitivo para devs que vêm de Vue.

---

## 10. UI COMPONENTS & DESIGN SYSTEM

### shadcn/ui (BASE PRINCIPAL)
- **Site:** https://ui.shadcn.com
- **GitHub:** https://github.com/shadcn-ui/ui
- **Por que:** Copy-paste, você é dono do código. Tailwind CSS. Dark mode. Radix primitives. O padrão em 2025/2026.
- **Instalação:** `npx shadcn@latest init`
- **Componentes essenciais para editor:** Slider, Dialog, Dropdown, Tooltip, Separator, Toggle, Command (cmd+K palette)

```bash
npx shadcn@latest add slider dialog dropdown-menu tooltip command
npx shadcn@latest add toggle-group separator scroll-area tabs
```

### Radix UI (Primitives headless — base do shadcn)
- **Site:** https://www.radix-ui.com
- **GitHub:** https://github.com/radix-ui/primitives
- **npm:** `@radix-ui/react-*`
- **Por que:** ARIA accessibility automático. Context menus, sliders, tooltips sem esforço. Tudo que shadcn usa por baixo.

```typescript
// Context menu para clip (right-click)
import * as ContextMenu from '@radix-ui/react-context-menu';

<ContextMenu.Root>
  <ContextMenu.Trigger asChild><ClipComponent /></ContextMenu.Trigger>
  <ContextMenu.Content>
    <ContextMenu.Item onClick={splitAtPlayhead}>Split</ContextMenu.Item>
    <ContextMenu.Item onClick={deleteClip}>Delete</ContextMenu.Item>
  </ContextMenu.Content>
</ContextMenu.Root>
```

### Ark UI (Headless — alternativa Radix, sem dependência de Radix)
- **Site:** https://ark-ui.com
- **GitHub:** https://github.com/chakra-ui/ark
- **npm:** `@ark-ui/react`
- **Por que:** Funciona com qualquer framework. Mais componentes que Radix. Melhor manutenção ativa em 2025.

### cmdk (Command Palette)
- **GitHub:** https://github.com/pacocoursey/cmdk
- **npm:** `cmdk`
- **Por que:** O `Cmd+K` que todo editor moderno tem. Busca de comandos, atalhos. Já integrado no shadcn como `<Command>`.

### react-colorful (Color Picker)
- **GitHub:** https://github.com/omgovich/react-colorful
- **npm:** `react-colorful`
- **Por que:** Leve, sem dependências, acessível. Para color picker em text overlay, color grade, etc.

### react-resizable-panels (Split panels — Inspector, Timeline)
- **GitHub:** https://github.com/bvaughn/react-resizable-panels
- **npm:** `react-resizable-panels`
- **Por que:** Os painéis redimensionáveis do estilo Premiere/Resolve. Fácil, sem deps.

```typescript
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

<PanelGroup direction="vertical">
  <Panel defaultSize={60}><PreviewCanvas /></Panel>
  <PanelResizeHandle />
  <Panel defaultSize={40}><Timeline /></Panel>
</PanelGroup>
```

### react-virtuoso (Virtualização de listas — Media Library)
- **GitHub:** https://github.com/petyosi/react-virtuoso
- **npm:** `react-virtuoso`
- **Por que:** Virtualização de listas longas (biblioteca de mídia). Melhor DX que react-window.

### @tanstack/react-virtual (Virtualização de baixo nível)
- **GitHub:** https://github.com/TanStack/virtual
- **npm:** `@tanstack/react-virtual`
- **Por que:** Para virtualização custom da timeline. Controle total sobre o render.

### Aceternity UI (Componentes animados premium — free)
- **Site:** https://ui.aceternity.com
- **Por que:** Componentes com animações incríveis prontas. Para splash screens, onboarding, modais.

### Magic UI (Componentes animados)
- **Site:** https://magicui.design
- **Por que:** Alternativa ao Aceternity. Muitos componentes de loading, progress, efeitos.

---

## 11. ANIMAÇÃO & MOTION

### Motion (Framer Motion — agora independente)
- **Site:** https://motion.dev
- **GitHub:** https://github.com/motiondivision/motion
- **npm:** `motion`
- **Por que:** O padrão absoluto para animação em React. Agora desacoplado do Framer. Layout animations, gestures, scroll animations.

```typescript
import { motion, AnimatePresence } from 'motion/react';

// Clip aparecendo na timeline
<AnimatePresence>
  {visible && (
    <motion.div
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300 }}
    />
  )}
</AnimatePresence>
```

### GSAP (GreenSock — para animações complexas de UI)
- **Site:** https://gsap.com
- **npm:** `gsap`
- **Por que:** O mais performático. Timelines de animação, morphSVG, ScrollTrigger. Usado por Apple, Awwwards sites.
- **Nota:** Free para projetos não-comerciais / uso pessoal. Premium plugins pagos.

### Anime.js (Alternativa open source ao GSAP)
- **GitHub:** https://github.com/juliangarnier/anime
- **npm:** `animejs`
- **Por que:** Leve, gratuito. Timeline de animação, path morphing, SVG.

### @theatre/core + @theatre/studio (Keyframe editor embarcado)
- **Site:** https://www.theatrejs.com
- **GitHub:** https://github.com/theatre-js/theatre
- **npm:** `@theatre/core` + `@theatre/studio`
- **Por que:** Framework de animação com UI de keyframe editor. Pode embutir o studio dentro do próprio editor.

---

## 12. ARMAZENAMENTO NO BROWSER

### OPFS — Origin Private File System (PADRÃO para arquivos grandes)
- **MDN:** https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system
- **Por que:** FileSystem real no browser. Sem limite prático. Acesso síncrono em Workers (via `createSyncAccessHandle()`). Substitui IndexedDB para arquivos binários grandes.
- **Suporte:** Chrome 99+, Firefox 111+, Safari 15.2+

```typescript
// Salvar arquivo de vídeo no OPFS
async function saveToOPFS(file: File) {
  const root = await navigator.storage.getDirectory();
  const dirHandle = await root.getDirectoryHandle('media', { create: true });
  const fileHandle = await dirHandle.getFileHandle(file.name, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(file);
  await writable.close();
}

// Acesso síncrono em Worker (para seek frame-accurate)
// worker.ts
const fileHandle = await dirHandle.getFileHandle('video.mp4');
const syncHandle = await fileHandle.createSyncAccessHandle();
const buffer = new Uint8Array(1024);
syncHandle.read(buffer, { at: byteOffset }); // SÍNCRONO — sem await
```

### idb-keyval (IndexedDB simples)
- **GitHub:** https://github.com/jakearchibald/idb-keyval
- **npm:** `idb-keyval`
- **Quando usar:** Store de configurações, projetos pequenos, thumbnails como blobs.

### idb (IndexedDB completo)
- **GitHub:** https://github.com/jakearchibald/idb
- **npm:** `idb`
- **Quando usar:** Queries mais complexas, índices, transações.

### localforage (Fallback automático)
- **GitHub:** https://github.com/localForage/localForage
- **npm:** `localforage`
- **Por que:** Usa IndexedDB → WebSQL → localStorage automaticamente. Boa para compatibilidade.

---

## 13. WEB WORKERS & PERFORMANCE

### Comlink (Workers com API amigável)
- **GitHub:** https://github.com/GoogleChromeLabs/comlink
- **npm:** `comlink`
- **Por que:** Wrap de Worker com Proxy. Chama funções no worker como se fossem async locais.

```typescript
// decode.worker.ts
import * as Comlink from 'comlink';

const decoder = {
  async decodeFrame(chunk: ArrayBuffer): Promise<ImageBitmap> {
    // WebCodecs decode aqui
    const frame = await decodeWithWebCodecs(chunk);
    return frame;
  }
};
Comlink.expose(decoder);

// main.ts
const worker = new Worker(new URL('./decode.worker.ts', import.meta.url));
const decoderProxy = Comlink.wrap(worker);
const bitmap = await decoderProxy.decodeFrame(chunk); // parece chamada local
```

### SharedArrayBuffer + Atomics (Zero-copy entre workers)
```typescript
// Compartilhar frame buffer entre main thread e worker sem cópia
const sharedBuffer = new SharedArrayBuffer(1920 * 1080 * 4); // RGBA
const pixelArray = new Uint8ClampedArray(sharedBuffer);

// Worker escreve
Atomics.store(pixelArray, 0, 255);

// Main thread lê
const value = Atomics.load(pixelArray, 0);
```

### Vite Worker Support
```typescript
// Vite tem suporte nativo a workers
const worker = new Worker(
  new URL('./workers/decoder.worker.ts', import.meta.url),
  { type: 'module' }
);
```

### requestVideoFrameCallback (Sincronização perfeita de vídeo)
- **MDN:** https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/requestVideoFrameCallback
- **Por que:** Callback chamado exatamente quando um novo frame de vídeo é apresentado. Para render sincronizado de overlays no canvas.

```typescript
video.requestVideoFrameCallback((now, metadata) => {
  // Desenhar overlays no canvas em sync com o frame
  ctx.drawImage(video, 0, 0);
  drawOverlays(metadata.mediaTime);
  video.requestVideoFrameCallback(/* loop */);
});
```

---

## 14. MÍDIA: UPLOAD, THUMBNAILS, PROXY

### FilePond (Upload de mídia — UX premium)
- **Site:** https://pqina.nl/filepond
- **GitHub:** https://github.com/pqina/filepond
- **npm:** `filepond` + `react-filepond`
- **Por que:** Upload com progress, reorder, preview, drag-drop. Design de alta qualidade.

### React Dropzone (Upload simples)
- **GitHub:** https://github.com/react-dropzone/react-dropzone
- **npm:** `react-dropzone`
- **Por que:** Leve, headless. Use quando precisa de upload customizado.

### Geração de Thumbnails (sem lib)
```typescript
// Extrair thumbnail de vídeo em tempo específico
async function extractThumbnail(file: File, time: number): Promise<string> {
  const video = document.createElement('video');
  video.src = URL.createObjectURL(file);
  video.currentTime = time;
  
  await new Promise(res => video.addEventListener('seeked', res, { once: true }));
  
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d')!.drawImage(video, 0, 0);
  
  URL.revokeObjectURL(video.src);
  return canvas.toDataURL('image/jpeg', 0.7);
}

// Para múltiplos thumbnails com WebCodecs (muito mais rápido)
// Ver: @remotion/media-parser + MediaBunny
```

### @uppy/core (Media upload enterprise)
- **Site:** https://uppy.io
- **GitHub:** https://github.com/transloadit/uppy
- **npm:** `@uppy/core`
- **Quando usar:** Upload para S3, Bunny.net, Cloudinary diretamente do browser.

### Bunny.net Storage SDK
- **Docs:** https://docs.bunny.net/docs/storage-api
- **npm:** Não existe SDK oficial; use fetch com a API REST.
- **Pattern para Pelimotion:** Já está configurado via CyberDuck. Para upload direto do editor, use a API de storage:
```typescript
const BUNNY_STORAGE_URL = 'https://storage.bunnycdn.com/pelimotion-zone';
const API_KEY = import.meta.env.VITE_BUNNY_STORAGE_API_KEY;

async function uploadToBunny(file: File, path: string) {
  const response = await fetch(`${BUNNY_STORAGE_URL}/${path}/${file.name}`, {
    method: 'PUT',
    headers: { AccessKey: API_KEY },
    body: file,
  });
  return response.ok;
}
```

---

## 15. INTERNACIONALIZAÇÃO & TECLADO

### tinykeys (Atalhos de teclado)
- **GitHub:** https://github.com/jamiebuilds/tinykeys
- **npm:** `tinykeys`
- **Por que:** 400 bytes. Lida com todos os casos edge de keyboard shortcuts. O padrão para editors.

```typescript
import tinykeys from 'tinykeys';

useEffect(() => {
  return tinykeys(window, {
    'Space':       (e) => { e.preventDefault(); togglePlay(); },
    '$mod+z':      () => undo(),
    '$mod+Shift+z': () => redo(),
    'j':           () => stepBackward(),
    'l':           () => stepForward(),
    'k':           () => pause(),
    'Delete':      () => deleteSelected(),
    'Backspace':   () => deleteSelected(),
    'c':           () => splitAtPlayhead(),
    '$mod+d':      () => duplicateSelected(),
  });
}, []);
```

### @react-aria/interactions (Keyboard management acessível)
- **Site:** https://react-spectrum.adobe.com/react-aria
- **npm:** `@react-aria/interactions`
- **Por que:** Feito pela Adobe. Keyboard, focus, hover management com acessibilidade completa.

---

## 16. AI INTEGRATION (CAPTIONS, TTS, SCRIPT)

### OpenAI SDK (Whisper, GPT, TTS)
- **npm:** `openai`
- **Usos:** Auto-captions via Whisper, script generation via GPT-4o, TTS via `gpt-4o-audio-preview`.

### Deepgram (Transcrição real-time — melhor que Whisper para tempo real)
- **Site:** https://deepgram.com
- **npm:** `@deepgram/sdk`
- **Por que:** Latência baixíssima. Usado pelo react-video-editor para auto-captions.

### ElevenLabs (TTS de alta qualidade)
- **npm:** `@11labs/react`
- **Por que:** A melhor qualidade de voz sintética. Para voiceovers automáticos.

### Replicate (Modelos de AI via API)
- **Site:** https://replicate.com
- **npm:** `replicate`
- **Modelos úteis:**
  - `stability-ai/stable-diffusion` — geração de imagem
  - `anotherjesse/zeroscope-v2-xl` — text-to-video
  - `chenxwh/video-retalking` — lip sync

### Fal.ai (Inference rápido)
- **Site:** https://fal.ai
- **npm:** `@fal-ai/client`
- **Modelos:** Kling, Veo 3, Flux, Imagen 4. Latência muito baixa.

### @xenova/transformers (AI no browser — WebGPU)
- **GitHub:** https://github.com/xenova/transformers.js
- **npm:** `@xenova/transformers`
- **Por que:** Whisper rodando no browser via WebGPU. Transcrição 100% privada sem upload.

```typescript
import { pipeline } from '@xenova/transformers';

const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny');
const result = await transcriber(audioBlob);
console.log(result.text); // Transcrição completa
```

---

## 17. CLOUD RENDER & EXPORT BACKENDS

### Remotion Lambda
- **Docs:** https://www.remotion.dev/docs/lambda
- **Por que:** Render de vídeo no Lambda AWS. Para projetos que usam Remotion como template engine.

### Twick Cloud Functions
- **npm:** `@twick/cloud-*`
- **Por que:** Se estiver usando Twick, o cloud render já é integrado.

### Shotstack (API de render)
- **Site:** https://shotstack.io
- **Quando usar:** Para render server-side sem infraestrutura própria. Paga por render.

### FFmpeg no servidor (Self-hosted)
```bash
# Docker com FFmpeg
FROM jrottenberg/ffmpeg:4.4-alpine
# ou
FROM linuxserver/ffmpeg

# API Express/Fastify que recebe projeto JSON e renderiza
```

### Cloudflare Workers + R2 (Edge render)
- Para tarefas leves de processamento no edge, sem servidor dedicado.

---

## 18. DEVTOOLS & DX PARA O PROJETO

### Vite Config para Editor de Vídeo
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'], // FFmpeg não pode ser pre-bundled
  },
  
  server: {
    headers: {
      // OBRIGATÓRIO para SharedArrayBuffer e algumas APIs de Worker
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  
  build: {
    target: 'esnext', // Para suporte a top-level await, WebCodecs, etc.
    rollupOptions: {
      output: {
        manualChunks: {
          ffmpeg: ['@ffmpeg/ffmpeg'],
          pixi: ['pixi.js'],
          three: ['three'],
        },
      },
    },
  },
});
```

### TypeScript Config
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vite/client"],
    "strict": true
  }
}
```

### Zustand DevTools
```typescript
import { devtools } from 'zustand/middleware';

export const useEditorStore = create<EditorState>()(
  devtools(
    immer((set) => ({ /* ... */ })),
    { name: 'Editor Store' }
  )
);
```

### React DevTools + React Scan
- **React Scan:** https://github.com/aidenybai/react-scan — Detecta re-renders desnecessários visualmente.
- `npm install -D react-scan`

### Bundle Analyzer
- **rollup-plugin-visualizer:** `npm install -D rollup-plugin-visualizer`

### MSW (Mock Service Worker — mocking de API)
- **GitHub:** https://github.com/mswjs/msw
- **npm:** `msw`
- **Por que:** Mockar endpoints de AI (Whisper, etc.) durante desenvolvimento sem custo.

---

## 19. FONTS, ÍCONES E ASSETS VISUAIS

### Ícones

| Lib | npm | Stars | Quando usar |
|-----|-----|-------|-------------|
| **Lucide React** | `lucide-react` | 10k+ | Padrão shadcn. Clean, consistente |
| **Phosphor Icons** | `@phosphor-icons/react` | 3k+ | Mais variedade. 6 pesos |
| **Radix Icons** | `@radix-ui/react-icons` | 3k+ | Minimalista. Perfeito com shadcn |
| **Tabler Icons** | `@tabler/icons-react` | 14k+ | 5500+ ícones. Para menus complexos |
| **Heroicons** | `@heroicons/react` | 20k+ | Feito pelo Tailwind Labs |

### Fonts (para texto overlay no vídeo)

```typescript
// Google Fonts via @fontsource — carrega local, sem CORS, tree-shakeable
// npm install @fontsource/inter @fontsource-variable/inter

import '@fontsource-variable/inter'; // Variable font = 1 arquivo para todos os pesos

// Para o CANVAS — usar FontFace API para garantir carregamento
const font = new FontFace('Inter', 'url(/fonts/inter.woff2)');
await font.load();
document.fonts.add(font);
// Agora canvas pode usar a font
ctx.font = '48px Inter';
```

### Assets Free para Usar em Produção

- **Pexels Video API:** https://www.pexels.com/api — Vídeos e fotos gratuitos com API
- **Unsplash API:** https://unsplash.com/developers — Fotos HD
- **Freesound:** https://freesound.org/apiv2 — SFX e música
- **YouTube Audio Library:** https://studio.youtube.com/channel/music — Música royalty-free
- **FreeSound3:** https://freesound.org — Sons e efeitos
- **ccMixter:** https://ccmixter.org — Música Creative Commons

### Transições e Efeitos (GLSL/CSS)
- **GL Transitions:** https://gl-transitions.com — Transições GLSL open source. Usado em editores profissionais.
- **CSS Filters Reference:** https://developer.mozilla.org/en-US/docs/Web/CSS/filter

---

## 20. REFERÊNCIAS DE ARQUITETURA & ARTIGOS TÉCNICOS

### Artigos Obrigatórios

1. **"Building a video editor completely on the frontend"**  
   https://dev.to/danielfulop/building-a-video-editor-completely-on-the-frontend-ffmpeg-webcodecs-webassembly-and-react-1cfb  
   → Explica o loop de render frame-by-frame com WebCodecs + Canvas + FFmpeg.wasm

2. **"WebCodecs Misconceptions" (Remotion)**  
   https://www.remotion.dev/docs/webcodecs/misconceptions  
   → Desmistifica WebCodecs vs WebAssembly

3. **"Best FFmpeg.wasm Alternatives" (2026)**  
   https://dayverse.id/en/articles/best-ffmpeg-wasm-alternatives-client-side/  
   → Comparativo MediaBunny vs FFmpeg.wasm vs @remotion/webcodecs

4. **"FreeCut — I Built a Browser Video Editor with WebGPU"**  
   https://dev.to/sebyx07/i-built-a-free-browser-video-editor-with-webgpu-webcodecs-optional-ai-generation-2eo0  
   → Arquitetura de um NLE com WebGPU shaders

5. **Chrome DevRel — WebCodecs Samples**  
   https://github.com/w3c/webcodecs/tree/main/samples  
   → Exemplos oficiais de WebCodecs para todos os casos de uso

6. **WebCodecs Explainer (W3C)**  
   https://github.com/w3c/webcodecs/blob/main/explainer.md

7. **OPFS + Web Workers (Jake Archibald)**  
   https://jakearchibald.com/2021/cors/  
   → Entender File System Access API + OPFS

### Padrões de Código

#### Pattern: Clip Data Model
```typescript
interface Clip {
  id: string;           // uuid
  trackId: string;
  type: 'video' | 'audio' | 'image' | 'text' | 'shape';
  
  // Timeline position (em microsegundos — evitar float arithmetic)
  startTime: number;    // posição na timeline
  duration: number;     // duração na timeline
  
  // Mídia source
  sourceStart: number;  // onde no arquivo fonte começa
  sourceDuration: number;
  
  // Transform (para canvas)
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  
  // Efeitos
  effects: Effect[];
  keyframes: KeyframeTrack[];
}
```

#### Pattern: Frame Render Loop
```typescript
class PreviewEngine {
  private rafId: number = 0;
  private isPlaying = false;
  
  startPlayback() {
    this.isPlaying = true;
    const loop = (timestamp: number) => {
      if (!this.isPlaying) return;
      
      this.updateCurrentTime(timestamp);
      this.renderFrame();
      
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }
  
  private renderFrame() {
    const { clips, currentTime } = useEditorStore.getState();
    const ctx = this.canvas.getContext('2d')!;
    
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Renderizar clips visíveis em ordem de z-index
    const visibleClips = clips
      .filter(c => currentTime >= c.startTime && currentTime < c.startTime + c.duration)
      .sort((a, b) => a.zIndex - b.zIndex);
    
    for (const clip of visibleClips) {
      this.renderClip(ctx, clip, currentTime);
    }
  }
}
```

---

## 21. TENDÊNCIAS CUTTING-EDGE (2026+)

### WebGPU para Efeitos em Tempo Real
- Substituindo WebGL para processamento de vídeo
- Shaders WGSL (WebGPU Shading Language) para: LUTs, blur, color grade, chromakey
- Ainda Chrome/Edge only, mas Firefox e Safari implementando em 2026

### AI Native no Editor
- **Transcription no browser:** Whisper via WebGPU (Transformers.js)
- **Background removal:** MediaPipe Selfie Segmentation — https://mediapipe.dev
- **Super resolution:** Real-ESRGAN no browser via WebGPU
- **Scene detection:** Análise de histograma frame-by-frame para auto-cortes

### MediaBunny como Novo Padrão de Fato
- Remotion deprecando próprias libs em favor do MediaBunny
- Streaming de arquivos sem carregar tudo na RAM
- WebCodecs como base, com fallback gracioso

### OPFS + File System Access API como Storage Padrão
- Fim do IndexedDB para arquivos grandes
- Projetos salvos no filesystem do usuário (como apps nativos)
- Sync com cloud via File System Access API

### Compartilhamento de Projeto (CRDT)
- **Yjs:** https://github.com/yjs/yjs — Edição colaborativa de projetos de vídeo
- **Automerge:** https://github.com/automerge/automerge — CRDT para colaboração
- O Descript usa CRDT para edição colaborativa em tempo real

### WebAssembly SIMD + Threads
- FFmpeg.wasm com SIMD (já disponível no Chrome)
- Processamento de áudio paralelo no browser

### Vite 6 + Rolldown (2026)
- Bundler reescrito em Rust (Rolldown) sendo integrado ao Vite
- Cold start ~10x mais rápido para projetos grandes

---

## CHECKLIST DE IMPLEMENTAÇÃO

### MVP (Minimum Viable Editor)
- [ ] Upload de arquivo de vídeo (File API + drag-drop)
- [ ] Preview player com Canvas
- [ ] Timeline básica com 1 track de vídeo
- [ ] Play/Pause com sincronização canvas
- [ ] Trim (definir in/out points)
- [ ] Export via WebCodecs + mp4-muxer
- [ ] Zustand store com undo/redo (zundo)

### V2 — Editor Completo
- [ ] Multi-track (vídeo + áudio + texto)
- [ ] Waveform de áudio (WaveSurfer.js)
- [ ] Thumbnails na timeline (WebCodecs decode)
- [ ] Text overlay com Konva
- [ ] Transições entre clips
- [ ] Biblioteca de mídia (OPFS storage)
- [ ] Atalhos de teclado (tinykeys)
- [ ] Command palette (cmdk)

### V3 — Features Pro
- [ ] Keyframe animation
- [ ] Efeitos de cor (WebGL/WebGPU shaders)
- [ ] Auto-captions (Whisper via Transformers.js)
- [ ] Background removal (MediaPipe)
- [ ] Export server-side para clipes longos
- [ ] Colaboração em tempo real (Yjs)

---

## TABELA DE DECISÃO RÁPIDA

| Problema | Solução Recomendada | Alternativa |
|----------|--------------------|-|
| Decode de vídeo | WebCodecs API | MediaBunny |
| Encode/Export MP4 | WebCodecs + mp4-muxer | FFmpeg.wasm |
| Conversão de formato | FFmpeg.wasm | MediaBunny |
| Preview canvas | Canvas 2D + OffscreenCanvas | Konva.js |
| Efeitos visuais | WebGL / WebGPU | PixiJS |
| Overlay de texto | Konva.js | Fabric.js |
| Timeline drag | dnd-timeline (dnd-kit) | Custom canvas |
| Waveform | WaveSurfer.js | peaks.js (BBC) |
| Estado global | Zustand + Immer | Jotai |
| Undo/Redo | Zundo | immer-history |
| Storage de arquivos | OPFS | IndexedDB + idb |
| Workers | Comlink | Workerize |
| UI Base | shadcn/ui + Radix | Ark UI |
| Drag handles | react-moveable | Konva Transformer |
| Upload | React Dropzone | FilePond |
| Atalhos | tinykeys | @react-aria/interactions |
| AI Transcript | Transformers.js (local) | Deepgram API |

---

*Arquivo mantido por Pelimotion Studio — atualizar a cada sprint*  
*Última atualização: Junho 2026*
