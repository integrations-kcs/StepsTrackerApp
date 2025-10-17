import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

export default function SettingsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Employee Profile</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Profile Name</Text>
            <Text style={styles.value}>Alex Thompson</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>Employee ID</Text>
            <Text style={styles.value}>EMP-2024-0847</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>Company</Text>
            <Text style={styles.value}>TechCorp Industries</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statusRow}>
            <View>
              <Text style={styles.label}>Status</Text>
              <Text style={styles.statusActive}>Active</Text>
            </View>
            <View style={styles.registeredInfo}>
              <Text style={styles.label}>Registered</Text>
              <Text style={styles.value}>Jan 15, 2024</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device Information</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Device ID</Text>
            <Text style={styles.value}>iOS-9A8B7C6D5E4F</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>Device OS</Text>
            <Text style={styles.value}>iOS 17.2</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>Device Model</Text>
            <Text style={styles.value}>iPhone 14 Pro</Text>
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
        <Text style={styles.versionText}>v1.2.4 (Build 2024.101)</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
