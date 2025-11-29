import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';

interface AppHeaderProps {
  title?: string;
  rightElement?: React.ReactNode;
}

export default function AppHeader({ title, rightElement }: AppHeaderProps) {
  const { getCartCount } = useCart();
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <View
      style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
    >
      <View style={styles.headerLeft}>
        <TouchableOpacity style={styles.menuButton} onPress={() => router.push('/menu')}>
          <Ionicons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      {title && (
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, textAlign: 'center' }}>
          {title}
        </Text>
      )}
      <View style={styles.headerRight}>
        {rightElement}
        <TouchableOpacity style={styles.iconButton} onPress={() => router.push('notifications')}>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    marginRight: 10,
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
});
