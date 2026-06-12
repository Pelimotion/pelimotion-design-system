import type { TypographyConfig, TypoLayerAnimation } from '@/types/motion.types';
import { COLOR_PALETTES } from './color-palettes';
import type { ColorPalette } from './color-palettes';

// Helper to get a palette by ID safely
const getPalette = (id: string): ColorPalette => {
  const p = COLOR_PALETTES.find(x => x.id === id);
  return p || (COLOR_PALETTES[0] as ColorPalette);
};

const defaultAnim: TypoLayerAnimation = {
  entryPreset: 'fadeUp', entryDuration: 0.8, entryStagger: 0.03, entryEase: 'entrySmooth', entryDelay: 0,
  splitMode: 'chars', staggerFrom: 'start', entryX: 0, entryY: 50, entryScale: 0.9, entryRotation: 0, 
  entryBlur: 10, entryOpacity: 0, entrySkewX: 0, entrySkewY: 0,
  exitPreset: 'fadeUp', exitDuration: 0.6, exitStagger: 0.03, exitEase: 'exitSharp', exitDelay: 0,
  exitX: 0, exitY: -50, exitScale: 1.1, exitRotation: 0, exitBlur: 10, exitOpacity: 0, exitSkewX: 0, exitSkewY: 0,
  idleMotion: 'scaleUp', idleSpeed: 1, idleIntensity: 1
};

export interface TypographyPreset {
  id: string;
  name: string;
  description: string;
  density: 'Alta' | 'Média' | 'Baixa';
  config: Partial<TypographyConfig>;
}

export const TYPOGRAPHY_PRESETS: TypographyPreset[] = [
  {
    id: 'preset-agency-1',
    name: 'Digital Agency',
    description: 'Estilo limpo, contrastante e profissional, ideal para branding.',
    density: 'Média',
    config: {
      layoutMode: 'stack',
      layoutGap: 12,
      timeOnScreen: 3.5,
      layoutAlignItems: 'flex-start',
      layoutJustifyContent: 'center',
      layers: [
        {
          id: 'agency-title',
          name: 'Título',
          enabled: true,
          text: 'DIGITAL\nAGENCY.',
          fontFamily: 'Inter',
          fontWeight: 900,
          fontSize: 6.5,
          letterSpacing: -0.02,
          lineHeight: 0.95,
          textTransform: 'uppercase',
          fontStyle: 'normal',
          color: getPalette('pal-agency-1').primary,
          textAlign: 'left',
          maxWidth: 90,
          transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
          animation: { ...defaultAnim, entryPreset: 'slideRight', splitMode: 'lines', entryDuration: 1.0 }
        },
        {
          id: 'agency-sub',
          name: 'Subtítulo',
          enabled: true,
          text: 'Elevando marcas ao próximo nível de sofisticação visual.',
          fontFamily: 'Inter',
          fontWeight: 400,
          fontSize: 1.2,
          letterSpacing: 0,
          lineHeight: 1.4,
          textTransform: 'none',
          fontStyle: 'normal',
          color: getPalette('pal-agency-1').secondary,
          textAlign: 'left',
          maxWidth: 60,
          transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
          animation: { ...defaultAnim, entryPreset: 'fadeUp', splitMode: 'words', entryDelay: 0.4 }
        }
      ]
    }
  },
  {
    id: 'preset-classic',
    name: 'Coringa Central',
    description: 'Diagramação padrão clássica com título chamativo e subtítulo limpo.',
    density: 'Média',
    config: {
      layoutMode: 'stack',
      layoutGap: 16,
      timeOnScreen: 3.0,
      layoutAlignItems: 'center',
      layoutJustifyContent: 'center',
      layers: [
        {
          id: 'classic-title',
          name: 'Título',
          enabled: true,
          text: 'DESIGN CLÁSSICO',
          fontFamily: 'Inter',
          fontWeight: 800,
          fontSize: 6,
          letterSpacing: 0,
          lineHeight: 1.0,
          textTransform: 'uppercase',
          fontStyle: 'normal',
          color: '#ffffff',
          textAlign: 'center',
          maxWidth: 90,
          transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
          animation: { ...defaultAnim, entryPreset: 'fadeUp', splitMode: 'chars' }
        },
        {
          id: 'classic-sub',
          name: 'Subtítulo',
          enabled: true,
          text: 'O equilíbrio perfeito entre forma e função.',
          fontFamily: 'Inter',
          fontWeight: 300,
          fontSize: 1.5,
          letterSpacing: 0.1,
          lineHeight: 1.4,
          textTransform: 'none',
          fontStyle: 'normal',
          color: getPalette('pal-mono-1').secondary,
          textAlign: 'center',
          maxWidth: 80,
          transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
          animation: { ...defaultAnim, entryPreset: 'fadeUp', splitMode: 'words', entryDelay: 0.2 }
        }
      ]
    }
  },
  {
    id: 'preset-manifesto',
    name: 'Manifesto Cinético',
    description: 'Alta densidade de texto com parágrafos. Ideal para declarações marcantes.',
    density: 'Alta',
    config: {
      layoutMode: 'stack',
      layoutGap: 24,
      timeOnScreen: 5.0,
      layoutAlignItems: 'flex-start',
      layoutJustifyContent: 'center',
      layers: [
        {
          id: 'man-title',
          name: 'Headline',
          enabled: true,
          text: 'A REVOLUÇÃO',
          fontFamily: 'Syne',
          fontWeight: 800,
          fontSize: 5,
          letterSpacing: -0.02,
          lineHeight: 0.9,
          textTransform: 'uppercase',
          fontStyle: 'normal',
          color: '#a78bfa',
          textAlign: 'left',
          maxWidth: 90,
          transform: { x: -20, y: 0, scale: 1, rotation: 0, opacity: 1 },
          animation: { ...defaultAnim, entryPreset: 'slideLeft', entryDuration: 1.2, splitMode: 'chars' }
        },
        {
          id: 'man-sub',
          name: 'Subtítulo',
          enabled: true,
          text: 'Menos não é mais. Mais é mais.',
          fontFamily: 'Inter',
          fontWeight: 600,
          fontSize: 2,
          letterSpacing: 0,
          lineHeight: 1.2,
          textTransform: 'none',
          fontStyle: 'italic',
          color: '#ffffff',
          textAlign: 'left',
          maxWidth: 80,
          transform: { x: -20, y: 0, scale: 1, rotation: 0, opacity: 1 },
          animation: { ...defaultAnim, entryPreset: 'fadeUp', entryDelay: 0.3, splitMode: 'words' }
        },
        {
          id: 'man-p',
          name: 'Parágrafo',
          enabled: true,
          text: 'A tipografia cinética destrói a inércia do espaço em branco. O design não é apenas como parece, mas fundamentalmente como se move e respira através do tempo.',
          fontFamily: 'Inter',
          fontWeight: 400,
          fontSize: 1.2,
          letterSpacing: 0,
          lineHeight: 1.5,
          textTransform: 'none',
          fontStyle: 'normal',
          color: '#888888',
          textAlign: 'left',
          maxWidth: 60,
          transform: { x: -20, y: 0, scale: 1, rotation: 0, opacity: 1 },
          animation: { ...defaultAnim, entryPreset: 'typewriter', entryDuration: 2.0, entryStagger: 0.01, entryDelay: 0.6, splitMode: 'lines' }
        }
      ]
    }
  },
  {
    id: 'preset-minimalist',
    name: 'O Vazio Minimalista',
    description: 'Respiro, espaçamento extremo e apenas o essencial.',
    density: 'Baixa',
    config: {
      layoutMode: 'freeform',
      timeOnScreen: 4.0,
      layers: [
        {
          id: 'min-title',
          name: 'Espaço',
          enabled: true,
          text: 'V A Z I O',
          fontFamily: 'Space Grotesk',
          fontWeight: 300,
          fontSize: 8,
          letterSpacing: 0.3,
          lineHeight: 1.0,
          textTransform: 'uppercase',
          fontStyle: 'normal',
          color: '#ffffff',
          textAlign: 'center',
          maxWidth: 100,
          transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
          animation: { ...defaultAnim, entryPreset: 'blurIn', entryDuration: 2.0, splitMode: 'chars', idleMotion: 'breathe' }
        },
        {
          id: 'min-sub',
          name: 'Silêncio',
          enabled: true,
          text: 'a ausência de ruído é a presença de intenção',
          fontFamily: 'Inter',
          fontWeight: 300,
          fontSize: 1,
          letterSpacing: 0.05,
          lineHeight: 1.0,
          textTransform: 'lowercase',
          fontStyle: 'normal',
          color: '#555555',
          textAlign: 'center',
          maxWidth: 100,
          transform: { x: 0, y: 120, scale: 1, rotation: 0, opacity: 1 },
          animation: { ...defaultAnim, entryPreset: 'fadeUp', entryDuration: 1.5, entryDelay: 1.0, splitMode: 'none', idleMotion: 'none' }
        }
      ]
    }
  },
  {
    id: 'preset-brutalist',
    name: 'Sistema Brutalista',
    description: 'Estética crua, uso de fontes mono-espaçadas e layouts lado a lado agressivos.',
    density: 'Alta',
    config: {
      layoutMode: 'sideBySide',
      layoutGap: 40,
      timeOnScreen: 3.0,
      layoutAlignItems: 'flex-start',
      layoutJustifyContent: 'center',
      layers: [
        {
          id: 'brute-1',
          name: 'Bloco 1',
          enabled: true,
          text: 'SYSTEM\nFAILURE',
          fontFamily: 'JetBrains Mono',
          fontWeight: 800,
          fontSize: 4,
          letterSpacing: -0.05,
          lineHeight: 1.1,
          textTransform: 'uppercase',
          fontStyle: 'normal',
          color: getPalette('pal-brutal-1').accent,
          textAlign: 'left',
          maxWidth: 40,
          transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
          animation: { ...defaultAnim, entryPreset: 'glitch', entryDuration: 0.5, splitMode: 'lines', idleMotion: 'wiggle', idleIntensity: 1.5 }
        },
        {
          id: 'brute-2',
          name: 'Bloco 2',
          enabled: true,
          text: '10110010\n01101001\n01111011',
          fontFamily: 'JetBrains Mono',
          fontWeight: 400,
          fontSize: 2,
          letterSpacing: 0,
          lineHeight: 1.2,
          textTransform: 'none',
          fontStyle: 'normal',
          color: getPalette('pal-brutal-1').primary,
          textAlign: 'left',
          maxWidth: 40,
          transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
          animation: { ...defaultAnim, entryPreset: 'glitch', entryDuration: 0.5, entryDelay: 0.2, splitMode: 'chars', idleMotion: 'none' }
        }
      ]
    }
  },
  {
    id: 'preset-art-direction',
    name: 'L\'Avant Garde',
    description: 'Direção de arte editorial, elegante, com fontes serifadas e layout simétrico.',
    density: 'Média',
    config: {
      layoutMode: 'stack',
      layoutGap: 10,
      timeOnScreen: 4.5,
      layoutAlignItems: 'center',
      layoutJustifyContent: 'center',
      layers: [
        {
          id: 'art-sub',
          name: 'Pre-title',
          enabled: true,
          text: 'edição nº 4',
          fontFamily: 'Inter',
          fontWeight: 400,
          fontSize: 1,
          letterSpacing: 0.2,
          lineHeight: 1.0,
          textTransform: 'uppercase',
          fontStyle: 'normal',
          color: getPalette('pal-edit-3').secondary,
          textAlign: 'center',
          maxWidth: 100,
          transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
          animation: { ...defaultAnim, entryPreset: 'fadeUp', entryDuration: 1.0, splitMode: 'none' }
        },
        {
          id: 'art-title',
          name: 'Título',
          enabled: true,
          text: 'ESTÉTICA\nATEMPORAL',
          fontFamily: 'Playfair Display',
          fontWeight: 600,
          fontSize: 7,
          letterSpacing: 0,
          lineHeight: 0.95,
          textTransform: 'uppercase',
          fontStyle: 'italic',
          color: '#ffffff',
          textAlign: 'center',
          maxWidth: 90,
          transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
          animation: { ...defaultAnim, entryPreset: 'reveal', entryDuration: 1.5, entryDelay: 0.3, splitMode: 'lines', idleMotion: 'float' }
        }
      ]
    }
  }
];
