'use client';

import { useState, useEffect, useRef } from 'react';
import type { SensorReading, AlertEvent } from '@/types/sensor';
import { getAlertMessage } from '@/lib/simulation';

const HISTORY_MAX = 120;
const POLL_INTERVAL_MS = 5000; // poll every 5 s (ESP32 sends every 60 s)

async function fetchHistory(locationId: string): Promise<SensorReading[]> {
  const res = await fetch(`/api/sensor?location=${encodeURIComponent(locationId)}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Sensor API error');
  const data = await res.json();
  console.log('[useSensorData] API response:', data);
  return data.readings as SensorReading[];
}

function buildSeededAlerts(readings: SensorReading[]): AlertEvent[] {
  const alerts: AlertEvent[] = [];
  for (let i = 1; i < readings.length; i++) {
    const prev = readings[i - 1];
    const curr = readings[i];
    if (curr.alertLevel !== prev.alertLevel && curr.alertLevel !== 'normal') {
      alerts.push({
        id: `seed-${i}`,
        timestamp: curr.timestamp,
        level: curr.level,
        alertLevel: curr.alertLevel,
        message: getAlertMessage(curr.level, curr.alertLevel),
      });
    }
  }
  return alerts.slice(-20);
}

export function useSensorData(locationId: string) {
  const [history, setHistory] = useState<SensorReading[]>([]);
  const [alertHistory, setAlertHistory] = useState<AlertEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const prevAlertRef = useRef<string | null>(null);
  const lastTimestampRef = useRef<number>(0);

  useEffect(() => {
    let cancelled = false;
    prevAlertRef.current = null;
    lastTimestampRef.current = 0;
    setIsLoading(true);
    setHistory([]);
    setAlertHistory([]);

    // Initial load — populate history from stored readings
    fetchHistory(locationId)
      .then(readings => {
        if (cancelled) return;
        if (readings.length > 0) {
          lastTimestampRef.current = readings[readings.length - 1].timestamp;
          prevAlertRef.current = readings[readings.length - 1].alertLevel;
          setHistory(readings);
          setAlertHistory(buildSeededAlerts(readings));
        }
        setIsLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError('Falha na comunicação com o sensor');
          setIsLoading(false);
        }
      });

    // Live polling — detect new readings since last timestamp
    const interval = setInterval(async () => {
      if (cancelled) return;
      try {
        const readings = await fetchHistory(locationId);
        if (cancelled) return;

        const newReadings = readings.filter(r => r.timestamp > lastTimestampRef.current);
        if (newReadings.length === 0) return;

        lastTimestampRef.current = newReadings[newReadings.length - 1].timestamp;
        setHistory(prev => [...prev, ...newReadings].slice(-HISTORY_MAX));
        setError(null);

        for (const reading of newReadings) {
          if (reading.alertLevel !== prevAlertRef.current) {
            if (reading.alertLevel !== 'normal') {
              const event: AlertEvent = {
                id: `evt-${reading.timestamp}`,
                timestamp: reading.timestamp,
                level: reading.level,
                alertLevel: reading.alertLevel,
                message: getAlertMessage(reading.level, reading.alertLevel),
              };
              setAlertHistory(prev => [...prev, event].slice(-50));
            }
            prevAlertRef.current = reading.alertLevel;
          }
        }
      } catch {
        if (!cancelled) setError('Falha na comunicação com o sensor');
      }
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [locationId]);

  return {
    currentReading: history[history.length - 1] ?? null,
    history,
    alertHistory,
    isLoading,
    error,
  };
}
