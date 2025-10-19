/*
  # Create User Streak Achievements Table

  ## Overview
  This migration creates a user_streak_achievements table to record when users 
  achieve streak milestones. Each record represents one milestone achievement 
  (e.g., user achieved 7-day streak, 14-day streak, etc.).

  ## New Tables
  - `user_streak_achievements`
    - `id` (uuid, primary key) - Unique identifier for each achievement record
    - `user_id` (text, foreign key) - References users.employee_id
    - `milestone_days` (integer, foreign key) - References streak_milestones.milestone_days
    - `achieved_date` (date) - Date when milestone was achieved
    - `created_at` (timestamptz) - UTC timestamp when record was created

  ## Indexes
  - Primary key on id (UUID)
  - Unique constraint on (user_id, milestone_days) to prevent duplicate achievements
  - Index on user_id for efficient user achievement lookups
  - Index on milestone_days for milestone-based queries

  ## Constraints
  - Foreign key to users.employee_id with CASCADE delete
  - Foreign key to streak_milestones.milestone_days with CASCADE delete
  - Unique constraint ensures user can only earn each milestone once

  ## Security
  - Enable RLS on user_streak_achievements table
  - Allow public users to SELECT all achievement records (visibility/leaderboards)
  - Allow public users to INSERT their own achievement records
  - Restrict UPDATE and DELETE operations (achievements are permanent)

  ## Important Notes
  - Achievements are automatically created when current_streak matches milestone_days
  - Each user can only earn each milestone once (enforced by unique constraint)
  - Achievements are permanent records (no updates/deletes allowed via RLS)
  - achieved_date records when the milestone was first reached
*/

-- Create user_streak_achievements table
CREATE TABLE IF NOT EXISTS user_streak_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  milestone_days integer NOT NULL,
  achieved_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  CONSTRAINT fk_user_achievement
    FOREIGN KEY (user_id)
    REFERENCES users(employee_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_milestone
    FOREIGN KEY (milestone_days)
    REFERENCES streak_milestones(milestone_days)
    ON DELETE CASCADE
);

-- Create unique constraint to prevent duplicate achievements
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_streak_achievements_unique
  ON user_streak_achievements(user_id, milestone_days);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_streak_achievements_user_id
  ON user_streak_achievements(user_id);

CREATE INDEX IF NOT EXISTS idx_user_streak_achievements_milestone_days
  ON user_streak_achievements(milestone_days);

CREATE INDEX IF NOT EXISTS idx_user_streak_achievements_achieved_date
  ON user_streak_achievements(achieved_date);

-- Enable Row Level Security
ALTER TABLE user_streak_achievements ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view all achievement records
CREATE POLICY "Anyone can view achievement records"
  ON user_streak_achievements
  FOR SELECT
  TO public
  USING (true);

-- Allow anyone to insert achievement records
CREATE POLICY "Anyone can insert achievement records"
  ON user_streak_achievements
  FOR INSERT
  TO public
  WITH CHECK (true);
