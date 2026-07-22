import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Task, Attachment } from '../types';
import { STATUSES, STATUS_LABELS, STATUS_COLORS, generateId } from '../utils/constants';

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
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirm = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const formatted = `${year}-${month}-${day} ${hours}:${minutes}`;
    
    setTask({ ...task, dueDate: formatted });
    if (errors.dueDate) setErrors({ ...errors, dueDate: '' });
    hideDatePicker();
  };

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

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Please allow access to your photo library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      const newAttachment: Attachment = {
        id: generateId(),
        uri: asset.uri,
        fileName: asset.fileName || 'image.jpg',
        fileSize: asset.fileSize,
        mimeType: asset.mimeType || 'image/jpeg',
        createdAt: new Date().toISOString()
      };

      const currentAttachments = task.attachments || [];
      setTask({
        ...task,
        attachments: [...currentAttachments, newAttachment]
      });
    }
  };

  const removeAttachment = (id: string) => {
    const currentAttachments = task.attachments || [];
    setTask({
      ...task,
      attachments: currentAttachments.filter(att => att.id !== id)
    });
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
        <TouchableOpacity 
          style={styles.dateContainer} 
          onPress={showDatePicker} 
          activeOpacity={0.7}
        >
          <TextInput
            style={[styles.input, styles.dateInput, errors.dueDate && styles.errorInput]}
            value={task.dueDate}
            placeholder="Select due date & time"
            placeholderTextColor="#999"
            editable={false}
            pointerEvents="none"
          />
          <Ionicons name="calendar-outline" size={24} color="#007AFF" style={styles.calendarIcon} />
        </TouchableOpacity>
        {errors.dueDate && <Text style={styles.errorText}>{errors.dueDate}</Text>}
        
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="datetime"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
          date={task.dueDate ? new Date(task.dueDate) : new Date()}
          minimumDate={new Date()}
        />
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
        <Text style={styles.label}>Attachments</Text>
        <TouchableOpacity style={styles.addButton} onPress={pickImage}>
          <Ionicons name="image-outline" size={24} color="#007AFF" />
          <Text style={styles.addButtonText}>Add Image</Text>
        </TouchableOpacity>

        {(task.attachments && task.attachments.length > 0) && (
          <View style={styles.attachmentsPreview}>
            {task.attachments.map((att) => (
              <View key={att.id} style={styles.attachmentItem}>
                <Image source={{ uri: att.uri }} style={styles.attachmentImage} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeAttachment(att.id)}
                >
                  <Ionicons name="close-circle" size={20} color="#dc3545" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        <Text style={styles.hint}>Tap to add image from gallery</Text>
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
  dateInput: {
    paddingRight: 48,
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
  dateContainer: {
    position: 'relative',
  },
  calendarIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    borderStyle: 'dashed',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  attachmentsPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  attachmentItem: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  attachmentImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#fff',
    borderRadius: 10,
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