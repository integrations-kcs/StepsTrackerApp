import * as Application from 'expo-application';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const DEVICE_ID_KEY = '@device_id';

export async function getDeviceId(): Promise<string> {
  try {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);

    if (!deviceId) {
      if (Platform.OS === 'android') {
        deviceId = Application.getAndroidId() || `android-${Date.now()}`;
      } else if (Platform.OS === 'ios') {
        deviceId = await Application.getIosIdForVendorAsync() || `ios-${Date.now()}`;
      } else {
        deviceId = `web-${Date.now()}`;
      }

      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }

    return deviceId;
  } catch (error) {
    console.error('Error getting device ID:', error);
    return `fallback-${Date.now()}`;
  }
}

export async function checkUserRegistration(deviceId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('device_id')
      .eq('device_id', deviceId)
      .maybeSingle();

    if (error) {
      console.error('Error checking user registration:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking user registration:', error);
    return false;
  }
}

export async function getEmployeeIdFromDevice(): Promise<string | null> {
  try {
    const deviceId = await getDeviceId();

    const { data, error } = await supabase
      .from('users')
      .select('employee_id')
      .eq('device_id', deviceId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching employee ID:', error);
      return null;
    }

    return data?.employee_id || null;
  } catch (error) {
    console.error('Error getting employee ID from device:', error);
    return null;
  }
}
