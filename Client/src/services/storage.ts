import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

const USER_SESSION_KEY = '@taskapp_user_session';
const AUTH_TOKEN_KEY = '@taskapp_auth_token';

// In-memory fallback cache (used if AsyncStorage native module is not linked or pending rebuild)
const memoryStore: Record<string, string> = {};
let cachedToken: string | null = null;

const safeGetItem = async (key: string): Promise<string | null> => {
  if (key === AUTH_TOKEN_KEY && cachedToken) return cachedToken;
  try {
    if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
      const val = await AsyncStorage.getItem(key);
      if (val != null) return val;
    }
  } catch {
    // Fallback to memory store if native storage unavailable
  }
  return memoryStore[key] || null;
};

const safeSetItem = async (key: string, value: string): Promise<void> => {
  memoryStore[key] = value;
  if (key === AUTH_TOKEN_KEY) {
    cachedToken = value;
  }
  try {
    if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
      await AsyncStorage.setItem(key, value);
    }
  } catch {
    // Silently retain in memoryStore
  }
};

const safeRemoveItem = async (key: string): Promise<void> => {
  delete memoryStore[key];
  if (key === AUTH_TOKEN_KEY) {
    cachedToken = null;
  }
  try {
    if (AsyncStorage && typeof AsyncStorage.removeItem === 'function') {
      await AsyncStorage.removeItem(key);
    }
  } catch {
    // Silently remove from memoryStore
  }
};

export const saveAuthToken = async (token: string): Promise<void> => {
  cachedToken = token;
  await safeSetItem(AUTH_TOKEN_KEY, token);
};

export const getAuthToken = async (): Promise<string | null> => {
  if (cachedToken) return cachedToken;
  const token = await safeGetItem(AUTH_TOKEN_KEY);
  cachedToken = token;
  return token;
};

export const getCachedAuthToken = (): string | null => {
  return cachedToken;
};

export const clearAuthToken = async (): Promise<void> => {
  cachedToken = null;
  await safeRemoveItem(AUTH_TOKEN_KEY);
};

export const saveUserSession = async (user: User, token?: string): Promise<void> => {
  await safeSetItem(USER_SESSION_KEY, JSON.stringify(user));
  if (token) {
    await saveAuthToken(token);
  }
};

export const getUserSession = async (): Promise<User | null> => {
  const jsonValue = await safeGetItem(USER_SESSION_KEY);
  if (!jsonValue) return null;
  try {
    return JSON.parse(jsonValue);
  } catch {
    return null;
  }
};

export const clearUserSession = async (): Promise<void> => {
  await safeRemoveItem(USER_SESSION_KEY);
  await clearAuthToken();
};
