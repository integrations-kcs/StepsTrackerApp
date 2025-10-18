import { supabase } from './supabase';

export interface User {
  employee_id: string;
  device_id: string;
  profile_name: string;
  company: string;
  device_os: string;
  device_model: string;
  status: string;
  registration_date: string;
  created_at: string;
  updated_at: string;
}

export interface RegistrationData {
  employee_id: string;
  device_id: string;
  profile_name: string;
  company: string;
  device_os: string;
  device_model: string;
}

export async function checkExistingDeviceRegistration(deviceId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('device_id', deviceId)
    .maybeSingle();

  if (error) {
    console.error('Error checking device registration:', error);
    throw new Error('Failed to check device registration');
  }

  return data;
}

export async function checkExistingEmployeeId(employeeId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('employee_id', employeeId)
    .maybeSingle();

  if (error) {
    console.error('Error checking employee ID:', error);
    throw new Error('Failed to check employee ID');
  }

  return data;
}

export async function insertNewEmployee(registrationData: RegistrationData): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .insert([registrationData])
    .select()
    .single();

  if (error) {
    console.error('Error inserting employee:', error);
    throw new Error('Failed to register employee');
  }

  return data;
}

export async function fetchEmployeeByDeviceId(deviceId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('device_id', deviceId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching employee:', error);
    throw new Error('Failed to fetch employee data');
  }

  return data;
}
