import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { TrendingUp, Award, Flame, Star, RefreshCw } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncStepsToDatabase, fetchUserStepRecords, DailyStepRecord } from '@/lib/stepSyncService';
import { requestStepPermissions, checkStepPermissions } from '@/lib/healthPermissions';
import { getDeviceId, getEmployeeIdFromDevice } from '@/lib/auth';

export default function IndividualScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [stepRecords, setStepRecords] = useState<DailyStepRecord[]>([]);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    loadEmployeeData();
    checkPermissions();
  }, []);

  useEffect(() => {
    if (employeeId && hasPermission) {
      performAutoSync();
    }
  }, [employeeId, hasPermission]);

  async function loadEmployeeData() {
    try {
      const deviceId = await getDeviceId();
      const empId = await getEmployeeIdFromDevice(deviceId);

      if (empId) {
        setEmployeeId(empId);
        const records = await fetchUserStepRecords(empId, 7);
        setStepRecords(records);
      } else {
        console.error('No employee ID found for this device');
      }
    } catch (error) {
      console.error('Failed to load employee data:', error);
    }
  }

  async function checkPermissions() {
    const permission = await checkStepPermissions();
    setHasPermission(permission.granted);
  }

  async function performAutoSync() {
    if (!employeeId) return;

    try {
      const lastSync = await AsyncStorage.getItem('last_step_sync');
      const now = new Date().getTime();

      if (!lastSync || now - parseInt(lastSync) > 3600000) {
        await handleStepSync();
      }
    } catch (error) {
      console.error('Auto sync failed:', error);
    }
  }

  async function handleStepSync() {
    if (!employeeId) {
      Alert.alert('Error', 'Employee ID not found. Please register first.');
      return;
    }

    setSyncing(true);

    try {
      const permission = await requestStepPermissions();

      if (!permission.granted) {
        Alert.alert('Permission Required', permission.error || 'Please enable step tracking permissions in Settings.');
        setSyncing(false);
        return;
      }

      setHasPermission(true);

      const result = await syncStepsToDatabase(employeeId);

      if (result.success) {
        const records = await fetchUserStepRecords(employeeId, 7);
        setStepRecords(records);

        await AsyncStorage.setItem('last_step_sync', new Date().getTime().toString());
        setLastSyncTime(new Date().toLocaleTimeString());
      } else {
        Alert.alert('Sync Failed', result.error || 'Failed to sync step data');
      }
    } catch (error) {
      Alert.alert('Error', `Failed to sync: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSyncing(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await handleStepSync();
    setRefreshing(false);
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function formatSteps(steps: number): string {
    if (steps >= 1000) {
      return `${(steps / 1000).toFixed(1)}k`;
    }
    return steps.toString();
  }

  const todayRecord = stepRecords.length > 0 ? stepRecords[0] : null;
  const todaySteps = todayRecord?.step_count || 0;
  const dailyGoal = 10000;
  const progressPercent = Math.min((todaySteps / dailyGoal) * 100, 100);
  const stepsToGoal = Math.max(dailyGoal - todaySteps, 0);

  const totalSteps = stepRecords.reduce((sum, record) => sum + record.step_count, 0);
  const totalContribution = stepRecords.reduce((sum, record) => sum + record.base_charity_amount, 0);

  const sortedRecords = [...stepRecords].reverse();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Progress</Text>
        <TouchableOpacity
          style={styles.syncButton}
          onPress={handleStepSync}
          disabled={syncing}
        >
          <RefreshCw
            size={20}
            color="#4285F4"
            strokeWidth={2}
          />
          {lastSyncTime && (
            <Text style={styles.syncTime}>{lastSyncTime}</Text>
          )}
        </TouchableOpacity>
      </View>

      {!hasPermission && (
        <View style={styles.permissionBanner}>
          <Text style={styles.permissionText}>
            Enable step tracking to sync your data
          </Text>
          <TouchableOpacity
            style={styles.enableButton}
            onPress={handleStepSync}
          >
            <Text style={styles.enableButtonText}>Enable</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.todayCard}>
        <Text style={styles.todayLabel}>Today's Steps</Text>
        <Text style={styles.todaySteps}>{todaySteps.toLocaleString()}</Text>
        <Text style={styles.goalLabel}>Daily Goal: {dailyGoal.toLocaleString()}</Text>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>

        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {stepsToGoal > 0 ? `${stepsToGoal.toLocaleString()} steps to goal!` : 'Goal achieved!'}
          </Text>
          <Text style={styles.progressPercent}>{Math.round(progressPercent)}%</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statMiniCard}>
          <TrendingUp size={20} color="#4285F4" strokeWidth={2} />
          <Text style={styles.statMiniLabel}>Last 7 Days</Text>
          <Text style={styles.statMiniValue}>{totalSteps.toLocaleString()}</Text>
        </View>

        <View style={styles.statMiniCard}>
          <Award size={20} color="#10B981" strokeWidth={2} />
          <Text style={styles.statMiniLabel}>Contribution</Text>
          <Text style={styles.statMiniValue}>${totalContribution.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>Last 7 Days</Text>

        {sortedRecords.length > 0 ? (
          <View style={styles.chart}>
            <View style={styles.chartBars}>
              {sortedRecords.map((record, index) => {
                const heightPercent = Math.min((record.step_count / 12500) * 100, 100);

                return (
                  <View key={record.step_record_id || index} style={styles.barContainer}>
                    <View style={styles.barColumn}>
                      {record.goal_achieved && (
                        <Star size={16} color="#FFD700" fill="#FFD700" strokeWidth={2} />
                      )}
                      {!record.goal_achieved && <View style={{ height: 16 }} />}
                      <View style={styles.barWrapper}>
                        <View style={[styles.bar, { height: `${heightPercent}%` }]} />
                      </View>
                    </View>
                    <Text style={styles.barLabel}>{formatSteps(record.step_count)}</Text>
                    <Text style={styles.barDay}>{formatDate(record.step_date)}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No step data available</Text>
            <Text style={styles.noDataSubtext}>Pull down to sync your steps</Text>
          </View>
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
  },
  syncTime: {
    fontSize: 11,
    color: '#666',
  },
  permissionBanner: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  permissionText: {
    flex: 1,
    fontSize: 13,
    color: '#856404',
    fontWeight: '500',
  },
  enableButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  enableButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  todayCard: {
    marginHorizontal: 20,
    backgroundColor: '#4285F4',
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
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  noDataSubtext: {
    fontSize: 13,
    color: '#999',
  },
});
