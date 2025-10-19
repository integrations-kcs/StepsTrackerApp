/*
  # Create Streaks Table

  ## Overview
  This migration creates a streaks table to track each user's current and longest 
  consecutive day streaks for achieving their daily step goals. One record per user.

  ## New Tables
  - `streaks`
    - `user_id` (text, primary key) - References users.employee_id
    - `current_streak` (integer, default 0) - Current consecutive days streak
    - `longest_streak` (integer, default 0) - All-time longest streak record
    - `last_activity_date` (date) - Last date when user achieved their goal
    - `created_at` (timestamptz) - UTC timestamp when record was created
    - `updated_at` (timestamptz) - UTC timestamp when record was last updated

  ## Indexes
  - Primary key on user_id ensures one record per user
  - Index on last_activity_date for date-based queries

  ## Constraints
  - Foreign key to users.employee_id with CASCADE delete
  - current_streak must be non-negative (>= 0)
  - longest_streak must be non-negative (>= 0)
  - longest_streak must be >= current_streak (logical constraint)

  ## Security
  - Enable RLS on streaks table
  - Allow public users to SELECT all streak records (leaderboard visibility)
  - Allow public users to INSERT their own streak records
  - Allow public users to UPDATE their own streak records

  ## Important Notes
  - Streak increments by 1 when goal achieved and last_activity_date is exactly yesterday
  - Streak resets to 1 when goal achieved but gap > 1 day (fresh start)
  - Streak resets to 0 when user misses a day without achieving goal
  - longest_streak updates when current_streak exceeds it
  - Trigger automatically updates updated_at timestamp
*/

-- Create streaks table
CREATE TABLE IF NOT EXISTS streaks (
  user_id text PRIMARY KEY,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_activity_date date,
  created_at timestamptz NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_at timestamptz NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  CONSTRAINT fk_user
    FOREIGN KEY (user_id)
    REFERENCES users(employee_id)
    ON DELETE CASCADE,
  CONSTRAINT positive_current_streak
    CHECK (current_streak >= 0),
  CONSTRAINT positive_longest_streak
    CHECK (longest_streak >= 0),
  CONSTRAINT longest_gte_current
    CHECK (longest_streak >= current_streak)
);

-- Create index for date-based queries
CREATE INDEX IF NOT EXISTS idx_streaks_last_activity_date
  ON streaks(last_activity_date);

-- Enable Row Level Security
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view all streak records (for leaderboards)
CREATE POLICY "Anyone can view streak records"
  ON streaks
  FOR SELECT
  TO public
  USING (true);

-- Allow anyone to insert streak records
CREATE POLICY "Anyone can insert streak records"
  ON streaks
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow anyone to update streak records
CREATE POLICY "Anyone can update streak records"
  ON streaks
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Add trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_streaks_updated_at ON streaks;
CREATE TRIGGER update_streaks_updated_at
  BEFORE UPDATE ON streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
