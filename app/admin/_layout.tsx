import { Redirect, Slot } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ProtectedRoute } from '../../src/components/ProtectedRoute';
import { useAdminMode } from '../../src/contexts/AdminModeContext';
import { useAuth } from '../../src/contexts/AuthContext';

export default function AdminLayout() {
  const { user, userRole } = useAuth();
  const { canAccessAdminMode } = useAdminMode();

  // DEBUG: Log do estado atual
  console.log('🔍 AdminLayout DEBUG:', {
    user: user?.email,
    userRole,
    canAccessAdminMode,
  });

  // Redirect to login if not authenticated
  if (!user) {
    console.log('❌ AdminLayout: No user, redirecting to login');
    return <Redirect href="/login" />;
  }

  // Protect admin routes - only admin and superadmin can access
  return (
    <ProtectedRoute requiredRole="admin">
      <View style={styles.container}>
        <Slot />
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
