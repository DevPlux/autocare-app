import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import api from '../../services/api';

export const RequestPartScreen = ({ route, navigation }: any) => {
  const { part } = route.params;

  const [quantity, setQuantity] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequest = async () => {
    setError('');
    
    // 1. Validations
    const qtyNum = parseInt(quantity, 10);
    if (!quantity.trim() || isNaN(qtyNum) || qtyNum < 1) {
      return setError('Please enter a valid quantity of 1 or more.');
    }

    setLoading(true);
    try {
      // 2. API Call matching the Backend Model
      const response = await api.post('/part-requests', {
        sparePartId: part._id,
        quantity: qtyNum
      });

      if (response.data?.success) {
        Alert.alert(
          'Request Submitted! ✅',
          'Your part request has been successfully submitted to our team.',
          [{ text: 'Great', onPress: () => navigation.goBack() }]
        );
      }
    } catch (err: any) {
      const serverMsg = err.response?.data?.message || err.message || 'Request failed';
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Order Spare Part</Text>
          <Text style={styles.subtitle}>{part.partName}</Text>
          <Text style={styles.price}>Rs. {part.unitPrice}</Text>
        </View>

        {error ? <Text style={styles.errorBox}>{error}</Text> : null}

        <View style={styles.form}>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>Current Stock Status: <Text style={styles.stock}>{part.stockStatus}</Text></Text>
          </View>

          <Input 
            label="Quantity Required *"
            placeholder="e.g. 1"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="number-pad"
          />

          <View style={styles.submitBtn}>
            <Button title="Submit Request" onPress={handleRequest} loading={loading} />
            <Button title="Cancel" type="outline" onPress={() => navigation.goBack()} />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 24, paddingBottom: 50, flexGrow: 1, justifyContent: 'center' },
  header: { marginBottom: 24, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 8 },
  subtitle: { fontSize: 18, color: '#0056b3', fontWeight: '600' },
  price: { fontSize: 16, color: '#666', marginTop: 4 },
  errorBox: { backgroundColor: '#ffe5e5', color: '#ff3b30', padding: 12, borderRadius: 8, marginBottom: 16, textAlign: 'center', fontWeight: 'bold' },
  form: { width: '100%' },
  infoBox: { backgroundColor: '#f8f9fa', padding: 16, borderRadius: 8, marginBottom: 16, alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  infoText: { fontSize: 14, color: '#666' },
  stock: { fontWeight: 'bold', color: '#28a745' },
  submitBtn: { marginTop: 30, gap: 10 }
});
