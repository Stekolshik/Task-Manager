import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Task } from '../types';
import { STATUSES, STATUS_LABELS, STATUS_COLORS } from '../utils/constants';

type TaskFormProps = {
  initialTask?: Partial<Task>;
  onSubmit: (task: Partial<Task>) => void;
  onCancel: () => void;
  loading?: boolean;
};

const validateTask = (task: Partial<Task>) => {
  const errors: Record<string, string> = {};
  if (!task.title?.trim()) errors.title = 'Title is required';
  if (!task.description?.trim()) errors.description = 'Description is required';
  if (!task.dueDate) errors.dueDate = 'Due date is required';
  if (!task.location?.address?.trim()) errors.location = 'Location is required';
  return errors;
};

export const TaskForm = ({ initialTask, onSubmit, onCancel, loading = false }: TaskFormProps) => {
  const [task, setTask] = useState<Partial<Task>>(
    initialTask || {
      title: '',
      description: '',
      dueDate: '',
      location: { address: '' },
      status: 'New',
      attachments: []
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [gettingLocation, setGettingLocation] = useState(false);

  const getCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Please enable location in settings');
        setGettingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        const formattedAddress = [
          addr.name,
          addr.street,
          addr.city,
          addr.region,
          addr.country,
        ].filter(Boolean).join(', ');

        setTask({
          ...task,
          location: {
            address: formattedAddress || `${latitude}, ${longitude}`,
            latitude,
            longitude,
          }
        });
      } else {
        setTask({
          ...task,
          location: {
            address: `${latitude}, ${longitude}`,
            latitude,
            longitude,
          }
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get location');
    } finally {
      setGettingLocation(false);
    }
  };

  const handleSubmit = () => {
    const validationErrors = validateTask(task);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit(task);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.field}>
        <Text style={styles.label}>
          Title <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.title && styles.errorInput]}
          value={task.title}
          onChangeText={(text) => {
            setTask({ ...task, title: text });
            if (errors.title) setErrors({ ...errors, title: '' });
          }}
          placeholder="Enter task title"
          placeholderTextColor="#999"
        />
        {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>
          Description <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, styles.textArea, errors.description && styles.errorInput]}
          value={task.description}
          onChangeText={(text) => {
            setTask({ ...task, description: text });
            if (errors.description) setErrors({ ...errors, description: '' });
          }}
          placeholder="Enter task description"
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>
          Due Date <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.dueDate && styles.errorInput]}
          value={task.dueDate}
          onChangeText={(text) => {
            setTask({ ...task, dueDate: text });
            if (errors.dueDate) setErrors({ ...errors, dueDate: '' });
          }}
          placeholder="2026-07-25 14:30"
          placeholderTextColor="#999"
        />
        {errors.dueDate && <Text style={styles.errorText}>{errors.dueDate}</Text>}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>
          Location <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.locationContainer}>
          <TextInput
            style={[styles.input, styles.locationInput, errors.location && styles.errorInput]}
            value={task.location?.address}
            onChangeText={(text) => {
              setTask({ ...task, location: { address: text } });
              if (errors.location) setErrors({ ...errors, location: '' });
            }}
            placeholder="Enter address"
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            style={styles.locationButton}
            onPress={getCurrentLocation}
            disabled={gettingLocation}
          >
            <Ionicons
              name={gettingLocation ? 'sync-outline' : 'locate-outline'}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
        {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
        <Text style={styles.hint}>Tap to use current location</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Status</Text>
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
                onPress={() => setTask({ ...task, status })}
              >
                <Text
                  style={[
                    styles.statusText,
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

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
          disabled={loading}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitText}>{loading ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  required: {
    color: '#dc3545',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#1a1a1a',
  },
  textArea: {
    minHeight: 100,
  },
  errorInput: {
    borderColor: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  locationInput: {
    flex: 1,
  },
  locationButton: {
    backgroundColor: '#007AFF',
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    fontSize: 12,
    color: '#999',
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
  statusText: {
    fontSize: 13,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 40,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    flex: 2,
  },
  submitText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});