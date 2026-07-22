import React, { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { TaskForm } from '../components/TaskForm';
import { Task } from '../types';

export default function TaskFormScreen({ route, navigation }: any) {
  const { addTask, updateTask } = useApp();
  const [loading, setLoading] = useState(false);

  const existingTask = route.params?.task as Task | undefined;

  const handleSubmit = async (taskData: Partial<Task>) => {
    setLoading(true);
    try {
      if (existingTask) {
        await updateTask(existingTask.id, taskData);
        Alert.alert('Success', 'Task updated');
      } else {
        await addTask(taskData as Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>);
        Alert.alert('Success', 'Task created');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TaskForm
        initialTask={existingTask}
        onSubmit={handleSubmit}
        onCancel={() => navigation.goBack()}
        loading={loading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});