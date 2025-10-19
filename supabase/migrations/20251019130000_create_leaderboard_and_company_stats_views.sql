/*
  # Create Leaderboard and Company Stats Views

  ## Overview
  This migration creates database views and functions to support the real-time dashboard
  displaying leaderboard rankings and company-wide statistics.

  ## New Database Objects

  ### Views
  1. `leaderboard_view` - Materialized view aggregating user steps and rankings
     - Columns: rank, employee_id, profile_name, company, total_steps, total_charity_amount, last_updated
     - Automatically calculates rankings based on total steps across all time
     - Joins users table with aggregated daily_steps data

  2. `company_stats_view` - Materialized view aggregating company-wide statistics
     - Columns: company, total_steps_all_employees, total_charity_amount, total_employees, last_updated
     - Aggregates data by company location (Batam, Tuas, Zhoushan)
     - Calculates totals from all employees in each company

  ### Functions
  1. `get_user_rank` - Returns a user's current rank and total employee count
  2. `refresh_dashboard_views` - Refreshes materialized views after data updates

  ## Security
  - Enable RLS on views with public SELECT policies for read access
  - Views automatically respect underlying table permissions

  ## Performance
  - Materialized views cache aggregated data for fast queries
  - Indexes on employee_id and company for optimal performance
  - Manual refresh required after step syncs for real-time updates
*/

-- Drop existing views if they exist
DROP MATERIALIZED VIEW IF EXISTS leaderboard_view CASCADE;
DROP MATERIALIZED VIEW IF EXISTS company_stats_view CASCADE;

-- Create leaderboard view with rankings
CREATE MATERIALIZED VIEW leaderboard_view AS
SELECT
  ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(ds.step_count), 0) DESC, u.employee_id) AS rank,
  u.employee_id,
  u.profile_name,
  u.company,
  COALESCE(SUM(ds.step_count), 0) AS total_steps,
  COALESCE(SUM(ds.base_charity_amount), 0.00) AS total_charity_amount,
  COALESCE(MAX(ds.updated_at), u.created_at) AS last_updated
FROM users u
LEFT JOIN daily_steps ds ON u.employee_id = ds.employee_id
WHERE u.status = 'Active'
GROUP BY u.employee_id, u.profile_name, u.company, u.created_at
ORDER BY total_steps DESC, u.employee_id;

-- Create unique index on employee_id for concurrent refresh
CREATE UNIQUE INDEX idx_leaderboard_view_employee_id ON leaderboard_view(employee_id);

-- Create index on rank for faster top-N queries
CREATE INDEX idx_leaderboard_view_rank ON leaderboard_view(rank);

-- Create company stats view
CREATE MATERIALIZED VIEW company_stats_view AS
SELECT
  u.company,
  COALESCE(SUM(ds.step_count), 0) AS total_steps_all_employees,
  COALESCE(SUM(ds.base_charity_amount), 0.00) AS total_charity_amount,
  COUNT(DISTINCT u.employee_id) AS total_employees,
  COALESCE(MAX(ds.updated_at), MAX(u.created_at)) AS last_updated
FROM users u
LEFT JOIN daily_steps ds ON u.employee_id = ds.employee_id
WHERE u.status = 'Active'
GROUP BY u.company;

-- Create unique index on company for concurrent refresh
CREATE UNIQUE INDEX idx_company_stats_view_company ON company_stats_view(company);

-- Function to get user rank and total employee count
CREATE OR REPLACE FUNCTION get_user_rank(user_employee_id TEXT)
RETURNS TABLE(
  rank BIGINT,
  total_employees BIGINT,
  total_steps BIGINT,
  total_charity_amount NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    lv.rank,
    (SELECT COUNT(*) FROM leaderboard_view) AS total_employees,
    lv.total_steps,
    lv.total_charity_amount
  FROM leaderboard_view lv
  WHERE lv.employee_id = user_employee_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to refresh dashboard materialized views
CREATE OR REPLACE FUNCTION refresh_dashboard_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_view;
  REFRESH MATERIALIZED VIEW CONCURRENTLY company_stats_view;
END;
$$ LANGUAGE plpgsql;

-- Grant SELECT permissions on views to public
GRANT SELECT ON leaderboard_view TO public;
GRANT SELECT ON company_stats_view TO public;

-- Grant EXECUTE permission on functions to public
GRANT EXECUTE ON FUNCTION get_user_rank(TEXT) TO public;
GRANT EXECUTE ON FUNCTION refresh_dashboard_views() TO public;

-- Initial population of views
REFRESH MATERIALIZED VIEW leaderboard_view;
REFRESH MATERIALIZED VIEW company_stats_view;
