import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import api from '../../services/api';

export const AdminDashboardScreen = () => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'parts'>('bookings');
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cache mappings for names
  const [servicesMap, setServicesMap] = useState<any>({});
  const [partsMap, setPartsMap] = useState<any>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'bookings') {
        const [servRes, bookRes] = await Promise.all([
          api.get('/services'),
          api.get('/service-bookings')
        ]);
        
        const sMap: any = {};
        if (servRes.data?.success) {
          servRes.data.data.forEach((s: any) => sMap[s._id] = s.serviceName);
        }
        setServicesMap(sMap);
        setItems(bookRes.data?.data || []);

      } else {
        const [partRes, reqRes] = await Promise.all([
          api.get('/spare-parts'),
          api.get('/part-requests')
        ]);
        
        const pMap: any = {};
        if (partRes.data?.success) {
          partRes.data.data.forEach((p: any) => pMap[p._id] = p.partName);
        }
        setPartsMap(pMap);
        setItems(reqRes.data?.data || []);
      }
    } catch (err: any) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const changeStatus = async (id: string, newStatus: string) => {
    try {
      const endpoint = activeTab === 'bookings' 
        ? `/service-bookings/${id}/status` 
        : `/part-requests/${id}/status`;
        
      await api.patch(endpoint, { status: newStatus });
      
      Alert.alert('Success', `Status updated to ${newStatus}`);
      fetchData(); // Refresh list
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update status');
    }
  };

  const getBookingActions = (status: string) => {
    if (status === 'PENDING') return ['CONFIRMED', 'CANCELLED'];
    if (status === 'CONFIRMED') return ['COMPLETED', 'CANCELLED'];
    return [];
  };

  const getPartActions = (status: string) => {
    if (status === 'PENDING') return ['APPROVED', 'REJECTED', 'CANCELLED'];
    if (status === 'APPROVED') return ['ISSUED', 'CANCELLED'];
    return [];
  };

  const renderBooking = ({ item }: any) => (
    <View style={styles.card}>
      <Text style={styles.title}>{servicesMap[item.serviceId] || 'Service'}</Text>
      <Text style={styles.detail}>Status: {item.status}</Text>
      <Text style={styles.detail}>Date: {new Date(item.bookingDate).toLocaleDateString()} | Time: {item.timeSlot}</Text>
      <Text style={styles.detail}>Vehicle: {item.vehicleNumber}</Text>

      <View style={styles.actionsRow}>
        {getBookingActions(item.status).map(action => (
          <TouchableOpacity key={action} style={styles.actionBtn} onPress={() => changeStatus(item._id, action)}>
            <Text style={styles.actionText}>{action}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderPartRequest = ({ item }: any) => (
    <View style={styles.card}>
      <Text style={styles.title}>{partsMap[item.sparePartId] || 'Part'}</Text>
      <Text style={styles.detail}>Status: {item.status}</Text>
      <Text style={styles.detail}>Qty: {item.quantity}</Text>
      
      <View style={styles.actionsRow}>
        {getPartActions(item.status).map(action => (
          <TouchableOpacity key={action} style={styles.actionBtn} onPress={() => changeStatus(item._id, action)}>
            <Text style={styles.actionText}>{action}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'bookings' && styles.activeTab]}
          onPress={() => setActiveTab('bookings')}
        >
          <Text style={[styles.tabText, activeTab === 'bookings' && styles.activeTabText]}>Bookings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'parts' && styles.activeTab]}
          onPress={() => setActiveTab('parts')}
        >
          <Text style={[styles.tabText, activeTab === 'parts' && styles.activeTabText]}>Part Requests</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0056b3" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item: any) => item._id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={activeTab === 'bookings' ? renderBooking : renderPartRequest}
          ListEmptyComponent={<Text style={styles.empty}>No records found.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  tab: { flex: 1, paddingVertical: 16, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderColor: '#0056b3' },
  tabText: { color: '#666', fontWeight: 'bold' },
  activeTabText: { color: '#0056b3' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16, elevation: 1 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 8 },
  detail: { fontSize: 14, color: '#444', marginBottom: 4 },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  actionBtn: { backgroundColor: '#0056b3', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  actionText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  empty: { textAlign: 'center', color: '#999', marginTop: 40 }
});
