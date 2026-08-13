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
import { useTheme } from '../../context/ThemeContext';
import { Icon } from '../../components/common/Icon';

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
  const { colors } = useTheme();
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Calendar Strip */}
      <CalendarStrip selectedDate={selectedDate} onSelectDate={onSelectDate} />

      {/* Admin Action & Faculty Filter Header */}
      <View style={[styles.filterSection, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
        <View style={styles.facultyFilterRow}>
          <Text style={[styles.filterLabel, { color: colors.subText }]}>Faculty Schedule:</Text>
          <TouchableOpacity
            style={[styles.filterChip, { backgroundColor: colors.surface, borderColor: colors.inputBorder }]}
            onPress={() => {
              const facultyIds = ['all', ...allFaculty.map(f => f.id)];
              const currentIndex = facultyIds.indexOf(filterFacultyId);
              const nextIndex = (currentIndex + 1) % facultyIds.length;
              setFilterFacultyId(facultyIds[nextIndex]);
            }}
          >
            <Text style={[styles.filterChipText, { color: colors.primary }]}>
              {filterFacultyId === 'all'
                ? 'All Faculty Members'
                : allFaculty.find(f => f.id === filterFacultyId)?.name}
            </Text>
            <View style={{ marginLeft: 6 }}>
              <Icon name="refresh" size={12} color={colors.primary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Assign Task Button */}
        <TouchableOpacity
          style={[styles.assignBtn, { backgroundColor: colors.primary }]}
          onPress={handleAssignBtnClick}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="plus" size={16} color="#FFFFFF" />
            <Text style={styles.assignBtnText}> Assign Task to Faculty</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Overview Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }, styles.statTotalBorder]}>
          <Text style={[styles.statNumber, { color: colors.text }]}>{totalTasks}</Text>
          <Text style={[styles.statLabel, { color: colors.subText }]}>Total Scheduled</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }, styles.statPendingBorder]}>
          <Text style={[styles.statNumber, styles.textPending]}>{pendingTasks}</Text>
          <Text style={[styles.statLabel, { color: colors.subText }]}>Pending</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }, styles.statCompletedBorder]}>
          <Text style={[styles.statNumber, styles.textCompleted]}>{completedTasks}</Text>
          <Text style={[styles.statLabel, { color: colors.subText }]}>Completed</Text>
        </View>
      </View>

      {/* Tasks Timeline List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="calendar" size={36} color={colors.primary} />
            <Text style={[styles.emptyTitle, { color: colors.text, marginTop: 10 }]}>No Tasks Scheduled</Text>
            <Text style={[styles.emptySubtitle, { color: colors.subText }]}>
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
            <View style={[styles.taskCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={[styles.timeColumn, { borderRightColor: colors.cardBorder }]}>
                <Text style={[styles.timeText, { color: colors.text }]}>{item.startTime}</Text>
                <Text style={[styles.timeSubtext, { color: colors.mutedText }]}>to {item.endTime}</Text>
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
                  <Text style={[styles.taskTitle, { color: colors.text }]}>{item.title}</Text>
                  <View style={[styles.priorityTag, priorityStyle]}>
                    <Text style={[styles.priorityTagText, priorityTextStyle]}>
                      {item.priority}
                    </Text>
                  </View>
                </View>

                {item.description ? (
                  <Text style={[styles.taskDesc, { color: colors.subText }]}>{item.description}</Text>
                ) : null}

                <View style={styles.facultyRow}>
                  {faculty?.avatar ? (
                    <Image source={{ uri: faculty.avatar }} style={styles.avatar} />
                  ) : null}
                  <View>
                    <Text style={[styles.facultyName, { color: colors.text }]}>{item.assignedToName}</Text>
                    <Text style={[styles.facultyDept, { color: colors.subText }]}>{faculty?.department}</Text>
                  </View>
                </View>

                {/* Show Faculty Remark if Task Completed */}
                {isCompleted && item.completionNote ? (
                  <View style={styles.remarkBox}>
                    <Text style={styles.remarkHeader}>Faculty Completion Note:</Text>
                    <Text style={[styles.remarkText, { color: colors.text }]}>"{item.completionNote}"</Text>
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
  },
  filterSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  facultyFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginRight: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  assignBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
    padding: 12,
    borderRadius: 12,
    marginRight: 8,
    borderLeftWidth: 3,
    borderWidth: 1,
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
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
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
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  timeColumn: {
    width: 75,
    borderRightWidth: 1,
    paddingRight: 10,
    justifyContent: 'flex-start',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  timeSubtext: {
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
  },
  facultyName: {
    fontSize: 12,
    fontWeight: '600',
  },
  facultyDept: {
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
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
  },
});
