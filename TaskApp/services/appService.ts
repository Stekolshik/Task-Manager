import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { Task, HistoryItem } from '../types';
import { DEFAULT_SERVER_URL } from '../utils/constants';

const STORAGE_KEYS = {
  tasks: '@tasks',
  history: '@history',
  theme: '@theme',
  server: '@server',
  googleMapsApiKey: '@google_maps_api_key'
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
  },

  getGoogleMapsApiKey: async (): Promise<string> => {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.googleMapsApiKey);
    return data || '';
  },

  saveGoogleMapsApiKey: async (key: string) => {
    await AsyncStorage.setItem(STORAGE_KEYS.googleMapsApiKey, key);
  }
};

export const sync = {
  isConnected: false,

  init: async (serverUrl: string) => {
    const state = await NetInfo.fetch();
    sync.isConnected = state.isConnected ?? false;

    NetInfo.addEventListener((state: NetInfoState) => {
      const wasConnected = sync.isConnected;
      sync.isConnected = state.isConnected ?? false;
      if (!wasConnected && sync.isConnected) {
        sync.syncNow(serverUrl);
      }
    });
  },

  syncNow: async (serverUrl: string): Promise<{ success: boolean; error?: string }> => {
    console.log('🔵 syncNow called with serverUrl:', serverUrl);

    if (!sync.isConnected) {
      console.log('🔴 No internet connection');
      return { success: false, error: 'No internet connection' };
    }

    try {
      console.log('🟡 Checking server availability...');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      let pingResponse;
      try {
        pingResponse = await fetch(`${serverUrl}/tasks`, {
          method: 'GET',
          signal: controller.signal
        });
        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        console.log('🔴 Server not reachable (timeout)');
        return { success: false, error: 'Server is not reachable' };
      }

      if (!pingResponse.ok) {
        console.log('🔴 Server not reachable');
        return { success: false, error: 'Server is not reachable' };
      }

      console.log('🟢 Server is reachable');

      const tasks = await storage.getTasks();
      const pendingTasks = tasks.filter(t => t.syncStatus === 'pending');
      console.log(`🟡 Found ${pendingTasks.length} pending tasks`);

      if (pendingTasks.length === 0) {
        console.log('🟢 No pending tasks to sync');
        return { success: true };
      }

      for (const task of pendingTasks) {
        try {
          console.log(`🔄 Syncing task: "${task.title}" (${task.id})`);

          const allTasks = await fetch(`${serverUrl}/tasks`).then(r => r.json());
          for (const t of allTasks) {
            if (t.title === task.title) {
              await fetch(`${serverUrl}/tasks/${t.id}`, { method: 'DELETE' });
              console.log(`🗑️ Deleted duplicate: "${t.title}" (${t.id})`);
            }
          }

          const { id, syncStatus, ...taskWithoutSyncStatus } = task;
          const response = await fetch(`${serverUrl}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskWithoutSyncStatus)
          });

          if (response.ok) {
            console.log(`✅ Task "${task.title}" synced successfully`);
          } else {
            console.log(`❌ Failed to sync task "${task.title}": ${response.status}`);
          }
        } catch (err) {
          console.error(`❌ Error syncing task "${task.title}":`, err);
        }
      }
      const updatedTasks = tasks.map(t =>
        t.syncStatus === 'pending' ? { ...t, syncStatus: 'synced' as const } : t
      );

      await storage.saveTasks(updatedTasks);

      const history = await storage.getHistory();
      const syncHistoryItem: HistoryItem = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2, 8),
        taskId: 'all',
        action: 'synced',
        description: `Synced ${pendingTasks.length} tasks with server`,
        timestamp: new Date().toISOString()
      };
      await storage.saveHistory([syncHistoryItem, ...history]);

      console.log(`🎉 Sync completed: ${pendingTasks.length} tasks synced`);
      return { success: true };

    } catch (error) {
      console.error('🔴 Sync error:', error);
      return { success: false, error: 'Server is not reachable' };
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
          seconds: Math.max(triggerSeconds, 30),
          type: SchedulableTriggerInputTypes.TIME_INTERVAL
        }
      });

      return notificationId;

    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }
};