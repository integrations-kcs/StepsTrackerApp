/*
  # Create Streak Milestones Table

  ## Overview
  This migration creates a streak_milestones table to define streak milestone levels
  and bonus amounts. Each record represents a milestone that users can achieve by
  maintaining consecutive days of reaching their step goals.

  ## New Tables
  - `streak_milestones`
    - `milestone_id` (integer, primary key) - Unique identifier for each milestone (uses SERIAL for auto-increment)
    - `milestone_days` (integer, unique) - Number of consecutive days required for this milestone
    - `bonus_amount` (numeric) - Bonus charity amount awarded when milestone is achieved
    - `description` (varchar) - Description of the milestone achievement
    - `created_at` (timestamptz) - UTC timestamp with timezone

  ## Indexes
  - Unique constraint on milestone_days to prevent duplicate milestone definitions
  - Index on milestone_days for efficient milestone lookups

  ## Security
  - Enable RLS on streak_milestones table
  - Allow public users to SELECT milestone definitions (read-only access)
  - Restrict INSERT, UPDATE, DELETE operations (milestones should be managed by admins)

  ## Important Notes
  - milestone_days must be positive
  - bonus_amount must be non-negative
  - Common milestone values: 7, 14, 30, 60, 90, 180, 365 days
  - This table is essentially read-only for application users
*/

-- Create streak_milestones table
CREATE TABLE IF NOT EXISTS streak_milestones (
  milestone_id SERIAL PRIMARY KEY,
  milestone_days integer UNIQUE NOT NULL,
  bonus_amount numeric(10, 2) NOT NULL DEFAULT 0.00,
  description varchar(100),
  created_at timestamptz NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  CONSTRAINT positive_milestone_days
    CHECK (milestone_days > 0),
  CONSTRAINT valid_bonus_amount
    CHECK (bonus_amount >= 0)
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_streak_milestones_days
  ON streak_milestones(milestone_days);

-- Enable Row Level Security
ALTER TABLE streak_milestones ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view milestone definitions
CREATE POLICY "Anyone can view streak milestones"
  ON streak_milestones
  FOR SELECT
  TO public
  USING (true);

-- Insert default milestone data
INSERT INTO streak_milestones (milestone_days, bonus_amount, description) VALUES
  (3, 10.00, '3 Day Streak'),
  (7, 30.00, '7 Day Streak'),
  (10, 40.00, '10 Day Streak'),
  (14, 60.00, '14 Day Streak'),
  (17, 70.00, '17 Day Streak'),
  (21, 100.00, '21 Day Streak'),
  (24, 110.00, '24 Day Streak'),
  (28, 130.00, '28 Day Streak'),
  (31, 150.00, '31 Day Streak');  
ON CONFLICT (milestone_days) DO NOTHING;
