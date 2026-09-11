import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

const FEATURES = [
  {
    "tag": "Instalaciones",
    "title": "Jardín & Salón Elegante",
    "body": "Espacio cuidado y limpio, con un jardín encantador y áreas verdes ideales para banquetes y sesiones fotográficas.",
    "stat": "01"
  },
  {
    "tag": "Capacidad",
    "title": "Capacidad +100 Personas",
    "body": "Salón íntimo y elegante, diseñado para celebraciones de poco más de 100 invitados.",
    "stat": "+100"
  },
  {
    "tag": "Atención",
    "title": "Organización y Coordinación",
    "body": "Organización detallada de principio a fin, con anfitriones y coordinadores dedicados a resolver cada detalle de tu evento.",
    "stat": "03"
  },
  {
    "tag": "Banquete",
    "title": "Servicio de Meseros y Banquete",
    "body": "Personal sumamente atento y servicial, con comida de excelente calidad garantizada para tu celebración.",
    "stat": "04"
  }
]

export default function VenueFeatures() {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.from('.vf-header > *', {
      opacity: 0, y: 30, stagger: 0.1, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: ref.current, start: 'top 80%', once: true, invalidateOnRefresh: true },
    })
    gsap.from('.vf-card', {
      opacity: 0, y: 40, stagger: 0.12, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: ref.current, start: 'top 65%', once: true, invalidateOnRefresh: true },
    })
  }, { scope: ref })

  return (
    <section
      id="el-salon"
      ref={ref}
      className="bg-press-blue-black py-[80px] px-6 sm:px-10 xl:px-[80px]"
    >
      <div className="max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="vf-header mb-[60px]">
          <p className="font-twk-lausanne text-[11px] font-[550] uppercase tracking-[0.11px]
                        text-muted-sky mb-[20px]">
            Por qué elegirnos
          </p>
          <h2
            className="font-pp-mondwest font-[400] text-typesetter-frost leading-[0.9] tracking-[-0.04em]"
            style={{ fontSize: 'clamp(40px, 6vw, 96px)' }}
          >
            Salón y Jardín
          </h2>
        </div>

        {/* Cards — flat, hairline borders, no shadows */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-cobalt border border-slate-cobalt">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="vf-card bg-press-blue-black p-[40px] flex flex-col gap-[20px]
                         hover:bg-bone-dark transition-colors duration-300"
            >
              {/* Category tag */}
              <span className="font-twk-lausanne text-[11px] font-[550] uppercase tracking-[0.11px]
                               text-muted-sky">
                {f.tag}
              </span>

              {/* Stat callout — Newsprint Gray, display-scale */}
              <span
                className="font-pp-mondwest font-[400] text-newsprint-gray leading-[0.9] tracking-[-0.04em]"
                style={{ fontSize: 'clamp(36px, 4vw, 60px)' }}
              >
                {f.stat}
              </span>

              <div>
                <h3 className="font-twk-lausanne font-[550] text-[18px] tracking-[-0.36px]
                               text-typesetter-frost mb-[10px]">
                  {f.title}
                </h3>
                <p className="font-twk-lausanne font-[200] text-[14px] leading-[1.4]
                              tracking-[0.14px] text-newsprint-gray">
                  {f.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
