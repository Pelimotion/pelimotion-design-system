/**
 * Zustand Editor Store
 * 
 * Central state management for the Aura Motion Design System.
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
  ExportConfig,
} from '@/types/motion.types'

import globalMotionData from '@/config/global-motion.json'
import libraryData from '@/config/library.json'

// ─── Store Interface ─────────────────────────────────────────────────────────

interface EditorState {
  // Configuration
  motionConfig: GlobalMotionConfig;
  libraryConfig: LibraryConfig;

  // UI State
  activePanel: EditorPanel;
  sidebarCollapsed: boolean;

  // Typography Preview Text
  typographyText: string;

  // Posterize State
  posterizeEnabled: boolean;
  posterizeFps: number;

  // Library State
  activeLibraryAssetId: string | null;

  // Export Pipeline State
  exportConfig: ExportConfig;
  exportState: ExportState;

  // Local Fonts State
  availableFonts: string[];

  // ─── Actions ─────────────────────────────────────────────────────────────

  // Config mutations (for headless vibe-coding workflow)
  updateEasing: (easing: Partial<EasingConfig>) => void;
  updateTrail: (trail: Partial<TrailConfig>) => void;
  updateWiggle: (wiggle: Partial<WiggleConfig>) => void;
  updateTypography: (typography: Partial<TypographyConfig>) => void;
  setTypographyText: (text: string) => void;

  // UI actions
  setActivePanel: (panel: EditorPanel) => void;
  toggleSidebar: () => void;
  setActiveLibraryAssetId: (id: string | null) => void;

  // Posterize actions
  togglePosterize: () => void;
  setPosterizeFps: (fps: number) => void;

  // Export actions
  updateExportConfig: (config: Partial<ExportConfig>) => void;
  setExportState: (state: Partial<ExportState>) => void;
  resetExport: () => void;

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
}

// ─── Store Creation ──────────────────────────────────────────────────────────

export const useEditorStore = create<EditorState>((set) => ({
  // Load configs from JSON at initialization
  motionConfig: globalMotionData as GlobalMotionConfig,
  libraryConfig: libraryData as LibraryConfig,

  // Default UI state
  activePanel: 'typography',
  sidebarCollapsed: false,

  // Typography Preview Text
  typographyText: 'Pelimotion Design System',

  // Posterize defaults from config
  posterizeEnabled: false,
  posterizeFps: globalMotionData.posterizeTime.masterFps,

  // Library default state
  activeLibraryAssetId: null,

  // Export pipeline
  exportConfig: {
    resolution: '1920x1080',
    fps: 60,
    duration: 5,
    format: 'png-sequence',
  },
  exportState: initialExportState,

  // Local fonts cache
  availableFonts: [],

  // ─── Config Mutations ──────────────────────────────────────────────────

  updateEasing: (easing) =>
    set((state) => ({
      motionConfig: {
        ...state.motionConfig,
        easing: { ...state.motionConfig.easing, ...easing },
      },
    })),

  updateTrail: (trail) =>
    set((state) => ({
      motionConfig: {
        ...state.motionConfig,
        trail: { ...state.motionConfig.trail, ...trail },
      },
    })),

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

  setTypographyText: (text) => set({ typographyText: text }),

  // ─── UI Actions ────────────────────────────────────────────────────────

  setActivePanel: (panel) => set({ activePanel: panel }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setActiveLibraryAssetId: (id) => set({ activeLibraryAssetId: id }),

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
}))
