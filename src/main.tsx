import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './index.css'
import App from './App.tsx'

// Register all GSAP plugins once, globally
gsap.registerPlugin(useGSAP, ScrollTrigger)

// After all assets are loaded, force every ScrollTrigger to recalculate.
// This is the key fix for browser scroll-restoration: when the browser
// reloads a page already scrolled past a trigger, the trigger would
// otherwise stay dormant until the next scroll event.
window.addEventListener('load', () => {
  ScrollTrigger.refresh(true)
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
