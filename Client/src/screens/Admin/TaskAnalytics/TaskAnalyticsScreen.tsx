import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Image } from 'react-native';
import { Task, User } from '../../../types';
import { useTheme } from '../../../context/ThemeContext';
import { Icon } from '../../../components/common/Icon';
import { CalendarStrip } from '../../../components/common/CalendarStrip';
import { getAvatarUrl } from '../../../services/api';

interface TaskAnalyticsScreenProps {
  allTasks: Task[];
  allFaculty: User[];
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
}

export const TaskAnalyticsScreen: React.FC<TaskAnalyticsScreenProps> = ({
  allTasks,
  allFaculty,
  selectedDate = new Date().toISOString().split('T')[0],
  onSelectDate,
}) => {
  const { colors } = useTheme();
  const [viewMode, setViewMode] = useState<'day' | 'all'>('day');

  // Filter tasks based on view mode (Day-Wise vs All-Time)
  const displayTasks = viewMode === 'day'
    ? allTasks.filter(t => t.date === selectedDate)
    : allTasks;

  const total = displayTasks.length;
  const completed = displayTasks.filter(t => t.status === 'completed').length;
  const pending = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const highPriority = displayTasks.filter(t => t.priority === 'High').length;
  const mediumPriority = displayTasks.filter(t => t.priority === 'Medium').length;
  const lowPriority = displayTasks.filter(t => t.priority === 'Low').length;

  const completedTasksWithNotes = displayTasks.filter(t => t.status === 'completed' && t.completionNote);

  // Calculate per-faculty analytics for current display tasks
  const facultyStats = allFaculty.map(faculty => {
    const tasks = displayTasks.filter(t => t.assignedTo === faculty.id);
    const done = tasks.filter(t => t.status === 'completed').length;
    const rate = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
    return { faculty, total: tasks.length, done, pending: tasks.length - done, rate };
  });

  // State for selected faculty modal
  const [selectedFacultyForLogs, setSelectedFacultyForLogs] = useState<User | null>(null);

  // Selected faculty's tasks and logs
  const selectedFacultyTasks = selectedFacultyForLogs
    ? displayTasks.filter(t => t.assignedTo === selectedFacultyForLogs.id)
    : [];
  const selectedFacultyDoneTasks = selectedFacultyTasks.filter(t => t.status === 'completed');
  const selectedFacultyLogs = selectedFacultyTasks.filter(t => t.status === 'completed' && t.completionNote);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Pinned Top Header */}
      <View style={[styles.cleanHeader, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
        <View style={styles.headerLeftGroup}>
          <Icon name="analytics" size={18} color={colors.primary} />
          <Text style={[styles.cleanHeaderTitle, { color: colors.text }]}>Analytics & Insights</Text>
        </View>

        {/* View Mode Segment Switcher */}
        <View style={[styles.modeSegment, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={[styles.segmentBtn, viewMode === 'day' && { backgroundColor: colors.primary }]}
            onPress={() => setViewMode('day')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, { color: viewMode === 'day' ? '#FFFFFF' : colors.subText }]}>
              Day-Wise
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, viewMode === 'all' && { backgroundColor: colors.primary }]}
            onPress={() => setViewMode('all')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, { color: viewMode === 'all' ? '#FFFFFF' : colors.subText }]}>
              All-Time
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendar Strip (Shown when Day-Wise mode is active) */}
      {viewMode === 'day' && onSelectDate && (
        <CalendarStrip
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
          taskCountsByDate={allTasks.reduce((acc, t) => {
            const d = t.date ? t.date.split('T')[0].split(' ')[0].trim() : '';
            if (d) acc[d] = (acc[d] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)}
        />
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bodyContent}>
          {/* Main Completion Rate Banner */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <View style={styles.cardHeaderRow}>
              <Text style={[styles.cardTitle, { color: colors.subText }]}>
                {viewMode === 'day' ? `Day Completion Rate (${selectedDate})` : 'All-Time Completion Rate'}
              </Text>
              <View style={[styles.rateBadge, { backgroundColor: `${colors.secondary}18` }]}>
                <Text style={[styles.rateBadgeText, { color: colors.secondary }]}>
                  {completionRate >= 70 ? 'Excellent' : completionRate >= 40 ? 'Good' : 'Needs Attention'}
                </Text>
              </View>
            </View>

            <View style={styles.rateRow}>
              <Text style={[styles.ratePercent, { color: colors.secondary }]}>{completionRate}%</Text>
              <View style={styles.rateSubTextGroup}>
                <Text style={[styles.rateSubTitle, { color: colors.text }]}>
                  {completed} of {total} Tasks Completed
                </Text>
                <Text style={[styles.rateSubDesc, { color: colors.subText }]}>
                  {pending} tasks pending action {viewMode === 'day' ? `on ${selectedDate}` : 'overall'}
                </Text>
              </View>
            </View>

            {/* Progress Meter Bar */}
            <View style={[styles.progressTrack, { backgroundColor: colors.surface }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${completionRate}%`, backgroundColor: colors.secondary },
                ]}
              />
            </View>
          </View>

          {/* Quick Metrics Grid */}
          <View style={styles.metricsGrid}>
            <View style={[styles.miniMetricCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={[styles.iconCircle, { backgroundColor: `${colors.primary}15` }]}>
                <Icon name="clipboard" size={14} color={colors.primary} />
              </View>
              <Text style={[styles.metricVal, { color: colors.text }]}>{total}</Text>
              <Text style={[styles.metricSub, { color: colors.subText }]}>Scheduled</Text>
            </View>

            <View style={[styles.miniMetricCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Icon name="check" size={14} color="#10B981" />
              </View>
              <Text style={[styles.metricVal, { color: '#10B981' }]}>{completed}</Text>
              <Text style={[styles.metricSub, { color: colors.subText }]}>Completed</Text>
            </View>

            <View style={[styles.miniMetricCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Icon name="clock" size={14} color="#F59E0B" />
              </View>
              <Text style={[styles.metricVal, { color: '#F59E0B' }]}>{pending}</Text>
              <Text style={[styles.metricSub, { color: colors.subText }]}>Pending</Text>
            </View>
          </View>

          {/* Priority Breakdown Cards */}
          <Text style={[styles.sectionHeader, { color: colors.text }]}>
            {viewMode === 'day' ? `Priority Breakdown (${selectedDate})` : 'All-Time Priority Breakdown'}
          </Text>
          <View style={styles.priorityGrid}>
            <View style={[styles.priorityCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.priorityHeader}>
                <View style={[styles.priorityIconCircle, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                  <Icon name="alert" size={12} color="#EF4444" />
                </View>
                <Text style={[styles.priorityNum, { color: '#EF4444' }]}>{highPriority}</Text>
              </View>
              <Text style={[styles.priorityLabel, { color: colors.subText }]}>High Priority</Text>
            </View>

            <View style={[styles.priorityCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.priorityHeader}>
                <View style={[styles.priorityIconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                  <Icon name="clock" size={12} color="#F59E0B" />
                </View>
                <Text style={[styles.priorityNum, { color: '#F59E0B' }]}>{mediumPriority}</Text>
              </View>
              <Text style={[styles.priorityLabel, { color: colors.subText }]}>Medium Priority</Text>
            </View>

            <View style={[styles.priorityCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.priorityHeader}>
                <View style={[styles.priorityIconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                  <Icon name="check" size={12} color="#3B82F6" />
                </View>
                <Text style={[styles.priorityNum, { color: '#3B82F6' }]}>{lowPriority}</Text>
              </View>
              <Text style={[styles.priorityLabel, { color: colors.subText }]}>Low Priority</Text>
            </View>
          </View>

          {/* Faculty Workload & Completion Directory */}
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeader, { color: colors.text, marginBottom: 0 }]}>
              {viewMode === 'day' ? `Faculty Workload (${selectedDate})` : 'All-Time Faculty Workload'}
            </Text>
            <Text style={[styles.sectionSubhint, { color: colors.mutedText }]}>Tap card to view logs</Text>
          </View>
          <View style={styles.facultyStatsList}>
            {(() => {
              const maxAssignedTasks = Math.max(...facultyStats.map(s => s.total), 5);
              return facultyStats.map(({ faculty, total: fTotal, done: fDone }) => {
                const initials = faculty.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

                const workloadRate = Math.min(Math.round((fTotal / maxAssignedTasks) * 100), 100);
                let workloadColor = '#10B981';
                if (workloadRate >= 75) workloadColor = '#EF4444';
                else if (workloadRate >= 40) workloadColor = '#F59E0B';

                return (
                  <TouchableOpacity
                    key={faculty.id}
                    style={[styles.facultyStatCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                    onPress={() => setSelectedFacultyForLogs(faculty)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.facultyStatHeader}>
                      {faculty.avatar ? (
                        <Image source={{ uri: getAvatarUrl(faculty.avatar) }} style={styles.avatarImage} />
                      ) : (
                        <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
                          <Text style={styles.avatarText}>{initials}</Text>
                        </View>
                      )}
                      <View style={styles.flex1}>
                        <Text style={[styles.facultyName, { color: colors.text }]}>{faculty.name}</Text>
                        <Text style={[styles.facultyDept, { color: colors.subText }]}>
                          {faculty.department} • {fTotal} Assigned ({fDone} Done)
                        </Text>
                      </View>
                      <View style={styles.facultyCardActionRight}>
                        <View style={[styles.rateTag, { backgroundColor: `${workloadColor}18` }]}>
                          <Text style={[styles.rateTagText, { color: workloadColor }]}>
                            {workloadRate}% Workload
                          </Text>
                        </View>
                        <Icon name="arrow-right" size={14} color={colors.mutedText} />
                      </View>
                    </View>

                    <View style={[styles.miniProgressTrack, { backgroundColor: colors.surface }]}>
                      <View
                        style={[
                          styles.miniProgressFill,
                          {
                            width: `${workloadRate}%`,
                            backgroundColor: workloadColor,
                          },
                        ]}
                      />
                    </View>
                  </TouchableOpacity>
                );
              });
            })()}
          </View>

          {/* Submitted Faculty Remarks */}
          <Text style={[styles.sectionHeader, { color: colors.text }]}>
            {viewMode === 'day'
              ? `Submitted Remarks for ${selectedDate} (${completedTasksWithNotes.length})`
              : `Submitted Remarks History (${completedTasksWithNotes.length})`}
          </Text>

          {completedTasksWithNotes.length === 0 ? (
            <View style={[styles.emptyRemarksCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Icon name="clipboard" size={28} color={colors.mutedText} />
              <Text style={[styles.noDataText, { color: colors.mutedText }]}>
                {viewMode === 'day'
                  ? `No task completion remarks submitted for ${selectedDate}.`
                  : 'No task completion remarks submitted yet.'}
              </Text>
            </View>
          ) : (
            completedTasksWithNotes.map(item => {
              const faculty = allFaculty.find(f => f.id === item.assignedTo);
              const initials = (item.assignedToName || faculty?.name || 'Faculty')
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

              return (
                <View
                  key={item.id}
                  style={[
                    styles.remarkLogCard,
                    { backgroundColor: colors.card, borderColor: colors.cardBorder },
                  ]}
                >
                  <View style={styles.remarkHeader}>
                    {faculty?.avatar ? (
                      <Image
                        source={{ uri: getAvatarUrl(faculty.avatar) }}
                        style={styles.remarkAvatarImage}
                      />
                    ) : (
                      <View style={[styles.remarkAvatarCircle, { backgroundColor: colors.primary }]}>
                        <Text style={styles.remarkAvatarText}>{initials}</Text>
                      </View>
                    )}
                    <View style={styles.flex1}>
                      <Text style={[styles.taskTitle, { color: colors.text }]}>{item.title}</Text>
                      <Text style={[styles.facultySub, { color: colors.subText }]}>
                        By: <Text style={{ color: colors.text, fontWeight: '700' }}>{item.assignedToName}</Text> ({faculty?.department})
                      </Text>
                    </View>
                  </View>

                  <View style={styles.quoteBox}>
                    <View style={styles.quoteRow}>
                      <Icon name="clipboard" size={12} color="#10B981" />
                      <Text style={styles.quoteHeader}>Faculty Submission Remarks:</Text>
                    </View>
                    <Text style={[styles.quoteText, { color: colors.text }]}>
                      "{item.completionNote}"
                    </Text>
                    {item.completedAt && (
                      <Text style={[styles.timestampText, { color: colors.mutedText }]}>
                        Submitted: {new Date(item.completedAt).toLocaleString()}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Faculty Submitted Logs Modal */}
      {selectedFacultyForLogs && (
        <Modal
          visible={!!selectedFacultyForLogs}
          animationType="slide"
          transparent
          onRequestClose={() => setSelectedFacultyForLogs(null)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalCard,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}
            >
              {/* Modal Header */}
              <View style={[styles.modalHeaderRow, { borderBottomColor: colors.cardBorder }]}>
                <View style={styles.modalHeaderLeft}>
                  {selectedFacultyForLogs.avatar ? (
                    <Image
                      source={{ uri: getAvatarUrl(selectedFacultyForLogs.avatar) }}
                      style={styles.modalAvatarImage}
                    />
                  ) : (
                    <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
                      <Text style={styles.avatarText}>
                        {selectedFacultyForLogs.name
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </Text>
                    </View>
                  )}
                  <View>
                    <Text style={[styles.modalFacultyName, { color: colors.text }]}>
                      {selectedFacultyForLogs.name}
                    </Text>
                    <Text style={[styles.modalFacultyDept, { color: colors.subText }]}>
                      {selectedFacultyForLogs.department} • {viewMode === 'day' ? `Date: ${selectedDate}` : 'All-Time Logs'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.modalCloseBtn, { backgroundColor: colors.surface }]}
                  onPress={() => setSelectedFacultyForLogs(null)}
                >
                  <Icon name="close" size={14} color={colors.subText} />
                </TouchableOpacity>
              </View>

              {/* Quick Summary Pill Bar */}
              <View style={[styles.modalSummaryBar, { backgroundColor: colors.surface }]}>
                <View style={styles.modalStatCol}>
                  <Text style={[styles.modalStatNum, { color: colors.text }]}>{selectedFacultyTasks.length}</Text>
                  <Text style={[styles.modalStatLbl, { color: colors.subText }]}>Assigned</Text>
                </View>
                <View style={styles.modalStatDivider} />
                <View style={styles.modalStatCol}>
                  <Text style={[styles.modalStatNum, { color: '#10B981' }]}>{selectedFacultyDoneTasks.length}</Text>
                  <Text style={[styles.modalStatLbl, { color: colors.subText }]}>Done</Text>
                </View>
                <View style={styles.modalStatDivider} />
                <View style={styles.modalStatCol}>
                  <Text style={[styles.modalStatNum, { color: colors.primary }]}>{selectedFacultyLogs.length}</Text>
                  <Text style={[styles.modalStatLbl, { color: colors.subText }]}>Logs/Remarks</Text>
                </View>
              </View>

              {/* Task Logs List */}
              <ScrollView
                style={styles.modalScrollArea}
                contentContainerStyle={{ paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
              >
                {selectedFacultyTasks.length === 0 ? (
                  <View style={styles.modalEmptyBox}>
                    <Icon name="clipboard" size={32} color={colors.mutedText} />
                    <Text style={[styles.modalEmptyText, { color: colors.mutedText }]}>
                      {viewMode === 'day'
                        ? `No tasks assigned to ${selectedFacultyForLogs.name} on ${selectedDate}.`
                        : `No tasks found for ${selectedFacultyForLogs.name}.`}
                    </Text>
                  </View>
                ) : (
                  selectedFacultyTasks.map(task => {
                    const isDone = task.status === 'completed';
                    return (
                      <View
                        key={task.id}
                        style={[
                          styles.modalTaskCard,
                          {
                            backgroundColor: colors.surface,
                            borderColor: colors.cardBorder,
                          },
                        ]}
                      >
                        <View style={styles.modalTaskHeader}>
                          <View style={styles.flex1}>
                            <Text style={[styles.modalTaskTitle, { color: colors.text }]}>
                              {task.title}
                            </Text>
                            <Text style={[styles.modalTaskTiming, { color: colors.subText }]}>
                              {task.date} • {task.startTime} - {task.endTime}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.modalStatusPill,
                              {
                                backgroundColor: isDone ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                              },
                            ]}
                          >
                            <Icon name={isDone ? 'check' : 'clock'} size={10} color={isDone ? '#10B981' : '#F59E0B'} />
                            <Text
                              style={[
                                styles.modalStatusPillText,
                                { color: isDone ? '#10B981' : '#F59E0B' },
                              ]}
                            >
                              {isDone ? 'Completed' : 'Pending'}
                            </Text>
                          </View>
                        </View>

                        {task.description ? (
                          <Text style={[styles.modalTaskDesc, { color: colors.subText }]}>
                            {task.description}
                          </Text>
                        ) : null}

                        {/* Submitted Log / Remark */}
                        {isDone && task.completionNote ? (
                          <View style={styles.modalLogBox}>
                            <View style={styles.modalLogHeader}>
                              <Icon name="clipboard" size={12} color="#10B981" />
                              <Text style={styles.modalLogHeading}>Submitted Faculty Work Log:</Text>
                            </View>
                            <Text style={[styles.modalLogNoteText, { color: colors.text }]}>
                              "{task.completionNote}"
                            </Text>
                            {task.completedAt && (
                              <Text style={[styles.modalLogTimestamp, { color: colors.mutedText }]}>
                                Submitted at: {new Date(task.completedAt).toLocaleString()}
                              </Text>
                            )}
                          </View>
                        ) : isDone ? (
                          <View style={styles.modalNoRemarkBox}>
                            <Text style={[styles.modalNoRemarkText, { color: colors.mutedText }]}>
                              Marked completed without extra remarks.
                            </Text>
                          </View>
                        ) : (
                          <View style={styles.modalPendingBox}>
                            <Icon name="clock" size={12} color="#F59E0B" />
                            <Text style={styles.modalPendingText}>Work log not submitted yet (Task Pending).</Text>
                          </View>
                        )}
                      </View>
                    );
                  })
                )}
              </ScrollView>
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
  scrollContent: {
    paddingBottom: 30,
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
    flex: 1,
  },
  cleanHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  modeSegment: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 2,
    marginLeft: 8,
  },
  segmentBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  segmentText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bodyContent: {
    padding: 16,
  },
  card: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  rateBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  ratePercent: {
    fontSize: 36,
    fontWeight: '900',
    marginRight: 16,
  },
  rateSubTextGroup: {
    flex: 1,
  },
  rateSubTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  rateSubDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  miniMetricCard: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  metricVal: {
    fontSize: 18,
    fontWeight: '800',
  },
  metricSub: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
    marginTop: 8,
  },
  priorityGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  priorityCard: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
  },
  priorityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priorityIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityNum: {
    fontSize: 18,
    fontWeight: '800',
  },
  priorityLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 8,
  },
  facultyStatsList: {
    gap: 10,
    marginBottom: 16,
  },
  facultyStatCard: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
  },
  facultyStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  modalAvatarImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  flex1: {
    flex: 1,
  },
  facultyName: {
    fontSize: 14,
    fontWeight: '700',
  },
  facultyDept: {
    fontSize: 11,
    marginTop: 1,
  },
  rateTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  rateTagText: {
    fontSize: 12,
    fontWeight: '800',
  },
  miniProgressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  emptyRemarksCard: {
    padding: 24,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  noDataText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  remarkLogCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  remarkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  remarkAvatarCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  remarkAvatarImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  remarkAvatarText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  facultySub: {
    fontSize: 11,
    marginTop: 1,
  },
  quoteBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
    padding: 10,
    borderRadius: 10,
  },
  quoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  quoteHeader: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  quoteText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  timestampText: {
    fontSize: 10,
    marginTop: 6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 8,
  },
  sectionSubhint: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  facultyCardActionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    maxHeight: '85%',
    minHeight: '50%',
    paddingBottom: 20,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
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
  modalCloseBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalSummaryBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  modalStatCol: {
    alignItems: 'center',
  },
  modalStatNum: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalStatLbl: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  modalStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(156, 163, 175, 0.2)',
  },
  modalScrollArea: {
    paddingHorizontal: 16,
  },
  modalEmptyBox: {
    alignItems: 'center',
    paddingVertical: 36,
    gap: 10,
  },
  modalEmptyText: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  modalTaskCard: {
    borderRadius: 16,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
  },
  modalTaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 8,
  },
  modalTaskTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  modalTaskTiming: {
    fontSize: 11,
    marginTop: 2,
  },
  modalStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  modalStatusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  modalTaskDesc: {
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 16,
  },
  modalLogBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
    padding: 10,
    borderRadius: 10,
    marginTop: 6,
  },
  modalLogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  modalLogHeading: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  modalLogNoteText: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  modalLogTimestamp: {
    fontSize: 10,
    marginTop: 6,
  },
  modalNoRemarkBox: {
    marginTop: 6,
    paddingVertical: 4,
  },
  modalNoRemarkText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  modalPendingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingVertical: 4,
  },
  modalPendingText: {
    fontSize: 11,
    color: '#F59E0B',
    fontWeight: '600',
  },
});
