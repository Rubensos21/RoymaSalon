import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import type { Appointment, Status } from '../types';
import {
  getDeletedIds,
  playDing,
  isToday,
  isUpcoming,
  todayInSpanish,
} from '../utils/helpers';
import PinScreen from '../components/PinScreen';
import AppointmentCard from '../components/AppointmentCard';

const VALID_STATUSES: Status[] = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'];

function isValidStatus(s: unknown): s is Status {
  return typeof s === 'string' && VALID_STATUSES.includes(s as Status);
}

export default function AgendaPage() {
  const [unlocked, setUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('bg_agenda_auth') === '1';
    } catch {
      return false;
    }
  });

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [statuses, setStatuses] = useState<Record<string, Status>>(() => {
    try {
      return JSON.parse(localStorage.getItem('bg_statuses') ?? '{}');
    } catch {
      return {};
    }
  });
  const [sound, setSound] = useState<boolean>(() => {
    try {
      return localStorage.getItem('bg_sound') !== '0';
    } catch {
      return true;
    }
  });
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming'>('all');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const soundRef = useRef(sound);
  useEffect(() => { soundRef.current = sound; }, [sound]);

  useEffect(() => {
    const deleted = getDeletedIds();
    setLoading(true);
    (async () => {
      try {
        const { data, error } = await supabase.from('appointments').select('*');
        if (error) {
          console.warn('Error cargando citas:', error.message);
          setAppointments([]);
          return;
        }
        if (!data) { setAppointments([]); return; }
        const rows = (data as Appointment[]).filter((a) => !deleted.has(a.id));
        setAppointments(rows);
      } catch (err) {
        console.warn('Error de red cargando citas:', err);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('agenda-changes', {
        config: { broadcast: { self: false } },
      })
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'appointments' },
        (payload) => {
          const newApt = payload.new as Appointment;
          if (!newApt || !newApt.id) return;
          if (getDeletedIds().has(newApt.id)) return;

          if (soundRef.current) playDing();

          setNewIds((prev) => {
            const next = new Set(prev);
            next.add(newApt.id);
            return next;
          });

          setAppointments((prev) => {
            if (prev.some((a) => a.id === newApt.id)) return prev;
            return [...prev, newApt];
          });

          window.setTimeout(() => {
            setNewIds((prev) => {
              const next = new Set(prev);
              next.delete(newApt.id);
              return next;
            });
          }, 4000);
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'appointments' },
        (payload) => {
          const updated = payload.new as Appointment;
          if (!updated || !updated.id) return;
          setAppointments((prev) =>
            prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)),
          );
        },
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'appointments' },
        (payload) => {
          const old = payload.old as { id?: string };
          if (!old?.id) return;
          setAppointments((prev) => prev.filter((a) => a.id !== old.id));
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.info('[Agenda] Realtime conectado: escuchando INSERT/UPDATE/DELETE en appointments');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.warn('[Agenda] Realtime estado:', status);
        }
      });

    return () => {
      try {
        void channel.unsubscribe();
      } catch { /* ignore */ }
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('bg_statuses', JSON.stringify(statuses));
    } catch { /* ignore */ }
  }, [statuses]);

  const getStatus = useCallback((apt: Appointment): Status => {
    if (isValidStatus(statuses[apt.id])) return statuses[apt.id];
    if (isValidStatus(apt.status)) return apt.status;
    return 'pending';
  }, [statuses]);

  const handleSetStatus = useCallback((id: string, status: Status) => {
    setStatuses((prev) => ({ ...prev, [id]: status }));
    (async () => {
      try {
        await supabase.from('appointments').update({ status }).eq('id', id);
      } catch (err) {
        console.warn('Update status error:', err);
      }
    })();
  }, []);

  const handleReschedule = useCallback((id: string, date: string, time: string) => {
    try {
      const newIso = new Date(`${date}T${time}:00`).toISOString();
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, appointment_date: newIso } : a)),
      );
      setStatuses((prev) => ({ ...prev, [id]: 'pending' }));
      (async () => {
        try {
          await supabase
            .from('appointments')
            .update({ appointment_date: newIso, status: 'pending' })
            .eq('id', id);
        } catch (err) {
          console.warn('Reschedule error:', err);
        }
      })();
    } catch (err) {
      console.warn('Fecha inválida al reagendar:', err);
    }
  }, []);

  const handleDelete = useCallback((id: string) => {
    const appointment = appointments.find((a) => a.id === id);
    const eventQuoteId = appointment?.event_quote_id;

    setAppointments((prev) => prev.filter((a) => a.id !== id));
    try {
      const deleted = getDeletedIds();
      deleted.add(id);
      localStorage.setItem('bg_deleted_ids', JSON.stringify(Array.from(deleted)));
    } catch { /* ignore */ }
    setStatuses((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

    (async () => {
      try {
        // 1) Si la cita vino del formulario de cotizaciones → borra también event_quotes
        if (eventQuoteId) {
          try {
            await supabase.from('event_quotes').delete().eq('id', eventQuoteId);
          } catch (err) {
            console.warn('Delete event_quotes error (continuando con appointments):', err);
          }
        }
        // 2) Siempre borra appointments (independientemente de event_quotes)
        await supabase.from('appointments').delete().eq('id', id);
      } catch (err) {
        console.warn('Delete appointments error:', err);
      }
    })();
  }, [appointments]);

  const toggleSound = useCallback(() => {
    setSound((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('bg_sound', next ? '1' : '0');
      } catch { /* ignore */ }
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem('bg_agenda_auth');
    } catch { /* ignore */ }
    setUnlocked(false);
  }, []);

  const filtered = useMemo(() => {
    const list = appointments.filter((apt) => {
      if (search) {
        const q = search.toLowerCase();
        const nameOk = apt.client_name.toLowerCase().includes(q);
        const svcOk = apt.service.toLowerCase().includes(q);
        if (!nameOk && !svcOk) return false;
      }
      if (filter === 'today') return isToday(apt.appointment_date);
      if (filter === 'upcoming') return isUpcoming(apt.appointment_date);
      return true;
    });
    return list.sort(
      (a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime(),
    );
  }, [appointments, filter, search]);

  const todayCount = useMemo(
    () => appointments.filter((a) => isToday(a.appointment_date)).length,
    [appointments],
  );
  const pendingCount = useMemo(
    () => appointments.filter((a) => getStatus(a) === 'pending').length,
    [appointments, getStatus],
  );
  const confirmedCount = useMemo(
    () => appointments.filter((a) => getStatus(a) === 'confirmed').length,
    [appointments, getStatus],
  );

  if (!unlocked) {
    return <PinScreen onUnlock={() => setUnlocked(true)} />;
  }

  const FILTER_TABS: { key: 'all' | 'today' | 'upcoming'; label: string }[] = [
    { key: 'all', label: 'Todas' },
    { key: 'today', label: 'Hoy' },
    { key: 'upcoming', label: 'Próximas' },
  ];

  return (
    <div className="min-h-screen bg-bone-dark text-typesetter-frost">
      <header className="sticky top-0 z-40 bg-press-blue-black/95 backdrop-blur-sm border-b border-slate-cobalt">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span
                    className="font-twk-lausanne font-[700] text-[17px] tracking-[-0.02em] text-typesetter-frost"
                    style={{ borderBottom: '2px solid #2B9BEE', paddingBottom: '1px' }}
                  >
                    SALÓN
                  </span>
                  <span className="font-twk-lausanne font-[700] text-[17px] tracking-[-0.02em] text-typesetter-frost">
                    ROYMA
                  </span>
                  <span className="inline-flex items-center bg-highlighter-blue/15 text-highlighter-blue border border-highlighter-blue/30
                                   font-twk-lausanne text-[10px] font-[550] uppercase tracking-[0.11px]
                                   px-[10px] py-[4px] rounded-[5px]">
                    {todayCount} hoy
                  </span>
                </div>
                <p className="font-twk-lausanne text-[13px] font-[300] text-newsprint-gray tracking-[0.14px] capitalize">
                  {todayInSpanish()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleSound}
                aria-label={sound ? 'Desactivar sonido' : 'Activar sonido'}
                className="w-11 h-11 flex items-center justify-center rounded-[10px] border border-slate-cobalt
                           bg-slate-cobalt/40 hover:bg-slate-cobalt transition-colors"
              >
                {sound ? (
                  <svg className="w-5 h-5 text-typesetter-frost" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-newsprint-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.531V19.94a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.395C2.806 8.757 3.63 8.25 4.51 8.25H6.75z" />
                  </svg>
                )}
              </button>

              <button
                onClick={logout}
                aria-label="Cerrar sesión"
                className="w-11 h-11 flex items-center justify-center rounded-[10px] border border-red-500/20
                           bg-red-500/5 hover:bg-red-500/15 transition-colors"
              >
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 sm:px-10 py-10">
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Hoy', value: todayCount, accent: 'text-highlighter-blue', bg: 'bg-highlighter-blue/10 border-highlighter-blue/20' },
            { label: 'Pendientes', value: pendingCount, accent: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
            { label: 'Confirmadas', value: confirmedCount, accent: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
            { label: 'Total', value: appointments.length, accent: 'text-typesetter-frost', bg: 'bg-slate-cobalt/40 border-slate-cobalt' },
          ].map((s) => (
            <div key={s.label} className={`border rounded-[10px] p-[20px] ${s.bg}`}>
              <p className="font-twk-lausanne text-[10px] font-[550] uppercase tracking-[0.11px] text-newsprint-gray mb-2">
                {s.label}
              </p>
              <p className={`font-pp-mondwest font-[400] leading-[0.9] tracking-[-0.04em] ${s.accent}`}
                 style={{ fontSize: '48px' }}>
                {s.value}
              </p>
            </div>
          ))}
        </section>

        <section className="mb-8 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div className="flex gap-1 bg-slate-cobalt/40 p-1 rounded-[10px] w-fit border border-slate-cobalt">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`font-twk-lausanne text-[11px] font-[550] uppercase tracking-[0.11px]
                           px-[18px] py-[10px] rounded-[7px] transition-all duration-200
                  ${filter === tab.key
                    ? 'bg-highlighter-blue text-typesetter-frost'
                    : 'text-newsprint-gray hover:text-typesetter-frost hover:bg-slate-cobalt/60'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative sm:w-80">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-newsprint-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o servicio..."
              className="w-full bg-slate-cobalt/40 border border-slate-cobalt text-typesetter-frost
                         font-twk-lausanne text-[13px] font-[300] tracking-[0.14px]
                         pl-11 pr-4 py-[12px] rounded-[10px]
                         placeholder:text-newsprint-gray/60
                         focus:outline-none focus:border-highlighter-blue transition-colors"
            />
          </div>
        </section>

        <section>
          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-flex items-center gap-3 text-newsprint-gray">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="font-twk-lausanne text-[12px] font-[350] tracking-[0.14px]">Cargando citas...</span>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-slate-cobalt rounded-[10px]">
              <svg className="w-14 h-14 mx-auto text-newsprint-gray/40 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <p className="font-twk-lausanne text-[15px] font-[400] text-typesetter-frost mb-1">
                No hay citas{search ? ' que coincidan' : filter === 'today' ? ' para hoy' : filter === 'upcoming' ? ' próximas' : ''}
              </p>
              <p className="font-twk-lausanne text-[12px] font-[300] text-newsprint-gray tracking-[0.14px]">
                {search ? 'Intenta con otra búsqueda.' : 'Las nuevas citas aparecerán aquí automáticamente.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((apt) => (
                <AppointmentCard
                  key={apt.id}
                  apt={apt}
                  status={getStatus(apt)}
                  isNew={newIds.has(apt.id)}
                  onSetStatus={handleSetStatus}
                  onReschedule={handleReschedule}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
