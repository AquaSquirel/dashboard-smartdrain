import { NextRequest, NextResponse } from 'next/server';
import { addReading, getReadings } from '@/lib/store';

// Map dashboard location IDs → ESP32 device IDs
const LOCATION_DEVICE: Record<string, string> = {
  'galeria-central': 'node-sensor-01',
};

const DEFAULT_DEVICE = 'node-sensor-01';

export async function POST(req: NextRequest) {
  const expected = process.env.API_TOKEN ?? 'dev-token';
  const auth = req.headers.get('Authorization') ?? '';
  if (auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { device_id, distance_cm } = body;
  if (typeof distance_cm !== 'number' || typeof device_id !== 'string') {
    return NextResponse.json({ error: 'Missing or invalid fields: device_id (string) and distance_cm (number) are required' }, { status: 400 });
  }

  const reading = addReading(device_id, distance_cm);
  console.log(`[sensor] ${device_id} → distance=${distance_cm} cm, level=${reading.level} cm (${reading.alertLevel})`);

  return NextResponse.json({ ok: true, reading });
}

export async function GET(req: NextRequest) {
  const location = req.nextUrl.searchParams.get('location') ?? 'galeria-central';
  const device_id = LOCATION_DEVICE[location] ?? DEFAULT_DEVICE;
  const readings = getReadings(device_id, 60);
  console.log(`[sensor GET] location=${location} device=${device_id} readings=${readings.length}`, readings.at(-1) ?? 'no data');
  return NextResponse.json({ readings });
}
