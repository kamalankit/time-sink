import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  strength?: 'weak' | 'medium' | 'strong';
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  style, 
  strength = 'medium' 
}) => {
  const { colors } = useTheme();
  
  const getGlassStyle = () => {
    switch (strength) {
      case 'weak':
        return {
          backgroundColor: colors.glass,
          borderColor: colors.glass,
        };
      case 'strong':
        return {
          backgroundColor: colors.glassStrong,
          borderColor: colors.glassStrong,
        };
      default:
        return {
          backgroundColor: colors.glass,
          borderColor: colors.glass,
        };
    }
  };

  return (
    <View style={[styles.container, getGlassStyle(), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
});