import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export const HomeScreen = ({ navigation }: any) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.title}>What does your car need today?</Text>
      </View>

      <View style={styles.cardsContainer}>
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: '#e3f2fd' }]} 
          onPress={() => navigation.navigate('Services')}
        >
          <Text style={styles.cardEmoji}>🚗</Text>
          <Text style={styles.cardTitle}>Book a Service</Text>
          <Text style={styles.cardSubtitle}>Wash, Repair, Maintenance</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, { backgroundColor: '#fce4ec' }]}
          onPress={() => navigation.navigate('Parts')}
        >
          <Text style={styles.cardEmoji}>⚙️</Text>
          <Text style={styles.cardTitle}>Spare Parts</Text>
          <Text style={styles.cardSubtitle}>Genuine parts store</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: '#e8f5e9' }]}
          onPress={() => navigation.navigate('MyBookings')}
        >
          <Text style={styles.cardEmoji}>📅</Text>
          <Text style={styles.cardTitle}>My Bookings</Text>
          <Text style={styles.cardSubtitle}>Check appointment status</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#0056b3',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  greeting: {
    fontSize: 16,
    color: '#e0e0e0',
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardsContainer: {
    padding: 24,
    gap: 16,
  },
  card: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  }
});
