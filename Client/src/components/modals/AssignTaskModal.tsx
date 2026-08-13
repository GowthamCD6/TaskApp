import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { User, Priority } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { Icon } from '../common/Icon';

interface AssignTaskModalProps {
  visible: boolean;
  allFaculty: User[];
  defaultDate: string;
  onClose: () => void;
  onSubmitTask: (taskData: {
    title: string;
    description: string;
    assignedTo: string | string[];
    date: string;
    startTime: string;
    endTime: string;
    priority: Priority;
  }) => void;
}

export const AssignTaskModal: React.FC<AssignTaskModalProps> = ({
  visible,
  allFaculty,
  defaultDate,
  onClose,
  onSubmitTask,
}) => {
  const { colors, isDark } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFacultyIds, setSelectedFacultyIds] = useState<string[]>(
    allFaculty[0] ? [allFaculty[0].id] : []
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
      Alert.alert('Missing Field', 'Please enter a task title.');
      return;
    }
    if (selectedFacultyIds.length === 0) {
      Alert.alert('Missing Field', 'Please select at least one faculty member.');
      return;
    }

    onSubmitTask({
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
    onClose();
  };

  const selectedFacultyObjects = allFaculty.filter(f => selectedFacultyIds.includes(f.id));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.flex1}>
              <View style={styles.titleRow}>
                <View style={[styles.titleIconBg, { backgroundColor: `${colors.primary}20` }]}>
                  <Icon name="plus" size={16} color={colors.primary} />
                </View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Assign Task to Faculty</Text>
              </View>
              <Text style={[styles.subtitle, { color: colors.subText }]}>
                Assign tasks to single or multiple faculty members at once.
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: colors.surface }]}
              onPress={onClose}
            >
              <Text style={[styles.closeBtnText, { color: colors.subText }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Faculty Dropdown Selection */}
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: colors.subText }]}>Select Faculty Members *</Text>
              <View style={[styles.countBadge, { backgroundColor: `${colors.primary}18` }]}>
                <Text style={[styles.countBadgeText, { color: colors.primary }]}>
                  {selectedFacultyIds.length} / {allFaculty.length} Selected
                </Text>
              </View>
            </View>

            {/* Chips View */}
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

            <TouchableOpacity
              style={[styles.dropdownBtn, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
              onPress={() => setShowFacultyDropdown(!showFacultyDropdown)}
              activeOpacity={0.8}
            >
              <View style={styles.dropdownBtnRow}>
                <Icon name="users" size={14} color={colors.primary} />
                <Text style={[styles.dropdownBtnText, { color: colors.text, marginLeft: 8 }]}>
                  {selectedFacultyIds.length === 0
                    ? 'Select Faculty Members...'
                    : selectedFacultyIds.length === 1
                    ? selectedFacultyObjects[0]?.name
                    : `${selectedFacultyIds.length} Faculty Selected`}
                </Text>
              </View>
              <Icon name={showFacultyDropdown ? 'chevron-up' : 'chevron-down'} size={14} color={colors.subText} />
            </TouchableOpacity>

            {showFacultyDropdown && (
              <View style={[styles.dropdownMenu, { backgroundColor: colors.surface, borderColor: colors.inputBorder }]}>
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
                        styles.dropdownOption,
                        isSelected && { backgroundColor: `${colors.primary}12` },
                      ]}
                      onPress={() => toggleFacultySelection(faculty.id)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.itemAvatarCircle, { backgroundColor: isSelected ? colors.primary : colors.inputBorder }]}>
                        <Text style={styles.itemAvatarText}>{initials}</Text>
                      </View>

                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={[styles.facultyOptionName, { color: colors.text }]}>{faculty.name}</Text>
                        <Text style={[styles.facultyOptionDept, { color: colors.subText }]}>{faculty.department}</Text>
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
            <Text style={[styles.label, { color: colors.subText }]}>Task Name / Title *</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="e.g. Conduct CS-301 Midterm Viva"
                placeholderTextColor={colors.mutedText}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Task Details / Description */}
            <Text style={[styles.label, { color: colors.subText }]}>Task Details & Instructions</Text>
            <View style={[styles.inputContainer, styles.textAreaContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <TextInput
                style={[styles.input, styles.textArea, { color: colors.text }]}
                placeholder="Enter detailed instructions, links, or required deliverables..."
                placeholderTextColor={colors.mutedText}
                multiline
                numberOfLines={3}
                value={description}
                onChangeText={setDescription}
              />
            </View>

            {/* Scheduled Date */}
            <Text style={[styles.label, { color: colors.subText }]}>Target Scheduled Date (YYYY-MM-DD)</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="2026-08-13"
                placeholderTextColor={colors.mutedText}
                value={date}
                onChangeText={setDate}
              />
            </View>

            {/* Time Slot Inputs */}
            <View style={styles.timeRow}>
              <View style={styles.timeCol}>
                <Text style={[styles.label, { color: colors.subText }]}>Start Time</Text>
                <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="09:00"
                    placeholderTextColor={colors.mutedText}
                    value={startTime}
                    onChangeText={setStartTime}
                  />
                </View>
              </View>

              <View style={styles.timeCol}>
                <Text style={[styles.label, { color: colors.subText }]}>End Time</Text>
                <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="11:00"
                    placeholderTextColor={colors.mutedText}
                    value={endTime}
                    onChangeText={setEndTime}
                  />
                </View>
              </View>
            </View>

            {/* Priority Selection */}
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
                      {p}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelBtnText, { color: colors.subText }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.primary }]} onPress={handleSubmit}>
              <Text style={styles.submitBtnText}>
                {selectedFacultyIds.length > 1
                  ? `Assign (${selectedFacultyIds.length})`
                  : 'Assign Task'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  modalContent: {
    borderRadius: 22,
    padding: 20,
    maxHeight: '88%',
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  flex1: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
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
    marginBottom: 8,
    marginTop: 4,
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
    maxWidth: 110,
  },
  chipRemove: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 2,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
  },
  dropdownBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  dropdownMenu: {
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 6,
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
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  itemAvatarCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemAvatarText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  facultyOptionName: {
    fontSize: 13,
    fontWeight: '700',
  },
  facultyOptionDept: {
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
  inputContainer: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  input: {
    paddingVertical: 10,
    fontSize: 14,
  },
  textAreaContainer: {
    paddingVertical: 4,
  },
  textArea: {
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
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  priorityBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitBtn: {
    flex: 1.5,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
