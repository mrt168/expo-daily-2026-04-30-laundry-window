import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from '../context/AppContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="share"
            options={{
              presentation: 'modal',
              title: 'シェアカード',
              headerStyle: { backgroundColor: '#EBF5FB' },
            }}
          />
        </Stack>
      </AppProvider>
    </SafeAreaProvider>
  );
}
