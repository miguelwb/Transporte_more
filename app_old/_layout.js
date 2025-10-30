import { Slot } from 'expo-router';
import { useFonts } from 'expo-font';
import { View, ActivityIndicator } from 'react-native';
import {AuthProvider} from '../contexts/useAuth';

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
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
