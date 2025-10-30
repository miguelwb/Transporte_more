import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

export default function Configuracoes() {
  const [notificacoes, setNotificacoes] = useState(true);
  const [temaEscuro, setTemaEscuro] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configurações</Text>

      <View style={styles.primaryoption}>
        <Image
          source={require('../../assets/images/usuario.png')}
          style={{ width: 90, height: 90, borderRadius: 50, marginBottom: 0, borderColor: '#093f5d', borderWidth: 3 }}
        />
        <Text style={styles.label}>Alterar Foto de Perfil</Text>
      </View>
      <View style={styles.option}>
        <Text style={styles.label}>Notificações</Text>
        <Switch
          value={notificacoes}
          onValueChange={setNotificacoes}
          thumbColor={notificacoes ? '#115f8c' : '#ccc'}
        />
      </View>
      <View style={styles.option}>
        <Text style={styles.label}>Alterar Tema</Text>
        <Switch
          value={temaEscuro}
          onValueChange={setTemaEscuro}
          thumbColor={temaEscuro ? '#115f8c' : '#ccc'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#094d73',
    width: '80%',
    height: '90%',
    alignSelf: 'center',
    borderRadius: 10,
    marginTop: 30,
    marginBottom: 80,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff',
    backgroundColor: '#9cb6c2',
    width: '70%',
    alignSelf: 'center',
    borderRadius: 50,
    borderWidth: 2,
    bordercolor: '#093f5d',
    fontFamily: 'LeagueSpartan-Bold',
    fontWeight: 'bold',
    padding: 8,
  },
  primaryoption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  label: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'LeagueSpartan-Bold',
    fontWeight: 'bold',
    backgroundColor: '#093f5d',
    padding: 8,
    borderRadius: 50,
  },
});
