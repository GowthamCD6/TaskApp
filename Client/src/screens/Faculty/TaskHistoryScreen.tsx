import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Task, User } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { Icon } from '../../components/common/Icon';

interface TaskHistoryScreenProps {
  currentFaculty: User | null;
  allTasks: Task[];
}

export const TaskHistoryScreen: React.FC<TaskHistoryScreenProps> = ({
  currentFaculty,
  allTasks,
}) => {
  const { colors } = useTheme();
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');

  const facultyTasks = allTasks.filter(t =>
    currentFaculty ? t.assignedTo === currentFaculty.id : true
  );

  const filteredTasks = facultyTasks.filter(t => {
    if (filterStatus === 'completed') return t.status === 'completed';
    if (filterStatus === 'pending') return t.status === 'pending';
    return true;
  });

  const completedCount = facultyTasks.filter(t => t.status === 'completed').length;
  const pendingCount = facultyTasks.filter(t => t.status === 'pending').length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.headerBox, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Task Completion History</Text>
        <Text style={[styles.headerSubtitle, { color: colors.subText }]}>
          Review all assigned tasks, completed outcomes, and submitted remarks.
        </Text>

        {/* Filter Pills */}
        <View style={styles.pillContainer}>
          {(['all', 'completed', 'pending'] as const).map(status => {
            const isSelected = filterStatus === status;
            let count = facultyTasks.length;
            if (status === 'completed') count = completedCount;
            if (status === 'pending') count = pendingCount;

            return (
              <TouchableOpacity
                key={status}
                style={[
                  styles.pill,
                  {
                    backgroundColor: isSelected ? colors.secondary : colors.surface,
                    borderColor: isSelected ? colors.secondary : colors.inputBorder,
                  },
                ]}
                onPress={() => setFilterStatus(status)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.pillText,
                    { color: isSelected ? '#FFFFFF' : colors.subText },
                  ]}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="clipboard" size={36} color={colors.secondary} />
            <Text style={[styles.emptyTitle, { color: colors.text, marginTop: 10 }]}>No Task Records Found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.subText }]}>
              No tasks match the filter selection for {currentFaculty?.name || 'this faculty member'}.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isDone = item.status === 'completed';

          let priorityIcon: 'alert' | 'clock' | 'check' = 'clock';
          let priorityColor = '#F59E0B';
          if (item.priority === 'High') {
            priorityIcon = 'alert';
            priorityColor = '#EF4444';
          } else if (item.priority === 'Low') {
            priorityIcon = 'check';
            priorityColor = '#3B82F6';
          }

          return (
            <View style={[styles.taskCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              {/* Top accent bar */}
              <View style={[styles.cardAccentBar, { backgroundColor: isDone ? '#10B981' : '#F59E0B' }]} />

              <View style={styles.cardHeader}>
                <View style={styles.titleRow}>
                  <Text style={[styles.taskTitle, { color: colors.text }]}>{item.title}</Text>
                  <View
                    style={[
                      styles.badge,
                      isDone ? styles.doneBadge : styles.pendingBadge,
                    ]}
                  >
                    <Icon name={isDone ? 'check' : 'clock'} size={9} color={isDone ? '#10B981' : '#F59E0B'} />
                    <Text
                      style={[
                        styles.badgeText,
                        isDone ? styles.doneText : styles.pendingText,
                      ]}
                    >
                      {isDone ? 'Completed' : 'Pending'}
                    </Text>
                  </View>
                </View>
              </View>

              {item.description ? (
                <Text style={[styles.taskDesc, { color: colors.subText }]}>{item.description}</Text>
              ) : null}

              {/* Meta info row */}
              <View style={[styles.metaRow, { backgroundColor: colors.surface }]}>
                <View style={styles.metaChip}>
                  <Icon name="calendar" size={10} color={colors.primary} />
                  <Text style={[styles.metaText, { color: colors.subText }]}>{item.date}</Text>
                </View>
                <View style={styles.metaChip}>
                  <Icon name="clock" size={10} color={colors.subText} />
                  <Text style={[styles.metaText, { color: colors.subText }]}>{item.startTime} - {item.endTime}</Text>
                </View>
                <View style={styles.metaChip}>
                  <Icon name={priorityIcon} size={10} color={priorityColor} />
                  <Text style={[styles.metaText, { color: priorityColor, fontWeight: '700' }]}>{item.priority}</Text>
                </View>
              </View>

              {isDone && item.completionNote ? (
                <View style={styles.remarkBox}>
                  <View style={styles.remarkHeaderRow}>
                    <View style={styles.remarkHeaderLeft}>
                      <View style={styles.remarkCheckCircle}>
                        <Icon name="check" size={8} color="#FFFFFF" />
                      </View>
                      <Text style={styles.remarkHeader}>Your Submitted Outcome & Remarks:</Text>
                    </View>
                  </View>
                  <Text style={[styles.remarkText, { color: colors.text }]}>"{item.completionNote}"</Text>
                  {item.completedAt && (
                    <View style={styles.completedAtRow}>
                      <Icon name="clock" size={9} color={colors.mutedText} />
                      <Text style={[styles.completedAtText, { color: colors.mutedText }]}>
                        Submitted on: {new Date(item.completedAt).toLocaleString()}
                      </Text>
                    </View>
                  )}
                </View>
              ) : null}
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBox: {
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  pillContainer: {
    flexDirection: 'row',
    marginTop: 14,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  taskCard: {
    borderRadius: 18,
    padding: 0,
    marginBottom: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardAccentBar: {
    height: 3,
  },
  cardHeader: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  titleRow: {
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
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  doneBadge: { backgroundColor: 'rgba(16,185,129,0.15)' },
  pendingBadge: { backgroundColor: 'rgba(245,158,11,0.15)' },
  badgeText: { fontSize: 11, fontWeight: '700' },
  doneText: { color: '#10B981' },
  pendingText: { color: '#F59E0B' },
  taskDesc: { fontSize: 13, marginTop: 6, paddingHorizontal: 16, lineHeight: 18 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    gap: 12,
    flexWrap: 'wrap',
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '600',
  },
  remarkBox: {
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 14,
  },
  remarkHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  remarkHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  remarkCheckCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  remarkHeader: { color: '#10B981', fontSize: 11, fontWeight: '700' },
  remarkText: { fontSize: 12, fontStyle: 'italic', marginTop: 2 },
  completedAtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  completedAtText: { fontSize: 10 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptySubtitle: { fontSize: 13, textAlign: 'center', marginTop: 4 },
});
