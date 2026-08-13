import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Task, User } from '../../types';

interface TaskAnalyticsScreenProps {
  allTasks: Task[];
  allFaculty: User[];
}

export const TaskAnalyticsScreen: React.FC<TaskAnalyticsScreenProps> = ({
  allTasks,
  allFaculty,
}) => {
  const total = allTasks.length;
  const completed = allTasks.filter(t => t.status === 'completed').length;
  const pending = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const highPriority = allTasks.filter(t => t.priority === 'High').length;
  const mediumPriority = allTasks.filter(t => t.priority === 'Medium').length;
  const lowPriority = allTasks.filter(t => t.priority === 'Low').length;

  const completedTasksWithNotes = allTasks.filter(t => t.status === 'completed' && t.completionNote);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.headerBox}>
        <Text style={styles.badge}>Analytics & Performance Reports</Text>
        <Text style={styles.headerTitle}>Task Metrics Overview</Text>
        <Text style={styles.headerSubtitle}>
          Real-time tracking of task fulfillment, priority ratios, and faculty remarks.
        </Text>
      </View>

      {/* Completion Rate Banner */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Overall Task Completion Rate</Text>
        <View style={styles.rateRow}>
          <Text style={styles.ratePercent}>{completionRate}%</Text>
          <View style={styles.rateSubTextGroup}>
            <Text style={styles.rateSubTitle}>{completed} of {total} Tasks Completed</Text>
            <Text style={styles.rateSubDesc}>{pending} tasks currently pending action</Text>
          </View>
        </View>

        {/* Progress Meter Bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${completionRate}%` }]} />
        </View>
      </View>

      {/* Priority Distribution Cards */}
      <Text style={styles.sectionHeader}>Task Distribution by Priority</Text>
      <View style={styles.priorityGrid}>
        <View style={[styles.priorityCard, styles.highBorder]}>
          <Text style={[styles.priorityNum, styles.highText]}>{highPriority}</Text>
          <Text style={styles.priorityLabel}>High Priority</Text>
        </View>
        <View style={[styles.priorityCard, styles.medBorder]}>
          <Text style={[styles.priorityNum, styles.medText]}>{mediumPriority}</Text>
          <Text style={styles.priorityLabel}>Medium Priority</Text>
        </View>
        <View style={[styles.priorityCard, styles.lowBorder]}>
          <Text style={[styles.priorityNum, styles.lowText]}>{lowPriority}</Text>
          <Text style={styles.priorityLabel}>Low Priority</Text>
        </View>
      </View>

      {/* Recent Faculty Remarks History */}
      <Text style={styles.sectionHeader}>Submitted Faculty Completion Remarks ({completedTasksWithNotes.length})</Text>
      <FlatList
        data={completedTasksWithNotes}
        keyExtractor={t => t.id}
        scrollEnabled={false}
        ListEmptyComponent={
          <Text style={styles.noDataText}>No task completion remarks submitted yet.</Text>
        }
        renderItem={({ item }) => {
          const faculty = allFaculty.find(f => f.id === item.assignedTo);
          return (
            <View style={styles.remarkLogCard}>
              <View style={styles.remarkHeader}>
                <Text style={styles.taskTitle}>{item.title}</Text>
                <Text style={styles.facultyBadge}>{item.assignedToName}</Text>
              </View>
              <Text style={styles.deptText}>{faculty?.department}</Text>
              <View style={styles.quoteBox}>
                <Text style={styles.quoteText}>"{item.completionNote}"</Text>
              </View>
              {item.completedAt && (
                <Text style={styles.timestampText}>
                  Submitted: {new Date(item.completedAt).toLocaleString()}
                </Text>
              )}
            </View>
          );
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  headerBox: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  badge: {
    color: '#818CF8',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  cardTitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  ratePercent: {
    fontSize: 36,
    fontWeight: '900',
    color: '#10B981',
    marginRight: 16,
  },
  rateSubTextGroup: {
    flex: 1,
  },
  rateSubTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  rateSubDesc: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  progressTrack: {
    height: 10,
    backgroundColor: '#1E293B',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 5,
  },
  sectionHeader: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 6,
  },
  priorityGrid: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  priorityCard: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    marginRight: 8,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  highBorder: { borderLeftColor: '#EF4444' },
  medBorder: { borderLeftColor: '#F59E0B' },
  lowBorder: { borderLeftColor: '#3B82F6' },
  priorityNum: { fontSize: 20, fontWeight: '800' },
  highText: { color: '#EF4444' },
  medText: { color: '#F59E0B' },
  lowText: { color: '#3B82F6' },
  priorityLabel: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  noDataText: { color: '#64748B', fontSize: 13, fontStyle: 'italic' },
  remarkLogCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  remarkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskTitle: { color: '#F8FAFC', fontSize: 14, fontWeight: '700', flex: 1, marginRight: 8 },
  facultyBadge: { color: '#34D399', fontSize: 12, fontWeight: '600' },
  deptText: { color: '#64748B', fontSize: 11, marginTop: 2 },
  quoteBox: {
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  quoteText: { color: '#CBD5E1', fontSize: 12, fontStyle: 'italic' },
  timestampText: { color: '#64748B', fontSize: 10, marginTop: 6 },
});
