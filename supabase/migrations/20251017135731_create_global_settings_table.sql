/*
  # Create Global Settings Table

  1. New Tables
    - `global_settings`
      - `setting_id` (serial, primary key) - Auto-incrementing unique identifier
      - `daily_step_goal` (integer, default 10000) - Daily step goal for users
      - `charity_amount_per_goal` (decimal(10,2), default 15.00) - Charity amount per goal achieved
      - `updated_at` (timestamptz, default now) - UTC timestamp when settings were last updated

  2. Security
    - Enable RLS on `global_settings` table
    - Add policy for authenticated users to read settings
    - Add policy for authenticated users to update settings
*/

CREATE TABLE IF NOT EXISTS global_settings (
  setting_id SERIAL PRIMARY KEY,
  daily_step_goal INTEGER DEFAULT 10000,
  charity_amount_per_goal DECIMAL(10,2) DEFAULT 15.00,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE global_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read global settings"
  ON global_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update global settings"
  ON global_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);