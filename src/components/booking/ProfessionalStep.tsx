import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Barber } from 'src/types';

interface ProfessionalStepProps {
  barbeiros: Barber[];
  onSelect: (barbeiroId: string) => void;
  colors: any;
}

export function ProfessionalStep({ barbeiros, onSelect, colors }: ProfessionalStepProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Profissional</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Quem vai te atender?</Text>
      </View>

      <View style={styles.grid}>
        {barbeiros.map((barber) => (
          <TouchableOpacity key={barber.id} style={styles.item} onPress={() => onSelect(barber.id)}>
            <View style={styles.avatarSimple}>
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                <Text style={[styles.avatarText, { color: colors.card }]}>
                  {barber.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={[styles.name, { color: colors.text }]}>{barber.name.split(' ')[0]}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  item: {
    alignItems: 'center',
    marginBottom: 24,
    width: '30%',
    minWidth: 80,
  },
  avatarSimple: {
    marginBottom: 8,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600',
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
  },
});
