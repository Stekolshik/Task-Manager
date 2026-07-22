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
  googleMapsApiKey: string;
  loading: boolean;

  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updateTaskStatus: (id: string, status: Task['status']) => Promise<void>;

  addHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => Promise<void>;

  toggleTheme: () => Promise<void>;
  setServerUrl: (url: string) => Promise<void>;
  setGoogleMapsApiKey: (key: string) => Promise<void>;

  syncNow: () => Promise<void>;
  clearAllTasks: () => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [serverUrl, setServerUrlState] = useState<string>(DEFAULT_SERVER_URL);
  const [googleMapsApiKey, setGoogleMapsApiKeyState] = useState<string>('');
  const [syncStatus, setSyncStatus] = useState<'online' | 'syncing' | 'offline' | 'error'>('offline');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [savedTasks, savedHistory, savedTheme, savedServerUrl, savedGoogleMapsApiKey] = await Promise.all([
          storage.getTasks(),
          storage.getHistory(),
          storage.getTheme(),
          storage.getServerUrl(),
          storage.getGoogleMapsApiKey()
        ]);

        setTasks(savedTasks);
        setHistory(savedHistory);
        setTheme(savedTheme);
        setServerUrlState(savedServerUrl);
        setGoogleMapsApiKeyState(savedGoogleMapsApiKey);

        await sync.init(savedServerUrl);
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
      syncStatus: 'pending'
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
      const result = await sync.syncNow(serverUrl);
      if (result.success) {
        const syncedTasks = updatedTasks.map(t =>
          t.id === newTask.id ? { ...t, syncStatus: 'synced' as const } : t
        );
        setTasks(syncedTasks);
        await storage.saveTasks(syncedTasks);

        await addHistory({
          taskId: newTask.id,
          action: 'synced',
          description: `Task "${newTask.title}" synced with server`
        });
      } else {
        await addHistory({
          taskId: newTask.id,
          action: 'synced',
          description: `Sync failed for task "${newTask.title}"`
        });
      }
    }
  }, [tasks, addHistory, serverUrl]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const updatedTasks = tasks.map(t =>
      t.id === id
        ? { ...t, ...updates, updatedAt: new Date().toISOString(), syncStatus: 'pending' as const }
        : t
    );

    setTasks(updatedTasks);
    await storage.saveTasks(updatedTasks);

    await addHistory({
      taskId: id,
      action: 'updated',
      description: `Task "${task.title}" updated`
    });

    if (sync.isConnected) {
      const result = await sync.syncNow(serverUrl);
      if (result.success) {
        const syncedTasks = updatedTasks.map(t =>
          t.id === id ? { ...t, syncStatus: 'synced' as const } : t
        );
        setTasks(syncedTasks);
        await storage.saveTasks(syncedTasks);
      }
    }
  }, [tasks, addHistory, serverUrl]);

  const deleteTask = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const updatedTasks = tasks.filter(t => t.id !== id);

    setTasks(updatedTasks);
    await storage.saveTasks(updatedTasks);

    await addHistory({
      taskId: id,
      action: 'deleted',
      description: `Task "${task.title}" deleted`
    });
  }, [tasks, addHistory]);

  const updateTaskStatus = useCallback(async (id: string, status: Task['status']) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const updatedTasks = tasks.map(t =>
      t.id === id
        ? { ...t, status, updatedAt: new Date().toISOString(), syncStatus: 'pending' as const }
        : t
    );

    setTasks(updatedTasks);
    await storage.saveTasks(updatedTasks);

    await addHistory({
      taskId: id,
      action: 'status_changed',
      description: `Task "${task.title}" status changed to "${status}"`
    });

    if (sync.isConnected) {
      const result = await sync.syncNow(serverUrl);
      if (result.success) {
        const syncedTasks = updatedTasks.map(t =>
          t.id === id ? { ...t, syncStatus: 'synced' as const } : t
        );
        setTasks(syncedTasks);
        await storage.saveTasks(syncedTasks);
      }
    }
  }, [tasks, addHistory, serverUrl]);

  const toggleTheme = useCallback(async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    await storage.saveTheme(newTheme);
  }, [theme]);

  const setServerUrl = useCallback(async (url: string) => {
    setServerUrlState(url);
    await storage.saveServerUrl(url);
  }, []);

  const setGoogleMapsApiKey = useCallback(async (key: string) => {
    setGoogleMapsApiKeyState(key);
    await storage.saveGoogleMapsApiKey(key);
  }, []);

  const syncNow = useCallback(async () => {
    console.log('🔄 Manual sync triggered');
    setSyncStatus('syncing');
    const result = await sync.syncNow(serverUrl);
    console.log('📊 Sync result:', result);
    setSyncStatus(result.success ? 'online' : 'error');

    if (result.success) {
      const syncedTasks = tasks.map(t =>
        t.syncStatus === 'pending' ? { ...t, syncStatus: 'synced' as const } : t
      );
      setTasks(syncedTasks);
      await storage.saveTasks(syncedTasks);

      await addHistory({
        taskId: 'all',
        action: 'synced',
        description: 'Manual sync completed'
      });
    } else {
      await addHistory({
        taskId: 'all',
        action: 'synced',
        description: `Sync failed: ${result.error || 'Unknown error'}`
      });
    }
  }, [serverUrl, tasks, addHistory]);

  const clearAllTasks = useCallback(async () => {
    const count = tasks.length;
    setTasks([]);
    await storage.saveTasks([]);

    await addHistory({
      taskId: 'all',
      action: 'deleted',
      description: `Deleted all tasks (${count} tasks)`
    });
  }, [tasks, addHistory]);

  return (
    <AppContext.Provider value={{
      tasks,
      history,
      theme,
      syncStatus,
      serverUrl,
      googleMapsApiKey,
      loading,
      addTask,
      updateTask,
      deleteTask,
      updateTaskStatus,
      addHistory,
      toggleTheme,
      setServerUrl,
      setGoogleMapsApiKey,
      syncNow,
      clearAllTasks
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