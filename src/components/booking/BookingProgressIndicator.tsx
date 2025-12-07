import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BookingStep } from './useBookingFlow';

interface BookingProgressIndicatorProps {
  step: BookingStep;
  colors: any;
}

export function BookingProgressIndicator({ step, colors }: BookingProgressIndicatorProps) {
  const getProgressWidth = () => {
    switch (step) {
      case 'professional':
        return '33%';
      case 'datetime':
        return '66%';
      case 'summary':
        return '100%';
      default:
        return '0%';
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: colors.primary, width: getProgressWidth() },
          ]}
        />
      </View>
      <View style={styles.labels}>
        <Text
          style={[
            styles.label,
            {
              color: step === 'professional' ? colors.primary : colors.textSecondary,
              fontWeight: step === 'professional' ? '600' : '400',
            },
          ]}
        >
          Profissional
        </Text>
        <Text
          style={[
            styles.label,
            {
              color: step === 'datetime' ? colors.primary : colors.textSecondary,
              fontWeight: step === 'datetime' ? '600' : '400',
            },
          ]}
        >
          Data/Hora
        </Text>
        <Text
          style={[
            styles.label,
            {
              color: step === 'summary' ? colors.primary : colors.textSecondary,
              fontWeight: step === 'summary' ? '600' : '400',
            },
          ]}
        >
          Confirmar
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 12,
  },
});
