import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ScrollView,
} from 'react-native';
import { Task, User } from '../../../types';
import { useTheme } from '../../../context/ThemeContext';
import { Icon } from '../../../components/common/Icon';

interface TaskHistoryScreenProps {
  currentFaculty: User | null;
  allTasks: Task[];
}

type FilterStatus = 'all' | 'completed' | 'pending' | 'high_priority';

export const TaskHistoryScreen: React.FC<TaskHistoryScreenProps> = ({
  currentFaculty,
  allTasks,
}) => {
  const { colors } = useTheme();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tasks for current faculty member
  const facultyTasks = allTasks.filter(t =>
    currentFaculty ? t.assignedTo === currentFaculty.id : true
  );

  const totalCount = facultyTasks.length;
  const completedCount = facultyTasks.filter(t => t.status === 'completed').length;
  const pendingCount = facultyTasks.filter(t => t.status === 'pending').length;
  const highPriorityCount = facultyTasks.filter(t => t.priority === 'High').length;

  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filter by status tab & search query
  const filteredTasks = facultyTasks.filter(t => {
    let matchesStatus = true;
    if (filterStatus === 'completed') matchesStatus = t.status === 'completed';
    if (filterStatus === 'pending') matchesStatus = t.status === 'pending';
    if (filterStatus === 'high_priority') matchesStatus = t.priority === 'High';

    let matchesSearch = true;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const titleMatch = t.title.toLowerCase().includes(q);
      const descMatch = t.description?.toLowerCase().includes(q) || false;
      const noteMatch = t.completionNote?.toLowerCase().includes(q) || false;
      matchesSearch = titleMatch || descMatch || noteMatch;
    }

    return matchesStatus && matchesSearch;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Pinned Top Navigation Bar */}
      <View style={[styles.topHeader, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
        <View style={styles.headerLeftGroup}>
          <Icon name="clipboard" size={18} color={colors.secondary} />
          <Text style={[styles.topHeaderTitle, { color: colors.text }]}>Task History Console</Text>
        </View>
      </View>


      {/* Control Bar Container */}
      <View style={[styles.controlsBox, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
        {/* Search Bar */}
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.surface, borderColor: colors.inputBorder },
          ]}
        >
          <Icon name="clipboard" size={14} color={colors.subText} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search tasks by title, description, or notes..."
            placeholderTextColor={colors.subText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
              <Icon name="close" size={13} color={colors.subText} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Overview Metrics Strip */}
        <View style={styles.metricsStrip}>
          <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
            <Text style={[styles.metricNumber, { color: colors.text }]}>{totalCount}</Text>
            <Text style={[styles.metricLabel, { color: colors.subText }]}>Total Logs</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
            <Text style={[styles.metricNumber, { color: '#10B981' }]}>{completedCount}</Text>
            <Text style={[styles.metricLabel, { color: colors.subText }]}>Completed</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
            <Text style={[styles.metricNumber, { color: colors.primary }]}>{completionRate}%</Text>
            <Text style={[styles.metricLabel, { color: colors.subText }]}>Success Rate</Text>
          </View>
        </View>



        {/* 3. Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              filterStatus === 'all'
                ? { backgroundColor: colors.primary }
                : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder },
            ]}
            onPress={() => setFilterStatus('all')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterChipText, filterStatus === 'all' ? styles.activeFilterText : { color: colors.subText }]}>
              All ({totalCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              filterStatus === 'completed'
                ? { backgroundColor: '#10B981' }
                : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder },
            ]}
            onPress={() => setFilterStatus('completed')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterChipText, filterStatus === 'completed' ? styles.activeFilterText : { color: colors.subText }]}>
              Completed ({completedCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              filterStatus === 'pending'
                ? { backgroundColor: '#F59E0B' }
                : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder },
            ]}
            onPress={() => setFilterStatus('pending')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterChipText, filterStatus === 'pending' ? styles.activeFilterText : { color: colors.subText }]}>
              Pending ({pendingCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              filterStatus === 'high_priority'
                ? { backgroundColor: '#EF4444' }
                : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder },
            ]}
            onPress={() => setFilterStatus('high_priority')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterChipText, filterStatus === 'high_priority' ? styles.activeFilterText : { color: colors.subText }]}>
              High Priority ({highPriorityCount})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 4. History List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconCircle, { backgroundColor: colors.surface }]}>
              <Icon name="clipboard" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No History Logs Found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.subText }]}>
              {searchQuery
                ? `No tasks matching "${searchQuery}".`
                : 'No task records available for the selected filter.'}
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

          // Parse metadata tags if formatted note exists e.g. [Students Present: 45 | Session: Lab Session]
          let parsedNote = item.completionNote || '';
          let metadataTag = '';
          if (parsedNote.startsWith('[')) {
            const closingBracketIndex = parsedNote.indexOf(']');
            if (closingBracketIndex !== -1) {
              metadataTag = parsedNote.substring(1, closingBracketIndex);
              parsedNote = parsedNote.substring(closingBracketIndex + 1).trim();
            }
          }

          return (
            <View
              style={[
                styles.taskCard,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
                isDone && styles.taskCardDoneBorder,
              ]}
            >
              <View style={styles.cardMainPadding}>

                {/* Header Title Row */}
                <View style={styles.titleRow}>
                  <Text style={[styles.taskTitle, { color: colors.text }]}>{item.title}</Text>
                  <View style={[styles.statusBadge, isDone ? styles.doneBadgeBg : styles.pendingBadgeBg]}>
                    <Icon name={isDone ? 'check' : 'clock'} size={9} color={isDone ? '#10B981' : '#F59E0B'} />
                    <Text style={[styles.statusBadgeText, isDone ? styles.doneText : styles.pendingText]}>
                      {isDone ? 'Completed' : 'Pending'}
                    </Text>
                  </View>
                </View>

                {item.description ? (
                  <Text style={[styles.taskDesc, { color: colors.subText }]}>{item.description}</Text>
                ) : null}

                {/* Metadata Row: Date, Time, Priority, AssignedBy */}
                <View style={[styles.metaRow, { backgroundColor: colors.surface }]}>
                  <View style={styles.metaChip}>
                    <Icon name="calendar" size={11} color={colors.primary} />
                    <Text style={[styles.metaText, { color: colors.subText }]}>{item.date}</Text>
                  </View>
                  <View style={styles.metaChip}>
                    <Icon name="clock" size={11} color={colors.subText} />
                    <Text style={[styles.metaText, { color: colors.subText }]}>
                      {item.startTime} - {item.endTime}
                    </Text>
                  </View>
                  <View style={styles.metaChip}>
                    <Icon name={priorityIcon} size={11} color={priorityColor} />
                    <Text style={[styles.metaText, { color: priorityColor, fontWeight: '700' }]}>
                      {item.priority}
                    </Text>
                  </View>
                </View>

                {/* Outcome & Submitted Remarks Section */}
                {isDone ? (
                  <View style={[styles.remarkBox, { backgroundColor: 'rgba(16, 185, 129, 0.08)' }]}>
                    <View style={styles.remarkHeaderRow}>
                      <View style={styles.remarkHeaderLeft}>
                        <View style={styles.remarkCheckCircle}>
                          <Icon name="check" size={9} color="#FFFFFF" />
                        </View>
                        <Text style={styles.remarkHeader}>Faculty Verification Report</Text>
                      </View>
                      {item.completedAt && (
                        <Text style={[styles.completedAtText, { color: colors.subText }]}>
                          {new Date(item.completedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      )}
                    </View>

                    {/* Metadata tags (e.g. Student attendance / session mode) */}
                    {metadataTag ? (
                      <View style={styles.attendanceMetaPill}>
                        <Icon name="users" size={11} color="#10B981" />
                        <Text style={styles.attendanceMetaText}>{metadataTag}</Text>
                      </View>
                    ) : null}

                    {parsedNote ? (
                      <Text style={[styles.remarkText, { color: colors.text }]}>"{parsedNote}"</Text>
                    ) : (
                      <Text style={[styles.remarkText, { color: colors.subText }]}>
                        No written notes attached.
                      </Text>
                    )}
                  </View>
                ) : (
                  <View style={[styles.pendingNoticeBox, { backgroundColor: 'rgba(245, 158, 11, 0.08)' }]}>
                    <Icon name="clock" size={12} color="#F59E0B" />
                    <Text style={styles.pendingNoticeText}>
                      Scheduled task pending completion report.
                    </Text>
                  </View>
                )}
              </View>
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
  topHeader: {
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
  },
  topHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  quickThemeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  quickThemeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  controlsBox: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 9,
    fontSize: 13,
  },
  clearSearchBtn: {
    padding: 4,
  },
  clearSearchText: {
    fontSize: 14,
    fontWeight: '700',
  },
  metricsStrip: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  metricNumber: {
    fontSize: 16,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  filterRow: {
    gap: 8,
    paddingBottom: 2,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
  },
  taskCard: {
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  taskCardDoneBorder: {
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  cardMainPadding: {
    padding: 14,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  doneBadgeBg: { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
  pendingBadgeBg: { backgroundColor: 'rgba(245, 158, 11, 0.15)' },
  statusBadgeText: { fontSize: 10, fontWeight: '700' },
  doneText: { color: '#10B981' },
  pendingText: { color: '#F59E0B' },
  taskDesc: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 7,
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
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
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
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  remarkHeader: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  attendanceMetaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 5,
    marginBottom: 6,
  },
  attendanceMetaText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  remarkText: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 17,
  },
  completedAtText: {
    fontSize: 10,
  },
  pendingNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    gap: 6,
  },
  pendingNoticeText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
    paddingHorizontal: 20,
  },
});

