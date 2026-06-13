import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// GSAP plugin registration — MUST be imported before any component
// that uses GSAP animations. Single entry point, no duplicates.
import '@/lib/gsap-register'

import App from './App'

// Register Service Worker for BunnyCDN Video Caching
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      },
      (err) => {
        console.log('ServiceWorker registration failed: ', err);
      }
    );
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
