import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Barber } from 'src/types';

interface ProfessionalCardProps {
  barbeiro: Barber;
  isExpanded: boolean;
  onToggle: () => void;
  colors: any;
}

export function ProfessionalCard({
  barbeiro,
  isExpanded,
  onToggle,
  colors,
}: ProfessionalCardProps) {
  return (
    <View
      style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      {/* Header do Profissional */}
      <TouchableOpacity onPress={onToggle} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={[styles.avatarContainer, { borderColor: colors.primary }]}>
            <Image
              source={
                barbeiro.avatar ? { uri: barbeiro.avatar } : require('assets/logo-t-black.png')
              }
              style={styles.avatar}
            />
          </View>
          <View style={styles.nameContainer}>
            <Text style={[styles.professionalName, { color: colors.text }]}>
              {barbeiro.name || 'Nome não disponível'}
            </Text>
          </View>
        </View>
        <View style={[styles.expandIcon, { backgroundColor: colors.accent + '15' }]}>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.accent}
          />
        </View>
      </TouchableOpacity>

      {/* Conteúdo Expandido */}
      {isExpanded && (
        <View
          style={[
            styles.expandedContent,
            { backgroundColor: colors.card, borderTopColor: colors.border },
          ]}
        >
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {barbeiro.description || 'Profissional qualificado do Studio T Black.'}
          </Text>
          {barbeiro.specialties && barbeiro.specialties.length > 0 && (
            <View style={styles.specialtiesContainer}>
              <Text style={[styles.specialtiesTitle, { color: colors.text }]}>Especialidades</Text>
              <Text style={[styles.specialtiesText, { color: colors.textSecondary }]}>
                {barbeiro.specialties.join(' • ')}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  nameContainer: {
    flex: 1,
    marginLeft: 16,
  },
  professionalName: {
    fontSize: 16,
    fontWeight: '600',
  },
  expandIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedContent: {
    padding: 20,
    borderTopWidth: 1,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'justify',
  },
  specialtiesContainer: {
    marginTop: 16,
  },
  specialtiesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  specialtiesText: {
    fontSize: 14,
  },
});
