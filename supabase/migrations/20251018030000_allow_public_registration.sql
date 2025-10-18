/*
  # Allow Public Registration

  ## Overview
  This migration updates the RLS policies to allow public (unauthenticated) users to register
  and check for existing device/employee registrations.

  ## Security Changes
  - Allow public users to SELECT from users table to check existing registrations
  - Allow public users to INSERT into users table for registration
  - Keep UPDATE restricted to authenticated users only

  ## Important Notes
  - This allows device registration without authentication
  - Users can check if a device or employee ID is already registered
  - Once registered, users can only update their own data when authenticated
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;

-- Allow public read access to check for existing registrations
CREATE POLICY "Anyone can check existing registrations"
  ON users
  FOR SELECT
  TO public
  USING (true);

-- Allow public insert for new registrations
CREATE POLICY "Anyone can register"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (true);
