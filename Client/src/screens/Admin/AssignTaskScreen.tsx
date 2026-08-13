import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { User, Priority } from '../../types';

interface AssignTaskScreenProps {
  allFaculty: User[];
  defaultDate: string;
  initialFacultyId?: string;
  onAssignTask: (taskData: {
    title: string;
    description: string;
    assignedTo: string;
    date: string;
    startTime: string;
    endTime: string;
    priority: Priority;
  }) => void;
  onNavigateToSchedule: () => void;
}

export const AssignTaskScreen: React.FC<AssignTaskScreenProps> = ({
  allFaculty,
  defaultDate,
  initialFacultyId,
  onAssignTask,
  onNavigateToSchedule,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFacultyId, setSelectedFacultyId] = useState(
    initialFacultyId || allFaculty[0]?.id || ''
  );
  const [date, setDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [showFacultyDropdown, setShowFacultyDropdown] = useState(false);

  const selectedFacultyObj = allFaculty.find(f => f.id === selectedFacultyId) || allFaculty[0];

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Required Field', 'Please enter a task title/name.');
      return;
    }
    if (!selectedFacultyId) {
      Alert.alert('Required Field', 'Please select a faculty member.');
      return;
    }

    onAssignTask({
      title: title.trim(),
      description: description.trim(),
      assignedTo: selectedFacultyId,
      date: date || defaultDate,
      startTime: startTime.trim() || '09:00',
      endTime: endTime.trim() || '10:00',
      priority,
    });

    setTitle('');
    setDescription('');
    onNavigateToSchedule();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Top Back Navigation Bar */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={onNavigateToSchedule}
        activeOpacity={0.8}
      >
        <Text style={styles.backBtnText}>← Back to Timeline Schedule</Text>
      </TouchableOpacity>

      <View style={styles.headerBox}>
        <Text style={styles.badge}>Administrator Control</Text>
        <Text style={styles.headerTitle}>Assign New Task to Faculty</Text>
        <Text style={styles.headerSubtitle}>
          Schedule academic duties, lab evaluations, lecture slide preparation, or accreditation tasks.
        </Text>
      </View>

      {/* Faculty Selection Card */}
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>1. Select Target Faculty Member</Text>
        <TouchableOpacity
          style={styles.dropdownBtn}
          onPress={() => setShowFacultyDropdown(!showFacultyDropdown)}
          activeOpacity={0.8}
        >
          <Text style={styles.dropdownBtnText}>
            {selectedFacultyObj
              ? `👨‍🏫 ${selectedFacultyObj.name} (${selectedFacultyObj.department})`
              : 'Select Faculty Member'}
          </Text>
          <Text style={styles.arrow}>{showFacultyDropdown ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {showFacultyDropdown && (
          <View style={styles.dropdownMenu}>
            {allFaculty.map(faculty => (
              <TouchableOpacity
                key={faculty.id}
                style={[
                  styles.dropdownOption,
                  faculty.id === selectedFacultyId && styles.dropdownOptionSelected,
                ]}
                onPress={() => {
                  setSelectedFacultyId(faculty.id);
                  setShowFacultyDropdown(false);
                }}
              >
                <Text style={styles.facultyOptionName}>{faculty.name}</Text>
                <Text style={styles.facultyOptionDept}>{faculty.department} • {faculty.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Task Details Card */}
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>2. Task Information & Deliverables</Text>

        <Text style={styles.label}>Task Name / Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Conduct CS-301 Midterm Viva & Lab Evaluation"
          placeholderTextColor="#64748B"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Detailed Instructions & Requirements</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Provide instructions, course codes, room numbers, student lists, or required upload links..."
          placeholderTextColor="#64748B"
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />
      </View>

      {/* Timeline & Schedule Card */}
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>3. Calendar Schedule & Timeline</Text>

        <Text style={styles.label}>Target Date (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          placeholder="2026-08-13"
          placeholderTextColor="#64748B"
          value={date}
          onChangeText={setDate}
        />

        <View style={styles.row}>
          <View style={styles.flex1}>
            <Text style={styles.label}>Start Time</Text>
            <TextInput
              style={styles.input}
              placeholder="09:00"
              placeholderTextColor="#64748B"
              value={startTime}
              onChangeText={setStartTime}
            />
          </View>
          <View style={styles.spacer} />
          <View style={styles.flex1}>
            <Text style={styles.label}>End Time</Text>
            <TextInput
              style={styles.input}
              placeholder="11:30"
              placeholderTextColor="#64748B"
              value={endTime}
              onChangeText={setEndTime}
            />
          </View>
        </View>

        <Text style={styles.label}>Priority Level</Text>
        <View style={styles.priorityRow}>
          {(['High', 'Medium', 'Low'] as Priority[]).map(p => {
            const isSelected = priority === p;
            let activeStyle = styles.priorityHigh;
            if (p === 'Medium') activeStyle = styles.priorityMedium;
            if (p === 'Low') activeStyle = styles.priorityLow;

            return (
              <TouchableOpacity
                key={p}
                style={[
                  styles.priorityBadge,
                  isSelected && activeStyle,
                ]}
                onPress={() => setPriority(p)}
              >
                <Text
                  style={[
                    styles.priorityText,
                    isSelected && styles.priorityTextActive,
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={styles.submitBtn}
        onPress={handleSubmit}
        activeOpacity={0.85}
      >
        <Text style={styles.submitBtnText}>🚀 Assign Task & Notify Faculty</Text>
      </TouchableOpacity>
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
  backBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  backBtnText: {
    color: '#818CF8',
    fontSize: 12,
    fontWeight: '700',
  },
  headerBox: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  badge: {
    color: '#6366F1',
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
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  label: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#F8FAFC',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  dropdownBtnText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  arrow: {
    color: '#6366F1',
    fontSize: 12,
  },
  dropdownMenu: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#334155',
    maxHeight: 160,
  },
  dropdownOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#0F172A',
  },
  dropdownOptionSelected: {
    backgroundColor: '#312E81',
  },
  facultyOptionName: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  facultyOptionDept: {
    color: '#94A3B8',
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  spacer: {
    width: 12,
  },
  priorityRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  priorityBadge: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#1E293B',
    alignItems: 'center',
    marginRight: 8,
  },
  priorityHigh: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  priorityMedium: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  priorityLow: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  priorityText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  priorityTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
