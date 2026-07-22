import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { STATUSES, STATUS_LABELS, STATUS_COLORS, formatDate } from '../utils/constants';
import { TaskStatus } from '../types';

export default function TaskDetailScreen({ route, navigation }: any) {
  const { taskId } = route.params;
  const { tasks, deleteTask, updateTaskStatus } = useApp();
  const [updating, setUpdating] = useState(false);

  const task = tasks.find(t => t.id === taskId);

  if (!task) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Task not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            await deleteTask(task.id);
            navigation.goBack();
          }
        }
      ]
    );
  };

  const handleStatusChange = async (status: TaskStatus) => {
    if (status === task.status) return;
    setUpdating(true);
    await updateTaskStatus(task.id, status);
    setUpdating(false);
  };

  const statusColors = STATUS_COLORS[task.status];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={24} color="#dc3545" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{task.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
              <Text style={[styles.statusText, { color: statusColors.text }]}>
                {STATUS_LABELS[task.status]}
              </Text>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Description</Text>
            <Text style={styles.fieldValue}>{task.description}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Due Date</Text>
            <Text style={styles.fieldValue}>{formatDate(task.dueDate)}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Location</Text>
            <Text style={styles.fieldValue}>📍 {task.location.address}</Text>
          </View>

          {task.attachments && task.attachments.length > 0 && (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Attachments</Text>
              <View style={styles.attachmentsContainer}>
                {task.attachments.map((attachment) => (
                  <View key={attachment.id} style={styles.attachmentItem}>
                    <Image 
                      source={{ uri: attachment.uri }} 
                      style={styles.attachmentImage}
                      onError={() => console.log('Failed to load image')}
                    />
                    <Text style={styles.attachmentName} numberOfLines={1}>
                      {attachment.fileName}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Change Status</Text>
            <View style={styles.statusContainer}>
              {STATUSES.map((status) => {
                const colors = STATUS_COLORS[status];
                const isActive = task.status === status;
                return (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusButton,
                      isActive && { backgroundColor: colors.bg, borderColor: colors.text }
                    ]}
                    onPress={() => handleStatusChange(status)}
                    disabled={updating || isActive}
                  >
                    <Text
                      style={[
                        styles.statusButtonText,
                        isActive && { color: colors.text, fontWeight: '600' }
                      ]}
                    >
                      {STATUS_LABELS[status]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.meta}>
            <Text style={styles.metaText}>Created: {formatDate(task.createdAt)}</Text>
            <Text style={styles.metaText}>Updated: {formatDate(task.updatedAt)}</Text>
            <Text style={styles.metaText}>
              Sync: {task.syncStatus === 'synced' ? '✅ Synced' : 
                     task.syncStatus === 'pending' ? '⏳ Pending' : 
                     '❌ Failed'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 18,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  field: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  fieldValue: {
    fontSize: 16,
    color: '#1a1a1a',
    lineHeight: 22,
  },
  attachmentsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  attachmentItem: {
    alignItems: 'center',
    width: 80,
  },
  attachmentImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  attachmentName: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  statusButtonText: {
    fontSize: 13,
    color: '#666',
  },
  meta: {
    marginTop: 8,
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#999',
  },
});