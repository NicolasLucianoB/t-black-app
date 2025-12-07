import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface BookingModalHeaderProps {
  onBack: () => void;
  onClose: () => void;
  colors: any;
}

export function BookingModalHeader({ onBack, onClose, colors }: BookingModalHeaderProps) {
  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Agendamento</Text>
      </View>

      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Ionicons name="close" size={24} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    width: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
    width: 40,
    alignItems: 'flex-end',
  },
});
