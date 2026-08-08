import { useState, useEffect, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

const NAV_LINKS = [
  { label: 'Inicio',         href: '#inicio' },
  { label: 'El Salón',       href: '#el-salon' },
  { label: 'Servicios',      href: '#servicios' },
  { label: 'Cotizar Evento', href: '#cotizar-evento' },
  { label: 'Reseñas',        href: '#resenas' },
  { label: 'Ubicación',      href: '#ubicacion' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useGSAP(() => {
    gsap.from(navRef.current, { y: -60, opacity: 0, duration: 0.9, ease: 'power3.out' })
  }, { scope: navRef })

  const close = () => setMenuOpen(false)

  return (
    <nav
      ref={navRef}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300
        ${scrolled || menuOpen
          ? 'bg-press-blue-black border-b border-slate-cobalt'
          : 'bg-press-blue-black/90 border-b border-slate-cobalt/40 backdrop-blur-sm'
        }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
        <div className="flex items-center justify-between h-16">

          {/* ── Wordmark ── */}
          <a href="#inicio" className="shrink-0">
            <span
              className="font-twk-lausanne font-[700] text-[15px] tracking-[-0.02em] text-typesetter-frost"
              style={{ borderBottom: '2px solid #2B9BEE', paddingBottom: '1px' }}
            >
              SALÓN
            </span>
            <span className="font-twk-lausanne font-[700] text-[15px] tracking-[-0.02em] text-typesetter-frost ml-1.5">
              ROYMA
            </span>
          </a>

          {/* ── Desktop nav ── */}
          <div className="hidden xl:flex items-center gap-8">
            {NAV_LINKS.map(l => (
              <a
                key={l.href}
                href={l.href}
                className="font-twk-lausanne text-[11px] font-[550] uppercase tracking-[0.11px]
                           text-newsprint-gray hover:text-typesetter-frost transition-colors duration-200"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* ── CTA + hamburger ── */}
          <div className="flex items-center gap-4">
            <a
              href="#cotizar-evento"
              className="hidden xl:inline-flex items-center gap-1.5
                         bg-highlighter-blue text-typesetter-frost
                         font-twk-lausanne text-[11px] font-[550] uppercase tracking-[0.11px]
                         px-[20px] py-[10px] rounded-[5px]
                         hover:opacity-90 transition-opacity"
              style={{ boxShadow: 'rgba(16,94,189,0.35) 1px 8px 20px 0px' }}
            >
              Reservar Fecha
            </a>

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="xl:hidden flex flex-col gap-[5px] p-1"
              aria-label="Menú"
            >
              <span className={`block w-5 h-[1.5px] bg-typesetter-frost transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[6.5px]' : ''}`} />
              <span className={`block w-5 h-[1.5px] bg-typesetter-frost transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-[1.5px] bg-typesetter-frost transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[6.5px]' : ''}`} />
            </button>
          </div>
        </div>

        {/* ── Mobile drawer ── */}
        <div className={`xl:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-screen pb-4' : 'max-h-0'}`}>
          <div className="border-t border-slate-cobalt pt-3 space-y-1">
            {NAV_LINKS.map(l => (
              <a
                key={l.href}
                href={l.href}
                onClick={close}
                className="block py-2.5 font-twk-lausanne text-[11px] font-[550] uppercase
                           tracking-[0.11px] text-newsprint-gray hover:text-typesetter-frost transition-colors"
              >
                {l.label}
              </a>
            ))}
            <div className="pt-3">
              <a
                href="#cotizar-evento"
                onClick={close}
                className="inline-flex bg-highlighter-blue text-typesetter-frost
                           font-twk-lausanne text-[11px] font-[550] uppercase tracking-[0.11px]
                           px-[20px] py-[10px] rounded-[5px]"
              >
                Reservar Fecha
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
