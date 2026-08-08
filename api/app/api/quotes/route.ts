import { NextRequest, NextResponse } from 'next/server'
import { supabase, type EventQuote } from '@/lib/supabase'

// ── CORS pre-flight ────────────────────────────────────────────────────────
export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

// ── POST /api/quotes ───────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // Parse body
  let body: Partial<EventQuote>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo de solicitud inválido.' }, { status: 400 })
  }

  const { client_name, client_phone, event_type, event_date, guest_count, notes } = body

  // Basic validation
  if (!client_name?.trim() || !client_phone?.trim() || !event_type?.trim()) {
    return NextResponse.json(
      { error: 'Los campos Nombre, Teléfono y Tipo de Evento son obligatorios.' },
      { status: 422 }
    )
  }

  // Persist to Supabase
  const { data, error } = await supabase
    .from('event_quotes')
    .insert<EventQuote>([
      {
        client_name:  client_name.trim(),
        client_phone: client_phone.trim(),
        event_type:   event_type.trim(),
        event_date:   event_date   ?? null,
        guest_count:  guest_count  ?? null,
        notes:        notes?.trim() ?? null,
      },
    ])
    .select()

  if (error) {
    console.error('[quotes] Supabase error:', error.message)
    return NextResponse.json(
      { error: 'No se pudo guardar la cotización. Intenta de nuevo.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, data }, { status: 201 })
}
