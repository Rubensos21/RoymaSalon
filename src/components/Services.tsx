import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

const SERVICES = [
  { tag: 'Celebración', title: 'Cumpleaños',         body: 'Celebra tu día especial con familiares y amigos en un ambiente único y lleno de alegría.' },
  { tag: 'Familia',     title: 'Baby Shower',         body: 'Recibe a tu bebé con una celebración íntima y llena de ternura en nuestro acogedor espacio.' },
  { tag: 'Tradición',   title: 'Quinceañeras',        body: 'Un momento inolvidable para celebrar el paso a la madurez en un entorno elegante y familiar.' },
  { tag: 'Pareja',      title: 'Aniversarios',        body: 'Conmemora momentos especiales en pareja en un entorno íntimo, cálido y sofisticado.' },
  { tag: 'Familia',     title: 'Reuniones Familiares', body: 'El espacio perfecto para compartir en familia, crear memorias y fortalecer vínculos.' },
  { tag: 'Exclusivo',   title: 'Eventos Privados',    body: 'Cenas privadas, reuniones exclusivas y celebraciones corporativas con total privacidad.' },
]

export default function Services() {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.from('.sv-header > *', {
      opacity: 0, y: 30, stagger: 0.1, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: ref.current, start: 'top 80%', once: true, invalidateOnRefresh: true },
    })
    gsap.from('.sv-row', {
      opacity: 0, y: 20, stagger: 0.08, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: ref.current, start: 'top 65%', once: true, invalidateOnRefresh: true },
    })
  }, { scope: ref })

  return (
    <section
      id="servicios"
      ref={ref}
      className="bg-bone-dark py-[80px] px-6 sm:px-10 xl:px-[80px]"
    >
      <div className="max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="sv-header flex flex-col sm:flex-row sm:items-end sm:justify-between
                        gap-[20px] mb-[60px]">
          <div>
            <p className="font-twk-lausanne text-[11px] font-[550] uppercase tracking-[0.11px]
                          text-muted-sky mb-[20px]">
              Lo que celebramos juntos
            </p>
            <h2
              className="font-pp-mondwest font-[400] text-typesetter-frost leading-[0.9] tracking-[-0.04em]"
              style={{ fontSize: 'clamp(40px, 6vw, 96px)' }}
            >
              Servicios
            </h2>
          </div>
          <a
            href="#cotizar-evento"
            className="shrink-0 inline-flex items-center gap-2
                       bg-highlighter-blue text-typesetter-frost
                       font-twk-lausanne text-[11px] font-[550] uppercase tracking-[0.11px]
                       px-[20px] py-[10px] rounded-[5px]
                       hover:opacity-90 transition-opacity self-start"
            style={{ boxShadow: 'rgba(16,94,189,0.35) 1px 8px 20px 0px' }}
          >
            Cotizar Evento →
          </a>
        </div>

        {/* Divider line */}
        <div className="w-full h-px bg-slate-cobalt mb-[40px]" />

        {/* Service list — editorial rows */}
        <div className="divide-y divide-slate-cobalt">
          {SERVICES.map((s, i) => (
            <div
              key={i}
              className="sv-row flex flex-col sm:flex-row sm:items-start gap-[20px]
                         py-[30px] group hover:bg-press-blue-black/50
                         transition-colors duration-200 px-[4px]"
            >
              {/* Index + tag */}
              <div className="flex items-center gap-[20px] sm:w-[200px] shrink-0">
                <span className="font-twk-lausanne text-[11px] font-[550] text-newsprint-gray
                                 tabular-nums w-6">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-twk-lausanne text-[11px] font-[550] uppercase tracking-[0.11px]
                                 text-muted-sky">
                  {s.tag}
                </span>
              </div>

              {/* Title */}
              <h3
                className="font-pp-mondwest font-[400] text-typesetter-frost leading-[0.9] tracking-[-0.04em]
                           sm:w-[240px] shrink-0"
                style={{ fontSize: 'clamp(24px, 3vw, 36px)' }}
              >
                {s.title}
              </h3>

              {/* Body */}
              <p className="font-twk-lausanne font-[200] text-[14px] leading-[1.4] tracking-[0.14px]
                            text-newsprint-gray sm:ml-auto sm:max-w-sm">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
