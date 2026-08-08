/**
 * Recupera del localStorage la lista de IDs eliminados bajo la clave bg_deleted_ids.
 * Retorna un Set<string> para búsquedas eficientes.
 * Maneja errores de parseo con try/catch.
 */
export function getDeletedIds(): Set<string> {
  try {
    const raw = localStorage.getItem('bg_deleted_ids');
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

/**
 * Reproduce un sonido de notificación de dos tonos usando Web Audio API.
 * Frecuencias: 880Hz (0s) y 1108Hz (0.18s).
 * Decaimiento exponencial del volumen.
 * Fallo silencioso si el navegador no soporta la API.
 */
export function playDing(): void {
  try {
    const AudioCtx =
      (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(1108, now + 0.18);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.3, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

    osc.start(now);
    osc.stop(now + 0.42);

    osc.onended = () => {
      try { ctx.close(); } catch { /* ignore */ }
    };
  } catch {
    /* silent fail */
  }
}

/**
 * Compara si la fecha proporcionada es hoy (ignora horas).
 * Compara año, mes y día.
 */
export function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
}

/**
 * Verifica si la fecha es futura (desde mañana a las 00:00 en adelante).
 * Retorna true si la fecha es >= mañana.
 */
export function isUpcoming(dateStr: string): boolean {
  const d = new Date(dateStr);
  const t = new Date();
  const tomorrow = new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1);
  return d >= tomorrow;
}

/**
 * Verifica si la fecha es anterior al momento actual.
 * Útil para aplicar estilos de opacidad.
 */
export function isPast(dateStr: string): boolean {
  return new Date(dateStr) < new Date();
}

/**
 * Formatea fecha en español con formato: "mié 15 ene 14:30".
 * Usa toLocaleString con opciones weekday short, day numeric, month short, hour 2-digit, minute 2-digit.
 */
export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('es-MX', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Retorna la fecha actual en formato largo: "jueves 31 de julio de 2026".
 * Usa toLocaleDateString con opciones weekday long, day numeric, month long, year numeric.
 */
export function todayInSpanish(): string {
  return new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
