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
      {/* Clean & Simple Header Bar */}
      <View style={[styles.cleanHeader, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
        <View style={styles.headerLeftGroup}>
          <Icon name="plus" size={18} color={colors.primary} />
          <Text style={[styles.cleanHeaderTitle, { color: colors.text }]}>Assign Task</Text>
        </View>

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
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="arrow-left" size={12} color={colors.primary} />
            <Text style={[styles.backBtnText, { color: colors.primary, marginLeft: 4 }]}>Timeline</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Main Form Container */}
      <View style={styles.formPadding}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          {/* Select Faculty Member */}
          <Text style={[styles.label, { color: colors.subText }]}>Assign To Faculty Member *</Text>
          <TouchableOpacity
            style={[
              styles.dropdownSelector,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.inputBorder,
              },
            ]}
            onPress={() => setShowFacultyDropdown(!showFacultyDropdown)}
            activeOpacity={0.8}
          >
            <View style={styles.selectedFacultyRow}>
              <View>
                <Text style={[styles.selectedFacultyName, { color: colors.text }]}>
                  {selectedFacultyObj?.name || 'Select Faculty'}
                </Text>
                <Text style={[styles.selectedFacultyMeta, { color: colors.subText }]}>
                  Reg. No: {selectedFacultyObj?.regNo || 'FAC-2026-101'} • {selectedFacultyObj?.department}
                </Text>
              </View>
            </View>
            <Icon name={showFacultyDropdown ? 'chevron-up' : 'chevron-down'} size={14} color={colors.subText} />
          </TouchableOpacity>

          {/* Dropdown Options List */}
          {showFacultyDropdown && (
            <View
              style={[
                styles.dropdownList,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.inputBorder,
                },
              ]}
            >
              {allFaculty.map(faculty => {
                const isSelected = faculty.id === selectedFacultyId;
                return (
                  <TouchableOpacity
                    key={faculty.id}
                    style={[
                      styles.dropdownItem,
                      isSelected && { backgroundColor: 'rgba(99, 102, 241, 0.15)' },
                    ]}
                    onPress={() => {
                      setSelectedFacultyId(faculty.id);
                      setShowFacultyDropdown(false);
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.facultyItemName, { color: colors.text }]}>{faculty.name}</Text>
                      <Text style={[styles.facultyItemDept, { color: colors.subText }]}>
                        ID: {faculty.regNo || 'FAC-2026-101'} • {faculty.department}
                      </Text>
                    </View>
                    {isSelected && <Icon name="check" size={14} color={colors.primary} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Task Title */}
          <Text style={[styles.label, { color: colors.subText }]}>Task Title / Subject *</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.inputBorder,
                color: colors.text,
              },
            ]}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. CS-301 Lecture Preparation & Lab Exam"
            placeholderTextColor={colors.mutedText}
          />

          {/* Task Description */}
          <Text style={[styles.label, { color: colors.subText }]}>Detailed Description & Instructions</Text>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.inputBorder,
                color: colors.text,
              },
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Specify lecture topics, classroom numbers, syllabus details..."
            placeholderTextColor={colors.mutedText}
            multiline
            numberOfLines={3}
          />

          {/* Date Input */}
          <Text style={[styles.label, { color: colors.subText }]}>Task Date (YYYY-MM-DD)</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.inputBorder,
                color: colors.text,
              },
            ]}
            value={date}
            onChangeText={setDate}
            placeholder="2026-08-13"
            placeholderTextColor={colors.mutedText}
          />

          {/* Time Slot Inputs */}
          <View style={styles.timeRow}>
            <View style={styles.timeCol}>
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
                value={startTime}
                onChangeText={setStartTime}
                placeholder="09:00"
                placeholderTextColor={colors.mutedText}
              />
            </View>
            <View style={styles.timeCol}>
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
                value={endTime}
                onChangeText={setEndTime}
                placeholder="11:00"
                placeholderTextColor={colors.mutedText}
              />
            </View>
          </View>

          {/* Priority Level Segment Selector */}
          <Text style={[styles.label, { color: colors.subText }]}>Priority Level</Text>
          <View style={[styles.priorityRow, { backgroundColor: colors.surface }]}>
            {(['High', 'Medium', 'Low'] as Priority[]).map(p => {
              const active = priority === p;
              let activeBg = colors.primary;
              if (p === 'High') activeBg = '#EF4444';
              if (p === 'Medium') activeBg = '#F59E0B';
              if (p === 'Low') activeBg = '#3B82F6';

              return (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityBtn,
                    active && { backgroundColor: activeBg },
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Text
                    style={[
                      styles.priorityBtnText,
                      { color: active ? '#FFFFFF' : colors.subText },
                    ]}
                  >
                    {p} Priority
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Submit Action Button */}
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
            onPress={handleSubmit}
            activeOpacity={0.85}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="plus" size={16} color="#FFFFFF" />
              <Text style={[styles.submitBtnText, { marginLeft: 6 }]}>Confirm & Assign Task</Text>
            </View>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'space-between',
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
  backBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  formPadding: {
    padding: 16,
  },
  card: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },
  dropdownSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  selectedFacultyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedFacultyName: {
    fontSize: 14,
    fontWeight: '700',
  },
  selectedFacultyMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  dropdownList: {
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 6,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  facultyItemName: {
    fontSize: 13,
    fontWeight: '700',
  },
  facultyItemDept: {
    fontSize: 11,
    marginTop: 1,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
  },
  textArea: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  timeRow: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
  timeCol: {
    flex: 1,
    marginHorizontal: 4,
  },
  priorityRow: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    marginTop: 4,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  priorityBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  submitBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
