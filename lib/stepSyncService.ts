import { supabase } from './supabase';
import { fetchLast7DaysSteps, DailyStepData } from './stepDataService';
import * as Device from 'expo-device';

export interface DailyStepRecord {
  step_record_id: string;
  employee_id: string;
  device_id: string;
  step_date: string;
  step_count: number;
  goal_achieved: boolean;
  base_charity_amount: number;
  created_at: string;
  updated_at: string;
}

export interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsInserted: number;
  recordsUpdated: number;
  error?: string;
}

const DAILY_STEP_GOAL = 10000;
const CHARITY_AMOUNT = 15.0;

async function getGlobalSettings(): Promise<{ stepGoal: number; charityAmount: number }> {
  try {
    const { data, error } = await supabase
      .from('global_settings')
      .select('daily_step_goal, charity_amount_per_goal')
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return { stepGoal: DAILY_STEP_GOAL, charityAmount: CHARITY_AMOUNT };
    }

    return {
      stepGoal: data.daily_step_goal || DAILY_STEP_GOAL,
      charityAmount: data.charity_amount_per_goal || CHARITY_AMOUNT
    };
  } catch (error) {
    console.warn('Failed to fetch global settings, using defaults:', error);
    return { stepGoal: DAILY_STEP_GOAL, charityAmount: CHARITY_AMOUNT };
  }
}

export async function syncStepsToDatabase(employeeId: string): Promise<SyncResult> {
  try {
    const stepDataResult = await fetchLast7DaysSteps();

    if (!stepDataResult.success || !stepDataResult.data) {
      return {
        success: false,
        recordsProcessed: 0,
        recordsInserted: 0,
        recordsUpdated: 0,
        error: stepDataResult.error || 'Failed to fetch step data'
      };
    }

    const deviceId = Device.osInternalBuildId || 'unknown';
    const settings = await getGlobalSettings();

    let recordsInserted = 0;
    let recordsUpdated = 0;

    for (const dayData of stepDataResult.data) {
      try {
        const goalAchieved = dayData.stepCount >= settings.stepGoal;
        const charityAmount = goalAchieved ? settings.charityAmount : 0;

        const { data: upsertedData, error: upsertError } = await supabase
          .from('daily_steps')
          .upsert({
            employee_id: employeeId,
            device_id: deviceId,
            step_date: dayData.date,
            step_count: dayData.stepCount,
            goal_achieved: goalAchieved,
            base_charity_amount: charityAmount
          }, {
            onConflict: 'employee_id,step_date',
            ignoreDuplicates: false
          })
          .select();

        if (upsertError) {
          console.error(`Error upserting record for ${dayData.date}:`, upsertError);
        } else {
          if (upsertedData && upsertedData.length > 0) {
            const isNew = new Date(upsertedData[0].created_at).getTime() === new Date(upsertedData[0].updated_at).getTime();
            if (isNew) {
              recordsInserted++;
            } else {
              recordsUpdated++;
            }
          }
        }
      } catch (dayError) {
        console.error(`Failed to process ${dayData.date}:`, dayError);
      }
    }

    return {
      success: true,
      recordsProcessed: stepDataResult.data.length,
      recordsInserted,
      recordsUpdated
    };
  } catch (error) {
    return {
      success: false,
      recordsProcessed: 0,
      recordsInserted: 0,
      recordsUpdated: 0,
      error: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

export async function fetchUserStepRecords(employeeId: string, limit: number = 7): Promise<DailyStepRecord[]> {
  try {
    const { data, error } = await supabase
      .from('daily_steps')
      .select('*')
      .eq('employee_id', employeeId)
      .order('step_date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching step records:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch step records:', error);
    return [];
  }
}
