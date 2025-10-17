/*
  # Update registration_date to timestamptz

  1. Changes
    - Alter `users.registration_date` from date to timestamptz (UTC timestamp with timezone)
    - Maintains default value as now()
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'registration_date'
  ) THEN
    ALTER TABLE users ALTER COLUMN registration_date TYPE timestamptz USING registration_date::timestamptz;
    ALTER TABLE users ALTER COLUMN registration_date SET DEFAULT now();
  END IF;
END $$;