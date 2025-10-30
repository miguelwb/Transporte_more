import { Entypo, Feather, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { height } = Dimensions.get('window');

export default function Register() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    ra: "",
    senha: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleSubmit = async () => {
    if (!form.nome || !form.email || !form.senha || !form.ra) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    if (!validateEmail(form.email)) {
      Alert.alert("Erro", "Email inválido.");
      return;
    }

    if (form.senha.length < 6) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setIsLoading(true);

    try {
      const alunoPayload = {
        nome: form.nome,
        email: form.email,
        senha: form.senha,
        ra: form.ra.replace(/\D/g, ""),
      };

      const response = await fetch("https://backend-mobilize-transporte.onrender.com/api/alunos/adicionar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alunoPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log('Erro da API:', data);
        Alert.alert("Erro no cadastro", data.message || "Tente novamente.");
        return;
      }

      Alert.alert("Sucesso", "Cadastro realizado com sucesso!");
      router.back();

    } catch (error) {
      console.error("Erro:", error);
      Alert.alert("Erro", "Erro no servidor. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

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
        {/* 🔹 Fecha teclado ao clicar fora */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <SafeAreaView style={styles.safeArea}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Feather name="arrow-left" size={26} color="#fff" />
            </TouchableOpacity>

            <View style={styles.iconWrapper}>
              <FontAwesome5 name="user-circle" size={80} color="#005086" style={styles.profileIcon} />
            </View>

            <View style={styles.card}>
              <Text style={styles.title}>CADASTRO DE ALUNO</Text>

              {/* Nome */}
              <View style={styles.inputRow}>
                <Feather name="user" size={24} color="#005086" style={styles.icon} />
                <TextInput
                  placeholder="Digite seu nome completo..."
                  placeholderTextColor="#777"
                  style={styles.input}
                  value={form.nome}
                  onChangeText={(text) => handleChange("nome", text)}
                />
              </View>

              {/* Email */}
              <View style={styles.inputRow}>
                <MaterialIcons name="email" size={24} color="#005086" style={styles.icon} />
                <TextInput
                  placeholder="Digite seu email..."
                  placeholderTextColor="#777"
                  style={styles.input}
                  value={form.email}
                  onChangeText={(text) => handleChange("email", text)}
                  autoCapitalize="none"
                />
              </View>

              {/* RA */}
              <View style={styles.inputRow}>
                <FontAwesome5 name="chalkboard-teacher" size={24} color="#005086" style={styles.icon} />
                <TextInput
                  placeholder="Insira seu RA..."
                  placeholderTextColor="#777"
                  style={styles.input}
                  value={form.ra}
                  onChangeText={(text) => handleChange("ra", text)}
                  keyboardType="numeric"
                />
              </View>

              {/* Senha */}
              <View style={styles.inputRow}>
                <Entypo name="lock" size={24} color="#005086" style={styles.icon} />
                <TextInput
                  placeholder="Insira sua senha..."
                  placeholderTextColor="#777"
                  secureTextEntry
                  style={styles.input}
                  value={form.senha}
                  onChangeText={(text) => handleChange("senha", text)}
                />
              </View>

              {/* Botão */}
              <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>
                  {isLoading ? "Cadastrando..." : "CADASTRAR"}
                </Text>
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
