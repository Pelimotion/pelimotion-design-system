export interface ColorPalette {
  id: string;
  name: string;
  /** Suggested background color */
  background: string;
  /** Primary text/element color */
  primary: string;
  /** Secondary text/element color */
  secondary: string;
  /** Accent/Highlight color (often used for trails or emphasis) */
  accent: string;
}

export const COLOR_PALETTES: ColorPalette[] = [
  // --- Digital Agency / Clean ---
  { id: 'pal-agency-1', name: 'Digital Trust', background: '#0f172a', primary: '#f8fafc', secondary: '#94a3b8', accent: '#3b82f6' },
  { id: 'pal-agency-2', name: 'Coral Minimal', background: '#ffffff', primary: '#09090b', secondary: '#71717a', accent: '#ff6b6b' },
  { id: 'pal-agency-3', name: 'Arctic Clean', background: '#f8fafc', primary: '#1e293b', secondary: '#64748b', accent: '#0ea5e9' },
  { id: 'pal-agency-4', name: 'Midnight Violet', background: '#020617', primary: '#f1f5f9', secondary: '#cbd5e1', accent: '#8b5cf6' },
  { id: 'pal-agency-5', name: 'Nordic Slate', background: '#1c1f26', primary: '#e2e8f0', secondary: '#94a3b8', accent: '#14b8a6' },
  
  // --- Cyber / Brutalist ---
  { id: 'pal-brutal-1', name: 'Cyber Shield', background: '#000000', primary: '#ffffff', secondary: '#666666', accent: '#39ff14' },
  { id: 'pal-brutal-2', name: 'Matrix Yellow', background: '#0a0a0a', primary: '#ffff00', secondary: '#aaaaaa', accent: '#ff003c' },
  { id: 'pal-brutal-3', name: 'Terminal Red', background: '#111111', primary: '#ff3333', secondary: '#888888', accent: '#ffffff' },
  { id: 'pal-brutal-4', name: 'Hyper Blue', background: '#0000ff', primary: '#ffffff', secondary: '#aaaaaa', accent: '#ff00ff' },
  { id: 'pal-brutal-5', name: 'Acid Contrast', background: '#121212', primary: '#ccff00', secondary: '#ffffff', accent: '#ff00cc' },

  // --- Editorial / Sophisticated ---
  { id: 'pal-edit-1', name: 'Vogue Cream', background: '#faf9f6', primary: '#1a1a1a', secondary: '#737373', accent: '#c6a87c' },
  { id: 'pal-edit-2', name: 'Olive Elegance', background: '#f3f4f1', primary: '#2b3024', secondary: '#8e9681', accent: '#d4af37' },
  { id: 'pal-edit-3', name: 'Noir & Gold', background: '#050505', primary: '#f5f5f5', secondary: '#a3a3a3', accent: '#d4af37' },
  { id: 'pal-edit-4', name: 'Serene Rose', background: '#fffcfc', primary: '#2d2424', secondary: '#a89f9f', accent: '#d98a8a' },
  { id: 'pal-edit-5', name: 'Slate Velvet', background: '#2c303a', primary: '#f0f0f0', secondary: '#a0a5b1', accent: '#e0a96d' },

  // --- Monochromatic / Deep ---
  { id: 'pal-mono-1', name: 'Deep Space', background: '#030712', primary: '#f9fafb', secondary: '#4b5563', accent: '#f9fafb' },
  { id: 'pal-mono-2', name: 'Ghost White', background: '#ffffff', primary: '#000000', secondary: '#d1d5db', accent: '#000000' },
  { id: 'pal-mono-3', name: 'Obsidian', background: '#171717', primary: '#ededed', secondary: '#525252', accent: '#a3a3a3' },
  { id: 'pal-mono-4', name: 'Snow Blind', background: '#f5f5f5', primary: '#1a1a1a', secondary: '#b3b3b3', accent: '#e5e5e5' },
  { id: 'pal-mono-5', name: 'Charcoal', background: '#222222', primary: '#ffffff', secondary: '#999999', accent: '#cccccc' },

  // --- Vibrant / Pop ---
  { id: 'pal-pop-1', name: 'Bubblegum', background: '#ff7eb3', primary: '#ffffff', secondary: '#ffb3d9', accent: '#ff007f' },
  { id: 'pal-pop-2', name: 'Sunset Orange', background: '#ff4e00', primary: '#ffffff', secondary: '#ffb599', accent: '#ffcd00' },
  { id: 'pal-pop-3', name: 'Electric Purple', background: '#6600ff', primary: '#ffffff', secondary: '#b280ff', accent: '#00ffff' },
  { id: 'pal-pop-4', name: 'Miami Vice', background: '#0b0c10', primary: '#66fcf1', secondary: '#45a29e', accent: '#c5c6c7' },
  { id: 'pal-pop-5', name: 'Toxic Green', background: '#1c1c1c', primary: '#39ff14', secondary: '#cccccc', accent: '#ffffff' },

  // --- Earthy / Natural ---
  { id: 'pal-earth-1', name: 'Terracotta', background: '#e07a5f', primary: '#f4f1de', secondary: '#f2cc8f', accent: '#3d405b' },
  { id: 'pal-earth-2', name: 'Forest Shadow', background: '#2c362b', primary: '#e8eedf', secondary: '#89987c', accent: '#d9f0b1' },
  { id: 'pal-earth-3', name: 'Desert Sand', background: '#f4a261', primary: '#264653', secondary: '#e76f51', accent: '#2a9d8f' },
  { id: 'pal-earth-4', name: 'Clay & Rust', background: '#efe9e1', primary: '#8b4513', secondary: '#d2b48c', accent: '#cd5c5c' },
  { id: 'pal-earth-5', name: 'Ocean Depth', background: '#003049', primary: '#eae2b7', secondary: '#f77f00', accent: '#d62828' }
];
