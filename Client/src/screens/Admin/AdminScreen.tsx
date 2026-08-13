import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { Task, User, Priority } from '../../types';
import { CalendarStrip } from '../../components/common/CalendarStrip';
import { AssignTaskModal } from '../../components/modals/AssignTaskModal';

interface AdminScreenProps {
  tasks: Task[];
  allFaculty: User[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onAssignTask: (taskData: {
    title: string;
    description: string;
    assignedTo: string;
    date: string;
    startTime: string;
    endTime: string;
    priority: Priority;
  }) => void;
  onNavigateToAssignScreen?: () => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({
  tasks,
  allFaculty,
  selectedDate,
  onSelectDate,
  onAssignTask,
  onNavigateToAssignScreen,
}) => {
  const [filterFacultyId, setFilterFacultyId] = useState<string>('all');
  const [assignModalVisible, setAssignModalVisible] = useState(false);

  // Filter tasks by selected date and faculty
  const filteredTasks = tasks.filter(t => {
    const matchesDate = t.date === selectedDate;
    const matchesFaculty = filterFacultyId === 'all' || t.assignedTo === filterFacultyId;
    return matchesDate && matchesFaculty;
  });

  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(t => t.status === 'completed').length;
  const pendingTasks = totalTasks - completedTasks;

  const handleAssignBtnClick = () => {
    if (onNavigateToAssignScreen) {
      onNavigateToAssignScreen();
    } else {
      setAssignModalVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      {/* Calendar Strip */}
      <CalendarStrip selectedDate={selectedDate} onSelectDate={onSelectDate} />

      {/* Admin Action & Faculty Filter Header */}
      <View style={styles.filterSection}>
        <View style={styles.facultyFilterRow}>
          <Text style={styles.filterLabel}>Faculty Schedule:</Text>
          <TouchableOpacity
            style={styles.filterChip}
            onPress={() => {
              const facultyIds = ['all', ...allFaculty.map(f => f.id)];
              const currentIndex = facultyIds.indexOf(filterFacultyId);
              const nextIndex = (currentIndex + 1) % facultyIds.length;
              setFilterFacultyId(facultyIds[nextIndex]);
            }}
          >
            <Text style={styles.filterChipText}>
              {filterFacultyId === 'all'
                ? 'All Faculty Members'
                : allFaculty.find(f => f.id === filterFacultyId)?.name}
            </Text>
            <Text style={styles.filterChipArrow}> 🔄</Text>
          </TouchableOpacity>
        </View>

        {/* Assign Task Button */}
        <TouchableOpacity
          style={styles.assignBtn}
          onPress={handleAssignBtnClick}
          activeOpacity={0.8}
        >
          <Text style={styles.assignBtnText}>+ Assign Task to Faculty</Text>
        </TouchableOpacity>
      </View>

      {/* Overview Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, styles.statTotalBorder]}>
          <Text style={styles.statNumber}>{totalTasks}</Text>
          <Text style={styles.statLabel}>Total Scheduled</Text>
        </View>
        <View style={[styles.statCard, styles.statPendingBorder]}>
          <Text style={[styles.statNumber, styles.textPending]}>{pendingTasks}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={[styles.statCard, styles.statCompletedBorder]}>
          <Text style={[styles.statNumber, styles.textCompleted]}>{completedTasks}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      {/* Tasks Timeline List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>No Tasks Scheduled</Text>
            <Text style={styles.emptySubtitle}>
              No tasks assigned on {selectedDate} for this selection. Tap above to assign a new task.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const faculty = allFaculty.find(f => f.id === item.assignedTo);
          const isCompleted = item.status === 'completed';

          let priorityStyle = styles.priorityMediumTag;
          let priorityTextStyle = styles.priorityMediumText;
          if (item.priority === 'High') {
            priorityStyle = styles.priorityHighTag;
            priorityTextStyle = styles.priorityHighText;
          } else if (item.priority === 'Low') {
            priorityStyle = styles.priorityLowTag;
            priorityTextStyle = styles.priorityLowText;
          }

          return (
            <View style={styles.taskCard}>
              <View style={styles.timeColumn}>
                <Text style={styles.timeText}>{item.startTime}</Text>
                <Text style={styles.timeSubtext}>to {item.endTime}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    isCompleted ? styles.statusDoneBg : styles.statusPendingBg,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      isCompleted ? styles.textCompleted : styles.textPending,
                    ]}
                  >
                    {isCompleted ? 'Done' : 'Pending'}
                  </Text>
                </View>
              </View>

              <View style={styles.cardContent}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.taskTitle}>{item.title}</Text>
                  <View style={[styles.priorityTag, priorityStyle]}>
                    <Text style={[styles.priorityTagText, priorityTextStyle]}>
                      {item.priority}
                    </Text>
                  </View>
                </View>

                {item.description ? (
                  <Text style={styles.taskDesc}>{item.description}</Text>
                ) : null}

                <View style={styles.facultyRow}>
                  {faculty?.avatar ? (
                    <Image source={{ uri: faculty.avatar }} style={styles.avatar} />
                  ) : null}
                  <View>
                    <Text style={styles.facultyName}>{item.assignedToName}</Text>
                    <Text style={styles.facultyDept}>{faculty?.department}</Text>
                  </View>
                </View>

                {/* Show Faculty Remark if Task Completed */}
                {isCompleted && item.completionNote ? (
                  <View style={styles.remarkBox}>
                    <Text style={styles.remarkHeader}>Faculty Completion Note:</Text>
                    <Text style={styles.remarkText}>"{item.completionNote}"</Text>
                  </View>
                ) : null}
              </View>
            </View>
          );
        }}
      />

      {/* Assign Task Modal */}
      <AssignTaskModal
        visible={assignModalVisible}
        allFaculty={allFaculty}
        defaultDate={selectedDate}
        onClose={() => setAssignModalVisible(false)}
        onSubmitTask={onAssignTask}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  filterSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  facultyFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  filterLabel: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    marginRight: 8,
  },
  filterChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChipText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '600',
  },
  filterChipArrow: {
    fontSize: 12,
  },
  assignBtn: {
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  assignBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 12,
    marginRight: 8,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  statTotalBorder: {
    borderLeftColor: '#6366F1',
  },
  statPendingBorder: {
    borderLeftColor: '#F59E0B',
  },
  statCompletedBorder: {
    borderLeftColor: '#10B981',
  },
  statNumber: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  textPending: {
    color: '#F59E0B',
  },
  textCompleted: {
    color: '#10B981',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  timeColumn: {
    width: 75,
    borderRightWidth: 1,
    borderRightColor: '#1E293B',
    paddingRight: 10,
    justifyContent: 'flex-start',
  },
  timeText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  timeSubtext: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  statusPendingBg: {
    backgroundColor: 'rgba(245,158,11,0.15)',
  },
  statusDoneBg: {
    backgroundColor: 'rgba(16,185,129,0.15)',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardContent: {
    flex: 1,
    paddingLeft: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  priorityTag: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityHighTag: {
    borderColor: '#EF4444',
  },
  priorityMediumTag: {
    borderColor: '#F59E0B',
  },
  priorityLowTag: {
    borderColor: '#3B82F6',
  },
  priorityTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  priorityHighText: {
    color: '#EF4444',
  },
  priorityMediumText: {
    color: '#F59E0B',
  },
  priorityLowText: {
    color: '#3B82F6',
  },
  taskDesc: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
  facultyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    marginRight: 8,
    backgroundColor: '#334155',
  },
  facultyName: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },
  facultyDept: {
    color: '#64748B',
    fontSize: 10,
  },
  remarkBox: {
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
    padding: 8,
    borderRadius: 6,
    marginTop: 10,
  },
  remarkHeader: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  remarkText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
  },
});
