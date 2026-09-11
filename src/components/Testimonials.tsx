import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

const REVIEWS = [
  {
    "author": "Martha Villegas",
    "text": "Me encantó el lugar, es para poco más de 100 personas. El salón es muy elegante y el personal sumamente atento. Fui como invitada y sin duda lo contrataría.",
    "stars": 5
  },
  {
    "author": "Adriana Angeles Ortega",
    "text": "Hicieron de la fiesta de Sofi una noche mágica e inolvidable. Mario Alberto siempre estuvo atento ayudándonos en cada detalle y con gran disposición. Un recuerdo precioso.",
    "stars": 5
  },
  {
    "author": "Daniela Ramirez",
    "text": "Las instalaciones y el servicio del anfitrión fueron excelentes. Todo salió muy bien con nuestro evento.",
    "stars": 5
  },
  {
    "author": "Invitado de Evento",
    "text": "Excelente organización, los meseros muy amables, la comida estuvo muy buena y tienen excelente calidad en todo lo que prometen.",
    "stars": 5
  }
]

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-1 shrink-0" aria-label={`${n} de 5 estrellas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className="w-3.5 h-3.5 text-highlighter-blue"
          aria-hidden="true" fill={i < Math.floor(n) ? 'currentColor' : i < n ? 'url(#rating-half-star)' : 'var(--color-slate-cobalt)'} viewBox="0 0 20 20">
          {i < n && i >= Math.floor(n) && (
            <defs>
              <linearGradient id="rating-half-star">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="var(--color-slate-cobalt)" />
              </linearGradient>
            </defs>
          )}
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function Testimonials() {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.from('.tm-rating', {
      opacity: 0, y: 30, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: ref.current, start: 'top 80%', once: true, invalidateOnRefresh: true },
    })
    gsap.from('.tm-card', {
      opacity: 0, y: 40, stagger: 0.15, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: ref.current, start: 'top 65%', once: true, invalidateOnRefresh: true },
    })
  }, { scope: ref })

  return (
    <section
      id="resenas"
      ref={ref}
      className="bg-bone-dark py-[80px] px-6 sm:px-10 xl:px-[80px]"
    >
      <div className="max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="mb-[60px]">
          <p className="font-twk-lausanne text-[11px] font-[550] uppercase tracking-[0.11px]
                        text-muted-sky mb-[20px]">
            Lo que dicen nuestros clientes
          </p>

          {/* Rating stat callout */}
          <div className="tm-rating flex items-end gap-[20px] flex-wrap">
            <span
              className="font-pp-mondwest font-[400] text-newsprint-gray leading-[0.9] tracking-[-0.04em]"
              style={{ fontSize: 'clamp(60px, 10vw, 155px)' }}
            >
              4.5
            </span>
            <div className="flex flex-col gap-[8px] pb-[8px]">
              <Stars n={4.5} />
              <span className="font-twk-lausanne text-[11px] font-[550] uppercase tracking-[0.11px]
                               text-newsprint-gray">
                / 5 · 75 opiniones en Google
              </span>
            </div>
          </div>
        </div>

        {/* Hairline */}
        <div className="w-full h-px bg-slate-cobalt mb-[60px]" />

        {/* Review cards — flat, hairline borders */}
        <div className="grid md:grid-cols-2 gap-px bg-slate-cobalt border border-slate-cobalt">
          {REVIEWS.map((r, i) => (
            <div
              key={i}
              className="tm-card bg-bone-dark p-[40px] flex flex-col gap-[20px]
                         hover:bg-press-blue-black/40 transition-colors duration-300"
            >
              {/* Large editorial quote mark */}
              <span
                className="font-pp-mondwest font-[400] text-slate-cobalt leading-[0.9] select-none"
                style={{ fontSize: '80px' }}
              >
                "
              </span>

              {/*
               * Editorial New (Cormorant italic 300) — the italic-leaning
               * secondary display face for editorial passages per DESIGN.md.
               * Tracking -0.02em, line-height 0.9 scaled to body context.
               */}
              <p className="font-editorial-new italic font-[300] text-[18px] leading-[1.4]
                            tracking-[-0.02em] text-typesetter-frost/90 flex-1">
                {r.text}
              </p>

              <div className="flex items-center justify-between pt-[20px] border-t border-slate-cobalt">
                <div>
                  <p className="font-twk-lausanne text-[11px] font-[550] uppercase tracking-[0.11px]
                                text-typesetter-frost">
                    {r.author}
                  </p>
                  <p className="font-twk-lausanne text-[11px] font-[350] tracking-[0.11px]
                                text-newsprint-gray mt-[4px]">
                    Google Reviews
                  </p>
                </div>
                <Stars n={r.stars} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
