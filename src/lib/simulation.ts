import type { AlertLevel, SensorReading } from '@/types/sensor';
import { DRAIN_DEPTH_CM, THRESHOLD_ALERTA, THRESHOLD_CRITICO } from '@/lib/config';

export const MAX_LEVEL = DRAIN_DEPTH_CM;

export function getAlertLevel(level: number): AlertLevel {
  if (level < THRESHOLD_ALERTA) return 'normal';
  if (level < THRESHOLD_CRITICO) return 'alerta';
  return 'critico';
}

export function getAlertMessage(level: number, alertLevel: AlertLevel): string {
  if (alertLevel === 'critico')
    return `Nível crítico: ${level.toFixed(1)} cm — risco de transbordamento`;
  if (alertLevel === 'alerta')
    return `Nível de atenção: ${level.toFixed(1)} cm — monitorar de perto`;
  return `Nível normalizado: ${level.toFixed(1)} cm`;
}

// Module-level simulation state persists between readings
let simLevel = 12;
let simTrend = 0.3;

export function generateNextReading(): SensorReading {
  const noise = (Math.random() - 0.5) * 1.8;
  simLevel = Math.max(0, Math.min(MAX_LEVEL, simLevel + simTrend + noise));
  simTrend += (Math.random() - 0.52) * 0.1;
  simTrend = Math.max(-0.9, Math.min(0.9, simTrend));

  return {
    timestamp: Date.now(),
    level: Math.round(simLevel * 10) / 10,
    alertLevel: getAlertLevel(simLevel),
  };
}

export function generateInitialHistory(seconds = 60): SensorReading[] {
  const readings: SensorReading[] = [];
  let level = 10;
  let trend = 0.3;
  const now = Date.now();

  for (let i = seconds; i >= 0; i--) {
    const noise = (Math.random() - 0.5) * 1.8;
    level = Math.max(0, Math.min(MAX_LEVEL, level + trend + noise));
    trend += (Math.random() - 0.52) * 0.1;
    trend = Math.max(-0.9, Math.min(0.9, trend));
    readings.push({
      timestamp: now - i * 1000,
      level: Math.round(level * 10) / 10,
      alertLevel: getAlertLevel(level),
    });
  }

  // Sync module state with where the simulation ended
  simLevel = level;
  simTrend = trend;

  return readings;
}
