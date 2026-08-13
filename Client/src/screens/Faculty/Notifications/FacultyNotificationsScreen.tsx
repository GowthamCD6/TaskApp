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
import { NotificationItem, NotificationType } from '../../../types';
import { useTheme } from '../../../context/ThemeContext';
import { Icon } from '../../../components/common/Icon';

interface FacultyNotificationsScreenProps {
  notifications: NotificationItem[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onClearRead: () => void;
}

type FilterCategory = 'all' | 'unread' | 'task_assigned' | 'urgent';

export const FacultyNotificationsScreen: React.FC<FacultyNotificationsScreenProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearRead,
}) => {
  const { colors } = useTheme();
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const totalCount = notifications.length;
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const urgentCount = notifications.filter(n => n.type === 'urgent').length;
  const taskAlertsCount = notifications.filter(n => n.type === 'task_assigned').length;

  const filteredNotifications = notifications.filter(n => {
    let matchesFilter = true;
    if (activeFilter === 'unread') matchesFilter = !n.isRead;
    if (activeFilter === 'task_assigned') matchesFilter = n.type === 'task_assigned';
    if (activeFilter === 'urgent') matchesFilter = n.type === 'urgent';

    let matchesSearch = true;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      matchesSearch =
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        (n.senderName ? n.senderName.toLowerCase().includes(q) : false);
    }

    return matchesFilter && matchesSearch;
  });

  const getNotificationIconDetails = (type: NotificationType) => {
    switch (type) {
      case 'urgent':
        return { name: 'alert' as const, color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' };
      case 'task_assigned':
        return { name: 'clipboard' as const, color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' };
      case 'broadcast':
        return { name: 'users' as const, color: '#6366F1', bg: 'rgba(99, 102, 241, 0.15)' };
      case 'reminder':
      default:
        return { name: 'clock' as const, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 1. Pinned Top Navigation Header */}
      <View style={[styles.topHeader, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
        <View style={styles.headerLeftGroup}>
          <Icon name="alert" size={18} color={colors.secondary} />
          <Text style={[styles.topHeaderTitle, { color: colors.text }]}>Faculty Notifications</Text>
        </View>

        {unreadCount > 0 && (
          <View style={styles.unreadBadgePill}>
            <Text style={styles.unreadBadgePillText}>{unreadCount} New</Text>
          </View>
        )}
      </View>

      {/* 2. Controls & Filter Section */}
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
            placeholder="Search alerts by title or message..."
            placeholderTextColor={colors.subText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
              <Text style={[styles.clearSearchText, { color: colors.subText }]}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Metrics Overview Strip */}
        <View style={styles.metricsStrip}>
          <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
            <Text style={[styles.metricNumber, { color: colors.text }]}>{totalCount}</Text>
            <Text style={[styles.metricLabel, { color: colors.subText }]}>Total Alerts</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
            <Text style={[styles.metricNumber, { color: unreadCount > 0 ? '#F59E0B' : colors.text }]}>
              {unreadCount}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.subText }]}>Unread</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
            <Text style={[styles.metricNumber, { color: '#EF4444' }]}>{urgentCount}</Text>
            <Text style={[styles.metricLabel, { color: colors.subText }]}>Urgent</Text>
          </View>
        </View>

        {/* Action Buttons & Filter Row */}
        <View style={styles.actionHeaderRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                activeFilter === 'all'
                  ? { backgroundColor: colors.secondary }
                  : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder },
              ]}
              onPress={() => setActiveFilter('all')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === 'all' ? styles.activeFilterText : { color: colors.subText },
                ]}
              >
                All ({totalCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterChip,
                activeFilter === 'unread'
                  ? { backgroundColor: '#F59E0B' }
                  : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder },
              ]}
              onPress={() => setActiveFilter('unread')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === 'unread' ? styles.activeFilterText : { color: colors.subText },
                ]}
              >
                Unread ({unreadCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterChip,
                activeFilter === 'task_assigned'
                  ? { backgroundColor: '#10B981' }
                  : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder },
              ]}
              onPress={() => setActiveFilter('task_assigned')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === 'task_assigned' ? styles.activeFilterText : { color: colors.subText },
                ]}
              >
                Task Alerts ({taskAlertsCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterChip,
                activeFilter === 'urgent'
                  ? { backgroundColor: '#EF4444' }
                  : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder },
              ]}
              onPress={() => setActiveFilter('urgent')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === 'urgent' ? styles.activeFilterText : { color: colors.subText },
                ]}
              >
                Urgent ({urgentCount})
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Quick Batch Actions */}
        <View style={styles.batchActionsRow}>
          <TouchableOpacity onPress={onMarkAllAsRead} activeOpacity={0.8} style={styles.batchActionBtn}>
            <Icon name="check" size={12} color={colors.secondary} />
            <Text style={[styles.batchActionText, { color: colors.secondary }]}>Mark All as Read</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClearRead} activeOpacity={0.8} style={styles.batchActionBtn}>
            <Icon name="edit" size={12} color={colors.subText} />
            <Text style={[styles.batchActionText, { color: colors.subText }]}>Clear Read</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. Notifications Feed List */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconCircle, { backgroundColor: colors.surface }]}>
              <Icon name="alert" size={32} color={colors.secondary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Notifications</Text>
            <Text style={[styles.emptySubtitle, { color: colors.subText }]}>
              {searchQuery
                ? `No alerts matching "${searchQuery}".`
                : 'You are all caught up! No active notifications found.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const iconDetails = getNotificationIconDetails(item.type);

          return (
            <TouchableOpacity
              style={[
                styles.notificationCard,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
                !item.isRead && [styles.unreadCard, { borderColor: 'rgba(16, 185, 129, 0.4)' }],
              ]}
              onPress={() => onMarkAsRead(item.id)}
              activeOpacity={0.85}
            >
              <View style={styles.cardRow}>
                {/* Icon Pillar */}
                <View style={[styles.typeIconBox, { backgroundColor: iconDetails.bg }]}>
                  <Icon name={iconDetails.name} size={16} color={iconDetails.color} />
                </View>

                {/* Main Text Content */}
                <View style={styles.cardContent}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    {!item.isRead && <View style={styles.unreadDot} />}
                  </View>

                  <Text style={[styles.cardMessage, { color: colors.subText }]}>{item.message}</Text>

                  {/* Footer Meta: Time & Sender */}
                  <View style={styles.cardFooter}>
                    <View style={styles.metaTimeGroup}>
                      <Icon name="clock" size={10} color={colors.subText} />
                      <Text style={[styles.metaTimeText, { color: colors.subText }]}>
                        {item.timestamp}
                      </Text>
                    </View>

                    {item.senderName ? (
                      <Text style={[styles.senderText, { color: colors.secondary }]}>
                        From: {item.senderName}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
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
  unreadBadgePill: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unreadBadgePillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  controlsBox: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
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
  actionHeaderRow: {
    marginBottom: 10,
  },
  filterRow: {
    gap: 8,
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
  batchActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  batchActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  batchActionText: {
    fontSize: 11,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
  },
  notificationCard: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  unreadCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  typeIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  cardContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginLeft: 6,
  },
  cardMessage: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaTimeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaTimeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  senderText: {
    fontSize: 10,
    fontWeight: '700',
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
