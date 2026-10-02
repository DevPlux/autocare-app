import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import api from '../../services/api';

export const AdminPartFormScreen = ({ route, navigation }: any) => {
  const part = route.params?.part;
  const isEditing = !!part;

  const [partName, setPartName] = useState(part?.partName || '');
  const [description, setDescription] = useState(part?.description || '');
  const [unitPrice, setUnitPrice] = useState(part?.unitPrice?.toString() || '');
  const [stockQuantity, setStockQuantity] = useState(part?.stockQuantity?.toString() || '0');
  const [imageUrl, setImageUrl] = useState(part?.imageUrl || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!partName || !unitPrice || !stockQuantity) {
      Alert.alert('Error', 'Name, price, and stock are required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        partName,
        description,
        unitPrice: Number(unitPrice),
        stockQuantity: Number(stockQuantity),
        imageUrl
      };

      if (isEditing) {
        await api.put(`/spare-parts/${part._id}`, payload);
        Alert.alert('Success', 'Spare part updated successfully');
      } else {
        await api.post('/spare-parts', payload);
        Alert.alert('Success', 'Spare part created successfully');
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save part');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{isEditing ? 'Edit Spare Part' : 'Add New Spare Part'}</Text>

      <Input label="Part Name *" value={partName} onChangeText={setPartName} placeholder="e.g. Brake Pads" />
      <Input label="Description" value={description} onChangeText={setDescription} placeholder="Description of part" multiline />
      <Input label="Unit Price (Rs) *" value={unitPrice} onChangeText={setUnitPrice} placeholder="e.g. 2500" keyboardType="numeric" />
      <Input label="Stock Quantity *" value={stockQuantity} onChangeText={setStockQuantity} placeholder="e.g. 50" keyboardType="numeric" />
      <Input label="Image URL" value={imageUrl} onChangeText={setImageUrl} placeholder="https://..." />

      <View style={styles.btnContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#0056b3" />
        ) : (
          <Button title={isEditing ? 'Update Part' : 'Create Part'} onPress={handleSubmit} type="primary" />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  btnContainer: { marginTop: 20, marginBottom: 40 }
});
