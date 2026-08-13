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

interface AddFacultyModalProps {
  visible: boolean;
  onClose: () => void;
  onAddFaculty: (facultyData: {
    name: string;
    email: string;
    department: string;
    title: string;
    avatar?: string;
  }) => void;
}

export const AddFacultyModal: React.FC<AddFacultyModalProps> = ({
  visible,
  onClose,
  onAddFaculty,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [title, setTitle] = useState('Assistant Professor');
  const [avatar, setAvatar] = useState('');

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

    onAddFaculty({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      department: department.trim(),
      title: title.trim() || 'Assistant Professor',
      avatar: avatar.trim() || undefined,
    });

    // Reset Form
    setName('');
    setEmail('');
    setDepartment('Computer Science');
    setTitle('Assistant Professor');
    setAvatar('');
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
          <Text style={styles.modalTitle}>Add New Faculty Member</Text>
          <Text style={styles.subtitle}>
            Register a new faculty account into the academic directory & task schedule system.
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Faculty Name */}
            <Text style={styles.label}>Full Name & Honorific *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Dr. Alexander Fleming"
              placeholderTextColor="#64748B"
              value={name}
              onChangeText={setName}
            />

            {/* Email Address */}
            <Text style={styles.label}>University Email Address *</Text>
            <TextInput
              style={styles.input}
              placeholder="alexander.fleming@university.edu"
              placeholderTextColor="#64748B"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            {/* Department */}
            <Text style={styles.label}>Academic Department *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Computer Science / Data Science"
              placeholderTextColor="#64748B"
              value={department}
              onChangeText={setDepartment}
            />

            {/* Academic Title */}
            <Text style={styles.label}>Academic Title / Designation</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Associate Professor / Department Head"
              placeholderTextColor="#64748B"
              value={title}
              onChangeText={setTitle}
            />

            {/* Optional Avatar URL */}
            <Text style={styles.label}>Profile Avatar Image URL (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="https://images.unsplash.com/..."
              placeholderTextColor="#64748B"
              autoCapitalize="none"
              value={avatar}
              onChangeText={setAvatar}
            />
          </ScrollView>

          {/* Modal Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitBtnText}>+ Create Faculty Account</Text>
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
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 14,
  },
  label: {
    color: '#94A3B8',
    fontSize: 12,
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
    backgroundColor: '#10B981',
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
