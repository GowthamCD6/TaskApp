import { User, Task, NotificationItem } from '../types';
import { API_ENDPOINTS, API_TIMEOUT_MS } from '../config/env';

const apiFetch = async (path: string, options: RequestInit = {}): Promise<Response> => {
  let lastError: any = null;
  const reqHeaders = { 'Content-Type': 'application/json', ...(options.headers || {}) };

  for (const base of API_ENDPOINTS) {
    try {
      const url = `${base}${path}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
      const res = await fetch(url, {
        ...options,
        headers: reqHeaders,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok || res.status < 500) {
        return res;
      }
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('Unable to connect to backend server. Please check your network connection.');
};

// Local fallback mock database in case backend is offline
const formatDate = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

const todayStr = formatDate(0);
const tomorrowStr = formatDate(1);

let localUsers: User[] = [];
let localTasks: Task[] = [];

export const loginUser = async (credentials: {
  regNo?: string;
  email?: string;
  password?: string;
  role?: string;
  id?: string;
}): Promise<User> => {
  const response = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  const json = await response.json();
  if (response.ok && json.data) {
    return json.data;
  }
  throw new Error(json.message || 'Invalid login credentials.');
};

export const loginWithGoogle = async (googleUser?: { id?: string; email?: string; name?: string; avatar?: string }): Promise<User> => {
  const response = await apiFetch('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ googleUser }),
  });
  const json = await response.json();
  if (response.ok && json.data) {
    return json.data;
  }
  throw new Error(json.message || 'Google Authentication failed.');
};

export const fetchUsers = async (role?: string): Promise<User[]> => {
  try {
    const path = role ? `/users?role=${role}` : '/users';
    const response = await apiFetch(path, { method: 'GET' });
    if (response.ok) {
      const json = await response.json();
      return json.data || [];
    }
  } catch (err) {
    console.warn('fetchUsers API error:', err);
  }
  return [];
};

export const createUser = async (userData: {
  name: string;
  email: string;
  department: string;
  title?: string;
  avatar?: string;
  phone?: string;
  officeHours?: string;
  regNo?: string;
  password?: string;
}): Promise<User> => {
  const response = await apiFetch('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  const json = await response.json();
  if (response.ok && json.data) {
    return json.data;
  }
  throw new Error(json.message || 'Failed to create user.');
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<User> => {
  const response = await apiFetch(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
  const json = await response.json();
  if (response.ok && json.data) {
    return json.data;
  }
  throw new Error(json.message || 'Failed to update user profile.');
};

export const deleteUser = async (id: string): Promise<boolean> => {
  const response = await apiFetch(`/users/${id}`, {
    method: 'DELETE',
  });
  return response.ok;
};

export const fetchTasks = async (filters?: { facultyId?: string; date?: string; status?: string }): Promise<Task[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.facultyId) params.append('facultyId', filters.facultyId);
    if (filters?.date) params.append('date', filters.date);
    if (filters?.status) params.append('status', filters.status);

    const path = `/tasks?${params.toString()}`;
    const response = await apiFetch(path, { method: 'GET' });
    if (response.ok) {
      const json = await response.json();
      return json.data || [];
    }
  } catch (err) {
    console.warn('fetchTasks API error:', err);
  }
  return [];
};

export const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'status'>): Promise<Task> => {
  const response = await apiFetch('/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData),
  });
  const json = await response.json();
  if (response.ok && json.data) {
    return json.data;
  }
  throw new Error(json.message || 'Failed to create task.');
};

export const completeTask = async (taskId: string, completionNote: string): Promise<Task> => {
  const response = await apiFetch(`/tasks/${taskId}/complete`, {
    method: 'PATCH',
    body: JSON.stringify({ completionNote }),
  });
  const json = await response.json();
  if (response.ok && json.data) {
    return json.data;
  }
  throw new Error(json.message || 'Failed to complete task.');
};

export const fetchNotifications = async (userId?: string): Promise<NotificationItem[]> => {
  try {
    const path = userId ? `/notifications?userId=${userId}` : '/notifications';
    const response = await apiFetch(path, { method: 'GET' });
    if (response.ok) {
      const json = await response.json();
      return json.data || [];
    }
  } catch (err) {
    console.warn('fetchNotifications API error:', err);
  }
  return [];
};

export const markNotificationRead = async (notificationId: string): Promise<boolean> => {
  try {
    const response = await apiFetch(`/notifications/${encodeURIComponent(notificationId)}/read`, {
      method: 'PATCH',
    });
    return response.ok;
  } catch {
    return false;
  }
};

export const markAllNotificationsRead = async (userId?: string): Promise<boolean> => {
  try {
    const response = await apiFetch('/notifications/read-all', {
      method: 'PATCH',
      body: JSON.stringify({ userId }),
    });
    return response.ok;
  } catch {
    return false;
  }
};
