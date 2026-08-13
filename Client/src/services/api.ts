import { Platform } from 'react-native';
import { User, Task, NotificationItem } from '../types';

// Dynamic multi-host backend connection for Wi-Fi IP (10.150.255.47), Android Emulator (10.0.2.2), & Localhost
const API_ENDPOINTS = [
  'http://10.150.255.47:5000/api',
  'http://10.0.2.2:5000/api',
  'http://localhost:5000/api',
];

const apiFetch = async (path: string, options: RequestInit = {}): Promise<Response> => {
  let lastError: any = null;
  const reqHeaders = { 'Content-Type': 'application/json', ...(options.headers || {}) };

  for (const base of API_ENDPOINTS) {
    try {
      const url = `${base}${path}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
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
  throw lastError || new Error('Unable to connect to backend server');
};

// Local fallback mock database in case backend is offline
const formatDate = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

const todayStr = formatDate(0);
const tomorrowStr = formatDate(1);

let localUsers: User[] = [
  {
    id: 'fac-1',
    name: 'Dr. Sarah Smith',
    email: 'sarah.smith@university.edu',
    regNo: 'FAC-2026-101',
    password: '123456',
    role: 'faculty',
    department: 'Computer Science',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    title: 'Associate Professor',
    phone: '+1 (555) 123-4567',
    officeHours: 'Mon - Thu, 10:00 AM - 02:00 PM',
  },
  {
    id: 'fac-2',
    name: 'Prof. Alan Turing',
    email: 'alan.turing@university.edu',
    regNo: 'FAC-2026-102',
    password: '123456',
    role: 'faculty',
    department: 'Artificial Intelligence',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    title: 'Department Head',
    phone: '+1 (555) 987-6543',
    officeHours: 'Tue - Fri, 11:00 AM - 03:00 PM',
  },
  {
    id: 'fac-3',
    name: 'Dr. Emily Watson',
    email: 'emily.watson@university.edu',
    regNo: 'FAC-2026-103',
    password: '123456',
    role: 'faculty',
    department: 'Software Engineering',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    title: 'Assistant Professor',
    phone: '+1 (555) 456-7890',
    officeHours: 'Mon - Wed, 01:00 PM - 04:00 PM',
  },
  {
    id: 'fac-4',
    name: 'Prof. Robert Miller',
    email: 'robert.miller@university.edu',
    regNo: 'FAC-2026-104',
    password: '123456',
    role: 'faculty',
    department: 'Cyber Security',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    title: 'Senior Lecturer',
    phone: '+1 (555) 321-7654',
    officeHours: 'Wed - Fri, 09:00 AM - 01:00 PM',
  },
  {
    id: 'admin-1',
    name: 'Gowtham',
    email: 'gowthamcd.it24@bitsathy.ac.in',
    regNo: '242IT163',
    password: '123456',
    role: 'admin',
    department: 'Information Technology',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    title: 'System Administrator',
    phone: '+91 9876543210',
    officeHours: 'Mon - Fri, 09:00 AM - 05:00 PM',
  },
];

let localTasks: Task[] = [
  {
    id: 'task-101',
    title: 'Grade Midterm Lab Exam',
    description: 'Evaluate lab reports and enter grades into portal for CS-302.',
    assignedTo: 'fac-1',
    assignedToName: 'Dr. Sarah Smith',
    assignedBy: 'Gowtham',
    date: todayStr,
    startTime: '09:00',
    endTime: '11:30',
    priority: 'High',
    status: 'pending',
    completionNote: '',
    completedAt: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-102',
    title: 'AI Curriculum Review Meeting',
    description: 'Review syllabus updates for modern Generative AI modules.',
    assignedTo: 'fac-2',
    assignedToName: 'Prof. Alan Turing',
    assignedBy: 'Gowtham',
    date: todayStr,
    startTime: '14:00',
    endTime: '15:30',
    priority: 'Medium',
    status: 'pending',
    completionNote: '',
    completedAt: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-103',
    title: 'Prepare Lecture Slides on React Native',
    description: 'Create slide deck on state management and navigation primitives.',
    assignedTo: 'fac-3',
    assignedToName: 'Dr. Emily Watson',
    assignedBy: 'Gowtham',
    date: todayStr,
    startTime: '11:00',
    endTime: '13:00',
    priority: 'High',
    status: 'completed',
    completionNote: 'Finished slides and uploaded PDF to course repository for students.',
    completedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-104',
    title: 'Cyber Security Accreditation Audit',
    description: 'Compile ISO compliance report for lab infrastructure.',
    assignedTo: 'fac-4',
    assignedToName: 'Prof. Robert Miller',
    assignedBy: 'Gowtham',
    date: tomorrowStr,
    startTime: '10:00',
    endTime: '12:00',
    priority: 'High',
    status: 'pending',
    completionNote: '',
    completedAt: null,
    createdAt: new Date().toISOString(),
  },
];

export const loginUser = async (credentials: {
  regNo?: string;
  email?: string;
  password?: string;
  role?: string;
  id?: string;
}): Promise<User> => {
  try {
    const response = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (response.ok) {
      const json = await response.json();
      return json.data;
    }
  } catch (err) {
    console.warn('API login error, using local fallback:', err);
  }

  if (credentials.id) {
    const found = localUsers.find(u => u.id === credentials.id);
    if (found) return found;
  }
  if (credentials.regNo) {
    const found = localUsers.find(u => u.regNo?.toLowerCase() === credentials.regNo?.toLowerCase());
    if (found) return found;
  }
  if (credentials.role) {
    const found = localUsers.find(u => u.role.toLowerCase() === credentials.role?.toLowerCase());
    if (found) return found;
  }
  return localUsers[0];
};

export const loginWithGoogle = async (googleUser?: { id?: string; email?: string; name?: string; avatar?: string }): Promise<User> => {
  try {
    const response = await apiFetch('/auth/google', {
      method: 'POST',
      body: JSON.stringify({
        googleUser: googleUser || {
          id: `google-user-${Date.now()}`,
          email: 'gowthamcd.it24@bitsathy.ac.in',
          name: 'Gowtham (Google Workspace)',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        },
      }),
    });
    if (response.ok) {
      const json = await response.json();
      return json.data;
    }
  } catch (err) {
    console.warn('Google auth API call error, falling back:', err);
  }

  const defaultUser = localUsers.find(u => u.role === 'admin') || localUsers[0];
  return {
    ...defaultUser,
    googleId: `google-123456`,
  };
};

export const fetchUsers = async (role?: string): Promise<User[]> => {
  try {
    const path = role ? `/users?role=${role}` : '/users';
    const response = await apiFetch(path, { method: 'GET' });
    if (response.ok) {
      const json = await response.json();
      return json.data;
    }
  } catch (err) {
    console.warn('fetchUsers API error, using local fallback:', err);
  }

  if (role) {
    return localUsers.filter(u => u.role.toLowerCase() === role.toLowerCase());
  }
  return localUsers;
};

export const createUser = async (userData: {
  name: string;
  email: string;
  department: string;
  title?: string;
  avatar?: string;
  phone?: string;
  officeHours?: string;
}): Promise<User> => {
  try {
    const response = await apiFetch('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (response.ok) {
      const json = await response.json();
      return json.data;
    }
  } catch (err) {
    console.warn('createUser API error, using local fallback:', err);
  }

  const newUser: User = {
    id: `fac-${Date.now()}`,
    name: userData.name,
    email: userData.email,
    role: 'faculty',
    department: userData.department,
    title: userData.title || 'Assistant Professor',
    avatar: userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    phone: userData.phone || '+1 (555) 123-4567',
    officeHours: userData.officeHours || 'Mon - Fri, 09:00 AM - 05:00 PM',
  };

  localUsers.push(newUser);
  return newUser;
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<User> => {
  try {
    const response = await apiFetch(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    if (response.ok) {
      const json = await response.json();
      return json.data;
    }
  } catch (err) {
    console.warn('updateUser API error, using local fallback:', err);
  }

  const index = localUsers.findIndex(u => u.id === id);
  if (index !== -1) {
    localUsers[index] = { ...localUsers[index], ...userData };
    return localUsers[index];
  }
  throw new Error('User not found');
};

export const deleteUser = async (id: string): Promise<boolean> => {
  try {
    const response = await apiFetch(`/users/${id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      const index = localUsers.findIndex(u => u.id === id);
      if (index !== -1) localUsers.splice(index, 1);
      return true;
    }
  } catch (err) {
    console.warn('deleteUser API error, using local fallback:', err);
  }

  const index = localUsers.findIndex(u => u.id === id);
  if (index !== -1) {
    localUsers.splice(index, 1);
    return true;
  }
  return false;
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
      return json.data;
    }
  } catch (err) {
    console.warn('fetchTasks API error, using local fallback:', err);
  }

  let result = [...localTasks];
  if (filters?.facultyId) {
    result = result.filter(t => t.assignedTo === filters.facultyId);
  }
  if (filters?.date) {
    result = result.filter(t => t.date === filters.date);
  }
  if (filters?.status) {
    result = result.filter(t => t.status === filters.status);
  }
  return result.sort((a, b) => (a.startTime > b.startTime ? 1 : -1));
};

export const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'status'>): Promise<Task> => {
  try {
    const response = await apiFetch('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
    if (response.ok) {
      const json = await response.json();
      return json.data;
    }
  } catch (err) {
    console.warn('createTask API error, using local fallback:', err);
  }

  const faculty = localUsers.find(u => u.id === taskData.assignedTo);
  const newTask: Task = {
    ...taskData,
    id: `task-${Date.now()}`,
    assignedToName: faculty?.name || 'Faculty Member',
    status: 'pending',
    completionNote: '',
    completedAt: null,
    createdAt: new Date().toISOString(),
  };

  localTasks.unshift(newTask);
  return newTask;
};

export const completeTask = async (taskId: string, completionNote: string): Promise<Task> => {
  try {
    const response = await apiFetch(`/tasks/${taskId}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ completionNote }),
    });
    if (response.ok) {
      const json = await response.json();
      return json.data;
    }
  } catch (err) {
    console.warn('completeTask API error, using local fallback:', err);
  }

  const taskIndex = localTasks.findIndex(t => t.id === taskId);
  if (taskIndex !== -1) {
    localTasks[taskIndex] = {
      ...localTasks[taskIndex],
      status: 'completed',
      completionNote: completionNote || 'Task completed.',
      completedAt: new Date().toISOString(),
    };
    return localTasks[taskIndex];
  }
  throw new Error('Task not found');
};

export const fetchNotifications = async (userId?: string): Promise<NotificationItem[]> => {
  try {
    const path = userId ? `/notifications?userId=${userId}` : '/notifications';
    const response = await apiFetch(path, { method: 'GET' });
    if (response.ok) {
      const json = await response.json();
      return json.data;
    }
  } catch (err) {
    console.warn('fetchNotifications API error, using local fallback:', err);
  }

  return [
    {
      id: 'notif-1',
      title: 'Urgent Room Change Notice',
      message: 'The 2:00 PM Data Structures lecture has been moved to Auditorium 302 due to maintenance.',
      type: 'urgent',
      timestamp: '10 mins ago',
      isRead: false,
      senderName: 'Academic Office',
    },
    {
      id: 'notif-2',
      title: 'New Task Assigned by Dean',
      message: 'You have been assigned to evaluate mid-term examination answer scripts.',
      type: 'task_assigned',
      timestamp: '1 hour ago',
      isRead: false,
      senderName: 'Gowtham',
    },
    {
      id: 'notif-3',
      title: 'Upcoming Lecture Reminder',
      message: 'Advanced Software Engineering lecture starts in 30 minutes at Room 104.',
      type: 'reminder',
      timestamp: '2 hours ago',
      isRead: true,
      senderName: 'System Reminder',
    },
  ];
};

export const markNotificationRead = async (notificationId: string): Promise<boolean> => {
  try {
    const response = await apiFetch(`/notifications/${notificationId}/read`, {
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
