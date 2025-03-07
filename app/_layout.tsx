import React, { useEffect } from 'react';
import { Slot, router, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '@/context/authContext';


import { View, ActivityIndicator, StyleSheet } from 'react-native';

// This component checks if the user is authenticated
// If not, it redirects to the login page
function AuthGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'register';
    
    // If the user is not authenticated and not on an auth screen, redirect to login
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/login');
    }
    
    // If the user is authenticated and on an auth screen, redirect to home
    if (isAuthenticated && inAuthGroup) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return <Slot />;
}

// Root layout component
export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGuard />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});