import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// GSAP plugin registration — MUST be imported before any component
// that uses GSAP animations. Single entry point, no duplicates.
import '@/lib/gsap-register'

import App from './App'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`
    navigator.serviceWorker.register(swUrl).then(
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
