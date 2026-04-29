import type { LaundryScore } from '../types';

interface HourlyInput {
  hour: number;
  temp: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  precipitationProbability: number;
}

export function ratingFromScore(s: number): '◎' | '○' | '△' | '×' {
  if (s >= 75) return '◎';
  if (s >= 55) return '○';
  if (s >= 35) return '△';
  return '×';
}

export function labelFromRating(rating: '◎' | '○' | '△' | '×'): string {
  switch (rating) {
    case '◎': return '干し頃';
    case '○': return '良好';
    case '△': return '注意';
    case '×': return '部屋干し';
  }
}

export function calculateScore(h: HourlyInput): LaundryScore {
  const humidityScore = Math.max(0, (100 - h.humidity)) * 0.4;
  const windScore = Math.min(h.windSpeed * 5, 30);
  const tempScore = Math.max(0, 30 - Math.abs(h.temp - 22));

  let s = humidityScore + windScore + tempScore;

  if (h.precipitationProbability > 30) s *= 0.5;
  if (h.precipitationProbability > 60) s *= 0.3;
  if (h.precipitation > 0.1) s *= 0.2;

  const score = Math.round(Math.max(0, Math.min(100, s)));
  const rating = ratingFromScore(score);
  const label = `${String(h.hour).padStart(2, '0')}:00 ${rating} ${labelFromRating(rating)}`;

  return {
    hour: h.hour,
    score,
    temp: h.temp,
    humidity: h.humidity,
    windSpeed: h.windSpeed,
    precipitation: h.precipitation,
    precipitationProbability: h.precipitationProbability,
    rating,
    label,
  };
}

export function findBestWindow(hourly: LaundryScore[]): { startHour: number; endHour: number; bestScore: number } {
  let best = { startHour: 9, endHour: 14, bestScore: 0 };
  let currentBest = 0;
  let currentStart = -1;
  for (let i = 0; i < hourly.length; i++) {
    const s = hourly[i].score;
    if (s >= 55) {
      if (currentStart === -1) currentStart = hourly[i].hour;
      currentBest = Math.max(currentBest, s);
      if (i === hourly.length - 1 || hourly[i + 1].score < 55) {
        const range = { startHour: currentStart, endHour: hourly[i].hour, bestScore: currentBest };
        if (range.bestScore > best.bestScore) best = range;
        currentStart = -1;
        currentBest = 0;
      }
    }
  }
  return best;
}
