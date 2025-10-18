import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal, Platform, ActivityIndicator } from 'react-native';
import { Users, ChevronDown, AlertCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { getDeviceId } from '@/lib/auth';
import { insertNewEmployee, validateEmployeeId } from '@/lib/database';

const COMPANIES = ['Batam', 'Tuas', 'Zhoushan'];

export default function RegistrationScreen() {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState<string>('');
  const [profileName, setProfileName] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [showCompanyPicker, setShowCompanyPicker] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({
    deviceId: 'Loading...',
    os: 'Loading...',
    model: 'Loading...',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState({
    employeeId: '',
    profileName: '',
    company: '',
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

  function validateForm(): boolean {
    const errors = {
      employeeId: '',
      profileName: '',
      company: '',
    };

    if (!employeeId.trim()) {
      errors.employeeId = 'Employee ID is required';
    } else if (!validateEmployeeId(employeeId)) {
      errors.employeeId = 'Invalid format. Must start with K and be 7 characters (e.g., K123456)';
    }

    if (!profileName.trim()) {
      errors.profileName = 'Profile name is required';
    } else if (profileName.trim().length < 2) {
      errors.profileName = 'Profile name must be at least 2 characters';
    }

    if (!selectedCompany) {
      errors.company = 'Please select a company';
    }

    setValidationErrors(errors);
    return !errors.employeeId && !errors.profileName && !errors.company;
  }

  async function handleRegistration() {
    setError(null);

    if (!validateForm()) {
      return;
    }

    if (deviceInfo.deviceId === 'Loading...' || deviceInfo.deviceId === 'Unknown') {
      setError('Unable to get device information. Please try again.');
      return;
    }

    setLoading(true);

    try {
      await insertNewEmployee({
        employee_id: employeeId.toUpperCase(),
        device_id: deviceInfo.deviceId,
        profile_name: profileName.trim(),
        company: selectedCompany,
        device_os: deviceInfo.os,
        device_model: deviceInfo.model,
      });

      router.replace('/(tabs)');
    } catch (err: any) {
      console.error('Registration error:', err);

      if (err.message?.includes('duplicate key value violates unique constraint')) {
        if (err.message.includes('employee_id')) {
          setError('This Employee ID is already registered. Please contact support if this is your ID.');
        } else if (err.message.includes('device_id')) {
          setError('This device is already registered. Please contact support to reset your registration.');
        } else {
          setError('This information is already registered. Please check your details.');
        }
      } else {
        setError('Registration failed. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Users size={48} color="#ffffff" strokeWidth={2} />
        </View>
      </View>

      <Text style={styles.title}>Welcome!</Text>
      <Text style={styles.subtitle}>Register to start tracking your steps</Text>

      {error && (
        <View style={styles.errorBanner}>
          <AlertCircle size={20} color="#d32f2f" strokeWidth={2} />
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

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
            style={[styles.input, validationErrors.employeeId && styles.inputError]}
            placeholder="Enter your employee ID"
            placeholderTextColor="#999"
            maxLength={7}
            value={employeeId}
            onChangeText={(text) => {
              setEmployeeId(text.toUpperCase());
              if (validationErrors.employeeId) {
                setValidationErrors({ ...validationErrors, employeeId: '' });
              }
            }}
            autoCapitalize="characters"
            editable={!loading}
          />
          <Text style={styles.noteText}>Format: Starts with 'K' followed by 6 digits (e.g., K123456)</Text>
          {validationErrors.employeeId && (
            <Text style={styles.errorText}>{validationErrors.employeeId}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Profile Name *</Text>
          <TextInput
            style={[styles.input, validationErrors.profileName && styles.inputError]}
            placeholder="Enter your full name"
            placeholderTextColor="#999"
            value={profileName}
            onChangeText={(text) => {
              setProfileName(text);
              if (validationErrors.profileName) {
                setValidationErrors({ ...validationErrors, profileName: '' });
              }
            }}
            editable={!loading}
          />
          {validationErrors.profileName && (
            <Text style={styles.errorText}>{validationErrors.profileName}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Company *</Text>
          <TouchableOpacity
            style={[styles.pickerContainer, validationErrors.company && styles.inputError]}
            onPress={() => !loading && setShowCompanyPicker(true)}
            disabled={loading}
          >
            <Text style={[styles.pickerText, selectedCompany && styles.pickerTextSelected]}>
              {selectedCompany || 'Select your company'}
            </Text>
            <ChevronDown size={20} color="#666" strokeWidth={2} />
          </TouchableOpacity>
          {validationErrors.company && (
            <Text style={styles.errorText}>{validationErrors.company}</Text>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRegistration}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Complete Registration</Text>
        )}
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
                  if (validationErrors.company) {
                    setValidationErrors({ ...validationErrors, company: '' });
                  }
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
  errorBanner: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorBannerText: {
    fontSize: 14,
    color: '#d32f2f',
    flex: 1,
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
  errorText: {
    fontSize: 12,
    color: '#d32f2f',
    marginTop: 4,
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
  inputError: {
    borderColor: '#d32f2f',
    borderWidth: 1.5,
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
  buttonDisabled: {
    backgroundColor: '#9fb8e3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
