import { Entypo, Feather, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
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
  const [senha, setSenha] = useState('@mobilize123');
  const raRef = useRef(null);
  const senhaRef = useRef(null);

  const baseURL = 'https://backend-mobilize-transporte.onrender.com';

  const [isLoading, setLoading] = useState(false);

  async function handleLogin() {
    if (!ra || !senha) {
      return Alert.alert("Atenção", "Preencha RA e Senha");
    }

    // Acesso rápido ao painel admin usando o mesmo formulário
    if (ra?.toLowerCase() === 'admin' && senha === 'admin123') {
      try {
        await AsyncStorage.setItem('adminUser', JSON.stringify({
          id: 1,
          username: 'admin',
          role: 'administrator',
          loginTime: new Date().toISOString()
        }));
        return router.replace('/(admin)/dashboard');
      } catch (e) {
        console.error('Erro ao salvar sessão admin:', e);
        return Alert.alert('Erro', 'Falha ao criar sessão do administrador');
      }
    }
    setLoading(true);
    try {
      const response = await fetch(`${baseURL}/api/login`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ra, senha }),
      });

      // console.log(response);

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
      router.replace('/(protected)/home');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao fazer login: ' + (error?.message || 'erro desconhecido'));
    } finally {
      setLoading(false);
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
          <SafeAreaView style={styles.safeArea}>
            {/* Botão de voltar */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/') }>
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
              <TouchableOpacity
                style={styles.inputRow}
                activeOpacity={0.9}
                onPress={() => raRef.current?.focus()}
              >
                <Feather name="user" size={24} color="#005086" style={styles.icon} />
              <TextInput
                  placeholder="Digite seu RA..."
                  value={ra}
                  onChangeText={setRA}
                  autoCapitalize="none"
                  keyboardType="default"
                  style={styles.input}
                  placeholderTextColor="#777"
                  ref={raRef}
                />
              </TouchableOpacity>

              {/* Senha */}
              <TouchableOpacity
                style={styles.inputRow}
                activeOpacity={0.9}
                onPress={() => senhaRef.current?.focus()}
              >
                <Entypo name="lock" size={24} color="#005086" style={styles.icon} />
                <TextInput
                  placeholder="Digite sua senha..."
                  value={senha}
                  onChangeText={setSenha}
                  secureTextEntry
                  autoCapitalize="none"
                  style={styles.input}
                  placeholderTextColor="#777"
                  ref={senhaRef}
                />
              </TouchableOpacity>

              {/* Botão */}
              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>
                  {isLoading ? 'Carregando...' : 'ENTRAR'}
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
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
