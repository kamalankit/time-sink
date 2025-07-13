import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, FlatList, ViewToken } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useGoals } from '@/contexts/GoalContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Hourglass } from '@/components/Hourglass';
import { StatusCard } from '@/components/StatusCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { Settings, Plus, ChevronLeft, ChevronRight, Target, Calendar, TrendingUp, Award } from 'lucide-react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

function Dashboard() {
  // Add error boundary for hooks
  let themeContext;
  let goalsContext;
  
  try {
    themeContext = useTheme();
    goalsContext = useGoals();
  } catch (error) {
    console.error('Hook error:', error);
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Theme or Goals context not available. Please check your providers.
        </Text>
      </SafeAreaView>
    );
  }

  const { colors } = themeContext;
  const { activeGoal, goals, getTotalStats, setActiveGoal } = goalsContext;
  
  const [currentGoalIndex, setCurrentGoalIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);

  const stats = getTotalStats();

  // Update current goal index when goals change
  useEffect(() => {
    if (goals.length > 0 && currentGoalIndex >= goals.length) {
      setCurrentGoalIndex(0);
    }
  }, [goals.length, currentGoalIndex]);

  // Auto-update active goal when swiping
  useEffect(() => {
    if (goals.length > 0 && goals[currentGoalIndex]) {
      setActiveGoal(goals[currentGoalIndex]);
    }
  }, [currentGoalIndex, goals, setActiveGoal]);

  const getDaysRemaining = (goal: any) => {
    if (!goal) return 0;
    const now = new Date();
    const deadline = new Date(goal.deadline);
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const formatTimeRemaining = (goal: any) => {
    if (!goal) return 'No goals available';
    
    const daysRemaining = getDaysRemaining(goal);
    if (daysRemaining === 0) return 'Due today!';
    if (daysRemaining === 1) return '1 day remaining';
    return `${daysRemaining} days remaining`;
  };

  const getUrgencyStatus = (goal: any) => {
    if (!goal) return 'neutral';
    const daysRemaining = getDaysRemaining(goal);
    const progressRatio = goal.completedDays / goal.totalDays;
    
    if (goal.isCompleted) return 'completed';
    if (daysRemaining === 0) return 'critical';
    if (daysRemaining <= 3) return 'urgent';
    if (daysRemaining <= 7) return 'warning';
    if (progressRatio < 0.3 && daysRemaining <= 30) return 'attention';
    return 'normal';
  };

  const getUrgencyColor = (status: string) => {
    switch (status) {
      case 'completed': return colors.successGreen;
      case 'critical': return colors.dangerRed;
      case 'urgent': return colors.warningAmber;
      case 'warning': return colors.electricBlue;
      case 'attention': return colors.textSecondary;
      default: return colors.textTertiary;
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      if (index !== null && index !== currentGoalIndex) {
        setCurrentGoalIndex(index);
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const scrollToGoal = (index: number) => {
    if (flatListRef.current && index >= 0 && index < goals.length) {
      flatListRef.current.scrollToIndex({ index, animated: true });
    }
  };

  const renderGoalItem = ({ item: goal, index }: { item: any; index: number }) => {
    const inputRange = [
      (index - 1) * screenWidth,
      index * screenWidth,
      (index + 1) * screenWidth,
    ];

    const animatedStyle = useAnimatedStyle(() => {
      const scale = interpolate(
        scrollX.value,
        inputRange,
        [0.85, 1, 0.85],
        Extrapolate.CLAMP
      );

      const opacity = interpolate(
        scrollX.value,
        inputRange,
        [0.6, 1, 0.6],
        Extrapolate.CLAMP
      );

      return {
        transform: [{ scale }],
        opacity,
      };
    });

    return (
      <Animated.View style={[styles.goalSlide, { width: screenWidth }, animatedStyle]}>
        <View style={styles.goalContainer}>
          <Hourglass
            daysRemaining={getDaysRemaining(goal)}
            totalDays={goal.totalDays}
            size={260}
          />
          
          {/* Goal Progress Info */}
          <GlassCard style={styles.goalProgressCard}>
            <View style={styles.goalProgressHeader}>
              <View style={[styles.priorityBadge, { backgroundColor: colors.electricBlue }]}>
                <Text style={styles.priorityText}>#{index + 1}</Text>
              </View>
              <Text style={[styles.goalProgressTitle, { color: colors.textPrimary }]}>
                {goal.name}
              </Text>
            </View>
            
            <View style={styles.goalProgressStats}>
              <View style={styles.progressStat}>
                <Text style={[styles.progressStatValue, { color: colors.successGreen }]}>
                  {goal.completedDays}
                </Text>
                <Text style={[styles.progressStatLabel, { color: colors.textSecondary }]}>
                  Days Done
                </Text>
              </View>
              <View style={styles.progressStat}>
                <Text style={[styles.progressStatValue, { color: colors.electricBlue }]}>
                  {Math.round((goal.completedDays / goal.totalDays) * 100)}%
                </Text>
                <Text style={[styles.progressStatLabel, { color: colors.textSecondary }]}>
                  Complete
                </Text>
              </View>
              <View style={styles.progressStat}>
                <Text style={[styles.progressStatValue, { color: colors.dangerRed }]}>
                  {goal.streak}
                </Text>
                <Text style={[styles.progressStatLabel, { color: colors.textSecondary }]}>
                  Streak
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
                      width: `${Math.round((goal.completedDays / goal.totalDays) * 100)}%`,
                    },
                  ]}
                >
                  <LinearGradient
                    colors={colors.electricGradient}
                    style={styles.progressGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </View>
              </View>
            </View>

            {/* Urgency Indicator */}
            <View style={[
              styles.urgencyIndicator,
              { backgroundColor: getUrgencyColor(getUrgencyStatus(goal)) }
            ]}>
              <Text style={styles.urgencyText}>
                {getUrgencyStatus(goal).toUpperCase()}
              </Text>
            </View>
          </GlassCard>
        </View>
      </Animated.View>
    );
  };

  const renderPaginationDots = () => {
    if (goals.length <= 1) return null;

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: colors.glass }]}
          onPress={() => scrollToGoal(Math.max(0, currentGoalIndex - 1))}
          disabled={currentGoalIndex === 0}
        >
          <ChevronLeft 
            size={16} 
            color={currentGoalIndex === 0 ? colors.textTertiary : colors.textSecondary} 
          />
        </TouchableOpacity>

        <View style={styles.dotsContainer}>
          {goals.map((_, index) => {
            const isActive = index === currentGoalIndex;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => scrollToGoal(index)}
                style={[
                  styles.paginationDot,
                  {
                    backgroundColor: isActive ? colors.electricBlue : colors.textTertiary,
                    width: isActive ? 24 : 8,
                  }
                ]}
              />
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: colors.glass }]}
          onPress={() => scrollToGoal(Math.min(goals.length - 1, currentGoalIndex + 1))}
          disabled={currentGoalIndex === goals.length - 1}
        >
          <ChevronRight 
            size={16} 
            color={currentGoalIndex === goals.length - 1 ? colors.textTertiary : colors.textSecondary} 
          />
        </TouchableOpacity>
      </View>
    );
  };

  const currentGoal = goals[currentGoalIndex];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.primary }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Enhanced Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerInfo}>
              <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>
                Welcome back! 👋
              </Text>
              <Text style={[styles.goalName, { color: colors.textPrimary }]}>
                {currentGoal?.name || 'No Active Goals'}
              </Text>
              <View style={styles.timeContainer}>
                <Calendar size={16} color={colors.electricBlue} />
                <Text style={[styles.timeRemaining, { color: colors.textSecondary }]}>
                  {formatTimeRemaining(currentGoal)}
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.settingsButton, { backgroundColor: colors.glass }]}
              onPress={() => router.push('/profile')}
            >
              <Settings size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Goals Carousel or Empty State */}
        <View style={styles.hourglassContainer}>
          {goals.length > 0 ? (
            <>
              <FlatList
                ref={flatListRef}
                data={goals}
                renderItem={renderGoalItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                keyExtractor={(item) => item.id}
                style={styles.goalsList}
                onScroll={(event) => {
                  scrollX.value = event.nativeEvent.contentOffset.x;
                }}
                scrollEventThrottle={16}
                decelerationRate={0.8}
                snapToAlignment="center"
                snapToInterval={screenWidth}
              />
              {renderPaginationDots()}
            </>
          ) : (
            <View style={styles.noGoalContainer}>
              <GlassCard style={styles.emptyStateCard}>
                <View style={[styles.emptyIcon, { backgroundColor: colors.electricBlue + '20' }]}>
                  <Target size={48} color={colors.electricBlue} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                  Ready to Achieve?
                </Text>
                <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
                  Create your first goal and start your journey to success
                </Text>
                <PremiumButton
                  title="Create Your First Goal"
                  onPress={() => router.push('/goals')}
                  size="medium"
                  style={styles.emptyButton}
                />
              </GlassCard>
            </View>
          )}
        </View>

        {/* Enhanced Status Cards */}
        <View style={styles.statusSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Your Progress
          </Text>
          <View style={styles.statusCards}>
            <StatusCard
              icon="🔥"
              value={currentGoal?.streak || 0}
              label="Current Streak"
              color={colors.dangerRed}
              subtitle="days"
            />
            <StatusCard
              icon="✅"
              value={stats.completed}
              label="Goals Completed"
              color={colors.successGreen}
              subtitle="total"
            />
            <StatusCard
              icon="📈"
              value={`${Math.round(stats.successRate)}%`}
              label="Success Rate"
              color={colors.electricBlue}
              subtitle="overall"
            />
          </View>
        </View>

        {/* Quick Actions */}
        {currentGoal && (
          <View style={styles.quickActionsSection}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Quick Actions
            </Text>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={[styles.quickActionCard, { backgroundColor: colors.glass }]}
                onPress={() => router.push(`/checkin?goalId=${currentGoal.id}`)}
              >
                <LinearGradient
                  colors={[colors.electricBlue + '20', colors.electricBlue + '10']}
                  style={styles.quickActionGradient}
                >
                  <TrendingUp size={24} color={colors.electricBlue} />
                  <Text style={[styles.quickActionTitle, { color: colors.textPrimary }]}>
                    Log Progress
                  </Text>
                  <Text style={[styles.quickActionSubtitle, { color: colors.textSecondary }]}>
                    Track today's work
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickActionCard, { backgroundColor: colors.glass }]}
                onPress={() => router.push('/goals')}
              >
                <LinearGradient
                  colors={[colors.successGreen + '20', colors.successGreen + '10']}
                  style={styles.quickActionGradient}
                >
                  <Award size={24} color={colors.successGreen} />
                  <Text style={[styles.quickActionTitle, { color: colors.textPrimary }]}>
                    Manage Goals
                  </Text>
                  <Text style={[styles.quickActionSubtitle, { color: colors.textSecondary }]}>
                    View all goals
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Add Goal Section */}
        <View style={styles.addGoalSection}>
          <TouchableOpacity
            style={[styles.addGoalButton, { backgroundColor: colors.glass }]}
            onPress={() => router.push('/goals')}
          >
            <Plus size={24} color={colors.electricBlue} />
            <Text style={[styles.addGoalText, { color: colors.textPrimary }]}>
              Add New Goal
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Wrap the component with error boundaries
export default function DashboardWrapper() {
  return <Dashboard />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  errorText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginBottom: 4,
  },
  goalName: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 34,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeRemaining: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hourglassContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    minHeight: 500,
    justifyContent: 'center',
  },
  goalsList: {
    height: 480,
  },
  goalSlide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  goalContainer: {
    alignItems: 'center',
    width: '100%',
  },
  goalProgressCard: {
    marginTop: 30,
    padding: 20,
    width: '100%',
    maxWidth: 320,
  },
  goalProgressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
  },
  goalProgressTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    flex: 1,
  },
  goalProgressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  progressStat: {
    alignItems: 'center',
    flex: 1,
  },
  progressStatValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 4,
  },
  progressStatLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    minWidth: 8,
  },
  progressGradient: {
    flex: 1,
    borderRadius: 4,
  },
  urgencyIndicator: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  urgencyText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    gap: 8,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    transition: 'all 0.3s ease',
  },
  noGoalContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateCard: {
    padding: 40,
    alignItems: 'center',
    maxWidth: 320,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  emptyButton: {
    minWidth: 200,
  },
  statusSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 16,
  },
  statusCards: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: 20,
    alignItems: 'center',
  },
  quickActionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  addGoalSection: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  addGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 8,
  },
  addGoalText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
});