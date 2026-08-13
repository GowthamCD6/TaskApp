import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ThemeMode = 'dark' | 'light';

export interface ThemeColors {
  background: string;
  card: string;
  cardBorder: string;
  surface: string;
  inputBg: string;
  inputBorder: string;
  text: string;
  subText: string;
  mutedText: string;
  primary: string;
  secondary: string;
  googleBtnBg: string;
  googleBtnText: string;
  googleBtnBorder: string;
  roleAdminBg: string;
  roleFacultyBg: string;
  shadowColor: string;
  headerBg: string;
  headerBorder: string;
  tabBarBg: string;
  tabBarBorder: string;
  accentGlow: string;
}

const darkColors: ThemeColors = {
  background: '#090D16',
  card: '#0F172A',
  cardBorder: '#1E293B',
  surface: '#1E293B',
  inputBg: '#1E293B',
  inputBorder: '#334155',
  text: '#F8FAFC',
  subText: '#94A3B8',
  mutedText: '#64748B',
  primary: '#6366F1',
  secondary: '#10B981',
  googleBtnBg: '#FFFFFF',
  googleBtnText: '#1F2937',
  googleBtnBorder: '#E2E8F0',
  roleAdminBg: '#6366F1',
  roleFacultyBg: '#10B981',
  shadowColor: '#000000',
  headerBg: '#0F172A',
  headerBorder: '#1E293B',
  tabBarBg: '#0F172A',
  tabBarBorder: '#1E293B',
  accentGlow: '#6366F122',
};

const lightColors: ThemeColors = {
  background: '#F1F5F9',
  card: '#FFFFFF',
  cardBorder: '#E2E8F0',
  surface: '#F8FAFC',
  inputBg: '#F8FAFC',
  inputBorder: '#CBD5E1',
  text: '#0F172A',
  subText: '#475569',
  mutedText: '#94A3B8',
  primary: '#4F46E5',
  secondary: '#059669',
  googleBtnBg: '#FFFFFF',
  googleBtnText: '#1F2937',
  googleBtnBorder: '#CBD5E1',
  roleAdminBg: '#4F46E5',
  roleFacultyBg: '#059669',
  shadowColor: '#64748B',
  headerBg: '#FFFFFF',
  headerBorder: '#E2E8F0',
  tabBarBg: '#FFFFFF',
  tabBarBorder: '#E2E8F0',
  accentGlow: '#4F46E515',
};

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  isDark: true,
  colors: darkColors,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>('dark');

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
  };

  const isDark = theme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, isDark, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
