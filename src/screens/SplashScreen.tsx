import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface SplashScreenProps {
  navigation: any;
}

export default function SplashScreen({ navigation }: SplashScreenProps) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      navigation.replace('Login');
    }, 1500);
    return () => clearTimeout(timeout);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#000" />
      <Text style={styles.text}>Studio T Black</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
  },
}); 