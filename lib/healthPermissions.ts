import { Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';

export interface PermissionResult {
  granted: boolean;
  error?: string;
}

export async function requestStepPermissions(): Promise<PermissionResult> {
  try {
    const isAvailable = await Pedometer.isAvailableAsync();

    if (!isAvailable) {
      return {
        granted: false,
        error: Platform.OS === 'ios'
          ? 'Motion & Fitness tracking not available. Please enable it in Settings > Privacy > Motion & Fitness.'
          : 'Physical Activity tracking not available on this device.'
      };
    }

    const permission = await Pedometer.requestPermissionsAsync();

    if (permission.status === 'granted') {
      return { granted: true };
    } else {
      return {
        granted: false,
        error: Platform.OS === 'ios'
          ? 'Please enable Motion & Fitness access in Settings > Privacy > Motion & Fitness.'
          : 'Please enable Physical Activity permission in Settings.'
      };
    }
  } catch (error) {
    return {
      granted: false,
      error: `Permission error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

export async function checkStepPermissions(): Promise<PermissionResult> {
  try {
    const isAvailable = await Pedometer.isAvailableAsync();

    if (!isAvailable) {
      return { granted: false, error: 'Step tracking not available' };
    }

    const permission = await Pedometer.getPermissionsAsync();

    if (permission.status === 'granted') {
      return { granted: true };
    } else {
      return { granted: false, error: 'Permission not granted' };
    }
  } catch (error) {
    return {
      granted: false,
      error: `Check permission error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
