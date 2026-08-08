import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

export default function AccentBand() {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.from('.ab-content > *', {
      opacity: 0, y: 40, stagger: 0.12, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: ref.current, start: 'top 75%', once: true, invalidateOnRefresh: true },
    })
  }, { scope: ref })

  return (
    /*
     * Full-bleed #2B9BEE band — the page's closing signature per DESIGN.md.
     * Acts as a visual full stop between content sections and the footer.
     */
    <div
      ref={ref}
      className="bg-highlighter-blue py-[80px] px-6 sm:px-10 xl:px-[80px]"
    >
      <div className="max-w-350 mx-auto">
        <div className="ab-content flex flex-col gap-40">

          {/* Wordmark top-left — editorial signature */}
          <span className="font-twk-lausanne text-[11px] font-[550] uppercase tracking-[0.11px]
                           text-typesetter-frost/60">
            Salón RoyMa · Poza Rica, Veracruz
          </span>

          {/* Big closing statement */}
          <h2
            className="font-pp-mondwest font-400 text-typesetter-frost leading-[0.9] tracking-[-0.04em]"
            style={{ fontSize: 'clamp(48px, 9vw, 155px)' }}
          >
            ¿Listo para<br />celebrar?
          </h2>

          <div className="flex flex-col sm:flex-row items-start gap-20">
            {/* Primary on blue — bone-dark fill */}
            <a
              href="#cotizar-evento"
              className="inline-flex items-center gap-2
                         bg-bone-dark text-typesetter-frost
                         font-twk-lausanne text-[11px] font-[550] uppercase tracking-[0.11px]
                         px-30 py-20 rounded-md
                         hover:bg-press-blue-black transition-colors"
            >
              Cotizar mi Evento →
            </a>
            <a
              href="tel:7821137240"
              className="inline-flex items-center border border-typesetter-frost/40 text-typesetter-frost
                         font-twk-lausanne text-[11px] font-[550] uppercase tracking-[0.11px]
                         px-30 py-20 rounded-lg
                         hover:border-typesetter-frost hover:bg-typesetter-frost/10 transition-all"
            >
              782 113 7240
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
