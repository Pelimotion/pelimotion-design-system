/**
 * Elements Library — Pelimotion v3.0
 *
 * Pre-defined elements catalog for social media content creation.
 * Organized into categories: Shapes, Overlays, Shadows, Text Boxes.
 */

import type {
  OverlayStyle,
  ShadowGuardStyle,
  TextBoxStyle,
  ElementShapeType,
} from '@/types/universalLayers.types';

// ─── Category Definition ─────────────────────────────────────────────────────

export interface ElementCatalogItem {
  id: string;
  name: string;
  description: string;
  category: 'shapes' | 'overlays' | 'shadows' | 'text-boxes';
  icon: string;        // Lucide icon name
  /** The sub-type to create */
  subType: ElementShapeType | OverlayStyle | ShadowGuardStyle | TextBoxStyle;
  /** Default colors for this element */
  defaultColors: string[];
  /** Tags for filtering */
  tags: string[];
  /** Whether this is a premium element */
  tier: 'free' | 'pro';
}

export interface ElementCategory {
  id: string;
  label: string;
  labelPt: string;
  icon: string;
  description: string;
}

// ─── Categories ──────────────────────────────────────────────────────────────

export const ELEMENT_CATEGORIES: ElementCategory[] = [
  {
    id: 'shapes',
    label: 'Shapes',
    labelPt: 'Formas',
    icon: 'Shapes',
    description: 'Formas geométricas e orgânicas animadas',
  },
  {
    id: 'overlays',
    label: 'Overlays',
    labelPt: 'Overlays',
    icon: 'Layers',
    description: 'Elementos de sobreposição para efeitos visuais',
  },
  {
    id: 'shadows',
    label: 'Shadows',
    labelPt: 'Proteção de Texto',
    icon: 'Shield',
    description: 'Gradientes para melhorar legibilidade do texto',
  },
  {
    id: 'text-boxes',
    label: 'Text Boxes',
    labelPt: 'Caixas de Texto',
    icon: 'Square',
    description: 'Fundos para destacar tipografias',
  },
];

// ─── Catalog Items ───────────────────────────────────────────────────────────

export const ELEMENT_CATALOG: ElementCatalogItem[] = [
  // ── Shapes ─────────────────────────────────────────────────────────────────
  {
    id: 'shape-circle',
    name: 'Círculo',
    description: 'Círculo sólido ou com borda',
    category: 'shapes',
    icon: 'Circle',
    subType: 'circle',
    defaultColors: ['#a78bfa'],
    tags: ['forma', 'básico', 'geométrico'],
    tier: 'free',
  },
  {
    id: 'shape-square',
    name: 'Quadrado',
    description: 'Quadrado com cantos ajustáveis',
    category: 'shapes',
    icon: 'Square',
    subType: 'square',
    defaultColors: ['#60a5fa'],
    tags: ['forma', 'básico', 'geométrico'],
    tier: 'free',
  },
  {
    id: 'shape-star',
    name: 'Estrela',
    description: 'Estrela com pontas ajustáveis',
    category: 'shapes',
    icon: 'Star',
    subType: 'star',
    defaultColors: ['#fbbf24'],
    tags: ['forma', 'decorativo'],
    tier: 'free',
  },
  {
    id: 'shape-hexagon',
    name: 'Hexágono',
    description: 'Hexágono regular',
    category: 'shapes',
    icon: 'Hexagon',
    subType: 'hexagon',
    defaultColors: ['#34d399'],
    tags: ['forma', 'geométrico'],
    tier: 'free',
  },
  {
    id: 'shape-wave',
    name: 'Onda',
    description: 'Forma ondulada orgânica',
    category: 'shapes',
    icon: 'Waves',
    subType: 'wave',
    defaultColors: ['#38bdf8'],
    tags: ['forma', 'orgânico', 'decorativo'],
    tier: 'free',
  },
  {
    id: 'shape-grid',
    name: 'Grid',
    description: 'Grade de pontos ou linhas',
    category: 'shapes',
    icon: 'Grid3x3',
    subType: 'grid',
    defaultColors: ['#94a3b8'],
    tags: ['forma', 'padrão', 'geométrico'],
    tier: 'free',
  },
  {
    id: 'shape-spirograph',
    name: 'Espirografo',
    description: 'Padrão espiral decorativo',
    category: 'shapes',
    icon: 'Flower2',
    subType: 'spirograph',
    defaultColors: ['#c084fc', '#f472b6'],
    tags: ['forma', 'decorativo', 'complexo'],
    tier: 'free',
  },
  {
    id: 'shape-orbital',
    name: 'Orbital',
    description: 'Anéis concêntricos orbitais',
    category: 'shapes',
    icon: 'Orbit',
    subType: 'orbital',
    defaultColors: ['#67e8f9'],
    tags: ['forma', 'tech', 'decorativo'],
    tier: 'pro',
  },
  {
    id: 'shape-mesh',
    name: 'Mesh',
    description: 'Malha tridimensional',
    category: 'shapes',
    icon: 'Box',
    subType: 'mesh',
    defaultColors: ['#818cf8'],
    tags: ['forma', '3d', 'tech'],
    tier: 'pro',
  },
  {
    id: 'shape-fluid',
    name: 'Fluido',
    description: 'Forma fluida orgânica',
    category: 'shapes',
    icon: 'Droplets',
    subType: 'fluid',
    defaultColors: ['#a78bfa', '#f472b6'],
    tags: ['forma', 'orgânico', 'premium'],
    tier: 'pro',
  },
  {
    id: 'shape-particles',
    name: 'Partículas',
    description: 'Campo de partículas animadas',
    category: 'shapes',
    icon: 'Sparkles',
    subType: 'particles',
    defaultColors: ['#fde68a'],
    tags: ['forma', 'efeito', 'premium'],
    tier: 'pro',
  },

  // ── Overlays ───────────────────────────────────────────────────────────────
  {
    id: 'overlay-gradient-top',
    name: 'Gradiente Topo',
    description: 'Gradiente escuro do topo para baixo',
    category: 'overlays',
    icon: 'ArrowDown',
    subType: 'gradient-top',
    defaultColors: ['#000000'],
    tags: ['overlay', 'gradiente', 'social'],
    tier: 'free',
  },
  {
    id: 'overlay-gradient-bottom',
    name: 'Gradiente Base',
    description: 'Gradiente escuro da base para cima',
    category: 'overlays',
    icon: 'ArrowUp',
    subType: 'gradient-bottom',
    defaultColors: ['#000000'],
    tags: ['overlay', 'gradiente', 'social'],
    tier: 'free',
  },
  {
    id: 'overlay-gradient-radial',
    name: 'Vinheta Radial',
    description: 'Vinheta escura nas bordas',
    category: 'overlays',
    icon: 'Focus',
    subType: 'gradient-radial',
    defaultColors: ['#000000'],
    tags: ['overlay', 'vinheta', 'cinema'],
    tier: 'free',
  },
  {
    id: 'overlay-noise',
    name: 'Noise/Ruído',
    description: 'Textura de ruído sutil',
    category: 'overlays',
    icon: 'Scan',
    subType: 'noise-overlay',
    defaultColors: ['#ffffff'],
    tags: ['overlay', 'textura', 'premium'],
    tier: 'free',
  },
  {
    id: 'overlay-grain',
    name: 'Film Grain',
    description: 'Granulação estilo filme analógico',
    category: 'overlays',
    icon: 'Film',
    subType: 'grain-overlay',
    defaultColors: ['#ffffff'],
    tags: ['overlay', 'textura', 'cinema'],
    tier: 'free',
  },
  {
    id: 'overlay-light-leak',
    name: 'Light Leak',
    description: 'Vazamento de luz cinematográfico',
    category: 'overlays',
    icon: 'Sun',
    subType: 'light-leak',
    defaultColors: ['#ff6b35', '#ffd700'],
    tags: ['overlay', 'efeito', 'premium'],
    tier: 'pro',
  },

  // ── Shadows (Text Protection) ──────────────────────────────────────────────
  {
    id: 'shadow-protection-bottom',
    name: 'Proteção Inferior',
    description: 'Gradiente para legibilidade na parte inferior',
    category: 'shadows',
    icon: 'ShieldHalf',
    subType: 'text-protection-bottom',
    defaultColors: ['#000000'],
    tags: ['shadow', 'texto', 'social'],
    tier: 'free',
  },
  {
    id: 'shadow-protection-top',
    name: 'Proteção Superior',
    description: 'Gradiente para legibilidade na parte superior',
    category: 'shadows',
    icon: 'ShieldHalf',
    subType: 'text-protection-top',
    defaultColors: ['#000000'],
    tags: ['shadow', 'texto', 'social'],
    tier: 'free',
  },
  {
    id: 'shadow-vignette-soft',
    name: 'Vinheta Suave',
    description: 'Escurecimento suave das bordas',
    category: 'shadows',
    icon: 'Eclipse',
    subType: 'vignette-soft',
    defaultColors: ['#000000'],
    tags: ['shadow', 'cinema', 'vinheta'],
    tier: 'free',
  },
  {
    id: 'shadow-vignette-hard',
    name: 'Vinheta Forte',
    description: 'Escurecimento dramático das bordas',
    category: 'shadows',
    icon: 'Eclipse',
    subType: 'vignette-hard',
    defaultColors: ['#000000'],
    tags: ['shadow', 'cinema', 'drama'],
    tier: 'free',
  },

  // ── Text Boxes ─────────────────────────────────────────────────────────────
  {
    id: 'textbox-pill-blur',
    name: 'Pill Blur',
    description: 'Cápsula com desfoque de fundo (glassmorphism)',
    category: 'text-boxes',
    icon: 'RectangleHorizontal',
    subType: 'pill-blur',
    defaultColors: ['rgba(0,0,0,0.5)'],
    tags: ['box', 'glass', 'moderno'],
    tier: 'free',
  },
  {
    id: 'textbox-rectangle-solid',
    name: 'Retângulo Sólido',
    description: 'Fundo retangular opaco',
    category: 'text-boxes',
    icon: 'RectangleHorizontal',
    subType: 'rectangle-solid',
    defaultColors: ['#1a1a2e'],
    tags: ['box', 'sólido', 'básico'],
    tier: 'free',
  },
  {
    id: 'textbox-rectangle-glass',
    name: 'Retângulo Glass',
    description: 'Fundo com efeito glassmorphism premium',
    category: 'text-boxes',
    icon: 'RectangleHorizontal',
    subType: 'rectangle-glass',
    defaultColors: ['rgba(255,255,255,0.1)'],
    tags: ['box', 'glass', 'premium'],
    tier: 'free',
  },
  {
    id: 'textbox-rounded-dark',
    name: 'Arredondado Escuro',
    description: 'Caixa arredondada com fundo escuro',
    category: 'text-boxes',
    icon: 'SquareRoundCorner',
    subType: 'rounded-dark',
    defaultColors: ['rgba(0,0,0,0.8)'],
    tags: ['box', 'escuro', 'social'],
    tier: 'free',
  },
  {
    id: 'textbox-rounded-light',
    name: 'Arredondado Claro',
    description: 'Caixa arredondada com fundo claro',
    category: 'text-boxes',
    icon: 'SquareRoundCorner',
    subType: 'rounded-light',
    defaultColors: ['rgba(255,255,255,0.9)'],
    tags: ['box', 'claro', 'social'],
    tier: 'free',
  },
];

// ─── Helper Functions ────────────────────────────────────────────────────────

export function getElementsByCategory(category: string): ElementCatalogItem[] {
  return ELEMENT_CATALOG.filter(item => item.category === category);
}

export function getFreeElements(): ElementCatalogItem[] {
  return ELEMENT_CATALOG.filter(item => item.tier === 'free');
}

export function searchElements(query: string): ElementCatalogItem[] {
  const lower = query.toLowerCase();
  return ELEMENT_CATALOG.filter(item =>
    item.name.toLowerCase().includes(lower) ||
    item.description.toLowerCase().includes(lower) ||
    item.tags.some(tag => tag.includes(lower))
  );
}
