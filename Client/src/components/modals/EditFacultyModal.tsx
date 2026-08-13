import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { User } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { Icon } from '../common/Icon';

interface EditFacultyModalProps {
  visible: boolean;
  faculty: User | null;
  onClose: () => void;
  onSaveFaculty: (updatedData: {
    id: string;
    name: string;
    email: string;
    department: string;
    regNo: string;
    password?: string;
  }) => void;
}

export const EditFacultyModal: React.FC<EditFacultyModalProps> = ({
  visible,
  faculty,
  onClose,
  onSaveFaculty,
}) => {
  const { colors, isDark } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [regNo, setRegNo] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (faculty) {
      setName(faculty.name || '');
      setEmail(faculty.email || '');
      setDepartment(faculty.department || '');
      setRegNo(faculty.regNo || 'FAC-2026-101');
      setPassword(faculty.password || '123456');
    }
  }, [faculty]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter faculty member name.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Required Field', 'Please enter faculty email address.');
      return;
    }
    if (!department.trim()) {
      Alert.alert('Required Field', 'Please enter department name.');
      return;
    }

    if (faculty) {
      onSaveFaculty({
        id: faculty.id,
        name: name.trim(),
        email: email.trim(),
        department: department.trim(),
        regNo: regNo.trim() || 'FAC-2026-101',
        password: password.trim() || '123456',
      });
      onClose();
    }
  };

  if (!faculty) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="edit" size={18} color={colors.primary} />
              <Text style={[styles.modalTitle, { color: colors.text, marginLeft: 8 }]}>Edit Faculty Member</Text>
            </View>
            <TouchableOpacity style={[styles.closeBtn, { backgroundColor: colors.surface }]} onPress={onClose}>
              <Text style={[styles.closeBtnText, { color: colors.subText }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <Text style={[styles.label, { color: colors.subText }]}>Faculty Name *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Dr. Sarah Smith"
            placeholderTextColor={colors.mutedText}
          />

          <Text style={[styles.label, { color: colors.subText }]}>Faculty Registration No. *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
            value={regNo}
            onChangeText={setRegNo}
            placeholder="e.g. FAC-2026-101"
            placeholderTextColor={colors.mutedText}
            autoCapitalize="characters"
          />

          <Text style={[styles.label, { color: colors.subText }]}>Login Password *</Text>
          <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
            <View style={{ marginRight: 8 }}>
              <Icon name="lock" size={14} color="#F59E0B" />
            </View>
            <TextInput
              style={[styles.inputWithIcon, { color: colors.text }]}
              value={password}
              onChangeText={setPassword}
              placeholder="e.g. 123456"
              placeholderTextColor={colors.mutedText}
            />
          </View>

          <Text style={[styles.label, { color: colors.subText }]}>Department *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
            value={department}
            onChangeText={setDepartment}
            placeholder="e.g. Computer Science"
            placeholderTextColor={colors.mutedText}
          />

          <Text style={[styles.label, { color: colors.subText }]}>Email Address *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
            value={email}
            onChangeText={setEmail}
            placeholder="sarah.smith@university.edu"
            placeholderTextColor={colors.mutedText}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelBtnText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={handleSave}
            >
              <Text style={styles.saveBtnText}>Save Changes</Text>
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
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
    marginTop: 8,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  inputWithIcon: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 18,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
