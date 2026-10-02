import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import api from '../../services/api';

export const BookServiceScreen = ({ route, navigation }: any) => {
  const { service } = route.params;

  const [vehicleNumber, setVehicleNumber] = useState('');
  const [bookingDate, setBookingDate] = useState(''); // Simple YYYY-MM-DD for now
  const [timeSlot, setTimeSlot] = useState(''); // e.g. "09:00-10:00"
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Very basic predefined slots for demonstration
  const availableSlots = ['09:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00'];

  const handleBooking = async () => {
    // 1. Validation
    setError('');
    if (!vehicleNumber.trim()) {
      return setError('Vehicle Number is required');
    }
    if (!bookingDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return setError('Please enter a valid date (YYYY-MM-DD)');
    }
    if (!timeSlot) {
      return setError('Please select a time slot');
    }

    setLoading(true);
    try {
      // 2. Format Date to UTC Midnight as required by Backend
      const formattedDate = new Date(`${bookingDate}T00:00:00.000Z`);

      // 3. API Call
      const response = await api.post('/service-bookings', {
        serviceId: service._id,
        vehicleNumber,
        bookingDate: formattedDate.toISOString(),
        timeSlot,
        notes
      });

      if (response.data?.success) {
        Alert.alert(
          'Booking Successful! 🎉',
          'Your service appointment has been requested successfully.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (err: any) {
      const serverMsg = err.response?.data?.message || err.message || 'Booking failed';
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Book Appointment</Text>
          <Text style={styles.subtitle}>{service.serviceName} (Rs. {service.price})</Text>
        </View>

        {error ? <Text style={styles.errorBox}>{error}</Text> : null}

        <View style={styles.form}>
          <Input 
            label="Vehicle Number *"
            placeholder="e.g. CAA-1234 or WP ABC-5678"
            value={vehicleNumber}
            onChangeText={setVehicleNumber}
            autoCapitalize="characters"
          />

          <Input 
            label="Booking Date (YYYY-MM-DD) *"
            placeholder="e.g. 2026-10-15"
            value={bookingDate}
            onChangeText={setBookingDate}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Select Time Slot *</Text>
          <View style={styles.slotsContainer}>
            {availableSlots.map(slot => (
              <Button 
                key={slot}
                title={slot}
                type={timeSlot === slot ? 'primary' : 'outline'}
                onPress={() => setTimeSlot(slot)}
              />
            ))}
          </View>

          <Input 
            label="Additional Notes (Optional)"
            placeholder="Any specific issues or requests?"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={styles.textArea}
          />

          <View style={styles.submitBtn}>
            <Button title="Confirm Booking" onPress={handleBooking} loading={loading} />
            <Button title="Cancel" type="secondary" onPress={() => navigation.goBack()} />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 24, paddingBottom: 50 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#0056b3', fontWeight: '600' },
  errorBox: { backgroundColor: '#ffe5e5', color: '#ff3b30', padding: 12, borderRadius: 8, marginBottom: 16, textAlign: 'center', fontWeight: 'bold' },
  form: { width: '100%' },
  label: { fontSize: 14, color: '#333', marginTop: 12, marginBottom: 8, fontWeight: '600' },
  slotsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  textArea: { height: 100, textAlignVertical: 'top' },
  submitBtn: { marginTop: 30, gap: 10 }
});
