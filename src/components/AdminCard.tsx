import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '../contexts/ThemeContext';

interface AdminCardProps {
  title: string;
  subtitle?: string;
  value?: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  onPress?: () => void;
  children?: React.ReactNode;
  variant?: 'default' | 'stat' | 'action' | 'warning';
}

export function AdminCard({
  title,
  subtitle,
  value,
  icon,
  iconColor,
  onPress,
  children,
  variant = 'default',
}: AdminCardProps) {
  const { colors } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'stat':
        return {
          borderLeftWidth: 4,
          borderLeftColor: colors.primary,
        };
      case 'action':
        return {
          borderLeftWidth: 4,
          borderLeftColor: colors.success,
        };
      case 'warning':
        return {
          borderLeftWidth: 4,
          borderLeftColor: colors.error,
        };
      default:
        return {};
    }
  };

  const getIconColor = () => {
    if (iconColor) return iconColor;
    switch (variant) {
      case 'stat':
        return colors.primary;
      case 'action':
        return colors.success;
      case 'warning':
        return colors.error;
      default:
        return colors.text;
    }
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      ...getVariantStyles(),
      ...(onPress && {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }),
    },
    pressable: {
      opacity: 0.7,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: children ? 12 : 0,
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    iconContainer: {
      marginRight: 12,
    },
    textSection: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    value: {
      fontSize: 18,
      fontWeight: 'bold',
      color: variant === 'stat' ? colors.primary : colors.text,
    },
    content: {
      marginTop: 8,
    },
  });

  const CardContent = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.leftSection}>
          {icon && (
            <View style={styles.iconContainer}>
              <Ionicons name={icon} size={24} color={getIconColor()} />
            </View>
          )}

          <View style={styles.textSection}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>

        {value !== undefined && value !== null && <Text style={styles.value}>{String(value)}</Text>}
      </View>

      {children && <View style={styles.content}>{children}</View>}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
}
