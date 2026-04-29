import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { useApp } from '../../context/AppContext';
import { ScoreCard } from '../../components/ScoreCard';
import { RegionPicker } from '../../components/RegionPicker';

export default function HomeScreen() {
  const { regions, currentRegionId, forecast, loading, isOffline, setCurrentRegion, refreshForecast } = useApp();

  const onShare = () => {
    router.push('/share');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading && !!forecast} onRefresh={refreshForecast} />}
      testID="home-screen"
    >
      <View style={styles.headerRow}>
        <View style={styles.regionHeader}>
          <Ionicons name="location" color={Colors.primary} size={18} />
          <Text style={styles.regionLabel}>地域を選ぶ</Text>
        </View>
        <TouchableOpacity onPress={onShare} style={styles.shareBtn} testID="share-button">
          <Ionicons name="share-social" color="#FFFFFF" size={18} />
          <Text style={styles.shareText}>シェア</Text>
        </TouchableOpacity>
      </View>

      <RegionPicker regions={regions} currentRegionId={currentRegionId} onSelect={setCurrentRegion} />

      {isOffline && (
        <View style={styles.offlineBadge} testID="offline-badge">
          <Text style={styles.offlineText}>オフライン: キャッシュ表示中</Text>
        </View>
      )}

      {loading && !forecast ? (
        <View style={styles.loading} testID="loading-indicator">
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>予報を取得中...</Text>
        </View>
      ) : forecast ? (
        <>
          <ScoreCard forecast={forecast} />

          {forecast.recommendation === 'indoor' && (
            <View style={styles.indoorAlert} testID="indoor-alert">
              <Ionicons name="rainy" color={Colors.rain} size={22} />
              <Text style={styles.indoorText}>今日は部屋干し推奨</Text>
            </View>
          )}

          {forecast.rainAlert && (
            <View style={styles.rainAlert} testID="rain-alert">
              <Ionicons name="warning" color={Colors.rating.fair} size={22} />
              <Text style={styles.rainText}>{forecast.rainAlert.reason}</Text>
            </View>
          )}

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>使い方のヒント</Text>
            <Text style={styles.tipText}>右上の「シェア」を押すと、今日の干し時カードをSNSにワンタップで共有できます。</Text>
          </View>
        </>
      ) : (
        <Text style={styles.errorText}>予報を取得できませんでした</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  content: { paddingBottom: 32 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  regionHeader: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  regionLabel: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    gap: 4,
  },
  shareText: { color: '#FFFFFF', fontWeight: '700' },
  offlineBadge: {
    marginHorizontal: 16,
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
  },
  offlineText: { color: Colors.rating.fair, fontSize: 12, fontWeight: '600' },
  loading: { alignItems: 'center', paddingVertical: 64 },
  loadingText: { marginTop: 12, color: Colors.textMuted, fontSize: 14 },
  indoorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#E8F4FB',
    borderRadius: 12,
    gap: 8,
  },
  indoorText: { color: Colors.text, fontWeight: '600', fontSize: 15 },
  rainAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    gap: 8,
  },
  rainText: { color: Colors.text, fontWeight: '600', fontSize: 15 },
  tipCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tipTitle: { color: Colors.text, fontWeight: '700', marginBottom: 6 },
  tipText: { color: Colors.textMuted, fontSize: 13, lineHeight: 20 },
  errorText: { textAlign: 'center', padding: 32, color: Colors.rating.poor },
});
