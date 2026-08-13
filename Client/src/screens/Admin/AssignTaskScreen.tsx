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
import { useTheme } from '../../context/ThemeContext';
import { Icon } from '../../components/common/Icon';

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
  const { colors, isDark } = useTheme();
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
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Top Back Navigation Bar */}
      <TouchableOpacity
        style={[
          styles.backBtn,
          {
            backgroundColor: colors.surface,
            borderColor: colors.inputBorder,
          },
        ]}
        onPress={onNavigateToSchedule}
        activeOpacity={0.8}
      >
        <Text style={[styles.backBtnText, { color: colors.primary }]}>← Back to Timeline Schedule</Text>
      </TouchableOpacity>

      <View
        style={[
          styles.headerBox,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <Text style={[styles.badge, { color: colors.primary }]}>Administrator Control</Text>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Assign New Task to Faculty</Text>
        <Text style={[styles.headerSubtitle, { color: colors.subText }]}>
          Schedule academic duties, lab evaluations, lecture slide preparation, or accreditation tasks.
        </Text>
      </View>

      {/* Faculty Selection Card */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.cardSectionTitle, { color: colors.text }]}>1. Select Target Faculty Member</Text>
        <TouchableOpacity
          style={[
            styles.dropdownBtn,
            {
              backgroundColor: colors.inputBg,
              borderColor: colors.primary,
            },
          ]}
          onPress={() => setShowFacultyDropdown(!showFacultyDropdown)}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Icon name="user" size={16} color={colors.primary} />
            <Text style={[styles.dropdownBtnText, { color: colors.text, marginLeft: 8 }]}>
              {selectedFacultyObj
                ? `${selectedFacultyObj.name} (${selectedFacultyObj.department})`
                : 'Select Faculty Member'}
            </Text>
          </View>
          <Icon name={showFacultyDropdown ? 'chevron-down' : 'chevron-down'} size={12} color={colors.primary} />
        </TouchableOpacity>

        {showFacultyDropdown && (
          <View style={[styles.dropdownMenu, { backgroundColor: colors.surface, borderColor: colors.inputBorder }]}>
            {allFaculty.map(faculty => (
              <TouchableOpacity
                key={faculty.id}
                style={[
                  styles.dropdownOption,
                  {
                    borderBottomColor: colors.cardBorder,
                    backgroundColor:
                      faculty.id === selectedFacultyId
                        ? isDark
                          ? '#312E81'
                          : '#EEF2FF'
                        : colors.surface,
                  },
                ]}
                onPress={() => {
                  setSelectedFacultyId(faculty.id);
                  setShowFacultyDropdown(false);
                }}
              >
                <Text style={[styles.facultyOptionName, { color: colors.text }]}>{faculty.name}</Text>
                <Text style={[styles.facultyOptionDept, { color: colors.subText }]}>
                  {faculty.department} • {faculty.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Task Details Card */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.cardSectionTitle, { color: colors.text }]}>2. Task Information & Deliverables</Text>

        <Text style={[styles.label, { color: colors.subText }]}>Task Name / Title *</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.inputBg,
              borderColor: colors.inputBorder,
              color: colors.text,
            },
          ]}
          placeholder="e.g. Conduct CS-301 Midterm Viva & Lab Evaluation"
          placeholderTextColor={colors.mutedText}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={[styles.label, { color: colors.subText }]}>Detailed Instructions & Requirements</Text>
        <TextInput
          style={[
            styles.input,
            styles.textArea,
            {
              backgroundColor: colors.inputBg,
              borderColor: colors.inputBorder,
              color: colors.text,
            },
          ]}
          placeholder="Provide instructions, course codes, room numbers, student lists, or required upload links..."
          placeholderTextColor={colors.mutedText}
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />
      </View>

      {/* Timeline & Schedule Card */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.cardSectionTitle, { color: colors.text }]}>3. Calendar Schedule & Timeline</Text>

        <Text style={[styles.label, { color: colors.subText }]}>Target Date (YYYY-MM-DD)</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.inputBg,
              borderColor: colors.inputBorder,
              color: colors.text,
            },
          ]}
          placeholder="2026-08-13"
          placeholderTextColor={colors.mutedText}
          value={date}
          onChangeText={setDate}
        />

        <View style={styles.row}>
          <View style={styles.flex1}>
            <Text style={[styles.label, { color: colors.subText }]}>Start Time</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                },
              ]}
              placeholder="09:00"
              placeholderTextColor={colors.mutedText}
              value={startTime}
              onChangeText={setStartTime}
            />
          </View>
          <View style={styles.spacer} />
          <View style={styles.flex1}>
            <Text style={[styles.label, { color: colors.subText }]}>End Time</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                },
              ]}
              placeholder="11:30"
              placeholderTextColor={colors.mutedText}
              value={endTime}
              onChangeText={setEndTime}
            />
          </View>
        </View>

        <Text style={[styles.label, { color: colors.subText }]}>Priority Level</Text>
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
                  {
                    backgroundColor: isSelected ? activeStyle.backgroundColor : colors.surface,
                    borderColor: isSelected ? activeStyle.borderColor : colors.inputBorder,
                  },
                ]}
                onPress={() => setPriority(p)}
              >
                <Text
                  style={[
                    styles.priorityText,
                    {
                      color: isSelected ? '#FFFFFF' : colors.subText,
                      fontWeight: isSelected ? '700' : '600',
                    },
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
        style={[styles.submitBtn, { backgroundColor: colors.primary }]}
        onPress={handleSubmit}
        activeOpacity={0.85}
      >
        <Text style={styles.submitBtnText}>Assign Task & Notify Faculty →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  headerBox: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
  },
  badge: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
  },
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
  },
  dropdownBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dropdownMenu: {
    borderRadius: 10,
    marginTop: 6,
    borderWidth: 1,
    maxHeight: 160,
  },
  dropdownOption: {
    padding: 12,
    borderBottomWidth: 1,
  },
  facultyOptionName: {
    fontSize: 14,
    fontWeight: '600',
  },
  facultyOptionDept: {
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
    fontSize: 13,
  },
  submitBtn: {
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
