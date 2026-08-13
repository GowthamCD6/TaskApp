import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Alert } from 'react-native';
import { User, Task, Priority, AdminTab, FacultyTab } from '../types';
import { fetchUsers, fetchTasks, createTask, completeTask, createUser } from '../services/api';
import { Header } from '../components/common/Header';
import { TabBar } from '../components/navigation/TabBar';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { AdminScreen } from '../screens/Admin/AdminScreen';
import { AssignTaskScreen } from '../screens/Admin/AssignTaskScreen';
import { FacultyDirectoryScreen } from '../screens/Admin/FacultyDirectoryScreen';
import { TaskAnalyticsScreen } from '../screens/Admin/TaskAnalyticsScreen';
import { FacultyScreen } from '../screens/Faculty/FacultyScreen';
import { TaskHistoryScreen } from '../screens/Faculty/TaskHistoryScreen';
import { FacultyProfileScreen } from '../screens/Faculty/FacultyProfileScreen';

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
    assignedTo: string;
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
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

export const AdminNavigator: React.FC<AdminNavigatorProps> = ({
  allFaculty,
  allTasks,
  selectedDate,
  onSelectDate,
  onAssignTask,
  onAddFaculty,
  activeTab,
  onTabChange,
}) => {
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
          />
        );
      case 'analytics':
        return (
          <TaskAnalyticsScreen
            allTasks={allTasks}
            allFaculty={allFaculty}
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
          />
        );
    }
  };

  return <View style={styles.subContainer}>{renderActiveScreen()}</View>;
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
}

export const FacultyNavigator: React.FC<FacultyNavigatorProps> = ({
  currentFaculty,
  allTasks,
  selectedDate,
  onSelectDate,
  onCompleteTask,
  activeTab,
}) => {
  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'history':
        return (
          <TaskHistoryScreen
            currentFaculty={currentFaculty}
            allTasks={allTasks}
          />
        );
      case 'profile':
        return (
          <FacultyProfileScreen
            currentFaculty={currentFaculty}
            allTasks={allTasks}
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

  return <View style={styles.subContainer}>{renderActiveScreen()}</View>;
};

// ==========================================
// 3. Master App Navigator Component
// ==========================================
export const AppNavigator: React.FC = () => {
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
    assignedTo: string;
    date: string;
    startTime: string;
    endTime: string;
    priority: Priority;
  }) => {
    try {
      const created = await createTask({
        ...taskData,
        assignedBy: currentUser?.name || 'Academic Dean',
        assignedToName: allFaculty.find(f => f.id === taskData.assignedTo)?.name || 'Faculty Member',
      });
      setTasks(prev => [created, ...prev]);
      Alert.alert(
        'Task Assigned!',
        `Successfully assigned "${created.title}" to ${created.assignedToName} for ${created.date}.`
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading Academic Task Portal...</Text>
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
    <View style={styles.mainContainer}>
      {/* Navigation Header Bar */}
      <Header
        currentUser={currentUser}
        allFaculty={allFaculty}
        onFacultySwitch={faculty => setCurrentUser(faculty)}
        onLogout={handleLogout}
      />

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
            activeTab={activeAdminTab}
            onTabChange={setActiveAdminTab}
          />
        ) : (
          <FacultyNavigator
            currentFaculty={currentUser}
            allTasks={tasks}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onCompleteTask={handleCompleteTask}
            activeTab={activeFacultyTab}
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
    backgroundColor: '#090D16',
  },
  subContainer: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  contentBody: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#090D16',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 12,
    fontWeight: '600',
  },
});
