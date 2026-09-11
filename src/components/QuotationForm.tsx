import { useState, useRef, useEffect, useMemo } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { supabase, type EventQuote } from '../lib/supabase.ts'

const EVENT_TYPES = [
  'Fiesta Familiar', 'Cumpleaños', 'Baby Shower',
  'Aniversario', 'Quinceañera', 'Reunión Privada', 'Otro',
]

interface FormState {
  client_name:  string
  client_phone: string
  event_type:   string
  event_date:   string
  guest_count:  string
  notes:        string
}

const EMPTY: FormState = {
  client_name: '', client_phone: '', event_type: '',
  event_date: '', guest_count: '', notes: '',
}

const MX_TZ = 'America/Mexico_City' as const

// Intl formatter: convierte un Date a "día/mes/año" en tz CDMX (2-digit en todas partes, UTC-safe)
const MX_DAY_FMT = new Intl.DateTimeFormat('es-MX', {
  timeZone: MX_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/**
 * Normaliza cualquier fecha a "YYYY-MM-DD" (key canónica, DÍA EN CDMX).
 *  - Si le pasas "2026-08-10" (input date) → lo retorna TAL CUAL (sin tz hell)
 *  - Si le pasas un ISO largo "2026-08-10T18:00:00+00" o Date → formatea con Intl a tz CDMX
 *    → en el ejemplo: 18:00 UTC = 12:00 CDMX → retorna "2026-08-10" (correcto)
 */
function toDayKey(input: string | Date): string {
  if (!input) return ''

  // Caso 1: string corto YYYY-MM-DD (viene de <input type="date">) — retornar tal cual
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) return input

  const date = typeof input === 'string' ? new Date(input) : (input as Date)
  if (!date || Number.isNaN(date.getTime())) return ''

  // Caso 2: ISO largo / Date → formatear a día/mes/año en tz CDMX
  const parts = MX_DAY_FMT.formatToParts(date)
  const pick = (t: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === t)?.value ?? ''
  const y = pick('year')
  const m = pick('month')
  const d = pick('day')
  if (!y || !m || !d) return ''
  return `${y}-${m}-${d}`
}

/**
 * Dada una key "YYYY-MM-DD", retorna el TIMESTAMPTZ de las 00:00 y las 23:59:59.999
 * HUSO HORARIO DE MÉXICO (para que el rango "todo el día" sea exactamente lo que un cliente en CDMX entiende por ese día).
 * Usamos "YYYY-MM-DDTHH:mm:ss" sin sufijo Z, así que PostgreSQL lo interpreta como local,
 * y a la vez, concatenamos offset -06:00 fijo para comparación segura con timestamptz.
 */
function dayRangeIso(dayKey: string): { start: string; end: string } {
  const [y, m, d] = dayKey.split('-')
  const start = `${y}-${m}-${d}T00:00:00.000-06:00`
  const end   = `${y}-${m}-${d}T23:59:59.999-06:00`
  return { start, end }
}

function formatDateForWhatsApp(dayKey: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dayKey)
  return match ? `${match[3]}/${match[2]}/${match[1]}` : 'por confirmar'
}

function buildWA(f: FormState) {
  const msg =
    `¡Hola! Solicité una cotización en la web para Salón Jardín LÍA Pachuca para un evento de ` +
    `${f.event_type} el día ${formatDateForWhatsApp(f.event_date)} ` +
    `con ${f.guest_count || 'N/A'} invitados a nombre de ${f.client_name}.`
  return `https://wa.me/527712202862?text=${encodeURIComponent(msg)}`
}

const INPUT =
  'w-full bg-bone-dark border border-slate-cobalt text-typesetter-frost ' +
  'font-twk-lausanne text-[14px] font-[300] tracking-[0.14px] ' +
  'px-[20px] py-[15px] rounded-[5px] placeholder:text-newsprint-gray/60 ' +
  'focus:outline-none focus:border-highlighter-blue transition-colors duration-200'

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block font-twk-lausanne text-[11px] font-[550] uppercase
                      tracking-[0.11px] text-newsprint-gray mb-[8px]">
      {children}
    </label>
  )
}

export default function QuotationForm() {
  const ref        = useRef<HTMLDivElement>(null)
  const successRef = useRef<HTMLDivElement>(null)

  const [form,       setForm]       = useState<FormState>(EMPTY)
  const [loading,    setLoading]    = useState(false)
  const [submitted,  setSubmitted]  = useState(false)
  const [dbError,    setDbError]    = useState<string | null>(null)
  const [dbSaved,    setDbSaved]    = useState(false)
  const [busyDays,   setBusyDays]   = useState<Set<string>>(new Set())
  const [loadingDays, setLoadingDays] = useState(false)

  useEffect(() => {
    let cancelled = false

    const loadBusy = async () => {
      setLoadingDays(true)
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('appointment_date')
          .gte('appointment_date', new Date().toISOString())
        if (cancelled) return
        if (error) { console.warn('Error cargando días ocupados:', error.message); return }
        if (!data) return
        const days = new Set<string>()
        for (const row of data as Array<{ appointment_date: string }>) {
          const key = toDayKey(row.appointment_date)
          if (key) days.add(key)
        }
        setBusyDays(days)
      } catch (err) {
        if (!cancelled) console.warn('Error de red cargando días ocupados:', err)
      } finally {
        if (!cancelled) setLoadingDays(false)
      }
    }

    void loadBusy()
    return () => { cancelled = true }
  }, [])

  const selectedDayKey = useMemo(() => (form.event_date ? toDayKey(form.event_date) : ''), [form.event_date])
  const dateIsBusy = Boolean(selectedDayKey && busyDays.has(selectedDayKey))
  const submitDisabled = loading || dateIsBusy

  useGSAP(() => {
    gsap.from('.qf-card', {
      opacity: 0, y: 50, duration: 0.9, ease: 'power2.out',
      scrollTrigger: { trigger: ref.current, start: 'top 72%', once: true, invalidateOnRefresh: true },
    })
  }, { scope: ref })

  const playSuccess = () => {
    if (!successRef.current) return
    gsap.from(successRef.current, { opacity: 0, y: 30, duration: 0.6, ease: 'power3.out' })
    gsap.from('.qs-line', { opacity: 0, y: 12, stagger: 0.1, duration: 0.5, ease: 'power2.out', delay: 0.2 })
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.name === 'client_phone'
      ? e.target.value.replace(/\D/g, '').slice(0, 10)
      : e.target.value

    setForm(p => ({ ...p, [e.target.name]: value }))
    setDbError(null)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setDbError(null)
    setDbSaved(false)

    const clientName  = form.client_name.trim()
    const clientPhone = form.client_phone.trim()
    const guestsNum   = form.guest_count ? +form.guest_count : null

    // 12:00 p.m. CDMX: día seleccionado por usuario, o hoy + 7 días
    const appointmentDayKey = form.event_date
      ? form.event_date
      : (() => {
          const t = new Date()
          t.setDate(t.getDate() + 7)
          return toDayKey(t)
        })()

    // Construye appointment_date con sufijo -06:00 fijo → 12:00 PM CDMX
    const appointmentDateIso = `${appointmentDayKey}T12:00:00.000-06:00`

    // ── VALIDACIÓN ANTI-RACE ────────────────────────────────────────────────
    //    Rechequea en Supabase si alguien ya agendó ESTE MISMO DÍA entre que
    //    cargó el formulario y el usuario presionó "Enviar".
    //    (Soluciona caso: 2 personas abren el form al mismo tiempo y eligen
    //    la misma fecha — ambos la verían "libre" sin este chequeo final).
    if (appointmentDayKey) {
      const { start: dayStart, end: dayEnd } = dayRangeIso(appointmentDayKey)
      try {
        const { count, error: countErr } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .gte('appointment_date', dayStart)
          .lte('appointment_date', dayEnd)
        if (countErr) throw countErr
        if (count && count > 0) {
          setDbError(
            `Ups — el día ${appointmentDayKey} acaba de ser apartado por otro cliente ` +
            'mientras llenabas el formulario. Por favor elige otra fecha.',
          )
          setBusyDays((prev) => new Set(prev).add(appointmentDayKey))
          setLoading(false)
          return
        }
      } catch (err) {
        console.warn('Error en validación anti-race (continuando):', err)
      }
    }

    const quote: EventQuote = {
      client_name:  clientName,
      client_phone: clientPhone,
      event_type:   form.event_type,
      event_date:   form.event_date || null,
      guest_count:  guestsNum,
      notes:        form.notes.trim() || null,
    }

    // ── Construye service descriptivo para el dashboard ──
    const serviceParts = [`Cotización: ${form.event_type}`]
    if (guestsNum) serviceParts.push(`(${guestsNum} invitados)`)
    const serviceText = serviceParts.join(' ')

    const appointmentRow = {
      client_name:      clientName,
      client_phone:     clientPhone,
      appointment_date: appointmentDateIso,
      service:          serviceText,
      status:           'pending' as const,
    }

    // ── 1) Insert en event_quotes + leer el UUID recién generado ─────────────
    const { data: insertedQuotes, error: quotesErr } = await supabase
      .from('event_quotes')
      .insert([quote])
      .select('id')

    const eventQuoteId =
      insertedQuotes && Array.isArray(insertedQuotes) && insertedQuotes[0]
        ? (insertedQuotes[0] as { id: string }).id
        : null

    const appointmentRowWithFk = eventQuoteId
      ? { ...appointmentRow, event_quote_id: eventQuoteId }
      : appointmentRow

    // ── 2) Insert en appointments (incluye FK a event_quotes para cascade delete)
    const { error: aptErr } = await supabase
      .from('appointments')
      .insert([appointmentRowWithFk])

    // `appointments` es la fuente que consume /agenda. La copia en
    // `event_quotes` es complementaria y puede estar restringida por RLS sin
    // que eso signifique que la solicitud principal no se guardó.
    if (aptErr) {
      const code = aptErr.code ?? 'desconocido'
      const hint =
        code === '42P01'
          ? 'Falta la tabla appointments. Revisa la configuración de Supabase.'
          : code === '42501'
          ? 'RLS bloqueó el INSERT en appointments. Revisa la política anon de esa tabla.'
          : code === '42703'
          ? 'La columna event_quote_id no existe en appointments. Ejecuta el SQL ALTER TABLE del mensaje arriba.'
          : `Código Supabase: ${code}`

      setDbError(`${aptErr.message} — ${hint}`)
    } else {
      setDbSaved(true)
      if (appointmentDayKey) {
        setBusyDays((prev) => new Set(prev).add(appointmentDayKey))
      }

      if (quotesErr) {
        console.warn(
          '[Cotización] La solicitud se guardó en appointments; no se pudo crear la copia en event_quotes:',
          quotesErr.message,
        )
      }
    }

    setLoading(false)
    setSubmitted(true)
    setTimeout(() => { playSuccess(); window.open(buildWA(form), '_blank') }, 80)
  }

  // ── Success / error state ──────────────────────────────────────────────────
  if (submitted) {
    return (
      <section id="cotizar-evento" ref={ref}
        className="bg-press-blue-black py-[80px] px-6 sm:px-10 xl:px-[80px]">
        <div className="max-w-[1400px] mx-auto">
          <div ref={successRef} className="max-w-lg">

            {/* Status tag */}
            <span className={`qs-line font-twk-lausanne text-[11px] font-[550] uppercase
                              tracking-[0.11px] block mb-[20px]
                              ${dbSaved ? 'text-highlighter-blue' : 'text-amber-400'}`}>
              {dbSaved ? '¡Solicitud guardada!' : 'Enviado por WhatsApp (sin guardar en BD)'}
            </span>

            <h2 className="qs-line font-pp-mondwest font-[400] text-typesetter-frost
                           leading-[0.9] tracking-[-0.04em] mb-[20px]"
              style={{ fontSize: 'clamp(36px, 5vw, 72px)' }}>
              Gracias,<br />{form.client_name}
            </h2>

            {/* DB error banner — shown when Supabase rejected the insert */}
            {dbError && (
              <div className="qs-line border border-amber-400/40 bg-amber-400/5
                              rounded-[5px] px-[20px] py-[15px] mb-[20px]">
                <p className="font-twk-lausanne text-[11px] font-[550] uppercase
                               tracking-[0.11px] text-amber-400 mb-[8px]">
                  Error al guardar en base de datos
                </p>
                <p className="font-twk-lausanne font-[300] text-[13px] leading-[1.5]
                               text-amber-400/80">
                  {dbError}
                </p>
                <p className="font-twk-lausanne font-[300] text-[13px] leading-[1.5]
                               text-newsprint-gray mt-[8px]">
                  Tu solicitud fue enviada por WhatsApp de todas formas — no se perdió ningún dato.
                </p>
              </div>
            )}

            {!dbError && (
              <p className="qs-line font-twk-lausanne font-[200] text-[16px] leading-[1.4]
                             text-newsprint-gray mb-[40px]">
                Hemos registrado tu solicitud y abierto WhatsApp con un mensaje
                pre-llenado para confirmar los detalles.
              </p>
            )}

            <div className="qs-line flex flex-col sm:flex-row gap-[20px] mt-[20px]">
              <a href={buildWA(form)} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2
                           bg-highlighter-blue text-typesetter-frost
                           font-twk-lausanne text-[11px] font-[550] uppercase tracking-[0.11px]
                           px-[30px] py-[20px] rounded-[5px] hover:opacity-90 transition-opacity"
                style={{ boxShadow: 'rgba(16,94,189,0.35) 1px 8px 20px 0px' }}>
                Abrir WhatsApp
              </a>
              <button onClick={() => { setSubmitted(false); setForm(EMPTY); setDbError(null); setDbSaved(false) }}
                className="inline-flex items-center border border-typesetter-frost/25 text-typesetter-frost
                           font-twk-lausanne text-[11px] font-[550] uppercase tracking-[0.11px]
                           px-[30px] py-[20px] rounded-[10px]
                           hover:border-typesetter-frost/50 hover:bg-typesetter-frost/5 transition-all">
                Nueva Cotización
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <section id="cotizar-evento" ref={ref}
      className="bg-press-blue-black py-[80px] px-6 sm:px-10 xl:px-[80px]">
      <div className="max-w-[1400px] mx-auto">

        <div className="mb-[60px]">
          <p className="font-twk-lausanne text-[11px] font-[550] uppercase tracking-[0.11px]
                        text-muted-sky mb-[20px]">
            Tu celebración perfecta
          </p>
          <h2 className="font-pp-mondwest font-[400] text-typesetter-frost
                         leading-[0.9] tracking-[-0.04em]"
            style={{ fontSize: 'clamp(40px, 6vw, 96px)' }}>
            Cotiza tu Evento
          </h2>
        </div>

        <form onSubmit={onSubmit} className="qf-card max-w-2xl">

          <div className="w-full h-px bg-slate-cobalt mb-[40px]" />

          {/* 01 — Datos del cliente */}
          <div className="mb-[10px]">
            <span className="font-twk-lausanne text-[11px] font-[550] uppercase tracking-[0.11px]
                             text-muted-sky block mb-[20px]">
              01 — Datos del Cliente
            </span>
            <div className="grid sm:grid-cols-2 gap-[20px]">
              <div>
                <Label>Nombre Completo *</Label>
                <input type="text" name="client_name" value={form.client_name}
                  onChange={onChange} required placeholder="Tu nombre completo" className={INPUT} />
              </div>
              <div>
                <Label>WhatsApp *</Label>
                <input type="tel" name="client_phone" value={form.client_phone}
                  onChange={onChange} required inputMode="numeric" autoComplete="tel-national"
                  pattern="[0-9]{10}" minLength={10} maxLength={10}
                  title="Ingresa un número telefónico de 10 dígitos"
                  placeholder="7711234567" className={INPUT} />
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-slate-cobalt my-[30px]" />

          {/* 02 — Detalles del evento */}
          <div className="mb-[10px]">
            <span className="font-twk-lausanne text-[11px] font-[550] uppercase tracking-[0.11px]
                             text-muted-sky block mb-[20px]">
              02 — Detalles del Evento
            </span>
            <div className="grid sm:grid-cols-2 gap-[20px]">
              <div>
                <Label>Tipo de Evento *</Label>
                <select name="event_type" value={form.event_type}
                  onChange={onChange} required className={INPUT + ' cursor-pointer'}>
                  <option value="" disabled>Selecciona...</option>
                  {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-[8px]">
                  <Label>Fecha Estimada</Label>
                  {loadingDays && (
                    <span className="font-twk-lausanne text-[10px] font-[350] uppercase tracking-[0.11px] text-newsprint-gray inline-flex items-center gap-1.5">
                      <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Verificando disponibilidad…
                    </span>
                  )}
                </div>
                <input type="date" name="event_date" value={form.event_date}
                  onChange={onChange}
                  min={toDayKey(new Date())}
                  aria-invalid={dateIsBusy || undefined}
                  className={
                    INPUT +
                    (dateIsBusy
                      ? ' !border-red-500/60 !bg-red-500/5 focus:!border-red-500'
                      : '')
                  } />
                {dateIsBusy && (
                  <p role="alert" className="mt-[10px] flex items-start gap-2
                    font-twk-lausanne text-[12px] font-[400] tracking-[0.14px] text-red-400">
                    <svg className="w-4 h-4 shrink-0 mt-[1px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    <span>
                      Este día ya se encuentra <b>apartado</b>. Por favor elige otra fecha
                      — o déjala en blanco y te contactaremos para confirmar disponibilidad.
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-slate-cobalt my-[30px]" />

          {/* 03 — Logística */}
          <div className="mb-[10px]">
            <span className="font-twk-lausanne text-[11px] font-[550] uppercase tracking-[0.11px]
                             text-muted-sky block mb-[20px]">
              03 — Logística
            </span>
            <div>
              <Label>Número Aproximado de Invitados</Label>
              <input type="number" name="guest_count" value={form.guest_count}
                onChange={onChange} min={1} placeholder="Ej. 50"
                className={INPUT + ' sm:w-1/2'} />
            </div>
          </div>

          <div className="w-full h-px bg-slate-cobalt my-[30px]" />

          {/* Notas */}
          <div className="mb-[40px]">
            <Label>Notas o Requerimientos Especiales</Label>
            <textarea name="notes" value={form.notes} onChange={onChange} rows={4}
              placeholder="Tema decorativo, servicios adicionales, etc."
              className={INPUT + ' resize-none'} />
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row items-start gap-[20px]">
            <button type="submit" disabled={submitDisabled}
              className="inline-flex items-center justify-center gap-2
                         bg-highlighter-blue text-typesetter-frost
                         font-twk-lausanne text-[11px] font-[550] uppercase tracking-[0.11px]
                         px-[30px] py-[20px] rounded-[5px]
                         hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-opacity"
              style={{ boxShadow: 'rgba(16,94,189,0.35) 1px 8px 20px 0px' }}>
              {loading
                ? <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10"
                        stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Guardando...
                  </span>
                : dateIsBusy
                  ? 'Elige otra fecha para continuar'
                  : 'Solicitar Cotización → WhatsApp'
              }
            </button>
            <p className="font-twk-lausanne text-[11px] font-[350] tracking-[0.11px]
                          text-newsprint-gray self-center">
              {dateIsBusy
                ? <>La fecha seleccionada ya está reservada. Elige otra u omítela y te contactaremos.</>
                : <>Al enviar se abrirá WhatsApp para confirmar los detalles.</>}
            </p>
          </div>
        </form>
      </div>
    </section>
  )
}
