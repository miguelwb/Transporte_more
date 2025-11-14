import AsyncStorage from '@react-native-async-storage/async-storage';
import { postNotificacao, getNotificacoes } from '../../services/api';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function AdminDashboard() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState(null);

  const baseURL = Platform.OS === 'web'
    ? (process.env.EXPO_PUBLIC_PROXY_URL || 'http://localhost:3001')
    : 'https://backend-mobilize-transporte.onrender.com';

  useEffect(() => {
    loadAdminData();
    loadAnnouncement();
  }, []);

  const loadAdminData = async () => {
    try {
      const userData = await AsyncStorage.getItem('adminUser');
      if (userData) {
        setAdminUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Erro ao carregar dados do admin:', error);
    }
  };

  // Mensagem global do admin
  const [announcement, setAnnouncement] = useState('');
  const [savedAnnouncement, setSavedAnnouncement] = useState('');
  const [saving, setSaving] = useState(false);
  const EXPIRATION_MS = 5 * 60 * 1000; // 5 minutos

  const loadAnnouncement = async () => {
    try {
      const list = await getNotificacoes();
      const normalized = Array.isArray(list) ? list.map((n) => ({
        titulo: n.titulo || n.title || 'Aviso',
        mensagem: n.mensagem || n.message || n.texto || n.body || '',
        createdAt: n.created_at || n.createdAt || null,
      })) : [];
      normalized.sort((a, b) => {
        const ta = a.createdAt ? new Date(String(a.createdAt).replace(' ', 'T')).getTime() : 0;
        const tb = b.createdAt ? new Date(String(b.createdAt).replace(' ', 'T')).getTime() : 0;
        return tb - ta;
      });
      const latest = normalized[0] || null;
      const msg = latest ? latest.mensagem : '';
      setSavedAnnouncement(msg);
      setAnnouncement(msg);
    } catch (error) {
      console.error('Erro ao carregar mensagem do backend:', error);
      setSavedAnnouncement('');
    }
  };

  const saveAnnouncement = async () => {
    if (!announcement.trim()) {
      return Alert.alert('Mensagem vazia', 'Digite uma mensagem antes de publicar.');
    }
    setSaving(true);
    try {
      const trimmed = announcement.trim();
      // Publica como notificação para alcançar todos os usuários
      await postNotificacao({ titulo: 'Mensagem do Admin', mensagem: trimmed, userId: 'all' });
      setSavedAnnouncement(trimmed);
      Alert.alert('Publicado', 'Mensagem publicada para os usuários.');
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error);
      Alert.alert('Erro', 'Falha ao publicar a mensagem.');
    } finally {
      setSaving(false);
    }
  };

  const clearAnnouncement = async () => {
    // No web, a confirmação via Alert com botões não funciona.
    // Remover imediatamente para garantir funcionalidade.
    try {
      await AsyncStorage.multiRemove(['adminMessage', 'adminMessageTime']);
      setSavedAnnouncement('');
      setAnnouncement('');
      Alert.alert('Removida', 'Mensagem removida com sucesso.');
    } catch (error) {
      console.error('Erro ao remover mensagem:', error);
      Alert.alert('Erro', 'Falha ao remover a mensagem.');
    }
  };


  const handleLogout = () => {
    Alert.alert(
      'Sair do Painel',
      'Deseja realmente sair do painel administrativo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('adminUser');
            router.replace('/admin-login');
          }
        }
      ]
    );
  };

  // Removido: itens de menu antigos. Foco apenas na mensagem aos usuários.


  // Removido: componente de menu.

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Bem-vindo,</Text>
            <Text style={styles.adminName}>{adminUser?.username || 'Administrador'}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <FontAwesome5 name="sign-out-alt" size={20} color="#fff" />
          </TouchableOpacity>
        </View>


        {/* Editor de Mensagem para Usuários */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Mensagem para Usuários</Text>
          <View style={styles.announcementCard}>
            <Text style={styles.announcementLabel}>Mensagem atual:</Text>
            <Text style={styles.announcementPreview}>
              {savedAnnouncement ? savedAnnouncement : 'Nenhuma mensagem publicada'}
            </Text>

            <Text style={[styles.announcementLabel, { marginTop: 12 }]}>Editar mensagem:</Text>
            <View style={styles.inputArea}>
              <TextInput
                style={styles.inputText}
                multiline
                placeholder="Escreva a mensagem que deseja enviar aos usuários..."
                placeholderTextColor="#999"
                value={announcement}
                onChangeText={setAnnouncement}
              />
            </View>
            <Text style={{ fontSize: 12, color: '#666', marginTop: 6 }}>
              A mensagem expira automaticamente em 5 minutos.
            </Text>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.publishBtn]}
                onPress={saveAnnouncement}
                disabled={saving}
              >
                <FontAwesome5 name="paper-plane" size={14} color="white" />
                <Text style={styles.actionBtnText}>{saving ? 'Publicando...' : 'Publicar'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.clearBtn]}
                onPress={clearAnnouncement}
              >
                <FontAwesome5 name="trash" size={14} color="white" />
                <Text style={styles.actionBtnText}>Remover</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Gestão de Transporte Escolar */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Gestão de Transporte Escolar</Text>
          <View style={styles.grid}> 
            <TouchableOpacity style={styles.menuCard} onPress={() => router.push('/(admin)/points')}>
              <MaterialIcons name="place" size={28} color="#2a5298" />
              <Text style={styles.menuCardTitle}>Pontos de Embarque</Text>
              <Text style={styles.menuCardDesc}>Adicionar, editar e excluir pontos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuCard} onPress={() => router.push('/(admin)/routes')}>
              <MaterialIcons name="route" size={28} color="#2a5298" />
              <Text style={styles.menuCardTitle}>Rotas Personalizadas</Text>
              <Text style={styles.menuCardDesc}>Criar e organizar rotas escolares</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuCard} onPress={() => router.push('/(admin)/notifications')}>
              <MaterialIcons name="notifications" size={28} color="#2a5298" />
              <Text style={styles.menuCardTitle}>Notificações</Text>
              <Text style={styles.menuCardDesc}>Enviar alertas e avisos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuCard} onPress={() => router.push('/(admin)/reports')}>
              <MaterialIcons name="assessment" size={28} color="#2a5298" />
              <Text style={styles.menuCardTitle}>Relatórios</Text>
              <Text style={styles.menuCardDesc}>Ver métricas e estatísticas</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Informações do Sistema */}
        <View style={styles.systemInfo}>
          <Text style={styles.sectionTitle}>Informações do Sistema</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>Versão: 1.0.0</Text>
            <Text style={styles.infoText}>Último login: {new Date().toLocaleString('pt-BR')}</Text>
            <Text style={styles.infoText}>Plataforma: {Platform.OS}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2a5298',
    padding: 20,
    paddingTop: 0,
  },
  welcomeText: {
    color: 'white',
    fontSize: 16,
  },
  adminName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 10,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  menuContainer: {
    padding: 20,
    paddingTop: 0,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  menuCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '48%',
  },
  menuCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 6,
  },
  menuCardDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  announcementCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  announcementLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  announcementPreview: {
    fontSize: 14,
    color: '#333',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 10,
  },
  inputArea: {
    minHeight: 80,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    padding: 10,
    marginTop: 8,
  },
  inputText: {
    fontSize: 14,
    color: '#333',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  actionBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  publishBtn: {
    backgroundColor: '#2a5298',
  },
  clearBtn: {
    backgroundColor: '#F44336',
  },
  systemInfo: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 40,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});