const LINKS = [
  { label: 'Inicio',         href: '#inicio' },
  { label: 'El Salón',       href: '#el-salon' },
  { label: 'Servicios',      href: '#servicios' },
  { label: 'Cotizar Evento', href: '#cotizar-evento' },
  { label: 'Reseñas',        href: '#resenas' },
  { label: 'Ubicación',      href: '#ubicacion' },
]

export default function Footer() {
  return (
    <footer className="bg-press-blue-black border-t border-slate-cobalt
                       py-[60px] px-6 sm:px-10 xl:px-[80px]">
      <div className="max-w-[1400px] mx-auto">

        {/* Main footer grid */}
        <div className="grid sm:grid-cols-3 gap-[60px] mb-[60px]">

          {/* Brand */}
          <div className="flex flex-col gap-[20px]">
            <div>
              <span
                className="font-twk-lausanne font-[700] text-[15px] tracking-[-0.02em] text-typesetter-frost"
                style={{ borderBottom: '2px solid #2B9BEE', paddingBottom: '1px' }}
              >
                SALÓN
              </span>
              <span className="font-twk-lausanne font-[700] text-[15px] tracking-[-0.02em]
                               text-typesetter-frost ml-1.5">
                ROYMA
              </span>
            </div>
            <p className="font-twk-lausanne font-[200] text-[14px] leading-[1.4] tracking-[0.14px]
                          text-newsprint-gray max-w-xs">
              El espacio ideal, acogedor y climatizado para tus celebraciones
              familiares y eventos privados en Poza Rica, Veracruz.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <span className="font-twk-lausanne text-[11px] font-[550] uppercase tracking-[0.11px]
                             text-muted-sky block mb-[20px]">
              Navegación
            </span>
            <ul className="space-y-[12px]">
              {LINKS.map(l => (
                <li key={l.href}>
                  {/* Underlined text link per DESIGN.md */}
                  <a
                    href={l.href}
                    className="font-times text-[16px] text-newsprint-gray leading-[1.2]
                               underline underline-offset-2 decoration-newsprint-gray/30
                               hover:text-typesetter-frost hover:decoration-typesetter-frost/40
                               transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <span className="font-twk-lausanne text-[11px] font-[550] uppercase tracking-[0.11px]
                             text-muted-sky block mb-[20px]">
              Contacto
            </span>
            <div className="space-y-[12px]">
              {[
                { label: 'Av Uno 1309, Santa Elena', href: undefined },
                { label: '93240 Poza Rica de Hidalgo, Ver.', href: undefined },
                { label: '782 113 7240', href: 'tel:7821137240' },
                { label: 'WhatsApp', href: 'https://api.whatsapp.com/send?phone=527821137240' },
                { label: 'Ver en Google Maps', href: 'https://maps.google.com/?q=GHQ5%2BX2+Poza+Rica+de+Hidalgo' },
              ].map((item, i) =>
                item.href ? (
                  <a
                    key={i}
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="font-times text-[16px] text-newsprint-gray leading-[1.2] block
                               underline underline-offset-2 decoration-newsprint-gray/30
                               hover:text-typesetter-frost hover:decoration-typesetter-frost/40
                               transition-colors"
                  >
                    {item.label}
                  </a>
                ) : (
                  <p key={i} className="font-times text-[16px] text-newsprint-gray leading-[1.2]">
                    {item.label}
                  </p>
                )
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-cobalt pt-[30px] flex flex-col sm:flex-row
                        items-start sm:items-center justify-between gap-[12px]">
          <p className="font-twk-lausanne text-[11px] font-[350] tracking-[0.11px] text-newsprint-gray">
            © {new Date().getFullYear()} Salón RoyMa. Todos los derechos reservados.
          </p>
          <p className="font-twk-lausanne text-[11px] font-[350] tracking-[0.11px] text-newsprint-gray">
            Poza Rica de Hidalgo, Veracruz, México
          </p>
        </div>
      </div>
    </footer>
  )
}
