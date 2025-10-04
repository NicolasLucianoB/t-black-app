import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { useAuth } from '../../src/contexts/AuthContext';
import { supabase } from '../../src/services/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Handle the auth callback
    const handleAuthCallback = async () => {
      try {
        // Wait a moment for the auth state to be processed
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Get the session after OAuth callback
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          router.replace('/login');
          return;
        }

        if (session && session.user) {
          // Successful login, redirect to home
          router.replace('/tabs/home');
        } else {
          // No session, redirect to login
          router.replace('/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.replace('/login');
      }
    };

    // Only handle callback if not loading and no user yet
    if (!loading) {
      handleAuthCallback();
    }
  }, [router, loading, user]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#000" />
      <Text style={{ marginTop: 16 }}>Processando login...</Text>
    </View>
  );
}
