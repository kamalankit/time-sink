import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { GlassCard } from './ui/GlassCard';

interface StatusCardProps {
  icon: string;
  value: string | number;
  label: string;
  color?: string;
  subtitle?: string;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  icon,
  value,
  label,
  color,
  subtitle,
}) => {
  const { colors } = useTheme();

  return (
    <GlassCard style={styles.card}>
      <View style={styles.content}>
        <Text style={[styles.icon, { color: color || colors.electricBlue }]}>
          {icon}
        </Text>
        <Text style={[styles.value, { color: colors.textPrimary }]}>
          {value}
        </Text>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {label}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.textTertiary }]}>
            {subtitle}
          </Text>
        )}
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 20,
    minHeight: 100,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
    marginBottom: 8,
  },
  value: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 2,
  },
});