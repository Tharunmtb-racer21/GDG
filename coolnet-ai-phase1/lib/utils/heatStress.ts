/**
 * CoolNet Prototype Heat Stress Calculator & Drivers Analysis
 * Normalized Rothfusz NOAA Heat Index & Multi-factor Heat Stress Score (0-100)
 */

export interface HeatStressResult {
  score: number; // 0-100 score
  category: "LOW" | "MODERATE" | "HIGH" | "EXTREME";
  heatIndex: number; // °C
  explanation: string;
  drivers: {
    temperatureFactor: number; // % contribution
    humidityFactor: number; // % contribution
    feelsLikeFactor: number; // % contribution
    windReliefFactor: number; // % relief
  };
}

export function computeRothfuszHeatIndex(tempC: number, humidityPct: number): number {
  if (tempC < 26) return tempC;
  const T = (tempC * 9) / 5 + 32; // °F
  const RH = humidityPct;

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

export function calculateHeatStress(
  temperature: number,
  humidity: number,
  apparentTemperature: number,
  windSpeed: number = 10
): HeatStressResult {
  const heatIndex = computeRothfuszHeatIndex(temperature, humidity);

  // Normalize Temperature (assume 25°C = 0, 48°C = 100)
  const tempNorm = Math.min(100, Math.max(0, ((temperature - 25) / 23) * 100));

  // Normalize Humidity (assume 30% = 0, 90% = 100)
  const humidityNorm = Math.min(100, Math.max(0, ((humidity - 30) / 60) * 100));

  // Normalize Apparent Temperature (assume 25°C = 0, 52°C = 100)
  const apparentNorm = Math.min(100, Math.max(0, ((apparentTemperature - 25) / 27) * 100));

  // Wind Cooling Relief (higher wind reduces stress)
  const windRelief = Math.min(30, Math.max(0, windSpeed * 1.5));

  // Weighted Heat Stress formulation
  const rawScore =
    tempNorm * 0.40 +
    humidityNorm * 0.30 +
    apparentNorm * 0.30 -
    windRelief * 0.35;

  const score = Math.round(Math.min(100, Math.max(0, rawScore)));

  let category: "LOW" | "MODERATE" | "HIGH" | "EXTREME" = "LOW";
  if (score >= 80) category = "EXTREME";
  else if (score >= 60) category = "HIGH";
  else if (score >= 30) category = "MODERATE";

  let explanation = "";
  if (category === "EXTREME") {
    explanation = "Critical thermal danger driven by dangerous temperature and heavy relative humidity.";
  } else if (category === "HIGH") {
    explanation = "High heat stress primarily driven by elevated temperature combined with high humidity.";
  } else if (category === "MODERATE") {
    explanation = "Moderate thermal load; manageable with adequate ventilation and hydration.";
  } else {
    explanation = "Low thermal stress; ambient conditions are safe for outdoor activity.";
  }

  return {
    score,
    category,
    heatIndex,
    explanation,
    drivers: {
      temperatureFactor: Math.round(tempNorm),
      humidityFactor: Math.round(humidityNorm),
      feelsLikeFactor: Math.round(apparentNorm),
      windReliefFactor: Math.round(windRelief),
    },
  };
}
