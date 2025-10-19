import { supabase } from './supabase';

export interface LeaderboardEntry {
  rank: number;
  employee_id: string;
  profile_name: string;
  company: string;
  total_steps: number;
  total_charity_amount: number;
  last_updated: string;
}

export interface CompanyStats {
  company: string;
  total_steps_all_employees: number;
  total_charity_amount: number;
  total_employees: number;
  last_updated: string;
}

export interface UserRankInfo {
  rank: number;
  total_employees: number;
  total_steps: number;
  total_charity_amount: number;
}

export interface DashboardData {
  leaderboard: LeaderboardEntry[];
  companyStats: CompanyStats | null;
  userRank: UserRankInfo | null;
  error?: string;
}

export async function refreshDashboardViews(): Promise<void> {
  try {
    const { error } = await supabase.rpc('refresh_dashboard_views');

    if (error) {
      console.error('Error refreshing dashboard views:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to refresh dashboard views:', error);
    throw error;
  }
}

export async function fetchTopLeaderboard(limit: number = 20): Promise<LeaderboardEntry[]> {
  try {
    const { data, error } = await supabase
      .from('leaderboard_view')
      .select('*')
      .order('rank', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    return [];
  }
}

export async function fetchCompanyStats(company: string): Promise<CompanyStats | null> {
  try {
    const { data, error } = await supabase
      .from('company_stats_view')
      .select('*')
      .eq('company', company)
      .maybeSingle();

    if (error) {
      console.error('Error fetching company stats:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch company stats:', error);
    return null;
  }
}

export async function fetchUserRank(employeeId: string): Promise<UserRankInfo | null> {
  try {
    const { data, error } = await supabase
      .rpc('get_user_rank', { user_employee_id: employeeId });

    if (error) {
      console.error('Error fetching user rank:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return null;
    }

    return data[0];
  } catch (error) {
    console.error('Failed to fetch user rank:', error);
    return null;
  }
}

export async function fetchUserCompany(employeeId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('company')
      .eq('employee_id', employeeId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user company:', error);
      throw error;
    }

    return data?.company || null;
  } catch (error) {
    console.error('Failed to fetch user company:', error);
    return null;
  }
}

export async function fetchAllDashboardData(employeeId: string): Promise<DashboardData> {
  try {
    await refreshDashboardViews();

    const [leaderboard, userCompany] = await Promise.all([
      fetchTopLeaderboard(20),
      fetchUserCompany(employeeId)
    ]);

    const [companyStats, userRank] = await Promise.all([
      userCompany ? fetchCompanyStats(userCompany) : Promise.resolve(null),
      fetchUserRank(employeeId)
    ]);

    return {
      leaderboard,
      companyStats,
      userRank
    };
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    return {
      leaderboard: [],
      companyStats: null,
      userRank: null,
      error: error instanceof Error ? error.message : 'Failed to load dashboard data'
    };
  }
}

export function formatSteps(steps: number): string {
  return steps.toLocaleString();
}

export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getRankColor(rank: number): string {
  switch (rank) {
    case 1:
      return '#FFD700';
    case 2:
      return '#C0C0C0';
    case 3:
      return '#CD7F32';
    default:
      return '#B8D4E8';
  }
}
