import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Task } from '../types';
import { formatDate, STATUS_LABELS, STATUS_COLORS, getTimeUntil } from '../utils/constants';

type TaskCardProps = {
  task: Task;
  onPress: () => void;
};

const StatusBadge = ({ status }: { status: Task['status'] }) => {
  const colors = STATUS_COLORS[status];
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.badgeText, { color: colors.text }]}>
        {STATUS_LABELS[status]}
      </Text>
    </View>
  );
};

export const TaskCard = ({ task, onPress }: TaskCardProps) => {
  const timeUntil = getTimeUntil(task.dueDate);
  const isOverdue = timeUntil === 'Overdue';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {task.title}
        </Text>
        <StatusBadge status={task.status} />
      </View>

      <Text style={styles.location} numberOfLines={1}>
        📍 {task.location.address}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.date}>🕐 {formatDate(task.dueDate)}</Text>
        {task.attachments.length > 0 && (
          <Text style={styles.attachment}>📎 {task.attachments.length}</Text>
        )}
        <Text style={[
          styles.timeUntil,
          isOverdue && styles.timeUntilOverdue
        ]}>
          {timeUntil}
        </Text>
        {task.syncStatus === 'pending' && (
          <Text style={styles.syncPending}>⏳</Text>
        )}
        {task.syncStatus === 'failed' && (
          <Text style={styles.syncFailed}>❌</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  date: {
    fontSize: 13,
    color: '#666',
  },
  attachment: {
    fontSize: 13,
    color: '#007AFF',
  },
  timeUntil: {
    fontSize: 13,
    color: '#388E3C',
    fontWeight: '500',
  },
  timeUntilOverdue: {
    color: '#dc3545',
    fontWeight: '600',
  },
  syncPending: {
    fontSize: 14,
    marginLeft: 'auto',
  },
  syncFailed: {
    fontSize: 14,
    marginLeft: 'auto',
  },
});