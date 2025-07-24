import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated';
  padding?: number;
}

export default function Card({
  children,
  variant = 'default',
  padding = 16,
  style,
  ...props
}: CardProps) {
  const cardStyle = [
    styles.card,
    variant === 'elevated' ? styles.elevated : styles.default,
    { padding },
    style,
  ];

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
  },
  default: {
    borderWidth: 1,
    borderColor: '#eee',
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
