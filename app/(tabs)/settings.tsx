import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Switch, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useApp } from '../../context/AppContext';

export default function SettingsScreen() {
  const { settings, regions, currentRegionId, updateSettings, addRegion, removeRegion, setCurrentRegion } = useApp();
  const [newRegionName, setNewRegionName] = useState('');
  const [newRegionLat, setNewRegionLat] = useState('');
  const [newRegionLng, setNewRegionLng] = useState('');

  const handleAddRegion = async () => {
    if (!newRegionName.trim()) return;
    const lat = parseFloat(newRegionLat) || 35.6895;
    const lng = parseFloat(newRegionLng) || 139.6917;
    await addRegion({ name: newRegionName.trim(), latitude: lat, longitude: lng, isDefault: false });
    setNewRegionName('');
    setNewRegionLat('');
    setNewRegionLng('');
  };

  const handleRemoveRegion = (id: string, name: string) => {
    Alert.alert('削除確認', `${name}を削除しますか？`, [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: () => removeRegion(id) },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} testID="settings-screen">
      <Text style={styles.section}>通知設定</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>雨通知</Text>
          <Switch
            value={settings.notifyRain}
            onValueChange={v => updateSettings({ notifyRain: v })}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor="#FFFFFF"
            testID="notify-rain-switch"
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.rowLabel}>取り込み通知</Text>
          <Switch
            value={settings.notifyTakeIn}
            onValueChange={v => updateSettings({ notifyTakeIn: v })}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor="#FFFFFF"
            testID="notify-takein-switch"
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.rowLabel}>通知時刻</Text>
          <Text style={styles.rowValue}>{settings.notifyTime}</Text>
        </View>
      </View>

      <Text style={styles.section}>地域設定</Text>
      <View style={styles.card}>
        {regions.map((r, idx) => (
          <View key={r.id}>
            <TouchableOpacity
              style={styles.row}
              onPress={() => setCurrentRegion(r.id)}
              onLongPress={() => handleRemoveRegion(r.id, r.name)}
              testID={`settings-region-${r.id}`}
            >
              <View style={styles.regionLeft}>
                <Ionicons
                  name={currentRegionId === r.id ? 'radio-button-on' : 'radio-button-off'}
                  color={Colors.primary}
                  size={22}
                />
                <Text style={styles.rowLabel}>{r.name}</Text>
                {r.isDefault && <Text style={styles.badge}>デフォルト</Text>}
              </View>
              <Text style={styles.coords}>{r.latitude.toFixed(2)}, {r.longitude.toFixed(2)}</Text>
            </TouchableOpacity>
            {idx < regions.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </View>

      <Text style={styles.section}>新しい地域を追加</Text>
      <View style={styles.card}>
        <TextInput
          placeholder="地域名（例: 札幌）"
          value={newRegionName}
          onChangeText={setNewRegionName}
          style={styles.input}
          testID="new-region-name"
          placeholderTextColor={Colors.textMuted}
        />
        <View style={styles.coordsRow}>
          <TextInput
            placeholder="緯度（例: 43.06）"
            value={newRegionLat}
            onChangeText={setNewRegionLat}
            style={[styles.input, styles.coordInput]}
            placeholderTextColor={Colors.textMuted}
            keyboardType="decimal-pad"
          />
          <TextInput
            placeholder="経度（例: 141.35）"
            value={newRegionLng}
            onChangeText={setNewRegionLng}
            style={[styles.input, styles.coordInput]}
            placeholderTextColor={Colors.textMuted}
            keyboardType="decimal-pad"
          />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleAddRegion} testID="add-region-button">
          <Ionicons name="add-circle" color="#FFFFFF" size={20} />
          <Text style={styles.addBtnText}>追加する</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.section}>このアプリについて</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>バージョン</Text>
          <Text style={styles.rowValue}>1.0.0</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.rowLabel}>データソース</Text>
          <Text style={styles.rowValue}>Open-Meteo API</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  content: { padding: 16, paddingBottom: 32 },
  section: { color: Colors.textMuted, fontSize: 13, fontWeight: '700', marginTop: 16, marginBottom: 8, textTransform: 'uppercase' },
  card: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  regionLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  badge: {
    fontSize: 10,
    color: '#FFFFFF',
    backgroundColor: Colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: 'hidden',
  },
  coords: { color: Colors.textMuted, fontSize: 11 },
  rowLabel: { fontSize: 15, color: Colors.text, fontWeight: '600' },
  rowValue: { fontSize: 14, color: Colors.textMuted },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 16 },
  input: {
    margin: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    color: Colors.text,
  },
  coordsRow: { flexDirection: 'row' },
  coordInput: { flex: 1 },
  addBtn: {
    flexDirection: 'row',
    margin: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addBtnText: { color: '#FFFFFF', fontWeight: '700' },
});
