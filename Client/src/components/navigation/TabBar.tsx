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
  const { colors } = useTheme();

  if (role === 'admin') {
    const adminTabs: { id: AdminTab; label: string; icon: IconName }[] = [
      { id: 'schedule', label: 'Timeline', icon: 'calendar' },
      { id: 'assign', label: 'Assign Task', icon: 'plus' },
      { id: 'directory', label: 'Faculty List', icon: 'users' },
      { id: 'analytics', label: 'Analytics', icon: 'analytics' },
      { id: 'profile', label: 'Admin Profile', icon: 'shield' },
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
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabItem}
              onPress={() => onSelectAdminTab(tab.id)}
              activeOpacity={0.8}
            >
              <View style={styles.iconWrapper}>
                <Icon
                  name={tab.icon}
                  size={18}
                  color={isActive ? activeColor : inactiveColor}
                />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive ? activeColor : inactiveColor,
                    fontWeight: isActive ? '700' : '600',
                  },
                ]}
              >
                {tab.label}
              </Text>
              {isActive && (
                <View style={[styles.activeDot, { backgroundColor: activeColor }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  const facultyTabs: { id: FacultyTab; label: string; icon: IconName }[] = [
    { id: 'schedule', label: 'My Schedule', icon: 'calendar' },
    { id: 'history', label: 'Task History', icon: 'clipboard' },
    { id: 'profile', label: 'My Profile', icon: 'user' },
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
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabItem}
            onPress={() => onSelectFacultyTab(tab.id)}
            activeOpacity={0.8}
          >
            <View style={styles.iconWrapper}>
              <Icon
                name={tab.icon}
                size={18}
                color={isActive ? activeColor : inactiveColor}
              />
            </View>
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isActive ? activeColor : inactiveColor,
                  fontWeight: isActive ? '700' : '600',
                },
              ]}
            >
              {tab.label}
            </Text>
            {isActive && (
              <View style={[styles.activeDot, { backgroundColor: activeColor }]} />
            )}
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
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconWrapper: {
    marginBottom: 3,
  },
  tabLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },
});
