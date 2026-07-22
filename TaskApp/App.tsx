import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AppProvider, useApp } from './context/AppContext';
import { BottomTabBar } from './components/BottomTabBar';

import TaskListScreen from './screens/TaskListScreen';
import TaskDetailScreen from './screens/TaskDetailScreen';
import TaskFormScreen from './screens/TaskFormScreen';
import HistoryScreen from './screens/HistoryScreen';
import MapScreen from './screens/MapScreen';
import NetworkScreen from './screens/NetworkScreen';
import SettingsScreen from './screens/SettingsScreen';

import { CANDIDATE_CODE } from './utils/constants';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TaskStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTintColor: '#1a1a1a',
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="TaskList" 
        component={TaskListScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="TaskDetail" 
        component={TaskDetailScreen} 
        options={{ title: 'Task Details' }}
      />
      <Stack.Screen 
        name="TaskForm" 
        component={TaskFormScreen} 
        options={{ title: 'Create Task' }}
      />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  return (
    <Tab.Navigator
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? '#1a1a1a' : '#fff',
        },
        headerTintColor: isDark ? '#fff' : '#1a1a1a',
        headerShadowVisible: false,
      }}
    >
      <Tab.Screen 
        name="Tasks" 
        component={TaskStack} 
        options={{ 
          title: 'Tasks',
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen} 
        options={{ 
          title: 'History',
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Map" 
        component={MapScreen} 
        options={{ 
          title: 'Map',
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Network" 
        component={NetworkScreen} 
        options={{ 
          title: 'Network',
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ 
          title: 'Settings',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="auto" />
        <NavigationContainer>
          <MainTabs />
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}