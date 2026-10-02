import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import api from '../../services/api';
import { authService } from '../../services/authService';

import { RemoteImage } from '../../components/RemoteImage';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

export const ServicesScreen = ({ navigation }: any) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [user, setUser] = useState<any>(null);

  const fetchServices = async (query = '') => {
    setLoading(true);
    try {
      const endpoint = query ? `/services?search=${encodeURIComponent(query)}` : '/services';
      const res = await api.get(endpoint);
      if (res.data?.success) {
        setServices(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      const u = await authService.getCurrentUser();
      setUser(u);
    };
    loadUser();
    fetchServices();
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert('Delete Service', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/services/${id}`);
          fetchServices(search);
        } catch (err: any) {
          Alert.alert('Error', err.response?.data?.message || 'Delete failed');
        }
      }}
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Available Services</Text>
        {user?.isAdmin && (
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AdminServiceForm')}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={{ paddingHorizontal: 16 }}>
        <Input 
          label=""
          placeholder="Search services..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => fetchServices(search)}
          returnKeyType="search"
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0056b3" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item: any) => item._id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <RemoteImage 
                url={item.imageUrl} 
                alt={item.serviceName + ' Image'} 
                style={styles.image} 
              />
              <Text style={styles.title}>{item.serviceName}</Text>
              <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
              <View style={styles.footer}>
                <Text style={styles.price}>Rs. {item.price || '0'}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('BookService', { service: item })}>
                  <Text style={styles.bookBtn}>Book Now</Text>
                </TouchableOpacity>
              </View>

              {user?.isAdmin && (
                <View style={styles.adminActions}>
                  <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('AdminServiceForm', { service: item })}>
                    <Text style={styles.adminBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id)}>
                    <Text style={styles.adminBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No services available.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    backgroundColor: '#fff',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 150,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 12,
    paddingHorizontal: 16,
  },
  desc: {
    color: '#666',
    marginTop: 6,
    fontSize: 14,
    paddingHorizontal: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    padding: 16,
    paddingTop: 0,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0056b3',
  },
  bookBtn: {
    color: '#fff',
    backgroundColor: '#0056b3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    fontWeight: '600',
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 20 },
  addBtn: { backgroundColor: '#28a745', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: '#fff', fontWeight: 'bold' },
  adminActions: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#eee', backgroundColor: '#fafafa' },
  editBtn: { flex: 1, padding: 12, alignItems: 'center', borderRightWidth: 1, borderColor: '#eee' },
  deleteBtn: { flex: 1, padding: 12, alignItems: 'center' },
  adminBtnText: { color: '#333', fontWeight: 'bold' }
});
