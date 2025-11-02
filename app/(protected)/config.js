import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserData } from '../../contexts/UserDataContext';
import { Switch } from 'react-native';

export default function Configuracoes() {
  const [notificacoes, setNotificacoes] = useState(false);
  const [temaEscuro, setTemaEscuro] = useState(false);
  const { updateTheme, updateProfileImage } = useUserData();
  const [profileImage, setProfileImage] = useState(require('../../assets/images/usuario.png'));

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Carregar configurações salvas
        const savedNotificacoes = await AsyncStorage.getItem('userNotificacoes');
        const savedTema = await AsyncStorage.getItem('userTema');
        const savedImageUri = await AsyncStorage.getItem('userProfileImage');
        
        if (savedNotificacoes !== null) setNotificacoes(JSON.parse(savedNotificacoes));
        if (savedTema !== null) setTemaEscuro(JSON.parse(savedTema));
        if (savedImageUri) setProfileImage({ uri: savedImageUri });
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    };
    
    loadSettings();
  }, []);

  const handleChangeProfileImage = async () => {
    // Código já implementado acima, removendo duplicação
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permissão necessária', 'É necessário permitir acesso à galeria para alterar a foto de perfil.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setProfileImage({ uri: imageUri });
      await updateProfileImage(imageUri);
      Alert.alert('Sucesso', 'Foto de perfil atualizada com sucesso!');
    }
  };

  const handleNotificacoesChange = async (value) => {
    setNotificacoes(value);
    try {
      await AsyncStorage.setItem('userNotificacoes', JSON.stringify(value));
      Alert.alert('Sucesso', value ? 'Notificações ativadas!' : 'Notificações desativadas!');
    } catch (error) {
      console.error('Erro ao salvar configuração de notificações:', error);
    }
  };

  const handleTemaChange = async (value) => {
    setTemaEscuro(value);
    try {
      await AsyncStorage.setItem('userTema', JSON.stringify(value));
      await updateTheme(value ? 'dark' : 'light');
      Alert.alert('Sucesso', value ? 'Tema escuro ativado!' : 'Tema claro ativado!');
    } catch (error) {
      console.error('Erro ao salvar configuração de tema:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configurações</Text>

      <TouchableOpacity style={styles.primaryoption} onPress={handleChangeProfileImage}>
        <Image
          source={profileImage}
          style={{ width: 90, height: 90, borderRadius: 50, marginBottom: 0, borderColor: '#093f5d', borderWidth: 3 }}
        />
        <Text style={styles.label}>Alterar Foto de Perfil</Text>
      </TouchableOpacity>
      <View style={styles.option}>
        <Text style={styles.label}>Notificações</Text>
        <Switch
          value={notificacoes}
          onValueChange={handleNotificacoesChange}
          thumbColor={notificacoes ? '#115f8c' : '#ccc'}
        />
      </View>
      <View style={styles.option}>
        <Text style={styles.label}>Alterar Tema</Text>
        <Switch
          value={temaEscuro}
          onValueChange={handleTemaChange}
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
    borderColor: '#093f5d',
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
