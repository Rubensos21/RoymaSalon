import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

const MAPS_URL = 'https://maps.google.com/?q=GHQ5%2BX2+Poza+Rica+de+Hidalgo'
const WA_URL   = 'https://api.whatsapp.com/send?phone=527821137240&text=%C2%A1Hola!%20Me%20gustar%C3%ADa%20m%C3%A1s%20informaci%C3%B3n%20sobre%20el%20Sal%C3%B3n%20RoyMa.'

export default function BusinessInfo() {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.from('.bi-block', {
      opacity: 0, y: 30, stagger: 0.14, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: ref.current, start: 'top 75%', once: true, invalidateOnRefresh: true },
    })
  }, { scope: ref })

  return (
    <section
      id="ubicacion"
      ref={ref}
      className="bg-press-blue-black py-[80px] px-6 sm:px-10 xl:px-[80px]"
    >
      <div className="max-w-350 mx-auto">

        {/* Header */}
        <div className="bi-block mb-60">
          <p className="font-twk-lausanne text-[11px] font-[550] uppercase tracking-[0.11px]
                        text-muted-sky mb-20">
            Encuéntranos
          </p>
          <h2
            className="font-pp-mondwest font-normal text-typesetter-frost leading-[0.9] tracking-[-0.04em]"
            style={{ fontSize: 'clamp(40px, 6vw, 96px)' }}
          >
            Ubicación y Contacto
          </h2>
        </div>

        {/* Hairline */}
        <div className="w-full h-px bg-slate-cobalt mb-60" />

        {/* Two-column info */}
        <div className="grid md:grid-cols-2 gap-px bg-slate-cobalt border border-slate-cobalt">

          {/* Address */}
          <div className="bi-block bg-press-blue-black p-40 flex flex-col gap-30">
            <div>
              <span className="font-twk-lausanne text-[11px] font-[550] uppercase tracking-[0.11px]
                               text-muted-sky block mb-15">
                Dirección
              </span>
              <p className="font-twk-lausanne font-light text-[18px] leading-[1.4] tracking-[-0.36px]
                            text-typesetter-frost">
                Av Uno 1309, Santa Elena
              </p>
              <p className="font-twk-lausanne font-light text-[18px] leading-[1.4] tracking-[-0.36px]
                            text-typesetter-frost">
                93240 Poza Rica de Hidalgo, Ver.
              </p>
            </div>

            <div className="border-t border-slate-cobalt pt-30">
              <span className="font-twk-lausanne text-[11px] font-[550] uppercase tracking-[0.11px]
                               text-muted-sky block mb-15">
                Aviso de Visitas
              </span>
              <p className="font-twk-lausanne font-extralight text-[14px] leading-[1.4] tracking-[0.14px]
                            text-newsprint-gray">
                Atención y visitas presenciales{' '}
                <span className="text-typesetter-frost font-normal">previa cita</span>{' '}
                o llamada telefónica.
              </p>
            </div>

            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 self-start
                         bg-highlighter-blue text-typesetter-frost
                         font-twk-lausanne text-[11px] font-[550] uppercase tracking-[0.11px]
                         px-20 py-10 rounded-md
                         hover:opacity-90 transition-opacity"
              style={{ boxShadow: 'rgba(16,94,189,0.35) 1px 8px 20px 0px' }}
            >
              Cómo llegar →
            </a>
          </div>

          {/* Contact */}
          <div className="bi-block bg-press-blue-black p-40 flex flex-col gap-30">
            <div>
              <span className="font-twk-lausanne text-[11px] font-[550] uppercase tracking-[0.11px]
                               text-muted-sky block mb-15">
                Teléfono
              </span>
              <a
                href="tel:7821137240"
                className="font-pp-mondwest font-normal text-typesetter-frost leading-[0.9]
                           tracking-[-0.04em] hover:text-highlighter-blue transition-colors"
                style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}
              >
                782 113 7240
              </a>
            </div>

            <div className="border-t border-slate-cobalt pt-30 flex flex-col gap-20 mt-auto">
              <a
                href="tel:7821137240"
                className="inline-flex items-center border border-typesetter-frost/20 text-typesetter-frost
                           font-twk-lausanne text-[11px] font-[550] uppercase tracking-[0.11px]
                           px-20 py-3 rounded-lg self-start
                           hover:border-typesetter-frost/50 hover:bg-typesetter-frost/5 transition-all"
              >
                Llamar Ahora
              </a>
              <a
                href={WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2
                           bg-highlighter-blue text-typesetter-frost
                           font-twk-lausanne text-[11px] font-[550] uppercase tracking-[0.11px]
                           px-20 py-3 rounded-md self-start
                           hover:opacity-90 transition-opacity"
                style={{ boxShadow: 'rgba(16,94,189,0.35) 1px 8px 20px 0px' }}
              >
                {/* WhatsApp icon */}
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
