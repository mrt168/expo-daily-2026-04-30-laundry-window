import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Region, Settings, DailyForecast } from '../types';

const KEYS = {
  regions: 'lw:regions:v1',
  currentRegionId: 'lw:currentRegionId:v1',
  settings: 'lw:settings:v1',
  forecastPrefix: 'lw:forecast:',
};

export async function loadRegions(): Promise<Region[] | null> {
  const raw = await AsyncStorage.getItem(KEYS.regions);
  return raw ? JSON.parse(raw) : null;
}

export async function saveRegions(regions: Region[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.regions, JSON.stringify(regions));
}

export async function loadCurrentRegionId(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.currentRegionId);
}

export async function saveCurrentRegionId(id: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.currentRegionId, id);
}

export async function loadSettings(): Promise<Settings | null> {
  const raw = await AsyncStorage.getItem(KEYS.settings);
  return raw ? JSON.parse(raw) : null;
}

export async function saveSettings(s: Settings): Promise<void> {
  await AsyncStorage.setItem(KEYS.settings, JSON.stringify(s));
}

export async function loadCachedForecast(regionId: string): Promise<DailyForecast | null> {
  const raw = await AsyncStorage.getItem(KEYS.forecastPrefix + regionId);
  if (!raw) return null;
  try {
    const parsed: DailyForecast = JSON.parse(raw);
    const ageMs = Date.now() - new Date(parsed.fetchedAt).getTime();
    if (ageMs > 60 * 60 * 1000) return parsed;
    return parsed;
  } catch {
    return null;
  }
}

export async function saveCachedForecast(regionId: string, forecast: DailyForecast): Promise<void> {
  await AsyncStorage.setItem(KEYS.forecastPrefix + regionId, JSON.stringify(forecast));
}
