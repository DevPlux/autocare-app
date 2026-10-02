import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import api from '../../services/api';

export const AdminServiceFormScreen = ({ route, navigation }: any) => {
  const service = route.params?.service;
  const isEditing = !!service;

  const [serviceName, setServiceName] = useState(service?.serviceName || '');
  const [description, setDescription] = useState(service?.description || '');
  const [price, setPrice] = useState(service?.price?.toString() || '');
  const [imageUrl, setImageUrl] = useState(service?.imageUrl || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!serviceName || !price) {
      Alert.alert('Error', 'Service name and price are required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        serviceName,
        description,
        price: Number(price),
        imageUrl
      };

      if (isEditing) {
        await api.put(`/services/${service._id}`, payload);
        Alert.alert('Success', 'Service updated successfully');
      } else {
        await api.post('/services', payload);
        Alert.alert('Success', 'Service created successfully');
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{isEditing ? 'Edit Service' : 'Add New Service'}</Text>

      <Input label="Service Name *" value={serviceName} onChangeText={setServiceName} placeholder="e.g. Full Wash" />
      <Input label="Description" value={description} onChangeText={setDescription} placeholder="Description of service" multiline />
      <Input label="Price (Rs) *" value={price} onChangeText={setPrice} placeholder="e.g. 5000" keyboardType="numeric" />
      <Input label="Image URL" value={imageUrl} onChangeText={setImageUrl} placeholder="https://..." />

      <View style={styles.btnContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#0056b3" />
        ) : (
          <Button title={isEditing ? 'Update Service' : 'Create Service'} onPress={handleSubmit} type="primary" />
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
