import React from 'react';
import { ScrollView, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useApp } from '../../context/AppContext';
import { HourlyBarChart } from '../../components/HourlyBar';
import { RegionPicker } from '../../components/RegionPicker';

const LEGEND = [
  { rating: '◎', color: Colors.rating.excellent, label: '干し頃' },
  { rating: '○', color: Colors.rating.good, label: '良好' },
  { rating: '△', color: Colors.rating.fair, label: '注意' },
  { rating: '×', color: Colors.rating.poor, label: '部屋干し' },
];

export default function HourlyScreen() {
  const { regions, currentRegionId, forecast, loading, setCurrentRegion } = useApp();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} testID="hourly-screen">
      <RegionPicker regions={regions} currentRegionId={currentRegionId} onSelect={setCurrentRegion} />

      <View style={styles.legend}>
        {LEGEND.map(l => (
          <View key={l.rating} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: l.color }]} />
            <Text style={styles.legendText}>{l.rating} {l.label}</Text>
          </View>
        ))}
      </View>

      {loading && !forecast ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : forecast ? (
        <>
          <HourlyBarChart hourly={forecast.hourly} />
          <Text style={styles.sectionTitle}>1時間ごとの詳細</Text>
          {forecast.hourly.filter(h => h.hour >= 6 && h.hour <= 22).map(h => (
            <View key={h.hour} style={styles.row} testID={`hour-row-${h.hour}`}>
              <Text style={styles.rowHour}>{String(h.hour).padStart(2, '0')}:00</Text>
              <Text style={[styles.rowRating, {
                color: h.rating === '◎' ? Colors.rating.excellent :
                       h.rating === '○' ? Colors.rating.good :
                       h.rating === '△' ? Colors.rating.fair : Colors.rating.poor
              }]}>{h.rating}</Text>
              <View style={styles.rowDetails}>
                <Text style={styles.rowDetailText}>{Math.round(h.temp)}℃ / 湿度{Math.round(h.humidity)}%</Text>
                <Text style={styles.rowDetailMuted}>降水{h.precipitationProbability}% / 風{h.windSpeed.toFixed(1)}m/s</Text>
              </View>
              <Text style={styles.rowScore}>{h.score}</Text>
            </View>
          ))}
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  content: { paddingBottom: 32 },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 12,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: Colors.text, fontWeight: '600' },
  loading: { alignItems: 'center', paddingVertical: 64 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 6,
    backgroundColor: Colors.background,
    borderRadius: 12,
    gap: 12,
  },
  rowHour: { width: 56, fontSize: 15, fontWeight: '700', color: Colors.text },
  rowRating: { fontSize: 22, width: 30, textAlign: 'center' },
  rowDetails: { flex: 1 },
  rowDetailText: { fontSize: 13, color: Colors.text, fontWeight: '600' },
  rowDetailMuted: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  rowScore: { fontSize: 16, fontWeight: '700', color: Colors.primaryDark, width: 36, textAlign: 'right' },
});
