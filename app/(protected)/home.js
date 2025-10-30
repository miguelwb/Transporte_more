import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Map, { Callout, Marker } from '../../components/MapView';

const coordinate = {
  latitude: -21.874997619625923,
  longitude: -51.844490086689184,
};

const coordinatePoints = {
  Eldorado: {
    nome: "Padaria do Sr. Julho",
    rua: "R. Tadashi Kitayama",
    latitude: -21.881968148588783,
    longitude: -51.85786993109705,
  },
  Casa: {
    nome: "Minha Casa",
    rua: "R. João Pessoa",
    latitude: -21.88441213395088,
    longitude: -51.858598577513696,
  },
};

export default function Home() {
  const [ra, setRA] = useState(null);
  const [announcement, setAnnouncement] = useState('');
  const EXPIRATION_MS = 5 * 60 * 1000; // 5 minutos
  const router = useRouter();

  useEffect(() => {
    const checkLogin = async () => {
      const savedRA = await AsyncStorage.getItem('userRA');
      if (!savedRA) {
        router.replace('/Login');
      } else {
        setRA(savedRA);
      }
    };

    const loadAnnouncement = async () => {
      try {
        const [msg, ts] = await AsyncStorage.multiGet(['adminMessage', 'adminMessageTime']);
        const message = msg?.[1] || '';
        const timestampStr = ts?.[1];
        const now = Date.now();
        const timestamp = timestampStr ? parseInt(timestampStr, 10) : 0;
        if (message && timestamp && now - timestamp > EXPIRATION_MS) {
          await AsyncStorage.multiRemove(['adminMessage', 'adminMessageTime']);
          setAnnouncement('');
        } else {
          setAnnouncement(message);
        }
      } catch (e) {
        // silencioso
      }
    };

    checkLogin();
    loadAnnouncement();

    // Atualização em tempo real com polling leve
    const intervalId = setInterval(loadAnnouncement, 3000);
    return () => clearInterval(intervalId);
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userRA');
    router.replace('/Login');
  };

  if (!ra) {
    return <Text>Carregando...</Text>;
  }

  return (
    <View style={(styles.container)}>
      {announcement ? (
        <View style={styles.announcementBanner}>
          <Text style={styles.announcementTitle}>Mensagem da Administração</Text>
          <Text style={styles.announcementText}>{announcement}</Text>
        </View>
      ) : null}
      <Map 
      style={styles.map} 
      initialRegion={{
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      }}
      >
        <Marker coordinate={coordinatePoints.Eldorado}>
          <Callout style={styles.callout} >
            <View style={styles.calloutItens} >
              <Image source={require('../../assets/images/icon.png')} style={styles.img} />
              <Text style={styles.title} >{coordinatePoints.Eldorado.nome}</Text>
              <Text style={styles.address} >{coordinatePoints.Eldorado.rua}</Text>
            </View>
          </Callout>
        </Marker>
        <Marker coordinate={coordinatePoints.Casa}>
          <Callout style={styles.callout} >
            <View style={styles.calloutItens} >
              <Image source={require('../../assets/images/icon.png')} style={styles.img} />
              <Text style={styles.title} >{coordinatePoints.Casa.nome}</Text>
              <Text style={styles.address} >{coordinatePoints.Casa.rua}</Text>
            </View>
          </Callout>
        </Marker>
      </Map>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callout: {
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  address: {
    fontSize: 14,
  },
  calloutItens: {
    alignItems: 'center',
    position: 'relative',
    padding: 8,
  },
  img: { 
    width: 150,
    height: 150,
    borderRadius: 8,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  announcementBanner: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#2a5298',
  },
  announcementTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2a5298',
    marginBottom: 4,
  },
  announcementText: {
    fontSize: 13,
    color: '#333',
  },
});