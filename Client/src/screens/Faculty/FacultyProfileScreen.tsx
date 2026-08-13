import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { User, Task } from '../../types';

interface FacultyProfileScreenProps {
  currentFaculty: User | null;
  allTasks: Task[];
}

export const FacultyProfileScreen: React.FC<FacultyProfileScreenProps> = ({
  currentFaculty,
  allTasks,
}) => {
  if (!currentFaculty) return null;

  const facultyTasks = allTasks.filter(t => t.assignedTo === currentFaculty.id);
  const completedCount = facultyTasks.filter(t => t.status === 'completed').length;
  const pendingCount = facultyTasks.length - completedCount;
  const completionRate =
    facultyTasks.length > 0
      ? Math.round((completedCount / facultyTasks.length) * 100)
      : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Profile Banner */}
      <View style={styles.profileCard}>
        <Image source={{ uri: currentFaculty.avatar }} style={styles.avatar} />
        <Text style={styles.name}>{currentFaculty.name}</Text>
        <Text style={styles.title}>{currentFaculty.title}</Text>
        <Text style={styles.dept}>{currentFaculty.department}</Text>
        <Text style={styles.email}>📧 {currentFaculty.email}</Text>
      </View>

      {/* Workload Stats */}
      <Text style={styles.sectionTitle}>Workload Performance Summary</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{facultyTasks.length}</Text>
          <Text style={styles.statLabel}>Total Tasks</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNum, styles.pendingText]}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNum, styles.doneText]}>{completedCount}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      {/* Progress Bar Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>Overall Completion Rate</Text>
        <Text style={styles.ratePercent}>{completionRate}%</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${completionRate}%` }]} />
        </View>
      </View>

      {/* Department Information */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>Departmental & System Details</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Role</Text>
          <Text style={styles.infoVal}>Faculty Member</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Department</Text>
          <Text style={styles.infoVal}>{currentFaculty.department}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Office Location</Text>
          <Text style={styles.infoVal}>Building B, Room 304</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Status</Text>
          <Text style={[styles.infoVal, styles.activeText]}>● Active Duties</Text>
        </View>
      </View>
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
  profileCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#10B981',
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  title: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 2,
  },
  dept: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  email: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
  },
  statNum: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  pendingText: {
    color: '#F59E0B',
  },
  doneText: {
    color: '#10B981',
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  cardHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 8,
  },
  ratePercent: {
    fontSize: 28,
    fontWeight: '900',
    color: '#10B981',
    marginBottom: 8,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#1E293B',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  infoKey: {
    color: '#94A3B8',
    fontSize: 13,
  },
  infoVal: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },
  activeText: {
    color: '#10B981',
  },
});
