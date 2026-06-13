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
    name: 'The Swiss Precision',
    description: 'Utilitário, estruturado e tecnológico (inspirado na Dinamo).',
    density: 'Alta',
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
          text: 'VANGUARDA\nDIGITAL.',
          fontFamily: 'Inter',
          fontWeight: 900,
          fontSize: 5.5,
          letterSpacing: -0.04,
          lineHeight: 0.95,
          textTransform: 'uppercase',
          fontStyle: 'normal',
          color: getPalette('pal-agency-1').primary,
          textAlign: 'left',
          maxWidth: 90,
          transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
          animation: { ...defaultAnim, entryPreset: 'blurStretch', splitMode: 'words', entryDuration: 0.8, entryStagger: 0.05, exitPreset: 'blurStretch', idleMotion: 'none' }
        },
        {
          id: 'agency-sub',
          name: 'Subtítulo',
          enabled: true,
          text: 'Sistemas visuais escaláveis para marcas de alta performance e tecnologia profunda.',
          fontFamily: 'Space Grotesk',
          fontWeight: 400,
          fontSize: 1.2,
          letterSpacing: -0.01,
          lineHeight: 1.4,
          textTransform: 'none',
          fontStyle: 'normal',
          color: getPalette('pal-agency-1').secondary,
          textAlign: 'left',
          maxWidth: 60,
          transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
          animation: { ...defaultAnim, entryPreset: 'fadeUp', splitMode: 'lines', entryDelay: 0.3, entryY: 20, idleMotion: 'none' }
        }
      ]
    }
  },
  {
    id: 'preset-social-punch',
    name: 'Cyberpunk Chop',
    description: 'Post-digital, corte cinético ácido para máxima retenção visual.',
    density: 'Alta',
    config: {
      layoutMode: 'stack',
      layoutGap: 8,
      timeOnScreen: 2.5,
      layoutAlignItems: 'center',
      layoutJustifyContent: 'center',
      layers: [
        {
          id: 'soc-punch-title',
          name: 'Headline',
          enabled: true,
          text: 'RETENÇÃO\nABSOLUTA',
          fontFamily: 'Space Grotesk',
          fontWeight: 800,
          fontSize: 6.5,
          letterSpacing: -0.05,
          lineHeight: 0.9,
          textTransform: 'uppercase',
          fontStyle: 'normal',
          color: getPalette('pal-pop-1').primary,
          textAlign: 'center',
          maxWidth: 90,
          transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
          animation: { ...defaultAnim, entryPreset: 'kineticChop', entryDuration: 0.5, entryStagger: 0.04, splitMode: 'chars', entryEase: 'back.out(1.5)', exitPreset: 'kineticChop', idleMotion: 'wiggle', idleIntensity: 0.5 }
        },
        {
          id: 'soc-punch-sub',
          name: 'Call to Action',
          enabled: true,
          text: 'Hackeando a atenção no scroll.',
          fontFamily: 'Inter',
          fontWeight: 600,
          fontSize: 1.4,
          letterSpacing: 0,
          lineHeight: 1.2,
          textTransform: 'uppercase',
          fontStyle: 'normal',
          color: getPalette('pal-pop-1').secondary,
          textAlign: 'center',
          maxWidth: 80,
          transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
          animation: { ...defaultAnim, entryPreset: 'glitch', entryDelay: 0.4, splitMode: 'none', idleMotion: 'none' }
        }
      ]
    }
  },
  {
    id: 'preset-art-direction',
    name: 'Editorial Elegance',
    description: 'Direção de arte fluida, lírica e de alto contraste (VJ-Type style).',
    density: 'Média',
    config: {
      layoutMode: 'stack',
      layoutGap: 16,
      timeOnScreen: 4.5,
      layoutAlignItems: 'center',
      layoutJustifyContent: 'center',
      layers: [
        {
          id: 'art-sub',
          name: 'Pre-title',
          enabled: true,
          text: 'collection privée',
          fontFamily: 'Playfair Display',
          fontWeight: 400,
          fontSize: 1.2,
          letterSpacing: 0.1,
          lineHeight: 1.0,
          textTransform: 'lowercase',
          fontStyle: 'italic',
          color: getPalette('pal-edit-3').secondary,
          textAlign: 'center',
          maxWidth: 100,
          transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
          animation: { ...defaultAnim, entryPreset: 'elegantWipe', entryDuration: 1.2, splitMode: 'chars', entryStagger: 0.05, exitPreset: 'elegantWipe', idleMotion: 'float', idleIntensity: 0.5 }
        },
        {
          id: 'art-title',
          name: 'Título',
          enabled: true,
          text: 'MOUVEMENT\nLYRIQUE',
          fontFamily: 'Playfair Display',
          fontWeight: 500,
          fontSize: 6,
          letterSpacing: 0,
          lineHeight: 1.05,
          textTransform: 'uppercase',
          fontStyle: 'normal',
          color: getPalette('pal-edit-3').primary,
          textAlign: 'center',
          maxWidth: 90,
          transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
          animation: { ...defaultAnim, entryPreset: 'elegantWipe', entryDuration: 1.5, entryDelay: 0.5, splitMode: 'chars', entryStagger: 0.03, exitPreset: 'elegantWipe', idleMotion: 'float', idleIntensity: 0.3 }
        }
      ]
    }
  },
  {
    id: 'preset-brutalist',
    name: 'Brutalist Poster',
    description: 'Impacto brutal, agressivo e monumental (Pangram Pangram).',
    density: 'Alta',
    config: {
      layoutMode: 'stack',
      layoutGap: 0,
      timeOnScreen: 3.0,
      layoutAlignItems: 'flex-start',
      layoutJustifyContent: 'center',
      layers: [
        {
          id: 'brutal-title',
          name: 'Headline',
          enabled: true,
          text: 'BRUTO',
          fontFamily: 'Bebas Neue',
          fontWeight: 400,
          fontSize: 14,
          letterSpacing: -0.02,
          lineHeight: 0.85,
          textTransform: 'uppercase',
          fontStyle: 'normal',
          color: getPalette('pal-pop-2').primary,
          textAlign: 'left',
          maxWidth: 100,
          transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
          animation: { ...defaultAnim, entryPreset: 'brutalSlam', entryDuration: 0.6, splitMode: 'none', entryEase: 'power4.inOut', exitPreset: 'brutalSlam', idleMotion: 'none' }
        },
        {
          id: 'brutal-sub',
          name: 'Manifesto',
          enabled: true,
          text: 'SE NÃO TEM IMPACTO, NÃO EXISTE.',
          fontFamily: 'Inter',
          fontWeight: 900,
          fontSize: 1.5,
          letterSpacing: -0.03,
          lineHeight: 1.0,
          textTransform: 'uppercase',
          fontStyle: 'normal',
          color: getPalette('pal-pop-2').secondary,
          textAlign: 'left',
          maxWidth: 80,
          transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
          animation: { ...defaultAnim, entryPreset: 'slideRight', entryDuration: 0.4, entryDelay: 0.5, splitMode: 'none', idleMotion: 'panX', idleSpeed: 0.2 }
        }
      ]
    }
  }
];
