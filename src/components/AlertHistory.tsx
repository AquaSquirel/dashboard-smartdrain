import type { AlertEvent } from '@/types/sensor';

const STYLE = {
  alerta: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', label: 'ATENÇÃO' },
  critico: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', label: 'CRÍTICO' },
  normal: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', label: 'NORMAL' },
} as const;

export default function AlertHistory({ alerts }: { alerts: AlertEvent[] }) {
  const sorted = [...alerts].reverse();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h3 className="text-slate-300 text-sm font-semibold mb-3">Histórico de alertas</h3>

      {sorted.length === 0 ? (
        <p className="text-slate-600 text-sm text-center py-6">
          Nenhum alerta registrado nesta sessão
        </p>
      ) : (
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {sorted.map(alert => {
            const s = STYLE[alert.alertLevel];
            return (
              <div
                key={alert.id}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${s.bg} ${s.border}`}
              >
                <span className={`text-xs font-bold w-14 shrink-0 ${s.text}`}>{s.label}</span>
                <span className="text-slate-400 text-xs shrink-0 tabular-nums">
                  {new Date(alert.timestamp).toLocaleTimeString('pt-BR')}
                </span>
                <span className="text-slate-300 text-xs truncate">{alert.message}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
