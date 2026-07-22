import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import * as Notifications from 'expo-notifications';
import { Task, HistoryItem } from '../types';
import { DEFAULT_SERVER_URL } from '../utils/constants';


const STORAGE_KEYS = {
  tasks: '@tasks',
  history: '@history',
  theme: '@theme',
  server: '@server'
};

export const storage = {
  getTasks: async (): Promise<Task[]> => {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.tasks);
    return data ? JSON.parse(data) : [];
  },

  saveTasks: async (tasks: Task[]) => {
    await AsyncStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
  },

  getHistory: async (): Promise<HistoryItem[]> => {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.history);
    return data ? JSON.parse(data) : [];
  },

  saveHistory: async (history: HistoryItem[]) => {
    await AsyncStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
  },

  getTheme: async (): Promise<'light' | 'dark'> => {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.theme);
    return (data as 'light' | 'dark') || 'light';
  },

  saveTheme: async (theme: 'light' | 'dark') => {
    await AsyncStorage.setItem(STORAGE_KEYS.theme, theme);
  },

  getServerUrl: async (): Promise<string> => {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.server);
    return data || DEFAULT_SERVER_URL;
  },

  saveServerUrl: async (url: string) => {
    await AsyncStorage.setItem(STORAGE_KEYS.server, url);
  }
};

export const sync = {
  isConnected: false,

  init: async () => {
    const state = await NetInfo.fetch();
    sync.isConnected = state.isConnected ?? false;

    NetInfo.addEventListener((state: NetInfoState) => {
      const wasConnected = sync.isConnected;
      sync.isConnected = state.isConnected ?? false;
      if (!wasConnected && sync.isConnected) {
        sync.syncNow();
      }
    });
  },

  syncNow: async (): Promise<{ success: boolean; error?: string }> => {
    if (!sync.isConnected) {
      return { success: false, error: 'No internet connection' };
    }

    try {
      const tasks = await storage.getTasks();
      const pendingTasks = tasks.filter(t => t.syncStatus === 'pending');

      if (pendingTasks.length === 0) {
        return { success: true };
      }

      const updatedTasks = tasks.map(t =>
        t.syncStatus === 'pending' ? { ...t, syncStatus: 'synced' as const } : t
      );

      await storage.saveTasks(updatedTasks);
      return { success: true };

    } catch (error) {
      return { success: false, error: 'Sync failed' };
    }
  }
};

export const notifications = {
  requestPermissions: async (): Promise<boolean> => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch {
      return false;
    }
  },

  scheduleReminder: async (task: Task): Promise<string | null> => {
    try {
      const dueDate = new Date(task.dueDate);
      const now = new Date();
      const diffMinutes = (dueDate.getTime() - now.getTime()) / 60000;

      const triggerSeconds = diffMinutes < 30 ? 30 : diffMinutes * 60 - 30 * 60;

      if (triggerSeconds <= 0) {
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Task Reminder',
          body: `Task "${task.title}" in ${Math.round(triggerSeconds / 60)} minutes`,
          data: { taskId: task.id }
        },
        trigger: {
          seconds: Math.max(triggerSeconds, 30)
        }
      });

      return notificationId;

    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }
};