/**
 * CoolNet AI — Weather Intelligence Service (Open-Meteo Free API)
 * Implements cached fetching, 24h forecast parsing, and resilient fallbacks.
 */

import { calculate24hStats, Weather24hStats } from "@/lib/utils/statistics";

export interface HourlyPoint {
  time: string; // "14:00"
  temp: number; // °C
}

export interface NormalizedWeather {
  latitude: number;
  longitude: number;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  precipitation: number;
  cloudCover: number;
  weatherCode: number;
  timestamp: string;
  formattedTime: string;
  status: "LIVE" | "LAST_KNOWN" | "UNAVAILABLE";
  hourlyForecast: HourlyPoint[];
  stats24h: Weather24hStats;
}

// In-memory weather cache (10 min TTL)
const weatherCache = new Map<string, { data: NormalizedWeather; expiresAt: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000;

export async function getCurrentWeather(
  lat: number,
  lon: number
): Promise<NormalizedWeather> {
  const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  const now = Date.now();

  const cached = weatherCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,precipitation,cloud_cover,weather_code&hourly=temperature_2m&forecast_days=2`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);

    const data = await res.json();
    const current = data.current || {};
    const hourly = data.hourly || {};

    const temp = current.temperature_2m ?? 36.5;
    const apparent = current.apparent_temperature ?? temp + 3.0;
    const humidity = current.relative_humidity_2m ?? 55;
    const windSpeed = current.wind_speed_10m ?? 12;
    const windDir = current.wind_direction_10m ?? 180;
    const precipitation = current.precipitation ?? 0;
    const cloudCover = current.cloud_cover ?? 20;
    const weatherCode = current.weather_code ?? 0;

    // Parse next 24 hourly forecast points
    const hourlyForecast: HourlyPoint[] = [];
    const hourlyTemps: number[] = [];
    if (Array.isArray(hourly.time) && Array.isArray(hourly.temperature_2m)) {
      const limit = Math.min(24, hourly.time.length);
      for (let i = 0; i < limit; i++) {
        const timeStr = hourly.time[i];
        const dateObj = new Date(timeStr);
        const hours = String(dateObj.getHours()).padStart(2, "0");
        const tVal = hourly.temperature_2m[i];
        hourlyForecast.push({ time: `${hours}:00`, temp: Math.round(tVal * 10) / 10 });
        hourlyTemps.push(tVal);
      }
    }

    const stats24h = calculate24hStats(hourlyTemps);
    const dateNow = new Date();
    const formattedTime = dateNow.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });

    const result: NormalizedWeather = {
      latitude: lat,
      longitude: lon,
      temperature: Math.round(temp * 10) / 10,
      apparentTemperature: Math.round(apparent * 10) / 10,
      humidity: Math.round(humidity),
      windSpeed: Math.round(windSpeed),
      windDirection: Math.round(windDir),
      precipitation,
      cloudCover,
      weatherCode,
      timestamp: dateNow.toISOString(),
      formattedTime: `${formattedTime} IST`,
      status: "LIVE",
      hourlyForecast,
      stats24h,
    };

    weatherCache.set(cacheKey, { data: result, expiresAt: now + CACHE_TTL_MS });
    return result;
  } catch (err) {
    if (cached) {
      return { ...cached.data, status: "LAST_KNOWN" };
    }
    // Unavailable fallback
    const dateNow = new Date();
    return {
      latitude: lat,
      longitude: lon,
      temperature: 35.0,
      apparentTemperature: 38.0,
      humidity: 50,
      windSpeed: 10,
      windDirection: 180,
      precipitation: 0,
      cloudCover: 10,
      weatherCode: 0,
      timestamp: dateNow.toISOString(),
      formattedTime: `${dateNow.toLocaleTimeString()} IST`,
      status: "UNAVAILABLE",
      hourlyForecast: [],
      stats24h: { min: 28.0, max: 38.0, mean: 33.0 },
    };
  }
}
