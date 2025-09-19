import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props: any) {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/auth/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    { label: 'Following / Followers', route: '/(drawer)/following-followers', icon: '👥' },
    { label: 'Add Account', route: '/(drawer)/add-account', icon: '➕' },
    { label: 'Profile', route: '/(tabs)/profile', icon: '👤' },
    { label: 'Handicapper Profile', route: '/(drawer)/handicapper-profile', icon: '📊' },
    { label: 'Upgrade to Pro', route: '/(drawer)/upgrade-pro', icon: '⭐' },
    { label: 'Settings & Privacy', route: '/(drawer)/settings', icon: '⚙️' },
    { label: 'Help', route: '/(drawer)/help', icon: '❓' },
    { label: 'Purchases', route: '/(drawer)/purchases', icon: '💳' },
    { label: 'Test Notifications', route: '/(drawer)/test-notifications', icon: '🔔' },
  ];

  return (
    <DrawerContentScrollView {...props} className="bg-white dark:bg-gray-900">
      <View className="px-4 py-6">
        {/* User Info Header */}
        <View className="mb-6">
          <View className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 items-center justify-center mb-3">
            <Text className="text-gray-500 dark:text-gray-400 text-2xl">👤</Text>
          </View>
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            {user?.displayName || user?.email?.split('@')[0] || 'User'}
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 text-sm">
            {user?.email}
          </Text>
        </View>

        {/* Menu Items */}
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            className="flex-row items-center py-3 px-2 rounded-lg mb-1"
            onPress={() => {
              props.navigation.closeDrawer();
              router.push(item.route as any);
            }}
          >
            <Text className="text-xl mr-4">{item.icon}</Text>
            <Text className="text-gray-900 dark:text-white font-medium flex-1">
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Logout Button */}
        <TouchableOpacity
          className="flex-row items-center py-3 px-2 rounded-lg mt-6 bg-red-50 dark:bg-red-900/20"
          onPress={handleLogout}
        >
          <Text className="text-xl mr-4">🚪</Text>
          <Text className="text-red-600 dark:text-red-400 font-medium">
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

export default function DrawerLayout() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTintColor: '#000000',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        drawerStyle: {
          backgroundColor: '#ffffff',
          width: 280,
        },
        drawerActiveTintColor: '#3B82F6',
        drawerInactiveTintColor: '#6B7280',
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        component={require('../tabs/_layout').default}
        options={{
          title: 'Handicapper',
          drawerLabel: 'Home',
          drawerIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>🏠</Text>
          ),
        }}
      />
    </Drawer.Navigator>
  );
}
