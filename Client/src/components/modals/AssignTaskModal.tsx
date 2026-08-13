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

interface AssignTaskModalProps {
  visible: boolean;
  allFaculty: User[];
  defaultDate: string;
  onClose: () => void;
  onSubmitTask: (taskData: {
    title: string;
    description: string;
    assignedTo: string;
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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFacultyId, setSelectedFacultyId] = useState(allFaculty[0]?.id || '');
  const [date, setDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [showFacultyDropdown, setShowFacultyDropdown] = useState(false);

  const selectedFacultyObj = allFaculty.find(f => f.id === selectedFacultyId) || allFaculty[0];

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Missing Field', 'Please enter a task title.');
      return;
    }
    if (!selectedFacultyId) {
      Alert.alert('Missing Field', 'Please select a faculty member from the dropdown.');
      return;
    }

    onSubmitTask({
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
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Assign Task to Faculty</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Faculty Dropdown Selection */}
            <Text style={styles.label}>Select Faculty Member *</Text>
            <TouchableOpacity
              style={styles.dropdownBtn}
              onPress={() => setShowFacultyDropdown(!showFacultyDropdown)}
              activeOpacity={0.8}
            >
              <Text style={styles.dropdownBtnText}>
                {selectedFacultyObj ? `${selectedFacultyObj.name} (${selectedFacultyObj.department})` : 'Select Faculty'}
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
                    <Text style={styles.facultyOptionDept}>{faculty.department}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Task Title */}
            <Text style={styles.label}>Task Name / Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Conduct CS-301 Midterm Viva"
              placeholderTextColor="#64748B"
              value={title}
              onChangeText={setTitle}
            />

            {/* Task Details / Description */}
            <Text style={styles.label}>Task Details & Instructions</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter detailed instructions, links, or required deliverables..."
              placeholderTextColor="#64748B"
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
            />

            {/* Scheduled Date */}
            <Text style={styles.label}>Target Scheduled Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="2026-08-13"
              placeholderTextColor="#64748B"
              value={date}
              onChangeText={setDate}
            />

            {/* Timeline: Start & End Time */}
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
              <View style={styles.timeSpacer} />
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

            {/* Priority Picker */}
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
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitBtnText}>Assign Task</Text>
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  label: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#F8FAFC',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
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
    backgroundColor: '#0F172A',
    borderRadius: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#334155',
    maxHeight: 150,
  },
  dropdownOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
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
  timeSpacer: {
    width: 12,
  },
  priorityRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  priorityBadge: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0F172A',
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
  buttonRow: {
    flexDirection: 'row',
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#334155',
    alignItems: 'center',
    marginRight: 10,
  },
  cancelBtnText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  submitBtn: {
    flex: 1.5,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#6366F1',
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
