import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/pelimotion-design-system/',
  plugins: [
    react(),
    tailwindcss(),
  ],

  // Vite 8 native tsconfig paths resolution — replaces vite-tsconfig-paths plugin
  resolve: {
    tsconfigPaths: true,
  },

  server: {
    port: 3000,
    headers: {
      // Required for SharedArrayBuffer (FFmpeg.wasm multi-threading)
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },

  // Allow WASM files as importable assets
  assetsInclude: ['**/*.wasm'],

  build: {
    // Optimize for modern browsers — no legacy transforms
    target: 'esnext',
    // Enable source maps for debugging motion timelines
    sourcemap: true,
  },

  optimizeDeps: {
    // Pre-bundle heavy dependencies for faster HMR
    include: ['gsap', 'zustand', 'simplex-noise'],
  },
})
