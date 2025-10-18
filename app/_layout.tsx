import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { getDeviceId, checkUserRegistration } from '@/lib/auth';

export default function RootLayout() {
  useFrameworkReady();
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const inTabs = segments[0] === '(tabs)';
      const inRegistration = segments[0] === 'registration';

      if (isRegistered && !inTabs) {
        router.replace('/(tabs)');
      } else if (!isRegistered && !inRegistration) {
        router.replace('/registration');
      }
    }
  }, [isLoading, isRegistered]);

  useEffect(() => {
    if (!isLoading && segments[0] === '(tabs)') {
      checkAuth();
    }
  }, [segments]);

  async function checkAuth() {
    try {
      const deviceId = await getDeviceId();
      const registered = await checkUserRegistration(deviceId);
      setIsRegistered(registered);
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="registration" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
