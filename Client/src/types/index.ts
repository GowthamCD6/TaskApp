export type UserRole = 'admin' | 'faculty';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar: string;
  title: string;
  phone?: string;
  officeHours?: string;
}

export type Priority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'pending' | 'completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string; // Faculty User ID
  assignedToName: string;
  assignedBy: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm (e.g., "09:00")
  endTime: string; // HH:mm (e.g., "11:00")
  priority: Priority;
  status: TaskStatus;
  completionNote?: string;
  completedAt?: string | null;
  createdAt: string;
}

export type AdminTab = 'schedule' | 'assign' | 'directory' | 'analytics';
export type FacultyTab = 'schedule' | 'history' | 'profile';
