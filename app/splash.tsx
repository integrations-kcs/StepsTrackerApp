import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Footprints } from 'lucide-react-native';
import { getDeviceId } from '@/lib/auth';
import { checkDeviceRegistration } from '@/lib/database';

export default function SplashScreen() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkRegistration();
  }, []);

  async function checkRegistration() {
    try {
      const deviceId = await getDeviceId();
      const user = await checkDeviceRegistration(deviceId);

      if (user && user.status === 'Active') {
        router.replace('/(tabs)');
      } else {
        router.replace('/registration');
      }
    } catch (err) {
      console.error('Registration check error:', err);
      setError('Unable to verify registration. Please check your connection.');
    }
  }

  const handleRetry = () => {
    setError(null);
    checkRegistration();
  };

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Footprints size={48} color="#ffffff" strokeWidth={2} />
          </View>
        </View>
        <Text style={styles.title}>Step Tracker</Text>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.retryButton} onPress={handleRetry}>
            Tap to Retry
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Footprints size={48} color="#ffffff" strokeWidth={2} />
        </View>
      </View>
      <Text style={styles.title}>Step Tracker</Text>
      <Text style={styles.subtitle}>Checking registration...</Text>
      <ActivityIndicator size="large" color="#4285F4" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  loader: {
    marginTop: 16,
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    fontSize: 16,
    color: '#4285F4',
    fontWeight: '600',
  },
});
