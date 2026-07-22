import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, TextInput, SafeAreaView } from 'react-native';
import { Text } from 'react-native';  
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { TaskCard } from '../components/TaskCard';
import { STATUSES, STATUS_LABELS, CANDIDATE_CODE } from '../utils/constants';
import { TaskStatus } from '../types';

type SortOption = 'created' | 'dueDate' | 'status';

export default function TaskListScreen({ navigation }: any) {
  const { tasks } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('created');

  const filteredTasks = useMemo(() => {
    let result = tasks;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(t => 
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query)
      );
    }
    
    if (filterStatus !== 'all') {
      result = result.filter(t => t.status === filterStatus);
    }
    
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
    
    return result;
  }, [tasks, searchQuery, filterStatus, sortBy]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={['all', ...STATUSES]}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                filterStatus === item && styles.filterChipActive
              ]}
              onPress={() => setFilterStatus(item as TaskStatus | 'all')}
            >
              <Text style={[
                styles.filterChipText,
                filterStatus === item && styles.filterChipTextActive
              ]}>
                {item === 'all' ? 'All' : STATUS_LABELS[item as TaskStatus]}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        {(['created', 'dueDate', 'status'] as SortOption[]).map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.sortButton,
              sortBy === option && styles.sortButtonActive
            ]}
            onPress={() => setSortBy(option)}
          >
            <Text style={[
              styles.sortButtonText,
              sortBy === option && styles.sortButtonTextActive
            ]}>
              {option === 'created' ? 'Date added' :
               option === 'dueDate' ? 'Due date' :
               'Status'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredTasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="clipboard-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No tasks found</Text>
          <Text style={styles.emptySubtext}>
            {tasks.length === 0 ? 'Create your first task!' : 'Try adjusting your filters'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('TaskForm')}
      >
        <Ionicons name="add" size={32} color="#fff" />
        <Text style={styles.fabText}>New Task</Text>
      </TouchableOpacity>

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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#1a1a1a',
  },
  filtersContainer: {
    marginBottom: 8,
  },
  filtersList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 13,
    color: '#666',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  sortLabel: {
    fontSize: 13,
    color: '#666',
    marginRight: 4,
  },
  sortButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sortButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#666',
  },
  sortButtonTextActive: {
    color: '#fff',
  },
  list: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 80,
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
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  fabText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
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