import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  type?: 'primary' | 'secondary' | 'outline';
}

export const Button = ({ title, onPress, loading, type = 'primary' }: ButtonProps) => {
  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        type === 'primary' && styles.primary,
        type === 'secondary' && styles.secondary,
        type === 'outline' && styles.outline,
        loading && styles.disabled
      ]} 
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={type === 'outline' ? '#0056b3' : '#fff'} />
      ) : (
        <Text style={[
          styles.text,
          type === 'outline' && styles.textOutline
        ]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primary: {
    backgroundColor: '#0056b3',
  },
  secondary: {
    backgroundColor: '#333',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#0056b3',
    elevation: 0,
    shadowOpacity: 0,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  textOutline: {
    color: '#0056b3',
  },
  disabled: {
    opacity: 0.7,
  }
});
