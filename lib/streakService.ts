import { supabase } from './supabase';

export interface Streak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface StreakAchievement {
  id: string;
  user_id: string;
  milestone_days: number;
  achieved_date: string;
  created_at: string;
  bonus_amount?: number;
  description?: string;
}

export interface StreakMilestone {
  milestone_id: number;
  milestone_days: number;
  bonus_amount: number;
  description: string;
}

export interface StreakUpdateResult {
  success: boolean;
  streak?: Streak;
  newAchievements?: StreakAchievement[];
  error?: string;
  streakIncremented?: boolean;
  streakReset?: boolean;
}

function formatDateForDB(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDate(dateString: string): Date {
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getDaysDifference(date1: string, date2: string): number {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export async function updateUserStreak(
  userId: string,
  activityDate: string
): Promise<StreakUpdateResult> {
  try {
    const { data: existingStreak, error: fetchError } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      return {
        success: false,
        error: `Failed to fetch streak: ${fetchError.message}`
      };
    }

    let newCurrentStreak = 1;
    let newLongestStreak = 1;
    let streakIncremented = false;
    let streakReset = false;

    if (existingStreak && existingStreak.last_activity_date) {
      const daysSinceLastActivity = getDaysDifference(
        existingStreak.last_activity_date,
        activityDate
      );

      if (daysSinceLastActivity === 0) {
        return {
          success: true,
          streak: existingStreak,
          newAchievements: [],
          streakIncremented: false,
          streakReset: false
        };
      } else if (daysSinceLastActivity === 1) {
        newCurrentStreak = existingStreak.current_streak + 1;
        streakIncremented = true;
      } else {
        newCurrentStreak = 1;
        streakReset = true;
      }

      newLongestStreak = Math.max(newCurrentStreak, existingStreak.longest_streak);
    }

    const streakData = {
      user_id: userId,
      current_streak: newCurrentStreak,
      longest_streak: newLongestStreak,
      last_activity_date: activityDate
    };

    const { data: updatedStreak, error: upsertError } = await supabase
      .from('streaks')
      .upsert(streakData, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (upsertError) {
      return {
        success: false,
        error: `Failed to update streak: ${upsertError.message}`
      };
    }

    const newAchievements = await checkAndCreateAchievements(
      userId,
      newCurrentStreak,
      activityDate
    );

    return {
      success: true,
      streak: updatedStreak,
      newAchievements,
      streakIncremented,
      streakReset
    };
  } catch (error) {
    return {
      success: false,
      error: `Streak update failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

async function checkAndCreateAchievements(
  userId: string,
  currentStreak: number,
  achievedDate: string
): Promise<StreakAchievement[]> {
  try {
    const { data: milestones, error: milestonesError } = await supabase
      .from('streak_milestones')
      .select('*')
      .eq('milestone_days', currentStreak);

    if (milestonesError || !milestones || milestones.length === 0) {
      return [];
    }

    const newAchievements: StreakAchievement[] = [];

    for (const milestone of milestones) {
      const { data: existingAchievement, error: checkError } = await supabase
        .from('user_streak_achievements')
        .select('*')
        .eq('user_id', userId)
        .eq('milestone_days', milestone.milestone_days)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking achievement:', checkError);
        continue;
      }

      if (!existingAchievement) {
        const { data: newAchievement, error: insertError } = await supabase
          .from('user_streak_achievements')
          .insert({
            user_id: userId,
            milestone_days: milestone.milestone_days,
            achieved_date: achievedDate
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating achievement:', insertError);
        } else if (newAchievement) {
          newAchievements.push({
            ...newAchievement,
            bonus_amount: milestone.bonus_amount,
            description: milestone.description
          });
        }
      }
    }

    return newAchievements;
  } catch (error) {
    console.error('Failed to check achievements:', error);
    return [];
  }
}

export async function getUserStreak(userId: string): Promise<Streak | null> {
  try {
    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user streak:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch user streak:', error);
    return null;
  }
}

export async function getUserAchievements(userId: string): Promise<StreakAchievement[]> {
  try {
    const { data, error } = await supabase
      .from('user_streak_achievements')
      .select(`
        *,
        streak_milestones!fk_milestone (
          bonus_amount,
          description
        )
      `)
      .eq('user_id', userId)
      .order('milestone_days', { ascending: true });

    if (error) {
      console.error('Error fetching user achievements:', error);
      return [];
    }

    return (data || []).map((achievement: any) => ({
      id: achievement.id,
      user_id: achievement.user_id,
      milestone_days: achievement.milestone_days,
      achieved_date: achievement.achieved_date,
      created_at: achievement.created_at,
      bonus_amount: achievement.streak_milestones?.bonus_amount,
      description: achievement.streak_milestones?.description
    }));
  } catch (error) {
    console.error('Failed to fetch user achievements:', error);
    return [];
  }
}

export async function getAllMilestones(): Promise<StreakMilestone[]> {
  try {
    const { data, error } = await supabase
      .from('streak_milestones')
      .select('*')
      .order('milestone_days', { ascending: true });

    if (error) {
      console.error('Error fetching milestones:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch milestones:', error);
    return [];
  }
}

export async function getNextMilestone(
  currentStreak: number
): Promise<StreakMilestone | null> {
  try {
    const { data, error } = await supabase
      .from('streak_milestones')
      .select('*')
      .gt('milestone_days', currentStreak)
      .order('milestone_days', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching next milestone:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch next milestone:', error);
    return null;
  }
}
