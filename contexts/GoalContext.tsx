import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Goal {
  id: string;
  name: string;
  description?: string;
  category: string;
  deadline: Date;
  dailyTarget: number;
  unit: string;
  currentProgress: number;
  totalDays: number;
  daysRemaining: number;
  completedDays: number;
  streak: number;
  isCompleted: boolean;
  createdAt: Date;
  lastCheckinDate?: Date;
  checkIns: CheckIn[];
  priority: number; // Add priority field for custom ordering
}

export interface CheckIn {
  id: string;
  date: Date;
  progress: number;
  mood: 'terrible' | 'bad' | 'okay' | 'good' | 'great';
  difficulty: number;
  notes?: string;
  completed: boolean;
}

interface GoalContextType {
  goals: Goal[];
  activeGoal: Goal | null;
  setActiveGoal: (goal: Goal | null) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'priority'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addCheckIn: (goalId: string, checkIn: Omit<CheckIn, 'id'>) => void;
  getTotalStats: () => { completed: number; streak: number; successRate: number };
  reorderGoals: (goalIds: string[]) => void;
}

const GoalContext = createContext<GoalContextType | undefined>(undefined);

// Priority calculation function
const calculateGoalPriority = (goal: Goal): number => {
  const now = new Date();
  const deadline = new Date(goal.deadline);
  const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  // Update daysRemaining in the goal object
  goal.daysRemaining = Math.max(0, daysRemaining);
  
  // If goal has a manual priority set (from reordering), use that
  if (goal.priority !== undefined && goal.priority >= 1000) {
    return goal.priority;
  }
  
  // Priority factors (lower score = higher priority)
  let priorityScore = 0;
  
  // 1. Urgency (days remaining) - most important factor
  if (daysRemaining <= 0) {
    priorityScore += 1000; // Overdue goals get highest priority
  } else if (daysRemaining <= 7) {
    priorityScore += 100; // Within a week
  } else if (daysRemaining <= 30) {
    priorityScore += 50; // Within a month
  } else {
    priorityScore += daysRemaining * 0.1; // Further out gets lower priority
  }
  
  // 2. Completion status
  if (goal.isCompleted) {
    priorityScore += 10000; // Completed goals go to bottom
  }
  
  // 3. Streak momentum (lower streak = higher priority to maintain momentum)
  if (goal.streak > 0) {
    priorityScore -= goal.streak * 2; // Active streaks get priority boost
  }
  
  // 4. Progress ratio (less progress = higher priority)
  const progressRatio = goal.completedDays / goal.totalDays;
  priorityScore += progressRatio * 20;
  
  return priorityScore;
};

// Sort goals by priority
const sortGoalsByPriority = (goals: Goal[]): Goal[] => {
  return goals.sort((a, b) => {
    const priorityA = calculateGoalPriority(a);
    const priorityB = calculateGoalPriority(b);
    
    // Store calculated priority for reference
    a.priority = priorityA;
    b.priority = priorityB;
    
    return priorityA - priorityB;
  });
};

export const GoalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);

  useEffect(() => {
    loadGoals();
  }, []);

  useEffect(() => {
    saveGoals();
  }, [goals]);

  const loadGoals = async () => {
    try {
      const savedGoals = await AsyncStorage.getItem('goals');
      if (savedGoals) {
        const parsedGoals = JSON.parse(savedGoals).map((goal: any) => ({
          ...goal,
          deadline: new Date(goal.deadline),
          createdAt: new Date(goal.createdAt),
          lastCheckinDate: goal.lastCheckinDate ? new Date(goal.lastCheckinDate) : undefined,
          priority: goal.priority || 0,
          checkIns: goal.checkIns.map((checkIn: any) => ({
            ...checkIn,
            date: new Date(checkIn.date),
          })),
        }));
        
        // Sort goals by priority
        const sortedGoals = sortGoalsByPriority(parsedGoals);
        setGoals(sortedGoals);
        
        // Set active goal to the highest priority incomplete goal
        const activeGoal = sortedGoals.find((goal: Goal) => !goal.isCompleted);
        if (activeGoal) {
          setActiveGoal(activeGoal);
        }
      }
    } catch (error) {
      console.error('Failed to load goals:', error);
    }
  };

  const saveGoals = async () => {
    try {
      await AsyncStorage.setItem('goals', JSON.stringify(goals));
    } catch (error) {
      console.error('Failed to save goals:', error);
    }
  };

  const addGoal = (goalData: Omit<Goal, 'id' | 'createdAt' | 'priority'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: Date.now().toString(),
      createdAt: new Date(),
      priority: 0,
      checkIns: [],
    };
    
    // Add and re-sort goals
    const updatedGoals = [...goals, newGoal];
    const sortedGoals = sortGoalsByPriority(updatedGoals);
    setGoals(sortedGoals);
    
    // Set as active goal if no active goal exists or if it's higher priority
    if (!activeGoal || newGoal.priority < activeGoal.priority) {
      setActiveGoal(newGoal);
    }
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    const updatedGoals = goals.map(goal => 
      goal.id === id ? { ...goal, ...updates } : goal
    );
    
    // Re-sort after update
    const sortedGoals = sortGoalsByPriority(updatedGoals);
    setGoals(sortedGoals);
    
    // Update active goal if it's the one being updated
    if (activeGoal?.id === id) {
      const updatedActiveGoal = sortedGoals.find(goal => goal.id === id);
      setActiveGoal(updatedActiveGoal || null);
    }
  };

  const deleteGoal = (id: string) => {
    const filteredGoals = goals.filter(goal => goal.id !== id);
    setGoals(filteredGoals);
    
    // Clear active goal if it's the one being deleted
    if (activeGoal?.id === id) {
      // Set new active goal to highest priority incomplete goal
      const newActiveGoal = filteredGoals.find(goal => !goal.isCompleted);
      setActiveGoal(newActiveGoal || null);
    }
  };

  const addCheckIn = (goalId: string, checkInData: Omit<CheckIn, 'id'>) => {
    const checkIn: CheckIn = {
      ...checkInData,
      id: Date.now().toString(),
    };
    
    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        const updatedGoal = {
          ...goal,
          checkIns: [...goal.checkIns, checkIn],
          lastCheckinDate: checkIn.date,
        };
        
        // Update progress and streak
        if (checkIn.completed) {
          updatedGoal.completedDays += 1;
          updatedGoal.streak += 1;
        } else {
          updatedGoal.streak = 0;
        }
        
        // Check if goal is completed
        if (updatedGoal.completedDays >= updatedGoal.totalDays) {
          updatedGoal.isCompleted = true;
        }
        
        return updatedGoal;
      }
      return goal;
    });
    
    // Re-sort after check-in
    const sortedGoals = sortGoalsByPriority(updatedGoals);
    setGoals(sortedGoals);
  };

  const reorderGoals = (goalIds: string[]) => {
    // Manual reordering - assign custom priority based on order
    const reorderedGoals = goalIds.map((id, index) => {
      const goal = goals.find(g => g.id === id);
      if (goal) {
        return { ...goal, priority: index * 1000 }; // Use large multiplier for manual ordering
      }
      return goal;
    }).filter(Boolean) as Goal[];
    
    setGoals(reorderedGoals);
  };

  const getTotalStats = () => {
    const completed = goals.filter(goal => goal.isCompleted).length;
    const totalStreak = goals.reduce((sum, goal) => sum + goal.streak, 0);
    const totalGoals = goals.length;
    const successRate = totalGoals > 0 ? (completed / totalGoals) * 100 : 0;
    
    return {
      completed,
      streak: totalStreak,
      successRate,
    };
  };

  return (
    <GoalContext.Provider value={{
      goals,
      activeGoal,
      setActiveGoal,
      addGoal,
      updateGoal,
      deleteGoal,
      addCheckIn,
      getTotalStats,
      reorderGoals,
    }}>
      {children}
    </GoalContext.Provider>
  );
};

export const useGoals = () => {
  const context = useContext(GoalContext);
  if (!context) {
    throw new Error('useGoals must be used within a GoalProvider');
  }
  return context;
};