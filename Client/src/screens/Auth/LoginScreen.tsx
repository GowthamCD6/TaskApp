import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { User } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { Icon } from '../../components/common/Icon';
import { loginUser, loginWithGoogle } from '../../services/api';

interface LoginScreenProps {
  allFaculty?: User[];
  onLoginSuccess: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
}) => {
  const { isDark, colors, toggleTheme } = useTheme();
  const [regNo, setRegNo] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  useEffect(() => {
    try {
      GoogleSignin.configure({
        scopes: ['email', 'profile'],
      });
    } catch (err) {
      console.warn('GoogleSignin configure warning:', err);
    }
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      // Ensure GoogleSignin is configured before any native Google API call
      GoogleSignin.configure({
        scopes: ['email', 'profile'],
      });

      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      try {
        await GoogleSignin.signOut();
      } catch (e) {
        // Ignore signout error if session not present
      }

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
      }
    } catch (error: any) {
      if (error.code !== statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert('Google Sign-In Error', error.message || 'Failed to complete Google authentication.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogin = async () => {
    if (!regNo.trim()) {
      Alert.alert('Validation Error', 'Please enter your Reg. No., Email, or User ID.');
      return;
    }
    if (!password) {
      Alert.alert('Validation Error', 'Please enter your Password.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const authenticatedUser = await loginUser({
        regNo: regNo.trim(),
        password,
      });
      onLoginSuccess(authenticatedUser);
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Unable to authenticate with backend server.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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

          {/* Unified Login Card */}
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
              disabled={isLoggingIn}
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
              <Text style={[styles.dividerText, { color: colors.mutedText }]}>OR SIGN IN WITH ID</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.cardBorder }]} />
            </View>

            {/* Credentials Form */}
            <View style={styles.formContainer}>
              <Text style={[styles.label, { color: colors.subText }]}>Reg. No / Email / User ID</Text>
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
                  placeholder="e.g. 242IT163 or FAC-2026-101"
                  placeholderTextColor={colors.mutedText}
                  autoCapitalize="none"
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
                  placeholder="Enter password"
                  placeholderTextColor={colors.mutedText}
                  secureTextEntry
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                {
                  backgroundColor: colors.primary,
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
                  <Text style={styles.submitBtnText}>Sign In to TaskAssign</Text>
                  <View style={{ marginLeft: 8 }}>
                    <Icon name="arrow-right" size={16} color="#FFFFFF" />
                  </View>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.mutedText }]}>
              TaskAssign v1.0.0 • Role-Based Academic Management
            </Text>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
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
    flexGrow: 1,
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
  formContainer: {
    marginBottom: 16,
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
});
