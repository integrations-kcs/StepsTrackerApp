import { supabase } from './supabase';

export interface User {
  employee_id: string;
  device_id: string;
  profile_name: string;
  company: string;
  device_os?: string;
  device_model?: string;
  status: string;
  registration_date: string;
  created_at: string;
  updated_at: string;
}

export interface NewUserData {
  employee_id: string;
  device_id: string;
  profile_name: string;
  company: string;
  device_os?: string;
  device_model?: string;
}

export async function checkDeviceRegistration(deviceId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('device_id', deviceId)
      .maybeSingle();

    if (error) {
      console.error('Error checking device registration:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to check device registration:', error);
    throw error;
  }
}

export async function fetchEmployeeByDeviceId(deviceId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('device_id', deviceId)
      .eq('status', 'Active')
      .maybeSingle();

    if (error) {
      console.error('Error fetching employee:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch employee:', error);
    throw error;
  }
}

export async function insertNewEmployee(userData: NewUserData): Promise<User> {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) {
      console.error('Error inserting new employee:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to insert new employee:', error);
    throw error;
  }
}

export function validateEmployeeId(employeeId: string): boolean {
  if (!employeeId || employeeId.length !== 7) {
    return false;
  }

  if (!employeeId.startsWith('K')) {
    return false;
  }

  const digits = employeeId.slice(1);
  return /^\d{6}$/.test(digits);
}
