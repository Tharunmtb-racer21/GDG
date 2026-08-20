/**
 * CoolNet AI — Weather & Heat Stress Data Service
 * Integrates real-time ambient temp, relative humidity, and heat index computations.
 */

export interface WeatherDataPoint {
  region_id: string;
  name: string;
  temperature: number; // °C
  humidity: number; // %
  heat_index: number; // °C
  apparent_heat_stress: "LOW" | "MODERATE" | "HIGH" | "EXTREME";
  timestamp: string;
  is_live: boolean;
}

export function computeHeatIndex(temp: number, humidity: number): number {
  // Rothfusz Heat Index regression formula (NOAA standard)
  if (temp < 27) return temp;
  const T = (temp * 9) / 5 + 32; // Convert to °F
  const RH = humidity;

  let HI =
    -42.379 +
    2.04901523 * T +
    10.14333127 * RH -
    0.22475541 * T * RH -
    0.00683783 * T * T -
    0.05481717 * RH * RH +
    0.00122874 * T * T * RH +
    0.00085282 * T * RH * RH -
    0.00000199 * T * T * RH * RH;

  const celsius = ((HI - 32) * 5) / 9;
  return Math.round(celsius * 10) / 10;
}

export function getHeatStressLevel(heatIndex: number): "LOW" | "MODERATE" | "HIGH" | "EXTREME" {
  if (heatIndex < 35) return "LOW";
  if (heatIndex < 42) return "MODERATE";
  if (heatIndex < 48) return "HIGH";
  return "EXTREME";
}

export async function fetchLiveWeatherData(lat: number, lon: number): Promise<Partial<WeatherDataPoint>> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m`
    );
    if (!res.ok) throw new Error("Weather API degraded");
    const data = await res.json();
    const current = data.current || {};
    const temp = current.temperature_2m ?? 38.0;
    const humidity = current.relative_humidity_2m ?? 50.0;
    const hi = current.apparent_temperature ?? computeHeatIndex(temp, humidity);

    return {
      temperature: temp,
      humidity,
      heat_index: hi,
      apparent_heat_stress: getHeatStressLevel(hi),
      timestamp: current.time || new Date().toISOString(),
      is_live: true,
    };
  } catch (err) {
    return {
      is_live: false,
    };
  }
}
