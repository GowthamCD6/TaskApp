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
import { User, Priority } from '../../../types';
import { useTheme } from '../../../context/ThemeContext';
import { Icon } from '../../../components/common/Icon';

interface AssignTaskScreenProps {
  allFaculty: User[];
  defaultDate: string;
  initialFacultyId?: string;
  onAssignTask: (taskData: {
    title: string;
    description: string;
    assignedTo: string | string[];
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
  const [selectedFacultyIds, setSelectedFacultyIds] = useState<string[]>(
    initialFacultyId ? [initialFacultyId] : allFaculty[0] ? [allFaculty[0].id] : []
  );
  const [date, setDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [showFacultyDropdown, setShowFacultyDropdown] = useState(false);

  const toggleFacultySelection = (id: string) => {
    setSelectedFacultyIds(prev =>
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedFacultyIds.length === allFaculty.length) {
      setSelectedFacultyIds([]);
    } else {
      setSelectedFacultyIds(allFaculty.map(f => f.id));
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Required Field', 'Please enter a task title/name.');
      return;
    }
    if (selectedFacultyIds.length === 0) {
      Alert.alert('Required Field', 'Please select at least one faculty member to assign.');
      return;
    }

    onAssignTask({
      title: title.trim(),
      description: description.trim(),
      assignedTo: selectedFacultyIds,
      date: date || defaultDate,
      startTime: startTime.trim() || '09:00',
      endTime: endTime.trim() || '10:00',
      priority,
    });

    setTitle('');
    setDescription('');
    onNavigateToSchedule();
  };

  const selectedFacultyObjects = allFaculty.filter(f => selectedFacultyIds.includes(f.id));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Fixed Clean Header Bar */}
      <View style={[styles.cleanHeader, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
        <View style={styles.headerLeftGroup}>
          <Icon name="plus" size={18} color={colors.primary} />
          <Text style={[styles.cleanHeaderTitle, { color: colors.text }]}>Assign Multi-Faculty Task</Text>
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

      {/* Form Content ScrollView */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
          {/* Select Faculty Members Header */}
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: colors.subText }]}>Assign To Faculty Members *</Text>
            <View style={[styles.countBadge, { backgroundColor: `${colors.primary}18` }]}>
              <Text style={[styles.countBadgeText, { color: colors.primary }]}>
                {selectedFacultyIds.length} / {allFaculty.length} Selected
              </Text>
            </View>
          </View>

          {/* Selected Chips View */}
          {selectedFacultyObjects.length > 0 && (
            <View style={styles.chipsContainer}>
              {selectedFacultyObjects.map(faculty => {
                const initials = faculty.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);
                return (
                  <View
                    key={faculty.id}
                    style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.inputBorder }]}
                  >
                    <View style={[styles.chipAvatar, { backgroundColor: colors.primary }]}>
                      <Text style={styles.chipAvatarText}>{initials}</Text>
                    </View>
                    <Text style={[styles.chipName, { color: colors.text }]} numberOfLines={1}>
                      {faculty.name}
                    </Text>
                    <TouchableOpacity
                      onPress={() => toggleFacultySelection(faculty.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={[styles.chipRemove, { color: colors.mutedText }]}>✕</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}

          {/* Dropdown Selector Button */}
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
              <Icon name="users" size={16} color={colors.primary} />
              <Text style={[styles.selectedFacultyName, { color: colors.text, marginLeft: 8 }]}>
                {selectedFacultyIds.length === 0
                  ? 'Tap to select faculty members...'
                  : selectedFacultyIds.length === 1
                  ? selectedFacultyObjects[0]?.name
                  : `${selectedFacultyIds.length} Faculty Members Selected`}
              </Text>
            </View>
            <Icon name={showFacultyDropdown ? 'chevron-up' : 'chevron-down'} size={14} color={colors.subText} />
          </TouchableOpacity>

          {/* Multi-Select Dropdown List */}
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
              {/* Select All Toggle Bar */}
              <TouchableOpacity
                style={[styles.selectAllBar, { borderBottomColor: colors.inputBorder }]}
                onPress={handleSelectAll}
                activeOpacity={0.8}
              >
                <Text style={[styles.selectAllText, { color: colors.primary }]}>
                  {selectedFacultyIds.length === allFaculty.length
                    ? 'Deselect All Faculty'
                    : 'Select All Faculty'}
                </Text>
                <View
                  style={[
                    styles.checkboxBox,
                    selectedFacultyIds.length === allFaculty.length && {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    },
                  ]}
                >
                  {selectedFacultyIds.length === allFaculty.length && (
                    <Icon name="check" size={10} color="#FFFFFF" />
                  )}
                </View>
              </TouchableOpacity>

              {/* Faculty List Items */}
              {allFaculty.map(faculty => {
                const isSelected = selectedFacultyIds.includes(faculty.id);
                const initials = faculty.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <TouchableOpacity
                    key={faculty.id}
                    style={[
                      styles.dropdownItem,
                      isSelected && { backgroundColor: `${colors.primary}12` },
                    ]}
                    onPress={() => toggleFacultySelection(faculty.id)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.itemAvatarCircle, { backgroundColor: isSelected ? colors.primary : colors.inputBorder }]}>
                      <Text style={styles.itemAvatarText}>{initials}</Text>
                    </View>

                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.facultyItemName, { color: colors.text }]}>{faculty.name}</Text>
                      <Text style={[styles.facultyItemDept, { color: colors.subText }]}>
                        {faculty.regNo ? `${faculty.regNo} • ` : ''}{faculty.department}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.checkboxBox,
                        isSelected && {
                          backgroundColor: colors.primary,
                          borderColor: colors.primary,
                        },
                      ]}
                    >
                      {isSelected && <Icon name="check" size={10} color="#FFFFFF" />}
                    </View>
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
              <Text style={[styles.submitBtnText, { marginLeft: 6 }]}>
                {selectedFacultyIds.length > 1
                  ? `Assign Task to ${selectedFacultyIds.length} Faculty Members`
                  : 'Confirm & Assign Task'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>
    </View>
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
    fontWeight: '700',
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    marginTop: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  chipAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipAvatarText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  chipName: {
    fontSize: 12,
    fontWeight: '600',
    maxWidth: 120,
  },
  chipRemove: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 2,
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
    flex: 1,
  },
  selectedFacultyName: {
    fontSize: 14,
    fontWeight: '700',
  },
  dropdownList: {
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 8,
    overflow: 'hidden',
  },
  selectAllBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  selectAllText: {
    fontSize: 12,
    fontWeight: '800',
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
  itemAvatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemAvatarText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  facultyItemName: {
    fontSize: 13,
    fontWeight: '700',
  },
  facultyItemDept: {
    fontSize: 11,
    marginTop: 1,
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
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
