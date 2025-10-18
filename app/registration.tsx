import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal, Platform } from 'react-native';
import { Users, ChevronDown } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { getDeviceId } from '@/lib/auth';

const COMPANIES = ['Batam', 'Tuas', 'Zhoushan'];

export default function RegistrationScreen() {
  const router = useRouter();
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [showCompanyPicker, setShowCompanyPicker] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({
    deviceId: 'Loading...',
    os: 'Loading...',
    model: 'Loading...',
  });

  useEffect(() => {
    loadDeviceInfo();
  }, []);

  async function loadDeviceInfo() {
    try {
      const serialNumber = await getDeviceSerialNumber();
      const osVersion = getDeviceOS();
      const deviceModel = getDeviceModelName();

      setDeviceInfo({
        deviceId: serialNumber,
        os: osVersion,
        model: deviceModel,
      });
    } catch (error) {
      console.error('Error loading device info:', error);
    }
  }

  async function getDeviceSerialNumber(): Promise<string> {
    try {
      if (Platform.OS === 'ios') {
        const iosId = await Application.getIosIdForVendorAsync();
        return iosId || 'iOS-Unknown';
      } else if (Platform.OS === 'android') {
        const androidId = Application.getAndroidId();
        return androidId || 'Android-Unknown';
      } else {
        const deviceId = await getDeviceId();
        return deviceId;
      }
    } catch (error) {
      return 'Unknown';
    }
  }

  function getDeviceOS(): string {
    try {
      if (Platform.OS === 'ios') {
        return `iOS ${Device.osVersion || Constants.systemVersion || 'Unknown'}`;
      } else if (Platform.OS === 'android') {
        return `Android ${Device.osVersion || Platform.Version || 'Unknown'}`;
      } else {
        return `Web ${navigator.userAgent.split(' ').pop() || 'Browser'}`;
      }
    } catch (error) {
      return 'Unknown OS';
    }
  }

  function getDeviceModelName(): string {
    try {
      if (Platform.OS === 'ios') {
        return Device.modelName || Device.deviceName || 'iOS Device';
      } else if (Platform.OS === 'android') {
        const brand = Device.brand || '';
        const modelName = Device.modelName || Device.deviceName || 'Android Device';
        return brand ? `${brand} ${modelName}` : modelName;
      } else {
        return 'Web Browser';
      }
    } catch (error) {
      return 'Unknown Device';
    }
  }

  const handleRegistration = () => {
    router.replace('/(tabs)');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Users size={48} color="#ffffff" strokeWidth={2} />
        </View>
      </View>

      <Text style={styles.title}>Welcome!</Text>
      <Text style={styles.subtitle}>Register to start tracking your steps</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device Information</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Device ID</Text>
          <Text style={styles.value}>{deviceInfo.deviceId}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Device OS</Text>
          <Text style={styles.value}>{deviceInfo.os}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Device Model</Text>
          <Text style={styles.value}>{deviceInfo.model}</Text>
        </View>
      </View>

      <View style={styles.formSection}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Employee ID *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your employee ID"
            placeholderTextColor="#999"
            maxLength={7}
          />
          <Text style={styles.noteText}>Format: Starts with 'K' followed by 6 digits (e.g., K123456)</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Profile Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Company *</Text>
          <TouchableOpacity
            style={styles.pickerContainer}
            onPress={() => setShowCompanyPicker(true)}
          >
            <Text style={[styles.pickerText, selectedCompany && styles.pickerTextSelected]}>
              {selectedCompany || 'Select your company'}
            </Text>
            <ChevronDown size={20} color="#666" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegistration}>
        <Text style={styles.buttonText}>Complete Registration</Text>
      </TouchableOpacity>

      <Modal
        visible={showCompanyPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCompanyPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCompanyPicker(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Company</Text>
            </View>
            {COMPANIES.map((company) => (
              <TouchableOpacity
                key={company}
                style={[
                  styles.companyOption,
                  selectedCompany === company && styles.companyOptionSelected
                ]}
                onPress={() => {
                  setSelectedCompany(company);
                  setShowCompanyPicker(false);
                }}
              >
                <Text style={[
                  styles.companyOptionText,
                  selectedCompany === company && styles.companyOptionTextSelected
                ]}>
                  {company}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 24,
    paddingTop: 60,
  },
  iconContainer: {
    alignItems: 'center',
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
    textAlign: 'center',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  infoRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  formSection: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    fontSize: 15,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 15,
    color: '#999',
  },
  pickerTextSelected: {
    color: '#1a1a1a',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  companyOption: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  companyOptionSelected: {
    backgroundColor: '#E8F0FE',
  },
  companyOptionText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  companyOptionTextSelected: {
    fontWeight: '600',
    color: '#4285F4',
  },
  button: {
    backgroundColor: '#4285F4',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 40,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
