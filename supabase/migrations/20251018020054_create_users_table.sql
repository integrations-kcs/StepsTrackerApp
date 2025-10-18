/*
  # Create USERS Table

  ## Overview
  This migration creates a table to store user details with device tracking and company assignment.

  ## New Tables
  
  ### `users`
  - `employee_id` (text, primary key) - Unique employee identifier
  - `device_id` (text, unique, not null) - Unique device identifier
  - `profile_name` (text, not null) - User's profile name
  - `company` (text, not null) - Company location (Batam/Tuas/Zhoushan)
  - `device_os` (text) - Operating system of the device
  - `device_model` (text) - Model of the device
  - `status` (text, default 'Active') - User status (Active/Inactive)
  - `registration_date` (timestamptz, default now()) - UTC timestamp of registration
  - `created_at` (timestamptz, default now()) - UTC timestamp of record creation
  - `updated_at` (timestamptz, default now()) - UTC timestamp of last update

  ## Security
  - Enable Row Level Security (RLS) on users table
  - Add policies for authenticated users to read their own data
  - Add policies for authenticated users to update their own data

  ## Notes
  - All timestamp fields use `timestamptz` to store UTC timestamps with timezone information
  - Status defaults to 'Active' for new users
  - Device ID must be unique across all users
  - Company field is restricted to valid values via a check constraint
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  employee_id text PRIMARY KEY,
  device_id text UNIQUE NOT NULL,
  profile_name text NOT NULL,
  company text NOT NULL CHECK (company IN ('Batam', 'Tuas', 'Zhoushan')),
  device_os text,
  device_model text,
  status text DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  registration_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users to read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = employee_id);

-- Create policies for authenticated users to update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = employee_id)
  WITH CHECK (auth.uid()::text = employee_id);

-- Create policies for authenticated users to insert their own data
CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = employee_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
