import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

export default function AdminLayout() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const adminUser = await AsyncStorage.getItem('adminUser');
      if (adminUser) {
        const userData = JSON.parse(adminUser);
        if (userData.role === 'administrator') {
          setIsAuthenticated(true);
        } else {
          router.replace('/admin-login');
        }
      } else {
        router.replace('/admin-login');
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação admin:', error);
      router.replace('/admin-login');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2a5298" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return null; // O redirecionamento já foi feito
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2a5298',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="dashboard" 
        options={{ 
          title: 'Painel Administrativo',
          headerBackVisible: false,
        }} 
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});