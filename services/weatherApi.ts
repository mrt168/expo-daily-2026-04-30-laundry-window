import type { DailyForecast, Region } from '../types';
import { calculateScore, findBestWindow, ratingFromScore } from './scoreCalculator';

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

interface OpenMeteoResponse {
  hourly: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    wind_speed_10m: number[];
    precipitation_probability: number[];
    precipitation: number[];
  };
}

export async function fetchForecast(region: Region): Promise<DailyForecast> {
  const url = `${BASE_URL}?latitude=${region.latitude}&longitude=${region.longitude}` +
    `&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation_probability,precipitation` +
    `&timezone=Asia/Tokyo&forecast_days=1`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json: OpenMeteoResponse = await res.json();
    return parseForecast(json);
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

function parseForecast(json: OpenMeteoResponse): DailyForecast {
  const today = new Date().toISOString().slice(0, 10);
  const hourly = json.hourly.time.slice(0, 24).map((iso, i) => {
    const hour = parseInt(iso.slice(11, 13), 10);
    return calculateScore({
      hour,
      temp: json.hourly.temperature_2m[i],
      humidity: json.hourly.relative_humidity_2m[i],
      windSpeed: json.hourly.wind_speed_10m[i] / 3.6,
      precipitation: json.hourly.precipitation[i],
      precipitationProbability: json.hourly.precipitation_probability[i] || 0,
    });
  });

  const window = findBestWindow(hourly);
  const rainStart = hourly.find(h => h.precipitationProbability >= 60);
  const rainAlert = rainStart ? { hour: rainStart.hour, reason: `${rainStart.hour}:00頃から雨の予報` } : null;

  let recommendation: 'outdoor' | 'indoor' | 'partial' = 'outdoor';
  const peak = hourly.reduce((m, h) => Math.max(m, h.score), 0);
  if (peak < 35) recommendation = 'indoor';
  else if (peak < 65) recommendation = 'partial';

  return {
    date: today,
    bestStartHour: window.startHour,
    bestEndHour: window.endHour,
    bestScore: window.bestScore,
    hourly,
    rainAlert,
    recommendation,
    fetchedAt: new Date().toISOString(),
  };
}

export function buildMockForecast(region: Region): DailyForecast {
  const today = new Date().toISOString().slice(0, 10);
  const hourly = Array.from({ length: 24 }, (_, hour) => {
    let temp = 22 + Math.sin((hour - 12) / 6) * 5;
    let humidity = 60 - Math.cos((hour - 14) / 4) * 15;
    let wind = 2 + Math.sin(hour / 5) * 1.5;
    let pp = hour > 18 ? 30 : 5;
    let p = 0;
    if (region.id === 'osaka') {
      humidity += 5;
      pp += 10;
    }
    return calculateScore({
      hour,
      temp,
      humidity,
      windSpeed: wind,
      precipitation: p,
      precipitationProbability: pp,
    });
  });
  const window = findBestWindow(hourly);
  return {
    date: today,
    bestStartHour: window.startHour,
    bestEndHour: window.endHour,
    bestScore: window.bestScore,
    hourly,
    rainAlert: null,
    recommendation: 'outdoor',
    fetchedAt: new Date().toISOString(),
  };
}
