import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  currentTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  colors: Colors;
}

interface Colors {
  // Backgrounds
  primary: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
  
  // Text
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textDisabled: string;
  
  // Accent
  electricBlue: string;
  purpleAccent: string;
  successGreen: string;
  dangerRed: string;
  warningAmber: string;
  
  // Glass
  glass: string;
  glassStrong: string;
  
  // Gradients
  primaryGradient: string[];
  electricGradient: string[];
  successGradient: string[];
  dangerGradient: string[];
}

const lightColors: Colors = {
  primary: '#FAFBFC',
  secondary: '#FFFFFF',
  tertiary: '#F7F9FC',
  quaternary: '#EDF2F7',
  
  textPrimary: '#1A202C',
  textSecondary: '#4A5568',
  textTertiary: '#718096',
  textDisabled: '#A0AEC0',
  
  electricBlue: '#3B82F6',
  purpleAccent: '#8B5CF6',
  successGreen: '#10B981',
  dangerRed: '#EF4444',
  warningAmber: '#F59E0B',
  
  glass: 'rgba(26, 32, 44, 0.06)',
  glassStrong: 'rgba(26, 32, 44, 0.12)',
  
  primaryGradient: ['#0A0E27', '#1E3A8A'],
  electricGradient: ['#3B82F6', '#8B5CF6'],
  successGradient: ['#10B981', '#34D399'],
  dangerGradient: ['#EF4444', '#F87171'],
};

const darkColors: Colors = {
  primary: '#0D1117',
  secondary: '#161B22',
  tertiary: '#21262D',
  quaternary: '#30363D',
  
  textPrimary: '#FFFFFF',
  textSecondary: '#D1D5DB',
  textTertiary: '#9CA3AF',
  textDisabled: '#6B7280',
  
  electricBlue: '#3B82F6',
  purpleAccent: '#8B5CF6',
  successGreen: '#10B981',
  dangerRed: '#EF4444',
  warningAmber: '#F59E0B',
  
  glass: 'rgba(255, 255, 255, 0.06)',
  glassStrong: 'rgba(255, 255, 255, 0.12)',
  
  primaryGradient: ['#0A0E27', '#1E3A8A'],
  electricGradient: ['#3B82F6', '#8B5CF6'],
  successGradient: ['#10B981', '#34D399'],
  dangerGradient: ['#EF4444', '#F87171'],
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemTheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>('auto');
  
  const currentTheme = theme === 'auto' ? (systemTheme || 'dark') : theme;
  const colors = currentTheme === 'dark' ? darkColors : lightColors;

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setThemeState(savedTheme as Theme);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      await AsyncStorage.setItem('theme', newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, currentTheme, setTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};