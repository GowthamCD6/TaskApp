import { Platform } from 'react-native';
import { User, Task } from '../types';

// For Android emulator 10.0.2.2, for iOS/Web localhost
const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

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
