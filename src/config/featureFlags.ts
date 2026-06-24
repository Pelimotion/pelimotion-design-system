/**
 * Feature Flags — Pelimotion Design System
 * 
 * Controls visibility of Pro features in the Free tier.
 * Flags can be toggled via:
 *   1. AdminPanel UI (persists to localStorage)
 *   2. URL query params (?ff_timeline_nle=true)
 *   3. localStorage override (pelimotion_feature_flags)
 * 
 * Default: all Pro features OFF (Free mode)
 */

// ─── Flag Definitions ────────────────────────────────────────────────────────

export interface FeatureFlags {
  /** NLE Timeline with multi-track composition */
  timeline_nle: boolean;
  /** Multi-track audio mixing & muxing */
  audio_mixing: boolean;
  /** Advanced composition panel (background video, layered timeline) */
  composition_advanced: boolean;
  /** Multiple video/media tracks in timeline */
  multi_track: boolean;
  /** PosterizeTime visual effect */
  posterize_time: boolean;
  /** Advanced export formats and batch export */
  pro_export_formats: boolean;
  /** Admin panel access */
  admin_panel: boolean;
  /** Advanced trail effects on typography */
  advanced_trail: boolean;
  /** Advanced noise engine parameters */
  advanced_noise: boolean;
  /** Watermark on free exports */
  watermark_free: boolean;
}

export const DEFAULT_FLAGS: FeatureFlags = {
  timeline_nle: false,
  audio_mixing: false,
  composition_advanced: false,
  multi_track: false,
  posterize_time: false,
  pro_export_formats: false,
  admin_panel: false,
  advanced_trail: false,
  advanced_noise: false,
  watermark_free: true, // Free users get watermark by default
};

// ─── Flag Labels (PT-BR for admin UI) ────────────────────────────────────────

export const FLAG_LABELS: Record<keyof FeatureFlags, string> = {
  timeline_nle: 'Timeline NLE (Multi-track)',
  audio_mixing: 'Mixagem de Áudio',
  composition_advanced: 'Composição Avançada',
  multi_track: 'Multi-track de Mídia',
  posterize_time: 'Efeito PosterizeTime',
  pro_export_formats: 'Formatos de Export Pro',
  admin_panel: 'Painel Admin',
  advanced_trail: 'Trail Avançado (Typography)',
  advanced_noise: 'Noise Engine Avançado',
  watermark_free: 'Watermark na Versão Free',
};

export const FLAG_DESCRIPTIONS: Record<keyof FeatureFlags, string> = {
  timeline_nle: 'Habilita a timeline de edição não-linear com arraste, trim e composição de camadas.',
  audio_mixing: 'Habilita importação, mixagem e muxing de múltiplas faixas de áudio na exportação.',
  composition_advanced: 'Habilita o painel de composição com vídeo de fundo, duração e FPS avançados.',
  multi_track: 'Permite adicionar múltiplas camadas de vídeo e mídia na timeline.',
  posterize_time: 'Habilita o controle de PosterizeTime para efeito stop-motion.',
  pro_export_formats: 'Habilita formatos de exportação avançados e opções de batch.',
  admin_panel: 'Permite acesso ao painel de administração.',
  advanced_trail: 'Habilita controles avançados do efeito trail na tipografia.',
  advanced_noise: 'Habilita parâmetros avançados do motor de ruído (octaves, persistence, FBM).',
  watermark_free: 'Adiciona marca d\'água nas exportações da versão Free.',
};

// ─── Storage Key ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'pelimotion_feature_flags';

// ─── Load / Save ─────────────────────────────────────────────────────────────

export function loadFeatureFlags(): FeatureFlags {
  const flags = { ...DEFAULT_FLAGS };

  // 1. Load from localStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      for (const key of Object.keys(flags) as (keyof FeatureFlags)[]) {
        if (typeof parsed[key] === 'boolean') {
          flags[key] = parsed[key];
        }
      }
    }
  } catch {
    // Ignore parse errors
  }

  // 2. Override from URL query params (ff_<flag_name>=true|false)
  try {
    const params = new URLSearchParams(window.location.search);
    for (const key of Object.keys(flags) as (keyof FeatureFlags)[]) {
      const param = params.get(`ff_${key}`);
      if (param === 'true') flags[key] = true;
      if (param === 'false') flags[key] = false;
    }
  } catch {
    // SSR safety
  }

  return flags;
}

export function saveFeatureFlags(flags: FeatureFlags): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
  } catch (e) {
    console.error('[FeatureFlags] Failed to save:', e);
  }
}

// ─── Admin Password Check ────────────────────────────────────────────────────

const ADMIN_HASH = 'pelimotion_admin_2024'; // Simple check — replace with env var hash in prod

export function verifyAdminAccess(password: string): boolean {
  return password === ADMIN_HASH;
}
