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
          return (
            <View style={[styles.taskCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.taskTitle, { color: colors.text }]}>{item.title}</Text>
                <View
                  style={[
                    styles.badge,
                    isDone ? styles.doneBadge : styles.pendingBadge,
                  ]}
                >
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

              {item.description ? (
                <Text style={[styles.taskDesc, { color: colors.subText }]}>{item.description}</Text>
              ) : null}

              <Text style={[styles.dateMeta, { color: colors.mutedText }]}>
                Date: {item.date} • {item.startTime} - {item.endTime} • Priority: {item.priority}
              </Text>

              {isDone && item.completionNote ? (
                <View style={styles.remarkBox}>
                  <Text style={styles.remarkHeader}>Your Submitted Outcome & Remarks:</Text>
                  <Text style={[styles.remarkText, { color: colors.text }]}>"{item.completionNote}"</Text>
                  {item.completedAt && (
                    <Text style={[styles.completedAtText, { color: colors.mutedText }]}>
                      Submitted on: {new Date(item.completedAt).toLocaleString()}
                    </Text>
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardHeader: {
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  doneBadge: { backgroundColor: 'rgba(16,185,129,0.15)' },
  pendingBadge: { backgroundColor: 'rgba(245,158,11,0.15)' },
  badgeText: { fontSize: 11, fontWeight: '700' },
  doneText: { color: '#10B981' },
  pendingText: { color: '#F59E0B' },
  taskDesc: { fontSize: 13, marginTop: 6 },
  dateMeta: { fontSize: 11, marginTop: 8 },
  remarkBox: {
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  remarkHeader: { color: '#10B981', fontSize: 11, fontWeight: '700' },
  remarkText: { fontSize: 12, fontStyle: 'italic', marginTop: 2 },
  completedAtText: { fontSize: 10, marginTop: 4 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptySubtitle: { fontSize: 13, textAlign: 'center', marginTop: 4 },
});
