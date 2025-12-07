import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ServiceCardProps {
  service: any;
  onPress: () => void;
  colors: any;
}

export function ServiceCard({ service, onPress, colors }: ServiceCardProps) {
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <Text style={[styles.serviceName, { color: colors.text }]}>{service.name}</Text>
        {service.description && (
          <Text
            style={[styles.serviceDescription, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {service.description}
          </Text>
        )}
        <View style={styles.footer}>
          <Text style={[styles.servicePrice, { color: colors.primary }]}>
            R$ {service.price?.toFixed(2) || '0.00'}
          </Text>
          {service.duration && (
            <Text style={[styles.serviceDuration, { color: colors.textSecondary }]}>
              {service.duration} min
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: '700',
  },
  serviceDuration: {
    fontSize: 14,
  },
});
