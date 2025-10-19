import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { TrendingUp, Award, Users, RefreshCw, AlertCircle } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { getEmployeeIdFromDevice } from '@/lib/auth';
import {
  fetchAllDashboardData,
  LeaderboardEntry,
  CompanyStats,
  UserRankInfo,
  formatSteps,
  formatCurrency,
  getRankColor
} from '@/lib/dashboardService';

export default function DashboardScreen() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [companyStats, setCompanyStats] = useState<CompanyStats | null>(null);
  const [userRank, setUserRank] = useState<UserRankInfo | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadEmployeeId();
  }, []);

  useEffect(() => {
    if (employeeId) {
      loadDashboardData();
    }
  }, [employeeId]);

  useEffect(() => {
    if (!employeeId) return;

    const intervalId = setInterval(() => {
      loadDashboardData(true);
    }, 30000);

    return () => clearInterval(intervalId);
  }, [employeeId]);

  async function loadEmployeeId() {
    try {
      const id = await getEmployeeIdFromDevice();
      setEmployeeId(id);
    } catch (err) {
      console.error('Failed to load employee ID:', err);
      setError('Failed to load user information');
      setLoading(false);
    }
  }

  async function loadDashboardData(silent: boolean = false) {
    if (!employeeId) return;

    if (!silent) {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await fetchAllDashboardData(employeeId);

      if (data.error) {
        setError(data.error);
      } else {
        setLeaderboardData(data.leaderboard);
        setCompanyStats(data.companyStats);
        setUserRank(data.userRank);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadDashboardData();
  }

  async function handleManualRefresh() {
    await loadDashboardData();
  }

  if (loading && !companyStats) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (error && !companyStats) {
    return (
      <View style={styles.errorContainer}>
        <AlertCircle size={48} color="#dc2626" strokeWidth={2} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleManualRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity onPress={handleManualRefresh} style={styles.refreshButton}>
          <RefreshCw size={20} color="#4285F4" strokeWidth={2} />
          {lastUpdated && (
            <Text style={styles.lastUpdatedText}>
              {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <AlertCircle size={16} color="#dc2626" strokeWidth={2} />
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.blueCard]}>
          <TrendingUp size={24} color="#fff" strokeWidth={2} />
          <Text style={styles.statLabel}>Total Steps</Text>
          <Text style={styles.statValue}>
            {companyStats ? formatSteps(companyStats.total_steps_all_employees) : '0'}
          </Text>
        </View>

        <View style={[styles.statCard, styles.greenCard]}>
          <Award size={24} color="#fff" strokeWidth={2} />
          <Text style={styles.statLabel}>Charity Raised</Text>
          <Text style={styles.statValue}>
            {companyStats ? formatCurrency(companyStats.total_charity_amount) : '$0.00'}
          </Text>
        </View>
      </View>

      <View style={styles.rankSection}>
        <View style={styles.rankRow}>
          <View>
            <Text style={styles.rankSubtext}>Your Current Rank</Text>
            <Text style={styles.rankNumber}>
              {userRank ? `#${userRank.rank}` : 'N/A'}
            </Text>
          </View>
          <View style={styles.rankRight}>
            <Text style={styles.rankSubtext}>out of</Text>
            <Text style={styles.rankTotal}>
              {userRank ? userRank.total_employees : companyStats?.total_employees || 0}
            </Text>
            <Text style={styles.rankSubtext}>employees</Text>
          </View>
        </View>
      </View>

      <View style={styles.leaderboardSection}>
        <View style={styles.leaderboardHeader}>
          <Users size={20} color="#1a1a1a" strokeWidth={2} />
          <Text style={styles.leaderboardTitle}>Top 20 Leaderboard</Text>
        </View>

        <View style={styles.leaderboardList}>
          {leaderboardData.length > 0 ? (
            leaderboardData.map((item) => (
              <View key={item.employee_id} style={styles.leaderboardItem}>
                <View style={[styles.rankBadge, { backgroundColor: getRankColor(item.rank) }]}>
                  <Text style={[styles.rankBadgeText, item.rank <= 3 && styles.rankBadgeTextDark]}>
                    {item.rank}
                  </Text>
                </View>
                <View style={styles.leaderboardInfo}>
                  <Text style={styles.leaderboardName}>{item.profile_name}</Text>
                  <Text style={styles.leaderboardSteps}>{formatSteps(item.total_steps)} steps</Text>
                </View>
                <Text style={styles.leaderboardAmount}>{formatCurrency(item.total_charity_amount)}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No leaderboard data available</Text>
              <Text style={styles.emptyStateSubtext}>Start tracking steps to see rankings</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 40,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#dc2626',
    fontWeight: '500',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#4285F4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
  },
  lastUpdatedText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  errorBanner: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#dc2626',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    minHeight: 120,
  },
  blueCard: {
    backgroundColor: '#4285F4',
  },
  greenCard: {
    backgroundColor: '#10B981',
  },
  statLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 8,
    opacity: 0.9,
  },
  statValue: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '700',
    marginTop: 4,
  },
  rankSection: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  rankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rankSubtext: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  rankNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: '#4285F4',
  },
  rankRight: {
    alignItems: 'flex-end',
  },
  rankTotal: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  leaderboardSection: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  leaderboardList: {
    gap: 12,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  rankBadgeTextDark: {
    color: '#1a1a1a',
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  leaderboardSteps: {
    fontSize: 13,
    color: '#666',
  },
  leaderboardAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: '#999',
  },
});
