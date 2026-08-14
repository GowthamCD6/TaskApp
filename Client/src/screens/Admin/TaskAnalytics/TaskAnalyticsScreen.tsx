import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Task, User } from '../../../types';
import { useTheme } from '../../../context/ThemeContext';
import { Icon } from '../../../components/common/Icon';
import { CalendarStrip } from '../../../components/common/CalendarStrip';

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
        <CalendarStrip selectedDate={selectedDate} onSelectDate={onSelectDate} />
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
          <Text style={[styles.sectionHeader, { color: colors.text }]}>
            {viewMode === 'day' ? `Faculty Workload (${selectedDate})` : 'All-Time Faculty Workload'}
          </Text>
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
                  <View
                    key={faculty.id}
                    style={[styles.facultyStatCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                  >
                    <View style={styles.facultyStatHeader}>
                      <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
                        <Text style={styles.avatarText}>{initials}</Text>
                      </View>
                      <View style={styles.flex1}>
                        <Text style={[styles.facultyName, { color: colors.text }]}>{faculty.name}</Text>
                        <Text style={[styles.facultyDept, { color: colors.subText }]}>
                          {faculty.department} • {fTotal} Assigned ({fDone} Done)
                        </Text>
                      </View>
                      <View style={[styles.rateTag, { backgroundColor: `${workloadColor}18` }]}>
                        <Text style={[styles.rateTagText, { color: workloadColor }]}>
                          {workloadRate}% Workload
                        </Text>
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
                  </View>
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
                    <View style={[styles.remarkAvatarCircle, { backgroundColor: colors.primary }]}>
                      <Text style={styles.remarkAvatarText}>{initials}</Text>
                    </View>
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
});
