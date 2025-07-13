import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useGoals, CheckIn as CheckInData } from '@/contexts/GoalContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/ui/GlassCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { ArrowLeft, Target, Calendar } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const MOOD_OPTIONS = [
  { value: 'terrible', label: 'Terrible', icon: '😞', color: '#EF4444' },
  { value: 'bad', label: 'Bad', icon: '😕', color: '#F59E0B' },
  { value: 'okay', label: 'Okay', icon: '😐', color: '#6B7280' },
  { value: 'good', label: 'Good', icon: '😊', color: '#10B981' },
  { value: 'great', label: 'Great', icon: '😄', color: '#3B82F6' },
] as const;

const DIFFICULTY_LEVELS = [
  { value: 1, label: 'Very Easy', color: '#10B981' },
  { value: 2, label: 'Easy', color: '#34D399' },
  { value: 3, label: 'Medium', color: '#F59E0B' },
  { value: 4, label: 'Hard', color: '#EF4444' },
  { value: 5, label: 'Very Hard', color: '#DC2626' },
];

export default function CheckIn() {
  const { colors } = useTheme();
  const { goals, addCheckIn, updateGoal } = useGoals();
  const { goalId } = useLocalSearchParams<{ goalId: string }>();
  
  const [progress, setProgress] = useState('');
  const [mood, setMood] = useState<'terrible' | 'bad' | 'okay' | 'good' | 'great'>('okay');
  const [difficulty, setDifficulty] = useState(3);
  const [notes, setNotes] = useState('');
  const [completed, setCompleted] = useState(false);

  const goal = goals.find(g => g.id === goalId);

  useEffect(() => {
    if (!goal) {
      Alert.alert('Error', 'Goal not found', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  }, [goal]);

  if (!goal) {
    return null;
  }

  const handleSubmitCheckIn = () => {
    const progressValue = parseInt(progress) || 0;
    
    if (progressValue < 0) {
      Alert.alert('Error', 'Progress cannot be negative');
      return;
    }
    const checkIn: Omit<CheckInData, 'id'> = {
      date: new Date(),
      progress: progressValue,
      mood,
      difficulty,
      notes: notes.trim(),
      completed: progressValue >= goal.dailyTarget,
    };

    addCheckIn(goal.id, checkIn);

    // Update goal progress
    const newCurrentProgress = goal.currentProgress + progressValue;
    const newDaysRemaining = Math.max(0, goal.daysRemaining - 1);
    const isGoalCompleted = newDaysRemaining === 0 || newCurrentProgress >= (goal.dailyTarget * goal.totalDays);

    updateGoal(goal.id, {
      currentProgress: newCurrentProgress,
      daysRemaining: newDaysRemaining,
      isCompleted: isGoalCompleted,
    });

    Alert.alert(
      'Progress Logged!',
      `Great job! You've logged ${progressValue} ${goal.unit}${progressValue !== 1 ? 's' : ''} for today.`,
      [
        { text: 'OK', onPress: () => router.back() }
      ]
    );
  };

  const getMoodColor = (moodValue: string) => {
    return MOOD_OPTIONS.find(m => m.value === moodValue)?.color || colors.textSecondary;
  };

  const getDifficultyColor = (difficultyValue: number) => {
    return DIFFICULTY_LEVELS.find(d => d.value === difficultyValue)?.color || colors.textSecondary;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.primary }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.glass }]}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Log Progress
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {formatDate(new Date())}
            </Text>
          </View>
        </View>

        {/* Goal Info */}
        <GlassCard style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Target size={24} color={colors.electricBlue} />
            <View style={styles.goalInfo}>
              <Text style={[styles.goalName, { color: colors.textPrimary }]}>
                {goal.name}
              </Text>
              <Text style={[styles.goalTarget, { color: colors.textSecondary }]}>
                Daily target: {goal.dailyTarget} {goal.unit}{goal.dailyTarget !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
          {goal.description && (
            <Text style={[styles.goalDescription, { color: colors.textSecondary }]}>
              {goal.description}
            </Text>
          )}
        </GlassCard>

        {/* Progress Input */}
        <GlassCard style={styles.inputCard}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Today's Progress
          </Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            How many {goal.unit}s did you complete today?
          </Text>
          
          <View style={styles.progressInput}>
            <TextInput
              style={[styles.progressNumber, { 
                backgroundColor: colors.tertiary,
                borderColor: colors.glass,
                color: colors.textPrimary
              }]}
              value={progress}
              onChangeText={setProgress}
              placeholder="0"
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
            />
            <Text style={[styles.progressUnit, { color: colors.textSecondary }]}>
              {goal.unit}{parseInt(progress) !== 1 ? 's' : ''}
            </Text>
          </View>

          {/* Completion Status */}
          <View style={styles.completionStatus}>
            <View style={[
              styles.completionBadge,
              {
                backgroundColor: (parseInt(progress) || 0) >= goal.dailyTarget 
                  ? colors.successGreen 
                  : colors.warningAmber
              }
            ]}>
              <Text style={styles.completionText}>
                {(parseInt(progress) || 0) >= goal.dailyTarget ? 'Target Reached!' : 'In Progress'}
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* Mood Selection */}
        <GlassCard style={styles.moodCard}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            How are you feeling?
          </Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Track your mood to understand patterns
          </Text>
          
          <View style={styles.moodOptions}>
            {MOOD_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.moodOption,
                  {
                    backgroundColor: mood === option.value 
                      ? option.color 
                      : colors.glass,
                    borderColor: mood === option.value 
                      ? option.color 
                      : colors.glassStrong,
                  }
                ]}
                onPress={() => setMood(option.value)}
              >
                <Text style={styles.moodIcon}>{option.icon}</Text>
                <Text style={[
                  styles.moodLabel,
                  {
                    color: mood === option.value 
                      ? '#FFFFFF' 
                      : colors.textSecondary
                  }
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </GlassCard>

        {/* Difficulty Rating */}
        <GlassCard style={styles.difficultyCard}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Difficulty Level
          </Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            How challenging was today's task?
          </Text>
          
          <View style={styles.difficultySlider}>
            {DIFFICULTY_LEVELS.map((level) => (
              <TouchableOpacity
                key={level.value}
                style={[
                  styles.difficultyOption,
                  {
                    backgroundColor: difficulty === level.value 
                      ? level.color 
                      : colors.glass,
                    borderColor: difficulty === level.value 
                      ? level.color 
                      : colors.glassStrong,
                  }
                ]}
                onPress={() => setDifficulty(level.value)}
              >
                <Text style={[
                  styles.difficultyNumber,
                  {
                    color: difficulty === level.value 
                      ? '#FFFFFF' 
                      : colors.textSecondary
                  }
                ]}>
                  {level.value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={[styles.difficultyLabel, { color: colors.textSecondary }]}>
            {DIFFICULTY_LEVELS.find(d => d.value === difficulty)?.label}
          </Text>
        </GlassCard>

        {/* Notes */}
        <GlassCard style={styles.notesCard}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Notes (Optional)
          </Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Any thoughts or observations about today?
          </Text>
          
          <TextInput
            style={[styles.notesInput, { 
              backgroundColor: colors.tertiary,
              borderColor: colors.glass,
              color: colors.textPrimary
            }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="How did it go? Any challenges or wins?"
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </GlassCard>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <PremiumButton
            title="Log Progress"
            onPress={handleSubmitCheckIn}
            size="large"
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  goalCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalInfo: {
    marginLeft: 12,
    flex: 1,
  },
  goalName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 4,
  },
  goalTarget: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  goalDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    lineHeight: 20,
  },
  inputCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginBottom: 16,
  },
  progressInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressNumber: {
    height: 60,
    width: 100,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    textAlign: 'center',
    marginRight: 12,
  },
  progressUnit: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  completionStatus: {
    alignItems: 'center',
  },
  completionBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  completionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
  },
  moodCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
  },
  moodOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 2,
  },
  moodIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    textAlign: 'center',
  },
  difficultyCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
  },
  difficultySlider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  difficultyOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  difficultyNumber: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  difficultyLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    textAlign: 'center',
  },
  notesCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
  },
  notesInput: {
    height: 100,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
  },
  submitContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  submitButton: {
    marginTop: 10,
  },
});