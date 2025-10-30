import { Entypo, Feather, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { height } = Dimensions.get('window');

export default function Login() {
  const router = useRouter();
  const [ra, setRA] = useState('08101');
  const [senha, setSenha] = useState('@mobelize123');

  const baseURL = "https://backend-mobilize-transporte.onrender.com";
  const mockUsers = [
    { ra: "12345", senha: "123" },
    { ra: "54321", senha: "321" },
  ];

  async function handleLogin() {
    if (!ra || !senha) {
      return Alert.alert("Atenção", "Preencha RA e senha");
    }

    // const mockUser = mockUsers.find(u => u.ra === ra && u.senha === senha);
    // if (mockUser) {
    //   await AsyncStorage.setItem("userRA", ra);
    //   console.log("Login fake bem-sucedido:", ra);
    //   return router.replace("/(protected)/Home");
    // }

    try {
      const response = await fetch(`${baseURL}/api/login`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ra, senha }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        return Alert.alert("Erro", "Resposta inválida do servidor");
      }

      console.log("Resposta da API:", data);

      if (!response.ok || !data.aluno) {
        return Alert.alert('Erro', data.message || 'RA ou senha inválidos');
      }

      await AsyncStorage.setItem('userRA', data.aluno.ra.toString());
      if (data.token) {
        await AsyncStorage.setItem('token', data.token);
      }

      console.log("Login salvo com sucesso:", data.aluno.ra);
      router.replace('/(protected)/Home');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao fazer login: ' + error.message);
    }
  }

  return (
    <LinearGradient
      colors={['rgba(17,95,140,1)', 'rgba(5,39,80,1)']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* 🔹 fecha teclado ao tocar fora */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <SafeAreaView style={styles.safeArea}>
            {/* Botão de voltar */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Feather name="arrow-left" size={26} color="#fff" />
            </TouchableOpacity>

            {/* Ícone central redondo */}
            <View style={styles.iconWrapper}>
              <FontAwesome5 name="user-circle" size={80} color="#005086" style={styles.profileIcon} />
            </View>

            {/* Card */}
            <View style={styles.card}>
              <Text style={styles.title}>PÁGINA DE LOGIN</Text>

              {/* RA */}
              <View style={styles.inputRow}>
                <Feather name="user" size={24} color="#005086" style={styles.icon} />
                <TextInput
                  placeholder="Digite seu RA..."
                  value={ra}
                  onChangeText={setRA}
                  autoCapitalize="none"
                  keyboardType="numeric"
                  style={styles.input}
                  placeholderTextColor="#777"
                />
              </View>

              {/* Senha */}
              <View style={styles.inputRow}>
                <Entypo name="lock" size={24} color="#005086" style={styles.icon} />
                <TextInput
                  placeholder="Digite sua senha..."
                  value={senha}
                  onChangeText={setSenha}
                  secureTextEntry
                  autoCapitalize="none"
                  style={styles.input}
                  placeholderTextColor="#777"
                />
              </View>

              {/* Botão */}
              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>ENTRAR</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 40,
    zIndex: 10,
  },
  iconWrapper: {
    position: 'absolute',
    top: height * 0.12,
    zIndex: 2,
    backgroundColor: '#fff',
    borderRadius: 60,
    padding: 10,
    elevation: 5,
  },
  profileIcon: {
    resizeMode: 'contain',
  },
  card: {
    marginTop: height * 0.20,
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 1,
  },
  title: {
    fontSize: 22,
    color: '#002c45',
    marginBottom: 24,
    fontFamily: 'LeagueSpartan-Bold',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 18,
    width: '100%',
    zIndex: 0,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  button: {
    backgroundColor: '#005086',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 10,
    borderColor: '#00406d',
    borderWidth: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'LeagueSpartan-Bold',
  },
});
