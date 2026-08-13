import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
} from 'react-native';
import { Task, User } from '../../../types';
import { CalendarStrip } from '../../../components/common/CalendarStrip';
import { CompleteTaskModal } from '../../../components/modals/CompleteTaskModal';
import { useTheme } from '../../../context/ThemeContext';
import { Icon } from '../../../components/common/Icon';

interface FacultyScreenProps {
  currentFaculty: User | null;
  tasks: Task[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onCompleteTask: (taskId: string, note: string) => void;
}

type FilterTab = 'all' | 'pending' | 'completed' | 'high_priority';

export const FacultyScreen: React.FC<FacultyScreenProps> = ({
  currentFaculty,
  tasks,
  selectedDate,
  onSelectDate,
  onCompleteTask,
}) => {
  const { colors } = useTheme();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [targetTask, setTargetTask] = useState<Task | null>(null);

  // Filter tasks specifically for current faculty & selected date
  const dayFacultyTasks = tasks.filter(t => {
    const matchesFaculty = currentFaculty ? t.assignedTo === currentFaculty.id : true;
    const matchesDate = t.date === selectedDate;
    return matchesFaculty && matchesDate;
  });

  const totalCount = dayFacultyTasks.length;
  const pendingCount = dayFacultyTasks.filter(t => t.status === 'pending').length;
  const completedCount = dayFacultyTasks.filter(t => t.status === 'completed').length;
  const highPriorityCount = dayFacultyTasks.filter(t => t.priority === 'High').length;

  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filter by selected tab
  const displayedTasks = dayFacultyTasks.filter(t => {
    if (activeFilter === 'pending') return t.status === 'pending';
    if (activeFilter === 'completed') return t.status === 'completed';
    if (activeFilter === 'high_priority') return t.priority === 'High';
    return true;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 1. Header Banner & Faculty Profile */}
      {currentFaculty && (
        <View style={[styles.headerBanner, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
          <View style={styles.profileRow}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: currentFaculty.avatar }} style={styles.avatarImage} />
              <View style={styles.onlineBadge} />
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.roleTag}>
                <Icon name="academic" size={10} color="#10B981" />
                <Text style={styles.roleTagText}>Faculty Workstation</Text>
              </View>
              <Text style={[styles.profileName, { color: colors.text }]}>{currentFaculty.name}</Text>
              <Text style={[styles.profileMeta, { color: colors.subText }]}>
                {currentFaculty.department} • {currentFaculty.title}
              </Text>
            </View>
          </View>

          {/* Productivity & Progress bar */}
          <View style={[styles.progressBox, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
            <View style={styles.progressHeaderRow}>
              <Text style={[styles.progressTitle, { color: colors.subText }]}>Today's Task Completion</Text>
              <Text style={[styles.progressPercent, { color: colors.primary }]}>{completionRate}%</Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${completionRate}%`, backgroundColor: colors.primary },
                ]}
              />
            </View>
          </View>
        </View>
      )}

      {/* 2. Calendar Strip */}
      <CalendarStrip selectedDate={selectedDate} onSelectDate={onSelectDate} />

      {/* 3. Metric Stat Summary Cards */}
      <View style={styles.metricsContainer}>
        <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={[styles.iconPill, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
            <Icon name="calendar" size={14} color={colors.primary} />
          </View>
          <Text style={[styles.metricValue, { color: colors.text }]}>{totalCount}</Text>
          <Text style={[styles.metricLabel, { color: colors.subText }]}>Assigned</Text>
        </View>

        <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={[styles.iconPill, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
            <Icon name="clock" size={14} color="#F59E0B" />
          </View>
          <Text style={[styles.metricValue, { color: '#F59E0B' }]}>{pendingCount}</Text>
          <Text style={[styles.metricLabel, { color: colors.subText }]}>Pending</Text>
        </View>

        <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={[styles.iconPill, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
            <Icon name="check" size={14} color="#10B981" />
          </View>
          <Text style={[styles.metricValue, { color: '#10B981' }]}>{completedCount}</Text>
          <Text style={[styles.metricLabel, { color: colors.subText }]}>Completed</Text>
        </View>
      </View>

      {/* 4. Filter Tab Pills */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === 'all'
                ? { backgroundColor: colors.primary }
                : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder },
            ]}
            onPress={() => setActiveFilter('all')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterChipText, activeFilter === 'all' ? styles.activeFilterText : { color: colors.subText }]}>
              All ({totalCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === 'pending'
                ? { backgroundColor: '#F59E0B' }
                : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder },
            ]}
            onPress={() => setActiveFilter('pending')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterChipText, activeFilter === 'pending' ? styles.activeFilterText : { color: colors.subText }]}>
              Pending ({pendingCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === 'completed'
                ? { backgroundColor: '#10B981' }
                : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder },
            ]}
            onPress={() => setActiveFilter('completed')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterChipText, activeFilter === 'completed' ? styles.activeFilterText : { color: colors.subText }]}>
              Completed ({completedCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === 'high_priority'
                ? { backgroundColor: '#EF4444' }
                : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder },
            ]}
            onPress={() => setActiveFilter('high_priority')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterChipText, activeFilter === 'high_priority' ? styles.activeFilterText : { color: colors.subText }]}>
              High Priority ({highPriorityCount})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 5. Schedule List & Timeline Cards */}
      <FlatList
        data={displayedTasks}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconCircle, { backgroundColor: colors.surface }]}>
              <Icon name="academic" size={36} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Tasks Found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.subText }]}>
              {activeFilter === 'all'
                ? `No tasks scheduled on ${selectedDate}. Enjoy your free timeline!`
                : `No ${activeFilter.replace('_', ' ')} tasks for ${selectedDate}.`}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isCompleted = item.status === 'completed';

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
                styles.taskCard,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
                isCompleted && styles.taskCardCompleted,
              ]}
            >
              {/* Timeline Indicator Column */}
              <View style={[styles.timeColumn, { borderRightColor: colors.cardBorder }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="clock" size={12} color={colors.text} />
                  <Text style={[styles.timeText, { color: colors.text }]}>{item.startTime}</Text>
                </View>
                <Text style={[styles.timeSubtext, { color: colors.subText }]}>to {item.endTime}</Text>

                {/* Status Indicator Pill */}
                <View style={[styles.statusBadge, isCompleted ? styles.statusDoneBg : styles.statusPendingBg]}>
                  <Icon name={isCompleted ? 'check' : 'clock'} size={8} color={isCompleted ? '#10B981' : '#F59E0B'} />
                  <Text style={[styles.statusBadgeText, isCompleted ? styles.completedColor : styles.pendingColor]}>
                    {isCompleted ? 'Done' : 'Active'}
                  </Text>
                </View>
              </View>

              {/* Card Content Area */}
              <View style={styles.cardContent}>
                <View style={styles.cardHeaderRow}>
                  <Text style={[styles.taskTitle, { color: colors.text }]} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <View style={[styles.priorityTag, priorityStyle]}>
                    <Icon name={priorityIcon} size={8} color={priorityTextStyle.color} />
                    <Text style={[styles.priorityTagText, priorityTextStyle]}>{item.priority}</Text>
                  </View>
                </View>

                {item.description ? (
                  <Text style={[styles.taskDesc, { color: colors.subText }]}>{item.description}</Text>
                ) : null}

                {/* Assigned By Info */}
                <View style={[styles.assignedByRow, { backgroundColor: colors.surface }]}>
                  <Icon name="user" size={11} color={colors.primary} />
                  <Text style={[styles.assignedByText, { color: colors.subText }]}>
                    Assigned by: <Text style={{ color: colors.text, fontWeight: '600' }}>{item.assignedBy}</Text>
                  </Text>
                </View>

                {/* Action or Completion Box */}
                {isCompleted ? (
                  <View style={[styles.completedRemarkBox, { backgroundColor: 'rgba(16, 185, 129, 0.08)' }]}>
                    <View style={styles.completedHeaderRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={styles.completedCheckCircle}>
                          <Icon name="check" size={10} color="#FFFFFF" />
                        </View>
                        <Text style={styles.completedCheckMark}>Task Verified & Done</Text>
                      </View>
                      {item.completedAt && (
                        <Text style={[styles.completedTime, { color: colors.subText }]}>
                          {new Date(item.completedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      )}
                    </View>
                    {item.completionNote ? (
                      <Text style={[styles.remarkText, { color: colors.text }]}>
                        "{item.completionNote}"
                      </Text>
                    ) : (
                      <Text style={[styles.remarkText, { color: colors.subText }]}>
                        No specific remarks provided.
                      </Text>
                    )}
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.completeActionBtn, { backgroundColor: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.4)' }]}
                    onPress={() => {
                      setTargetTask(item);
                      setCompleteModalVisible(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.completeBtnRow}>
                      <View style={styles.completeBtnLeftGroup}>
                        <View style={styles.completeBtnIconCircle}>
                          <Icon name="check" size={12} color="#FFFFFF" />
                        </View>
                        <Text style={[styles.completeActionBtnText, { color: '#10B981' }]}>
                          Mark Task Completed
                        </Text>
                      </View>
                      
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
      />

      {/* 6. Complete Task Modal */}
      <CompleteTaskModal
        visible={completeModalVisible}
        task={targetTask}
        onClose={() => {
          setCompleteModalVisible(false);
          setTargetTask(null);
        }}
        onSubmitCompletion={onCompleteTask}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBanner: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  roleTagText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
  },
  profileMeta: {
    fontSize: 12,
    marginTop: 1,
  },
  progressBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: 'rgba(156, 163, 175, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  metricsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  metricCard: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  iconPill: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  filterBar: {
    marginTop: 12,
    marginBottom: 4,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  taskCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  taskCardCompleted: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  timeColumn: {
    width: 82,
    borderRightWidth: 1,
    paddingRight: 10,
    justifyContent: 'flex-start',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  timeSubtext: {
    fontSize: 10,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 10,
    alignSelf: 'flex-start',
    gap: 3,
  },
  statusDoneBg: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusPendingBg: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  completedColor: {
    color: '#10B981',
  },
  pendingColor: {
    color: '#F59E0B',
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
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
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
  assignedByRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  assignedByText: {
    fontSize: 11,
  },
  completeActionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    marginTop: 12,
  },
  completeBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  completeBtnLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  completeBtnRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completeBtnIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeActionBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  addRemarksBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  completedRemarkBox: {
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  completedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  completedCheckCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedCheckMark: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  completedTime: {
    fontSize: 10,
  },
  remarkText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 24,
  },
});
