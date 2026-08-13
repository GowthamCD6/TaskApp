import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { User, UserRole } from '../../types';

interface LoginScreenProps {
  allFaculty: User[];
  onLoginSuccess: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  allFaculty,
  onLoginSuccess,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>(allFaculty[0]?.id || '');
  const [email, setEmail] = useState<string>('admin.dean@university.edu');
  const [password, setPassword] = useState<string>('123456');

  const adminUser: User = {
    id: 'admin-1',
    name: 'Dean James Wilson',
    email: 'admin.dean@university.edu',
    role: 'admin',
    department: 'Academic Administration',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    title: 'Chief Academic Officer',
  };

  const handleLogin = () => {
    if (selectedRole === 'admin') {
      onLoginSuccess(adminUser);
    } else {
      const faculty = allFaculty.find(f => f.id === selectedFacultyId) || allFaculty[0];
      if (!faculty) {
        Alert.alert('Error', 'Please select a faculty member.');
        return;
      }
      onLoginSuccess(faculty);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Brand Header */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>🎓</Text>
          </View>
          <Text style={styles.brandName}>TaskAssign Portal</Text>
          <Text style={styles.brandTagline}>Academic Schedule & Faculty Task Management System</Text>
        </View>

        {/* Login Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderTitle}>Select Login Portal</Text>

          {/* Role Toggle Buttons */}
          <View style={styles.roleToggleRow}>
            <TouchableOpacity
              style={[
                styles.roleBtn,
                selectedRole === 'admin' && styles.roleBtnActiveAdmin,
              ]}
              onPress={() => {
                setSelectedRole('admin');
                setEmail('admin.dean@university.edu');
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.roleBtnText, selectedRole === 'admin' && styles.roleBtnTextActive]}>
                🛡️ Admin Portal
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleBtn,
                selectedRole === 'faculty' && styles.roleBtnActiveFaculty,
              ]}
              onPress={() => {
                setSelectedRole('faculty');
                const firstFac = allFaculty[0];
                if (firstFac) {
                  setSelectedFacultyId(firstFac.id);
                  setEmail(firstFac.email);
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.roleBtnText, selectedRole === 'faculty' && styles.roleBtnTextActive]}>
                👨‍🏫 Faculty Portal
              </Text>
            </TouchableOpacity>
          </View>

          {selectedRole === 'admin' ? (
            <View style={styles.formContainer}>
              <Text style={styles.portalDescription}>
                Logged in as Academic Administrator (Full control to schedule & assign tasks).
              </Text>

              <Text style={styles.label}>Admin Email Address</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="admin@university.edu"
                placeholderTextColor="#64748B"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#64748B"
                secureTextEntry
              />
            </View>
          ) : (
            <View style={styles.formContainer}>
              <Text style={styles.portalDescription}>
                Select your Faculty Member account to access your day-wise task calendar:
              </Text>

              <FlatList
                data={allFaculty}
                keyExtractor={item => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => {
                  const isSelected = selectedFacultyId === item.id;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.facultyCard,
                        isSelected && styles.facultyCardSelected,
                      ]}
                      onPress={() => {
                        setSelectedFacultyId(item.id);
                        setEmail(item.email);
                      }}
                      activeOpacity={0.8}
                    >
                      <Image source={{ uri: item.avatar }} style={styles.avatar} />
                      <View style={styles.facultyMeta}>
                        <Text style={styles.facultyName}>{item.name}</Text>
                        <Text style={styles.facultySub}>{item.department} • {item.title}</Text>
                      </View>
                      {isSelected && <Text style={styles.selectedCheck}>✓</Text>}
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          )}

          {/* Login Action Button */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              selectedRole === 'admin' ? styles.submitBtnAdmin : styles.submitBtnFaculty,
            ]}
            onPress={handleLogin}
            activeOpacity={0.85}
          >
            <Text style={styles.submitBtnText}>
              Login to {selectedRole === 'admin' ? 'Admin Workspace' : 'Faculty Workspace'} →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Demo Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>TaskAssign v1.0.0 • Role-Based Academic Management</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    justifyContent: 'center',
    minHeight: '100%',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#6366F1',
  },
  logoIcon: {
    fontSize: 32,
  },
  brandName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  cardHeaderTitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 14,
  },
  roleToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  roleBtnActiveAdmin: {
    backgroundColor: '#6366F1',
  },
  roleBtnActiveFaculty: {
    backgroundColor: '#10B981',
  },
  roleBtnText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  roleBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  formContainer: {
    marginBottom: 16,
  },
  portalDescription: {
    color: '#CBD5E1',
    fontSize: 13,
    marginBottom: 14,
    lineHeight: 18,
  },
  label: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#F8FAFC',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  facultyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  facultyCardSelected: {
    borderColor: '#10B981',
    backgroundColor: '#112922',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 12,
    backgroundColor: '#334155',
  },
  facultyMeta: {
    flex: 1,
  },
  facultyName: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  facultySub: {
    color: '#94A3B8',
    fontSize: 11,
  },
  selectedCheck: {
    color: '#10B981',
    fontWeight: 'bold',
    fontSize: 16,
  },
  submitBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnAdmin: {
    backgroundColor: '#6366F1',
  },
  submitBtnFaculty: {
    backgroundColor: '#10B981',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    color: '#64748B',
    fontSize: 12,
  },
});
