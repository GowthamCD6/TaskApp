import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
} from 'react-native';
import { User, Task } from '../../../types';
import { AddFacultyModal } from '../../../components/modals/AddFacultyModal';
import { useTheme } from '../../../context/ThemeContext';
import { Icon } from '../../../components/common/Icon';

interface FacultyDirectoryScreenProps {
  allFaculty: User[];
  allTasks: Task[];
  onAddFaculty: (facultyData: {
    name: string;
    email: string;
    department: string;
    title: string;
    avatar?: string;
  }) => void;
  onAssignTaskForFaculty?: (facultyId: string) => void;
}

export const FacultyDirectoryScreen: React.FC<FacultyDirectoryScreenProps> = ({
  allFaculty,
  allTasks,
  onAddFaculty,
  onAssignTaskForFaculty,
}) => {
  const { colors, isDark } = useTheme();
  const [selectedFaculty, setSelectedFaculty] = useState<User | null>(null);
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false);

  const getFacultyTaskStats = (facultyId: string) => {
    const facultyTasks = allTasks.filter(t => t.assignedTo === facultyId);
    const completed = facultyTasks.filter(t => t.status === 'completed').length;
    const pending = facultyTasks.length - completed;
    return { total: facultyTasks.length, completed, pending, tasks: facultyTasks };
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Banner */}
      <View style={[styles.headerCard, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
        <View style={styles.headerTitleRow}>
          <View style={[styles.headerIconBadge, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
            <Icon name="users" size={20} color={colors.primary} />
          </View>
          <View style={styles.flex1}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Faculty Directory & Credentials</Text>
            <Text style={[styles.headerSubtitle, { color: colors.subText }]}>
              Manage faculty credentials, registration IDs, passwords, and assigned workloads.
            </Text>
          </View>
        </View>

        {/* Primary Action Button */}
        <TouchableOpacity
          style={[styles.addFacultyBtn, { backgroundColor: colors.secondary }]}
          onPress={() => setAddModalVisible(true)}
          activeOpacity={0.85}
        >
          <View style={styles.btnRow}>
            <Icon name="plus" size={16} color="#FFFFFF" />
            <Text style={styles.addFacultyBtnText}>Add New Faculty Member</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Roster FlatList */}
      <FlatList
        data={allFaculty}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const stats = getFacultyTaskStats(item.id);
          const facultyRegNo = item.regNo || 'FAC-2026-101';
          const facultyPassword = item.password || '123456';

          return (
            <TouchableOpacity
              style={[styles.facultyCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              onPress={() => setSelectedFaculty(item)}
              activeOpacity={0.85}
            >
              {/* Profile Top Content (No Avatar & No Academic Title) */}
              <View style={styles.cardHeaderContent}>
                <View style={styles.facultyMetaInfo}>
                  <View style={styles.nameDeptRow}>
                    <Text style={[styles.facultyName, { color: colors.text }]}>{item.name}</Text>
                    <View style={[styles.deptPill, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                      <Text style={[styles.deptPillText, { color: colors.primary }]}>{item.department}</Text>
                    </View>
                  </View>

                  {/* Credentials Box: Reg No & Password */}
                  <View style={[styles.credentialsBox, { backgroundColor: colors.surface, borderColor: colors.inputBorder }]}>
                    <View style={styles.credentialItem}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Icon name="user" size={12} color={colors.primary} />
                        <Text style={[styles.credentialLabel, { color: colors.subText }]}> Faculty Reg. No:</Text>
                      </View>
                      <Text style={[styles.credentialValue, { color: colors.primary }]}>{facultyRegNo}</Text>
                    </View>

                    <View style={[styles.credentialDivider, { backgroundColor: colors.cardBorder }]} />

                    <View style={styles.credentialItem}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Icon name="lock" size={12} color="#F59E0B" />
                        <Text style={[styles.credentialLabel, { color: colors.subText }]}> Password:</Text>
                      </View>
                      <Text style={[styles.credentialValue, { color: colors.text }]}>{facultyPassword}</Text>
                    </View>
                  </View>

                  {/* Email Row */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                    <Icon name="mail" size={12} color={colors.subText} />
                    <Text style={[styles.emailText, { color: colors.subText }]} numberOfLines={1}>
                      {item.email}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Workload Metric Bar */}
              <View style={[styles.workloadBar, { backgroundColor: colors.surface }]}>
                <View style={styles.statPill}>
                  <Text style={[styles.statNumText, { color: colors.text }]}>{stats.total}</Text>
                  <Text style={[styles.statLabelText, { color: colors.subText }]}>Assigned</Text>
                </View>

                <View style={styles.statPill}>
                  <Text style={[styles.statNumText, styles.pendingColor]}>{stats.pending}</Text>
                  <Text style={[styles.statLabelText, { color: colors.subText }]}>Pending</Text>
                </View>

                <View style={styles.statPill}>
                  <Text style={[styles.statNumText, styles.completedColor]}>{stats.completed}</Text>
                  <Text style={[styles.statLabelText, { color: colors.subText }]}>Done</Text>
                </View>

                {/* Quick Action Button Group */}
                <View style={styles.actionBtnGroup}>
                  {onAssignTaskForFaculty ? (
                    <TouchableOpacity
                      style={[styles.quickAssignBtn, { backgroundColor: colors.primary }]}
                      onPress={() => onAssignTaskForFaculty(item.id)}
                      activeOpacity={0.8}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Icon name="plus" size={12} color="#FFFFFF" />
                        <Text style={styles.quickAssignBtnText}>Assign</Text>
                      </View>
                    </TouchableOpacity>
                  ) : null}

                  <TouchableOpacity
                    style={[styles.viewTasksBtn, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}
                    onPress={() => setSelectedFaculty(item)}
                    activeOpacity={0.8}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={[styles.viewTasksBtnText, { color: colors.text }]}>Schedule</Text>
                      <View style={{ marginLeft: 3 }}>
                        <Icon name="arrow-right" size={12} color={colors.text} />
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Add Faculty Modal */}
      <AddFacultyModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onAddFaculty={onAddFaculty}
      />

      {/* Faculty Schedule Modal */}
      {selectedFaculty && (
        <Modal
          visible={!!selectedFaculty}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedFaculty(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalCardContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.modalHeaderRow}>
                <View style={styles.flex1}>
                  <Text style={[styles.modalFacultyName, { color: colors.text }]}>{selectedFaculty.name}</Text>
                  <Text style={[styles.modalFacultyDept, { color: colors.subText }]}>
                    Reg. No: {selectedFaculty.regNo || 'FAC-2026-101'} • {selectedFaculty.department}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.modalCloseBtn, { backgroundColor: colors.surface }]}
                  onPress={() => setSelectedFaculty(null)}
                >
                  <Text style={[styles.closeIconText, { color: colors.subText }]}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.modalSectionHeading, { color: colors.primary }]}>
                Assigned Task History ({getFacultyTaskStats(selectedFaculty.id).total} Tasks)
              </Text>

              <FlatList
                data={getFacultyTaskStats(selectedFaculty.id).tasks}
                keyExtractor={t => t.id}
                style={styles.modalTaskFlatList}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <Text style={[styles.noTasksFoundText, { color: colors.mutedText }]}>
                    No tasks assigned to this faculty member yet.
                  </Text>
                }
                renderItem={({ item }) => {
                  const isDone = item.status === 'completed';
                  return (
                    <View style={[styles.modalTaskCardItem, { backgroundColor: colors.surface }]}>
                      <View style={styles.modalTaskHeaderRow}>
                        <Text style={[styles.modalTaskItemTitle, { color: colors.text }]}>{item.title}</Text>
                        <View
                          style={[
                            styles.modalTaskBadgePill,
                            isDone ? styles.doneBadgeBg : styles.pendingBadgeBg,
                          ]}
                        >
                          <Text
                            style={[
                              styles.modalTaskBadgeText,
                              isDone ? styles.completedColor : styles.pendingColor,
                            ]}
                          >
                            {isDone ? 'Completed' : 'Pending'}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.modalTaskDateText, { color: colors.mutedText }]}>
                        Scheduled: {item.date} ({item.startTime} - {item.endTime})
                      </Text>
                      {isDone && item.completionNote ? (
                        <View style={styles.modalRemarkContainer}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Icon name="clipboard" size={12} color="#10B981" />
                            <Text style={styles.modalRemarkHeading}>Faculty Completion Note:</Text>
                          </View>
                          <Text style={[styles.modalRemarkQuoteText, { color: colors.text }]}>
                            "{item.completionNote}"
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  );
                }}
              />

              <TouchableOpacity
                style={[styles.closeModalActionBtn, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}
                onPress={() => setSelectedFaculty(null)}
                activeOpacity={0.8}
              >
                <Text style={[styles.closeModalActionBtnText, { color: colors.text }]}>Close Schedule View</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  headerCard: {
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  addFacultyBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addFacultyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  facultyCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderContent: {
    marginBottom: 14,
  },
  facultyMetaInfo: {
    flex: 1,
  },
  nameDeptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  facultyName: {
    fontSize: 17,
    fontWeight: '800',
    flex: 1,
    marginRight: 8,
  },
  deptPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  deptPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  credentialsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 4,
  },
  credentialItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  credentialLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  credentialValue: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  credentialDivider: {
    width: 1,
    height: 18,
    marginHorizontal: 10,
  },
  emailText: {
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
  },
  workloadBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  statPill: {
    marginRight: 16,
  },
  statNumText: {
    fontSize: 16,
    fontWeight: '800',
  },
  pendingColor: {
    color: '#F59E0B',
  },
  completedColor: {
    color: '#10B981',
  },
  statLabelText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  actionBtnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  quickAssignBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    marginRight: 6,
  },
  quickAssignBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  viewTasksBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  viewTasksBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modalCardContainer: {
    borderRadius: 22,
    padding: 20,
    maxHeight: '80%',
    borderWidth: 1,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalFacultyName: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalFacultyDept: {
    fontSize: 12,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIconText: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalSectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalTaskFlatList: {
    maxHeight: 320,
  },
  noTasksFoundText: {
    fontSize: 13,
    fontStyle: 'italic',
    paddingVertical: 14,
    textAlign: 'center',
  },
  modalTaskCardItem: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  modalTaskHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTaskItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  modalTaskBadgePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  doneBadgeBg: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  pendingBadgeBg: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  modalTaskBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  modalTaskDateText: {
    fontSize: 11,
    marginTop: 4,
  },
  modalRemarkContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  modalRemarkHeading: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  modalRemarkQuoteText: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 2,
  },
  closeModalActionBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  closeModalActionBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
