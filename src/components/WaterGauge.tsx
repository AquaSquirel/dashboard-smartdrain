'use client';

import type { AlertLevel } from '@/types/sensor';
import { DRAIN_DEPTH_CM, THRESHOLD_ALERTA, THRESHOLD_CRITICO } from '@/lib/config';

interface WaterGaugeProps {
  level: number;
  maxLevel?: number;
  alertLevel: AlertLevel;
}

const ALERT_COLOR: Record<AlertLevel, string> = {
  normal: '#22c55e',
  alerta: '#f59e0b',
  critico: '#ef4444',
};

const ALERT_LABEL: Record<AlertLevel, string> = {
  normal: 'NORMAL',
  alerta: 'ATENÇÃO',
  critico: 'CRÍTICO',
};

// Gauge geometry constants
const CX = 150;
const CY = 125;
const R = 105;
const C = 2 * Math.PI * R;            // ≈ 659.73
const ARC_DEG = 240;
const ARC_LEN = (ARC_DEG / 360) * C;  // ≈ 439.82
// SVG stroke starts at 3 o'clock; rotate 150° to start at 8 o'clock
const TRANSFORM = `rotate(150, ${CX}, ${CY})`;

function polarToXY(clockDeg: number, radius: number) {
  const rad = (clockDeg * Math.PI) / 180;
  return { x: CX + radius * Math.sin(rad), y: CY - radius * Math.cos(rad) };
}

// Returns SVG line coords for a tick at a given fraction along the arc
function tick(fraction: number) {
  const deg = 240 + fraction * 240; // clock degrees from 12
  const inner = polarToXY(deg, R - 14);
  const outer = polarToXY(deg, R + 14);
  return { x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y };
}

export default function WaterGauge({ level, maxLevel = DRAIN_DEPTH_CM, alertLevel }: WaterGaugeProps) {
  const color = ALERT_COLOR[alertLevel];
  const label = ALERT_LABEL[alertLevel];

  const fillRatio = Math.min(Math.max(level / maxLevel, 0), 1);
  const fillLen = fillRatio * ARC_LEN;

  // Zone boundary lengths along the arc
  const greenEnd = (THRESHOLD_ALERTA / maxLevel) * ARC_LEN;
  const yellowEnd = (THRESHOLD_CRITICO / maxLevel) * ARC_LEN;

  // dashoffset formula: C - startPosition
  const yellowOffset = C - greenEnd;
  const redOffset = C - yellowEnd;

  const tickAlerta = tick(THRESHOLD_ALERTA / maxLevel);
  const tickCritico = tick(THRESHOLD_CRITICO / maxLevel);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 300 195" className="w-full max-w-xs">
        <defs>
          <filter id="gauge-glow" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background track */}
        <circle cx={CX} cy={CY} r={R} fill="none"
          stroke="#1e293b" strokeWidth={28}
          strokeDasharray={`${ARC_LEN} ${C - ARC_LEN}`}
          strokeLinecap="butt" transform={TRANSFORM}
        />

        {/* Zone tint: green */}
        <circle cx={CX} cy={CY} r={R} fill="none"
          stroke="#14532d" strokeWidth={24} opacity={0.55}
          strokeDasharray={`${greenEnd} ${C - greenEnd}`}
          strokeDashoffset={0}
          strokeLinecap="butt" transform={TRANSFORM}
        />

        {/* Zone tint: yellow */}
        <circle cx={CX} cy={CY} r={R} fill="none"
          stroke="#78350f" strokeWidth={24} opacity={0.55}
          strokeDasharray={`${yellowEnd - greenEnd} ${C - (yellowEnd - greenEnd)}`}
          strokeDashoffset={yellowOffset}
          strokeLinecap="butt" transform={TRANSFORM}
        />

        {/* Zone tint: red */}
        <circle cx={CX} cy={CY} r={R} fill="none"
          stroke="#7f1d1d" strokeWidth={24} opacity={0.55}
          strokeDasharray={`${ARC_LEN - yellowEnd} ${C - (ARC_LEN - yellowEnd)}`}
          strokeDashoffset={redOffset}
          strokeLinecap="butt" transform={TRANSFORM}
        />

        {/* Filled arc — current level */}
        {fillLen > 0.5 && (
          <circle cx={CX} cy={CY} r={R} fill="none"
            stroke={color} strokeWidth={22}
            strokeDasharray={`${fillLen} ${C - fillLen}`}
            strokeLinecap="round"
            transform={TRANSFORM}
            filter="url(#gauge-glow)"
            style={{ transition: 'stroke-dasharray 0.7s ease, stroke 0.4s ease' }}
          />
        )}

        {/* Zone boundary ticks */}
        <line {...tickAlerta} stroke="#f59e0b" strokeWidth={3} strokeLinecap="round" opacity={0.9} />
        <line {...tickCritico} stroke="#ef4444" strokeWidth={3} strokeLinecap="round" opacity={0.9} />

        {/* Center reading */}
        <text x={CX} y={CY - 14} textAnchor="middle"
          fontSize={46} fontWeight="700" fill="white"
          fontFamily="ui-monospace, monospace"
          style={{ transition: 'fill 0.4s ease' }}
        >
          {level.toFixed(1)}
        </text>
        <text x={CX} y={CY + 12} textAnchor="middle" fontSize={14} fill="#475569">
          centímetros
        </text>
        <text x={CX} y={CY + 34} textAnchor="middle"
          fontSize={12} fontWeight="700" letterSpacing="3"
          fill={color}
          style={{ transition: 'fill 0.4s ease' }}
        >
          {label}
        </text>

        {/* Edge labels */}
        <text x={20} y={188} textAnchor="middle" fontSize={10} fill="#334155">0</text>
        <text x={280} y={188} textAnchor="middle" fontSize={10} fill="#334155">{DRAIN_DEPTH_CM}cm</text>
      </svg>

      {/* Legend */}
      <div className="flex gap-5 text-xs">
        {(Object.entries(ALERT_COLOR) as [AlertLevel, string][]).map(([al, clr]) => (
          <span key={al} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: clr }} />
            <span className="text-slate-500">
              {al === 'normal'
                ? `< ${THRESHOLD_ALERTA} cm`
                : al === 'alerta'
                  ? `${THRESHOLD_ALERTA}–${THRESHOLD_CRITICO} cm`
                  : `> ${THRESHOLD_CRITICO} cm`}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
