import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, Switch, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { CANDIDATE_CODE, DEFAULT_SERVER_URL } from '../utils/constants';

export default function SettingsScreen() {
  const { 
    theme, 
    toggleTheme, 
    serverUrl, 
    setServerUrl, 
    tasks, 
    clearAllTasks,
    googleMapsApiKey,
    setGoogleMapsApiKey
  } = useApp();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [newServerUrl, setNewServerUrl] = useState(serverUrl);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [keyModalVisible, setKeyModalVisible] = useState(false);
  const [newApiKey, setNewApiKey] = useState(googleMapsApiKey);

  const handleSaveServer = async () => {
    await setServerUrl(newServerUrl);
    setModalVisible(false);
  };

  const handleSaveApiKey = async () => {
    await setGoogleMapsApiKey(newApiKey);
    setKeyModalVisible(false);
    Alert.alert('Success', 'Google Maps API Key saved');
  };

  const handleClearAllTasks = () => {
    if (tasks.length === 0) {
      Alert.alert('No Tasks', 'There are no tasks to clear');
      return;
    }

    Alert.alert(
      'Clear All Tasks',
      `Are you sure you want to delete all ${tasks.length} tasks? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            await clearAllTasks();
            Alert.alert('Success', 'All tasks have been deleted');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="moon-outline" size={22} color="#666" />
              <Text style={styles.settingLabel}>Dark Theme</Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: '#ddd', true: '#007AFF' }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Server</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="server-outline" size={22} color="#666" />
              <View>
                <Text style={styles.settingLabel}>Server URL</Text>
                <Text style={styles.settingValue}>{serverUrl}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Maps</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="map-outline" size={22} color="#666" />
              <View>
                <Text style={styles.settingLabel}>Google Maps API Key</Text>
                <Text style={styles.settingValue}>
                  {googleMapsApiKey ? '✅ Configured' : '❌ Not set'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setKeyModalVisible(true)}
            >
              <Text style={styles.editButtonText}>
                {googleMapsApiKey ? 'Change' : 'Set'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={22} color="#666" />
              <Text style={styles.settingLabel}>Enable Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#ddd', true: '#007AFF' }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="trash-outline" size={22} color="#dc3545" />
              <View>
                <Text style={[styles.settingLabel, { color: '#dc3545' }]}>Clear All Tasks</Text>
                <Text style={styles.settingValue}>{tasks.length} tasks total</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleClearAllTasks}
            >
              <Text style={styles.dangerButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="information-circle-outline" size={22} color="#666" />
              <Text style={styles.settingLabel}>Version</Text>
            </View>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="code-outline" size={22} color="#666" />
              <Text style={styles.settingLabel}>Candidate Code</Text>
            </View>
            <Text style={[styles.settingValue, styles.codeValue]}>{CANDIDATE_CODE}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{CANDIDATE_CODE}</Text>
        </View>

        <Modal
          animationType="slide"
          transparent
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Server Settings</Text>
              <Text style={styles.modalSubtitle}>Enter server URL</Text>
              <TextInput
                style={styles.modalInput}
                value={newServerUrl}
                onChangeText={setNewServerUrl}
                placeholder={DEFAULT_SERVER_URL}
                placeholderTextColor="#999"
                autoCapitalize="none"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancel]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalSave]}
                  onPress={handleSaveServer}
                >
                  <Text style={styles.modalSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          animationType="slide"
          transparent
          visible={keyModalVisible}
          onRequestClose={() => setKeyModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Google Maps API Key</Text>
              <Text style={styles.modalSubtitle}>Enter your Google Maps API Key</Text>
              <TextInput
                style={styles.modalInput}
                value={newApiKey}
                onChangeText={setNewApiKey}
                placeholder="AIzaSy..."
                placeholderTextColor="#999"
                autoCapitalize="none"
                secureTextEntry
              />
              <Text style={styles.modalHint}>
                Get your key from Google Cloud Console
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancel]}
                  onPress={() => setKeyModalVisible(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalSave]}
                  onPress={handleSaveApiKey}
                >
                  <Text style={styles.modalSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 15,
    color: '#1a1a1a',
  },
  settingValue: {
    fontSize: 14,
    color: '#999',
  },
  codeValue: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  dangerButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#dc3545',
    borderRadius: 6,
  },
  dangerButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 16,
  },
  footerText: {
    fontSize: 10,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    marginBottom: 16,
  },
  modalHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f5f5f5',
    color: '#1a1a1a',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancel: {
    backgroundColor: '#f0f0f0',
  },
  modalCancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  modalSave: {
    backgroundColor: '#007AFF',
  },
  modalSaveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});