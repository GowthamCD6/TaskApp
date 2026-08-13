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
import { useTheme } from '../../context/ThemeContext';
import { Icon } from '../common/Icon';

interface AddFacultyModalProps {
  visible: boolean;
  onClose: () => void;
  onAddFaculty: (facultyData: {
    name: string;
    email: string;
    department: string;
    title: string;
    avatar?: string;
    regNo?: string;
    password?: string;
  }) => void;
}

// AddFacultyModal component for adding new faculty members
export const AddFacultyModal: React.FC<AddFacultyModalProps> = ({
  visible,
  onClose,
  onAddFaculty,
}) => {
  const { colors, isDark } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [title, setTitle] = useState('Associate Professor');
  const [regNo, setRegNo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Missing Field', 'Please enter the faculty member full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Missing Field', 'Please enter a valid university email address.');
      return;
    }
    if (!department.trim()) {
      Alert.alert('Missing Field', 'Please enter the department name.');
      return;
    }
    if (!regNo.trim()) {
      Alert.alert('Missing Field', 'Please enter the registration number.');
      return;
    }
    if (!password.trim() || password.trim().length < 6) {
      Alert.alert('Missing Field', 'Password must be at least 6 characters.');
      return;
    }

    onAddFaculty({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      department: department.trim(),
      title: title.trim() || 'Associate Professor',
      regNo: regNo.trim(),
      password: password.trim(),
    });

    // Reset Form
    setName('');
    setEmail('');
    setDepartment('Computer Science');
    setTitle('Associate Professor');
    setRegNo('');
    setPassword('');
    setShowPassword(false);
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
        <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.flex1}>
              <View style={styles.titleRow}>
                <View style={[styles.titleIconBg, { backgroundColor: `${colors.secondary}20` }]}>
                  <Icon name="users" size={16} color={colors.secondary} />
                </View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Faculty</Text>
              </View>
              <Text style={[styles.subtitle, { color: colors.subText }]}>
                Register a new faculty account into the directory.
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
            {/* Faculty Name */}
            <Text style={[styles.label, { color: colors.subText }]}>Full Name *</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <Icon name="user" size={14} color={colors.mutedText} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="e.g. Dr. Alexander Fleming"
                placeholderTextColor={colors.mutedText}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Email Address */}
            <Text style={[styles.label, { color: colors.subText }]}>University Email *</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <Icon name="mail" size={14} color={colors.mutedText} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="alexander@university.edu"
                placeholderTextColor={colors.mutedText}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Department */}
            <Text style={[styles.label, { color: colors.subText }]}>Department *</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <Icon name="academic" size={14} color={colors.mutedText} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="e.g. Computer Science"
                placeholderTextColor={colors.mutedText}
                value={department}
                onChangeText={setDepartment}
              />
            </View>

            {/* Designation / Academic Title */}
            <Text style={[styles.label, { color: colors.subText }]}>Designation / Title</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <Icon name="user" size={14} color={colors.mutedText} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="e.g. Associate Professor / Assistant Professor"
                placeholderTextColor={colors.mutedText}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Registration Number */}
            <Text style={[styles.label, { color: colors.subText }]}>Registration No *</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <Icon name="clipboard" size={14} color={colors.mutedText} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="e.g. FAC-2026-101"
                placeholderTextColor={colors.mutedText}
                autoCapitalize="characters"
                value={regNo}
                onChangeText={setRegNo}
              />
            </View>

            {/* Password */}
            <Text style={[styles.label, { color: colors.subText }]}>Password *</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <Icon name="lock" size={14} color={colors.mutedText} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Min. 6 characters"
                placeholderTextColor={colors.mutedText}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text style={[styles.showHideText, { color: colors.primary }]}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Modal Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelBtnText, { color: colors.subText }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="plus" size={14} color="#FFFFFF" />
                <Text style={styles.submitBtnText}>Create Faculty</Text>
              </View>
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
    paddingHorizontal: 20,
  },
  modalContent: {
    borderRadius: 22,
    padding: 20,
    maxHeight: '85%',
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  flex1: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  titleIconBg: {
    width: 34,
    height: 34,
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
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 14,
  },
  showHideText: {
    fontSize: 12,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitBtn: {
    flex: 1.5,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
});
