import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../../components/Button';
import { authService } from '../../services/authService';

export const ProfileScreen = ({ navigation }: any) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name || 'Loading...'}</Text>
        <Text style={styles.email}>{user?.email || ''}</Text>
        {user?.isAdmin && <Text style={styles.adminBadge}>Admin</Text>}
      </View>

      <View style={styles.actions}>
        {user?.isAdmin && (
          <View style={{ marginBottom: 20 }}>
            <Button title="Admin Dashboard" type="primary" onPress={() => navigation.navigate('AdminDashboard')} />
          </View>
        )}
        <Button title="My Bookings" type="secondary" onPress={() => navigation.navigate('MyBookings')} />
        <Button title="My Part Requests" type="secondary" onPress={() => navigation.navigate('MyPartRequests')} />
        
        <View style={{ marginTop: 40 }}>
          <Button title="Logout" type="outline" onPress={handleLogout} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0056b3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  adminBadge: {
    marginTop: 8,
    backgroundColor: '#ffc107',
    color: '#000',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: 'bold',
    fontSize: 12,
  },
  actions: {
    padding: 24,
  }
});
