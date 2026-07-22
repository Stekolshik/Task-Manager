import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

type TabBarProps = {
  state: any;
  descriptors: any;
  navigation: any;
};

export const BottomTabBar = ({ state, descriptors, navigation }: TabBarProps) => {
  const insets = useSafeAreaInsets();
  const { syncStatus } = useApp();

  const getIconName = (routeName: string, isFocused: boolean) => {
    const icons: Record<string, { focused: string; unfocused: string }> = {
      Tasks: { focused: 'list', unfocused: 'list-outline' },
      History: { focused: 'time', unfocused: 'time-outline' },
      Map: { focused: 'map', unfocused: 'map-outline' },
      Network: { focused: 'wifi', unfocused: 'wifi-outline' },
      Settings: { focused: 'settings', unfocused: 'settings-outline' }
    };
    return isFocused ? icons[routeName]?.focused : icons[routeName]?.unfocused;
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

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'online': return 'checkmark-circle';
      case 'syncing': return 'sync-outline';
      case 'offline': return 'cloud-offline-outline';
      case 'error': return 'alert-circle-outline';
      default: return 'wifi-outline';
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (route.name === 'Network') {
          return (
            <TouchableOpacity
              key={index}
              onPress={onPress}
              style={styles.tabButton}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name={getStatusIcon() as any}
                  size={24}
                  color={isFocused ? '#007AFF' : '#999'}
                />
                <View style={[styles.badge, { backgroundColor: getStatusColor() }]} />
              </View>
              <Text style={[styles.label, isFocused && styles.labelFocused]}>
                {options.title || route.name}
              </Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={index}
            onPress={onPress}
            style={styles.tabButton}
          >
            <Ionicons
              name={getIconName(route.name, isFocused) as any}
              size={24}
              color={isFocused ? '#007AFF' : '#999'}
            />
            <Text style={[styles.label, isFocused && styles.labelFocused]}>
              {options.title || route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4
  },
  iconContainer: {
    position: 'relative',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#fff'
  },
  label: {
    fontSize: 11,
    color: '#999',
    marginTop: 2
  },
  labelFocused: {
    color: '#007AFF'
  }
});