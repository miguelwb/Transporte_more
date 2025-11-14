import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { getNotificacoes } from '../../services/api';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity, Modal, FlatList, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Map, { Callout, Marker } from '../../components/MapView';
import { useTransport } from '../../contexts/TransportContext';
import BottomSheet from '../../components/BottomSheet';

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
  const { points } = useTransport();
  const [ra, setRA] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showQuickSheet, setShowQuickSheet] = useState(true);
  const router = useRouter();

  // Busca notificações e atualiza banner/unread sem polling
  const loadAnnouncement = async () => {
    try {
      console.log('[poll] carregando notificações...');
      const list = await getNotificacoes();
      const normalized = Array.isArray(list) ? list.map((n) => {
        const createdRaw = n.createdAt || n.created_at || n.timestamp || n.data || n.date || null;
        let createdISO = null;
        if (createdRaw) {
          const rawStr = String(createdRaw);
          const isoCandidate = rawStr.includes('T') ? rawStr : rawStr.replace(' ', 'T');
          const d = new Date(isoCandidate);
          createdISO = isNaN(d.getTime()) ? null : d.toISOString();
        }
        return {
          id: n.id || n._id || String(Math.random()),
          titulo: n.titulo || n.title || 'Aviso',
          mensagem: n.mensagem || n.message || n.texto || n.body || '',
          createdAt: createdISO,
        };
      }) : [];
      normalized.sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });
      setNotifications(normalized);
      // Inicializa last_seen no primeiro uso para não contar todo backend
      const lastSeenRaw = await AsyncStorage.getItem('notifications_last_seen');
      let lastSeen;
      if (!lastSeenRaw) {
        const latestTs = normalized[0]?.createdAt ? new Date(normalized[0].createdAt).getTime() : Date.now();
        await AsyncStorage.setItem('notifications_last_seen', String(latestTs));
        lastSeen = latestTs;
        console.log('[poll] inicializando last_seen:', new Date(latestTs).toLocaleString());
      } else {
        lastSeen = Number(lastSeenRaw);
      }
      const count = normalized.filter((n) => {
        const ts = n.createdAt ? new Date(n.createdAt).getTime() : 0;
        return ts > lastSeen;
      }).length;
      setUnreadCount(count);
      const ts = new Date().toLocaleTimeString();
      console.log(`[poll] atualizado ${ts} | itens: ${normalized.length} | não lidas: ${count}`);
    } catch (e) {
      console.log('[poll] falha ao carregar notificações:', e?.message || String(e));
    }
  };

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
    loadAnnouncement();
    // Atualização periódica (~5s)
    const intervalId = setInterval(loadAnnouncement, 5000);
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
      <View style={styles.notifButtonWrapper}>
        <TouchableOpacity style={styles.notifButton} onPress={() => setShowNotifModal(true)}>
          <Ionicons name="notifications-outline" size={24} color="#2a5298" />
          {unreadCount > 0 ? (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>{unreadCount}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>
      {/* BottomSheet visível por padrão no snap mínimo */}
      {/* Overlay de coordenadas removido conforme solicitado */}

      {/* Painel de últimas notificações removido conforme solicitado */}

      <Map 
      style={styles.map} 
      initialRegion={{
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      }}
      >
        {points && points.length > 0 ? (
          points.map((p) => (
            <Marker key={p.id} coordinate={{ latitude: p.latitude, longitude: p.longitude }}>
              <Callout style={styles.callout}>
                <View style={styles.calloutItens}>
                  <Image source={require('../../assets/images/icon.png')} style={styles.img} />
                  <Text style={styles.title}>{p.nome}</Text>
                  <Text style={styles.address}>{p.endereco}</Text>
                  <Text style={styles.address}>Alunos: {Number(p.alunosCount) || 0}</Text>
                  <Text style={styles.address}>Coleta: {p.horarioColeta}</Text>
                </View>
              </Callout>
            </Marker>
          ))
        ) : (
          <>
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
          </>
        )}
      </Map>
      <Modal visible={showNotifModal} transparent animationType="slide" onRequestClose={() => setShowNotifModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Notificações ({unreadCount} não lidas)</Text>
            {notifications.length === 0 ? (
              <Text style={styles.modalEmpty}>Nenhuma notificação.</Text>
            ) : (
              <FlatList
                data={notifications.slice(0, 3)}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.modalItem}>
                    <Text style={styles.modalItemTitle}>{item.titulo}</Text>
                    <Text style={styles.modalItemBody}>{item.mensagem}</Text>
                  </View>
                )}
              />
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalPrimary]} onPress={async () => {
                const now = Date.now();
                await AsyncStorage.setItem('notifications_last_seen', String(now));
                setUnreadCount(0);
                setShowNotifModal(false);
              }}>
                <Text style={styles.modalBtnText}>Marcar como vistas</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalSecondary]} onPress={() => setShowNotifModal(false)}>
                <Text style={styles.modalBtnText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* BottomSheet puxável adicional (não substitui o modal de notificações) */}
      <BottomSheet
        visible={showQuickSheet}
        snapPoints={[76, 380, 560]}
        initialIndex={0}
        backdropOpacity={0}
        closeOnBackdropPress={false}
        closeOnDragDown={false}
      >
        {/* Barra superior azul com busca e avatar, como no mock */}
        <View style={styles.sheetTopBar}>
          <TextInput
            placeholder="Buscar"
            placeholderTextColor="#d6e6ef"
            style={styles.sheetSearch}
          />
          <View style={styles.sheetAvatarBtn}>
            <Ionicons name="person" size={20} color="#cfe0ea" />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.sheetSectionTitle}>Para você</Text>
          <View style={styles.sheetGridRow}>
            <TouchableOpacity style={styles.sheetGridItem} onPress={() => { setShowQuickSheet(false); router.push('/(admin)/dashboard'); }}>
              <Ionicons name="time-outline" size={22} color="#2a5298" />
              <Text style={styles.sheetGridText}>Horários</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetGridItem} onPress={() => { setShowQuickSheet(false); router.push('/(admin)/points'); }}>
              <Ionicons name="location-outline" size={22} color="#2a5298" />
              <Text style={styles.sheetGridText}>Pontos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetGridItem} onPress={() => { setShowQuickSheet(false); router.push('/(admin)/routes'); }}>
              <Ionicons name="map-outline" size={22} color="#2a5298" />
              <Text style={styles.sheetGridText}>Rotas</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sheetSectionTitle, { marginTop: 12 }]}>Sua Rota</Text>
          {(points && points.length > 0) ? (
            points.slice(0, 3).map((p) => (
              <View key={`sheet-${p.id}`} style={styles.sheetRouteItem}>
                <Image source={require('../../assets/images/icon.png')} style={styles.sheetRouteImg} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.sheetRouteTitle}>{p.endereco}</Text>
                  <Text style={styles.sheetRouteSub}>Motorista: José(fictício)</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.sheetRouteItem}>
              <Image source={require('../../assets/images/icon.png')} style={styles.sheetRouteImg} />
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetRouteTitle}>Exemplo de ponto</Text>
                <Text style={styles.sheetRouteSub}>Motorista: José(fictício)</Text>
              </View>
            </View>
          )}

          <View style={styles.sheetCard}>
            <Ionicons name="id-card-outline" size={22} color="#fff" />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.sheetCardTitle}>Carteirinha de Transporte Escolar</Text>
              <Text style={styles.sheetCardSub}>clique aqui para acessar</Text>
            </View>
          </View>

          <View style={[styles.sheetGridRow, { marginTop: 10 }]}>
            <TouchableOpacity style={styles.sheetAction} onPress={() => { setShowQuickSheet(false); router.push('/(protected)/edit'); }}>
              <Ionicons name="person-circle-outline" size={22} color="#2a5298" />
              <Text style={styles.sheetActionText}>Editar perfil</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.sheetAction, { backgroundColor: '#fdecea', borderColor: '#f5c2c2' }]} onPress={() => { setShowQuickSheet(false); handleLogout(); }}>
              <Ionicons name="log-out-outline" size={22} color="#c62828" />
              <Text style={[styles.sheetActionText, { color: '#c62828' }]}>Sair</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </BottomSheet>
      
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
  sheetTopBar: {
    backgroundColor: '#0f5f8c',
    marginHorizontal: -12,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sheetSearch: {
    flex: 1,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#2a76a1',
    paddingHorizontal: 12,
    color: '#eaf4f9',
  },
  sheetAvatarBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#2a76a1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetSectionTitle: {
    marginTop: 10,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#eaf4f9',
    backgroundColor: '#0f5f8c',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sheetTitle: {
    marginTop: 6,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2a5298',
  },
  sheetGridRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  sheetGridItem: {
    flex: 1,
    backgroundColor: '#e8f0fe',
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#cfe0ea',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  sheetGridText: {
    fontSize: 13,
    color: '#2a5298',
    fontWeight: '600',
  },
  sheetAction: {
    flex: 1,
    backgroundColor: '#E8F0FE',
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#B6CCFE',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flexDirection: 'row',
  },
  sheetActionText: {
    fontSize: 13,
    color: '#2a5298',
    fontWeight: '600',
  },
  sheetRouteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f0fe',
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#cfe0ea',
    padding: 10,
    marginBottom: 8,
  },
  sheetRouteImg: {
    width: 42,
    height: 42,
    borderRadius: 8,
    marginRight: 10,
  },
  sheetRouteTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
  sheetRouteSub: {
    fontSize: 12,
    color: '#666',
  },
  sheetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a5298',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  sheetCardTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  sheetCardSub: {
    color: '#e0e0e0',
    fontSize: 12,
  },
  
  
  /* painel removido */
  /* notifPanel: {
    position: 'absolute',
    top: 92,
    left: 12,
    right: 12,
    zIndex: 9,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  notifPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notifPanelTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  notifPanelUpdated: {
    fontSize: 11,
    color: '#666',
    marginLeft: 8,
  },
  notifPanelAction: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2a5298',
  },
  notifItem: {
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#eee',
  },
  notifItemTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  notifItemBody: {
    fontSize: 12,
    color: '#444',
  }, */
  
  notifButtonWrapper: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 20,
  },
  notifButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  notifBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFEB3B',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E0C200',
  },
  notifBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2a5298',
    marginBottom: 8,
  },
  modalEmpty: {
    color: '#666',
  },
  modalItem: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  modalItemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  modalItemBody: {
    fontSize: 13,
    color: '#444',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  modalBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalPrimary: {
    backgroundColor: '#2a5298',
  },
  modalSecondary: {
    backgroundColor: '#9E9E9E',
  },
  modalBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});