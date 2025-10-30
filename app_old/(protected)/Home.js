import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Map, { Callout, Marker } from 'react-native-maps';

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

    checkLogin();
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
      <Text> Bem-vindo</Text>
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
    width: '50%',
    height: '50%',
  },
});