import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { ActivityIndicator, View, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet from '../components/BottomSheet';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UserDataProvider } from '../contexts/UserDataContext';
import { TransportProvider } from '../contexts/TransportContext';

export default function Layout() {

  const [fontsLoaded] = useFonts({
    'LeagueSpartan-Regular': require('../assets/fonts/LeagueSpartan-Regular.ttf'),
    'LeagueSpartan-Bold': require('../assets/fonts/LeagueSpartan-Bold.ttf'),
    'LeagueSpartan-Black': require('../assets/fonts/LeagueSpartan-Black.ttf'),
    'LeagueSpartan-ExtraBold': require('../assets/fonts/LeagueSpartan-ExtraBold.ttf'),
    'LeagueSpartan-ExtraLight': require('../assets/fonts/LeagueSpartan-ExtraLight.ttf'),
    'LeagueSpartan-Light': require('../assets/fonts/LeagueSpartan-Light.ttf'),
    'LeagueSpartan-Medium': require('../assets/fonts/LeagueSpartan-Medium.ttf'),
    'LeagueSpartan-SemiBold': require('../assets/fonts/LeagueSpartan-SemiBold.ttf'),
    'LeagueSpartan-Thin': require('../assets/fonts/LeagueSpartan-Thin.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <UserDataProvider>
        <TransportProvider>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="(protected)" options={{ headerShown: false }} />
            <Stack.Screen name='(admin)' options={{headerShown: false}} />
            <Stack.Screen name='admin-login' options={{headerShown: false}} />
          </Stack>
          <BottomSheet
            visible={true}
            snapPoints={[76, 380, 560]}
            initialIndex={0}
            backdropOpacity={0}
            closeOnBackdropPress={false}
            closeOnDragDown={false}
          >
            <View style={{ backgroundColor: '#0f5f8c', marginHorizontal: -12, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TextInput
                placeholder="Buscar"
                placeholderTextColor="#d6e6ef"
                style={{ flex: 1, height: 34, borderRadius: 10, backgroundColor: '#2a76a1', paddingHorizontal: 12, color: '#eaf4f9' }}
              />
              <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#2a76a1', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="person" size={20} color="#cfe0ea" />
              </View>
            </View>
          </BottomSheet>
        </TransportProvider>
      </UserDataProvider>
    </SafeAreaProvider>
  );
}