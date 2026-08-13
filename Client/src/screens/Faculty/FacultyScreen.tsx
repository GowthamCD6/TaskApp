import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { Task, User } from '../../types';
import { CalendarStrip } from '../../components/common/CalendarStrip';
import { CompleteTaskModal } from '../../components/modals/CompleteTaskModal';
import { useTheme } from '../../context/ThemeContext';
import { Icon } from '../../components/common/Icon';

interface FacultyScreenProps {
  currentFaculty: User | null;
  tasks: Task[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onCompleteTask: (taskId: string, note: string) => void;
}

export const FacultyScreen: React.FC<FacultyScreenProps> = ({
  currentFaculty,
  tasks,
  selectedDate,
  onSelectDate,
  onCompleteTask,
}) => {
  const { colors } = useTheme();
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [targetTask, setTargetTask] = useState<Task | null>(null);

  // Filter tasks specifically for current faculty & selected date
  const facultyTasks = tasks.filter(t => {
    const matchesFaculty = currentFaculty ? t.assignedTo === currentFaculty.id : true;
    const matchesDate = t.date === selectedDate;
    return matchesFaculty && matchesDate;
  });

  const pendingCount = facultyTasks.filter(t => t.status === 'pending').length;
  const completedCount = facultyTasks.filter(t => t.status === 'completed').length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Faculty Profile Card */}
      {currentFaculty && (
        <View style={[styles.profileHeader, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
          <Image source={{ uri: currentFaculty.avatar }} style={styles.profileAvatar} />
          <View style={styles.profileDetails}>
            <Text style={styles.profileTitle}>Faculty Member Portal</Text>
            <Text style={[styles.profileName, { color: colors.text }]}>{currentFaculty.name}</Text>
            <Text style={[styles.profileMeta, { color: colors.subText }]}>
              {currentFaculty.department} • {currentFaculty.title}
            </Text>
          </View>
        </View>
      )}

      {/* Calendar Strip */}
      <CalendarStrip selectedDate={selectedDate} onSelectDate={onSelectDate} />

      {/* Schedule Summary Banner */}
      <View style={[styles.summaryBar, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
        <Text style={[styles.summaryText, { color: colors.subText }]}>
          Day Schedule ({selectedDate}):{' '}
          <Text style={[styles.textWhiteBold, { color: colors.text }]}>{facultyTasks.length} Tasks</Text>
        </Text>
        <View style={styles.badgeRow}>
          <Text style={[styles.miniBadge, styles.badgePending]}>
            {pendingCount} Pending
          </Text>
          <Text style={[styles.miniBadge, styles.badgeDone]}>
            {completedCount} Done
          </Text>
        </View>
      </View>

      {/* Day-Wise Tasks Timeline */}
      <FlatList
        data={facultyTasks}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="academic" size={40} color={colors.secondary} />
            <Text style={[styles.emptyTitle, { color: colors.text, marginTop: 10 }]}>
              No Tasks Scheduled for This Day
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.subText }]}>
              You have no assigned tasks on {selectedDate}. Enjoy your free timeline!
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
              <View style={[styles.timeColumn, { borderRightColor: colors.cardBorder }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="clock" size={12} color={colors.text} />
                  <Text style={[styles.timeText, { color: colors.text, marginLeft: 4 }]}>{item.startTime}</Text>
                </View>
                <Text style={[styles.timeSubtext, { color: colors.mutedText }]}>to {item.endTime}</Text>

                {/* Status indicator */}
                <View style={[styles.statusIndicator, isCompleted ? styles.statusDoneBg : styles.statusPendingBg]}>
                  <Icon name={isCompleted ? 'check' : 'clock'} size={8} color={isCompleted ? '#10B981' : '#F59E0B'} />
                  <Text style={[styles.statusIndicatorText, isCompleted ? styles.completedColor : styles.pendingColor]}>
                    {isCompleted ? 'Done' : 'Active'}
                  </Text>
                </View>
              </View>

              <View style={styles.cardContent}>
                <View style={styles.cardHeaderRow}>
                  <Text style={[styles.taskTitle, { color: colors.text }]}>{item.title}</Text>
                  <View style={[styles.priorityTag, priorityStyle]}>
                    <Icon name={priorityIcon} size={8} color={priorityTextStyle.color} />
                    <Text style={[styles.priorityTagText, priorityTextStyle]}>
                      {item.priority}
                    </Text>
                  </View>
                </View>

                {item.description ? (
                  <Text style={[styles.taskDesc, { color: colors.subText }]}>{item.description}</Text>
                ) : null}

                {/* Assigned by info */}
                <View style={[styles.assignedByRow, { backgroundColor: colors.surface }]}>
                  <Icon name="user" size={10} color={colors.primary} />
                  <Text style={[styles.assignedByText, { color: colors.mutedText }]}>
                    Assigned by: <Text style={{ color: colors.text, fontWeight: '600' }}>{item.assignedBy}</Text>
                  </Text>
                </View>

                {/* Completion Status / Remarks Box */}
                {isCompleted ? (
                  <View style={styles.completedRemarkBox}>
                    <View style={styles.completedHeaderRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={styles.completedCheckCircle}>
                          <Icon name="check" size={10} color="#FFFFFF" />
                        </View>
                        <Text style={[styles.completedCheckMark, { marginLeft: 6 }]}>Completed</Text>
                      </View>
                      {item.completedAt && (
                        <Text style={[styles.completedTime, { color: colors.mutedText }]}>
                          {new Date(item.completedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      )}
                    </View>
                    <Text style={[styles.remarkText, { color: colors.text }]}>"{item.completionNote}"</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.completeActionBtn, { backgroundColor: colors.secondary }]}
                    onPress={() => {
                      setTargetTask(item);
                      setCompleteModalVisible(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                      <View style={styles.completeBtnIconCircle}>
                        <Icon name="check" size={12} color="#FFFFFF" />
                      </View>
                      <Text style={[styles.completeActionBtnText, { marginLeft: 8 }]}>
                        Mark Completed & Submit Remarks
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
      />

      {/* Complete Task Modal */}
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  profileDetails: {
    flex: 1,
  },
  profileTitle: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
  },
  profileMeta: {
    fontSize: 12,
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  summaryText: {
    fontSize: 13,
  },
  textWhiteBold: {
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
  },
  miniBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: '700',
  },
  badgePending: {
    backgroundColor: 'rgba(245,158,11,0.2)',
    color: '#F59E0B',
  },
  badgeDone: {
    backgroundColor: 'rgba(16,185,129,0.2)',
    color: '#10B981',
    marginLeft: 6,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  taskCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  taskCardCompleted: {
    borderColor: 'rgba(16,185,129,0.3)',
  },
  timeColumn: {
    width: 80,
    borderRightWidth: 1,
    paddingRight: 10,
    justifyContent: 'flex-start',
  },
  timeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  timeSubtext: {
    fontSize: 11,
    marginTop: 2,
  },
  statusIndicator: {
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
    backgroundColor: 'rgba(16,185,129,0.15)',
  },
  statusPendingBg: {
    backgroundColor: 'rgba(245,158,11,0.15)',
  },
  statusIndicatorText: {
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
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
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
  taskDesc: { fontSize: 13, marginTop: 6, lineHeight: 18 },
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
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  completeBtnIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  completedRemarkBox: {
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
  },
  completedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  completedCheckCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedCheckMark: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
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
