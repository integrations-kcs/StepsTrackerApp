import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getDeviceId } from '@/lib/auth';
import { fetchEmployeeByDeviceId, User } from '@/lib/database';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const deviceId = await getDeviceId();
      const userData = await fetchEmployeeByDeviceId(deviceId);
      setUser(userData);
    } catch (err) {
      console.error('Error loading user profile:', err);
      setError('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUserProfile();
    }, [])
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  if (error || !user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'No user data found'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 40 }]}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Employee Profile</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Profile Name</Text>
            <Text style={styles.value}>{user.profile_name}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>Employee ID</Text>
            <Text style={styles.value}>{user.employee_id}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>Company</Text>
            <Text style={styles.value}>{user.company}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statusRow}>
            <View>
              <Text style={styles.label}>Status</Text>
              <Text style={user.status === 'Active' ? styles.statusActive : styles.statusInactive}>
                {user.status}
              </Text>
            </View>
            <View style={styles.registeredInfo}>
              <Text style={styles.label}>Registered</Text>
              <Text style={styles.value}>{formatDate(user.registration_date)}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device Information</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Device ID</Text>
            <Text style={styles.value}>{user.device_id}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>Device OS</Text>
            <Text style={styles.value}>{user.device_os || 'Unknown'}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>Device Model</Text>
            <Text style={styles.value}>{user.device_model || 'Unknown'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Privacy Policy</Text>
          <ChevronRight size={20} color="#999" strokeWidth={2} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Terms & Conditions</Text>
          <ChevronRight size={20} color="#999" strokeWidth={2} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>User Guide</Text>
          <ChevronRight size={20} color="#999" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={styles.versionSection}>
        <Text style={styles.versionLabel}>App Version</Text>
        <Text style={styles.versionText}>v1.0001 (Build 2025.0001)</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 15,
    color: '#dc2626',
    textAlign: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  infoRow: {
    paddingVertical: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  registeredInfo: {
    alignItems: 'flex-end',
  },
  label: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  value: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  statusActive: {
    fontSize: 15,
    fontWeight: '600',
    color: '#10B981',
  },
  statusInactive: {
    fontSize: 15,
    fontWeight: '600',
    color: '#dc2626',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  menuSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  versionSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  versionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
});
