// app/_layout.js
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { Slot } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


const Drawer = createDrawerNavigator();

const DrawerLayout = () => {
  return (
    <GestureHandlerRootView options={{ flex: 1 }}>
      <NavigationContainer>
        <Drawer.Navigator initialRouteName="Home">
          <Drawer.Screen name="Home"  />
          <Drawer.Screen name="Notifications" />
        </Drawer.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default function Layout() {
  return DrawerLayout(), <Slot />;
}
