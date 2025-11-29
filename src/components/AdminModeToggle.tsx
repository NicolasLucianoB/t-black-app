import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { useAdminMode } from '../contexts/AdminModeContext';
import { useTheme } from '../contexts/ThemeContext';

export function AdminModeToggle() {
  const { isAdminMode, toggleAdminMode, canAccessAdminMode } = useAdminMode();
  const { colors } = useTheme();

  // Só renderiza se pode acessar modo admin
  if (!canAccessAdminMode) {
    return null;
  }

  const handleToggle = () => {
    Alert.alert(
      isAdminMode ? 'Desativar Modo Admin' : 'Ativar Modo Admin',
      isAdminMode ? 'Voltar para visualização de cliente?' : 'Entrar no modo administrador?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: isAdminMode ? 'Desativar' : 'Ativar',
          onPress: toggleAdminMode,
        },
      ],
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: isAdminMode ? colors.primary : colors.surface,
          borderColor: colors.primary,
        },
      ]}
      onPress={handleToggle}
    >
      <Ionicons
        name={isAdminMode ? 'shield-checkmark' : 'shield-outline'}
        size={20}
        color={isAdminMode ? colors.surface : colors.primary}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
