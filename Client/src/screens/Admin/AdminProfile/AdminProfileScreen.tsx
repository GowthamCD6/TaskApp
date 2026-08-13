import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { User, Task } from '../../../types';
import { useTheme } from '../../../context/ThemeContext';
import { Icon } from '../../../components/common/Icon';

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

  // State for administrator details
  const [adminUser, setAdminUser] = useState<User>({
    id: 'admin-1',
    name: 'Dean James Wilson',
    email: 'admin.dean@university.edu',
    regNo: 'ADM-2026-001',
    role: 'admin',
    department: 'Academic Administration',
    avatar: '',
    title: 'Chief Academic Officer',
    phone: '+1 (555) 234-5678',
    officeHours: 'Mon - Fri, 09:00 AM - 05:00 PM',
  });

  // Modal State for Editing Profile Details
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(adminUser.name);
  const [editTitle, setEditTitle] = useState(adminUser.title);
  const [editPhone, setEditPhone] = useState(adminUser.phone || '');
  const [editHours, setEditHours] = useState(adminUser.officeHours || '');

  const initials = adminUser.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t.status === 'completed').length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleSaveProfile = () => {
    if (!editName.trim()) {
      Alert.alert('Required Field', 'Please enter your full name.');
      return;
    }
    setAdminUser(prev => ({
      ...prev,
      name: editName.trim(),
      title: editTitle.trim() || 'Chief Academic Officer',
      phone: editPhone.trim(),
      officeHours: editHours.trim(),
    }));
    setEditModalVisible(false);
    Alert.alert('Profile Updated', 'Administrator profile details updated successfully.');
  };

  const handleConfirmLogout = () => {
    Alert.alert(
      'Logout Administrator Session',
      'Are you sure you want to sign out of the Dean Administrative Portal?',
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Pinned Top Navigation Bar */}
      <View style={[styles.topHeader, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
        <View style={styles.headerLeftGroup}>
          <Icon name="shield" size={18} color={colors.primary} />
          <Text style={[styles.topHeaderTitle, { color: colors.text }]}>Administrator Console</Text>
        </View>

        <TouchableOpacity
          style={[styles.editProfileBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            setEditName(adminUser.name);
            setEditTitle(adminUser.title);
            setEditPhone(adminUser.phone || '');
            setEditHours(adminUser.officeHours || '');
            setEditModalVisible(true);
          }}
          activeOpacity={0.8}
        >
          <Icon name="edit" size={12} color="#FFFFFF" />
          <Text style={styles.editProfileBtnText}>Edit Profile</Text>
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
          <View style={[styles.coverAccent, { backgroundColor: colors.primary }]} />

          <View style={styles.heroBody}>
            {/* Avatar Circle */}
            <View style={styles.avatarWrapper}>
              <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
              <View style={[styles.statusIndicatorDot, { borderColor: colors.card }]} />
            </View>

            {/* Profile Info */}
            <Text style={[styles.userNameText, { color: colors.text }]}>{adminUser.name}</Text>
            
            <View style={styles.titleBadgeRow}>
              <View style={[styles.titleBadge, { backgroundColor: `${colors.primary}18` }]}>
                <Icon name="academic" size={12} color={colors.primary} />
                <Text style={[styles.titleBadgeText, { color: colors.primary }]}>{adminUser.title}</Text>
              </View>
              <View style={[styles.verifiedBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Icon name="check" size={10} color="#10B981" />
                <Text style={styles.verifiedText}>Verified Administrator</Text>
              </View>
            </View>

            <Text style={[styles.userDeptText, { color: colors.subText }]}>{adminUser.department}</Text>

            {/* Details Row Chips */}
            <View style={styles.heroActionRow}>
              <View style={[styles.heroActionChip, { backgroundColor: colors.surface }]}>
                <Icon name="mail" size={12} color={colors.subText} />
                <Text style={[styles.heroActionText, { color: colors.subText }]}>{adminUser.email}</Text>
              </View>

              <View style={[styles.heroActionChip, { backgroundColor: colors.surface }]}>
                <Icon name="shield" size={12} color={colors.primary} />
                <Text style={[styles.heroActionText, { color: colors.primary, fontWeight: '700' }]}>
                  {adminUser.regNo}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* SECTION 1: Metrics Overview */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Executive Metrics Overview</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={[styles.statIconBox, { backgroundColor: `${colors.primary}15` }]}>
              <Icon name="users" size={16} color={colors.primary} />
            </View>
            <Text style={[styles.statVal, { color: colors.text }]}>{allFaculty.length}</Text>
            <Text style={[styles.statSubText, { color: colors.subText }]}>Faculty Roster</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={[styles.statIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Icon name="clipboard" size={16} color="#F59E0B" />
            </View>
            <Text style={[styles.statVal, { color: '#F59E0B' }]}>{totalTasks}</Text>
            <Text style={[styles.statSubText, { color: colors.subText }]}>Tasks Managed</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={[styles.statIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Icon name="check" size={16} color="#10B981" />
            </View>
            <Text style={[styles.statVal, { color: '#10B981' }]}>{completionRate}%</Text>
            <Text style={[styles.statSubText, { color: colors.subText }]}>System Efficiency</Text>
          </View>
        </View>

        {/* SECTION 2: Official Contact & Office Details */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Administrative Contact & Office Details</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={[styles.infoRow, { borderBottomColor: colors.cardBorder }]}>
            <Text style={[styles.infoLabel, { color: colors.subText }]}>Official Designation</Text>
            <Text style={[styles.infoValText, { color: colors.primary }]}>{adminUser.title}</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: colors.cardBorder }]}>
            <Text style={[styles.infoLabel, { color: colors.subText }]}>Administrative Dept</Text>
            <Text style={[styles.infoValText, { color: colors.text }]}>{adminUser.department}</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: colors.cardBorder }]}>
            <Text style={[styles.infoLabel, { color: colors.subText }]}>Office Phone</Text>
            <Text style={[styles.infoValText, { color: colors.text }]}>{adminUser.phone}</Text>
          </View>

          <View style={styles.infoRowLast}>
            <Text style={[styles.infoLabel, { color: colors.subText }]}>Office Hours</Text>
            <Text style={[styles.infoValText, { color: colors.text }]}>{adminUser.officeHours}</Text>
          </View>
        </View>

        {/* SECTION 3: App Controls & Security Settings */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences & System Controls</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Appearance Switcher */}
          <TouchableOpacity
            style={[styles.settingRowItem, { borderBottomColor: colors.cardBorder }]}
            onPress={toggleTheme}
            activeOpacity={0.8}
          >
            <View style={styles.settingRowLeft}>
              <View style={[styles.settingIconBg, { backgroundColor: colors.surface }]}>
                <Icon name={isDark ? 'sun' : 'moon'} size={16} color={colors.primary} />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.settingItemTitle, { color: colors.text }]}>App Theme</Text>
                <Text style={[styles.settingItemSub, { color: colors.subText }]}>
                  Current Mode: {isDark ? 'Dark Theme' : 'Light Theme'}
                </Text>
              </View>
            </View>
            <View style={[styles.toggleBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.toggleBadgeText}>{isDark ? 'Switch Light' : 'Switch Dark'}</Text>
            </View>
          </TouchableOpacity>

          {/* Session Security */}
          <View style={[styles.settingRowItem, { borderBottomColor: colors.cardBorder }]}>
            <View style={styles.settingRowLeft}>
              <View style={[styles.settingIconBg, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                <Icon name="lock" size={16} color={colors.primary} />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.settingItemTitle, { color: colors.text }]}>Active Session Token</Text>
                <Text style={[styles.settingItemSub, { color: colors.subText }]}>
                  256-Bit Encrypted • Mobile Session Active
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
                  <Text style={styles.logoutItemTitle}>Sign Out Administrator Session</Text>
                  <Text style={[styles.settingItemSub, { color: colors.subText }]}>
                    Safely exit administrative portal session
                  </Text>
                </View>
              </View>
              <Icon name="arrow-right" size={14} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>

        {/* SECTION 4: Governance Details */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Governance & System Status</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={[styles.infoRow, { borderBottomColor: colors.cardBorder }]}>
            <Text style={[styles.infoLabel, { color: colors.subText }]}>Access Authority</Text>
            <View style={[styles.valueTag, { backgroundColor: `${colors.primary}15` }]}>
              <Text style={[styles.valueTagText, { color: colors.primary }]}>Master Administrator</Text>
            </View>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: colors.cardBorder }]}>
            <Text style={[styles.infoLabel, { color: colors.subText }]}>System Version</Text>
            <Text style={[styles.infoValText, { color: colors.text }]}>TaskAssign v1.0.0 Pro</Text>
          </View>

          <View style={styles.infoRowLast}>
            <Text style={[styles.infoLabel, { color: colors.subText }]}>Database Connection</Text>
            <Text style={[styles.infoValText, { color: '#10B981' }]}>● Online & Synchronized</Text>
          </View>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Admin Profile</Text>
              <TouchableOpacity
                style={[styles.closeBtn, { backgroundColor: colors.surface }]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={[styles.closeBtnText, { color: colors.subText }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.inputLabel, { color: colors.subText }]}>Full Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                value={editName}
                onChangeText={setEditName}
              />

              <Text style={[styles.inputLabel, { color: colors.subText }]}>Official Title / Designation</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                value={editTitle}
                onChangeText={setEditTitle}
              />

              <Text style={[styles.inputLabel, { color: colors.subText }]}>Office Contact Phone</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                value={editPhone}
                onChangeText={setEditPhone}
                keyboardType="phone-pad"
              />

              <Text style={[styles.inputLabel, { color: colors.subText }]}>Office Hours</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                value={editHours}
                onChangeText={setEditHours}
              />
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.cancelModalBtn, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={[styles.cancelModalBtnText, { color: colors.subText }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveModalBtn, { backgroundColor: colors.primary }]}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveModalBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  editProfileBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
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
  valueTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  valueTagText: {
    fontSize: 12,
    fontWeight: '700',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  modalContent: {
    borderRadius: 22,
    padding: 20,
    maxHeight: '85%',
    borderWidth: 1,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelModalBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveModalBtn: {
    flex: 1.5,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveModalBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
