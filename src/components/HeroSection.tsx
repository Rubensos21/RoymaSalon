import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

export default function HeroSection() {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.from('.h-label',  { opacity: 0, y: 12,  duration: 0.6 })
      .from('.h-stat',   { opacity: 0, x: 20,  duration: 0.7 }, '-=0.3')
      .from('.h-title',  { opacity: 0, y: 60,  duration: 1.0 }, '-=0.5')
      .from('.h-rule',   { opacity: 0, scaleX: 0, transformOrigin: 'left', duration: 0.5 }, '-=0.3')
      .from('.h-body',   { opacity: 0, y: 18,  duration: 0.7 }, '-=0.3')
      .from('.h-cta',    { opacity: 0, y: 12,  duration: 0.6, stagger: 0.12 }, '-=0.4')
  }, { scope: ref })

  return (
    <section
      id="inicio"
      ref={ref}
      className="min-h-screen bg-bone-dark flex flex-col justify-end
                 px-6 sm:px-10 xl:px-[80px] pb-[80px] pt-24"
    >
      <div className="max-w-350 mx-auto w-full">

        {/* ── Meta row ── */}
        <div className="h-label flex items-start justify-between mb-10 sm:mb-60">
          <span className="font-twk-lausanne text-[11px] font-[550] uppercase tracking-[0.11px] text-newsprint-gray">
            Pachuca, Hidalgo · Sala de Banquetes y Eventos
          </span>

          {/* Stat callout (Newsprint Gray, display scale) — editorial data */}
          <div className="h-stat hidden sm:flex flex-col items-end gap-1">
            <span
              className="font-pp-mondwest font-normal text-newsprint-gray leading-[0.9] tracking-[-0.04em]"
              style={{ fontSize: 'clamp(48px, 5vw, 80px)' }}
            >
              4.5
            </span>
            <span className="font-twk-lausanne text-[11px] font-[550] uppercase tracking-[0.11px] text-newsprint-gray">
              / 5 · 75 opiniones en Google
            </span>
          </div>
        </div>

        {/* ── Typographic wall ── */}
        <h1
          className="h-title font-pp-mondwest font-normal text-typesetter-frost leading-[0.9] tracking-[-0.04em]"
          style={{ fontSize: 'clamp(40px, 10.5vw, 155px)' }}
        >
          Salón<br />Jardín LÍA
        </h1>

        {/* Hairline rule */}
        <div className="h-rule w-full h-px bg-slate-cobalt my-[40px]" />

        {/* ── Body + CTAs ── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-[40px]">
          <p className="h-body font-twk-lausanne font-[200] text-[18px] leading-[1.4] tracking-[-0.36px]
                        text-muted-sky max-w-sm">
            Instalaciones elegantes, jardín encantador y coordinación profesional para hacer de tu evento una fecha inolvidable en Pachuca.
            <span className="block mt-4 text-[14px] text-newsprint-gray">
              Poco más de 100 invitados · Servicio de banquete y meseros atentos.
            </span>
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-[20px]">
            <a
              href="#cotizar-evento"
              className="h-cta inline-flex items-center gap-2
                         bg-highlighter-blue text-typesetter-frost
                         font-twk-lausanne text-[11px] font-[550] uppercase tracking-[0.11px]
                         px-[30px] py-[20px] rounded-[5px]
                         hover:opacity-90 transition-opacity whitespace-nowrap"
              style={{ boxShadow: 'rgba(16,94,189,0.35) 1px 8px 20px 0px' }}
            >
              Cotizar Evento
            </a>
            <a
              href="#el-salon"
              className="h-cta inline-flex items-center gap-2
                         border border-typesetter-frost/25 text-typesetter-frost
                         font-twk-lausanne text-[11px] font-[550] uppercase tracking-[0.11px]
                         px-[30px] py-[20px] rounded-[10px]
                         hover:border-typesetter-frost/50 hover:bg-typesetter-frost/5
                         transition-all whitespace-nowrap"
            >
              Conocer Instalaciones
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
