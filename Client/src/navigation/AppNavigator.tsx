import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Alert } from 'react-native';
import { User, Task, Priority, AdminTab, FacultyTab, NotificationItem } from '../types';
import { fetchUsers, fetchTasks, createTask, completeTask, createUser, updateUser, deleteUser, fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api';
import { TabBar } from '../components/navigation/TabBar';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { AdminScreen } from '../screens/Admin/Dashboard/AdminScreen';
import { AssignTaskScreen } from '../screens/Admin/AssignTask/AssignTaskScreen';
import { FacultyDirectoryScreen } from '../screens/Admin/FacultyDirectory/FacultyDirectoryScreen';
import { TaskAnalyticsScreen } from '../screens/Admin/TaskAnalytics/TaskAnalyticsScreen';
import { AdminProfileScreen } from '../screens/Admin/AdminProfile/AdminProfileScreen';
import { FacultyScreen } from '../screens/Faculty/FacultyDashboard/FacultyScreen';
import { TaskHistoryScreen } from '../screens/Faculty/TaskHistory/TaskHistoryScreen';
import { FacultyNotificationsScreen } from '../screens/Faculty/Notifications/FacultyNotificationsScreen';
import { FacultyProfileScreen } from '../screens/Faculty/FacultyProfile/FacultyProfileScreen';
import { useTheme } from '../context/ThemeContext';

// ==========================================
// 1. Admin Navigator Component
// ==========================================
interface AdminNavigatorProps {
  allFaculty: User[];
  allTasks: Task[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onAssignTask: (taskData: {
    title: string;
    description: string;
    assignedTo: string | string[];
    date: string;
    startTime: string;
    endTime: string;
    priority: Priority;
  }) => void;
  onAddFaculty: (facultyData: {
    name: string;
    email: string;
    department: string;
    title: string;
    avatar?: string;
  }) => void;
  onUpdateFaculty: (updatedData: {
    id: string;
    name: string;
    email: string;
    department: string;
    regNo: string;
  }) => void;
  onDeleteFaculty?: (id: string) => void;
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onLogout: () => void;
}

export const AdminNavigator: React.FC<AdminNavigatorProps> = ({
  allFaculty,
  allTasks,
  selectedDate,
  onSelectDate,
  onAssignTask,
  onAddFaculty,
  onUpdateFaculty,
  onDeleteFaculty,
  activeTab,
  onTabChange,
  onLogout,
}) => {
  const { colors } = useTheme();
  const [preselectedFacultyId, setPreselectedFacultyId] = useState<string>('');

  const handleAssignTaskForFaculty = (facultyId: string) => {
    setPreselectedFacultyId(facultyId);
    onTabChange('assign');
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'assign':
        return (
          <AssignTaskScreen
            allFaculty={allFaculty}
            defaultDate={selectedDate}
            initialFacultyId={preselectedFacultyId}
            onAssignTask={(taskData) => {
              onAssignTask(taskData);
              setPreselectedFacultyId('');
              onTabChange('schedule');
            }}
            onNavigateToSchedule={() => {
              setPreselectedFacultyId('');
              onTabChange('schedule');
            }}
          />
        );
      case 'directory':
        return (
          <FacultyDirectoryScreen
            allFaculty={allFaculty}
            allTasks={allTasks}
            onAddFaculty={onAddFaculty}
            onAssignTaskForFaculty={handleAssignTaskForFaculty}
            onUpdateFaculty={onUpdateFaculty}
            onDeleteFaculty={onDeleteFaculty}
          />
        );
      case 'analytics':
        return (
          <TaskAnalyticsScreen
            allTasks={allTasks}
            allFaculty={allFaculty}
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
          />
        );
      case 'profile':
        return (
          <AdminProfileScreen
            allFaculty={allFaculty}
            allTasks={allTasks}
            onLogout={onLogout}
          />
        );
      case 'schedule':
      default:
        return (
          <AdminScreen
            tasks={allTasks}
            allFaculty={allFaculty}
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
            onAssignTask={onAssignTask}
            onNavigateToAssignScreen={() => onTabChange('assign')}
            onLogout={onLogout}
          />
        );
    }
  };

  return (
    <View style={[styles.subContainer, { backgroundColor: colors.background }]}>
      {renderActiveScreen()}
    </View>
  );
};

// ==========================================
// 2. Faculty Navigator Component
// ==========================================
interface FacultyNavigatorProps {
  currentFaculty: User | null;
  allTasks: Task[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onCompleteTask: (taskId: string, note: string) => void;
  activeTab: FacultyTab;
  onLogout: () => void;
}

export const FacultyNavigator: React.FC<FacultyNavigatorProps> = ({
  currentFaculty,
  allTasks,
  selectedDate,
  onSelectDate,
  onCompleteTask,
  activeTab,
  onLogout,
}) => {
  const { colors } = useTheme();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    const loadNotifications = async () => {
      try {
        const notifs = await fetchNotifications(currentFaculty?.id);
        if (isMounted) {
          setNotifications(notifs);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };
    loadNotifications();
    return () => {
      isMounted = false;
    };
  }, [currentFaculty?.id]);

  const handleMarkAsRead = async (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
    await markNotificationRead(id);
  };

  const handleMarkAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    await markAllNotificationsRead(currentFaculty?.id);
  };

  const handleClearRead = () => {
    setNotifications(prev => prev.filter(n => !n.isRead));
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'history':
        return (
          <TaskHistoryScreen
            currentFaculty={currentFaculty}
            allTasks={allTasks}
          />
        );
      case 'notifications':
        return (
          <FacultyNotificationsScreen
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onClearRead={handleClearRead}
          />
        );
      case 'profile':
        return (
          <FacultyProfileScreen
            currentFaculty={currentFaculty}
            allTasks={allTasks}
            onLogout={onLogout}
          />
        );
      case 'schedule':
      default:
        return (
          <FacultyScreen
            currentFaculty={currentFaculty}
            tasks={allTasks}
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
            onCompleteTask={onCompleteTask}
          />
        );
    }
  };

  return (
    <View style={[styles.subContainer, { backgroundColor: colors.background }]}>
      {renderActiveScreen()}
    </View>
  );
};

// ==========================================
// 3. Master App Navigator Component
// ==========================================
export const AppNavigator: React.FC = () => {
  const { colors } = useTheme();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allFaculty, setAllFaculty] = useState<User[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Active Tab States
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('schedule');
  const [activeFacultyTab, setActiveFacultyTab] = useState<FacultyTab>('schedule');

  // Initial Data Loader
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const facultyList = await fetchUsers('faculty');
      setAllFaculty(facultyList);

      const allTasks = await fetchTasks();
      setTasks(allTasks);
    } catch (err) {
      console.error('Error loading initial portal data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auth Handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setActiveAdminTab('schedule');
    } else {
      setActiveFacultyTab('schedule');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Admin Handlers
  const handleAssignTask = async (taskData: {
    title: string;
    description: string;
    assignedTo: string | string[];
    date: string;
    startTime: string;
    endTime: string;
    priority: Priority;
  }) => {
    const facultyIds = Array.isArray(taskData.assignedTo)
      ? taskData.assignedTo
      : [taskData.assignedTo];

    if (facultyIds.length === 0) {
      Alert.alert('Required Field', 'Please select at least one faculty member.');
      return;
    }

    try {
      const newTasks: Task[] = [];
      for (const fId of facultyIds) {
        const facultyObj = allFaculty.find(f => f.id === fId);
        const created = await createTask({
          ...taskData,
          assignedTo: fId,
          assignedBy: currentUser?.name || 'Academic Dean',
          assignedToName: facultyObj?.name || 'Faculty Member',
        });
        newTasks.push(created);
      }
      setTasks(prev => [...newTasks, ...prev]);

      const count = newTasks.length;
      const names = newTasks.map(t => t.assignedToName).join(', ');
      Alert.alert(
        'Task Assigned!',
        count === 1
          ? `Successfully assigned "${taskData.title}" to ${names} for ${taskData.date}.`
          : `Successfully assigned "${taskData.title}" to ${count} faculty members (${names}) for ${taskData.date}.`
      );
    } catch {
      Alert.alert('Error', 'Failed to assign task. Please try again.');
    }
  };

  const handleAddFaculty = async (facultyData: {
    name: string;
    email: string;
    department: string;
    title: string;
    avatar?: string;
  }) => {
    try {
      const createdUser = await createUser(facultyData);
      setAllFaculty(prev => [...prev, createdUser]);
      Alert.alert(
        'Faculty Registered!',
        `Successfully registered ${createdUser.name} (${createdUser.department}) into the academic directory.`
      );
    } catch {
      Alert.alert('Error', 'Failed to register faculty member. Please try again.');
    }
  };

  const handleUpdateFaculty = async (updatedData: {
    id: string;
    name: string;
    email: string;
    department: string;
    regNo: string;
  }) => {
    try {
      const updated = await updateUser(updatedData.id, updatedData);
      setAllFaculty(prev =>
        prev.map(f => (f.id === updatedData.id ? { ...f, ...updated } : f))
      );
      Alert.alert('Faculty Updated', `Successfully updated profile details for ${updatedData.name}.`);
    } catch {
      Alert.alert('Error', 'Failed to update faculty profile details.');
    }
  };

  const handleDeleteFaculty = async (id: string) => {
    try {
      await deleteUser(id);
      setAllFaculty(prev => prev.filter(f => f.id !== id));
      Alert.alert('Faculty Removed', 'Faculty member has been removed from the directory.');
    } catch {
      Alert.alert('Error', 'Failed to delete faculty member.');
    }
  };

  // Faculty Handlers
  const handleCompleteTask = async (taskId: string, note: string) => {
    try {
      const updated = await completeTask(taskId, note);
      setTasks(prev => prev.map(t => (t.id === taskId ? updated : t)));
      Alert.alert(
        'Task Completed!',
        'Your completion status and remarks have been recorded successfully.'
      );
    } catch {
      Alert.alert('Error', 'Failed to complete task. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.subText }]}>
          Loading Academic Task Portal...
        </Text>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <LoginScreen
        allFaculty={allFaculty}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      {/* Active Route Body */}
      <View style={styles.contentBody}>
        {currentUser.role === 'admin' ? (
          <AdminNavigator
            allFaculty={allFaculty}
            allTasks={tasks}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onAssignTask={handleAssignTask}
            onAddFaculty={handleAddFaculty}
            onUpdateFaculty={handleUpdateFaculty}
            onDeleteFaculty={handleDeleteFaculty}
            activeTab={activeAdminTab}
            onTabChange={setActiveAdminTab}
            onLogout={handleLogout}
          />
        ) : (
          <FacultyNavigator
            currentFaculty={currentUser}
            allTasks={tasks}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onCompleteTask={handleCompleteTask}
            activeTab={activeFacultyTab}
            onLogout={handleLogout}
          />
        )}
      </View>

      {/* Bottom Navigation Bar */}
      <TabBar
        role={currentUser.role}
        activeAdminTab={activeAdminTab}
        activeFacultyTab={activeFacultyTab}
        onSelectAdminTab={setActiveAdminTab}
        onSelectFacultyTab={setActiveFacultyTab}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  subContainer: {
    flex: 1,
  },
  contentBody: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
    fontWeight: '600',
  },
});
