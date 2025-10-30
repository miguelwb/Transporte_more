import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useFonts } from 'expo-font';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

function CustomDrawerContent(props) {

    const handleLogout = async () => {
        await AsyncStorage.removeItem('userRA');
        router.replace('/login');
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 0.65, justifyContent: 'center', alignItems: 'center', backgroundColor: '#115f8c', marginBottom: 30 }}>
                <Image
                    source={require('../../assets/images/usuario.png')}
                    style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 10, borderColor: '#093f5d', borderWidth: 3 }}
                />
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#000000ff' }}>Olá, Usuário</Text>
            </View>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#115f8c', textAlign: 'center', marginBottom: 20, fontFamily: 'LeagueSpartan-Bold', textTransform: 'uppercase', height: 32 }}>Instituição de Ensino</Text>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#115f8c', textAlign: 'center', marginBottom: 20, fontFamily: 'LeagueSpartan-Bold' }}>Ponto de Onibus</Text>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => router.push('/edit')}
                    style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#d9e6ee',
                        borderRadius: 50,
                        height: 45,
                        width: 120,
                        marginBottom: 30,

                    }}
                >
                    <Text style={{ margin: 16, fontSize: 18, color: '#115f8c', fontFamily: 'LeagueSpartan-Bold', fontWeight: 'bold' }}>Editar</Text>
                </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
                <DrawerContentScrollView {...props} scrollEnabled={false}>
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
                    backgroundColor: '#115f8c',
                    borderRadius: 50,
                    height: 55,
                    marginBottom: 30,
                    marginHorizontal: 15,

                    // 💛 sombra amarela suave, só embaixo/direita
                    shadowColor: '#f7b500',
                    shadowOffset: { width: 3, height: 4 }, // deslocamento horizontal e vertical
                    shadowOpacity: 0.9,
                    shadowRadius: 0,
                    elevation: 8, // para Android
                }}
            >
                <Ionicons name="exit-outline" size={22} color="#fff" style={{}} />
                <Text style={{ margin: 16, fontSize: 16, color: '#fff', fontFamily: 'LeagueSpartan-Bold', fontWeight: 'bold' }}>Sair</Text>
            </TouchableOpacity>
        </View >
    )
}

export default function Layout() {

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
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    return (
        <Drawer
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                drawerStyle: {
                    width: '60%',
                    borderRightColor: '#093f5d',
                    borderRightWidth: 4,
                },
                drawerItemStyle: { backgroundColor: '#115f8c', marginBottom: 20 },
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
                    color: '#0f5176',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
                headerTitle: 'Transporte+',
            }}
        >
            <Drawer.Screen name="home" options={{ title: 'Mapa' }} />
            <Drawer.Screen name="about" options={{ title: 'Sobre' }} />
            <Drawer.Screen name="config" options={{ title: 'Configurações' }} />
            <Drawer.Screen name="edit" options={{ drawerItemStyle: { display: 'none' } }} />
        </Drawer>

    );
}