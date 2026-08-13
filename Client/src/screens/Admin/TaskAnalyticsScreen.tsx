import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Task, User } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { Icon } from '../../components/common/Icon';

interface TaskAnalyticsScreenProps {
  allTasks: Task[];
  allFaculty: User[];
}

export const TaskAnalyticsScreen: React.FC<TaskAnalyticsScreenProps> = ({
  allTasks,
  allFaculty,
}) => {
  const { colors } = useTheme();
  const total = allTasks.length;
  const completed = allTasks.filter(t => t.status === 'completed').length;
  const pending = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const highPriority = allTasks.filter(t => t.priority === 'High').length;
  const mediumPriority = allTasks.filter(t => t.priority === 'Medium').length;
  const lowPriority = allTasks.filter(t => t.priority === 'Low').length;

  const completedTasksWithNotes = allTasks.filter(t => t.status === 'completed' && t.completionNote);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Clean & Simple Top Header */}
      <View style={[styles.cleanHeader, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
        <View style={styles.headerLeftGroup}>
          <Icon name="analytics" size={18} color={colors.primary} />
          <Text style={[styles.cleanHeaderTitle, { color: colors.text }]}>Analytics & Reports</Text>
        </View>
      </View>

      <View style={styles.bodyContent}>
        {/* Completion Rate Banner */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.subText }]}>Overall Task Completion Rate</Text>
          <View style={styles.rateRow}>
            <Text style={styles.ratePercent}>{completionRate}%</Text>
            <View style={styles.rateSubTextGroup}>
              <Text style={[styles.rateSubTitle, { color: colors.text }]}>
                {completed} of {total} Tasks Completed
              </Text>
              <Text style={[styles.rateSubDesc, { color: colors.subText }]}>
                {pending} tasks currently pending action
              </Text>
            </View>
          </View>

          {/* Progress Meter Bar */}
          <View style={[styles.progressTrack, { backgroundColor: colors.surface }]}>
            <View style={[styles.progressFill, { width: `${completionRate}%` }]} />
          </View>
        </View>

        {/* Priority Distribution Cards */}
        <Text style={[styles.sectionHeader, { color: colors.text }]}>Task Distribution by Priority</Text>
        <View style={styles.priorityGrid}>
          <View
            style={[
              styles.priorityCard,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
              styles.highBorder,
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="alert" size={14} color="#EF4444" />
              <Text style={[styles.priorityNum, styles.highText, { marginLeft: 4 }]}>{highPriority}</Text>
            </View>
            <Text style={[styles.priorityLabel, { color: colors.subText }]}>High Priority</Text>
          </View>

          <View
            style={[
              styles.priorityCard,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
              styles.medBorder,
            ]}
          >
            <Text style={[styles.priorityNum, styles.medText]}>{mediumPriority}</Text>
            <Text style={[styles.priorityLabel, { color: colors.subText }]}>Medium Priority</Text>
          </View>

          <View
            style={[
              styles.priorityCard,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
              styles.lowBorder,
            ]}
          >
            <Text style={[styles.priorityNum, styles.lowText]}>{lowPriority}</Text>
            <Text style={[styles.priorityLabel, { color: colors.subText }]}>Low Priority</Text>
          </View>
        </View>

        {/* Recent Faculty Remarks History */}
        <Text style={[styles.sectionHeader, { color: colors.text }]}>
          Submitted Faculty Completion Remarks ({completedTasksWithNotes.length})
        </Text>
        <FlatList
          data={completedTasksWithNotes}
          keyExtractor={t => t.id}
          scrollEnabled={false}
          ListEmptyComponent={
            <Text style={[styles.noDataText, { color: colors.mutedText }]}>
              No task completion remarks submitted yet.
            </Text>
          }
          renderItem={({ item }) => {
            const faculty = allFaculty.find(f => f.id === item.assignedTo);
            return (
              <View
                style={[
                  styles.remarkLogCard,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder },
                ]}
              >
                <View style={styles.remarkHeader}>
                  <Text style={[styles.taskTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={styles.facultyBadge}>{item.assignedToName}</Text>
                </View>
                <Text style={[styles.deptText, { color: colors.subText }]}>{faculty?.department}</Text>
                <View style={styles.quoteBox}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                    <Icon name="clipboard" size={12} color="#10B981" />
                    <Text style={[styles.quoteText, { color: colors.text, marginLeft: 4 }]}>
                      "{item.completionNote}"
                    </Text>
                  </View>
                </View>
                {item.completedAt && (
                  <Text style={[styles.timestampText, { color: colors.mutedText }]}>
                    Submitted: {new Date(item.completedAt).toLocaleString()}
                  </Text>
                )}
              </View>
            );
          }}
        />
      </View>
    </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cleanHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 8,
  },
  bodyContent: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardTitle: {
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
    fontSize: 14,
    fontWeight: '700',
  },
  rateSubDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 5,
  },
  sectionHeader: {
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
    borderRadius: 12,
    padding: 12,
    marginRight: 8,
    borderLeftWidth: 3,
    borderWidth: 1,
  },
  highBorder: { borderLeftColor: '#EF4444' },
  medBorder: { borderLeftColor: '#F59E0B' },
  lowBorder: { borderLeftColor: '#3B82F6' },
  priorityNum: { fontSize: 20, fontWeight: '800' },
  highText: { color: '#EF4444' },
  medText: { color: '#F59E0B' },
  lowText: { color: '#3B82F6' },
  priorityLabel: { fontSize: 11, marginTop: 4 },
  noDataText: { fontSize: 13, fontStyle: 'italic' },
  remarkLogCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  remarkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskTitle: { fontSize: 14, fontWeight: '700', flex: 1, marginRight: 8 },
  facultyBadge: { color: '#10B981', fontSize: 12, fontWeight: '600' },
  deptText: { fontSize: 11, marginTop: 2 },
  quoteBox: {
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  quoteText: { fontSize: 12, fontStyle: 'italic' },
  timestampText: { fontSize: 10, marginTop: 6 },
});
