'use client';

import { MapPin } from 'lucide-react';
import type { Location } from '@/types/sensor';

interface Props {
  locations: Location[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function LocationSidebar({ locations, activeId, onSelect }: Props) {
  return (
    <aside className="w-60 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="px-4 py-3 border-b border-slate-800">
        <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-widest">
          Locais
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {locations.map(loc => {
          const isActive = loc.id === activeId && loc.active;

          return (
            <button
              key={loc.id}
              onClick={() => loc.active && onSelect(loc.id)}
              disabled={!loc.active}
              className={[
                'w-full text-left px-3 py-3 rounded-lg transition-colors duration-150 border',
                isActive
                  ? 'bg-cyan-500/10 border-cyan-500/20'
                  : loc.active
                    ? 'hover:bg-slate-800 border-transparent'
                    : 'opacity-40 cursor-not-allowed border-transparent',
              ].join(' ')}
            >
              <div className="flex items-start gap-2.5">
                <MapPin
                  className={`w-4 h-4 mt-0.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-600'}`}
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isActive ? 'text-cyan-300' : 'text-slate-300'}`}>
                    {loc.name}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">{loc.address}</p>
                  {!loc.active && (
                    <span className="mt-1.5 inline-block text-[10px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                      Em breve
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-slate-500 text-xs">node-sensor-01 · ao vivo</span>
        </div>
      </div>
    </aside>
  );
}
