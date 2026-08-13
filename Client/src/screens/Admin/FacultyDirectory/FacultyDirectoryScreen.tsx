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
import { EditFacultyModal } from '../../../components/modals/EditFacultyModal';
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
  onUpdateFaculty?: (updatedData: {
    id: string;
    name: string;
    email: string;
    department: string;
    regNo: string;
    password?: string;
  }) => void;
}

export const FacultyDirectoryScreen: React.FC<FacultyDirectoryScreenProps> = ({
  allFaculty,
  allTasks,
  onAddFaculty,
  onAssignTaskForFaculty,
  onUpdateFaculty,
}) => {
  const { colors, isDark } = useTheme();
  const [selectedFaculty, setSelectedFaculty] = useState<User | null>(null);
  const [editingFaculty, setEditingFaculty] = useState<User | null>(null);
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);

  const getFacultyTaskStats = (facultyId: string) => {
    const facultyTasks = allTasks.filter(t => t.assignedTo === facultyId);
    const completed = facultyTasks.filter(t => t.status === 'completed').length;
    const pending = facultyTasks.length - completed;
    return { total: facultyTasks.length, completed, pending, tasks: facultyTasks };
  };

  const handleOpenEdit = (faculty: User) => {
    setEditingFaculty(faculty);
    setEditModalVisible(true);
  };

  const handleSaveEdit = (updatedData: {
    id: string;
    name: string;
    email: string;
    department: string;
    regNo: string;
    password?: string;
  }) => {
    if (onUpdateFaculty) {
      onUpdateFaculty(updatedData);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Clean & Simple Header */}
      <View style={[styles.cleanHeader, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
        <View style={styles.headerLeftGroup}>
          <Icon name="users" size={18} color={colors.primary} />
          <Text style={[styles.cleanHeaderTitle, { color: colors.text }]}>Faculty Directory</Text>
        </View>

        <TouchableOpacity
          style={[styles.simpleAddBtn, { backgroundColor: colors.secondary }]}
          onPress={() => setAddModalVisible(true)}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="plus" size={14} color="#FFFFFF" />
            <Text style={styles.simpleAddBtnText}> Add Faculty</Text>
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
          const initials = item.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

          // Generate a consistent avatar color from the name
          const avatarColors = [
            ['#6366F1', '#818CF8'], // Indigo
            ['#8B5CF6', '#A78BFA'], // Violet
            ['#EC4899', '#F472B6'], // Pink
            ['#F59E0B', '#FBBF24'], // Amber
            ['#10B981', '#34D399'], // Emerald
            ['#3B82F6', '#60A5FA'], // Blue
            ['#EF4444', '#F87171'], // Red
            ['#14B8A6', '#2DD4BF'], // Teal
          ];
          const colorIndex = item.name.length % avatarColors.length;
          const [avatarBg] = avatarColors[colorIndex];

          const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

          return (
            <TouchableOpacity
              style={[styles.facultyCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              onPress={() => setSelectedFaculty(item)}
              activeOpacity={0.85}
            >
              {/* Accent strip at top */}
              <View style={[styles.accentStrip, { backgroundColor: avatarBg }]} />

              {/* Card Header Row with Avatar */}
              <View style={styles.cardHeaderRow}>
                {/* Avatar Circle */}
                <View style={styles.avatarContainer}>
                  <View style={[styles.avatarCircle, { backgroundColor: avatarBg }]}>
                    <Text style={styles.avatarInitials}>{initials}</Text>
                  </View>
                  {/* Online indicator dot */}
                  <View style={[styles.onlineDot, { borderColor: colors.card }]} />
                </View>

                <View style={styles.flex1}>
                  <View style={styles.nameDeptRow}>
                    <Text style={[styles.facultyName, { color: colors.text }]}>{item.name}</Text>
                    <View style={[styles.deptPill, { backgroundColor: `${avatarBg}18` }]}>
                      <Text style={[styles.deptPillText, { color: avatarBg }]}>{item.department}</Text>
                    </View>
                  </View>

                  {/* Title / Role */}
                  <Text style={[styles.facultyTitle, { color: colors.subText }]}>
                    {item.title || 'Faculty Member'}
                  </Text>

                  {/* Details Row: Reg No & Email */}
                  <View style={styles.detailsRow}>
                    <View style={styles.detailChip}>
                      <Icon name="user" size={10} color={avatarBg} />
                      <Text style={[styles.regNoVal, { color: avatarBg }]}>{facultyRegNo}</Text>
                    </View>

                    <View style={[styles.detailChip, { flex: 1 }]}>
                      <Icon name="mail" size={10} color={colors.subText} />
                      <Text style={[styles.emailText, { color: colors.subText }]} numberOfLines={1}>
                        {item.email}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Edit Button Icon */}
                <TouchableOpacity
                  style={[styles.editIconBtn, { backgroundColor: colors.surface, borderColor: colors.inputBorder }]}
                  onPress={() => handleOpenEdit(item)}
                  activeOpacity={0.8}
                >
                  <Icon name="edit" size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View style={[styles.cardDivider, { backgroundColor: colors.cardBorder }]} />

              {/* Workload Stats & Action Buttons Bar */}
              <View style={[styles.workloadBar, { backgroundColor: colors.surface }]}>
                <View style={styles.statPill}>
                  <View style={[styles.statIconBg, { backgroundColor: 'rgba(99, 102, 241, 0.12)' }]}>
                    <Icon name="clipboard" size={10} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={[styles.statNumText, { color: colors.text }]}>{stats.total}</Text>
                    <Text style={[styles.statLabelText, { color: colors.subText }]}>Assigned</Text>
                  </View>
                </View>

                <View style={styles.statPill}>
                  <View style={[styles.statIconBg, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
                    <Icon name="clock" size={10} color="#F59E0B" />
                  </View>
                  <View>
                    <Text style={[styles.statNumText, styles.pendingColor]}>{stats.pending}</Text>
                    <Text style={[styles.statLabelText, { color: colors.subText }]}>Pending</Text>
                  </View>
                </View>

                <View style={styles.statPill}>
                  <View style={[styles.statIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                    <Icon name="check" size={10} color="#10B981" />
                  </View>
                  <View>
                    <Text style={[styles.statNumText, styles.completedColor]}>{stats.completed}</Text>
                    <Text style={[styles.statLabelText, { color: colors.subText }]}>Done</Text>
                  </View>
                </View>

                {/* Completion Rate */}
                <View style={[styles.completionRatePill, { backgroundColor: `${completionRate >= 70 ? '#10B981' : completionRate >= 40 ? '#F59E0B' : '#EF4444'}15` }]}>
                  <Text style={[styles.completionRateText, { color: completionRate >= 70 ? '#10B981' : completionRate >= 40 ? '#F59E0B' : '#EF4444' }]}>
                    {completionRate}%
                  </Text>
                </View>
              </View>

              {/* Action Buttons Row */}
              <View style={styles.actionBtnRow}>
                {onAssignTaskForFaculty ? (
                  <TouchableOpacity
                    style={[styles.quickAssignBtn, { backgroundColor: avatarBg }]}
                    onPress={() => onAssignTaskForFaculty(item.id)}
                    activeOpacity={0.8}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Icon name="plus" size={12} color="#FFFFFF" />
                      <Text style={styles.quickAssignBtnText}>Assign Task</Text>
                    </View>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  style={[styles.viewTasksBtn, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}
                  onPress={() => setSelectedFaculty(item)}
                  activeOpacity={0.8}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="calendar" size={12} color={colors.text} />
                    <Text style={[styles.viewTasksBtnText, { color: colors.text }]}>View Schedule</Text>
                    <View style={{ marginLeft: 3 }}>
                      <Icon name="arrow-right" size={12} color={colors.text} />
                    </View>
                  </View>
                </TouchableOpacity>
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

      {/* Edit Faculty Modal */}
      <EditFacultyModal
        visible={editModalVisible}
        faculty={editingFaculty}
        onClose={() => {
          setEditModalVisible(false);
          setEditingFaculty(null);
        }}
        onSaveFaculty={handleSaveEdit}
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
  cleanHeader: {
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
  cleanHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 8,
  },
  simpleAddBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  simpleAddBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  facultyCard: {
    borderRadius: 18,
    padding: 0,
    marginBottom: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  accentStrip: {
    height: 4,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
  },
  nameDeptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 2,
  },
  facultyName: {
    fontSize: 16,
    fontWeight: '800',
    marginRight: 8,
  },
  facultyTitle: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
  },
  deptPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  deptPillText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  regNoVal: {
    fontSize: 11,
    fontWeight: '700',
  },
  emailText: {
    fontSize: 11,
  },
  editIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  cardDivider: {
    height: 1,
    marginHorizontal: 14,
    opacity: 0.5,
  },
  workloadBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginHorizontal: 14,
    marginTop: 10,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    gap: 6,
  },
  statIconBg: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumText: {
    fontSize: 14,
    fontWeight: '800',
  },
  pendingColor: {
    color: '#F59E0B',
  },
  completedColor: {
    color: '#10B981',
  },
  statLabelText: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 1,
  },
  completionRatePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  completionRateText: {
    fontSize: 12,
    fontWeight: '800',
  },
  actionBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
    gap: 8,
  },
  quickAssignBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAssignBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 5,
  },
  viewTasksBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewTasksBtnText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
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
