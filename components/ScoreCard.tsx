import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import type { DailyForecast } from '../types';

interface Props {
  forecast: DailyForecast;
}

export function ScoreCard({ forecast }: Props) {
  const start = String(forecast.bestStartHour).padStart(2, '0');
  const end = String(forecast.bestEndHour).padStart(2, '0');
  const rating = forecast.bestScore >= 75 ? '◎' : forecast.bestScore >= 55 ? '○' : forecast.bestScore >= 35 ? '△' : '×';
  const ratingColor =
    rating === '◎' ? Colors.rating.excellent :
    rating === '○' ? Colors.rating.good :
    rating === '△' ? Colors.rating.fair :
    Colors.rating.poor;

  const subText =
    rating === '◎' ? '今日は外干し日和！' :
    rating === '○' ? '外干しできそうです' :
    rating === '△' ? '半分外干しがおすすめ' :
    '今日は部屋干し推奨';

  const peakHour = forecast.hourly.reduce((m, h) => h.score > m.score ? h : m, forecast.hourly[0]);

  return (
    <View style={styles.card} testID="score-card">
      <Text style={styles.label}>今日の干し時</Text>
      <View style={styles.scoreRow}>
        <Text style={styles.timeRange}>{start}:00〜{end}:00</Text>
        <Text style={[styles.rating, { color: ratingColor }]}>{rating}</Text>
      </View>
      <Text style={styles.subText}>{subText}</Text>
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>気温</Text>
          <Text style={styles.summaryValue}>{Math.round(peakHour.temp)}℃</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>湿度</Text>
          <Text style={styles.summaryValue}>{Math.round(peakHour.humidity)}%</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>風速</Text>
          <Text style={styles.summaryValue}>{peakHour.windSpeed.toFixed(1)}m/s</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background,
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 16,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    color: Colors.textMuted,
    fontWeight: '600',
    marginBottom: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  timeRange: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.text,
    marginRight: 12,
  },
  rating: {
    fontSize: 48,
    fontWeight: '700',
  },
  subText: {
    marginTop: 4,
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  summary: {
    marginTop: 18,
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: 12,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 2,
  },
  divider: {
    width: 1,
    backgroundColor: Colors.border,
  },
});
