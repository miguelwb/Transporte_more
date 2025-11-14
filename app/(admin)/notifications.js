import React, { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import { postNotificacao } from '../../services/api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function NotificationsAdmin() {
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const req = await Notifications.requestPermissionsAsync();
        setPermissionGranted(req.status === 'granted');
      } else {
        setPermissionGranted(true);
      }
    })();
  }, []);

  const sendNotification = async (title, body) => {
    try {
      // Publica no backend para todos os usuários
      await postNotificacao({ titulo: title, mensagem: body, userId: 'all', lido: false });

      // Fallback local: agendar push quando disponível
      if (Platform.OS !== 'web') {
        try {
          await Notifications.scheduleNotificationAsync({
            content: { title, body },
            trigger: { seconds: 2 },
          });
        } catch {}
      }
      Alert.alert('Sucesso', 'Notificação publicada para todos os usuários.');
    } catch (e) {
      Alert.alert('Erro', e?.message || 'Falha ao enviar notificação.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Notificações e Alertas</Text>
      <Text style={styles.infoText}>
        Envie notificações para informar sobre mudanças nas rotas, atrasos e atualizações importantes.
      </Text>

      {!permissionGranted && Platform.OS !== 'web' ? (
        <Text style={styles.warnText}>Permissão de notificação não concedida. As notificações podem não funcionar.</Text>
      ) : null}

      <View style={styles.actionsGroup}>
        <TouchableOpacity style={[styles.actionBtn, styles.primaryBtn]} onPress={() => sendNotification('Mudança na Rota', 'Sua rota foi atualizada. Verifique o aplicativo.')}> 
          <Text style={styles.actionText}>Avisar mudança de rota</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.primaryBtn]} onPress={() => sendNotification('Atraso no Transporte', 'Houve um atraso no horário de transporte.')}>
          <Text style={styles.actionText}>Avisar atraso</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.primaryBtn]} onPress={() => sendNotification('Atualização Importante', 'Há uma atualização importante sobre a rota escolar.')}>
          <Text style={styles.actionText}>Enviar atualização importante</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.infoText, { marginTop: 16 }]}>No ambiente web, as notificações aparecerão como alertas.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  infoText: { color: '#555' },
  warnText: { color: '#F44336', marginTop: 8 },
  actionsGroup: { marginTop: 12, gap: 8 },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 },
  primaryBtn: { backgroundColor: '#2a5298' },
  actionText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
});