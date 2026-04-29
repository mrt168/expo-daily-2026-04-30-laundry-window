import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import type { LaundryScore } from '../types';

interface Props {
  hourly: LaundryScore[];
}

export function HourlyBarChart({ hourly }: Props) {
  return (
    <View style={styles.container} testID="hourly-bars">
      <View style={styles.barsRow}>
        {hourly.map(h => {
          const color =
            h.rating === '◎' ? Colors.rating.excellent :
            h.rating === '○' ? Colors.rating.good :
            h.rating === '△' ? Colors.rating.fair :
            Colors.rating.poor;
          const heightPct = Math.max(8, h.score);
          return (
            <View key={h.hour} style={styles.barCol}>
              <View style={styles.barTrack}>
                <View style={[styles.bar, { height: `${heightPct}%`, backgroundColor: color }]} />
              </View>
            </View>
          );
        })}
      </View>
      <View style={styles.labels}>
        {[0, 6, 12, 18, 23].map(h => (
          <Text key={h} style={styles.label}>{h}時</Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  barsRow: {
    flexDirection: 'row',
    height: 180,
    alignItems: 'flex-end',
  },
  barCol: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 1,
    justifyContent: 'flex-end',
  },
  barTrack: {
    flex: 1,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 11,
    color: Colors.textMuted,
  },
});
