import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useFonts } from 'expo-font';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useUserData } from '../../contexts/UserDataContext';

function CustomDrawerContent(props) {
    const { instituicao, ponto, profileImage, theme, nome } = useUserData();
    const isDarkTheme = theme === 'dark';

    const handleLogout = async () => {
        await AsyncStorage.removeItem('userRA');
        router.replace('/login');
    };

    return (
        <View style={{ flex: 1, backgroundColor: isDarkTheme ? '#121212' : '#ffffff' }}>
            <View style={{ flex: 0.55, justifyContent: 'center', alignItems: 'center', backgroundColor: isDarkTheme ? '#093f5d' : '#115f8c', marginBottom: 20 }}>
                <Image
                    source={profileImage ? { uri: profileImage } : require('../../assets/images/usuario.png')}
                    style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 10, borderColor: isDarkTheme ? '#115f8c' : '#093f5d', borderWidth: 3 }}
                />
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: isDarkTheme ? '#ffffff' : '#000000ff' }}>Olá, {nome || "Usuário"}</Text>
            </View>
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: isDarkTheme ? '#4da6ff' : '#115f8c', textAlign: 'center', marginBottom: 5, fontFamily: 'LeagueSpartan-Bold', textTransform: 'uppercase', height: 32 }}>Instituição de Ensino</Text>
                <Text style={{ fontSize: 14, color: isDarkTheme ? '#e0e0e0' : '#000', textAlign: 'center', marginBottom: 20, fontFamily: 'LeagueSpartan-Medium' }}>{instituicao || "Não selecionada"}</Text>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: isDarkTheme ? '#4da6ff' : '#115f8c', textAlign: 'center', marginBottom: 5, fontFamily: 'LeagueSpartan-Bold' }}>Ponto de Onibus</Text>
                <Text style={{ fontSize: 14, color: isDarkTheme ? '#e0e0e0' : '#000', textAlign: 'center', marginBottom: 20, fontFamily: 'LeagueSpartan-Medium' }}>{ponto || "Não selecionado"}</Text>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => router.push('/edit')}
                    style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isDarkTheme ? '#1e3a5f' : '#d9e6ee',
                        borderRadius: 50,
                        height: 45,
                        width: 120,
                        marginBottom: 16,
                    }}
                >
                    <Text style={{ margin: 16, fontSize: 18, color: isDarkTheme ? '#ffffff' : '#115f8c', fontFamily: 'LeagueSpartan-Bold', fontWeight: 'bold' }}>Editar</Text>
                </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
                <DrawerContentScrollView
                    {...props}
                    scrollEnabled={false}
                    style={{ backgroundColor: isDarkTheme ? '#121212' : '#ffffff' }}
                    contentContainerStyle={{ paddingBottom: 140 }}
                >
                    <DrawerItemList {...props} />
                </DrawerContentScrollView>
            </View>
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleLogout}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isDarkTheme ? '#093f5d' : '#115f8c',
                    borderRadius: 50,
                    height: 55,
                    marginBottom: 30,
                    marginHorizontal: 15,
                    shadowColor: isDarkTheme ? '#4da6ff' : '#f7b500',
                    shadowOffset: { width: 2, height: 2 },
                    shadowOpacity: 0.5,
                    shadowRadius: 3,
                    elevation: 5,
                }}
            >
                <Ionicons name="exit-outline" size={22} color="#fff" style={{}} />
                <Text style={{ marginLeft: 10, fontSize: 18, color: '#fff', fontFamily: 'LeagueSpartan-Bold' }}>Sair</Text>
            </TouchableOpacity>
        </View>
    )
}

export default function Layout() {
    const { theme } = useUserData();
    const isDarkTheme = theme === 'dark';

    const [fontsLoaded] = useFonts({
        'LeagueSpartan-Regular': require('../../assets/fonts/LeagueSpartan-Regular.ttf'),
        'LeagueSpartan-Bold': require('../../assets/fonts/LeagueSpartan-Bold.ttf'),
        'LeagueSpartan-Black': require('../../assets/fonts/LeagueSpartan-Black.ttf'),
        'LeagueSpartan-ExtraBold': require('../../assets/fonts/LeagueSpartan-ExtraBold.ttf'),
        'LeagueSpartan-ExtraLight': require('../../assets/fonts/LeagueSpartan-ExtraLight.ttf'),
        'LeagueSpartan-Light': require('../../assets/fonts/LeagueSpartan-Light.ttf'),
        'LeagueSpartan-Medium': require('../../assets/fonts/LeagueSpartan-Medium.ttf'),
        'LeagueSpartan-SemiBold': require('../../assets/fonts/LeagueSpartan-SemiBold.ttf'),
        'LeagueSpartan-Thin': require('../../assets/fonts/LeagueSpartan-Thin.ttf'),
    });

    if (!fontsLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDarkTheme ? '#121212' : '#ffffff' }}>
                <ActivityIndicator size="large" color={isDarkTheme ? '#4da6ff' : '#115f8c'} />
            </View>
        );
    }

    return (
        <Drawer
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                drawerStyle: {
                    width: '60%',
                    borderRightColor: isDarkTheme ? '#4da6ff' : '#093f5d',
                    borderRightWidth: 4,
                    backgroundColor: isDarkTheme ? '#121212' : '#ffffff',
                },
                drawerItemStyle: { backgroundColor: isDarkTheme ? '#093f5d' : '#115f8c', marginBottom: 12 },
                drawerLabelStyle: {
                    fontFamily: 'LeagueSpartan-Bold',
                    fontSize: 18,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: '#fff',
                },
                headerTitleAlign: 'center',
                headerTitleStyle: {
                    fontFamily: 'LeagueSpartan-Bold',
                    fontSize: 25,
                    color: isDarkTheme ? '#4da6ff' : '#0f5176',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
                headerStyle: {
                    backgroundColor: isDarkTheme ? '#121212' : '#ffffff',
                },
                headerTitle: 'Transporte+',
            }}
        >
            <Drawer.Screen name="home" options={{ title: 'Mapa' }} />
            <Drawer.Screen name="about" options={{ title: 'Sobre' }} />
            <Drawer.Screen name="config" options={{ title: 'Configurações' }} />
            <Drawer.Screen name="carteirinha" options={{ title: 'Carteirinha' }} />
            <Drawer.Screen name="edit" options={{ drawerItemStyle: { display: 'none' } }} />
        </Drawer>

    );
}
