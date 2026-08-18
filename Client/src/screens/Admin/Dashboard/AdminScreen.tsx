import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  ScrollView,
} from 'react-native';
import { Task, User, Priority, NotificationItem, NotificationType } from '../../../types';
import { CalendarStrip } from '../../../components/common/CalendarStrip';
import { AssignTaskModal } from '../../../components/modals/AssignTaskModal';
import { useTheme } from '../../../context/ThemeContext';
import { Icon } from '../../../components/common/Icon';
import { getAvatarUrl } from '../../../services/api';

interface AdminScreenProps {
  tasks: Task[];
  allFaculty: User[];
  notifications?: NotificationItem[];
  onMarkNotificationRead?: (id: string) => void;
  onMarkAllNotificationsRead?: () => void;
  onClearReadNotifications?: () => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onAssignTask: (taskData: {
    title: string;
    description: string;
    assignedTo: string | string[];
    date: string;
    startTime: string;
    endTime: string;
    priority: Priority;
  }) => void;
  onNavigateToAssignScreen?: () => void;
  onLogout?: () => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({
  tasks,
  allFaculty,
  notifications = [],
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onClearReadNotifications,
  selectedDate,
  onSelectDate,
  onAssignTask,
  onNavigateToAssignScreen,
}) => {
  const { colors } = useTheme();
  const [filterFacultyId, setFilterFacultyId] = useState<string>('all');
  const [showAllDates, setShowAllDates] = useState<boolean>(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [notifModalVisible, setNotifModalVisible] = useState(false);

  const unreadNotifCount = notifications.filter(n => !n.isRead).length;

  // Helper to normalize YYYY-MM-DD string
  const normalizeDateStr = (rawDate?: string) => {
    if (!rawDate) return '';
    return rawDate.split('T')[0].split(' ')[0].trim();
  };

  // Calculate task counts per date for CalendarStrip & Active Dates selector
  const taskCountsByDate = tasks.reduce((acc, t) => {
    const d = normalizeDateStr(t.date);
    if (d) {
      acc[d] = (acc[d] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const activeDatesWithData = Object.keys(taskCountsByDate).sort();

  // Filter tasks by date and faculty
  const filteredTasks = tasks.filter(t => {
    const taskDate = normalizeDateStr(t.date);
    const targetDate = normalizeDateStr(selectedDate);
    const matchesDate = showAllDates || taskDate === targetDate;
    const matchesFaculty = filterFacultyId === 'all' || t.assignedTo === filterFacultyId;
    return matchesDate && matchesFaculty;
  });

  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(t => t.status === 'completed').length;
  const pendingTasks = totalTasks - completedTasks;

  const handleAssignBtnClick = () => {
    if (onNavigateToAssignScreen) {
      onNavigateToAssignScreen();
    } else {
      setAssignModalVisible(true);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Pinned Top Bar with Bell Icon */}
      <View style={[styles.topBarHeader, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
        <View style={styles.topBarTitleGroup}>
          <Icon name="shield" size={18} color={colors.primary} />
          <Text style={[styles.topBarTitle, { color: colors.text }]}>Admin Workstation</Text>
        </View>

        {/* Bell Icon for Notifications */}
        <TouchableOpacity
          style={[styles.bellBtn, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
          onPress={() => setNotifModalVisible(true)}
          activeOpacity={0.8}
        >
          <Icon name="bell" size={18} color={unreadNotifCount > 0 ? colors.primary : colors.subText} />
          {unreadNotifCount > 0 && (
            <View style={styles.bellBadgePill}>
              <Text style={styles.bellBadgeText}>{unreadNotifCount > 9 ? '9+' : unreadNotifCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Date Navigation Calendar Strip */}
      <CalendarStrip
        selectedDate={selectedDate}
        onSelectDate={d => {
          setShowAllDates(false);
          onSelectDate(d);
        }}
        taskCountsByDate={taskCountsByDate}
      />

      {/* Filter & Primary Action Header */}
      <View style={[styles.actionHeader, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
        {/* Faculty Filter Dropdown */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterDropdown, { backgroundColor: colors.surface, borderColor: colors.inputBorder, flex: 1 }]}
            onPress={() => {
              const facultyIds = ['all', ...allFaculty.map(f => f.id)];
              const currentIndex = facultyIds.indexOf(filterFacultyId);
              const nextIndex = (currentIndex + 1) % facultyIds.length;
              setFilterFacultyId(facultyIds[nextIndex]);
            }}
            activeOpacity={0.8}
          >
            <View style={styles.facultyFilterLeft}>
              <Icon name="users" size={14} color={colors.primary} />
              <Text style={[styles.filterDropdownText, { color: colors.text, marginLeft: 6 }]} numberOfLines={1}>
                {filterFacultyId === 'all'
                  ? 'All Faculty Members'
                  : allFaculty.find(f => f.id === filterFacultyId)?.name}
              </Text>
            </View>
            <View style={{ marginLeft: 6 }}>
              <Icon name="refresh" size={13} color={colors.primary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Primary CTA: Assign Task */}
        <TouchableOpacity
          style={[styles.assignTaskBtn, { backgroundColor: colors.primary }]}
          onPress={handleAssignBtnClick}
          activeOpacity={0.85}
        >
          <View style={styles.btnContentRow}>
            <Icon name="plus" size={16} color="#FFFFFF" />
            <Text style={styles.assignTaskBtnText}>Assign New Faculty Task</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Overview Stat Metrics Cards */}
      <View style={styles.metricsGrid}>
        <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.metricHeader}>
            <View style={[styles.iconBadge, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
              <Icon name="calendar" size={14} color={colors.primary} />
            </View>
            <Text style={[styles.metricNumber, { color: colors.text }]}>{totalTasks}</Text>
          </View>
          <Text style={[styles.metricLabel, { color: colors.subText }]}>Total Scheduled</Text>
        </View>

        <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.metricHeader}>
            <View style={[styles.iconBadge, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Icon name="clock" size={14} color="#F59E0B" />
            </View>
            <Text style={[styles.metricNumber, styles.pendingColor]}>{pendingTasks}</Text>
          </View>
          <Text style={[styles.metricLabel, { color: colors.subText }]}>Pending Action</Text>
        </View>

        <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.metricHeader}>
            <View style={[styles.iconBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Icon name="check" size={14} color="#10B981" />
            </View>
            <Text style={[styles.metricNumber, styles.completedColor]}>{completedTasks}</Text>
          </View>
          <Text style={[styles.metricLabel, { color: colors.subText }]}>Completed</Text>
        </View>
      </View>

      {/* Task Schedule Timeline */}
      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconBox, { backgroundColor: colors.surface }]}>
              <Icon name="calendar" size={38} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitleText, { color: colors.text }]}>No Tasks Scheduled</Text>
            <Text style={[styles.emptySubtitleText, { color: colors.subText }]}>
              {tasks.length > 0
                ? `No tasks found for ${selectedDate}. There are ${tasks.length} task(s) on other dates.`
                : 'No active tasks found in database. Tap above to assign a new academic duty.'}
            </Text>

            {tasks.length > 0 && !showAllDates && (
              <TouchableOpacity
                style={[
                  styles.assignTaskBtn,
                  { backgroundColor: colors.primary, marginTop: 14, paddingHorizontal: 20 },
                ]}
                onPress={() => setShowAllDates(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.assignTaskBtnText}>Show All {tasks.length} Tasks</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        renderItem={({ item }) => {
          const faculty = allFaculty.find(f => f.id === item.assignedTo);
          const isCompleted = item.status === 'completed';

          // Avatar initials and color
          const facultyName = item.assignedToName || faculty?.name || 'Unknown';
          const initials = facultyName
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

          const avatarColors = [
            '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B',
            '#10B981', '#3B82F6', '#EF4444', '#14B8A6',
          ];
          const avatarBg = avatarColors[facultyName.length % avatarColors.length];

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
                styles.taskCardItem,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}
            >
              {/* Time Column */}
              <View style={[styles.timeColumnBox, { borderRightColor: colors.cardBorder }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="clock" size={12} color={colors.text} />
                  <Text style={[styles.startTimeText, { color: colors.text }]}>{item.startTime}</Text>
                </View>
                <Text style={[styles.endTimeText, { color: colors.mutedText }]}>to {item.endTime}</Text>
                
                <View
                  style={[
                    styles.statusPill,
                    isCompleted ? styles.statusDonePillBg : styles.statusPendingPillBg,
                  ]}
                >
                  <Icon name={isCompleted ? 'check' : 'clock'} size={8} color={isCompleted ? '#10B981' : '#F59E0B'} />
                  <Text
                    style={[
                      styles.statusPillText,
                      isCompleted ? styles.completedColor : styles.pendingColor,
                    ]}
                  >
                    {isCompleted ? 'Done' : 'Pending'}
                  </Text>
                </View>
              </View>

              {/* Task Details Content */}
              <View style={styles.taskDetailContent}>
                <View style={styles.cardHeaderRow}>
                  <Text style={[styles.taskTitleText, { color: colors.text }]}>{item.title}</Text>
                  <View style={[styles.priorityBadge, priorityStyle]}>
                    <Icon name={priorityIcon} size={8} color={priorityTextStyle.color} />
                    <Text style={[styles.priorityBadgeText, priorityTextStyle]}>
                      {item.priority}
                    </Text>
                  </View>
                </View>

                {item.date ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, marginBottom: 4 }}>
                    <Icon name="calendar" size={10} color={colors.primary} />
                    <Text style={{ fontSize: 11, fontWeight: '600', color: colors.primary, marginLeft: 4 }}>
                      {normalizeDateStr(item.date)}
                    </Text>
                  </View>
                ) : null}

                {item.description ? (
                  <Text style={[styles.taskDescText, { color: colors.subText }]}>{item.description}</Text>
                ) : null}

                {/* Faculty Assignee Row with Avatar */}
                <View style={[styles.facultyRowBox, { backgroundColor: colors.surface }]}>
                  {faculty?.avatar ? (
                    <Image source={{ uri: getAvatarUrl(faculty.avatar) }} style={styles.facultyAvatarImage} />
                  ) : (
                    <View style={[styles.facultyAvatarCircle, { backgroundColor: avatarBg }]}>
                      <Text style={styles.facultyAvatarInitials}>{initials}</Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.facultyNameText, { color: colors.text }]}>{item.assignedToName}</Text>
                    <Text style={[styles.facultyDeptText, { color: colors.subText }]}>
                      {faculty?.department || 'Academic Faculty'}
                    </Text>
                  </View>
                  <View style={[styles.assigneeBadge, { backgroundColor: `${avatarBg}18` }]}>
                    <Text style={[styles.assigneeBadgeText, { color: avatarBg }]}>Assigned</Text>
                  </View>
                </View>

                {/* Completion Remarks Box */}
                {isCompleted && item.completionNote ? (
                  <View style={styles.completionRemarkContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Icon name="clipboard" size={12} color="#10B981" />
                      <Text style={styles.remarkHeaderLabel}>Faculty Completion Remarks:</Text>
                    </View>
                    <Text style={[styles.remarkNoteQuote, { color: colors.text }]}>
                      "{item.completionNote}"
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          );
        }}
      />

      {/* Assign Task Modal */}
      <AssignTaskModal
        visible={assignModalVisible}
        allFaculty={allFaculty}
        defaultDate={selectedDate}
        onClose={() => setAssignModalVisible(false)}
        onSubmitTask={onAssignTask}
      />

      {/* Admin Notification Alerts Modal */}
      <Modal
        visible={notifModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setNotifModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.notifModalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            {/* Header */}
            <View style={[styles.notifModalHeader, { borderBottomColor: colors.cardBorder }]}>
              <View style={styles.notifHeaderLeft}>
                <View style={[styles.bellIconCircle, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                  <Icon name="bell" size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.notifModalTitle, { color: colors.text }]}>Admin Activity & Alerts</Text>
                  <Text style={[styles.notifModalSubtitle, { color: colors.subText }]}>
                    {unreadNotifCount > 0 ? `${unreadNotifCount} unread update(s)` : 'All alerts caught up'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.closeModalCircle, { backgroundColor: colors.surface }]}
                onPress={() => setNotifModalVisible(false)}
              >
                <Icon name="close" size={14} color={colors.subText} />
              </TouchableOpacity>
            </View>

            {/* Quick Actions Row */}
            {notifications.length > 0 && (
              <View style={[styles.notifActionsRow, { backgroundColor: colors.surface }]}>
                {onMarkAllNotificationsRead && (
                  <TouchableOpacity
                    onPress={onMarkAllNotificationsRead}
                    style={styles.notifActionBtn}
                    activeOpacity={0.8}
                  >
                    <Icon name="check" size={12} color={colors.primary} />
                    <Text style={[styles.notifActionBtnText, { color: colors.primary }]}>Mark All Read</Text>
                  </TouchableOpacity>
                )}
                {onClearReadNotifications && (
                  <TouchableOpacity
                    onPress={onClearReadNotifications}
                    style={styles.notifActionBtn}
                    activeOpacity={0.8}
                  >
                    <Icon name="edit" size={12} color={colors.subText} />
                    <Text style={[styles.notifActionBtnText, { color: colors.subText }]}>Clear Read</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Notifications List */}
            <ScrollView
              style={styles.notifScrollArea}
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            >
              {notifications.length === 0 ? (
                <View style={styles.emptyNotifBox}>
                  <Icon name="bell" size={32} color={colors.mutedText} />
                  <Text style={[styles.emptyNotifTitle, { color: colors.text }]}>No Recent Alerts</Text>
                  <Text style={[styles.emptyNotifSub, { color: colors.subText }]}>
                    Faculty task logs and assignments will appear here in real-time.
                  </Text>
                </View>
              ) : (
                notifications.map(item => {
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.notifItemCard,
                        {
                          backgroundColor: colors.surface,
                          borderColor: !item.isRead ? colors.primary : colors.cardBorder,
                        },
                      ]}
                      onPress={() => onMarkNotificationRead && onMarkNotificationRead(item.id)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.notifItemRow}>
                        <View
                          style={[
                            styles.notifTypeCircle,
                            {
                              backgroundColor: item.type === 'urgent' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            },
                          ]}
                        >
                          <Icon
                            name={item.type === 'urgent' ? 'alert' : 'clipboard'}
                            size={14}
                            color={item.type === 'urgent' ? '#EF4444' : '#10B981'}
                          />
                        </View>
                        <View style={styles.notifItemContent}>
                          <View style={styles.notifItemTitleRow}>
                            <Text style={[styles.notifItemTitle, { color: colors.text }]} numberOfLines={1}>
                              {item.title}
                            </Text>
                            {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
                          </View>
                          <Text style={[styles.notifItemMessage, { color: colors.subText }]}>{item.message}</Text>
                          <View style={styles.notifItemFooter}>
                            <Text style={[styles.notifItemTimestamp, { color: colors.mutedText }]}>
                              {item.timestamp}
                            </Text>
                            {item.senderName && (
                              <Text style={[styles.notifItemSender, { color: colors.primary }]}>
                                By: {item.senderName}
                              </Text>
                            )}
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  actionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  filterTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 5,
  },
  filterDropdown: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterDropdownText: {
    fontSize: 13,
    fontWeight: '700',
  },
  activeDatesContainer: {
    marginBottom: 10,
  },
  activeDatesLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeDatesScroll: {
    gap: 6,
  },
  facultyFilterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  assignTaskBtn: {
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  btnContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assignTaskBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  metricsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  metricCard: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    marginRight: 8,
    borderWidth: 1,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricNumber: {
    fontSize: 20,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
  },
  pendingColor: {
    color: '#F59E0B',
  },
  completedColor: {
    color: '#10B981',
  },
  listPadding: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  taskCardItem: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  timeColumnBox: {
    width: 82,
    borderRightWidth: 1,
    paddingRight: 10,
    justifyContent: 'flex-start',
  },
  startTimeText: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  endTimeText: {
    fontSize: 11,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 10,
    alignSelf: 'flex-start',
    gap: 3,
  },
  statusPendingPillBg: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  statusDonePillBg: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  taskDetailContent: {
    flex: 1,
    paddingLeft: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskTitleText: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  priorityHighTag: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  priorityMediumTag: {
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  priorityLowTag: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  priorityBadgeText: {
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
  taskDescText: {
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
  facultyRowBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 8,
    borderRadius: 10,
  },
  facultyAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  facultyAvatarInitials: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  facultyNameText: {
    fontSize: 12,
    fontWeight: '700',
  },
  facultyDeptText: {
    fontSize: 10,
  },
  completionRemarkContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  facultyAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  assigneeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  assigneeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  remarkHeaderLabel: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  remarkNoteQuote: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 44,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitleText: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitleText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 24,
  },
  topBarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  topBarTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  bellBadgePill: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  bellBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  notifModalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    maxHeight: '85%',
    minHeight: '50%',
    paddingBottom: 20,
  },
  notifModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  notifHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bellIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifModalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  notifModalSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  closeModalCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeModalText: {
    fontSize: 16,
    fontWeight: '700',
  },
  notifActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(156, 163, 175, 0.15)',
  },
  notifActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  notifActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  notifScrollArea: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  emptyNotifBox: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyNotifTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptyNotifSub: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  notifItemCard: {
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  notifItemRow: {
    flexDirection: 'row',
    gap: 10,
  },
  notifTypeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifItemContent: {
    flex: 1,
  },
  notifItemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notifItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    marginRight: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notifItemMessage: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 16,
  },
  notifItemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  notifItemTimestamp: {
    fontSize: 10,
  },
  notifItemSender: {
    fontSize: 10,
    fontWeight: '700',
  },
});
