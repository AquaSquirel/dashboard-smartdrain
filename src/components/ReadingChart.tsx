'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import type { SensorReading } from '@/types/sensor';
import { DRAIN_DEPTH_CM, THRESHOLD_ALERTA, THRESHOLD_CRITICO } from '@/lib/config';

interface Props {
  history: SensorReading[];
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: number;
}

function ChartTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="text-slate-400 text-xs mb-0.5">
        {label ? new Date(label).toLocaleTimeString('pt-BR') : ''}
      </p>
      <p className="text-white font-semibold">{payload[0].value.toFixed(1)} cm</p>
    </div>
  );
}

export default function ReadingChart({ history }: Props) {
  // Show last 60 readings for clarity
  const data = history.slice(-60).map(r => ({ t: r.timestamp, level: r.level }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />

          <XAxis
            dataKey="t"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(v: number) =>
              new Date(v).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })
            }
            tick={{ fill: '#475569', fontSize: 10 }}
            axisLine={{ stroke: '#1e293b' }}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={60}
          />

          <YAxis
            domain={[0, DRAIN_DEPTH_CM]}
            tickFormatter={(v: number) => `${v}`}
            tick={{ fill: '#475569', fontSize: 11 }}
            axisLine={{ stroke: '#1e293b' }}
            tickLine={false}
            unit=" cm"
            width={52}
          />

          <Tooltip content={<ChartTooltip />} />

          <ReferenceLine
            y={THRESHOLD_ALERTA} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.6}
            label={{ value: `${THRESHOLD_ALERTA} cm`, position: 'insideTopRight', fill: '#f59e0b', fontSize: 10 }}
          />
          <ReferenceLine
            y={THRESHOLD_CRITICO} stroke="#ef4444" strokeDasharray="4 4" strokeOpacity={0.6}
            label={{ value: `${THRESHOLD_CRITICO} cm`, position: 'insideTopRight', fill: '#ef4444', fontSize: 10 }}
          />

          <Area
            type="monotone"
            dataKey="level"
            stroke="#06b6d4"
            strokeWidth={2}
            fill="url(#areaGrad)"
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
