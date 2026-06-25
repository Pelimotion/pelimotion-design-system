/**
 * Zustand Editor Store
 * 
 * Central state management for the Pelimotion Design System.
 * Zustand was chosen over React Context because:
 * 1. Selector-based re-renders (no unnecessary component updates)
 * 2. Works outside React (GSAP ticker callbacks need state access)
 * 3. Zero boilerplate — no Provider wrappers needed
 */
import { create } from 'zustand'
import type {
  GlobalMotionConfig,
  LibraryConfig,
  ExportState,
  EditorPanel,
  EasingConfig,
  TrailConfig,
  WiggleConfig,
  TypographyConfig,
  TypographyLayer,
  TypoLayerAnimation,
  TypoLayerTransform,
  TypographyLayoutMode,
  ExportConfig,
  GenerativeLayer,
  LayerTransform,
  LayerColorMode,
  LayerTargetMode,
  LayerOpacityMode,
  CompositionLayer,
  AudioTrack,
} from '@/types/motion.types'
import type { ColorPalette } from '@/config/color-palettes'
import type { UniversalLayer } from '@/types/universalLayers.types'
import type { FeatureFlags } from '@/config/featureFlags'
import { loadFeatureFlags, saveFeatureFlags } from '@/config/featureFlags'
import type { Toast, ToastInput } from '@/types/toast.types'

import globalMotionData from '@/config/global-motion.json'
import libraryData from '@/config/library.json'

// ─── History Types ───────────────────────────────────────────────────────────

interface HistoryEntry {
  layers: UniversalLayer[];
  compositionLayers: CompositionLayer[];
  audioTracks: AudioTrack[];
  generativeLayers: GenerativeLayer[];
  typoLayers: TypographyLayer[];
}

// ─── Store Interface ─────────────────────────────────────────────────────────

interface EditorState {
  // Configuration
  motionConfig: GlobalMotionConfig;
  libraryConfig: LibraryConfig;

  // ─── v3.0 Freemium State ────────────────────────────────────────────────
  /** Editor mode: 'free' = Freemium public, 'pro' = Full NLE */
  editorMode: 'free' | 'pro';
  /** Feature flags for gating Pro features */
  featureFlags: FeatureFlags;
  /** Universal layer system (v3.0) — replaces separate typo/generative in Free mode */
  layers: UniversalLayer[];
  /** Currently selected layer ID */
  selectedLayerId: string | null;
  /** Whether the library modal is open */
  libraryModalOpen: boolean;

  // UI State
  activePanel: EditorPanel;
  sidebarCollapsed: boolean;
  showGizmo: boolean;
  activeAspectRatio: 'none' | '16:9' | '9:16' | '1:1' | '4:5';
  // Increment to force animation rebuild (SplitText re-run)
  animForceKey: number;

  // Typography Layer Selection
  activeTypoLayerId: string | null;

  // Posterize State
  posterizeEnabled: boolean;
  posterizeFps: number;

  // Library State
  activeLibraryAssetId: string | null;
  activeLibraryTab: string;

  // Export Pipeline State
  exportConfig: ExportConfig;
  exportState: ExportState;

  // Generative Layers State (Structured Objects)
  generativeLayers: GenerativeLayer[];
  activeGenerativeLayerId: string | null;
  
  // Local Fonts State
  availableFonts: string[];

  // Composition State
  compositionLayers: CompositionLayer[];
  activeCompositionLayerId: string | null;
  currentTime: number;
  isPlaying: boolean;
  isScrubbing: boolean;

  // Audio State
  audioTracks: AudioTrack[];
  activeAudioTrackId: string | null;

  // Local Library State (Session only)
  localLibraryItems: any[]; // Or LibraryLocalItem[] if imported

  // Global Library State (Persistent)
  globalLibraryItems: any[];

  // Spatial Camera State (Pan/Zoom)
  camera: { x: number; y: number; z: number };

  // Clipboard State (for Copy/Paste)
  clipboard: { type: 'composition' | 'audio' | 'typography' | 'generative'; data: any } | null;

  // Reference Image overlay state
  referenceImage: string | null;
  setReferenceImage: (img: string | null) => void;

  // Keyboard Shortcuts HUD visibility
  showShortcuts: boolean;
  setShowShortcuts: (show: boolean) => void;

  // ─── Toast Notifications ──────────────────────────────────────────────────
  toasts: Toast[];
  showToast: (toast: ToastInput) => string;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;

  // ─── Export Quality Preset ────────────────────────────────────────────────
  exportQualityPreset: 'draft' | 'standard' | 'broadcast';
  setExportQualityPreset: (preset: 'draft' | 'standard' | 'broadcast') => void;


  // ─── Actions ─────────────────────────────────────────────────────────────

  // v3.0 Universal Layer Actions
  addLayer: (layer: UniversalLayer) => void;
  removeLayer: (id: string) => void;
  updateLayer: (id: string, patch: Partial<UniversalLayer>) => void;
  reorderLayers: (fromIndex: number, toIndex: number) => void;
  duplicateLayer: (id: string) => void;
  setSelectedLayerId: (id: string | null) => void;

  // v3.0 Feature Flag Actions
  setFeatureFlag: (flag: keyof FeatureFlags, value: boolean) => void;
  setEditorMode: (mode: 'free' | 'pro') => void;
  setLibraryModalOpen: (open: boolean) => void;

  setCamera: (camera: Partial<{ x: number; y: number; z: number }>) => void;
  resetCamera: () => void;

  saveToLocalLibrary: (item: any) => void;
  removeFromLocalLibrary: (id: string) => void;
  saveToGlobalLibrary: (item: any) => void;
  removeFromGlobalLibrary: (id: string) => void;

  // Config mutations (for headless vibe-coding workflow)
  updateEasing: (easing: Partial<EasingConfig>) => void;
  updateTrail: (trail: Partial<TrailConfig>) => void;
  updateWiggle: (wiggle: Partial<WiggleConfig>) => void;
  updateTypography: (typography: Partial<TypographyConfig>) => void;
  loadTypographyPreset: (presetConfig: Partial<TypographyConfig>) => void;
  applyColorPalette: (palette: ColorPalette, options?: { invert?: boolean }) => void;

  // Typography layer actions
  addTypoLayer: (layer: TypographyLayer) => void;
  removeTypoLayer: (id: string) => void;
  updateTypoLayer: (id: string, patch: Partial<TypographyLayer>) => void;
  updateTypoLayerAnimation: (id: string, patch: Partial<TypoLayerAnimation>) => void;
  updateTypoLayerTransform: (id: string, patch: Partial<TypoLayerTransform>) => void;
  setLayoutMode: (mode: TypographyLayoutMode) => void;
  toggleLinkPosition: () => void;
  toggleLinkAnimation: () => void;
  setActiveTypoLayer: (id: string | null) => void;

  // UI actions
  setActivePanel: (panel: EditorPanel) => void;
  toggleSidebar: () => void;
  toggleGizmo: () => void;
  setAspectRatio: (ratio: 'none' | '16:9' | '9:16' | '1:1' | '4:5') => void;
  incrementAnimKey: () => void;
  setActiveLibraryAssetId: (id: string | null) => void;
  setActiveLibraryTab: (tab: string) => void;

  // Generative actions
  addGenerativeLayer: (layer: GenerativeLayer) => void;
  removeGenerativeLayer: (id: string) => void;
  clearGenerativeLayers: () => void;
  setActiveGenerativeLayerId: (id: string | null) => void;
  updateLayerTransform: (id: string, transform: Partial<LayerTransform>) => void;
  updateLayerOpacityMode: (id: string, mode: LayerOpacityMode) => void;
  updateLayerShapeProps: (id: string, props: any) => void;
  updateLayerAppearance: (id: string, appearance: {
    colorMode?: LayerColorMode;
    colors?: string[];
    targetMode?: LayerTargetMode;
    opacityMode?: LayerOpacityMode;
  }) => void;
  updateGenerativeLayerWiggle: (id: string, wiggle: Partial<WiggleConfig>) => void;
  updateGenerativeLayerAnimation: (id: string, animation: Partial<GenerativeLayer['animation']>) => void;

  // Clipboard Actions
  setClipboard: (item: { type: 'composition' | 'audio' | 'typography' | 'generative'; data: any } | null) => void;

  // Posterize actions
  togglePosterize: () => void;
  setPosterizeFps: (fps: number) => void;

  // Export actions
  updateExportConfig: (config: Partial<ExportConfig>) => void;
  setExportState: (state: Partial<ExportState>) => void;
  resetExport: () => void;

  // Composition Actions
  addCompositionLayer: (layer: CompositionLayer) => void;
  removeCompositionLayer: (id: string) => void;
  updateCompositionLayer: (id: string, patch: Partial<CompositionLayer>) => void;
  setActiveCompositionLayerId: (id: string | null) => void;
  reorderCompositionLayers: (startIndex: number, endIndex: number) => void;
  seek: (time: number) => void;
  togglePlayback: () => void;
  setScrubbing: (scrubbing: boolean) => void;

  // Audio Actions
  addAudioTrack: (track: AudioTrack) => void;
  removeAudioTrack: (id: string) => void;
  updateAudioTrack: (id: string, patch: Partial<AudioTrack>) => void;
  
  restoreState: (payload: any) => void;
  setActiveAudioTrackId: (id: string | null) => void;

  // History (Undo / Redo)
  history: { past: HistoryEntry[]; future: HistoryEntry[] };
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Local Font actions
  fetchLocalFonts: () => Promise<void>;
}

// ─── Initial Export State ────────────────────────────────────────────────────

const initialExportState: ExportState = {
  isExporting: false,
  progress: 0,
  currentFrame: 0,
  totalFrames: 0,
  stage: 'idle',
  exportMode: 'ffmpeg-fallback',
}

// ─── Helper: Sync legacy fields from title layer ─────────────────────────────

function syncLegacyFields(typo: TypographyConfig): Partial<TypographyConfig> {
  const t = typo.layers[0];
  if (!t) return {};
  return {
    splitMode: t.animation.splitMode,
    defaultStagger: t.animation.entryStagger,
    defaultDuration: t.animation.entryDuration,
    defaultEase: t.animation.entryEase as keyof EasingConfig,
    fontFamily: t.fontFamily,
    fontWeight: t.fontWeight,
    letterSpacing: t.letterSpacing,
    textTransform: t.textTransform as 'uppercase' | 'lowercase' | 'none',
    exitDuration: t.animation.exitDuration,
    idleMotion: t.animation.idleMotion as 'none' | 'scaleUp' | 'panX' | 'panY',
    idleSpeed: t.animation.idleSpeed,
    color: t.color,
    lineHeight: t.lineHeight,
    fontStyle: t.fontStyle,
  };
}

// ─── History Helpers ────────────────────────────────────────────────────────

function snapshotState(state: EditorState): HistoryEntry {
  return {
    layers: JSON.parse(JSON.stringify(state.layers)),
    compositionLayers: JSON.parse(JSON.stringify(state.compositionLayers)),
    audioTracks: JSON.parse(JSON.stringify(state.audioTracks)),
    generativeLayers: JSON.parse(JSON.stringify(state.generativeLayers)),
    typoLayers: JSON.parse(JSON.stringify(state.motionConfig.typography.layers)),
  };
}

function pushToHistory(
  history: { past: HistoryEntry[]; future: HistoryEntry[] },
  snapshot: HistoryEntry
) {
  return { past: [...history.past.slice(-49), snapshot], future: [] };
}

function applySnapshot(state: EditorState, snapshot: HistoryEntry): Partial<EditorState> {
  return {
    layers: snapshot.layers,
    compositionLayers: snapshot.compositionLayers,
    audioTracks: snapshot.audioTracks,
    generativeLayers: snapshot.generativeLayers,
    motionConfig: {
      ...state.motionConfig,
      typography: { ...state.motionConfig.typography, layers: snapshot.typoLayers },
    },
    selectedLayerId: null,
    activeCompositionLayerId: null,
    activeAudioTrackId: null,
    animForceKey: state.animForceKey + 1,
  };
}

// ─── Store Creation ──────────────────────────────────────────────────────────

const rawMotionData = globalMotionData as any;
const initialMotionConfig: GlobalMotionConfig = {
  ...rawMotionData,
  typography: {
    ...rawMotionData.typography,
    layers: [
      { ...rawMotionData.typography.titleLayer, id: 'title', name: 'Título', trail: rawMotionData.trail },
      { ...rawMotionData.typography.subtitleLayer, id: 'subtitle', name: 'Subtítulo', trail: { ...rawMotionData.trail, enabled: false } }
    ]
  }
};

export const useEditorStore = create<EditorState>((set, get) => ({
  // Load configs from JSON at initialization
  motionConfig: initialMotionConfig,
  libraryConfig: libraryData as LibraryConfig,

  // ─── v3.0 Freemium State ────────────────────────────────────────────────
  editorMode: 'free',
  featureFlags: loadFeatureFlags(),
  layers: [],
  selectedLayerId: null,
  libraryModalOpen: false,
  referenceImage: null,
  showShortcuts: false,
  history: { past: [], future: [] },

  // Toast state
  toasts: [],

  // Export quality preset
  exportQualityPreset: 'standard',


  // Default UI state
  activePanel: 'typography',
  sidebarCollapsed: false,
  showGizmo: true,
  activeAspectRatio: 'none' as 'none' | '16:9' | '9:16' | '1:1' | '4:5',
  animForceKey: 0,

  // Typography active layer
  activeTypoLayerId: 'title',

  // Posterize defaults from config
  posterizeEnabled: false,
  posterizeFps: globalMotionData.posterizeTime.masterFps,

  // Library default state
  activeLibraryAssetId: null,
  activeLibraryTab: 'Tipografia',

  // Generative default state
  generativeLayers: [],
  activeGenerativeLayerId: null,

  // Export pipeline
  exportConfig: {
    resolution: '1920x1080',
    fps: 60,
    duration: 5,
    format: 'png-sequence',
    stillFrame: 0,
    backgroundColor: '#000000', // Default black background
    aspectRatioMode: 'fit',
    overlayScale: 1,
    overlayX: 0,
    overlayY: 0,
    bgTrimStart: 0,
    bgTrimEnd: 0,
    enableMotionBlur: false,
  },
  exportState: initialExportState,

  // Local fonts cache
  availableFonts: [],

  // Composition initial state
  compositionLayers: [],
  activeCompositionLayerId: null,
  currentTime: 0,
  isPlaying: false,
  isScrubbing: false,

  // Audio initial state
  audioTracks: [],
  activeAudioTrackId: null,

  // Local Library State (Session only)
  localLibraryItems: [],

  // Global Library State
  globalLibraryItems: (() => {
    try {
      const saved = localStorage.getItem('pelimotion_global_library');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    // Seed default free and premium/studio items
    return [
      {
        id: 'mock-bg-1',
        name: 'Cyberpunk Neon Horizon',
        type: 'image',
        createdAt: Date.now(),
        data: 'https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?q=80&w=300',
        isPremium: true
      },
      {
        id: 'mock-bg-2',
        name: 'Minimalist Abstract Liquid',
        type: 'image',
        createdAt: Date.now(),
        data: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300',
        isPremium: false
      },
      {
        id: 'mock-vid-1',
        name: 'Slow Motion Smoke Overlay',
        type: 'video',
        createdAt: Date.now(),
        data: '',
        isPremium: true
      },
      {
        id: 'mock-aud-1',
        name: 'Cinematic Ambient Pad',
        type: 'audio',
        createdAt: Date.now(),
        data: '',
        isPremium: false
      }
    ];
  })(),

  // Spatial Camera
  camera: { x: 0, y: 0, z: 1 },

  // Clipboard
  clipboard: null,

  // ─── Actions Implementation ──────────────────────────────────────────────

  // ─── v3.0 Universal Layer Actions ────────────────────────────────────────

  addLayer: (layer) => set((state) => {
    const snapshot = snapshotState(state);
    return {
      history: pushToHistory(state.history, snapshot),
      layers: [...state.layers, { ...layer, zIndex: state.layers.length }],
      selectedLayerId: layer.id,
      animForceKey: state.animForceKey + 1,
    };
  }),

  removeLayer: (id) => set((state) => {
    const snapshot = snapshotState(state);
    return {
      history: pushToHistory(state.history, snapshot),
      layers: state.layers.filter(l => l.id !== id).map((l, i) => ({ ...l, zIndex: i })),
      selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId,
    };
  }),

  updateLayer: (id, patch) => set((state) => ({
    layers: state.layers.map(l => l.id === id ? { ...l, ...patch } : l),
  })),

  reorderLayers: (fromIndex, toIndex) => set((state) => {
    const result = Array.from(state.layers);
    const [removed] = result.splice(fromIndex, 1);
    if (removed) {
      result.splice(toIndex, 0, removed);
    }
    return { layers: result.map((l, i) => ({ ...l, zIndex: i })) };
  }),

  duplicateLayer: (id) => set((state) => {
    const source = state.layers.find(l => l.id === id);
    if (!source) return state;
    const snapshot = snapshotState(state);
    const clone: UniversalLayer = {
      ...JSON.parse(JSON.stringify(source)),
      id: crypto.randomUUID(),
      name: `${source.name} (cópia)`,
      zIndex: state.layers.length,
    };
    return {
      history: pushToHistory(state.history, snapshot),
      layers: [...state.layers, clone],
      selectedLayerId: clone.id,
      animForceKey: state.animForceKey + 1,
    };
  }),

  setSelectedLayerId: (id) => set({ selectedLayerId: id, showGizmo: !!id }),

  // ─── v3.0 Feature Flag Actions ──────────────────────────────────────────

  setFeatureFlag: (flag, value) => set((state) => {
    const newFlags = { ...state.featureFlags, [flag]: value };
    saveFeatureFlags(newFlags);
    return { featureFlags: newFlags };
  }),

  setEditorMode: (mode) => set({ editorMode: mode }),

  setLibraryModalOpen: (open) => set({ libraryModalOpen: open }),

  // ─── Camera & Clipboard ─────────────────────────────────────────────────

  setCamera: (camera) => set((state) => ({ camera: { ...state.camera, ...camera } })),
  resetCamera: () => set({ camera: { x: 0, y: 0, z: 1 } }),

  setClipboard: (item) => set({ clipboard: item }),

  setReferenceImage: (img) => set({ referenceImage: img }),
  setShowShortcuts: (show) => set({ showShortcuts: show }),


  saveToLocalLibrary: (item: any) =>
    set((state) => ({
      localLibraryItems: [...state.localLibraryItems, item],
    })),

  removeFromLocalLibrary: (id: string) =>
    set((state) => ({
      localLibraryItems: state.localLibraryItems.filter((i) => i.id !== id),
    })),

  saveToGlobalLibrary: (item: any) =>
    set((state) => {
      const newItems = [...state.globalLibraryItems, item];
      try {
        localStorage.setItem('pelimotion_global_library', JSON.stringify(newItems));
      } catch (e) {
        console.error('Failed to save to global library', e);
      }
      return { globalLibraryItems: newItems };
    }),

  removeFromGlobalLibrary: (id: string) =>
    set((state) => {
      const newItems = state.globalLibraryItems.filter((i) => i.id !== id);
      try {
        localStorage.setItem('pelimotion_global_library', JSON.stringify(newItems));
      } catch (e) {
        console.error('Failed to save to global library', e);
      }
      return { globalLibraryItems: newItems };
    }),

  updateEasing: (easing) =>
    set((state) => ({
      motionConfig: {
        ...state.motionConfig,
        easing: { ...state.motionConfig.easing, ...easing },
      },
    })),

  updateTrail: (trailPatch) =>
    set((state) => {
      const activeId = state.activeTypoLayerId;
      if (!activeId) return state;
      const newLayers = state.motionConfig.typography.layers.map(l => {
        if (l.id === activeId) {
          const currentTrail = l.trail || state.motionConfig.trail;
          return { ...l, trail: { ...currentTrail, ...trailPatch } };
        }
        return l;
      });
      return {
        motionConfig: {
          ...state.motionConfig,
          typography: { ...state.motionConfig.typography, layers: newLayers },
        },
      };
    }),

  updateWiggle: (wiggle) =>
    set((state) => ({
      motionConfig: {
        ...state.motionConfig,
        wiggle: { ...state.motionConfig.wiggle, ...wiggle },
      },
    })),

  updateTypography: (typography) =>
    set((state) => ({
      motionConfig: {
        ...state.motionConfig,
        typography: { ...state.motionConfig.typography, ...typography },
      },
    })),

  loadTypographyPreset: (presetConfig) =>
    set((state) => {
      const newTypography = { ...state.motionConfig.typography, ...presetConfig };
      // Safely reset the active layer id to the first layer of the new preset
      const firstLayer = presetConfig.layers?.[0];
      const newActiveId = firstLayer ? firstLayer.id : state.activeTypoLayerId;
      
      return {
        motionConfig: {
          ...state.motionConfig,
          typography: newTypography,
        },
        activeTypoLayerId: newActiveId,
        // Increment anim key to rebuild GSAP timelines with the new layout
        animForceKey: state.animForceKey + 1,
      };
    }),

  applyColorPalette: (palette, options) =>
    set((state) => {
      const pPrimary = options?.invert ? palette.secondary : palette.primary;
      const pSecondary = options?.invert ? palette.primary : palette.secondary;
      
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        // Set canvas scoped variables instead of global app theme
        // Background is now explicitly ignored here (controlled by Composition panel)
        root.style.setProperty('--canvas-primary', pPrimary);
        root.style.setProperty('--canvas-secondary', pSecondary);
        root.style.setProperty('--canvas-accent', palette.accent);
      }

      // Update Typography Layers
      const newTypoLayers = state.motionConfig.typography.layers.map((l, i) => {
        const color = i === 0 ? pPrimary : pSecondary;
        const trailColor = palette.accent;
        return {
          ...l,
          color,
          trail: l.trail ? { ...l.trail, trailColor, style: l.trail.style === 'blur' ? 'solid' : l.trail.style } : undefined,
        };
      });

      // Update Generative Layers if applicable
      const newGenLayers = state.generativeLayers.map((l) => {
        return {
          ...l,
          colors: [pPrimary, pSecondary]
        };
      });

      return {
        motionConfig: {
          ...state.motionConfig,
          // Removed canvas background override to respect composition settings
          trail: { 
            ...state.motionConfig.trail, 
            trailColor: palette.accent,
            style: state.motionConfig.trail.style === 'blur' ? 'solid' : state.motionConfig.trail.style 
          },
          typography: { ...state.motionConfig.typography, layers: newTypoLayers },
        },
        generativeLayers: newGenLayers,
        animForceKey: state.animForceKey + 1,
      };
    }),

  // ─── Typography Layer Actions ──────────────────────────────────────────

  addTypoLayer: (layer) =>
    set((state) => {
      const snapshot = snapshotState(state);
      return {
        history: pushToHistory(state.history, snapshot),
        motionConfig: {
          ...state.motionConfig,
          typography: {
            ...state.motionConfig.typography,
            layers: [...state.motionConfig.typography.layers, layer],
          },
        },
        activeTypoLayerId: layer.id,
      };
    }),

  removeTypoLayer: (id) =>
    set((state) => {
      const snapshot = snapshotState(state);
      return {
        history: pushToHistory(state.history, snapshot),
        motionConfig: {
          ...state.motionConfig,
          typography: {
            ...state.motionConfig.typography,
            layers: state.motionConfig.typography.layers.filter(l => l.id !== id),
          },
        },
        activeTypoLayerId: state.activeTypoLayerId === id ? null : state.activeTypoLayerId,
      };
    }),

  updateTypoLayer: (id, patch) =>
    set((state) => {
      const newLayers = state.motionConfig.typography.layers.map(l =>
        l.id === id ? { ...l, ...patch } : l
      );
      const newTypo = { ...state.motionConfig.typography, layers: newLayers };
      Object.assign(newTypo, syncLegacyFields(newTypo));
      return {
        motionConfig: { ...state.motionConfig, typography: newTypo },
      };
    }),

  updateTypoLayerAnimation: (id, patch) =>
    set((state) => {
      const newLayers = state.motionConfig.typography.layers.map(l =>
        l.id === id ? { ...l, animation: { ...l.animation, ...patch } } : l
      );
      const newTypo = { ...state.motionConfig.typography, layers: newLayers };
      Object.assign(newTypo, syncLegacyFields(newTypo));
      return {
        motionConfig: { ...state.motionConfig, typography: newTypo },
      };
    }),

  updateTypoLayerTransform: (id, patch) =>
    set((state) => {
      const linked = state.motionConfig.typography.linkPosition;
      const newLayers = state.motionConfig.typography.layers.map(l => {
        if (l.id === id) {
          return { ...l, transform: { ...l.transform, ...patch } };
        }
        if (linked) {
          return { ...l, transform: { ...l.transform, ...patch } };
        }
        return l;
      });
      return {
        motionConfig: {
          ...state.motionConfig,
          typography: {
            ...state.motionConfig.typography,
            layers: newLayers,
          },
        },
      };
    }),

  setLayoutMode: (mode) =>
    set((state) => ({
      motionConfig: {
        ...state.motionConfig,
        typography: { ...state.motionConfig.typography, layoutMode: mode },
      },
    })),

  toggleLinkPosition: () =>
    set((state) => ({
      motionConfig: {
        ...state.motionConfig,
        typography: {
          ...state.motionConfig.typography,
          linkPosition: !state.motionConfig.typography.linkPosition,
        },
      },
    })),

  toggleLinkAnimation: () =>
    set((state) => ({
      motionConfig: {
        ...state.motionConfig,
        typography: {
          ...state.motionConfig.typography,
          linkAnimation: !state.motionConfig.typography.linkAnimation,
        },
      },
    })),

  setActiveTypoLayer: (id) => set({ activeTypoLayerId: id }),

  // ─── Core UI Actions ───────────────────────────────────────────────────
  setActivePanel: (panel) => set((state) => {
    // Reset camera when changing panels to avoid getting lost
    if (state.activePanel !== panel) {
      return { activePanel: panel, camera: { x: 0, y: 0, z: 1 } };
    }
    return { activePanel: panel };
  }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toggleGizmo: () => set((state) => ({ showGizmo: !state.showGizmo })),
  setAspectRatio: (ratio) => set((state) => {
    let resolution = state.exportConfig.resolution;
    if (ratio === '16:9') resolution = '1920x1080';
    if (ratio === '9:16') resolution = '1080x1920';
    if (ratio === '1:1') resolution = '1080x1080';
    if (ratio === '4:5') resolution = '1350x1080';
    return { 
      activeAspectRatio: ratio,
      exportConfig: { ...state.exportConfig, resolution }
    };
  }),
  incrementAnimKey: () => set((state) => ({ animForceKey: state.animForceKey + 1 })),
  setActiveLibraryAssetId: (id) => set({ activeLibraryAssetId: id }),
  setActiveLibraryTab: (tab) => set({ activeLibraryTab: tab }),

  // ─── Generative Actions ────────────────────────────────────────────────

  addGenerativeLayer: (layer: GenerativeLayer) => set((state) => {
    const snapshot = snapshotState(state);
    return {
      history: pushToHistory(state.history, snapshot),
      generativeLayers: [...state.generativeLayers, layer],
      activeGenerativeLayerId: layer.id,
    };
  }),
  removeGenerativeLayer: (id) => set((state) => {
    const snapshot = snapshotState(state);
    return {
      history: pushToHistory(state.history, snapshot),
      generativeLayers: state.generativeLayers.filter(l => l.id !== id),
      activeGenerativeLayerId: state.activeGenerativeLayerId === id ? null : state.activeGenerativeLayerId,
    };
  }),
  clearGenerativeLayers: () => set({ generativeLayers: [], activeGenerativeLayerId: null }),
  setActiveGenerativeLayerId: (id) => set({ activeGenerativeLayerId: id }),
  updateLayerTransform: (id, transform) => set((state) => ({
    generativeLayers: state.generativeLayers.map(l => 
      l.id === id ? { ...l, transform: { ...l.transform, ...transform } } : l
    )
  })),
  updateLayerOpacityMode: (id, mode) => set((state) => ({
    generativeLayers: state.generativeLayers.map(l => 
      l.id === id ? { ...l, opacityMode: mode } : l
    )
  })),
  updateLayerShapeProps: (id, props) => set((state) => ({
    generativeLayers: state.generativeLayers.map(l => 
      l.id === id ? { ...l, shapeProps: { ...l.shapeProps, ...props } } : l
    )
  })),
  updateLayerAppearance: (id, appearance) => set((state) => ({
    generativeLayers: state.generativeLayers.map(l =>
      l.id === id ? { ...l, ...appearance } : l
    )
  })),
  updateGenerativeLayerWiggle: (id, wiggle) => set((state) => ({
    generativeLayers: state.generativeLayers.map(l =>
      l.id === id ? { ...l, wiggle: { ...l.wiggle, ...wiggle } } : l
    )
  })),
  updateGenerativeLayerAnimation: (id, animation) => set((state) => ({
    generativeLayers: state.generativeLayers.map(l =>
      l.id === id ? { ...l, animation: { ...l.animation, ...animation } as any } : l
    )
  })),

  // ─── Posterize Actions ─────────────────────────────────────────────────

  togglePosterize: () => set((state) => ({ posterizeEnabled: !state.posterizeEnabled })),
  setPosterizeFps: (fps) => set({ posterizeFps: fps }),

  // ─── Export Actions ────────────────────────────────────────────────────

  updateExportConfig: (configUpdate) =>
    set((state) => ({
      exportConfig: { ...state.exportConfig, ...configUpdate },
    })),

  setExportState: (exportUpdate) =>
    set((state) => ({
      exportState: { ...state.exportState, ...exportUpdate },
    })),

  resetExport: () => set({ exportState: initialExportState }),

  // ─── Composition Actions ───────────────────────────────────────────────

  addCompositionLayer: (layer) =>
    set((state) => {
      const snapshot = snapshotState(state);
      return {
        history: pushToHistory(state.history, snapshot),
        compositionLayers: [...state.compositionLayers, layer],
        activeCompositionLayerId: layer.id,
      };
    }),

  removeCompositionLayer: (id) =>
    set((state) => {
      const snapshot = snapshotState(state);
      return {
        history: pushToHistory(state.history, snapshot),
        compositionLayers: state.compositionLayers.filter((l) => l.id !== id),
        activeCompositionLayerId: state.activeCompositionLayerId === id ? null : state.activeCompositionLayerId,
      };
    }),

  updateCompositionLayer: (id, patch) =>
    set((state) => ({
      compositionLayers: state.compositionLayers.map((l) =>
        l.id === id ? { ...l, ...patch } : l
      ),
    })),

  setActiveCompositionLayerId: (id) => set({ activeCompositionLayerId: id, showGizmo: !!id }),

  reorderCompositionLayers: (startIndex, endIndex) =>
    set((state) => {
      const result = Array.from(state.compositionLayers);
      const [removed] = result.splice(startIndex, 1);
      if (removed) {
        result.splice(endIndex, 0, removed);
      }
      return { compositionLayers: result };
    }),

  seek: (time) => set({ currentTime: time }),
  
  togglePlayback: () => set((state) => ({ isPlaying: !state.isPlaying })),

  setScrubbing: (scrubbing) => set({ isScrubbing: scrubbing }),

  // ─── Audio Actions ─────────────────────────────────────────────────────

  addAudioTrack: (track) =>
    set((state) => {
      const snapshot = snapshotState(state);
      return {
        history: pushToHistory(state.history, snapshot),
        audioTracks: [...state.audioTracks, track],
        activeAudioTrackId: track.id,
      };
    }),

  removeAudioTrack: (id) =>
    set((state) => {
      const snapshot = snapshotState(state);
      return {
        history: pushToHistory(state.history, snapshot),
        audioTracks: state.audioTracks.filter((t) => t.id !== id),
        activeAudioTrackId: state.activeAudioTrackId === id ? null : state.activeAudioTrackId,
      };
    }),

  updateAudioTrack: (id, patch) =>
    set((state) => ({
      audioTracks: state.audioTracks.map((t) =>
        t.id === id ? { ...t, ...patch } : t
      ),
    })),

  // ─── Undo / Redo ──────────────────────────────────────────────────────────

  undo: () => set((state) => {
    const snapshot = state.history.past[state.history.past.length - 1];
    if (!snapshot) return {};
    const currentSnapshot = snapshotState(state);
    const newPast = state.history.past.slice(0, -1);
    return {
      ...applySnapshot(state, snapshot),
      history: {
        past: newPast,
        future: [currentSnapshot, ...state.history.future.slice(0, 49)],
      },
    };
  }),

  redo: () => set((state) => {
    const snapshot = state.history.future[0];
    if (!snapshot) return {};
    const currentSnapshot = snapshotState(state);
    const newFuture = state.history.future.slice(1);
    return {
      ...applySnapshot(state, snapshot),
      history: {
        past: [...state.history.past.slice(-49), currentSnapshot],
        future: newFuture,
      },
    };
  }),

  canUndo: () => get().history.past.length > 0,
  canRedo: () => get().history.future.length > 0,

  restoreState: (payload) => set((state) => ({
    compositionLayers: payload.compositionLayers || state.compositionLayers,
    audioTracks: payload.audioTracks || state.audioTracks,
    exportConfig: payload.exportConfig || state.exportConfig
  })),

  setActiveAudioTrackId: (id) => set({ activeAudioTrackId: id }),

  // ─── Local Font Actions ────────────────────────────────────────────────

  fetchLocalFonts: async () => {
    try {
      if ('queryLocalFonts' in window) {
        // @ts-ignore - experimental API
        const fonts = await window.queryLocalFonts();
        const familyNames = Array.from(new Set(fonts.map((f: any) => f.family))) as string[];
        set({ availableFonts: familyNames.sort() });
      } else {
        console.warn('Local Font Access API not supported in this browser.');
      }
    } catch (error) {
      console.error('Failed to fetch local fonts:', error);
    }
  },

  // ─── Toast Actions ────────────────────────────────────────────────────────

  showToast: (toastInput) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const toast: Toast = { ...toastInput, id };
    set(state => ({ toasts: [...state.toasts, toast] }));
    return id;
  },

  dismissToast: (id) => set(state => ({
    toasts: state.toasts.filter(t => t.id !== id),
  })),

  clearAllToasts: () => set({ toasts: [] }),

  // ─── Export Quality Preset Action ────────────────────────────────────────

  setExportQualityPreset: (preset) => {
    const presetConfigs: Record<'draft' | 'standard' | 'broadcast', Partial<ReturnType<typeof get>['exportConfig']>> = {
      draft:     { resolution: '1280x720',  fps: 24, enableMotionBlur: false },
      standard:  { resolution: '1920x1080', fps: 60, enableMotionBlur: false },
      broadcast: { resolution: '3840x2160', fps: 60, enableMotionBlur: true },
    };

    set(state => ({
      exportQualityPreset: preset,
      exportConfig: { ...state.exportConfig, ...presetConfigs[preset] },
    }));
  },

}));

if (typeof window !== 'undefined') {
  (window as any).__pelimotion_store__ = useEditorStore;
}
