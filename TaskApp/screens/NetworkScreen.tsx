import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { CANDIDATE_CODE, DEFAULT_SERVER_URL } from '../utils/constants';

export default function NetworkScreen() {
  const { syncStatus, serverUrl, syncNow, tasks, setServerUrl } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);

  const pendingTasks = tasks.filter(t => t.syncStatus === 'pending').length;
  const failedTasks = tasks.filter(t => t.syncStatus === 'failed').length;

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'online': return 'checkmark-circle';
      case 'syncing': return 'sync-outline';
      case 'offline': return 'cloud-offline-outline';
      case 'error': return 'alert-circle-outline';
      default: return 'wifi-outline';
    }
  };

  const getStatusColor = () => {
    switch (syncStatus) {
      case 'online': return '#4CAF50';
      case 'syncing': return '#FFC107';
      case 'offline': return '#F44336';
      case 'error': return '#2196F3';
      default: return '#999';
    }
  };

  const getStatusLabel = () => {
    switch (syncStatus) {
      case 'online': return 'Online';
      case 'syncing': return 'Syncing...';
      case 'offline': return 'Offline';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  const handlePing = async () => {
    setPingResult('Checking...');
    try {
      const response = await fetch(`${serverUrl}/tasks`);
      if (response.ok) {
        setPingResult('✅ Server is reachable');
      } else {
        setPingResult(`❌ Server error: ${response.status}`);
      }
    } catch (error) {
      setPingResult('❌ Server is not reachable');
    }
  };

  const handleSync = async () => {
    await syncNow();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await syncNow();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.statusCard}>
          <View style={styles.statusIconContainer}>
            <Ionicons
              name={getStatusIcon()}
              size={48}
              color={getStatusColor()}
            />
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          </View>
          <Text style={[styles.statusLabel, { color: getStatusColor() }]}>
            {getStatusLabel()}
          </Text>
          <Text style={styles.statusUrl}>{serverUrl}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{tasks.length}</Text>
            <Text style={styles.statLabel}>Total Tasks</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#FFC107' }]}>{pendingTasks}</Text>
            <Text style={styles.statLabel}>Pending Sync</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#F44336' }]}>{failedTasks}</Text>
            <Text style={styles.statLabel}>Failed</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.syncButton]}
            onPress={handleSync}
            disabled={syncStatus === 'syncing'}
          >
            <Ionicons
              name={syncStatus === 'syncing' ? 'sync-outline' : 'cloud-upload-outline'}
              size={20}
              color="#fff"
            />
            <Text style={styles.actionButtonText}>
              {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.pingButton]}
            onPress={handlePing}
          >
            <Ionicons name="pulse-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Ping Server</Text>
          </TouchableOpacity>
        </View>

        {pingResult && (
          <View style={styles.pingResult}>
            <Text style={styles.pingResultText}>{pingResult}</Text>
          </View>
        )}

        <View style={styles.logContainer}>
          <Text style={styles.logTitle}>📋 Connection Log</Text>
          <View style={styles.logItem}>
            <Text style={styles.logTime}>Now</Text>
            <Text style={styles.logStatus}>
              {syncStatus === 'online' ? '✅ Connected' :
               syncStatus === 'syncing' ? '🔄 Syncing...' :
               syncStatus === 'offline' ? '📴 Offline' :
               syncStatus === 'error' ? '⚠️ Error' : '⏳ Unknown'}
            </Text>
          </View>
          <View style={styles.logItem}>
            <Text style={styles.logTime}>Server</Text>
            <Text style={styles.logStatus}>{serverUrl}</Text>
          </View>
          <View style={styles.logItem}>
            <Text style={styles.logTime}>Tasks</Text>
            <Text style={styles.logStatus}>
              {tasks.length} total ({pendingTasks} pending, {failedTasks} failed)
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{CANDIDATE_CODE}</Text>
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
  statusCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statusIconContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  statusLabel: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusUrl: {
    fontSize: 14,
    color: '#999',
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  syncButton: {
    backgroundColor: '#007AFF',
  },
  pingButton: {
    backgroundColor: '#6c757d',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  pingResult: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pingResultText: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  logContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  logItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logTime: {
    fontSize: 13,
    color: '#999',
  },
  logStatus: {
    fontSize: 13,
    color: '#1a1a1a',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 10,
    color: '#999',
  },
});