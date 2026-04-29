import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { Colors } from '../constants/Colors';
import { useApp } from '../context/AppContext';

const TODAY = new Date();
const formatDate = (d: Date) => `${d.getMonth() + 1}月${d.getDate()}日(${'日月火水木金土'[d.getDay()]})`;

export default function ShareScreen() {
  const { regions, currentRegionId, forecast } = useApp();
  const cardRef = useRef<View>(null);
  const [busy, setBusy] = useState(false);

  const region = regions.find(r => r.id === currentRegionId) ?? regions[0];

  const bestHour = forecast?.hourly.find(h => h.hour === forecast?.bestStartHour);
  const dailyRating = bestHour?.rating ?? '○';
  const dailyScore = forecast?.bestScore ?? 70;
  const tempMax = forecast ? Math.max(...forecast.hourly.map(h => h.temp)) : 22;
  const precipMax = forecast ? Math.max(...forecast.hourly.map(h => h.precipitationProbability)) : 10;
  const windAvg = forecast && forecast.hourly.length
    ? forecast.hourly.reduce((s, h) => s + h.windSpeed, 0) / forecast.hourly.length
    : 2;

  const ratingColor =
    dailyRating === '◎' ? Colors.rating.excellent
    : dailyRating === '○' ? Colors.rating.good
    : dailyRating === '△' ? Colors.rating.fair : Colors.rating.poor;

  const onSave = async () => {
    if (!cardRef.current) return;
    setBusy(true);
    try {
      const uri = await captureRef(cardRef, { format: 'png', quality: 1, result: 'tmpfile' });
      if (Platform.OS !== 'web') {
        const perm = await MediaLibrary.requestPermissionsAsync();
        if (perm.status === 'granted') {
          await MediaLibrary.saveToLibraryAsync(uri);
          Alert.alert('保存完了', 'カメラロールに保存しました');
        } else {
          Alert.alert('権限が必要です', '写真ライブラリへの保存を許可してください');
        }
      } else {
        Alert.alert('保存完了', uri);
      }
    } catch (e: any) {
      Alert.alert('保存に失敗しました', String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  };

  const onShare = async () => {
    if (!cardRef.current) return;
    setBusy(true);
    try {
      const uri = await captureRef(cardRef, { format: 'png', quality: 1, result: 'tmpfile' });
      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: '洗濯びより シェア' });
      } else {
        Alert.alert('シェア不可', 'この端末ではシェアが利用できません');
      }
    } catch (e: any) {
      Alert.alert('シェアに失敗しました', String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.root} testID="share-screen">
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} testID="share-close">
          <Ionicons name="close" color={Colors.text} size={26} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>シェアカード</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.cardWrap}>
          <View ref={cardRef} collapsable={false} style={styles.card} testID="share-card">
            <View style={styles.cardHeader}>
              <Text style={styles.cardBrand}>洗濯びより</Text>
              <Text style={styles.cardDate}>{formatDate(TODAY)} {region?.name ?? ''}</Text>
            </View>

            <View style={[styles.ratingCircle, { backgroundColor: ratingColor }]}>
              <Text style={styles.ratingMark}>{dailyRating}</Text>
            </View>
            <Text style={styles.score}>{dailyScore}<Text style={styles.scoreUnit}>/100</Text></Text>

            <Text style={styles.headline}>
              {forecast?.recommendation === 'indoor' ? '今日は部屋干しがおすすめ'
                : forecast?.recommendation === 'partial' ? '時間帯に注意して干そう'
                : '今日は外干し日和！'}
            </Text>

            <View style={styles.timeBlock}>
              <Text style={styles.timeLabel}>ベスト開始時刻</Text>
              <Text style={styles.timeValue}>{String(forecast?.bestStartHour ?? 9).padStart(2, '0')}:00</Text>
            </View>

            <View style={styles.metricsRow}>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>気温</Text>
                <Text style={styles.metricValue}>{Math.round(tempMax)}℃</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>降水</Text>
                <Text style={styles.metricValue}>{Math.round(precipMax)}%</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>風</Text>
                <Text style={styles.metricValue}>{windAvg.toFixed(1)}m/s</Text>
              </View>
            </View>

            <Text style={styles.hashTag}>#洗濯びより  #干し時</Text>
            <Text style={styles.cardFooter}>Open-Meteo / 洗濯びより通知</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={onShare} disabled={busy} testID="share-action">
            <Ionicons name="share-social" color="#FFFFFF" size={18} />
            <Text style={styles.btnPrimaryText}>シェアする</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={onSave} disabled={busy} testID="share-save">
            <Ionicons name="download" color={Colors.primary} size={18} />
            <Text style={styles.btnSecondaryText}>保存する</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>X / Threads にハッシュタグ付きで投稿すると、みんなの干し時計画に役立ちます。</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  topTitle: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  scroll: { padding: 16, paddingBottom: 32 },
  cardWrap: { alignItems: 'center', marginBottom: 16 },
  card: {
    width: 320,
    aspectRatio: 9 / 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  cardHeader: { alignItems: 'center', marginTop: 4, marginBottom: 16 },
  cardBrand: { color: Colors.primaryDark, fontSize: 18, fontWeight: '800', letterSpacing: 1 },
  cardDate: { color: Colors.textMuted, fontSize: 12, marginTop: 4 },
  ratingCircle: {
    width: 132,
    height: 132,
    borderRadius: 66,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  ratingMark: { color: '#FFFFFF', fontSize: 80, fontWeight: '800', lineHeight: 88 },
  score: { fontSize: 44, fontWeight: '800', color: Colors.text, marginTop: 12 },
  scoreUnit: { fontSize: 18, fontWeight: '700', color: Colors.textMuted },
  headline: { fontSize: 16, fontWeight: '700', color: Colors.text, marginTop: 4, textAlign: 'center' },
  timeBlock: { alignItems: 'center', marginTop: 16 },
  timeLabel: { fontSize: 12, color: Colors.textMuted, fontWeight: '600' },
  timeValue: { fontSize: 30, fontWeight: '800', color: Colors.primaryDark, marginTop: 2 },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 16,
    width: '100%',
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    borderRadius: 12,
  },
  metric: { alignItems: 'center', flex: 1 },
  metricLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '600' },
  metricValue: { fontSize: 16, fontWeight: '700', color: Colors.text, marginTop: 2 },
  metricDivider: { width: 1, height: 28, backgroundColor: Colors.border },
  hashTag: { color: Colors.accent, fontSize: 14, fontWeight: '700', marginTop: 18 },
  cardFooter: { color: Colors.textMuted, fontSize: 10, marginTop: 8 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  btnPrimary: { backgroundColor: Colors.primary },
  btnPrimaryText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  btnSecondary: { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  btnSecondaryText: { color: Colors.primary, fontWeight: '700', fontSize: 15 },
  hint: { color: Colors.textMuted, fontSize: 12, marginTop: 16, textAlign: 'center', lineHeight: 18 },
});
