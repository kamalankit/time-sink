import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useGoals } from '@/contexts/GoalContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/ui/GlassCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { User, Moon, Sun, Bell, Star, Settings, CircleHelp as HelpCircle, Shield, Trash2, ChevronRight } from 'lucide-react-native';

export default function Profile() {
  const { colors, theme, setTheme } = useTheme();
  const { goals } = useGoals();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reminderEnabled, setReminderEnabled] = useState(true);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme);
  };

  const handleUpgradeToPremium = () => {
    Alert.alert(
      'Upgrade to Premium',
      'Unlock advanced features like unlimited goals, custom themes, and detailed analytics.',
      [
        { text: 'Maybe Later', style: 'cancel' },
        { text: 'Upgrade Now', onPress: () => {
          // Handle premium upgrade
          console.log('Upgrading to premium...');
        }}
      ]
    );
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your goals and progress. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          // Handle data deletion
          console.log('Deleting all data...');
        }}
      ]
    );
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun size={20} color={colors.textSecondary} />;
      case 'dark':
        return <Moon size={20} color={colors.textSecondary} />;
      default:
        return <Settings size={20} color={colors.textSecondary} />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      default:
        return 'Auto';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.primary }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Profile
          </Text>
        </View>

        {/* Profile Info */}
        <GlassCard style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={[styles.avatarContainer, { backgroundColor: colors.electricBlue }]}>
              <User size={32} color="#FFFFFF" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.textPrimary }]}>
                Goal Achiever
              </Text>
              <Text style={[styles.profileStats, { color: colors.textSecondary }]}>
                {goals.length} goals created
              </Text>
            </View>
            <TouchableOpacity style={styles.premiumBadge} onPress={handleUpgradeToPremium}>
              <Star size={16} color="#FFD700" />
              <Text style={styles.premiumText}>FREE</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* Premium Upgrade */}
        <GlassCard style={styles.premiumCard}>
          <View style={styles.premiumHeader}>
            <Star size={24} color="#FFD700" />
            <Text style={[styles.premiumTitle, { color: colors.textPrimary }]}>
              Upgrade to Premium
            </Text>
          </View>
          <Text style={[styles.premiumDescription, { color: colors.textSecondary }]}>
            Unlock unlimited goals, advanced analytics, custom themes, and more
          </Text>
          <View style={styles.premiumFeatures}>
            <Text style={[styles.premiumFeature, { color: colors.textSecondary }]}>
              ✓ Unlimited goals
            </Text>
            <Text style={[styles.premiumFeature, { color: colors.textSecondary }]}>
              ✓ Advanced analytics
            </Text>
            <Text style={[styles.premiumFeature, { color: colors.textSecondary }]}>
              ✓ Custom themes
            </Text>
            <Text style={[styles.premiumFeature, { color: colors.textSecondary }]}>
              ✓ Priority support
            </Text>
          </View>
          <PremiumButton
            title="Upgrade Now"
            onPress={handleUpgradeToPremium}
            style={styles.upgradeButton}
          />
        </GlassCard>

        {/* Settings */}
        <GlassCard style={styles.settingsCard}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Settings
          </Text>

          {/* Theme Setting */}
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              {getThemeIcon()}
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                Theme
              </Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                {getThemeLabel()}
              </Text>
              <View style={styles.themeButtons}>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    {
                      backgroundColor: theme === 'light' ? colors.electricBlue : colors.glass,
                    }
                  ]}
                  onPress={() => handleThemeChange('light')}
                >
                  <Sun size={16} color={theme === 'light' ? '#FFFFFF' : colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    {
                      backgroundColor: theme === 'dark' ? colors.electricBlue : colors.glass,
                    }
                  ]}
                  onPress={() => handleThemeChange('dark')}
                >
                  <Moon size={16} color={theme === 'dark' ? '#FFFFFF' : colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    {
                      backgroundColor: theme === 'auto' ? colors.electricBlue : colors.glass,
                    }
                  ]}
                  onPress={() => handleThemeChange('auto')}
                >
                  <Settings size={16} color={theme === 'auto' ? '#FFFFFF' : colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Notifications */}
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Bell size={20} color={colors.textSecondary} />
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                Notifications
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.quaternary, true: colors.electricBlue }}
              thumbColor={notificationsEnabled ? '#FFFFFF' : colors.textTertiary}
            />
          </View>

          {/* Daily Reminders */}
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Bell size={20} color={colors.textSecondary} />
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                Daily Reminders
              </Text>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              trackColor={{ false: colors.quaternary, true: colors.electricBlue }}
              thumbColor={reminderEnabled ? '#FFFFFF' : colors.textTertiary}
            />
          </View>
        </GlassCard>

        {/* Support */}
        <GlassCard style={styles.supportCard}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Support
          </Text>

          <TouchableOpacity style={styles.supportItem}>
            <HelpCircle size={20} color={colors.textSecondary} />
            <Text style={[styles.supportLabel, { color: colors.textPrimary }]}>
              Help & FAQ
            </Text>
            <ChevronRight size={16} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.supportItem}>
            <Shield size={20} color={colors.textSecondary} />
            <Text style={[styles.supportLabel, { color: colors.textPrimary }]}>
              Privacy Policy
            </Text>
            <ChevronRight size={16} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.supportItem}>
            <Settings size={20} color={colors.textSecondary} />
            <Text style={[styles.supportLabel, { color: colors.textPrimary }]}>
              Terms of Service
            </Text>
            <ChevronRight size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        </GlassCard>

        {/* Danger Zone */}
        <GlassCard style={styles.dangerCard}>
          <Text style={[styles.sectionTitle, { color: colors.dangerRed }]}>
            Danger Zone
          </Text>
          <TouchableOpacity style={styles.dangerItem} onPress={handleDeleteAllData}>
            <Trash2 size={20} color={colors.dangerRed} />
            <Text style={[styles.dangerLabel, { color: colors.dangerRed }]}>
              Delete All Data
            </Text>
          </TouchableOpacity>
        </GlassCard>

        {/* App Version */}
        <View style={styles.appVersion}>
          <Text style={[styles.versionText, { color: colors.textTertiary }]}>
            TimeSink v1.0.0
          </Text>
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  profileCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 4,
  },
  profileStats: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  premiumText: {
    color: '#FFD700',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    marginLeft: 4,
  },
  premiumCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  premiumTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginLeft: 8,
  },
  premiumDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginBottom: 16,
    lineHeight: 20,
  },
  premiumFeatures: {
    marginBottom: 20,
  },
  premiumFeature: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginBottom: 4,
  },
  upgradeButton: {
    marginTop: 8,
  },
  settingsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginLeft: 12,
  },
  settingRight: {
    alignItems: 'flex-end',
  },
  settingValue: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginBottom: 8,
  },
  themeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  supportLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
  },
  dangerCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dangerLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginLeft: 12,
  },
  appVersion: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
});