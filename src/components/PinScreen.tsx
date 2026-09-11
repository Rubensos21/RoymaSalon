import { useState, useCallback } from 'react';

const AGENDA_PIN = '1234';

interface PinScreenProps {
  onUnlock: () => void;
}

export default function PinScreen({ onUnlock }: PinScreenProps) {
  const [digits, setDigits] = useState<string[]>([]);
  const [shake, setShake] = useState(false);

  const handleKey = useCallback((key: string) => {
    if (shake) return;

    if (key === 'back') {
      setDigits((prev) => prev.slice(0, -1));
      return;
    }

    setDigits((prev) => {
      if (prev.length >= 4) return prev;
      const next = [...prev, key];

      if (next.length === 4) {
        const entered = next.join('');
        if (entered === AGENDA_PIN) {
          try {
            sessionStorage.setItem('bg_agenda_auth', '1');
          } catch { /* ignore */ }
          setTimeout(() => onUnlock(), 150);
        } else {
          setShake(true);
          setTimeout(() => {
            setShake(false);
            setDigits([]);
          }, 600);
        }
      }
      return next;
    });
  }, [shake, onUnlock]);

  const KEYPAD_ROWS = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', 'back'],
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-press-blue-black px-6">
      <div className="w-full max-w-sm">
        <div className={`mb-16 transition-transform duration-200 ${shake ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>
          <div className="text-center mb-6">
            <span
              className="font-twk-lausanne font-[700] text-[20px] tracking-[-0.02em] text-typesetter-frost"
              style={{ borderBottom: '2px solid #2B9BEE', paddingBottom: '1px' }}
            >
              SALÓN
            </span>
            <span className="font-twk-lausanne font-[700] text-[20px] tracking-[-0.02em] text-typesetter-frost ml-1.5">
              JARDÍN LÍA
            </span>
          </div>

          <h1 className="font-twk-lausanne text-[18px] font-[550] text-typesetter-frost text-center mb-3 tracking-[-0.36px]">
            Agenda Privada
          </h1>
          <p className="font-twk-lausanne text-[13px] font-[300] text-newsprint-gray text-center tracking-[0.14px]">
            Ingresa tu PIN de 4 dígitos
          </p>
        </div>

        <div className="flex justify-center gap-4 mb-14">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border transition-all duration-200
                ${digits.length > i
                  ? 'bg-highlighter-blue border-highlighter-blue scale-110'
                  : 'bg-transparent border-slate-cobalt'
                }
                ${shake ? 'bg-red-500/60 border-red-500' : ''}
              `}
            />
          ))}
        </div>

        <div className="space-y-4">
          {KEYPAD_ROWS.map((row, rIdx) => (
            <div key={rIdx} className="grid grid-cols-3 gap-4">
              {row.map((k) => {
                if (k === '') return <div key={`empty-${rIdx}`} />;
                const isBack = k === 'back';
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleKey(k)}
                    className={`h-16 rounded-[10px] font-twk-lausanne
                      transition-all duration-150 active:scale-95
                      ${isBack
                        ? 'bg-transparent text-newsprint-gray hover:text-typesetter-frost text-[12px] font-[550] uppercase tracking-[0.11px]'
                        : 'bg-slate-cobalt text-typesetter-frost text-[22px] font-[400] hover:bg-slate-cobalt/80'
                      }
                    `}
                  >
                    {isBack ? 'Borrar' : k}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
