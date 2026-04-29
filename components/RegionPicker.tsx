import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../constants/Colors';
import type { Region } from '../types';

interface Props {
  regions: Region[];
  currentRegionId: string;
  onSelect: (id: string) => void;
}

export function RegionPicker({ regions, currentRegionId, onSelect }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {regions.map(r => {
        const active = r.id === currentRegionId;
        return (
          <TouchableOpacity
            key={r.id}
            onPress={() => onSelect(r.id)}
            style={[styles.chip, active && styles.chipActive]}
            testID={`region-chip-${r.id}`}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{r.name}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
});
