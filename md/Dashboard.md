1. REQUISITOS GENERALES DEL PROYECTO
Nombre del proyecto: Agenda Dashboard (gestión de citas para barbería/salón)
Tecnologías a utilizar:
Frontend: React 18+ con TypeScript
Estilos: Tailwind CSS (clases utilitarias)
Base de datos: Supabase (PostgreSQL)
Persistencia local: localStorage y sessionStorage
Audio: Web Audio API para notificaciones

2. TIPOS Y DEFINICIONES (types/index.ts)
typescript
export type Status = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export interface Appointment {
  id: string;
  client_name: string;
  client_phone: string;
  appointment_date: string; // ISO 8601
  service: string;
  status?: Status;
  created_at?: string;
}

export interface AppointmentCardProps {
  apt: Appointment;
  status: Status;
  isNew: boolean;
  onSetStatus: (id: string, status: Status) => void;
  onReschedule: (id: string, date: string, time: string) => void;
  onDelete: (id: string) => void;
}
3. FUNCIONES HELPER (utils/helpers.ts)
Genera el código para las siguientes funciones con sus respectivos comentarios JSDoc:

3.1 getDeletedIds(): Set<string>
Recupera del localStorage la lista de IDs eliminados bajo la clave bg_deleted_ids
Retorna un Set<string> para búsquedas eficientes
Maneja errores de parseo con try/catch

3.2 playDing()
Reproduce un sonido de notificación de dos tonos usando Web Audio API
Frecuencias: 880Hz (0s) y 1108Hz (0.18s)
Decaimiento exponencial del volumen
Fallo silencioso si el navegador no soporta la API

3.3 isToday(dateStr: string): boolean
Compara si la fecha proporcionada es hoy (ignora horas)
Compara año, mes y día

3.4 isUpcoming(dateStr: string): boolean
Verifica si la fecha es futura (desde mañana a las 00:00 en adelante)
Retorna true si la fecha es >= mañana

3.5 isPast(dateStr: string): boolean
Verifica si la fecha es anterior al momento actual
Útil para aplicar estilos de opacidad

3.6 formatDateTime(dateStr: string): string
Formatea fecha en español con formato: "mié 15 ene 14:30"
Usa toLocaleString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

3.7 todayInSpanish(): string
Retorna la fecha actual en formato largo: "jueves 31 de julio de 2026"
Usa toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

4. COMPONENTE PINSCREEN (components/PinScreen.tsx)
Propósito: Pantalla de bloqueo que solicita un PIN de 4 dígitos para acceder a la agenda.
Requisitos:
Props: { onUnlock: () => void }
PIN fijo: AGENDA_PIN = "1234" (debe ser una constante)

Estados:
digits: string[] (array de dígitos ingresados)
shake: boolean (animación de error)
Teclado: Disposición numérica con botón de borrado
Indicador: 4 puntos que se iluminan al ingresar dígitos
Función handleKey(key: string):
Ignora pulsaciones si shake está activo
Si key === "back" → elimina el último dígito
Si ya hay 4 dígitos → ignora la pulsación

Al completar 4 dígitos:
Éxito: Guarda "1" en sessionStorage bajo "bg_agenda_auth" y llama a onUnlock()
Fallo: Activa shake, después de 600ms lo desactiva y limpia los dígitos
Diseño: Fondo oscuro, indicador de puntos, teclado numérico estilo iOS/Android.

5. COMPONENTE APPOINTMENTCARD (components/AppointmentCard.tsx)
Propósito: Tarjeta que muestra la información de una cita con sus acciones correspondientes según el estado.
Props:
typescript
{
  apt: Appointment;
  status: Status;
  isNew: boolean;
  onSetStatus: (id: string, status: Status) => void;
  onReschedule: (id: string, date: string, time: string) => void;
  onDelete: (id: string) => void;
}
Estados internos:
rescheduling: boolean (muestra el formulario de reagendamiento)
newDate: string (input de fecha en formato "YYYY-MM-DD")
newTime: string (input de hora en formato "HH:MM")
confirmDelete: boolean (muestra confirmación de borrado)

Estilos dinámicos:
past: aplica opacity-70 si isPast(apt.appointment_date)
isDone: true si status es 'completed', 'no_show' o 'cancelled'
Mapeo de estados (badges):

typescript
const statusBadgeClass = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-gray-100 text-gray-800',
};

Acciones según estado:
Estado	Botones/Acciones
'pending'	Confirmar, Reagendar, Cancelar, WhatsApp
'confirmed'	Terminada, No se presentó, Cancelar, WhatsApp
'completed' o 'no_show'	Borrar
'cancelled'	Borrar

Modal de Reagendamiento:
Inputs de fecha y hora
Botón "Guardar Cambios" → valida que no estén vacíos y llama a onReschedule(id, newDate, newTime)
Botón "Cancelar" → cierra el modal
Modal de Confirmación de Borrado:
Mensaje: "¿Eliminar cita con [client_name]?"
Botón "Sí, Borrar" → llama a onDelete(id)
Botón "Cancelar" → cierra el modal
WhatsApp integración:

Limpia el teléfono (cleanPhone = apt.client_phone.replace(/\D/g, ''))
Mensaje predefinido: "Hola [client_name], te recordamos tu cita de [service] el [formatDateTime(apt.appointment_date)]. ¡Te esperamos!"
Enlace: https://wa.me/52${cleanPhone}?text=${encodeURIComponent(waText)}

6. COMPONENTE PRINCIPAL: AGENDAPAGE (pages/AgendaPage.tsx)
Propósito: Orquesta la carga de datos, el filtrado, el canal en tiempo real y el estado global de la agenda.

6.1 Estados Principales
typescript
const [unlocked, setUnlocked] = useState<boolean>(() => {
  return sessionStorage.getItem('bg_agenda_auth') === '1';
});
const [appointments, setAppointments] = useState<Appointment[]>([]);
const [statuses, setStatuses] = useState<Record<string, Status>>(() => {
  try {
    return JSON.parse(localStorage.getItem('bg_statuses') ?? '{}');
  } catch { return {}; }
});
const [sound, setSound] = useState<boolean>(() => {
  try { return localStorage.getItem('bg_sound') !== '0'; } catch { return true; }
});
const [newIds, setNewIds] = useState<Set<string>>(new Set());
const [filter, setFilter] = useState<'all' | 'today' | 'upcoming'>('all');
const [search, setSearch] = useState<string>('');
const soundRef = useRef(sound);
const supabase = useSupabaseClient(); // Inyección del cliente Supabase

6.2 Carga Inicial de Datos
Efecto de carga (useEffect):
Obtiene citas de Supabase
Filtra usando getDeletedIds() para excluir IDs eliminados
Actualiza setAppointments
Opcional: maneja estado de carga

6.3 Canal de Tiempo Real (useEffect)
Configuración del canal:
typescript
const channel = supabase
  .channel('agenda-changes')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'appointments' },
    (payload) => {
      const newApt = payload.new as Appointment;
      // Si el ID está en la lista negra, ignora la inserción
      if (getDeletedIds().has(newApt.id)) return;
      
      // Si el sonido está activado, reproduce ding
      if (soundRef.current) playDing();
      
      // Marca la cita como nueva (para animación de resaltado)
      setNewIds((prev) => new Set(prev).add(newApt.id));
      
      // Añade la cita al estado local
      setAppointments((prev) => [...prev, newApt]);
    }
  )
  .subscribe();
Limpieza: return () => { channel.unsubscribe(); }

6.4 Funciones de Estado y Persistencia
getStatus(apt: Appointment): Status
Prioriza el estado local (statuses[apt.id])
Si no existe, usa el apt.status de Supabase (si es válido)
Fallback: 'pending'
handleSetStatus(id: string, status: Status)
Actualiza statuses en React y localStorage
Hace UPDATE en Supabase en modo fire-and-forget
handleReschedule(id: string, date: string, time: string)
Construye nueva fecha: new Date(dateT{time}:00`).toISOString()`
Actualiza appointments localmente
Resetea statuses a 'pending'
Hace UPDATE en Supabase con appointment_date y status: 'pending'
handleDelete(id: string)
Filtra la cita del estado local
Añade el ID a la lista negra en localStorage
Elimina el statuses[id]
Hace DELETE en Supabase

6.5 Filtrado y Búsqueda
Lógica de filtrado:
typescript
const filtered = appointments.filter((apt) => {
  // Búsqueda por nombre o servicio
  if (search) {
    const query = search.toLowerCase();
    if (!apt.client_name.toLowerCase().includes(query) &&
        !apt.service.toLowerCase().includes(query)) return false;
  }
  
  // Filtros por fecha
  if (filter === 'today') return isToday(apt.appointment_date);
  if (filter === 'upcoming') return isUpcoming(apt.appointment_date);
  return true;
});
Ordenamiento: Las citas se ordenan por appointment_date ascendente.

6.6 Estadísticas y Contadores
typescript
const todayCount = appointments.filter((a) => isToday(a.appointment_date)).length;
const pendingCount = appointments.filter((a) => getStatus(a) === 'pending').length;
const confirmedCount = appointments.filter((a) => getStatus(a) === 'confirmed').length;

6.7 Funciones de Control
toggleSound():
Alterna sound y lo persiste en localStorage como '1' o '0'
logout():
Elimina 'bg_agenda_auth' de sessionStorage
Establece setUnlocked(false)

7. RENDERIZADO DEL DASHBOARD
7.1 Header
Título: "Agenda" o nombre del negocio
Fecha: todayInSpanish()
Botones: Volumen (toggleSound), Cerrar sesión (logout)
Badge del contador de hoy

7.2 Stats Bar
Tarjetas KPI:
Hoy: todayCount
Pendientes: pendingCount
Confirmadas: confirmedCount
Total: appointments.length

7.3 Filtros y Búsqueda
Pestañas: "Todas", "Hoy", "Próximas"
Input de búsqueda (por nombre o servicio)

7.4 Lista de Citas
Renderiza filtered.map((apt) => <AppointmentCard ... />)
Aplica isNew para animación de resaltado (background temporal)

8. REQUISITOS TÉCNICOS ADICIONALES
8.1 Manejo de Errores
Todas las operaciones de Supabase deben tener .then() y .catch() silenciosos para no romper la UI
try/catch en todas las operaciones de localStorage

8.2 Optimización
Usar useCallback para funciones que se pasan a componentes hijos
Usar useRef para el sonido (evita re-renders al cambiar)
Filtrado eficiente con useMemo para filtered y todayCount

8.3 Estilos
Usar Tailwind CSS con clases utilitarias
Paleta de colores respecto a la web
Responsive (mobile-first)
