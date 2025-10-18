import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TrendingUp, Award, Users } from 'lucide-react-native';

export default function DashboardScreen() {
  const leaderboardData = [
    { rank: 1, name: 'Sarah Johnson', steps: '142,890 steps', amount: '$714.45', color: '#FFD700' },
    { rank: 2, name: 'Michael Chen', steps: '136,245 steps', amount: '$691.23', color: '#C0C0C0' },
    { rank: 3, name: 'Emma Rodriguez', steps: '135,670 steps', amount: '$678.35', color: '#CD7F32' },
    { rank: 4, name: 'James Wilson', steps: '131,250 steps', amount: '$656.25', color: '#B8D4E8' },
    { rank: 5, name: 'Lisa Anderson', steps: '128,900 steps', amount: '$644.50', color: '#B8D4E8' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Award size={24} color="#FFD700" strokeWidth={2} />
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.blueCard]}>
          <TrendingUp size={24} color="#fff" strokeWidth={2} />
          <Text style={styles.statLabel}>Total Steps</Text>
          <Text style={styles.statValue}>2,847,593</Text>
        </View>

        <View style={[styles.statCard, styles.greenCard]}>
          <Award size={24} color="#fff" strokeWidth={2} />
          <Text style={styles.statLabel}>Charity Raised</Text>
          <Text style={styles.statValue}>$14,237.97</Text>
        </View>
      </View>

      <View style={styles.rankSection}>
        <View style={styles.rankRow}>
          <View>
            <Text style={styles.rankSubtext}>Your Current Rank</Text>
            <Text style={styles.rankNumber}>#47</Text>
          </View>
          <View style={styles.rankRight}>
            <Text style={styles.rankSubtext}>out of</Text>
            <Text style={styles.rankTotal}>312</Text>
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
          {leaderboardData.map((item) => (
            <View key={item.rank} style={styles.leaderboardItem}>
              <View style={[styles.rankBadge, { backgroundColor: item.color }]}>
                <Text style={[styles.rankBadgeText, item.rank <= 3 && styles.rankBadgeTextDark]}>
                  {item.rank}
                </Text>
              </View>
              <View style={styles.leaderboardInfo}>
                <Text style={styles.leaderboardName}>{item.name}</Text>
                <Text style={styles.leaderboardSteps}>{item.steps}</Text>
              </View>
              <Text style={styles.leaderboardAmount}>{item.amount}</Text>
            </View>
          ))}
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
});
