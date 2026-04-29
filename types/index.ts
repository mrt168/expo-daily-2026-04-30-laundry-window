export interface LaundryScore {
  hour: number;
  score: number;
  temp: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  precipitationProbability: number;
  rating: '◎' | '○' | '△' | '×';
  label: string;
}

export interface DailyForecast {
  date: string;
  bestStartHour: number;
  bestEndHour: number;
  bestScore: number;
  hourly: LaundryScore[];
  rainAlert: { hour: number; reason: string } | null;
  recommendation: 'outdoor' | 'indoor' | 'partial';
  fetchedAt: string;
}

export interface Region {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

export interface Settings {
  notifyRain: boolean;
  notifyTakeIn: boolean;
  notifyTime: string;
  laundryAmount: 'small' | 'medium' | 'large';
  hasIncludedTowels: boolean;
  sessionCount: number;
}
