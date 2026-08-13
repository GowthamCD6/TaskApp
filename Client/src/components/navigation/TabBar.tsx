import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AdminTab, FacultyTab, UserRole } from '../../types';

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
  if (role === 'admin') {
    const adminTabs: { id: AdminTab; label: string; icon: string }[] = [
      { id: 'schedule', label: 'Timeline', icon: '📅' },
      { id: 'assign', label: 'Assign Task', icon: '➕' },
      { id: 'directory', label: 'Faculty List', icon: '👥' },
      { id: 'analytics', label: 'Analytics', icon: '📊' },
    ];

    return (
      <View style={styles.container}>
        {adminTabs.map(tab => {
          const isActive = activeAdminTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabItem}
              onPress={() => onSelectAdminTab(tab.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text
                style={[
                  styles.tabLabel,
                  isActive ? styles.tabLabelActiveAdmin : styles.tabLabelInactive,
                ]}
              >
                {tab.label}
              </Text>
              {isActive && <View style={styles.activeDotAdmin} />}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  const facultyTabs: { id: FacultyTab; label: string; icon: string }[] = [
    { id: 'schedule', label: 'My Schedule', icon: '📅' },
    { id: 'history', label: 'Task History', icon: '📋' },
    { id: 'profile', label: 'My Profile', icon: '👤' },
  ];

  return (
    <View style={styles.container}>
      {facultyTabs.map(tab => {
        const isActive = activeFacultyTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabItem}
            onPress={() => onSelectFacultyTab(tab.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text
              style={[
                styles.tabLabel,
                isActive ? styles.tabLabelActiveFaculty : styles.tabLabelInactive,
              ]}
            >
              {tab.label}
            </Text>
            {isActive && <View style={styles.activeDotFaculty} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 3,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  tabLabelInactive: {
    color: '#64748B',
  },
  tabLabelActiveAdmin: {
    color: '#818CF8',
    fontWeight: '700',
  },
  tabLabelActiveFaculty: {
    color: '#34D399',
    fontWeight: '700',
  },
  activeDotAdmin: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6366F1',
    marginTop: 3,
  },
  activeDotFaculty: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#10B981',
    marginTop: 3,
  },
});
