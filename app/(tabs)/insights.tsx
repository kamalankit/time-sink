import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useGoals } from '@/contexts/GoalContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatusCard } from '@/components/StatusCard';
import { LinearGradient } from 'expo-linear-gradient';

export default function Insights() {
  const { colors } = useTheme();
  const { goals, getTotalStats } = useGoals();

  const stats = getTotalStats();
  const totalGoals = goals.length;
  const activeGoals = goals.filter(goal => !goal.isCompleted).length;
  const completedGoals = goals.filter(goal => goal.isCompleted).length;

  const getRecentActivity = () => {
    const allCheckIns = goals.flatMap(goal => 
      goal.checkIns.map(checkIn => ({
        ...checkIn,
        goalName: goal.name,
      }))
    );
    
    return allCheckIns
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  };

  const recentActivity = getRecentActivity();

  const getCategoryStats = () => {
    const categoryCount: { [key: string]: number } = {};
    goals.forEach(goal => {
      categoryCount[goal.category] = (categoryCount[goal.category] || 0) + 1;
    });
    return categoryCount;
  };

  const categoryStats = getCategoryStats();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.primary }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Progress Insights
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Track your journey and celebrate progress
          </Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryCards}>
          <StatusCard
            icon="🎯"
            value={completedGoals}
            label="Completed Goals"
            color={colors.successGreen}
          />
          <StatusCard
            icon="🔥"
            value={Math.max(...goals.map(g => g.streak), 0)}
            label="Best Streak"
            color={colors.dangerRed}
          />
          <StatusCard
            icon="📊"
            value={`${Math.round(stats.successRate)}%`}
            label="Success Rate"
            color={colors.electricBlue}
          />
        </View>

        {/* Overall Progress */}
        <GlassCard style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              Overall Progress
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
              Your goal completion journey
            </Text>
          </View>
          
          <View style={styles.progressStats}>
            <View style={styles.progressItem}>
              <Text style={[styles.progressValue, { color: colors.successGreen }]}>
                {completedGoals}
              </Text>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                Completed
              </Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={[styles.progressValue, { color: colors.electricBlue }]}>
                {activeGoals}
              </Text>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                Active
              </Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={[styles.progressValue, { color: colors.textPrimary }]}>
                {totalGoals}
              </Text>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                Total
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { backgroundColor: colors.quaternary }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0}%`,
                    backgroundColor: colors.successGreen,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressPercentage, { color: colors.textSecondary }]}>
              {totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0}% Complete
            </Text>
          </View>
        </GlassCard>

        {/* Category Breakdown */}
        {Object.keys(categoryStats).length > 0 && (
          <GlassCard style={styles.categoryCard}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              Goal Categories
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
              Distribution of your goals
            </Text>
            
            <View style={styles.categoryList}>
              {Object.entries(categoryStats).map(([category, count]) => (
                <View key={category} style={styles.categoryItem}>
                  <View style={styles.categoryInfo}>
                    <Text style={[styles.categoryName, { color: colors.textPrimary }]}>
                      {category}
                    </Text>
                    <Text style={[styles.categoryCount, { color: colors.textSecondary }]}>
                      {count} {count === 1 ? 'goal' : 'goals'}
                    </Text>
                  </View>
                  <View style={styles.categoryProgress}>
                    <View style={[styles.categoryBar, { backgroundColor: colors.quaternary }]}>
                      <View
                        style={[
                          styles.categoryFill,
                          {
                            width: `${(count / totalGoals) * 100}%`,
                            backgroundColor: colors.electricBlue,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </GlassCard>
        )}

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <GlassCard style={styles.activityCard}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              Recent Activity
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
              Your latest check-ins
            </Text>
            
            <View style={styles.activityList}>
              {recentActivity.map((activity) => (
                <View key={activity.id} style={styles.activityItem}>
                  <View style={styles.activityInfo}>
                    <Text style={[styles.activityGoal, { color: colors.textPrimary }]}>
                      {activity.goalName}
                    </Text>
                    <Text style={[styles.activityDate, { color: colors.textSecondary }]}>
                      {new Date(activity.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.activityStatus}>
                    <Text style={styles.activityMood}>
                      {activity.mood === 'terrible' ? '😞' : 
                       activity.mood === 'bad' ? '😕' :
                       activity.mood === 'okay' ? '😐' :
                       activity.mood === 'good' ? '😊' : '😄'}
                    </Text>
                    <View style={[
                      styles.activityBadge,
                      { backgroundColor: activity.completed ? colors.successGreen : colors.warningAmber }
                    ]}>
                      <Text style={styles.activityBadgeText}>
                        {activity.completed ? 'Done' : 'Partial'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </GlassCard>
        )}

        {/* Motivational Quote */}
        <GlassCard style={styles.quoteCard}>
          <LinearGradient
            colors={colors.electricGradient}
            style={styles.quoteGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.quoteText}>
              "Success is the sum of small efforts repeated day in and day out."
            </Text>
            <Text style={styles.quoteAuthor}>
              - Robert Collier
            </Text>
          </LinearGradient>
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  summaryCards: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
  },
  progressHeader: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  progressItem: {
    alignItems: 'center',
  },
  progressValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  progressBarContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  categoryCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
  },
  categoryList: {
    marginTop: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  categoryProgress: {
    width: 80,
    marginLeft: 16,
  },
  categoryBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  categoryFill: {
    height: '100%',
    borderRadius: 2,
  },
  activityCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
  },
  activityList: {
    marginTop: 16,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityInfo: {
    flex: 1,
  },
  activityGoal: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  activityStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityMood: {
    fontSize: 20,
    marginRight: 8,
  },
  activityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activityBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
  },
  quoteCard: {
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 0,
    overflow: 'hidden',
  },
  quoteGradient: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quoteText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  quoteAuthor: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});