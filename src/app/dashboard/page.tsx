'use client';

import { useState, useMemo } from 'react';
import { Droplets, Activity, Clock, Wifi, WifiOff, TrendingUp, Bell } from 'lucide-react';
import WaterGauge from '@/components/WaterGauge';
import ReadingChart from '@/components/ReadingChart';
import StatsCard from '@/components/StatsCard';
import AlertHistory from '@/components/AlertHistory';
import LocationSidebar from '@/components/LocationSidebar';
import { useSensorData } from '@/hooks/useSensorData';
import type { Location } from '@/types/sensor';

const LOCATIONS: Location[] = [
  {
    id: 'galeria-central',
    name: 'Galeria Central',
    address: 'R. Brás Cubas, Centro',
    district: 'Centro',
    active: true,
  },
  {
    id: 'xv-novembro',
    name: 'Rua XV de Novembro',
    address: 'R. XV de Novembro, Centro',
    district: 'Centro',
    active: false,
  },
  {
    id: 'santa-rosalia',
    name: 'Bairro Sta. Rosália',
    address: 'Av. Itavuvu, Sta. Rosália',
    district: 'Santa Rosália',
    active: false,
  },
  {
    id: 'parque-aguas',
    name: 'Parque das Águas',
    address: 'R. Álvaro Soares, Jardim',
    district: 'Jardim Paulistano',
    active: false,
  },
];

const ALERT_COLOR = {
  normal: '#22c55e',
  alerta: '#f59e0b',
  critico: '#ef4444',
} as const;

export default function DashboardPage() {
  const [activeId, setActiveId] = useState(LOCATIONS[0].id);
  const activeLocation = LOCATIONS.find(l => l.id === activeId)!;
  const { currentReading, history, alertHistory, isLoading, error } = useSensorData(activeId);

  const stats = useMemo(() => {
    if (!history.length) return null;
    const levels = history.map(r => r.level);
    return {
      max: Math.max(...levels),
      min: Math.min(...levels),
    };
  }, [history]);

  const alertLevel = currentReading?.alertLevel ?? 'normal';
  const accentColor = ALERT_COLOR[alertLevel];

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      <LocationSidebar locations={LOCATIONS} activeId={activeId} onSelect={setActiveId} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 shrink-0 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Droplets className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-slate-100 tracking-tight">SmartDrain</span>
            <span className="text-slate-700">·</span>
            <span className="text-slate-400 text-sm">{activeLocation.name}</span>
          </div>

          <div className="flex items-center gap-2">
            {error ? (
              <>
                <WifiOff className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-xs">{error}</span>
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4 text-cyan-500" />
                <span className="text-cyan-500 text-xs">Conectado</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              </>
            )}
          </div>
        </header>

        {/* Scrollable body */}
        <main className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Alert banner */}
          {currentReading && alertLevel !== 'normal' && (
            <div
              className="rounded-xl px-4 py-3 flex items-center gap-3 border"
              style={{
                backgroundColor: `${accentColor}12`,
                borderColor: `${accentColor}35`,
              }}
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0 animate-ping" style={{ backgroundColor: accentColor }} />
              <span className="text-sm font-medium" style={{ color: accentColor }}>
                {alertLevel === 'critico'
                  ? `Nível CRÍTICO detectado — ${currentReading.level.toFixed(1)} cm. Risco de transbordamento iminente.`
                  : `Nível de ATENÇÃO — ${currentReading.level.toFixed(1)} cm. Monitoramento intensificado.`}
              </span>
            </div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <StatsCard
              label="Nível atual"
              value={isLoading ? '—' : (currentReading?.level.toFixed(1) ?? '—')}
              unit="cm"
              icon={<Droplets className="w-5 h-5" />}
              accent={accentColor}
            />
            <StatsCard
              label="Máx. nesta sessão"
              value={stats?.max.toFixed(1) ?? '—'}
              unit="cm"
              icon={<TrendingUp className="w-5 h-5" />}
              accent="#06b6d4"
            />
            <StatsCard
              label="Alertas registrados"
              value={alertHistory.length}
              icon={<Bell className="w-5 h-5" />}
              accent="#a855f7"
            />
            <StatsCard
              label="Última leitura"
              value={
                currentReading
                  ? new Date(currentReading.timestamp).toLocaleTimeString('pt-BR')
                  : '—'
              }
              icon={<Clock className="w-5 h-5" />}
              accent="#06b6d4"
            />
          </div>

          {/* Gauge + Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Gauge card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-widest mb-5">
                Nível atual — {activeLocation.name}
              </p>
              <div className="flex items-center justify-center">
                {isLoading ? (
                  <div className="w-56 h-44 rounded-full border-4 border-slate-800 animate-pulse opacity-30" />
                ) : currentReading ? (
                  <WaterGauge level={currentReading.level} alertLevel={alertLevel} />
                ) : (
                  <p className="text-slate-600 text-sm text-center">
                    Aguardando leitura do sensor…<br />
                    <span className="text-xs text-slate-700">O ESP32 envia dados a cada 60 s</span>
                  </p>
                )}
              </div>
            </div>

            {/* Chart card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-widest">
                  Histórico — últimos 60 s
                </p>
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-500" />
                  <span className="text-cyan-500 text-xs tabular-nums">
                    {history.length} leituras
                  </span>
                </div>
              </div>
              {!isLoading && <ReadingChart history={history} />}
            </div>
          </div>

          {/* Alert history */}
          <AlertHistory alerts={alertHistory} />

          {/* Sensor info footer */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-5 py-4">
            <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-widest mb-3">
              Informações do sensor
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              {[
                { label: 'Modelo', value: 'HC-SR04' },
                { label: 'Microcontrolador', value: 'ESP32' },
                { label: 'Intervalo', value: '60 s' },
                { label: 'Device ID', value: 'node-sensor-01' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-slate-600 text-xs">{label}</p>
                  <p className="text-slate-300 font-medium">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
