import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useGoals, Goal } from '@/contexts/GoalContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/ui/GlassCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { Plus, Target, Calendar, X, Edit3, ArrowUp, ArrowDown, MoreVertical } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';

const GOAL_CATEGORIES = [
  'Fitness',
  'Learning',
  'Career',
  'Health',
  'Hobby',
  'Personal',
  'Other'
];

const QUICK_DEADLINES = [
  { label: 'Custom Date', days: null },
  { label: '30 Days', days: 30 },
  { label: '60 Days', days: 60 },
  { label: '90 Days', days: 90 },
  { label: '6 Months', days: 180 },
  { label: '1 Year', days: 365 },
];

export default function Goals() {
  const { colors } = useTheme();
  const { goals, addGoal, deleteGoal, setActiveGoal, activeGoal, updateGoal, reorderGoals } = useGoals();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedQuickDeadline, setSelectedQuickDeadline] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showGoalMenu, setShowGoalMenu] = useState<string | null>(null);
  
  // Form state
  const [goalName, setGoalName] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(GOAL_CATEGORIES[0]);
  const [selectedDeadline, setSelectedDeadline] = useState<Date>(new Date());
  const [dailyTarget, setDailyTarget] = useState('1');
  const [unit, setUnit] = useState('task');

  const resetForm = () => {
    setGoalName('');
    setGoalDescription('');
    setSelectedCategory(GOAL_CATEGORIES[0]);
    setSelectedDeadline(new Date());
    setDailyTarget('1');
    setUnit('task');
    setSelectedQuickDeadline(null);
  };

  const populateFormWithGoal = (goal: Goal) => {
    setGoalName(goal.name);
    setGoalDescription(goal.description || '');
    setSelectedCategory(goal.category);
    setSelectedDeadline(new Date(goal.deadline));
    setDailyTarget(goal.dailyTarget.toString());
    setUnit(goal.unit);
    setSelectedQuickDeadline(null);
  };

  const handleCreateGoal = () => {
    if (!goalName.trim()) {
      Alert.alert('Error', 'Please enter a goal name');
      return;
    }

    const now = new Date();
    const deadline = new Date(selectedDeadline);
    const totalDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (totalDays <= 0) {
      Alert.alert('Error', 'Please select a future date');
      return;
    }

    const newGoal: Omit<Goal, 'id' | 'createdAt'> = {
      name: goalName.trim(),
      description: goalDescription.trim(),
      category: selectedCategory,
      deadline,
      dailyTarget: parseInt(dailyTarget) || 1,
      unit,
      currentProgress: 0,
      totalDays,
      daysRemaining: totalDays,
      completedDays: 0,
      streak: 0,
      isCompleted: false,
      checkIns: [],
      priority: 0,
    };

    addGoal(newGoal);
    resetForm();
    setShowCreateModal(false);
  };

  const handleEditGoal = () => {
    if (!editingGoal || !goalName.trim()) {
      Alert.alert('Error', 'Please enter a goal name');
      return;
    }

    const now = new Date();
    const deadline = new Date(selectedDeadline);
    const totalDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (totalDays <= 0) {
      Alert.alert('Error', 'Please select a future date');
      return;
    }

    const updates: Partial<Goal> = {
      name: goalName.trim(),
      description: goalDescription.trim(),
      category: selectedCategory,
      deadline,
      dailyTarget: parseInt(dailyTarget) || 1,
      unit,
      totalDays,
      daysRemaining: totalDays,
    };

    updateGoal(editingGoal.id, updates);
    resetForm();
    setShowEditModal(false);
    setEditingGoal(null);
  };

  const handleQuickDeadline = (option: { label: string; days: number | null }) => {
    setSelectedQuickDeadline(option.label);
    
    if (option.days === null) {
      setShowDatePicker(true);
    } else {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + option.days);
      setSelectedDeadline(deadline);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDaysRemaining = (deadline: Date) => {
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getUrgencyColor = (daysRemaining: number, totalDays: number) => {
    const ratio = daysRemaining / totalDays;
    if (ratio > 0.3) return colors.electricBlue;
    if (ratio > 0.1) return colors.warningAmber;
    return colors.dangerRed;
  };

  const handleEditGoalPress = (goal: Goal) => {
    setEditingGoal(goal);
    populateFormWithGoal(goal);
    setShowGoalMenu(null);
    setShowEditModal(true);
  };

  const handleMovePriority = (goalId: string, direction: 'up' | 'down') => {
    const currentIndex = goals.findIndex(g => g.id === goalId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= goals.length) return;

    const reorderedGoals = [...goals];
    const [movedGoal] = reorderedGoals.splice(currentIndex, 1);
    reorderedGoals.splice(newIndex, 0, movedGoal);

    reorderGoals(reorderedGoals.map(g => g.id));
    setShowGoalMenu(null);
  };

  const renderGoalMenu = (goal: Goal, index: number) => {
    if (showGoalMenu !== goal.id) return null;

    return (
      <View style={[styles.goalMenu, { backgroundColor: colors.secondary, borderColor: colors.glass }]}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleEditGoalPress(goal)}
        >
          <Edit3 size={16} color={colors.textSecondary} />
          <Text style={[styles.menuText, { color: colors.textPrimary }]}>Edit Goal</Text>
        </TouchableOpacity>
        
        {index > 0 && (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMovePriority(goal.id, 'up')}
          >
            <ArrowUp size={16} color={colors.textSecondary} />
            <Text style={[styles.menuText, { color: colors.textPrimary }]}>Move Up</Text>
          </TouchableOpacity>
        )}
        
        {index < goals.length - 1 && (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMovePriority(goal.id, 'down')}
          >
            <ArrowDown size={16} color={colors.textSecondary} />
            <Text style={[styles.menuText, { color: colors.textPrimary }]}>Move Down</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            setShowGoalMenu(null);
            deleteGoal(goal.id);
          }}
        >
          <Text style={[styles.menuText, { color: colors.dangerRed }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderModal = (isEdit: boolean) => {
    const isVisible = isEdit ? showEditModal : showCreateModal;
    const onClose = () => isEdit ? setShowEditModal(false) : setShowCreateModal(false);
    const onSubmit = isEdit ? handleEditGoal : handleCreateGoal;
    const title = isEdit ? 'Edit Goal' : 'Create New Goal';
    const submitText = isEdit ? 'Save Changes' : 'Create Goal';

    return (
      <Modal
        visible={isVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalSafeArea}>
            <View style={[styles.modalContainer, { backgroundColor: colors.secondary }]}>
              {/* Modal Header */}
              <View style={[styles.modalHeader, { borderBottomColor: colors.glass }]}>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                  {title}
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  style={[styles.closeButton, { backgroundColor: colors.glass }]}
                >
                  <X size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Modal Content */}
              <ScrollView 
                style={styles.modalContent} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalContentContainer}
              >
                {/* Goal Name */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
                    Goal Name
                  </Text>
                  <TextInput
                    style={[styles.textInput, { 
                      backgroundColor: colors.tertiary,
                      borderColor: colors.glass,
                      color: colors.textPrimary
                    }]}
                    value={goalName}
                    onChangeText={setGoalName}
                    placeholder="e.g., Learn Spanish"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>

                {/* Description */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
                    Description (Optional)
                  </Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea, { 
                      backgroundColor: colors.tertiary,
                      borderColor: colors.glass,
                      color: colors.textPrimary
                    }]}
                    value={goalDescription}
                    onChangeText={setGoalDescription}
                    placeholder="Describe your goal..."
                    placeholderTextColor={colors.textTertiary}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>

                {/* Category */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
                    Category
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.categoryList}>
                      {GOAL_CATEGORIES.map((category) => (
                        <TouchableOpacity
                          key={category}
                          style={[
                            styles.categoryButton,
                            {
                              backgroundColor: selectedCategory === category 
                                ? colors.electricBlue 
                                : colors.glass,
                              borderColor: selectedCategory === category 
                                ? colors.electricBlue 
                                : colors.glass,
                            }
                          ]}
                          onPress={() => setSelectedCategory(category)}
                        >
                          <Text style={[
                            styles.categoryText,
                            {
                              color: selectedCategory === category 
                                ? '#FFFFFF' 
                                : colors.textSecondary
                            }
                          ]}>
                            {category}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                {/* Deadline */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
                    Set Your Deadline
                  </Text>
                  
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.quickDeadlines}>
                      {QUICK_DEADLINES.map((option) => (
                        <TouchableOpacity
                          key={option.label}
                          style={[
                            styles.quickButton, 
                            { 
                              backgroundColor: selectedQuickDeadline === option.label 
                                ? colors.electricBlue 
                                : colors.glass,
                              borderColor: selectedQuickDeadline === option.label 
                                ? colors.electricBlue 
                                : colors.glass,
                            }
                          ]}
                          onPress={() => handleQuickDeadline(option)}
                        >
                          <Text style={[
                            styles.quickButtonText, 
                            { 
                              color: selectedQuickDeadline === option.label 
                                ? '#FFFFFF' 
                                : colors.textSecondary 
                            }
                          ]}>
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>

                  <GlassCard style={styles.datePreview}>
                    <View style={styles.datePreviewContent}>
                      <Calendar size={20} color={colors.electricBlue} />
                      <Text style={[styles.datePreviewText, { color: colors.textPrimary }]}>
                        Goal ends on {formatDate(selectedDeadline)}
                      </Text>
                    </View>
                  </GlassCard>
                </View>

                {/* Daily Target */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
                    Daily Target
                  </Text>
                  <View style={styles.targetInput}>
                    <TextInput
                      style={[styles.textInput, styles.targetNumber, { 
                        backgroundColor: colors.tertiary,
                        borderColor: colors.glass,
                        color: colors.textPrimary
                      }]}
                      value={dailyTarget}
                      onChangeText={setDailyTarget}
                      placeholder="1"
                      placeholderTextColor={colors.textTertiary}
                      keyboardType="numeric"
                    />
                    <TextInput
                      style={[styles.textInput, styles.targetUnit, { 
                        backgroundColor: colors.tertiary,
                        borderColor: colors.glass,
                        color: colors.textPrimary
                      }]}
                      value={unit}
                      onChangeText={setUnit}
                      placeholder="tasks"
                      placeholderTextColor={colors.textTertiary}
                    />
                  </View>
                </View>
              </ScrollView>

              {/* Modal Actions */}
              <View style={[styles.modalActions, { borderTopColor: colors.glass }]}>
                <TouchableOpacity
                  style={[styles.cancelButton, { 
                    backgroundColor: colors.glass,
                    borderColor: colors.glass
                  }]}
                  onPress={onClose}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.textPrimary }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={onSubmit}
                >
                  <LinearGradient
                    colors={colors.electricGradient}
                    style={styles.createButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.createButtonText}>
                      {submitText}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </View>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDeadline}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setSelectedDeadline(selectedDate);
              }
            }}
            minimumDate={new Date()}
          />
        )}
      </Modal>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.primary }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Goals
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <LinearGradient
            colors={colors.electricGradient}
            style={styles.addButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Plus size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Goals List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {goals.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.glass }]}>
              <Target size={48} color={colors.textTertiary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              No Goals Yet
            </Text>
            <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
              Create your first goal to start tracking your progress and achieve your dreams
            </Text>
            <PremiumButton
              title="Create Your First Goal"
              onPress={() => setShowCreateModal(true)}
              size="medium"
              style={styles.emptyButton}
            />
          </View>
        ) : (
          goals.map((goal, index) => {
            const daysRemaining = getDaysRemaining(goal.deadline);
            const urgencyColor = getUrgencyColor(daysRemaining, goal.totalDays);
            const isActiveGoal = activeGoal?.id === goal.id;
            
            return (
              <View key={goal.id} style={styles.goalCardContainer}>
                <GlassCard style={[
                  styles.goalCard,
                  isActiveGoal && { borderColor: colors.electricBlue, borderWidth: 2 }
                ]}>
                  <View style={styles.goalHeader}>
                    <View style={styles.goalInfo}>
                      <View style={styles.goalTitleRow}>
                        <View style={[styles.priorityBadge, { backgroundColor: colors.electricBlue }]}>
                          <Text style={styles.priorityText}>#{index + 1}</Text>
                        </View>
                        <Text style={[styles.goalName, { color: colors.textPrimary }]}>
                          {goal.name}
                        </Text>
                      </View>
                      <Text style={[styles.goalCategory, { color: colors.textSecondary }]}>
                        {goal.category} • {formatDate(goal.deadline)}
                      </Text>
                    </View>
                    <View style={styles.goalHeaderActions}>
                      <View style={[styles.urgencyBadge, { backgroundColor: urgencyColor }]}>
                        <Text style={styles.urgencyText}>
                          {daysRemaining}d
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.menuButton, { backgroundColor: colors.glass }]}
                        onPress={() => setShowGoalMenu(showGoalMenu === goal.id ? null : goal.id)}
                      >
                        <MoreVertical size={16} color={colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {goal.description && (
                    <Text style={[styles.goalDescription, { color: colors.textSecondary }]}>
                      {goal.description}
                    </Text>
                  )}

                  <View style={styles.goalStats}>
                    <View style={styles.stat}>
                      <Text style={[styles.statValue, { color: colors.successGreen }]}>
                        {goal.completedDays}
                      </Text>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                        Days Done
                      </Text>
                    </View>
                    <View style={styles.stat}>
                      <Text style={[styles.statValue, { color: colors.dangerRed }]}>
                        {goal.streak}
                      </Text>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                        Streak
                      </Text>
                    </View>
                    <View style={styles.stat}>
                      <Text style={[styles.statValue, { color: colors.electricBlue }]}>
                        {Math.round((goal.completedDays / goal.totalDays) * 100)}%
                      </Text>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                        Progress
                      </Text>
                    </View>
                  </View>

                  <View style={styles.goalActions}>
                    <PremiumButton
                      title={isActiveGoal ? "Active Goal" : "Set Active"}
                      onPress={isActiveGoal ? () => {} : () => setActiveGoal(goal)}
                      disabled={isActiveGoal}
                      variant={isActiveGoal ? "secondary" : "primary"}
                      size="small"
                      style={styles.actionButton}
                    />
                  </View>
                </GlassCard>
                
                {renderGoalMenu(goal, index)}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Render Modals */}
      {renderModal(false)}
      {renderModal(true)}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 28,
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
    marginBottom: 32,
    lineHeight: 24,
  },
  emptyButton: {
    minWidth: 200,
  },
  goalCardContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  goalCard: {
    padding: 24,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
  goalName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    flex: 1,
  },
  goalCategory: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginLeft: 44,
  },
  goalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  urgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  urgencyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalDescription: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    marginBottom: 20,
    lineHeight: 22,
    marginLeft: 44,
  },
  goalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  goalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButton: {
    flex: 1,
    maxWidth: 200,
  },
  goalMenu: {
    position: 'absolute',
    top: 60,
    right: 20,
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 1000,
    minWidth: 160,
    borderWidth: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  menuText: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  modalSafeArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    minHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 28,
  },
  inputLabel: {
    fontSize: 17,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    marginBottom: 12,
  },
  textInput: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 20,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
  },
  textArea: {
    height: 100,
    paddingTop: 18,
    textAlignVertical: 'top',
  },
  categoryList: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1.5,
    marginRight: 12,
  },
  categoryText: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  quickDeadlines: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  quickButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1.5,
    marginRight: 12,
  },
  quickButtonText: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  datePreview: {
    marginTop: 16,
    padding: 18,
  },
  datePreviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  datePreviewText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginLeft: 12,
  },
  targetInput: {
    flexDirection: 'row',
    gap: 16,
  },
  targetNumber: {
    flex: 1,
    textAlign: 'center',
  },
  targetUnit: {
    flex: 2,
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderTopWidth: 1,
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 17,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
  },
  createButton: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 17,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});