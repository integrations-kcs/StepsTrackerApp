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