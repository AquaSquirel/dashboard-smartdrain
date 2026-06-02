export type AlertLevel = 'normal' | 'alerta' | 'critico';

export interface SensorReading {
  timestamp: number;
  level: number; // cm
  alertLevel: AlertLevel;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  district: string;
  active: boolean;
}

export interface AlertEvent {
  id: string;
  timestamp: number;
  level: number;
  alertLevel: AlertLevel;
  message: string;
}
