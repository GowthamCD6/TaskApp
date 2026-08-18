import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Task } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { Icon } from '../common/Icon';

interface CompleteTaskModalProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
  onSubmitCompletion: (taskId: string, note: string) => void;
}

const SESSION_MODES = ['Class / Lecture', 'Lab Session', 'Exam / Test', 'Meeting / Event', 'Other'];

export const CompleteTaskModal: React.FC<CompleteTaskModalProps> = ({
  visible,
  task,
  onClose,
  onSubmitCompletion,
}) => {
  const { colors } = useTheme();
  const [completionNote, setCompletionNote] = useState('');
  const [studentsPresent, setStudentsPresent] = useState('');
  const [selectedSessionMode, setSelectedSessionMode] = useState<string>('');

  if (!task) return null;

  const handleSubmit = () => {
    if (!completionNote.trim() && !studentsPresent.trim()) {
      Alert.alert('Completion Remarks Required', 'Please provide completion remarks or session details.');
      return;
    }

    let finalFormattedNote = completionNote.trim();
    const metadataParts: string[] = [];

    if (studentsPresent.trim()) {
      metadataParts.push(`Students Present: ${studentsPresent.trim()}`);
    }
    if (selectedSessionMode) {
      metadataParts.push(`Session: ${selectedSessionMode}`);
    }

    if (metadataParts.length > 0) {
      const metaPrefix = `[${metadataParts.join(' | ')}]`;
      finalFormattedNote = finalFormattedNote
        ? `${metaPrefix} ${finalFormattedNote}`
        : metaPrefix;
    }

    onSubmitCompletion(task.id, finalFormattedNote);
    
    // Reset form state
    setCompletionNote('');
    setStudentsPresent('');
    setSelectedSessionMode('');
    onClose();
  };

  const handleClose = () => {
    setCompletionNote('');
    setStudentsPresent('');
    setSelectedSessionMode('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View
          style={[
            styles.modalContent,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={styles.headerBadgeGroup}>
              <View style={styles.greenIconCircle}>
                <Icon name="check" size={14} color="#FFFFFF" />
              </View>
              <Text style={styles.badgeText}>Complete Task & Submit Report</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Icon name="close" size={14} color={colors.subText} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Task Info Summary Box */}
            <View style={[styles.taskSummaryBox, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
              <Text style={[styles.taskTitle, { color: colors.text }]}>{task.title}</Text>
              <View style={styles.metaRow}>
                <Icon name="calendar" size={12} color={colors.primary} />
                <Text style={[styles.taskMeta, { color: colors.subText }]}>
                  {task.date} • {task.startTime} - {task.endTime}
                </Text>
              </View>
            </View>

            {/* Optional Field 1: Students Present */}
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Students Present <Text style={[styles.optionalTag, { color: colors.subText }]}> (Optional)</Text>
            </Text>
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: colors.surface, borderColor: colors.inputBorder },
              ]}
            >
              <Icon name="users" size={16} color={colors.primary} />
              <TextInput
                style={[styles.singleInput, { color: colors.text }]}
                placeholder="e.g. 45 students"
                placeholderTextColor={colors.subText}
                keyboardType="numeric"
                value={studentsPresent}
                onChangeText={setStudentsPresent}
              />
            </View>

            {/* Optional Field 2: Session Mode Pills */}
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Session Type <Text style={[styles.optionalTag, { color: colors.subText }]}> (Optional)</Text>
            </Text>
            <View style={styles.modeContainer}>
              {SESSION_MODES.map((mode) => {
                const isSelected = selectedSessionMode === mode;
                return (
                  <TouchableOpacity
                    key={mode}
                    style={[
                      styles.modePill,
                      isSelected
                        ? { backgroundColor: colors.primary, borderColor: colors.primary }
                        : { backgroundColor: colors.surface, borderColor: colors.inputBorder },
                    ]}
                    onPress={() => setSelectedSessionMode(isSelected ? '' : mode)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.modePillText,
                        isSelected ? { color: '#FFFFFF' } : { color: colors.subText },
                      ]}
                    >
                      {mode}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Main Required/Recommended Field: Outcome & Remarks */}
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Completion Remarks / Outcome <Text style={{ color: '#10B981' }}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                },
              ]}
              placeholder="Provide brief completion details, topics covered, student feedback, or drive link..."
              placeholderTextColor={colors.subText}
              multiline
              numberOfLines={4}
              value={completionNote}
              onChangeText={setCompletionNote}
            />

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.cancelBtn,
                  { backgroundColor: colors.surface, borderColor: colors.inputBorder },
                ]}
                onPress={handleClose}
                activeOpacity={0.8}
              >
                <Text style={[styles.cancelBtnText, { color: colors.subText }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: '#10B981' }]}
                onPress={handleSubmit}
                activeOpacity={0.85}
              >
                <View style={styles.submitBtnContent}>
                  <Icon name="check" size={16} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Submit & Complete</Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  modalContent: {
    maxHeight: '90%',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  greenIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    fontSize: 18,
    fontWeight: '700',
  },
  taskSummaryBox: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskMeta: {
    fontSize: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 4,
  },
  optionalTag: {
    fontSize: 11,
    fontWeight: '400',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 14,
    gap: 8,
  },
  singleInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
  },
  modeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  modePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  modePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  textArea: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    height: 90,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  submitBtn: {
    flex: 1.6,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  submitBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

