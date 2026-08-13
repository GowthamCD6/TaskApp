import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { User, Task } from '../../../types';
import { useTheme } from '../../../context/ThemeContext';
import { Icon } from '../../../components/common/Icon';
import { updateUser } from '../../../services/api';

interface FacultyProfileScreenProps {
  currentFaculty: User | null;
  allTasks: Task[];
  onLogout?: () => void;
}

export const FacultyProfileScreen: React.FC<FacultyProfileScreenProps> = ({
  currentFaculty,
  allTasks,
  onLogout,
}) => {
  const { colors, isDark, toggleTheme } = useTheme();

  const handleToggleThemeMode = async () => {
    const nextTheme = isDark ? 'light' : 'dark';
    toggleTheme();
    if (currentFaculty?.id) {
      try {
        await updateUser(currentFaculty.id, { themeMode: nextTheme });
      } catch (err) {
        console.warn('Failed to persist theme to backend:', err);
      }
    }
  };

  if (!currentFaculty) return null;

  const initials = currentFaculty.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const facultyTasks = allTasks.filter(t => t.assignedTo === currentFaculty.id);
  const completedCount = facultyTasks.filter(t => t.status === 'completed').length;
  const pendingCount = facultyTasks.length - completedCount;
  const completionRate =
    facultyTasks.length > 0
      ? Math.round((completedCount / facultyTasks.length) * 100)
      : 0;

  const handleConfirmLogout = () => {
    Alert.alert(
      'Logout Account Session',
      'Are you sure you want to sign out of your Faculty Portal account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout Session',
          style: 'destructive',
          onPress: () => onLogout && onLogout(),
        },
      ]
    );
  };

  const handleCopyEmail = () => {
    Alert.alert('Faculty Contact Information', `Email: ${currentFaculty.email}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Pinned Top Header */}
      <View style={[styles.topHeader, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
        <View style={styles.headerLeftGroup}>
          <Icon name="user" size={18} color={colors.secondary} />
          <Text style={[styles.topHeaderTitle, { color: colors.text }]}>Faculty Portal Console</Text>
        </View>

        <TouchableOpacity
          style={[styles.quickThemeBtn, { backgroundColor: colors.surface, borderColor: colors.inputBorder }]}
          onPress={handleToggleThemeMode}
          activeOpacity={0.8}
        >
          <Icon name={isDark ? 'sun' : 'moon'} size={14} color={colors.secondary} />
          <Text style={[styles.quickThemeText, { color: colors.text }]}>
            {isDark ? 'Light' : 'Dark'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Executive Hero Banner Card */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <View style={[styles.coverAccent, { backgroundColor: colors.secondary }]} />

          <View style={styles.heroBody}>
            {/* Avatar Circle */}
            <View style={styles.avatarWrapper}>
              <View style={[styles.avatarCircle, { backgroundColor: colors.secondary }]}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
              <View style={[styles.statusIndicatorDot, { borderColor: colors.card }]} />
            </View>

            {/* Profile Info */}
            <Text style={[styles.userNameText, { color: colors.text }]}>{currentFaculty.name}</Text>

            <View style={styles.titleBadgeRow}>
              <View style={[styles.titleBadge, { backgroundColor: `${colors.secondary}18` }]}>
                <Icon name="academic" size={12} color={colors.secondary} />
                <Text style={[styles.titleBadgeText, { color: colors.secondary }]}>
                  {currentFaculty.title || 'Faculty Member'}
                </Text>
              </View>
              <View style={[styles.verifiedBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Icon name="check" size={10} color="#10B981" />
                <Text style={styles.verifiedText}>Active Duties</Text>
              </View>
            </View>

            <Text style={[styles.userDeptText, { color: colors.subText }]}>{currentFaculty.department}</Text>

            {/* Details Chips */}
            <View style={styles.heroActionRow}>
              <TouchableOpacity
                style={[styles.heroActionChip, { backgroundColor: colors.surface }]}
                onPress={handleCopyEmail}
                activeOpacity={0.8}
              >
                <Icon name="mail" size={12} color={colors.subText} />
                <Text style={[styles.heroActionText, { color: colors.subText }]}>{currentFaculty.email}</Text>
              </TouchableOpacity>

              <View style={[styles.heroActionChip, { backgroundColor: colors.surface }]}>
                <Icon name="user" size={12} color={colors.secondary} />
                <Text style={[styles.heroActionText, { color: colors.secondary, fontWeight: '700' }]}>
                  {currentFaculty.regNo || 'FAC-2026-101'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* SECTION 1: Workload Summary Cards */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Workload & Performance Summary</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={[styles.statIconBox, { backgroundColor: `${colors.primary}15` }]}>
              <Icon name="clipboard" size={16} color={colors.primary} />
            </View>
            <Text style={[styles.statVal, { color: colors.text }]}>{facultyTasks.length}</Text>
            <Text style={[styles.statSubText, { color: colors.subText }]}>Assigned Tasks</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={[styles.statIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Icon name="clock" size={16} color="#F59E0B" />
            </View>
            <Text style={[styles.statVal, { color: '#F59E0B' }]}>{pendingCount}</Text>
            <Text style={[styles.statSubText, { color: colors.subText }]}>Pending Duties</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={[styles.statIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Icon name="check" size={16} color="#10B981" />
            </View>
            <Text style={[styles.statVal, { color: '#10B981' }]}>{completedCount}</Text>
            <Text style={[styles.statSubText, { color: colors.subText }]}>Completed Tasks</Text>
          </View>
        </View>

        {/* SECTION 2: Progress Track Card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.progressHeaderRow}>
            <Text style={[styles.infoLabel, { color: colors.subText }]}>Overall Task Completion Rate</Text>
            <Text style={[styles.rateValText, { color: colors.secondary }]}>{completionRate}%</Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.surface }]}>
            <View style={[styles.progressFill, { width: `${completionRate}%`, backgroundColor: colors.secondary }]} />
          </View>
        </View>

        {/* SECTION 3: Departmental Information */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Departmental & System Details</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={[styles.infoRow, { borderBottomColor: colors.cardBorder }]}>
            <Text style={[styles.infoLabel, { color: colors.subText }]}>Role</Text>
            <Text style={[styles.infoValText, { color: colors.text }]}>Faculty Member</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: colors.cardBorder }]}>
            <Text style={[styles.infoLabel, { color: colors.subText }]}>Reg. No.</Text>
            <Text style={[styles.infoValText, { color: colors.secondary }]}>{currentFaculty.regNo || 'FAC-2026-101'}</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: colors.cardBorder }]}>
            <Text style={[styles.infoLabel, { color: colors.subText }]}>Department</Text>
            <Text style={[styles.infoValText, { color: colors.text }]}>{currentFaculty.department}</Text>
          </View>

          <View style={styles.infoRowLast}>
            <Text style={[styles.infoLabel, { color: colors.subText }]}>Duty Status</Text>
            <Text style={[styles.infoValText, styles.activeText]}>● Active Duties</Text>
          </View>
        </View>

        {/* SECTION 4: Preferences & Session */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Preferences & Session</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Theme Setting */}
          <TouchableOpacity
            style={[styles.settingRowItem, { borderBottomColor: colors.cardBorder }]}
            onPress={handleToggleThemeMode}
            activeOpacity={0.8}
          >
            <View style={styles.settingRowLeft}>
              <View style={[styles.settingIconBg, { backgroundColor: colors.surface }]}>
                <Icon name={isDark ? 'sun' : 'moon'} size={16} color={colors.secondary} />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.settingItemTitle, { color: colors.text }]}>Appearance Theme</Text>
                <Text style={[styles.settingItemSub, { color: colors.subText }]}>
                  Current Mode: {isDark ? 'Dark Mode' : 'Light Mode'}
                </Text>
              </View>
            </View>
            <View style={[styles.toggleBadge, { backgroundColor: colors.secondary }]}>
              <Text style={styles.toggleBadgeText}>{isDark ? 'Switch Light' : 'Switch Dark'}</Text>
            </View>
          </TouchableOpacity>

          {/* Active Session Token */}
          <View style={[styles.settingRowItem, { borderBottomColor: colors.cardBorder }]}>
            <View style={styles.settingRowLeft}>
              <View style={[styles.settingIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Icon name="lock" size={16} color="#10B981" />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.settingItemTitle, { color: colors.text }]}>Active Session Token</Text>
                <Text style={[styles.settingItemSub, { color: colors.subText }]}>
                  Encrypted • Mobile Session Active
                </Text>
              </View>
            </View>
          </View>

          {/* Logout Button */}
          {onLogout && (
            <TouchableOpacity
              style={styles.logoutRowItem}
              onPress={handleConfirmLogout}
              activeOpacity={0.85}
            >
              <View style={styles.settingRowLeft}>
                <View style={[styles.settingIconBg, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                  <Icon name="logout" size={16} color="#EF4444" />
                </View>
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.logoutItemTitle}>Sign Out Faculty Session</Text>
                  <Text style={[styles.settingItemSub, { color: colors.subText }]}>
                    Safely exit active portal session
                  </Text>
                </View>
              </View>
              <Icon name="arrow-right" size={14} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  quickThemeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  quickThemeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  heroCard: {
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
  },
  coverAccent: {
    height: 60,
    opacity: 0.85,
  },
  heroBody: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 18,
    marginTop: -36,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 1,
  },
  statusIndicatorDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    borderWidth: 3,
  },
  userNameText: {
    fontSize: 20,
    fontWeight: '800',
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    marginBottom: 4,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  titleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 5,
  },
  titleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  verifiedText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  userDeptText: {
    fontSize: 12,
    marginBottom: 12,
  },
  heroActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  heroActionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 5,
  },
  heroActionText: {
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statVal: {
    fontSize: 20,
    fontWeight: '800',
  },
  statSubText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  card: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  rateValText: {
    fontSize: 18,
    fontWeight: '800',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  infoRowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  infoValText: {
    fontSize: 13,
    fontWeight: '700',
  },
  activeText: {
    color: '#10B981',
    fontSize: 12,
  },
  settingRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  logoutRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingItemTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  logoutItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },
  settingItemSub: {
    fontSize: 11,
    marginTop: 2,
  },
  toggleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  toggleBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
