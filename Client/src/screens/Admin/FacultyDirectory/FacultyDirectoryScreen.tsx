import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Image,
  Alert,
  Animated,
  RefreshControl,
  TextInput,
} from 'react-native';
import { User, Task } from '../../../types';
import { AddFacultyModal } from '../../../components/modals/AddFacultyModal';
import { EditFacultyModal } from '../../../components/modals/EditFacultyModal';
import { useTheme } from '../../../context/ThemeContext';
import { Icon } from '../../../components/common/Icon';
import { getAvatarUrl } from '../../../services/api';

// ==========================================
// 🌟 Shimmering Skeleton Card Component
// ==========================================
const SkeletonFacultyCard: React.FC = () => {
  const { colors, isDark } = useTheme();
  const pulseAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const placeholderBg = isDark ? '#334155' : '#E2E8F0';

  return (
    <View style={[styles.facultyCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      {/* Header Row */}
      <View style={styles.cardHeaderRow}>
        {/* Avatar Placeholder */}
        <Animated.View
          style={[
            styles.avatarCircle,
            { backgroundColor: placeholderBg, opacity: pulseAnim },
          ]}
        />

        <View style={styles.flex1}>
          {/* Name & Dept Placeholder */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Animated.View
              style={{
                width: '55%',
                height: 16,
                borderRadius: 6,
                backgroundColor: placeholderBg,
                opacity: pulseAnim,
              }}
            />
            <Animated.View
              style={{
                width: 60,
                height: 16,
                borderRadius: 8,
                backgroundColor: placeholderBg,
                opacity: pulseAnim,
              }}
            />
          </View>

          {/* Title Placeholder */}
          <Animated.View
            style={{
              width: '40%',
              height: 12,
              borderRadius: 4,
              backgroundColor: placeholderBg,
              opacity: pulseAnim,
              marginBottom: 8,
            }}
          />

          {/* Details Row Placeholder */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Animated.View
              style={{
                width: 75,
                height: 14,
                borderRadius: 4,
                backgroundColor: placeholderBg,
                opacity: pulseAnim,
              }}
            />
            <Animated.View
              style={{
                width: 110,
                height: 14,
                borderRadius: 4,
                backgroundColor: placeholderBg,
                opacity: pulseAnim,
              }}
            />
          </View>
        </View>

        {/* Edit Button Placeholder */}
        <Animated.View
          style={[
            styles.editIconBtn,
            { backgroundColor: placeholderBg, borderColor: colors.inputBorder, opacity: pulseAnim },
          ]}
        />
      </View>

      {/* Divider */}
      <View style={[styles.cardDivider, { backgroundColor: colors.cardBorder }]} />

      {/* Workload Stats Bar Placeholder */}
      <View style={[styles.workloadBar, { backgroundColor: colors.surface }]}>
        <Animated.View
          style={{
            flex: 1,
            height: 28,
            borderRadius: 8,
            backgroundColor: placeholderBg,
            opacity: pulseAnim,
            marginRight: 8,
          }}
        />
        <Animated.View
          style={{
            flex: 1,
            height: 28,
            borderRadius: 8,
            backgroundColor: placeholderBg,
            opacity: pulseAnim,
            marginRight: 8,
          }}
        />
        <Animated.View
          style={{
            flex: 1,
            height: 28,
            borderRadius: 8,
            backgroundColor: placeholderBg,
            opacity: pulseAnim,
            marginRight: 8,
          }}
        />
        <Animated.View
          style={{
            width: 45,
            height: 28,
            borderRadius: 8,
            backgroundColor: placeholderBg,
            opacity: pulseAnim,
          }}
        />
      </View>

      {/* Action Buttons Placeholder */}
      <View style={styles.actionBtnRow}>
        <Animated.View
          style={[
            styles.quickAssignBtn,
            { backgroundColor: placeholderBg, opacity: pulseAnim },
          ]}
        />
        <Animated.View
          style={[
            styles.viewTasksBtn,
            { backgroundColor: placeholderBg, opacity: pulseAnim },
          ]}
        />
      </View>
    </View>
  );
};

// ==========================================
// 📱 Faculty Directory Screen Component
// ==========================================
interface FacultyDirectoryScreenProps {
  allFaculty: User[];
  allTasks: Task[];
  loading?: boolean;
  onRefresh?: () => Promise<void> | void;
  onAddFaculty: (facultyData: {
    name: string;
    email: string;
    department: string;
    title: string;
    avatar?: string;
    regNo?: string;
    password?: string;
  }) => void;
  onAssignTaskForFaculty?: (facultyId: string) => void;
  onUpdateFaculty?: (updatedData: {
    id: string;
    name: string;
    email: string;
    department: string;
    regNo: string;
    title?: string;
    password?: string;
  }) => void;
  onDeleteFaculty?: (id: string) => void;
}

export const FacultyDirectoryScreen: React.FC<FacultyDirectoryScreenProps> = ({
  allFaculty,
  allTasks,
  loading = false,
  onRefresh,
  onAddFaculty,
  onAssignTaskForFaculty,
  onUpdateFaculty,
  onDeleteFaculty,
}) => {
  const { colors, isDark } = useTheme();
  const [selectedFaculty, setSelectedFaculty] = useState<User | null>(null);
  const [editingFaculty, setEditingFaculty] = useState<User | null>(null);
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const showSkeleton = loading && allFaculty.length === 0;

  const handlePullToRefresh = async () => {
    setRefreshing(true);
    if (onRefresh) {
      try {
        await onRefresh();
      } catch (err) {
        console.warn('Refresh error:', err);
      }
    }
    setRefreshing(false);
  };

  const getFacultyTaskStats = (facultyId: string) => {
    const facultyTasks = allTasks.filter(t => t.assignedTo === facultyId);
    const completed = facultyTasks.filter(t => t.status === 'completed').length;
    const pending = facultyTasks.length - completed;
    return { total: facultyTasks.length, completed, pending, tasks: facultyTasks };
  };

  const handleOpenEdit = (faculty: User) => {
    setEditingFaculty(faculty);
    setEditModalVisible(true);
  };

  const handleSaveEdit = (updatedData: {
    id: string;
    name: string;
    email: string;
    department: string;
    regNo: string;
    title?: string;
    password?: string;
  }) => {
    if (onUpdateFaculty) {
      onUpdateFaculty(updatedData);
    }
  };

  // Filter faculty based on search query
  const filteredFaculty = allFaculty.filter(f => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (f.name && f.name.toLowerCase().includes(q)) ||
      (f.department && f.department.toLowerCase().includes(q)) ||
      (f.email && f.email.toLowerCase().includes(q)) ||
      (f.regNo && f.regNo.toLowerCase().includes(q)) ||
      (f.title && f.title.toLowerCase().includes(q))
    );
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Clean & Simple Header */}
      <View style={[styles.cleanHeader, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
        <View style={styles.headerLeftGroup}>
          <Icon name="users" size={18} color={colors.primary} />
          <Text style={[styles.cleanHeaderTitle, { color: colors.text }]}>Faculty Directory</Text>
          {allFaculty.length > 0 && !showSkeleton ? (
            <View style={[styles.countPill, { backgroundColor: `${colors.primary}18` }]}>
              <Text style={[styles.countPillText, { color: colors.primary }]}>{allFaculty.length}</Text>
            </View>
          ) : null}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {/* Quick Refresh Icon Button */}
          {onRefresh ? (
            <TouchableOpacity
              style={[styles.refreshIconBtn, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
              onPress={handlePullToRefresh}
              activeOpacity={0.8}
              disabled={refreshing || showSkeleton}
            >
              <Icon name="refresh" size={14} color={colors.primary} />
            </TouchableOpacity>
          ) : null}

          {/* Add Faculty CTA */}
          <TouchableOpacity
            style={[styles.simpleAddBtn, { backgroundColor: colors.secondary }]}
            onPress={() => setAddModalVisible(true)}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="plus" size={14} color="#FFFFFF" />
              <Text style={styles.simpleAddBtnText}> Add Faculty</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Real-time Search Filter Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.inputBorder }]}>
          <Icon name="users" size={14} color={colors.subText} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search by name, dept, reg. no..."
            placeholderTextColor={colors.subText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon name="close" size={13} color={colors.subText} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Skeleton Loading State */}
      {showSkeleton ? (
        <View style={styles.listContainer}>
          <SkeletonFacultyCard />
          <SkeletonFacultyCard />
          <SkeletonFacultyCard />
        </View>
      ) : (
        /* Roster FlatList with Pull-To-Refresh */
        <FlatList
          data={filteredFaculty}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handlePullToRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={[styles.emptyContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={[styles.emptyIconBg, { backgroundColor: `${colors.primary}15` }]}>
                <Icon name="users" size={28} color={colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {searchQuery ? 'No Matching Faculty Found' : 'No Faculty Members Registered'}
              </Text>
              <Text style={[styles.emptySubText, { color: colors.subText }]}>
                {searchQuery
                  ? `No faculty records matched "${searchQuery}".`
                  : 'Start by adding faculty members to the academic directory.'}
              </Text>
              {!searchQuery && (
                <TouchableOpacity
                  style={[styles.emptyAddBtn, { backgroundColor: colors.secondary }]}
                  onPress={() => setAddModalVisible(true)}
                  activeOpacity={0.85}
                >
                  <Icon name="plus" size={14} color="#FFFFFF" />
                  <Text style={styles.emptyAddBtnText}>Add Faculty Member</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          renderItem={({ item }) => {
            const stats = getFacultyTaskStats(item.id);
            const facultyRegNo = item.regNo || '';
            const initials = (item.name || 'Faculty')
              .split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

            return (
              <TouchableOpacity
                style={[styles.facultyCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                onPress={() => setSelectedFaculty(item)}
                activeOpacity={0.85}
              >
                {/* Card Header Row with Avatar */}
                <View style={styles.cardHeaderRow}>
                  {/* Avatar Circle or Image */}
                  <View style={styles.avatarContainer}>
                    {item.avatar ? (
                      <Image source={{ uri: getAvatarUrl(item.avatar) }} style={styles.avatarImage} />
                    ) : (
                      <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
                        <Text style={styles.avatarInitials}>{initials}</Text>
                      </View>
                    )}
                    {/* Online indicator dot */}
                    <View style={[styles.onlineDot, { borderColor: colors.card }]} />
                  </View>

                  <View style={styles.flex1}>
                    <View style={styles.nameDeptRow}>
                      <Text style={[styles.facultyName, { color: colors.text }]}>{item.name}</Text>
                      {item.department ? (
                        <View style={[styles.deptPill, { backgroundColor: `${colors.primary}18` }]}>
                          <Text style={[styles.deptPillText, { color: colors.primary }]}>{item.department}</Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Title / Role */}
                    <Text style={[styles.facultyTitle, { color: colors.subText }]}>
                      {item.title || 'Faculty Member'}
                    </Text>

                    {/* Details Row: Reg No & Email */}
                    <View style={styles.detailsRow}>
                      {facultyRegNo ? (
                        <View style={styles.detailChip}>
                          <Icon name="user" size={10} color={colors.primary} />
                          <Text style={[styles.regNoVal, { color: colors.primary }]}>{facultyRegNo}</Text>
                        </View>
                      ) : null}

                      {item.email ? (
                        <View style={[styles.detailChip, { flex: 1 }]}>
                          <Icon name="mail" size={10} color={colors.subText} />
                          <Text style={[styles.emailText, { color: colors.subText }]} numberOfLines={1}>
                            {item.email}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>

                  {/* Edit Button Icon */}
                  <TouchableOpacity
                    style={[styles.editIconBtn, { backgroundColor: colors.surface, borderColor: colors.inputBorder }]}
                    onPress={() => handleOpenEdit(item)}
                    activeOpacity={0.8}
                  >
                    <Icon name="edit" size={14} color={colors.primary} />
                  </TouchableOpacity>
                </View>

                {/* Divider */}
                <View style={[styles.cardDivider, { backgroundColor: colors.cardBorder }]} />

                {/* Workload Stats & Action Buttons Bar */}
                <View style={[styles.workloadBar, { backgroundColor: colors.surface }]}>
                  <View style={styles.statPill}>
                    <View style={[styles.statIconBg, { backgroundColor: 'rgba(99, 102, 241, 0.12)' }]}>
                      <Icon name="clipboard" size={10} color={colors.primary} />
                    </View>
                    <View>
                      <Text style={[styles.statNumText, { color: colors.text }]}>{stats.total}</Text>
                      <Text style={[styles.statLabelText, { color: colors.subText }]}>Assigned</Text>
                    </View>
                  </View>

                  <View style={styles.statPill}>
                    <View style={[styles.statIconBg, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
                      <Icon name="clock" size={10} color="#F59E0B" />
                    </View>
                    <View>
                      <Text style={[styles.statNumText, styles.pendingColor]}>{stats.pending}</Text>
                      <Text style={[styles.statLabelText, { color: colors.subText }]}>Pending</Text>
                    </View>
                  </View>

                  <View style={styles.statPill}>
                    <View style={[styles.statIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                      <Icon name="check" size={10} color="#10B981" />
                    </View>
                    <View>
                      <Text style={[styles.statNumText, styles.completedColor]}>{stats.completed}</Text>
                      <Text style={[styles.statLabelText, { color: colors.subText }]}>Done</Text>
                    </View>
                  </View>

                  {/* Completion Rate */}
                  <View style={[styles.completionRatePill, { backgroundColor: `${completionRate >= 70 ? '#10B981' : completionRate >= 40 ? '#F59E0B' : '#EF4444'}15` }]}>
                    <Text style={[styles.completionRateText, { color: completionRate >= 70 ? '#10B981' : completionRate >= 40 ? '#F59E0B' : '#EF4444' }]}>
                      {completionRate}%
                    </Text>
                  </View>
                </View>

                {/* Action Buttons Row */}
                <View style={styles.actionBtnRow}>
                  {onAssignTaskForFaculty ? (
                    <TouchableOpacity
                      style={[styles.quickAssignBtn, { backgroundColor: colors.primary }]}
                      onPress={() => onAssignTaskForFaculty(item.id)}
                      activeOpacity={0.8}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Icon name="plus" size={12} color="#FFFFFF" />
                        <Text style={styles.quickAssignBtnText}>Assign Task</Text>
                      </View>
                    </TouchableOpacity>
                  ) : null}

                  <TouchableOpacity
                    style={[styles.viewTasksBtn, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}
                    onPress={() => setSelectedFaculty(item)}
                    activeOpacity={0.8}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Icon name="calendar" size={12} color={colors.text} />
                      <Text style={[styles.viewTasksBtnText, { color: colors.text }]}>View Schedule</Text>
                      <View style={{ marginLeft: 3 }}>
                        <Icon name="arrow-right" size={12} color={colors.text} />
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Add Faculty Modal */}
      <AddFacultyModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onAddFaculty={onAddFaculty}
      />

      {/* Edit Faculty Modal */}
      <EditFacultyModal
        visible={editModalVisible}
        faculty={editingFaculty}
        onClose={() => {
          setEditModalVisible(false);
          setEditingFaculty(null);
        }}
        onSaveFaculty={handleSaveEdit}
        onDeleteFaculty={onDeleteFaculty}
      />

      {/* Faculty Schedule Modal */}
      {selectedFaculty && (
        <Modal
          visible={!!selectedFaculty}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedFaculty(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalCardContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.modalHeaderRow}>
                <View style={styles.modalHeaderInfoGroup}>
                  {selectedFaculty.avatar ? (
                    <Image
                      source={{ uri: getAvatarUrl(selectedFaculty.avatar) }}
                      style={styles.modalAvatarImage}
                    />
                  ) : (
                    <View style={[styles.avatarCircle, { backgroundColor: colors.primary, marginRight: 12 }]}>
                      <Text style={styles.avatarInitials}>
                        {selectedFaculty.name
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </Text>
                    </View>
                  )}
                  <View style={styles.flex1}>
                    <Text style={[styles.modalFacultyName, { color: colors.text }]}>{selectedFaculty.name}</Text>
                    <Text style={[styles.modalFacultyDept, { color: colors.subText }]}>
                      {selectedFaculty.regNo ? `Reg. No: ${selectedFaculty.regNo} • ` : ''}{selectedFaculty.department}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.modalCloseBtn, { backgroundColor: colors.surface }]}
                  onPress={() => setSelectedFaculty(null)}
                >
                  <Icon name="close" size={14} color={colors.subText} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.modalSectionHeading, { color: colors.primary }]}>
                Assigned Task History ({getFacultyTaskStats(selectedFaculty.id).total} Tasks)
              </Text>

              <FlatList
                data={getFacultyTaskStats(selectedFaculty.id).tasks}
                keyExtractor={t => t.id}
                style={styles.modalTaskFlatList}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <Text style={[styles.noTasksFoundText, { color: colors.mutedText }]}>
                    No tasks assigned to this faculty member yet.
                  </Text>
                }
                renderItem={({ item }) => {
                  const isDone = item.status === 'completed';
                  return (
                    <View style={[styles.modalTaskCardItem, { backgroundColor: colors.surface }]}>
                      <View style={styles.modalTaskHeaderRow}>
                        <Text style={[styles.modalTaskItemTitle, { color: colors.text }]}>{item.title}</Text>
                        <View
                          style={[
                            styles.modalTaskBadgePill,
                            isDone ? styles.doneBadgeBg : styles.pendingBadgeBg,
                          ]}
                        >
                          <Text
                            style={[
                              styles.modalTaskBadgeText,
                              isDone ? styles.completedColor : styles.pendingColor,
                            ]}
                          >
                            {isDone ? 'Completed' : 'Pending'}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.modalTaskDateText, { color: colors.mutedText }]}>
                        Scheduled: {item.date} ({item.startTime} - {item.endTime})
                      </Text>
                      {isDone && item.completionNote ? (
                        <View style={styles.modalRemarkContainer}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Icon name="clipboard" size={12} color="#10B981" />
                            <Text style={styles.modalRemarkHeading}>Faculty Completion Note:</Text>
                          </View>
                          <Text style={[styles.modalRemarkQuoteText, { color: colors.text }]}>
                            "{item.completionNote}"
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  );
                }}
              />

              <TouchableOpacity
                style={[styles.closeModalActionBtn, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}
                onPress={() => setSelectedFaculty(null)}
                activeOpacity={0.8}
              >
                <Text style={[styles.closeModalActionBtnText, { color: colors.text }]}>Close Schedule View</Text>
              </TouchableOpacity>
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
  flex1: {
    flex: 1,
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
    gap: 8,
  },
  cleanHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  countPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  refreshIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  simpleAddBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  simpleAddBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    height: 38,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    marginLeft: 8,
    paddingVertical: 0,
  },
  clearSearchText: {
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyContainer: {
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  facultyCard: {
    borderRadius: 18,
    padding: 0,
    marginBottom: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
  },
  nameDeptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 2,
  },
  facultyName: {
    fontSize: 16,
    fontWeight: '800',
    marginRight: 8,
  },
  facultyTitle: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
  },
  deptPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  deptPillText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  regNoVal: {
    fontSize: 11,
    fontWeight: '700',
  },
  emailText: {
    fontSize: 11,
  },
  editIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  cardDivider: {
    height: 1,
    marginHorizontal: 14,
    opacity: 0.5,
  },
  workloadBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginHorizontal: 14,
    marginTop: 10,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    gap: 6,
  },
  statIconBg: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumText: {
    fontSize: 14,
    fontWeight: '800',
  },
  pendingColor: {
    color: '#F59E0B',
  },
  completedColor: {
    color: '#10B981',
  },
  statLabelText: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 1,
  },
  completionRatePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  completionRateText: {
    fontSize: 11,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 4,
    width: '100%',
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  actionBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
    gap: 8,
  },
  quickAssignBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAssignBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 5,
  },
  viewTasksBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewTasksBtnText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modalCardContainer: {
    borderRadius: 22,
    padding: 20,
    maxHeight: '80%',
    borderWidth: 1,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalHeaderInfoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
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
  closeIconText: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalSectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalTaskFlatList: {
    maxHeight: 320,
  },
  noTasksFoundText: {
    fontSize: 13,
    fontStyle: 'italic',
    paddingVertical: 14,
    textAlign: 'center',
  },
  modalTaskCardItem: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  modalTaskHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTaskItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  modalTaskBadgePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  doneBadgeBg: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  pendingBadgeBg: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  modalTaskBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  modalTaskDateText: {
    fontSize: 11,
    marginTop: 4,
  },
  modalRemarkContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  modalRemarkHeading: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  modalRemarkQuoteText: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 2,
  },
  closeModalActionBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  closeModalActionBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
