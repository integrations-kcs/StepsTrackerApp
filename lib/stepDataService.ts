import { Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';

export interface DailyStepData {
  date: string;
  stepCount: number;
}

export interface StepDataResult {
  success: boolean;
  data?: DailyStepData[];
  error?: string;
}

function getStartOfDay(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

function getEndOfDay(date: Date): Date {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
}

function formatDateForDB(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function fetchLast7DaysSteps(): Promise<StepDataResult> {
  try {
    const isAvailable = await Pedometer.isAvailableAsync();

    if (!isAvailable) {
      return {
        success: false,
        error: 'Step counting not available on this device'
      };
    }

    const stepDataArray: DailyStepData[] = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - i);

      const startOfDay = getStartOfDay(targetDate);
      const endOfDay = getEndOfDay(targetDate);

      try {
        const result = await Pedometer.getStepCountAsync(startOfDay, endOfDay);

        stepDataArray.push({
          date: formatDateForDB(targetDate),
          stepCount: result.steps || 0
        });
      } catch (dayError) {
        console.warn(`Failed to fetch steps for ${formatDateForDB(targetDate)}:`, dayError);
        stepDataArray.push({
          date: formatDateForDB(targetDate),
          stepCount: 0
        });
      }
    }

    return {
      success: true,
      data: stepDataArray
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to fetch step data: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

export async function isStepCountingAvailable(): Promise<boolean> {
  try {
    return await Pedometer.isAvailableAsync();
  } catch (error) {
    console.error('Error checking step counting availability:', error);
    return false;
  }
}
