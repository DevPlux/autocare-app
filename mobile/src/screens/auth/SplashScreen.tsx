import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SplashScreen = ({ navigation }: any) => {
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        setTimeout(() => {
          if (token) {
            navigation.replace('MainApp');
          } else {
            navigation.replace('Login');
          }
        }, 2000);
      } catch (e) {
        navigation.replace('Login');
      }
    };
    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AutoCare</Text>
      <Text style={styles.subtitle}>Your Premium Car Service</Text>
      <ActivityIndicator size="large" color="#0056b3" style={{ marginTop: 30 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#0056b3',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    fontWeight: '500',
  }
});
