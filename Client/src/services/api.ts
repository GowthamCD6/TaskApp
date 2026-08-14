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
    body: JSON.stringify({
      user: googleUser,
    }),
  });
  const json = await response.json();
  if (response.ok && json.data) {
    return json.data;
  }
  throw new Error(json.message || 'Google authentication failed.');
};

export const fetchUsers = async (role?: string): Promise<User[]> => {
  const path = role ? `/users?role=${encodeURIComponent(role)}` : '/users';
  const response = await apiFetch(path, { method: 'GET' });
  const json = await response.json();
  if (response.ok && Array.isArray(json.data)) {
    return json.data;
  }
  throw new Error(json.message || 'Failed to fetch users from server.');
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
  const response = await apiFetch(`/users/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
  const json = await response.json();
  if (response.ok && json.data) {
    return json.data;
  }
  throw new Error(json.message || 'Failed to update user.');
};

export const deleteUser = async (id: string): Promise<boolean> => {
  const response = await apiFetch(`/users/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  const json = await response.json();
  if (response.ok) {
    return true;
  }
  throw new Error(json.message || 'Failed to delete user.');
};

export const fetchTasks = async (filters?: { facultyId?: string; date?: string; status?: string }): Promise<Task[]> => {
  const params = new URLSearchParams();
  if (filters?.facultyId) params.append('facultyId', filters.facultyId);
  if (filters?.date) params.append('date', filters.date);
  if (filters?.status) params.append('status', filters.status);

  const queryStr = params.toString();
  const path = queryStr ? `/tasks?${queryStr}` : '/tasks';
  const response = await apiFetch(path, { method: 'GET' });
  const json = await response.json();
  if (response.ok && Array.isArray(json.data)) {
    return json.data;
  }
  throw new Error(json.message || 'Failed to fetch tasks from server.');
};

export const createTask = async (taskData: {
  title: string;
  description?: string;
  assignedTo: string;
  assignedToName?: string;
  assignedBy?: string;
  date: string;
  startTime: string;
  endTime: string;
  priority: string;
}): Promise<Task> => {
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
  const response = await apiFetch(`/tasks/${encodeURIComponent(taskId)}/complete`, {
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
  const path = userId ? `/notifications?userId=${encodeURIComponent(userId)}` : '/notifications';
  const response = await apiFetch(path, { method: 'GET' });
  const json = await response.json();
  if (response.ok && Array.isArray(json.data)) {
    return json.data;
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
