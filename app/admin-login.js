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

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');

  const baseURL = Platform.OS === 'web'
    ? (process.env.EXPO_PUBLIC_PROXY_URL || 'http://localhost:3001')
    : 'https://backend-mobilize-transporte.onrender.com';

  const [isLoading, setLoading] = useState(false);

  // Credenciais de admin para desenvolvimento
  const adminCredentials = {
    username: 'admin',
    password: 'admin123'
  };

  async function handleAdminLogin() {
    if (!username || !password) {
      return Alert.alert("Atenção", "Preencha usuário e senha");
    }

    setLoading(true);
    
    try {
      // Verificação local das credenciais de admin
      if (username === adminCredentials.username && password === adminCredentials.password) {
        // Salvar dados do admin no AsyncStorage
        await AsyncStorage.setItem('adminUser', JSON.stringify({
          id: 1,
          username: 'admin',
          role: 'administrator',
          loginTime: new Date().toISOString()
        }));
        
        console.log("Login admin bem-sucedido");
        router.replace("/(admin)/dashboard");
      } else {
        Alert.alert("Erro", "Credenciais de administrador inválidas");
      }
    } catch (error) {
      console.error("Erro no login admin:", error);
      Alert.alert("Erro", "Falha na autenticação do administrador");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <LinearGradient
            colors={['#1e3c72', '#2a5298']}
            style={styles.gradient}
          >
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <View style={styles.logo}>
                  <FontAwesome5 name="user-shield" size={40} color="white" />
                </View>
              </View>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.title}>PAINEL ADMINISTRATIVO</Text>
              
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <FontAwesome5 name="user" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Usuário"
                    placeholderTextColor="#999"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Feather name="lock" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Senha"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={handleAdminLogin}
                disabled={isLoading}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? 'Carregando...' : 'ACESSAR PAINEL'}
                </Text>
              </TouchableOpacity>

              <View style={styles.credentialsInfo}>
                <Text style={styles.credentialsText}>Credenciais padrão:</Text>
                <Text style={styles.credentialsText}>Usuário: admin</Text>
                <Text style={styles.credentialsText}>Senha: admin123</Text>
              </View>
            </View>
          </LinearGradient>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 40,
  },
  backButton: {
    padding: 10,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    marginRight: 44, // Compensar o botão de voltar
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 30,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#2a5298',
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  loginButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  credentialsInfo: {
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2a5298',
  },
  credentialsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 2,
  },
});