import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import type { Region, Settings, DailyForecast } from '../types';
import { SEED_REGIONS } from '../data/seed-regions';
import {
  loadRegions, saveRegions,
  loadCurrentRegionId, saveCurrentRegionId,
  loadSettings, saveSettings,
  loadCachedForecast, saveCachedForecast,
} from '../services/storage';
import { fetchForecast, buildMockForecast } from '../services/weatherApi';

const DEFAULT_SETTINGS: Settings = {
  notifyRain: true,
  notifyTakeIn: true,
  notifyTime: '07:00',
  laundryAmount: 'medium',
  hasIncludedTowels: false,
  sessionCount: 0,
};

interface AppContextValue {
  regions: Region[];
  currentRegionId: string;
  forecast: DailyForecast | null;
  settings: Settings;
  loading: boolean;
  isOffline: boolean;
  setCurrentRegion: (id: string) => Promise<void>;
  refreshForecast: () => Promise<void>;
  updateSettings: (s: Partial<Settings>) => Promise<void>;
  addRegion: (r: Omit<Region, 'id'>) => Promise<void>;
  removeRegion: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [regions, setRegions] = useState<Region[]>(SEED_REGIONS);
  const [currentRegionId, setCurrentRegionId] = useState<string>('tokyo');
  const [forecast, setForecast] = useState<DailyForecast | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  const fetchForRegion = useCallback(async (region: Region) => {
    setLoading(true);
    setIsOffline(false);
    try {
      const fc = await fetchForecast(region);
      setForecast(fc);
      await saveCachedForecast(region.id, fc);
    } catch (err) {
      const cached = await loadCachedForecast(region.id);
      if (cached) {
        setForecast(cached);
        setIsOffline(true);
      } else {
        const mock = buildMockForecast(region);
        setForecast(mock);
        setIsOffline(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const persistedRegions = await loadRegions();
      const finalRegions = persistedRegions && persistedRegions.length ? persistedRegions : SEED_REGIONS;
      if (!persistedRegions) await saveRegions(SEED_REGIONS);
      setRegions(finalRegions);

      const persistedCurrent = await loadCurrentRegionId();
      const finalCurrent = persistedCurrent && finalRegions.find(r => r.id === persistedCurrent)
        ? persistedCurrent
        : (finalRegions.find(r => r.isDefault) || finalRegions[0]).id;
      setCurrentRegionId(finalCurrent);

      const persistedSettings = await loadSettings();
      const newSettings = persistedSettings || DEFAULT_SETTINGS;
      newSettings.sessionCount = (newSettings.sessionCount || 0) + 1;
      setSettings(newSettings);
      await saveSettings(newSettings);

      const region = finalRegions.find(r => r.id === finalCurrent) || finalRegions[0];
      await fetchForRegion(region);
    })();
  }, [fetchForRegion]);

  const setCurrentRegion = useCallback(async (id: string) => {
    setCurrentRegionId(id);
    await saveCurrentRegionId(id);
    const region = regions.find(r => r.id === id);
    if (region) await fetchForRegion(region);
  }, [regions, fetchForRegion]);

  const refreshForecast = useCallback(async () => {
    const region = regions.find(r => r.id === currentRegionId);
    if (region) await fetchForRegion(region);
  }, [regions, currentRegionId, fetchForRegion]);

  const updateSettings = useCallback(async (patch: Partial<Settings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      saveSettings(next).catch(() => undefined);
      return next;
    });
  }, []);

  const addRegion = useCallback(async (r: Omit<Region, 'id'>) => {
    const id = `r-${Date.now()}`;
    const next: Region[] = [...regions, { ...r, id }];
    setRegions(next);
    await saveRegions(next);
  }, [regions]);

  const removeRegion = useCallback(async (id: string) => {
    const next = regions.filter(r => r.id !== id);
    setRegions(next);
    await saveRegions(next);
    if (currentRegionId === id && next.length > 0) {
      const newCurrent = (next.find(r => r.isDefault) || next[0]).id;
      setCurrentRegionId(newCurrent);
      await saveCurrentRegionId(newCurrent);
      const region = next.find(r => r.id === newCurrent);
      if (region) await fetchForRegion(region);
    }
  }, [regions, currentRegionId, fetchForRegion]);

  const value: AppContextValue = {
    regions,
    currentRegionId,
    forecast,
    settings,
    loading,
    isOffline,
    setCurrentRegion,
    refreshForecast,
    updateSettings,
    addRegion,
    removeRegion,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
