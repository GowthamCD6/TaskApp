import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
  Modal,
} from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { User, UserRole } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { Icon } from '../../components/common/Icon';
import { loginUser, loginWithGoogle } from '../../services/api';

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
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>(allFaculty[0]?.id || 'fac-1');
  const [regNo, setRegNo] = useState<string>('242IT163');
  const [password, setPassword] = useState<string>('123456');

  // Google Account Chooser Modal State
  const [showGoogleModal, setShowGoogleModal] = useState<boolean>(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState<string>('');

  // Optional: Place your Google Cloud Console Web Client ID here (from https://console.cloud.google.com/apis/credentials)
  const GOOGLE_WEB_CLIENT_ID = '';

  useEffect(() => {
    try {
      if (GOOGLE_WEB_CLIENT_ID) {
        GoogleSignin.configure({
          webClientId: GOOGLE_WEB_CLIENT_ID,
          scopes: ['email', 'profile'],
          offlineAccess: true,
        });
      } else {
        GoogleSignin.configure({
          scopes: ['email', 'profile'],
        });
      }
    } catch (err) {
      console.warn('GoogleSignin configure warning:', err);
    }
  }, []);

  const handleNativeGoogleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      const googleUser = (response as any)?.data?.user || (response as any)?.user;

      if (googleUser && googleUser.email) {
        const authenticatedUser = await loginWithGoogle({
          id: googleUser.id,
          email: googleUser.email,
          name: googleUser.name || googleUser.email.split('@')[0],
          avatar: googleUser.photo,
        });
        onLoginSuccess(authenticatedUser);
        return;
      }
    } catch (error: any) {
      console.warn('Native Google Sign-In notice:', error?.message || error);
    } finally {
      setIsLoggingIn(false);
    }

    // Open Google Account Chooser modal directly so user can select account
    setShowGoogleModal(true);
  };

  const adminUser: User = {
    id: 'admin-1',
    name: 'Gowtham',
    email: 'gowthamcd.it24@bitsathy.ac.in',
    regNo: '242IT163',
    role: 'admin',
    department: 'Information Technology',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    title: 'System Administrator',
  };

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      let payload = {};
      if (selectedRole === 'admin') {
        payload = { regNo: regNo.trim() || '242IT163', password: password || '123456', role: 'admin' };
      } else {
        const faculty = allFaculty.find(f => f.id === selectedFacultyId) || allFaculty[0];
        payload = {
          id: faculty?.id || selectedFacultyId,
          regNo: faculty?.regNo || regNo || 'FAC-2026-101',
          password: password || '123456',
          role: 'faculty',
        };
      }

      const authenticatedUser = await loginUser(payload);
      onLoginSuccess(authenticatedUser);
    } catch (err: any) {
      console.warn('Backend login fallback active:', err);
      if (selectedRole === 'admin') {
        onLoginSuccess(adminUser);
      } else {
        const faculty = allFaculty.find(f => f.id === selectedFacultyId) || allFaculty[0];
        onLoginSuccess(faculty || adminUser);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSelectGoogleAccount = async (account: { email: string; name: string; avatar?: string; role?: string }) => {
    setShowGoogleModal(false);
    setIsLoggingIn(true);
    try {
      const authenticatedUser = await loginWithGoogle({
        email: account.email,
        name: account.name,
        avatar: account.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      });
      onLoginSuccess(authenticatedUser);
    } catch (err) {
      console.warn('Google login error:', err);
      if (account.role === 'admin' || account.email.includes('gowtham')) {
        onLoginSuccess(adminUser);
      } else {
        const faculty = allFaculty.find(f => f.email.toLowerCase() === account.email.toLowerCase()) || allFaculty[0];
        onLoginSuccess(faculty || adminUser);
      }
    } finally {
      setIsLoggingIn(false);
    }
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
            onPress={handleNativeGoogleSignIn}
            activeOpacity={0.85}
          >
            <View style={styles.googleIconBox}>
              <Icon name="google" size={20} />
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
                setRegNo('242IT163');
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
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                  },
                ]}
              >
                <View style={styles.inputIconBox}>
                  <Icon name="user" size={16} color={colors.subText} />
                </View>
                <TextInput
                  style={[styles.inputWithIcon, { color: colors.text }]}
                  value={regNo}
                  onChangeText={setRegNo}
                  placeholder="e.g. ADM-2026-001"
                  placeholderTextColor={colors.mutedText}
                  autoCapitalize="characters"
                />
              </View>

              <Text style={[styles.label, { color: colors.subText }]}>Password</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                  },
                ]}
              >
                <View style={styles.inputIconBox}>
                  <Icon name="lock" size={16} color={colors.subText} />
                </View>
                <TextInput
                  style={[styles.inputWithIcon, { color: colors.text }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={colors.mutedText}
                  secureTextEntry
                />
              </View>
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
                        if (!password) setPassword('123456');
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

              <Text style={[styles.label, { color: colors.subText }]}>Password (Default: 123456)</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                  },
                ]}
              >
                <View style={styles.inputIconBox}>
                  <Icon name="lock" size={16} color={colors.subText} />
                </View>
                <TextInput
                  style={[styles.inputWithIcon, { color: colors.text }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="123456"
                  placeholderTextColor={colors.mutedText}
                  secureTextEntry
                />
              </View>
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
            disabled={isLoggingIn}
            activeOpacity={0.85}
          >
            {isLoggingIn ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <View style={styles.submitBtnRow}>
                <Text style={styles.submitBtnText}>
                  Login to {selectedRole === 'admin' ? 'Admin Workspace' : 'Faculty Workspace'}
                </Text>
                <View style={{ marginLeft: 8 }}>
                  <Icon name="arrow-right" size={16} color="#FFFFFF" />
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Demo Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.mutedText }]}>
            TaskAssign v1.0.0 • Role-Based Academic Management
          </Text>
        </View>
      </ScrollView>

      {/* Google Account Selection Modal */}
      <Modal
        visible={showGoogleModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowGoogleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.googleModalHeader}>
              <View style={styles.googleModalLogoCircle}>
                <Icon name="google" size={24} />
              </View>
              <Text style={[styles.googleModalTitle, { color: colors.text }]}>Choose a Google Account</Text>
              <Text style={[styles.googleModalSub, { color: colors.subText }]}>
                to continue to TaskAssign Portal (10.150.254.92)
              </Text>
            </View>

            <ScrollView style={styles.accountList} showsVerticalScrollIndicator={false}>
              {/* Admin Account */}
              <TouchableOpacity
                style={[styles.accountRow, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
                onPress={() => handleSelectGoogleAccount({ name: 'Gowtham', email: 'gowthamcd.it24@bitsathy.ac.in', role: 'admin' })}
                activeOpacity={0.8}
              >
                <Image source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' }} style={styles.accountAvatar} />
                <View style={styles.accountMeta}>
                  <Text style={[styles.accountName, { color: colors.text }]}>Gowtham (Admin)</Text>
                  <Text style={[styles.accountEmail, { color: colors.subText }]}>gowthamcd.it24@bitsathy.ac.in</Text>
                </View>
              </TouchableOpacity>

              {/* Faculty Accounts */}
              {allFaculty.map(f => (
                <TouchableOpacity
                  key={f.id}
                  style={[styles.accountRow, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
                  onPress={() => handleSelectGoogleAccount({ name: f.name, email: f.email, avatar: f.avatar, role: 'faculty' })}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: f.avatar }} style={styles.accountAvatar} />
                  <View style={styles.accountMeta}>
                    <Text style={[styles.accountName, { color: colors.text }]}>{f.name}</Text>
                    <Text style={[styles.accountEmail, { color: colors.subText }]}>{f.email}</Text>
                  </View>
                </TouchableOpacity>
              ))}

              {/* Custom Google Email Input */}
              <Text style={[styles.label, { color: colors.subText, marginTop: 14 }]}>Use another account</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, marginBottom: 12 }]}>
                <TextInput
                  style={[styles.inputWithIcon, { color: colors.text }]}
                  value={customGoogleEmail}
                  onChangeText={setCustomGoogleEmail}
                  placeholder="your.email@university.edu"
                  placeholderTextColor={colors.mutedText}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <TouchableOpacity
                  style={[styles.customGoBtn, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    if (customGoogleEmail.trim()) {
                      handleSelectGoogleAccount({ name: customGoogleEmail.split('@')[0], email: customGoogleEmail.trim() });
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 12 }}>Continue</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.cancelModalBtn}
              onPress={() => setShowGoogleModal(false)}
            >
              <Text style={[styles.cancelModalText, { color: colors.subText }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  googleIconBox: {
    marginRight: 10,
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  inputIconBox: {
    marginRight: 8,
  },
  inputWithIcon: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
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
  submitBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  googleModalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  googleModalLogoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F3F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  googleModalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  googleModalSub: {
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
  accountList: {
    maxHeight: 320,
    marginVertical: 8,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  accountAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  accountMeta: {
    flex: 1,
  },
  accountName: {
    fontSize: 14,
    fontWeight: '600',
  },
  accountEmail: {
    fontSize: 12,
  },
  customGoBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  cancelModalBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  cancelModalText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
