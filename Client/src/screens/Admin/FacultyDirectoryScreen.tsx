import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
} from 'react-native';
import { User, Task } from '../../types';
import { AddFacultyModal } from '../../components/modals/AddFacultyModal';

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
  const [selectedFaculty, setSelectedFaculty] = useState<User | null>(null);
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false);

  const getFacultyTaskStats = (facultyId: string) => {
    const facultyTasks = allTasks.filter(t => t.assignedTo === facultyId);
    const completed = facultyTasks.filter(t => t.status === 'completed').length;
    const pending = facultyTasks.length - completed;
    return { total: facultyTasks.length, completed, pending, tasks: facultyTasks };
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <View style={styles.headerTitleRow}>
          <View style={styles.flex1}>
            <Text style={styles.headerTitle}>Faculty Directory & Workload</Text>
            <Text style={styles.headerSubtitle}>
              Monitor academic workload, active assignments, and register new faculty members.
            </Text>
          </View>
        </View>

        {/* Add Faculty Action Button */}
        <TouchableOpacity
          style={styles.addFacultyBtn}
          onPress={() => setAddModalVisible(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.addFacultyBtnText}>+ Add New Faculty Member</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={allFaculty}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const stats = getFacultyTaskStats(item.id);
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => setSelectedFaculty(item)}
              activeOpacity={0.85}
            >
              <View style={styles.cardHeader}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                <View style={styles.facultyInfo}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.dept}>{item.department} • {item.title}</Text>
                  <Text style={styles.email}>
                    Reg. No: {item.regNo || 'FAC-2026-101'} • {item.email}
                  </Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{stats.total}</Text>
                  <Text style={styles.statLabel}>Assigned</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statNum, styles.pendingText]}>{stats.pending}</Text>
                  <Text style={styles.statLabel}>Pending</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statNum, styles.doneText]}>{stats.completed}</Text>
                  <Text style={styles.statLabel}>Done</Text>
                </View>
                
                <View style={styles.actionButtonGroup}>
                  {onAssignTaskForFaculty ? (
                    <TouchableOpacity
                      style={styles.quickAssignBtn}
                      onPress={() => onAssignTaskForFaculty(item.id)}
                    >
                      <Text style={styles.quickAssignBtnText}>+ Assign</Text>
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity
                    style={styles.viewScheduleBtn}
                    onPress={() => setSelectedFaculty(item)}
                  >
                    <Text style={styles.viewScheduleBtnText}>Tasks →</Text>
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
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Image source={{ uri: selectedFaculty.avatar }} style={styles.modalAvatar} />
                <View style={styles.flex1}>
                  <Text style={styles.modalName}>{selectedFaculty.name}</Text>
                  <Text style={styles.modalDept}>{selectedFaculty.department}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedFaculty(null)}>
                  <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSectionTitle}>
                Assigned Task History ({getFacultyTaskStats(selectedFaculty.id).total} Tasks):
              </Text>

              <FlatList
                data={getFacultyTaskStats(selectedFaculty.id).tasks}
                keyExtractor={t => t.id}
                style={styles.modalTaskList}
                ListEmptyComponent={
                  <Text style={styles.noTasksText}>No tasks assigned to this faculty member.</Text>
                }
                renderItem={({ item }) => {
                  const isDone = item.status === 'completed';
                  return (
                    <View style={styles.taskItem}>
                      <View style={styles.taskItemHeader}>
                        <Text style={styles.taskItemTitle}>{item.title}</Text>
                        <Text
                          style={[
                            styles.taskItemBadge,
                            isDone ? styles.doneBadge : styles.pendingBadge,
                          ]}
                        >
                          {isDone ? 'Completed' : 'Pending'}
                        </Text>
                      </View>
                      <Text style={styles.taskItemDate}>
                        Scheduled: {item.date} ({item.startTime} - {item.endTime})
                      </Text>
                      {isDone && item.completionNote ? (
                        <View style={styles.noteBox}>
                          <Text style={styles.noteTitle}>Faculty Remark:</Text>
                          <Text style={styles.noteText}>"{item.completionNote}"</Text>
                        </View>
                      ) : null}
                    </View>
                  );
                }}
              />

              <TouchableOpacity
                style={styles.closeModalBtn}
                onPress={() => setSelectedFaculty(null)}
              >
                <Text style={styles.closeModalBtnText}>Close Schedule</Text>
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
    backgroundColor: '#090D16',
  },
  headerBox: {
    backgroundColor: '#0F172A',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  addFacultyBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addFacultyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
    backgroundColor: '#334155',
  },
  facultyInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  dept: {
    fontSize: 12,
    color: '#38BDF8',
    marginTop: 2,
  },
  email: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 10,
  },
  statBox: {
    marginRight: 16,
  },
  statNum: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  pendingText: {
    color: '#F59E0B',
  },
  doneText: {
    color: '#10B981',
  },
  statLabel: {
    fontSize: 10,
    color: '#94A3B8',
  },
  actionButtonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  quickAssignBtn: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 6,
  },
  quickAssignBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  viewScheduleBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewScheduleBtnText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
  },
  flex1: {
    flex: 1,
  },
  modalName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  modalDept: {
    color: '#94A3B8',
    fontSize: 12,
  },
  closeIcon: {
    color: '#94A3B8',
    fontSize: 20,
    padding: 4,
  },
  modalSectionTitle: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
  },
  modalTaskList: {
    maxHeight: 300,
  },
  noTasksText: {
    color: '#64748B',
    fontSize: 13,
    fontStyle: 'italic',
    paddingVertical: 10,
  },
  taskItem: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  taskItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskItemTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  taskItemBadge: {
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  doneBadge: {
    backgroundColor: 'rgba(16,185,129,0.2)',
    color: '#10B981',
  },
  pendingBadge: {
    backgroundColor: 'rgba(245,158,11,0.2)',
    color: '#F59E0B',
  },
  taskItemDate: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
  },
  noteBox: {
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderRadius: 6,
    padding: 6,
    marginTop: 6,
  },
  noteTitle: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
  },
  noteText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontStyle: 'italic',
  },
  closeModalBtn: {
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  closeModalBtnText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
});
