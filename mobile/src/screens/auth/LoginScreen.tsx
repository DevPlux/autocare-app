import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { authService } from '../../services/authService';

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      await authService.login(email, password);
      navigation.replace('MainApp');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
      Alert.alert('Login Error', err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Login to continue using AutoCare</Text>
        </View>

        <View style={styles.form}>
          {error ? <Text style={styles.globalError}>{error}</Text> : null}
          
          <Input 
            label="Email Address"
            placeholder="john@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input 
            label="Password"
            placeholder="********"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <View style={{ marginTop: 20 }}>
            <Button title="Login" onPress={handleLogin} loading={loading} />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Text 
            style={styles.link}
            onPress={() => navigation.navigate('Register')}
          >
            Sign up here
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    width: '100%',
  },
  globalError: {
    color: '#ff3b30',
    backgroundColor: '#ffe5e5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  footerText: {
    color: '#666',
    fontSize: 15,
  },
  link: {
    color: '#0056b3',
    fontWeight: 'bold',
    fontSize: 15,
  }
});
