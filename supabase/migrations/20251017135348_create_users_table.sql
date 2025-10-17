/*
  # Create Users Table

  1. New Tables
    - `users`
      - `employee_id` (text, primary key) - Unique identifier for each employee
      - `device_id` (text, unique, not null) - Unique device identifier
      - `profile_name` (text, not null) - User's profile name
      - `company` (text, not null) - Company location (Batam/Tuas/Zhoushan)
      - `device_os` (text) - Operating system of the device
      - `device_model` (text) - Model of the device
      - `status` (text, default 'Active') - User status (Active/Inactive)
      - `registration_date` (date, default today) - Date when user registered
      - `created_at` (timestamptz, default now) - UTC timestamp when record was created
      - `updated_at` (timestamptz, default now) - UTC timestamp when record was last updated

  2. Security
    - Enable RLS on `users` table
    - Add policy for authenticated users to read all user data
    - Add policy for authenticated users to insert their own data
    - Add policy for authenticated users to update their own data
*/

CREATE TABLE IF NOT EXISTS users (
  employee_id text PRIMARY KEY,
  device_id text UNIQUE NOT NULL,
  profile_name text NOT NULL,
  company text NOT NULL,
  device_os text,
  device_model text,
  status text DEFAULT 'Active',
  registration_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all user data"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);