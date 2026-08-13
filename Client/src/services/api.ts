import { Platform } from 'react-native';
import { User, Task, NotificationItem } from '../types';

// Connect to backend server on laptop IP address (10.150.254.92)
const SERVER_IP = '10.150.254.92';
const BASE_URL = `http://${SERVER_IP}:5000/api`;

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
  },
];

let localTasks: Task[] = [
  {
    id: 'task-101',
    title: 'Grade Midterm Lab Exam',
    description: 'Evaluate lab reports and enter grades into portal for CS-302.',
    assignedTo: 'fac-1',
    assignedToName: 'Dr. Sarah Smith',
    assignedBy: 'Dean James Wilson',
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
    assignedBy: 'Dean James Wilson',
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
    assignedBy: 'Dean James Wilson',
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
    assignedBy: 'Dean James Wilson',
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
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
      signal: AbortSignal.timeout(3000),
    });
    if (response.ok) {
      const json = await response.json();
      return json.data;
    }
  } catch {
    // Fallback to local memory matching
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
    const response = await fetch(`${BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        googleUser: googleUser || {
          id: `google-user-${Date.now()}`,
          email: 'gowthamcd.it24@bitsathy.ac.in',
          name: 'Gowtham (Google Workspace)',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        },
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (response.ok) {
      const json = await response.json();
      return json.data;
    }
  } catch (err) {
    console.warn('Google auth API call error, falling back:', err);
  }

  // Fallback Google User account
  const defaultUser = localUsers.find(u => u.role === 'admin') || localUsers[0];
  return {
    ...defaultUser,
    googleId: `google-123456`,
  };
};

export const fetchUsers = async (role?: string): Promise<User[]> => {
  try {
    const url = role ? `${BASE_URL}/users?role=${role}` : `${BASE_URL}/users`;
    const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (response.ok) {
      const json = await response.json();
      return json.data;
    }
  } catch {
    // Fallback to local memory
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
}): Promise<User> => {
  try {
    const response = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
      signal: AbortSignal.timeout(3000),
    });
    if (response.ok) {
      const json = await response.json();
      return json.data;
    }
  } catch {
    // Fallback to local memory
  }

  const newUser: User = {
    id: `fac-${Date.now()}`,
    name: userData.name,
    email: userData.email,
    role: 'faculty',
    department: userData.department,
    title: userData.title || 'Assistant Professor',
    avatar: userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  };

  localUsers.push(newUser);
  return newUser;
};

export const fetchTasks = async (filters?: { facultyId?: string; date?: string; status?: string }): Promise<Task[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.facultyId) params.append('facultyId', filters.facultyId);
    if (filters?.date) params.append('date', filters.date);
    if (filters?.status) params.append('status', filters.status);

    const url = `${BASE_URL}/tasks?${params.toString()}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (response.ok) {
      const json = await response.json();
      return json.data;
    }
  } catch {
    // Fallback to local memory
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
    const response = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
      signal: AbortSignal.timeout(3000),
    });
    if (response.ok) {
      const json = await response.json();
      return json.data;
    }
  } catch {
    // Fallback local memory
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
    const response = await fetch(`${BASE_URL}/tasks/${taskId}/complete`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completionNote }),
      signal: AbortSignal.timeout(3000),
    });
    if (response.ok) {
      const json = await response.json();
      return json.data;
    }
  } catch {
    // Fallback local memory
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

export const updateUser = async (id: string, userData: Partial<User>): Promise<User> => {
  try {
    const response = await fetch(`${BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
      signal: AbortSignal.timeout(5000),
    });
    if (response.ok) {
      const json = await response.json();
      return json.data;
    }
  } catch {
    // Fallback local memory
  }

  const index = localUsers.findIndex(u => u.id === id);
  if (index !== -1) {
    localUsers[index] = { ...localUsers[index], ...userData };
    return localUsers[index];
  }
  throw new Error('User not found');
};

export const fetchNotifications = async (userId?: string): Promise<NotificationItem[]> => {
  try {
    const url = userId ? `${BASE_URL}/notifications?userId=${userId}` : `${BASE_URL}/notifications`;
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (response.ok) {
      const json = await response.json();
      return json.data;
    }
  } catch {
    // Fallback local memory
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
      senderName: 'Dean James Wilson',
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
    const response = await fetch(`${BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
};

export const markAllNotificationsRead = async (userId?: string): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
};
