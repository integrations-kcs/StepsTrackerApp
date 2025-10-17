import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TrendingUp, Award, Flame, Star } from 'lucide-react-native';

export default function IndividualScreen() {
  const weeklyData = [
    { day: '10 Oct', steps: '9.2k', goal: false },
    { day: '11 Oct', steps: '10.6k', goal: true },
    { day: '12 Oct', steps: '8.9k', goal: false },
    { day: '13 Oct', steps: '11.2k', goal: true },
    { day: '14 Oct', steps: '10.9k', goal: true },
    { day: '15 Oct', steps: '12.5k', goal: true },
    { day: '16 Oct', steps: '7.8k', goal: false },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Progress</Text>
      </View>

      <View style={styles.todayCard}>
        <Text style={styles.todayLabel}>Today's Steps</Text>
        <Text style={styles.todaySteps}>8,247</Text>
        <Text style={styles.goalLabel}>Daily Goal: 10,000</Text>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '82%' }]} />
        </View>

        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>1,753 steps to goal!</Text>
          <Text style={styles.progressPercent}>82%</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statMiniCard}>
          <TrendingUp size={20} color="#4285F4" strokeWidth={2} />
          <Text style={styles.statMiniLabel}>Lifetime Steps</Text>
          <Text style={styles.statMiniValue}>487,920</Text>
        </View>

        <View style={styles.statMiniCard}>
          <Award size={20} color="#10B981" strokeWidth={2} />
          <Text style={styles.statMiniLabel}>Contribution</Text>
          <Text style={styles.statMiniValue}>$2,439.60</Text>
        </View>
      </View>

      <View style={styles.streakCard}>
        <View style={styles.streakRow}>
          <View style={styles.streakItem}>
            <Text style={styles.streakLabel}>Current Streak</Text>
            <View style={styles.streakValueRow}>
              <Text style={styles.streakValue}>12 days</Text>
              <Flame size={24} color="#FF6B35" strokeWidth={2} />
            </View>
          </View>
          <View style={styles.streakDivider} />
          <View style={styles.streakItem}>
            <Text style={styles.streakLabel}>Longest</Text>
            <Text style={styles.streakValue}>18 days</Text>
          </View>
        </View>
        <View style={styles.streakInfo}>
          <Text style={styles.streakInfoText}>Daily Goal: 10,000 steps = $15 base</Text>
          <Text style={styles.streakInfoText}>Keep your streak to earn bonus charity! 🏆</Text>
        </View>
      </View>

      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>Last 7 Days</Text>

        <View style={styles.chart}>
          <View style={styles.chartBars}>
            {weeklyData.map((data, index) => {
              const stepsNum = parseFloat(data.steps.replace('k', '')) * 1000;
              const heightPercent = (stepsNum / 12500) * 100;

              return (
                <View key={index} style={styles.barContainer}>
                  <View style={styles.barColumn}>
                    {data.goal && (
                      <Star size={16} color="#FFD700" fill="#FFD700" strokeWidth={2} />
                    )}
                    {!data.goal && <View style={{ height: 16 }} />}
                    <View style={styles.barWrapper}>
                      <View style={[styles.bar, { height: `${heightPercent}%` }]} />
                    </View>
                  </View>
                  <Text style={styles.barLabel}>{data.steps}</Text>
                  <Text style={styles.barDay}>{data.day}</Text>
                </View>
              );
            })}
          </View>
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
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  todayCard: {
    marginHorizontal: 20,
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },
  todayLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    opacity: 0.9,
  },
  todaySteps: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '700',
    marginTop: 4,
  },
  goalLabel: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
    marginTop: 8,
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  progressPercent: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  statMiniCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  statMiniLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  statMiniValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 4,
  },
  streakCard: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  streakRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  streakItem: {
    flex: 1,
  },
  streakDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 16,
  },
  streakLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  streakValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  streakInfo: {
    backgroundColor: '#FFF5F2',
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  streakInfoText: {
    fontSize: 12,
    color: '#666',
  },
  chartSection: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  chart: {
    height: 200,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: '100%',
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
  },
  barWrapper: {
    flex: 1,
    width: '70%',
    justifyContent: 'flex-end',
  },
  bar: {
    backgroundColor: '#4285F4',
    borderRadius: 4,
    width: '100%',
  },
  barLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 8,
  },
  barDay: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
});
