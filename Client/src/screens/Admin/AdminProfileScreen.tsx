import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { User, Task } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { Icon } from '../../components/common/Icon';

interface AdminProfileScreenProps {
  allFaculty: User[];
  allTasks: Task[];
  onLogout?: () => void;
}

export const AdminProfileScreen: React.FC<AdminProfileScreenProps> = ({
  allFaculty,
  allTasks,
  onLogout,
}) => {
  const { colors, isDark, toggleTheme } = useTheme();

  const adminUser: User = {
    id: 'admin-1',
    name: 'Dean James Wilson',
    email: 'admin.dean@university.edu',
    regNo: 'ADM-2026-001',
    role: 'admin',
    department: 'Academic Administration',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    title: 'Chief Academic Officer',
  };

  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t.status === 'completed').length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleConfirmLogout = () => {
    Alert.alert('Logout Administrator Workspace', 'Are you sure you want to log out of the Admin Portal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => onLogout && onLogout(),
      },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Profile Header Card */}
      <View
        style={[
          styles.profileCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <Image source={{ uri: adminUser.avatar }} style={styles.avatar} />
        <Text style={[styles.name, { color: colors.text }]}>{adminUser.name}</Text>
        <Text style={[styles.title, { color: colors.primary }]}>{adminUser.title}</Text>
        <Text style={[styles.dept, { color: colors.subText }]}>{adminUser.department}</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <Icon name="mail" size={12} color={colors.subText} />
          <Text style={[styles.email, { color: colors.subText, marginLeft: 4 }]}>
            {adminUser.email}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
          <Icon name="shield" size={12} color={colors.primary} />
          <Text style={[styles.email, { color: colors.primary, fontWeight: '700', marginLeft: 4 }]}>
            Admin Reg ID: {adminUser.regNo}
          </Text>
        </View>
      </View>

      {/* System Settings & Theme / Logout Controls */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Administrator Preferences</Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        {/* App Theme Toggle Setting */}
        <TouchableOpacity
          style={[styles.settingRow, { borderBottomColor: colors.cardBorder }]}
          onPress={toggleTheme}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[styles.settingIconBox, { backgroundColor: colors.surface }]}>
              <Icon name={isDark ? 'sun' : 'moon'} size={16} color={colors.primary} />
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>App Theme Mode</Text>
              <Text style={[styles.settingSub, { color: colors.subText }]}>
                Current Mode: {isDark ? 'Dark Theme' : 'Light Theme'}
              </Text>
            </View>
          </View>
          <View style={[styles.themePill, { backgroundColor: colors.primary }]}>
            <Text style={styles.themePillText}>Toggle Theme</Text>
          </View>
        </TouchableOpacity>

        {/* Logout Setting */}
        {onLogout && (
          <TouchableOpacity
            style={styles.logoutSettingRow}
            onPress={handleConfirmLogout}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.settingIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                <Icon name="logout" size={16} color="#EF4444" />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.logoutTitle}>Logout Administrator Session</Text>
                <Text style={[styles.settingSub, { color: colors.subText }]}>
                  Safely sign out of Dean's Administrative Workspace
                </Text>
              </View>
            </View>
            <Icon name="arrow-right" size={14} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>

      {/* Portal System Metrics */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Portal Overview & Metrics</Text>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.statNum, { color: colors.text }]}>{allFaculty.length}</Text>
          <Text style={[styles.statLabel, { color: colors.subText }]}>Active Faculty</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.statNum, { color: colors.primary }]}>{totalTasks}</Text>
          <Text style={[styles.statLabel, { color: colors.subText }]}>Total Tasks</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.statNum, styles.doneText]}>{completionRate}%</Text>
          <Text style={[styles.statLabel, { color: colors.subText }]}>Completion Rate</Text>
        </View>
      </View>

      {/* System Details */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.cardHeader, { color: colors.subText }]}>System & Governance Details</Text>
        
        <View style={[styles.infoRow, { borderBottomColor: colors.cardBorder }]}>
          <Text style={[styles.infoKey, { color: colors.subText }]}>Access Level</Text>
          <Text style={[styles.infoVal, { color: colors.primary }]}>Master Administrator (Full Control)</Text>
        </View>

        <View style={[styles.infoRow, { borderBottomColor: colors.cardBorder }]}>
          <Text style={[styles.infoKey, { color: colors.subText }]}>Reg. ID</Text>
          <Text style={[styles.infoVal, { color: colors.text }]}>{adminUser.regNo}</Text>
        </View>

        <View style={[styles.infoRow, { borderBottomColor: colors.cardBorder }]}>
          <Text style={[styles.infoKey, { color: colors.subText }]}>System Version</Text>
          <Text style={[styles.infoVal, { color: colors.text }]}>TaskAssign v1.0.0 Pro</Text>
        </View>

        <View style={[styles.infoRow, { borderBottomColor: colors.cardBorder }]}>
          <Text style={[styles.infoKey, { color: colors.subText }]}>System Status</Text>
          <Text style={[styles.infoVal, styles.activeText]}>● Online & Synchronized</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  profileCard: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#6366F1',
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  dept: {
    fontSize: 13,
    marginTop: 2,
  },
  email: {
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  logoutSettingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  logoutTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },
  settingSub: {
    fontSize: 11,
    marginTop: 2,
  },
  themePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  themePillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    marginRight: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 22,
    fontWeight: '800',
  },
  doneText: {
    color: '#10B981',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  cardHeader: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  infoKey: {
    fontSize: 13,
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '600',
  },
  activeText: {
    color: '#10B981',
  },
});
