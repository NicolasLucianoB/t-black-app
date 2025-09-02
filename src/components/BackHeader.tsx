import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';

interface BackHeaderProps {
  title?: string; // Agora opcional
  onBack?: () => void;
  rightComponent?: React.ReactNode;
  showDefaultIcons?: boolean; // Nova prop para controlar se mostra os ícones padrão
}

export default function BackHeader({
  title,
  onBack,
  rightComponent,
  showDefaultIcons = true,
}: BackHeaderProps) {
  const { colors } = useTheme();
  const { getCartCount } = useCart();
  const router = useRouter();

  const handleBack = onBack || (() => router.back());

  // Componente padrão da direita (ícones do AppHeader)
  const defaultRightComponent = (
    <View style={styles.headerRight}>
      <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/notifications')}>
        <Ionicons name="notifications-outline" size={24} color={colors.text} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/cart')}>
        <Ionicons name="cart-outline" size={24} color={colors.text} />
        {getCartCount() > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{getCartCount()}</Text>
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/studioInfo')}>
        <Ionicons name="information-circle-outline" size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View
      style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
    >
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      {title && <Text style={[styles.title, { color: colors.text }]}>{title}</Text>}
      <View style={styles.rightContainer}>
        {rightComponent ||
          (showDefaultIcons ? defaultRightComponent : <View style={styles.placeholder} />)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16, // Adiciona margem quando o título está presente
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 16,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff6b6b',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 32,
  },
});
