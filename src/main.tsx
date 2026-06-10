import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// GSAP plugin registration — MUST be imported before any component
// that uses GSAP animations. Single entry point, no duplicates.
import '@/lib/gsap-register'

import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
