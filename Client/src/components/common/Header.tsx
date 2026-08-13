import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
} from 'react-native';
import { User } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { Icon } from './Icon';

interface HeaderProps {
  currentUser: User | null;
  allFaculty: User[];
  onFacultySwitch: (faculty: User) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  allFaculty,
  onFacultySwitch,
  onLogout,
}) => {
  const { isDark, colors, toggleTheme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const isAdmin = currentUser?.role === 'admin';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.headerBg,
          borderBottomColor: colors.headerBorder,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View>
          <Text style={[styles.brandTitle, { color: colors.text }]}>TaskAssign</Text>
          <Text style={[styles.brandSubtitle, { color: colors.subText }]}>
            Academic Schedule & Task Portal
          </Text>
        </View>

        <View style={styles.rightGroup}>
          {/* Theme Switcher Icon Button */}
          <TouchableOpacity
            style={[
              styles.iconBtn,
              {
                backgroundColor: colors.surface,
                borderColor: colors.inputBorder,
              },
            ]}
            onPress={toggleTheme}
            activeOpacity={0.8}
          >
            <Icon name={isDark ? 'sun' : 'moon'} size={16} color={colors.primary} />
          </TouchableOpacity>

          {/* Persona Switcher Badge */}
          <TouchableOpacity
            style={[
              styles.roleBadge,
              {
                backgroundColor: colors.surface,
                borderColor: colors.inputBorder,
              },
            ]}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.roleDot,
                {
                  backgroundColor: isAdmin ? colors.primary : colors.secondary,
                },
              ]}
            />
            <Text style={[styles.roleText, { color: colors.text }]}>
              {isAdmin ? 'Admin Portal' : currentUser?.name || 'Faculty View'}
            </Text>
            <Icon name="chevron-down" size={10} color={colors.subText} />
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity
            style={[
              styles.logoutBtn,
              {
                backgroundColor: isDark ? '#334155' : '#E2E8F0',
              },
            ]}
            onPress={onLogout}
            activeOpacity={0.8}
          >
            <Text style={[styles.logoutBtnText, { color: colors.text }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Switcher Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>
              Active Persona & Faculty Switcher
            </Text>

            <View
              style={[
                styles.activeUserInfo,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.inputBorder,
                },
              ]}
            >
              {currentUser?.avatar ? (
                <Image source={{ uri: currentUser.avatar }} style={styles.userAvatar} />
              ) : null}
              <View>
                <Text style={[styles.userName, { color: colors.text }]}>{currentUser?.name}</Text>
                <Text style={[styles.userRole, { color: colors.subText }]}>
                  Role:{' '}
                  <Text
                    style={{
                      color: isAdmin ? colors.primary : colors.secondary,
                      fontWeight: '700',
                    }}
                  >
                    {isAdmin ? 'Administrator' : 'Faculty Member'}
                  </Text>
                </Text>
              </View>
            </View>

            <Text style={[styles.sectionSubtitle, { color: colors.subText }]}>
              Switch Faculty Account:
            </Text>
            <FlatList
              data={allFaculty}
              keyExtractor={item => item.id}
              renderItem={({ item }) => {
                const isSelected = currentUser?.id === item.id;
                return (
                  <TouchableOpacity
                    style={[
                      styles.facultyItem,
                      {
                        backgroundColor: isSelected
                          ? isDark
                            ? '#112922'
                            : '#E6F4EA'
                          : colors.surface,
                        borderColor: isSelected ? colors.secondary : 'transparent',
                        borderWidth: isSelected ? 1.5 : 0,
                      },
                    ]}
                    onPress={() => {
                      onFacultySwitch(item);
                      setModalVisible(false);
                    }}
                  >
                    <Image source={{ uri: item.avatar }} style={styles.facultyAvatar} />
                    <View style={styles.facultyInfo}>
                      <Text style={[styles.facultyName, { color: colors.text }]}>{item.name}</Text>
                      <Text style={[styles.facultyDept, { color: colors.subText }]}>
                        {item.department} • {item.title}
                      </Text>
                    </View>
                    {isSelected && (
                      <Icon name="check" size={14} color={colors.secondary} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.closeBtn,
                  { backgroundColor: isDark ? '#334155' : '#CBD5E1' },
                ]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.closeBtnText, { color: colors.text }]}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.logoutModalBtn}
                onPress={() => {
                  setModalVisible(false);
                  onLogout();
                }}
              >
                <Text style={styles.logoutModalBtnText}>Logout Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 6,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 6,
  },
  roleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 6,
  },
  logoutBtn: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  logoutBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
    borderWidth: 1,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
    textAlign: 'center',
  },
  activeUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  userAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
  },
  userRole: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  facultyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  facultyAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  facultyInfo: {
    flex: 1,
  },
  facultyName: {
    fontSize: 14,
    fontWeight: '600',
  },
  facultyDept: {
    fontSize: 12,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 14,
  },
  closeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 8,
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  logoutModalBtn: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutModalBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
