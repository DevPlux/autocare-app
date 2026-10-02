import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

// Import Screens
import { SplashScreen } from './src/screens/auth/SplashScreen';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { RegisterScreen } from './src/screens/auth/RegisterScreen';
import { MainTabNavigator } from './src/navigation/MainTabNavigator';
import { BookServiceScreen } from './src/screens/services/BookServiceScreen';
import { MyBookingsScreen } from './src/screens/serviceBookings/MyBookingsScreen';
import { RequestPartScreen } from './src/screens/spareParts/RequestPartScreen';
import { MyPartRequestsScreen } from './src/screens/spareParts/MyPartRequestsScreen';
import { AdminDashboardScreen } from './src/screens/admin/AdminDashboardScreen';
import { AdminServiceFormScreen } from './src/screens/admin/AdminServiceFormScreen';
import { AdminPartFormScreen } from './src/screens/admin/AdminPartFormScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator 
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="MainApp" component={MainTabNavigator} />
        
        {/* Modals / Overlays */}
        <Stack.Screen 
          name="BookService" 
          component={BookServiceScreen} 
          options={{ headerShown: true, title: 'Back', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen 
          name="MyBookings" 
          component={MyBookingsScreen} 
          options={{ headerShown: true, title: 'My Bookings', animation: 'slide_from_right' }}
        />
        <Stack.Screen 
          name="RequestPart" 
          component={RequestPartScreen} 
          options={{ headerShown: true, title: 'Back', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen 
          name="MyPartRequests" 
          component={MyPartRequestsScreen} 
          options={{ headerShown: true, title: 'My Part Requests', animation: 'slide_from_right' }}
        />
        <Stack.Screen 
          name="AdminDashboard" 
          component={AdminDashboardScreen} 
          options={{ headerShown: true, title: 'Admin Dashboard', animation: 'slide_from_right' }}
        />
        <Stack.Screen 
          name="AdminServiceForm" 
          component={AdminServiceFormScreen} 
          options={{ headerShown: true, title: 'Manage Service', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen 
          name="AdminPartForm" 
          component={AdminPartFormScreen} 
          options={{ headerShown: true, title: 'Manage Spare Part', animation: 'slide_from_bottom' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

