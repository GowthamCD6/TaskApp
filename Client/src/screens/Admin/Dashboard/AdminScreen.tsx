import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Task, User, Priority } from '../../../types';
import { CalendarStrip } from '../../../components/common/CalendarStrip';
import { AssignTaskModal } from '../../../components/modals/AssignTaskModal';
import { useTheme } from '../../../context/ThemeContext';
import { Icon } from '../../../components/common/Icon';

interface AdminScreenProps {
  tasks: Task[];
  allFaculty: User[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onAssignTask: (taskData: {
    title: string;
    description: string;
    assignedTo: string | string[];
    date: string;
    startTime: string;
    endTime: string;
    priority: Priority;
  }) => void;
  onNavigateToAssignScreen?: () => void;
  onLogout?: () => void;
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
      {/* Date Navigation Calendar Strip */}
      <CalendarStrip selectedDate={selectedDate} onSelectDate={onSelectDate} />

      {/* Filter & Primary Action Header */}
      <View style={[styles.actionHeader, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
        <View style={styles.filterRow}>
          <View style={styles.filterTitleGroup}>
            <Icon name="users" size={14} color={colors.primary} />
            <Text style={[styles.filterLabel, { color: colors.subText }]}>Schedule Filter:</Text>
          </View>

          <TouchableOpacity
            style={[styles.filterDropdown, { backgroundColor: colors.surface, borderColor: colors.inputBorder }]}
            onPress={() => {
              const facultyIds = ['all', ...allFaculty.map(f => f.id)];
              const currentIndex = facultyIds.indexOf(filterFacultyId);
              const nextIndex = (currentIndex + 1) % facultyIds.length;
              setFilterFacultyId(facultyIds[nextIndex]);
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterDropdownText, { color: colors.primary }]} numberOfLines={1}>
              {filterFacultyId === 'all'
                ? 'All Faculty Members'
                : allFaculty.find(f => f.id === filterFacultyId)?.name}
            </Text>
            <View style={{ marginLeft: 6 }}>
              <Icon name="refresh" size={12} color={colors.primary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Primary CTA: Assign Task */}
        <TouchableOpacity
          style={[styles.assignTaskBtn, { backgroundColor: colors.primary }]}
          onPress={handleAssignBtnClick}
          activeOpacity={0.85}
        >
          <View style={styles.btnContentRow}>
            <Icon name="plus" size={16} color="#FFFFFF" />
            <Text style={styles.assignTaskBtnText}>Assign New Faculty Task</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Overview Stat Metrics Cards */}
      <View style={styles.metricsGrid}>
        <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }, styles.totalMetricBorder]}>
          <View style={styles.metricHeader}>
            <View style={[styles.iconBadge, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
              <Icon name="calendar" size={14} color={colors.primary} />
            </View>
            <Text style={[styles.metricNumber, { color: colors.text }]}>{totalTasks}</Text>
          </View>
          <Text style={[styles.metricLabel, { color: colors.subText }]}>Total Scheduled</Text>
        </View>

        <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }, styles.pendingMetricBorder]}>
          <View style={styles.metricHeader}>
            <View style={[styles.iconBadge, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Icon name="clock" size={14} color="#F59E0B" />
            </View>
            <Text style={[styles.metricNumber, styles.pendingColor]}>{pendingTasks}</Text>
          </View>
          <Text style={[styles.metricLabel, { color: colors.subText }]}>Pending Action</Text>
        </View>

        <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }, styles.completedMetricBorder]}>
          <View style={styles.metricHeader}>
            <View style={[styles.iconBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Icon name="check" size={14} color="#10B981" />
            </View>
            <Text style={[styles.metricNumber, styles.completedColor]}>{completedTasks}</Text>
          </View>
          <Text style={[styles.metricLabel, { color: colors.subText }]}>Completed</Text>
        </View>
      </View>

      {/* Task Schedule Timeline */}
      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconBox, { backgroundColor: colors.surface }]}>
              <Icon name="calendar" size={38} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitleText, { color: colors.text }]}>No Tasks Scheduled</Text>
            <Text style={[styles.emptySubtitleText, { color: colors.subText }]}>
              No active tasks found for {selectedDate}. Tap above to assign a new academic duty.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const faculty = allFaculty.find(f => f.id === item.assignedTo);
          const isCompleted = item.status === 'completed';

          // Avatar initials and color
          const facultyName = item.assignedToName || faculty?.name || 'Unknown';
          const initials = facultyName
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

          const avatarColors = [
            '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B',
            '#10B981', '#3B82F6', '#EF4444', '#14B8A6',
          ];
          const avatarBg = avatarColors[facultyName.length % avatarColors.length];

          let priorityStyle = styles.priorityMediumTag;
          let priorityTextStyle = styles.priorityMediumText;
          let priorityIcon: 'alert' | 'clock' | 'check' = 'clock';
          if (item.priority === 'High') {
            priorityStyle = styles.priorityHighTag;
            priorityTextStyle = styles.priorityHighText;
            priorityIcon = 'alert';
          } else if (item.priority === 'Low') {
            priorityStyle = styles.priorityLowTag;
            priorityTextStyle = styles.priorityLowText;
            priorityIcon = 'check';
          }

          return (
            <View
              style={[
                styles.taskCardItem,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
                isCompleted ? styles.taskCardCompletedBorder : styles.taskCardPendingBorder,
              ]}
            >
              {/* Time Column */}
              <View style={[styles.timeColumnBox, { borderRightColor: colors.cardBorder }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="clock" size={12} color={colors.text} />
                  <Text style={[styles.startTimeText, { color: colors.text }]}>{item.startTime}</Text>
                </View>
                <Text style={[styles.endTimeText, { color: colors.mutedText }]}>to {item.endTime}</Text>
                
                <View
                  style={[
                    styles.statusPill,
                    isCompleted ? styles.statusDonePillBg : styles.statusPendingPillBg,
                  ]}
                >
                  <Icon name={isCompleted ? 'check' : 'clock'} size={8} color={isCompleted ? '#10B981' : '#F59E0B'} />
                  <Text
                    style={[
                      styles.statusPillText,
                      isCompleted ? styles.completedColor : styles.pendingColor,
                    ]}
                  >
                    {isCompleted ? 'Done' : 'Pending'}
                  </Text>
                </View>
              </View>

              {/* Task Details Content */}
              <View style={styles.taskDetailContent}>
                <View style={styles.cardHeaderRow}>
                  <Text style={[styles.taskTitleText, { color: colors.text }]}>{item.title}</Text>
                  <View style={[styles.priorityBadge, priorityStyle]}>
                    <Icon name={priorityIcon} size={8} color={priorityTextStyle.color} />
                    <Text style={[styles.priorityBadgeText, priorityTextStyle]}>
                      {item.priority}
                    </Text>
                  </View>
                </View>

                {item.description ? (
                  <Text style={[styles.taskDescText, { color: colors.subText }]}>{item.description}</Text>
                ) : null}

                {/* Faculty Assignee Row with Avatar */}
                <View style={[styles.facultyRowBox, { backgroundColor: colors.surface }]}>
                  <View style={[styles.facultyAvatarCircle, { backgroundColor: avatarBg }]}>
                    <Text style={styles.facultyAvatarInitials}>{initials}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.facultyNameText, { color: colors.text }]}>{item.assignedToName}</Text>
                    <Text style={[styles.facultyDeptText, { color: colors.subText }]}>
                      {faculty?.department || 'Academic Faculty'}
                    </Text>
                  </View>
                  <View style={[styles.assigneeBadge, { backgroundColor: `${avatarBg}18` }]}>
                    <Text style={[styles.assigneeBadgeText, { color: avatarBg }]}>Assigned</Text>
                  </View>
                </View>

                {/* Completion Remarks Box */}
                {isCompleted && item.completionNote ? (
                  <View style={styles.completionRemarkContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Icon name="clipboard" size={12} color="#10B981" />
                      <Text style={styles.remarkHeaderLabel}>Faculty Completion Remarks:</Text>
                    </View>
                    <Text style={[styles.remarkNoteQuote, { color: colors.text }]}>
                      "{item.completionNote}"
                    </Text>
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
  actionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  filterTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 5,
  },
  filterDropdown: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterDropdownText: {
    fontSize: 13,
    fontWeight: '700',
  },
  assignTaskBtn: {
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  btnContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assignTaskBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  metricsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  metricCard: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    marginRight: 8,
    borderLeftWidth: 4,
    borderWidth: 1,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalMetricBorder: {
    borderLeftColor: '#6366F1',
  },
  pendingMetricBorder: {
    borderLeftColor: '#F59E0B',
  },
  completedMetricBorder: {
    borderLeftColor: '#10B981',
  },
  metricNumber: {
    fontSize: 20,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
  },
  pendingColor: {
    color: '#F59E0B',
  },
  completedColor: {
    color: '#10B981',
  },
  listPadding: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  taskCardItem: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  taskCardPendingBorder: {
    borderLeftColor: '#F59E0B',
  },
  taskCardCompletedBorder: {
    borderLeftColor: '#10B981',
  },
  timeColumnBox: {
    width: 82,
    borderRightWidth: 1,
    paddingRight: 10,
    justifyContent: 'flex-start',
  },
  startTimeText: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  endTimeText: {
    fontSize: 11,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 10,
    alignSelf: 'flex-start',
    gap: 3,
  },
  statusPendingPillBg: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  statusDonePillBg: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  taskDetailContent: {
    flex: 1,
    paddingLeft: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskTitleText: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  priorityHighTag: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  priorityMediumTag: {
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  priorityLowTag: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  priorityBadgeText: {
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
  taskDescText: {
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
  facultyRowBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 8,
    borderRadius: 10,
  },
  facultyAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  facultyAvatarInitials: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  facultyNameText: {
    fontSize: 12,
    fontWeight: '700',
  },
  facultyDeptText: {
    fontSize: 10,
  },
  completionRemarkContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  assigneeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  assigneeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  remarkHeaderLabel: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  remarkNoteQuote: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 44,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitleText: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitleText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 24,
  },
});
