import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import api from '../../services/api';

export const MyBookingsScreen = ({ navigation }: any) => {
  const [bookings, setBookings] = useState([]);
  const [servicesMap, setServicesMap] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // Fetch services first to map names
        const servicesRes = await api.get('/services');
        const sMap: any = {};
        if (servicesRes.data?.success) {
          servicesRes.data.data.forEach((s: any) => {
            sMap[s._id] = s.name;
          });
        }
        setServicesMap(sMap);

        // Fetch bookings
        const bookingsRes = await api.get('/service-bookings');
        if (bookingsRes.data?.success) {
          setBookings(bookingsRes.data.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDING': return '#ffc107'; // Yellow
      case 'CONFIRMED': return '#17a2b8'; // Blue
      case 'COMPLETED': return '#28a745'; // Green
      case 'CANCELLED': return '#dc3545'; // Red
      default: return '#6c757d'; // Gray
    }
  };

  const handleCancel = async (id: string) => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: async () => {
          try {
            setLoading(true);
            await api.delete(`/service-bookings/${id}`);
            // Refetch bookings after cancel
            const res = await api.get('/service-bookings');
            if (res.data?.success) setBookings(res.data.data);
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
          data={bookings}
          keyExtractor={(item: any) => item._id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.title}>{servicesMap[item.serviceId] || 'Service Booking'}</Text>
                <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}>
                  <Text style={styles.badgeText}>{item.status}</Text>
                </View>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.label}>Date:</Text>
                <Text style={styles.value}>{new Date(item.bookingDate).toLocaleDateString()}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Time:</Text>
                <Text style={styles.value}>{item.timeSlot}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Vehicle:</Text>
                <Text style={styles.value}>{item.vehicleNumber}</Text>
              </View>
              {item.notes ? (
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Notes:</Text>
                  <Text style={styles.value}>{item.notes}</Text>
                </View>
              ) : null}

              {(item.status === 'PENDING' || item.status === 'CONFIRMED') && (
                <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancel(item._id)}>
                  <Text style={styles.cancelBtnText}>Cancel Booking</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>You have no service bookings yet.</Text>}
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
