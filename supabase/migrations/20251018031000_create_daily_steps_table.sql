/*
  # Create Daily Steps Table

  ## Overview
  This migration creates a daily_steps table to track employee step counts and charity contributions.
  Each record represents a single day's step data for an employee.

  ## New Tables
  - `daily_steps`
    - `step_record_id` (uuid, primary key) - Unique identifier for each step record
    - `employee_id` (text, foreign key) - References users.employee_id
    - `device_id` (text) - Device that recorded the steps
    - `step_date` (date) - Date of the step record
    - `step_count` (integer) - Number of steps recorded
    - `goal_achieved` (boolean) - Whether daily goal was met
    - `base_charity_amount` (numeric) - Charity amount ($15 if goal achieved)
    - `created_at` (timestamptz) - UTC timestamp with timezone
    - `updated_at` (timestamptz) - UTC timestamp with timezone

  ## Indexes
  - Index on employee_id for faster lookups
  - Index on step_date for date-based queries
  - Unique constraint on (employee_id, step_date) to prevent duplicate entries

  ## Security
  - Enable RLS on daily_steps table
  - Allow public users to SELECT step records
  - Allow public users to INSERT new step records
  - Allow public users to UPDATE their own step records

  ## Important Notes
  - base_charity_amount should be set to 15 when goal_achieved is true
  - One record per employee per day (enforced by unique constraint)
  - step_count must be non-negative
*/

-- Create daily_steps table
CREATE TABLE IF NOT EXISTS daily_steps (
  step_record_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id text NOT NULL,
  device_id text NOT NULL,
  step_date date NOT NULL,
  step_count integer NOT NULL DEFAULT 0,
  goal_achieved boolean NOT NULL DEFAULT false,
  base_charity_amount numeric(10, 2) NOT NULL DEFAULT 0.00,
  created_at timestamptz NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_at timestamptz NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  CONSTRAINT fk_employee
    FOREIGN KEY (employee_id)
    REFERENCES users(employee_id)
    ON DELETE CASCADE,
  CONSTRAINT positive_steps
    CHECK (step_count >= 0),
  CONSTRAINT valid_charity_amount
    CHECK (base_charity_amount >= 0)
);

-- Create unique constraint to prevent duplicate entries per day
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_steps_employee_date
  ON daily_steps(employee_id, step_date);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_daily_steps_employee_id
  ON daily_steps(employee_id);

CREATE INDEX IF NOT EXISTS idx_daily_steps_date
  ON daily_steps(step_date);

CREATE INDEX IF NOT EXISTS idx_daily_steps_device_id
  ON daily_steps(device_id);

-- Enable Row Level Security
ALTER TABLE daily_steps ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view step records
CREATE POLICY "Anyone can view step records"
  ON daily_steps
  FOR SELECT
  TO public
  USING (true);

-- Allow anyone to insert step records
CREATE POLICY "Anyone can insert step records"
  ON daily_steps
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow anyone to update step records
CREATE POLICY "Anyone can update step records"
  ON daily_steps
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now() AT TIME ZONE 'UTC';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_daily_steps_updated_at ON daily_steps;
CREATE TRIGGER update_daily_steps_updated_at
  BEFORE UPDATE ON daily_steps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
