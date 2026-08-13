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
import { useTheme } from '../../context/ThemeContext';
import { Icon } from '../../components/common/Icon';

interface LoginScreenProps {
  allFaculty: User[];
  onLoginSuccess: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  allFaculty,
  onLoginSuccess,
}) => {
  const { isDark, colors, toggleTheme } = useTheme();
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>(allFaculty[0]?.id || '');
  const [regNo, setRegNo] = useState<string>('ADM-2026-001');
  const [password, setPassword] = useState<string>('123456');

  const adminUser: User = {
    id: 'admin-1',
    name: 'Dean James Wilson',
    email: 'admin.dean@university.edu',
    regNo: 'ADM-2026-001',
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

  const handleGoogleLogin = () => {
    Alert.alert(
      'Google Workspace SSO',
      `Connecting to Google OAuth 2.0...\n\nLogging in as ${selectedRole === 'admin' ? adminUser.name : (allFaculty.find(f => f.id === selectedFacultyId)?.name || 'Faculty Member')}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue with Google',
          onPress: () => {
            if (selectedRole === 'admin') {
              onLoginSuccess(adminUser);
            } else {
              const faculty = allFaculty.find(f => f.id === selectedFacultyId) || allFaculty[0];
              onLoginSuccess(faculty || adminUser);
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Header Controls (Theme Switcher Pill) */}
        <View style={styles.topControlRow}>
          <TouchableOpacity
            style={[
              styles.themeToggleBtn,
              {
                backgroundColor: colors.surface,
                borderColor: colors.cardBorder,
              },
            ]}
            onPress={toggleTheme}
            activeOpacity={0.8}
          >
            <View style={{ marginRight: 6 }}>
              <Icon name={isDark ? 'sun' : 'moon'} size={16} color={colors.primary} />
            </View>
            <Text style={[styles.themeToggleText, { color: colors.text }]}>
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Brand Header */}
        <View style={styles.brandContainer}>
          <View style={[styles.logoBadge, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
            <Icon name="academic" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.brandName, { color: colors.text }]}>TaskAssign Portal</Text>
          <Text style={[styles.brandTagline, { color: colors.subText }]}>
            Academic Schedule & Faculty Task Management System
          </Text>
        </View>

        {/* Login Main Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              shadowColor: colors.shadowColor,
            },
          ]}
        >
          {/* Google Sign-In Button */}
          <TouchableOpacity
            style={[
              styles.googleBtn,
              {
                backgroundColor: colors.googleBtnBg,
                borderColor: colors.googleBtnBorder,
              },
            ]}
            onPress={handleGoogleLogin}
            activeOpacity={0.85}
          >
            <View style={styles.googleBadge}>
              <Text style={styles.googleBadgeText}>G</Text>
            </View>
            <Text style={[styles.googleBtnText, { color: colors.googleBtnText }]}>
              Sign in with Google Workspace
            </Text>
          </TouchableOpacity>

          {/* Social Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.cardBorder }]} />
            <Text style={[styles.dividerText, { color: colors.mutedText }]}>OR SELECT PORTAL</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.cardBorder }]} />
          </View>

          {/* Role Segment Toggle Buttons */}
          <View style={[styles.roleToggleRow, { backgroundColor: colors.surface }]}>
            <TouchableOpacity
              style={[
                styles.roleBtn,
                selectedRole === 'admin' && { backgroundColor: colors.roleAdminBg },
              ]}
              onPress={() => {
                setSelectedRole('admin');
                setRegNo('ADM-2026-001');
              }}
              activeOpacity={0.8}
            >
              <View style={styles.btnIconContent}>
                <Icon
                  name="shield"
                  size={16}
                  color={selectedRole === 'admin' ? '#FFFFFF' : colors.subText}
                />
                <Text
                  style={[
                    styles.roleBtnText,
                    { color: selectedRole === 'admin' ? '#FFFFFF' : colors.subText },
                  ]}
                >
                  Admin Portal
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleBtn,
                selectedRole === 'faculty' && { backgroundColor: colors.roleFacultyBg },
              ]}
              onPress={() => {
                setSelectedRole('faculty');
                const firstFac = allFaculty[0];
                if (firstFac) {
                  setSelectedFacultyId(firstFac.id);
                  setRegNo(firstFac.regNo || 'FAC-2026-101');
                }
              }}
              activeOpacity={0.8}
            >
              <View style={styles.btnIconContent}>
                <Icon
                  name="user"
                  size={16}
                  color={selectedRole === 'faculty' ? '#FFFFFF' : colors.subText}
                />
                <Text
                  style={[
                    styles.roleBtnText,
                    { color: selectedRole === 'faculty' ? '#FFFFFF' : colors.subText },
                  ]}
                >
                  Faculty Portal
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Form Content */}
          {selectedRole === 'admin' ? (
            <View style={styles.formContainer}>
              <Text style={[styles.portalDescription, { color: colors.subText }]}>
                Logged in as Academic Administrator (Full control to schedule & assign tasks).
              </Text>

              <Text style={[styles.label, { color: colors.subText }]}>Faculty Reg. No. / Admin ID</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                  },
                ]}
                value={regNo}
                onChangeText={setRegNo}
                placeholder="e.g. ADM-2026-001"
                placeholderTextColor={colors.mutedText}
                autoCapitalize="characters"
              />

              <Text style={[styles.label, { color: colors.subText }]}>Password</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                  },
                ]}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.mutedText}
                secureTextEntry
              />
            </View>
          ) : (
            <View style={styles.formContainer}>
              <Text style={[styles.portalDescription, { color: colors.subText }]}>
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
                        {
                          backgroundColor: isSelected
                            ? isDark
                              ? '#112922'
                              : '#E6F4EA'
                            : colors.inputBg,
                          borderColor: isSelected ? colors.secondary : colors.inputBorder,
                        },
                      ]}
                      onPress={() => {
                        setSelectedFacultyId(item.id);
                        setRegNo(item.regNo || 'FAC-2026-101');
                      }}
                      activeOpacity={0.8}
                    >
                      <Image source={{ uri: item.avatar }} style={styles.avatar} />
                      <View style={styles.facultyMeta}>
                        <Text style={[styles.facultyName, { color: colors.text }]}>{item.name}</Text>
                        <Text style={[styles.facultySub, { color: colors.subText }]}>
                          Reg. No: <Text style={{ color: colors.primary, fontWeight: '700' }}>{item.regNo || 'FAC-2026-101'}</Text> • {item.department}
                        </Text>
                      </View>
                      {isSelected && (
                        <View style={[styles.checkBadge, { backgroundColor: colors.secondary }]}>
                          <Icon name="check" size={12} color="#FFFFFF" />
                        </View>
                      )}
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
              {
                backgroundColor:
                  selectedRole === 'admin' ? colors.roleAdminBg : colors.roleFacultyBg,
              },
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
          <Text style={[styles.footerText, { color: colors.mutedText }]}>
            TaskAssign v1.0.0 • Role-Based Academic Management
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  topControlRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  themeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  themeToggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 2,
  },
  brandName: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  googleBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  googleBadgeText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginHorizontal: 10,
  },
  roleToggleRow: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    marginTop: 4,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnIconContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleBtnText: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  formContainer: {
    marginBottom: 16,
  },
  portalDescription: {
    fontSize: 13,
    marginBottom: 14,
    lineHeight: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
  },
  facultyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1.5,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 12,
  },
  facultyMeta: {
    flex: 1,
  },
  facultyName: {
    fontSize: 14,
    fontWeight: '600',
  },
  facultySub: {
    fontSize: 11,
  },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
});
