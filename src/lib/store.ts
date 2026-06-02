import type { AlertLevel } from '@/types/sensor';
import { DRAIN_DEPTH_CM, THRESHOLD_ALERTA, THRESHOLD_CRITICO } from '@/lib/config';

export { DRAIN_DEPTH_CM };

export interface StoredReading {
  device_id: string;
  distance_cm: number;
  level: number;
  alertLevel: AlertLevel;
  timestamp: number;
}

const MAX_HISTORY = 120;

function getAlertLevel(level: number): AlertLevel {
  if (level < THRESHOLD_ALERTA) return 'normal';
  if (level < THRESHOLD_CRITICO) return 'alerta';
  return 'critico';
}

// Global variable persists across hot-reloads in dev and works on single-instance deployments.
// For multi-instance production (e.g. Vercel with >1 region), swap this for Vercel KV / Redis.
declare global {
  // eslint-disable-next-line no-var
  var __sensorStore: Map<string, StoredReading[]> | undefined;
}
if (!global.__sensorStore) global.__sensorStore = new Map();

export function addReading(device_id: string, distance_cm: number): StoredReading {
  const level = Math.max(0, Math.round((DRAIN_DEPTH_CM - distance_cm) * 10) / 10);
  const reading: StoredReading = {
    device_id,
    distance_cm,
    level,
    alertLevel: getAlertLevel(level),
    timestamp: Date.now(),
  };

  const list = global.__sensorStore!.get(device_id) ?? [];
  list.push(reading);
  if (list.length > MAX_HISTORY) list.splice(0, list.length - MAX_HISTORY);
  global.__sensorStore!.set(device_id, list);

  return reading;
}

export function getReadings(device_id: string, count = 60): StoredReading[] {
  return (global.__sensorStore!.get(device_id) ?? []).slice(-count);
}
