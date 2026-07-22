import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Task, HistoryItem } from '../types';
import { storage, sync, notifications } from '../services/appService';
import { generateId, DEFAULT_SERVER_URL } from '../utils/constants';

type AppContextType = {
  tasks: Task[];
  history: HistoryItem[];
  theme: 'light' | 'dark';
  syncStatus: 'online' | 'syncing' | 'offline' | 'error';
  serverUrl: string;
  loading: boolean;

  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updateTaskStatus: (id: string, status: Task['status']) => Promise<void>;

  addHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => Promise<void>;

  toggleTheme: () => Promise<void>;
  setServerUrl: (url: string) => Promise<void>;

  syncNow: () => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [serverUrl, setServerUrlState] = useState<string>(DEFAULT_SERVER_URL);
  const [syncStatus, setSyncStatus] = useState<'online' | 'syncing' | 'offline' | 'error'>('offline');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [savedTasks, savedHistory, savedTheme, savedServerUrl] = await Promise.all([
          storage.getTasks(),
          storage.getHistory(),
          storage.getTheme(),
          storage.getServerUrl()
        ]);

        setTasks(savedTasks);
        setHistory(savedHistory);
        setTheme(savedTheme);
        setServerUrlState(savedServerUrl);

        await sync.init();
        setSyncStatus(sync.isConnected ? 'online' : 'offline');

        await notifications.requestPermissions();

      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const addHistory = useCallback(async (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: generateId(),
      timestamp: new Date().toISOString()
    };

    const updatedHistory = [newItem, ...history];
    setHistory(updatedHistory);
    await storage.saveHistory(updatedHistory);
  }, [history]);

  const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => {
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: sync.isConnected ? 'synced' : 'pending'
    };

    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    await storage.saveTasks(updatedTasks);

    await addHistory({
      taskId: newTask.id,
      action: 'created',
      description: `Created task "${newTask.title}"`
    });

    await notifications.scheduleReminder(newTask);

    if (sync.isConnected) {
      await sync.syncNow();
    }
  }, [tasks, addHistory]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    const updatedTasks = tasks.map(task =>
      task.id === id
        ? { ...task, ...updates, updatedAt: new Date().toISOString() }
        : task
    );

    setTasks(updatedTasks);
    await storage.saveTasks(updatedTasks);

    await addHistory({
      taskId: id,
      action: 'updated',
      description: `Updated task`
    });
  }, [tasks, addHistory]);

  const deleteTask = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    const updatedTasks = tasks.filter(t => t.id !== id);

    setTasks(updatedTasks);
    await storage.saveTasks(updatedTasks);

    if (task) {
      await addHistory({
        taskId: id,
        action: 'deleted',
        description: `Deleted task "${task.title}"`
      });
    }
  }, [tasks, addHistory]);

  const updateTaskStatus = useCallback(async (id: string, status: Task['status']) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const updatedTasks = tasks.map(t =>
      t.id === id
        ? { ...t, status, updatedAt: new Date().toISOString() }
        : t
    );

    setTasks(updatedTasks);
    await storage.saveTasks(updatedTasks);

    await addHistory({
      taskId: id,
      action: 'status_changed',
      description: `Status changed to "${status}"`
    });
  }, [tasks, addHistory]);

  const toggleTheme = useCallback(async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    await storage.saveTheme(newTheme);
  }, [theme]);

  const setServerUrl = useCallback(async (url: string) => {
    setServerUrlState(url);
    await storage.saveServerUrl(url);
  }, []);

  const syncNow = useCallback(async () => {
    setSyncStatus('syncing');
    const result = await sync.syncNow();
    setSyncStatus(result.success ? 'online' : 'error');
  }, []);

  return (
    <AppContext.Provider value={{
      tasks,
      history,
      theme,
      syncStatus,
      serverUrl,
      loading,
      addTask,
      updateTask,
      deleteTask,
      updateTaskStatus,
      addHistory,
      toggleTheme,
      setServerUrl,
      syncNow
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};