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
    <View style={styles.container}>
      {/* Faculty Profile Card */}
      {currentFaculty && (
        <View style={styles.profileHeader}>
          <Image source={{ uri: currentFaculty.avatar }} style={styles.profileAvatar} />
          <View style={styles.profileDetails}>
            <Text style={styles.profileTitle}>Faculty Member Portal</Text>
            <Text style={styles.profileName}>{currentFaculty.name}</Text>
            <Text style={styles.profileMeta}>
              {currentFaculty.department} • {currentFaculty.title}
            </Text>
          </View>
        </View>
      )}

      {/* Calendar Strip */}
      <CalendarStrip selectedDate={selectedDate} onSelectDate={onSelectDate} />

      {/* Schedule Summary Banner */}
      <View style={styles.summaryBar}>
        <Text style={styles.summaryText}>
          Day Schedule ({selectedDate}):{' '}
          <Text style={styles.textWhiteBold}>{facultyTasks.length} Tasks</Text>
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
            <Text style={styles.emptyIcon}>🎉</Text>
            <Text style={styles.emptyTitle}>No Tasks Scheduled for This Day</Text>
            <Text style={styles.emptySubtitle}>
              You have no assigned tasks on {selectedDate}. Enjoy your free timeline!
            </Text>
          </View>
        }
        renderItem={({ item }) => {
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
            <View style={[styles.taskCard, isCompleted && styles.taskCardCompleted]}>
              <View style={styles.timeColumn}>
                <Text style={styles.timeText}>{item.startTime}</Text>
                <Text style={styles.timeSubtext}>to {item.endTime}</Text>
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

                <Text style={styles.assignedByText}>Assigned by: {item.assignedBy}</Text>

                {/* Completion Status / Remarks Box */}
                {isCompleted ? (
                  <View style={styles.completedRemarkBox}>
                    <View style={styles.completedHeaderRow}>
                      <Text style={styles.completedCheckMark}>✓ Completed</Text>
                      {item.completedAt && (
                        <Text style={styles.completedTime}>
                          {new Date(item.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.remarkText}>"{item.completionNote}"</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.completeActionBtn}
                    onPress={() => {
                      setTargetTask(item);
                      setCompleteModalVisible(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.completeActionBtnText}>✓ Mark Completed & Submit Remarks</Text>
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
    backgroundColor: '#090D16',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
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
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  profileMeta: {
    color: '#94A3B8',
    fontSize: 12,
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  summaryText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  textWhiteBold: {
    color: '#F8FAFC',
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
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  taskCardCompleted: {
    borderColor: 'rgba(16,185,129,0.3)',
    backgroundColor: 'rgba(15,23,42,0.85)',
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
  assignedByText: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 8,
  },
  completeActionBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  completeActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  completedRemarkBox: {
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
  },
  completedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  completedCheckMark: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
  },
  completedTime: {
    color: '#64748B',
    fontSize: 10,
  },
  remarkText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontStyle: 'italic',
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
