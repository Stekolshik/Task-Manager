import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { formatDate, CANDIDATE_CODE } from '../utils/constants';

type FilterType = 'all' | 'created' | 'updated' | 'status_changed' | 'attachment_added' | 'attachment_removed' | 'deleted' | 'synced';

const ACTION_LABELS: Record<string, string> = {
  'created': 'Created',
  'updated': 'Updated',
  'status_changed': 'Status Changed',
  'attachment_added': 'Attachment Added',
  'attachment_removed': 'Attachment Removed',
  'deleted': 'Deleted',
  'synced': 'Synced'
};

const ACTION_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'created': 'add-circle-outline',
  'updated': 'create-outline',
  'status_changed': 'swap-horizontal-outline',
  'attachment_added': 'attach-outline',
  'attachment_removed': 'trash-outline',
  'deleted': 'close-circle-outline',
  'synced': 'cloud-done-outline'
};

const ACTION_COLORS: Record<string, string> = {
  'created': '#4CAF50',
  'updated': '#FF9800',
  'status_changed': '#2196F3',
  'attachment_added': '#9C27B0',
  'attachment_removed': '#F44336',
  'deleted': '#F44336',
  'synced': '#4CAF50'
};

export default function HistoryScreen() {
  const { history } = useApp();
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredHistory = filter === 'all' 
    ? history 
    : history.filter(item => item.action === filter);

  const renderItem = ({ item }: { item: any }) => {
    const icon = ACTION_ICONS[item.action] || 'document-text-outline';
    const color = ACTION_COLORS[item.action] || '#666';
    const label = ACTION_LABELS[item.action] || item.action;

    return (
      <View style={styles.historyItem}>
        <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon} size={22} color={color} />
        </View>
        <View style={styles.content}>
          <Text style={styles.action}>{label}</Text>
          <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
          <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
        </View>
      </View>
    );
  };

  const renderFilterButton = (type: FilterType, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === type && styles.filterButtonActive
      ]}
      onPress={() => setFilter(type)}
    >
      <Text style={[
        styles.filterButtonText,
        filter === type && styles.filterButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
        <Text style={styles.headerCount}>{history.length} events</Text>
      </View>

      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { key: 'all', label: 'All' },
            { key: 'created', label: 'Created' },
            { key: 'updated', label: 'Updated' },
            { key: 'status_changed', label: 'Status' },
            { key: 'deleted', label: 'Deleted' },
            { key: 'synced', label: 'Synced' }
          ]}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => renderFilterButton(item.key as FilterType, item.label)}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      {filteredHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No history</Text>
          <Text style={styles.emptySubtext}>
            {history.length === 0 
              ? 'Actions will appear here' 
              : 'No events match this filter'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredHistory}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerCount: {
    fontSize: 14,
    color: '#999',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filtersList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 13,
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  list: {
    padding: 16,
    paddingBottom: 80,
  },
  historyItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  action: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
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