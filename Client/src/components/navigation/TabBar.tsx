import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AdminTab, FacultyTab, UserRole } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { Icon, IconName } from '../common/Icon';

interface TabBarProps {
  role: UserRole;
  activeAdminTab: AdminTab;
  activeFacultyTab: FacultyTab;
  onSelectAdminTab: (tab: AdminTab) => void;
  onSelectFacultyTab: (tab: FacultyTab) => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  role,
  activeAdminTab,
  activeFacultyTab,
  onSelectAdminTab,
  onSelectFacultyTab,
}) => {
  const { colors, isDark } = useTheme();

  if (role === 'admin') {
    const adminTabs: { id: AdminTab; label: string; icon: IconName }[] = [
      { id: 'schedule', label: 'Timeline', icon: 'calendar' },
      { id: 'assign', label: 'Assign', icon: 'plus' },
      { id: 'directory', label: 'Faculty', icon: 'users' },
      { id: 'analytics', label: 'Metrics', icon: 'analytics' },
      { id: 'profile', label: 'Profile', icon: 'shield' },
    ];

    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.tabBarBg,
            borderTopColor: colors.tabBarBorder,
          },
        ]}
      >
        {adminTabs.map(tab => {
          const isActive = activeAdminTab === tab.id;
          const activeColor = colors.primary;
          const inactiveColor = colors.mutedText;
          const activePillBg = isDark
            ? 'rgba(99, 102, 241, 0.2)'
            : 'rgba(99, 102, 241, 0.12)';

          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabItem}
              onPress={() => onSelectAdminTab(tab.id)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.iconBox,
                  isActive && [styles.activeIconBox, { backgroundColor: activePillBg }],
                ]}
              >
                <Icon
                  name={tab.icon}
                  size={isActive ? 20 : 18}
                  color={isActive ? activeColor : inactiveColor}
                  strokeWidth={isActive ? 2.5 : 2.0}
                />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive ? activeColor : inactiveColor,
                    fontWeight: isActive ? '800' : '600',
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  const facultyTabs: { id: FacultyTab; label: string; icon: IconName }[] = [
    { id: 'schedule', label: 'Schedule', icon: 'calendar' },
    { id: 'history', label: 'History', icon: 'clipboard' },
    { id: 'profile', label: 'Profile', icon: 'user' },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.tabBarBg,
          borderTopColor: colors.tabBarBorder,
        },
      ]}
    >
      {facultyTabs.map(tab => {
        const isActive = activeFacultyTab === tab.id;
        const activeColor = colors.secondary;
        const inactiveColor = colors.mutedText;
        const activePillBg = isDark
          ? 'rgba(16, 185, 129, 0.2)'
          : 'rgba(16, 185, 129, 0.12)';

        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabItem}
            onPress={() => onSelectFacultyTab(tab.id)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.iconBox,
                isActive && [styles.activeIconBox, { backgroundColor: activePillBg }],
              ]}
            >
              <Icon
                name={tab.icon}
                size={isActive ? 20 : 18}
                color={isActive ? activeColor : inactiveColor}
                strokeWidth={isActive ? 2.5 : 2.0}
              />
            </View>
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isActive ? activeColor : inactiveColor,
                  fontWeight: isActive ? '800' : '600',
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  iconBox: {
    width: 38,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  activeIconBox: {
    width: 42,
    height: 28,
    borderRadius: 14,
  },
  tabLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
});
