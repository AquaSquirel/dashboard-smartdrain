import type { ReactNode } from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: ReactNode;
  accent?: string;
}

export default function StatsCard({ label, value, unit, icon, accent = '#06b6d4' }: StatsCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${accent}20`, color: accent }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-slate-500 text-xs uppercase tracking-wider truncate">{label}</p>
        <p className="text-white font-semibold text-lg leading-tight">
          {value}
          {unit && <span className="text-slate-500 text-sm ml-1">{unit}</span>}
        </p>
      </div>
    </div>
  );
}
