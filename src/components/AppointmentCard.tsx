import { useState } from 'react';
import type { AppointmentCardProps, Status } from '../types';
import { isPast, formatDateTime } from '../utils/helpers';

const statusBadgeClass: Record<Status, string> = {
  pending: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
  confirmed: 'bg-highlighter-blue/15 text-highlighter-blue border border-highlighter-blue/30',
  completed: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  cancelled: 'bg-red-500/15 text-red-400 border border-red-500/30',
  no_show: 'bg-newsprint-gray/20 text-muted-sky border border-newsprint-gray/30',
};

const statusLabel: Record<Status, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Terminada',
  cancelled: 'Cancelada',
  no_show: 'No presentó',
};

const INPUT =
  'w-full bg-bone-dark border border-slate-cobalt text-typesetter-frost ' +
  'font-twk-lausanne text-[14px] font-[300] tracking-[0.14px] ' +
  'px-[15px] py-[12px] rounded-[5px] placeholder:text-newsprint-gray/60 ' +
  'focus:outline-none focus:border-highlighter-blue transition-colors duration-200';

export default function AppointmentCard({
  apt,
  status,
  isNew,
  onSetStatus,
  onReschedule,
  onDelete,
}: AppointmentCardProps) {
  const [rescheduling, setRescheduling] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const past = isPast(apt.appointment_date);
  const isDone = status === 'completed' || status === 'no_show' || status === 'cancelled';

  const cleanPhone = apt.client_phone.replace(/\D/g, '');
  const waText = `Hola ${apt.client_name}, te recordamos tu cita de ${apt.service} el ${formatDateTime(apt.appointment_date)}. ¡Te esperamos!`;
  const waLink = `https://wa.me/52${cleanPhone}?text=${encodeURIComponent(waText)}`;

  const handleSaveReschedule = () => {
    if (!newDate || !newTime) return;
    onReschedule(apt.id, newDate, newTime);
    setRescheduling(false);
    setNewDate('');
    setNewTime('');
  };

  return (
    <div
      className={`relative border border-slate-cobalt bg-slate-cobalt/30 rounded-[10px] p-[24px]
        transition-all duration-500
        ${past ? 'opacity-70' : ''}
        ${isNew ? 'animate-[pulseNew_1.8s_ease-out]' : ''}
      `}
    >
      {isNew && (
        <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-highlighter-blue rounded-full m-[20px] animate-ping" />
      )}

      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`px-[10px] py-[4px] rounded-[5px] font-twk-lausanne text-[10px] font-[550] uppercase tracking-[0.11px] ${statusBadgeClass[status]}`}>
              {statusLabel[status]}
            </span>
            {past && !isDone && (
              <span className="px-[10px] py-[4px] rounded-[5px] font-twk-lausanne text-[10px] font-[550] uppercase tracking-[0.11px] bg-newsprint-gray/15 text-newsprint-gray border border-newsprint-gray/30">
                Pasada
              </span>
            )}
          </div>
          <h3 className="font-twk-lausanne text-[18px] font-[550] text-typesetter-frost tracking-[-0.36px] truncate">
            {apt.client_name}
          </h3>
        </div>

        <div className="text-right shrink-0">
          <p className="font-twk-lausanne text-[13px] font-[550] text-highlighter-blue tracking-[0.14px] whitespace-nowrap">
            {formatDateTime(apt.appointment_date)}
          </p>
          <p className="font-twk-lausanne text-[12px] font-[300] text-newsprint-gray tracking-[0.14px] mt-1">
            {apt.service}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-5 text-newsprint-gray">
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
        </svg>
        <span className="font-twk-lausanne text-[12px] font-[300] tracking-[0.14px] truncate">
          {apt.client_phone}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {status === 'pending' && (
          <>
            <button
              onClick={() => onSetStatus(apt.id, 'confirmed')}
              className="bg-highlighter-blue text-typesetter-frost font-twk-lausanne text-[10px] font-[550] uppercase tracking-[0.11px]
                         px-[14px] py-[9px] rounded-[5px] hover:opacity-90 transition-opacity"
            >
              Confirmar
            </button>
            <button
              onClick={() => setRescheduling(true)}
              className="bg-slate-cobalt text-typesetter-frost font-twk-lausanne text-[10px] font-[550] uppercase tracking-[0.11px]
                         px-[14px] py-[9px] rounded-[5px] hover:bg-slate-cobalt/80 transition-colors border border-slate-cobalt"
            >
              Reagendar
            </button>
            <button
              onClick={() => onSetStatus(apt.id, 'cancelled')}
              className="bg-red-500/10 text-red-400 font-twk-lausanne text-[10px] font-[550] uppercase tracking-[0.11px]
                         px-[14px] py-[9px] rounded-[5px] hover:bg-red-500/20 transition-colors border border-red-500/20"
            >
              Cancelar
            </button>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-500/10 text-emerald-400 font-twk-lausanne text-[10px] font-[550] uppercase tracking-[0.11px]
                         px-[14px] py-[9px] rounded-[5px] hover:bg-emerald-500/20 transition-colors border border-emerald-500/20"
            >
              WhatsApp
            </a>
          </>
        )}

        {status === 'confirmed' && (
          <>
            <button
              onClick={() => onSetStatus(apt.id, 'completed')}
              className="bg-emerald-500/15 text-emerald-400 font-twk-lausanne text-[10px] font-[550] uppercase tracking-[0.11px]
                         px-[14px] py-[9px] rounded-[5px] hover:bg-emerald-500/25 transition-colors border border-emerald-500/30"
            >
              Terminada
            </button>
            <button
              onClick={() => onSetStatus(apt.id, 'no_show')}
              className="bg-newsprint-gray/20 text-muted-sky font-twk-lausanne text-[10px] font-[550] uppercase tracking-[0.11px]
                         px-[14px] py-[9px] rounded-[5px] hover:bg-newsprint-gray/30 transition-colors border border-newsprint-gray/30"
            >
              No presentó
            </button>
            <button
              onClick={() => onSetStatus(apt.id, 'cancelled')}
              className="bg-red-500/10 text-red-400 font-twk-lausanne text-[10px] font-[550] uppercase tracking-[0.11px]
                         px-[14px] py-[9px] rounded-[5px] hover:bg-red-500/20 transition-colors border border-red-500/20"
            >
              Cancelar
            </button>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-500/10 text-emerald-400 font-twk-lausanne text-[10px] font-[550] uppercase tracking-[0.11px]
                         px-[14px] py-[9px] rounded-[5px] hover:bg-emerald-500/20 transition-colors border border-emerald-500/20"
            >
              WhatsApp
            </a>
          </>
        )}

        {(status === 'completed' || status === 'no_show' || status === 'cancelled') && (
          <button
            onClick={() => setConfirmDelete(true)}
            className="bg-red-500/10 text-red-400 font-twk-lausanne text-[10px] font-[550] uppercase tracking-[0.11px]
                       px-[14px] py-[9px] rounded-[5px] hover:bg-red-500/20 transition-colors border border-red-500/20"
          >
            Borrar
          </button>
        )}
      </div>

      {rescheduling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-press-blue-black/80 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-press-blue-black border border-slate-cobalt rounded-[10px] p-[30px] shadow-2xl">
            <h4 className="font-twk-lausanne text-[18px] font-[550] text-typesetter-frost tracking-[-0.36px] mb-2">
              Reagendar Cita
            </h4>
            <p className="font-twk-lausanne text-[13px] font-[300] text-newsprint-gray tracking-[0.14px] mb-6">
              {apt.client_name} — {apt.service}
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block font-twk-lausanne text-[11px] font-[550] uppercase tracking-[0.11px] text-newsprint-gray mb-2">
                  Nueva Fecha
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={INPUT}
                />
              </div>
              <div>
                <label className="block font-twk-lausanne text-[11px] font-[550] uppercase tracking-[0.11px] text-newsprint-gray mb-2">
                  Nueva Hora
                </label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className={INPUT}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setRescheduling(false); setNewDate(''); setNewTime(''); }}
                className="flex-1 border border-slate-cobalt text-typesetter-frost font-twk-lausanne text-[11px] font-[550] uppercase tracking-[0.11px]
                           px-[20px] py-[14px] rounded-[5px] hover:bg-slate-cobalt/50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveReschedule}
                disabled={!newDate || !newTime}
                className="flex-1 bg-highlighter-blue text-typesetter-frost font-twk-lausanne text-[11px] font-[550] uppercase tracking-[0.11px]
                           px-[20px] py-[14px] rounded-[5px] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                style={{ boxShadow: 'rgba(16,94,189,0.35) 1px 8px 20px 0px' }}
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-press-blue-black/80 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-press-blue-black border border-red-500/30 rounded-[10px] p-[30px] shadow-2xl">
            <h4 className="font-twk-lausanne text-[18px] font-[550] text-typesetter-frost tracking-[-0.36px] mb-2">
              Eliminar Cita
            </h4>
            <p className="font-twk-lausanne text-[14px] font-[300] text-newsprint-gray tracking-[0.14px] mb-6">
              ¿Eliminar cita con <span className="text-typesetter-frost font-[550]">{apt.client_name}</span>?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 border border-slate-cobalt text-typesetter-frost font-twk-lausanne text-[11px] font-[550] uppercase tracking-[0.11px]
                           px-[20px] py-[14px] rounded-[5px] hover:bg-slate-cobalt/50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => { onDelete(apt.id); setConfirmDelete(false); }}
                className="flex-1 bg-red-500 text-white font-twk-lausanne text-[11px] font-[550] uppercase tracking-[0.11px]
                           px-[20px] py-[14px] rounded-[5px] hover:bg-red-500/90 transition-colors"
              >
                Sí, Borrar
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulseNew {
          0% { box-shadow: 0 0 0 0 rgba(43, 155, 238, 0.5); }
          70% { box-shadow: 0 0 0 14px rgba(43, 155, 238, 0); }
          100% { box-shadow: 0 0 0 0 rgba(43, 155, 238, 0); }
        }
      `}</style>
    </div>
  );
}
