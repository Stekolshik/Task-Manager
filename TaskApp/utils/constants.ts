import { TaskStatus } from '../types';

export const CANDIDATE_CODE = 'SA-RN-2026';

export const DEFAULT_GOOGLE_MAPS_API_KEY = '';

export const DEFAULT_SERVER_URL = 'http://localhost:3000';

export const STATUSES: TaskStatus[] = ['New', 'In Progress', 'Completed', 'Cancelled'];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  'New': 'New',
  'In Progress': 'In Progress',
  'Completed': 'Completed',
  'Cancelled': 'Cancelled'
};

export const STATUS_COLORS: Record<TaskStatus, { bg: string; text: string }> = {
  'New': { bg: '#E3F2FD', text: '#1976D2' },
  'In Progress': { bg: '#FFF3E0', text: '#F57C00' },
  'Completed': { bg: '#E8F5E9', text: '#388E3C' },
  'Cancelled': { bg: '#FCE4EC', text: '#C62828' }
};

export const formatDate = (date: string) => {
  return new Date(date).toLocaleString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDateShort = (date: string) => {
  return new Date(date).toLocaleString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatTime = (date: string) => {
  return new Date(date).toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const isOverdue = (dueDate: string) => {
  return new Date(dueDate) < new Date();
};

export const getTimeUntil = (dueDate: string) => {
  const diff = new Date(dueDate).getTime() - new Date().getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 0) return 'Overdue';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
};

export const NOTIFICATION_DEMO_SECONDS = 30;
export const NOTIFICATION_REMINDER_MINUTES = 30;