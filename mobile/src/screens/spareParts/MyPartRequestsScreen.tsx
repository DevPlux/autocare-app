import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import api from '../../services/api';

export const MyPartRequestsScreen = ({ navigation }: any) => {
  const [requests, setRequests] = useState([]);
  const [partsMap, setPartsMap] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        // Fetch parts first to map names
        const partsRes = await api.get('/spare-parts');
        const pMap: any = {};
        if (partsRes.data?.success) {
          partsRes.data.data.forEach((p: any) => {
            pMap[p._id] = p.partName;
          });
        }
        setPartsMap(pMap);

        // Fetch user's part requests
        const requestsRes = await api.get('/part-requests');
        if (requestsRes.data?.success) {
          setRequests(requestsRes.data.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch part requests');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDING': return '#ffc107'; // Yellow
      case 'APPROVED': return '#17a2b8'; // Blue
      case 'ISSUED': return '#28a745'; // Green
      case 'REJECTED': return '#dc3545'; // Red
      case 'CANCELLED': return '#6c757d'; // Gray
      default: return '#6c757d';
    }
  };

  const handleCancel = async (id: string) => {
    Alert.alert('Cancel Request', 'Are you sure you want to cancel this part request?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: async () => {
          try {
            setLoading(true);
            await api.delete(`/part-requests/${id}`);
            const res = await api.get('/part-requests');
            if (res.data?.success) setRequests(res.data.data);
          } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to cancel');
          } finally {
            setLoading(false);
          }
      }}
    ]);
  };

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.errorBox}>{error}</Text> : null}
      
      {loading ? (
        <ActivityIndicator size="large" color="#0056b3" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item: any) => item._id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.title}>{partsMap[item.sparePartId] || 'Unknown Part'}</Text>
                <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}>
                  <Text style={styles.badgeText}>{item.status}</Text>
                </View>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.label}>Quantity:</Text>
                <Text style={styles.value}>{item.quantity}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Date:</Text>
                <Text style={styles.value}>{new Date(item.requestDate).toLocaleDateString()}</Text>
              </View>

              {(item.status === 'PENDING' || item.status === 'APPROVED') && (
                <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancel(item._id)}>
                  <Text style={styles.cancelBtnText}>Cancel Request</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>You have no part requests yet.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  errorBox: { backgroundColor: '#ffe5e5', color: '#ff3b30', padding: 12, textAlign: 'center', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a', flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  detailRow: { flexDirection: 'row', marginBottom: 8 },
  label: { width: 70, fontSize: 14, color: '#666', fontWeight: '600' },
  value: { flex: 1, fontSize: 14, color: '#333' },
  empty: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 16 },
  cancelBtn: { marginTop: 12, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: '#dc3545', borderRadius: 6 },
  cancelBtnText: { color: '#dc3545', fontWeight: 'bold' }
});
