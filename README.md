# Salón Jardín LÍA Pachuca

Landing page y cotizador de eventos para **Salón Jardín LÍA Pachuca**, ubicado en Pachuca, Hidalgo.

Una experiencia web pensada para presentar el salón, destacar sus servicios y facilitar solicitudes de cotización con un flujo rápido, visual y directo a WhatsApp.

## Vista general

Este proyecto combina una landing page moderna con un backend ligero para capturar cotizaciones y guardarlas en Supabase. La interfaz está construida para transmitir confianza, mostrar información clave del negocio y convertir visitas en solicitudes reales.

## Funcionalidades

- Presentación del salón con secciones informativas y llamada a la acción clara.
- Formulario de cotización para eventos con validación y envío al backend.
- Persistencia de solicitudes en Supabase.
- Animaciones con GSAP para una navegación más dinámica.
- Apertura automática de WhatsApp con mensaje prellenado al completar la solicitud.

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + Vite 8 + TypeScript |
| Estilos | Tailwind CSS v4 |
| Animaciones | GSAP 3 + @gsap/react |
| Backend | Next.js 15 App Router |
| Base de datos | Supabase (PostgreSQL) |

## Estructura

```
SalonJardinLia/
├── src/                      Frontend principal en React
│   ├── components/           Secciones de la web
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── api/                      Backend Next.js para la API
│   └── app/api/quotes/       Endpoint POST /api/quotes
├── public/
└── vite.config.ts            Proxy local hacia la API
```

## Instalación

```bash
npm install
cd api && npm install
```

## Variables de entorno

```bash
cp api/.env.example api/.env.local
```

Después, edita `api/.env.local` con tus credenciales de Supabase.

## Base de datos

Ejecuta este SQL en el editor de Supabase:

```sql
create table public.event_quotes (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  client_phone text not null,
  event_type text not null,
  event_date date,
  guest_count integer,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.event_quotes enable row level security;

create policy "Service role can insert"
  on public.event_quotes for insert
  to service_role
  with check (true);

create policy "Service role can select"
  on public.event_quotes for select
  to service_role
  using (true);
```

## Desarrollo local

Abre dos terminales:

```bash
# Frontend
npm run dev

# Backend
cd api && npm run dev
```

El frontend usa proxy para redirigir `/api/*` hacia `http://localhost:3001`, así que no hace falta configurar CORS en desarrollo.

## Flujo del cotizador

1. El usuario completa el formulario.
2. El frontend envía `POST /api/quotes`.
3. La API valida y guarda la solicitud en Supabase.
4. Se muestra confirmación y se abre WhatsApp con el mensaje preparado.

## Despliegue

- Frontend: carpeta raíz como proyecto Vite en Vercel o Netlify.
- API: carpeta `api/` como proyecto Next.js en Vercel.

En producción, ajusta el proxy o la variable de entorno de la API para apuntar al dominio final.
