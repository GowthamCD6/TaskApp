import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Task } from '../../types';

interface CompleteTaskModalProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
  onSubmitCompletion: (taskId: string, note: string) => void;
}

export const CompleteTaskModal: React.FC<CompleteTaskModalProps> = ({
  visible,
  task,
  onClose,
  onSubmitCompletion,
}) => {
  const [completionNote, setCompletionNote] = useState('');

  if (!task) return null;

  const handleSubmit = () => {
    if (!completionNote.trim()) {
      Alert.alert('Completion Remarks Required', 'Please provide a brief remark/note regarding the completed task.');
      return;
    }

    onSubmitCompletion(task.id, completionNote.trim());
    setCompletionNote('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.badge}>Faculty Task Completion</Text>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskMeta}>
            Scheduled: {task.date} ({task.startTime} - {task.endTime})
          </Text>

          <Text style={styles.label}>Faculty Completion Remarks / Outcome *</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Share task outcome, status notes, student feedback, or links (e.g. Completed evaluation & uploaded reports to drive)..."
            placeholderTextColor="#64748B"
            multiline
            numberOfLines={4}
            value={completionNote}
            onChangeText={setCompletionNote}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitBtnText}>Submit & Complete</Text>
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
    borderWidth: 1,
    borderColor: '#10B981',
  },
  badge: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  taskMeta: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 16,
  },
  label: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#F8FAFC',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
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
    backgroundColor: '#10B981',
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
