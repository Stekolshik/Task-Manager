import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { STATUS_COLORS, CANDIDATE_CODE } from '../utils/constants';
import { Task } from '../types';

export default function MapScreen({ navigation }: any) {
  const { tasks } = useApp();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const tasksWithLocation = tasks.filter(task => task.location.latitude && task.location.longitude);

  const initialRegion = {
    latitude: 55.751244,
    longitude: 37.618423,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const getMarkerColor = (status: Task['status']) => {
    const colors = STATUS_COLORS[status];
    return colors.text;
  };

  const handleMarkerPress = (task: Task) => {
    setSelectedTask(task);
  };

  const handleCalloutPress = (task: Task) => {
    navigation.navigate('Tasks', {
      screen: 'TaskDetail',
      params: { taskId: task.id }
    });
  };

  const handleOpenTask = (taskId: string) => {
    navigation.navigate('Tasks', {
      screen: 'TaskDetail',
      params: { taskId: taskId }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Map ({tasksWithLocation.length} tasks)
        </Text>
      </View>

      {tasksWithLocation.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="map-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No tasks with location</Text>
          <Text style={styles.emptySubtext}>
            Add coordinates to your tasks to see them here
          </Text>
        </View>
      ) : (
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation
          showsMyLocationButton
        >
          {tasksWithLocation.map((task) => (
            <Marker
              key={task.id}
              coordinate={{
                latitude: task.location.latitude!,
                longitude: task.location.longitude!,
              }}
              pinColor={getMarkerColor(task.status)}
              onPress={() => handleMarkerPress(task)}
            >
              <Callout
                onPress={() => handleCalloutPress(task)}
                style={styles.callout}
              >
                <View style={styles.calloutContent}>
                  <Text style={styles.calloutTitle} numberOfLines={1}>
                    {task.title}
                  </Text>
                  <Text style={styles.calloutStatus}>
                    {task.status}
                  </Text>
                  <Text style={styles.calloutAddress} numberOfLines={1}>
                    {task.location.address}
                  </Text>
                  <Text style={styles.calloutHint}>
                    Tap to open
                  </Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      )}

      {selectedTask && (
        <View style={styles.selectedContainer}>
          <Text style={styles.selectedTitle}>{selectedTask.title}</Text>
          <Text style={styles.selectedStatus}>{selectedTask.status}</Text>
          <TouchableOpacity
            style={styles.selectedButton}
            onPress={() => handleOpenTask(selectedTask.id)}
          >
            <Text style={styles.selectedButtonText}>Open Task</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>{CANDIDATE_CODE}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  map: {
    flex: 1,
  },
  callout: {
    width: 200,
    padding: 8,
  },
  calloutContent: {
    alignItems: 'center',
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  calloutStatus: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  calloutAddress: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  calloutHint: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  selectedContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  selectedStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  selectedButton: {
    marginTop: 10,
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingVertical: 4,
    backgroundColor: 'transparent',
  },
  footerText: {
    fontSize: 10,
    color: '#999',
  },
});