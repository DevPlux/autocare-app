import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ImageStyle, StyleProp, ViewStyle } from 'react-native';

interface RemoteImageProps {
  url?: string;
  alt: string;
  style?: StyleProp<ImageStyle>;
}

export const RemoteImage = ({ url, alt, style }: RemoteImageProps) => {
  const [error, setError] = useState(false);

  if (!url || error) {
    return (
      <View style={[styles.placeholder, style as any]}>
        <Text style={styles.altText} numberOfLines={2}>{alt}</Text>
      </View>
    );
  }

  return (
    <Image 
      source={{ uri: url }} 
      style={[style, { resizeMode: 'cover' }]} 
      onError={() => setError(true)}
    />
  );
};

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  altText: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  }
});
