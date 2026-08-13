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
  const [modalVisible, setModalVisible] = useState(false);
  const isAdmin = currentUser?.role === 'admin';

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.brandTitle}>TaskAssign</Text>
          <Text style={styles.brandSubtitle}>Academic Schedule & Task Portal</Text>
        </View>

        <View style={styles.rightGroup}>
          <TouchableOpacity
            style={styles.roleBadge}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.roleDot,
                isAdmin ? styles.roleDotAdmin : styles.roleDotFaculty,
              ]}
            />
            <Text style={styles.roleText}>
              {isAdmin ? 'Admin Portal' : currentUser?.name || 'Faculty View'}
            </Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={onLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutBtnText}>Logout</Text>
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
          <View style={styles.modalContent}>
            <Text style={styles.modalHeaderTitle}>Active Persona & Faculty Switcher</Text>

            <View style={styles.activeUserInfo}>
              {currentUser?.avatar ? (
                <Image source={{ uri: currentUser.avatar }} style={styles.userAvatar} />
              ) : null}
              <View>
                <Text style={styles.userName}>{currentUser?.name}</Text>
                <Text style={styles.userRole}>
                  Role: <Text style={isAdmin ? styles.adminRoleText : styles.facultyRoleText}>
                    {isAdmin ? 'Administrator' : 'Faculty Member'}
                  </Text>
                </Text>
              </View>
            </View>

            <Text style={styles.sectionSubtitle}>Switch Faculty Account:</Text>
            <FlatList
              data={allFaculty}
              keyExtractor={item => item.id}
              renderItem={({ item }) => {
                const isSelected = currentUser?.id === item.id;
                return (
                  <TouchableOpacity
                    style={[
                      styles.facultyItem,
                      isSelected && styles.facultyItemSelected,
                    ]}
                    onPress={() => {
                      onFacultySwitch(item);
                      setModalVisible(false);
                    }}
                  >
                    <Image source={{ uri: item.avatar }} style={styles.facultyAvatar} />
                    <View style={styles.facultyInfo}>
                      <Text style={styles.facultyName}>{item.name}</Text>
                      <Text style={styles.facultyDept}>{item.department} • {item.title}</Text>
                    </View>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeBtnText}>Close</Text>
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
    backgroundColor: '#0F172A',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    marginRight: 8,
  },
  roleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  roleDotAdmin: {
    backgroundColor: '#6366F1',
  },
  roleDotFaculty: {
    backgroundColor: '#10B981',
  },
  adminRoleText: {
    color: '#6366F1',
    fontWeight: '700',
  },
  facultyRoleText: {
    color: '#10B981',
    fontWeight: '700',
  },
  roleText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  dropdownArrow: {
    color: '#94A3B8',
    fontSize: 9,
  },
  logoutBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  logoutBtnText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 14,
    textAlign: 'center',
  },
  activeUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  userAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
  },
  userName: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  userRole: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  sectionSubtitle: {
    color: '#94A3B8',
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
    backgroundColor: '#0F172A',
    borderRadius: 10,
    marginBottom: 8,
  },
  facultyItemSelected: {
    borderWidth: 1.5,
    borderColor: '#10B981',
  },
  facultyAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    backgroundColor: '#334155',
  },
  facultyInfo: {
    flex: 1,
  },
  facultyName: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  facultyDept: {
    color: '#94A3B8',
    fontSize: 12,
  },
  checkmark: {
    color: '#10B981',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 14,
  },
  closeBtn: {
    flex: 1,
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 8,
  },
  closeBtnText: {
    color: '#F8FAFC',
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
