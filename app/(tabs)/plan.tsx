import React, { useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useApp } from '../../context/AppContext';

const AMOUNTS: { id: 'small' | 'medium' | 'large'; label: string; baseHours: number }[] = [
  { id: 'small', label: '少なめ', baseHours: 3 },
  { id: 'medium', label: '普通', baseHours: 4 },
  { id: 'large', label: '多め', baseHours: 6 },
];

export default function PlanScreen() {
  const { settings, forecast, updateSettings } = useApp();

  const recommendation = useMemo(() => {
    const amt = AMOUNTS.find(a => a.id === settings.laundryAmount) ?? AMOUNTS[1];
    let hours = amt.baseHours;
    if (settings.hasIncludedTowels) hours = Math.ceil(hours * 1.3);
    const startHour = forecast?.bestStartHour ?? 9;
    const endHour = Math.min(startHour + hours, 18);
    return {
      hours,
      startLabel: `${String(startHour).padStart(2, '0')}:00`,
      endLabel: `${String(endHour).padStart(2, '0')}:00`,
    };
  }, [settings, forecast]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} testID="plan-screen">
      <Text style={styles.label}>洗濯物の量</Text>
      <View style={styles.row}>
        {AMOUNTS.map(a => {
          const active = settings.laundryAmount === a.id;
          return (
            <TouchableOpacity
              key={a.id}
              style={[styles.segment, active && styles.segmentActive]}
              onPress={() => updateSettings({ laundryAmount: a.id })}
              testID={`amount-${a.id}`}
            >
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{a.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>タオルを含む</Text>
        <Switch
          value={settings.hasIncludedTowels}
          onValueChange={v => updateSettings({ hasIncludedTowels: v })}
          trackColor={{ false: Colors.border, true: Colors.primary }}
          thumbColor="#FFFFFF"
          testID="towels-switch"
        />
      </View>

      <View style={styles.resultCard} testID="plan-result">
        <Text style={styles.resultLabel}>乾燥時間目安</Text>
        <Text style={styles.resultValue}>{recommendation.hours}時間</Text>

        <View style={styles.divider} />

        <Text style={styles.resultLabel}>ベスト開始時刻</Text>
        <Text style={styles.resultValueAlt}>{recommendation.startLabel}</Text>
        <Text style={styles.helperText}>{recommendation.startLabel} 〜 {recommendation.endLabel} の間に干すのがおすすめ</Text>
      </View>

      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>乾燥時間のポイント</Text>
        <Text style={styles.tipText}>タオルや厚手の衣類を含む場合、乾燥時間は約30%伸びます。風速が3m/s以上の時間帯が含まれると更に短縮できます。</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  content: { padding: 16, paddingBottom: 32 },
  label: { color: Colors.textMuted, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  segment: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  segmentText: { color: Colors.text, fontWeight: '700' },
  segmentTextActive: { color: '#FFFFFF' },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  toggleLabel: { color: Colors.text, fontWeight: '600', fontSize: 15 },
  resultCard: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  resultLabel: { color: Colors.textMuted, fontWeight: '600', fontSize: 13 },
  resultValue: { fontSize: 36, fontWeight: '700', color: Colors.text, marginTop: 4 },
  resultValueAlt: { fontSize: 28, fontWeight: '700', color: Colors.primaryDark, marginTop: 4 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 16 },
  helperText: { color: Colors.textMuted, fontSize: 12, marginTop: 6 },
  tipCard: {
    marginTop: 16,
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tipTitle: { color: Colors.text, fontWeight: '700', marginBottom: 6 },
  tipText: { color: Colors.textMuted, fontSize: 13, lineHeight: 20 },
});
