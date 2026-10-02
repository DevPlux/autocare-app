import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import api from '../../services/api';
import { authService } from '../../services/authService';

import { RemoteImage } from '../../components/RemoteImage';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

export const SparePartsScreen = ({ navigation }: any) => {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [user, setUser] = useState<any>(null);

  const fetchParts = async (query = '') => {
    setLoading(true);
    try {
      const endpoint = query ? `/spare-parts?search=${encodeURIComponent(query)}` : '/spare-parts';
      const res = await api.get(endpoint);
      if (res.data?.success) {
        setParts(res.data.data);
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
    fetchParts();
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert('Delete Part', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/spare-parts/${id}`);
          fetchParts(search);
        } catch (err: any) {
          Alert.alert('Error', err.response?.data?.message || 'Delete failed');
        }
      }}
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Spare Parts Store</Text>
        {user?.isAdmin && (
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AdminPartForm')}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={{ paddingHorizontal: 16 }}>
        <Input 
          label=""
          placeholder="Search parts by name..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => fetchParts(search)}
          returnKeyType="search"
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0056b3" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={parts}
          numColumns={2}
          keyExtractor={(item: any) => item._id}
          contentContainerStyle={{ padding: 8 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <RemoteImage 
                url={item.imageUrl} 
                alt={item.partName + ' Image'} 
                style={styles.image} 
              />
              <View style={styles.cardContent}>
                <Text style={styles.title} numberOfLines={1}>{item.partName}</Text>
                <Text style={styles.stock}>{item.stockStatus}</Text>
                <Text style={styles.price}>Rs. {item.unitPrice || '0'}</Text>
                <TouchableOpacity 
                  style={styles.orderBtn}
                  onPress={() => navigation.navigate('RequestPart', { part: item })}
                >
                  <Text style={styles.orderBtnText}>Order</Text>
                </TouchableOpacity>
              </View>

              {user?.isAdmin && (
                <View style={styles.adminActions}>
                  <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('AdminPartForm', { part: item })}>
                    <Text style={styles.adminBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id)}>
                    <Text style={styles.adminBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No spare parts found.</Text>}
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
    flex: 1,
    margin: 8,
    borderRadius: 12,
    elevation: 2,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
  },
  cardContent: {
    padding: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  stock: {
    color: '#28a745',
    fontSize: 12,
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0056b3',
    marginTop: 8,
  },
  orderBtn: {
    marginTop: 12,
    backgroundColor: '#0056b3',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  orderBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 20 },
  addBtn: { backgroundColor: '#28a745', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: '#fff', fontWeight: 'bold' },
  adminActions: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#eee', backgroundColor: '#fafafa', width: '100%' },
  editBtn: { flex: 1, padding: 12, alignItems: 'center', borderRightWidth: 1, borderColor: '#eee' },
  deleteBtn: { flex: 1, padding: 12, alignItems: 'center' },
  adminBtnText: { color: '#333', fontWeight: 'bold' }
});
