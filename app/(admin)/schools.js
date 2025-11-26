import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Map, { Marker } from '../../components/MapView';
import { useTransport } from '../../contexts/TransportContext';

export default function SchoolsAdmin() {
  const { schools, addSchool, removeSchool, updateSchool, refetchSchools } = useTransport();
  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isSaving, setSaving] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: -21.874997619625923,
    longitude: -51.844490086689184,
    latitudeDelta: 0.03,
    longitudeDelta: 0.03,
  });

  useEffect(() => { refetchSchools(); }, []);

  const clearForm = () => {
    setNome('');
    setEndereco('');
    setLatitude('');
    setLongitude('');
  };

  const handleCreate = async () => {
    if (!nome.trim()) return Alert.alert('Campos obrigatórios', 'Informe o nome da escola.');
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return Alert.alert('Coordenadas inválidas', 'Latitude/Longitude devem ser números válidos.');
    }
    setSaving(true);
    try {
      await addSchool({ nome: nome.trim(), endereco: endereco.trim(), latitude: lat, longitude: lng });
      Alert.alert('Sucesso', 'Escola criada com sucesso!');
      clearForm();
    } catch (e) {
      Alert.alert('Erro', e?.message || 'Falha ao criar escola.');
    } finally {
      setSaving(false);
    }
  };

  const handleMapPress = (e) => {
    const coord = e?.nativeEvent?.coordinate;
    if (!coord) return;
    setLatitude(String(coord.latitude));
    setLongitude(String(coord.longitude));
    setMapRegion((r) => ({ ...r, latitude: coord.latitude, longitude: coord.longitude }));
  };

  const renderItem = ({ item }) => (
    <View style={styles.schoolCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.schoolTitle}>{item.nome}</Text>
        <Text style={styles.schoolText}>{item.endereco || 'Sem endereço'}</Text>
        {/* Coordenadas ocultadas conforme solicitado */}
      </View>
      <View style={styles.actionsRow}>
        <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => {
          setNome(item.nome || '');
          setEndereco(item.endereco || '');
          setLatitude(String(item.latitude || ''));
          setLongitude(String(item.longitude || ''));
        }}>
          <Text style={styles.actionText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.removeBtn]} onPress={async () => {
          try { await removeSchool(item.id); } catch {}
        }}>
          <Text style={styles.actionText}>Remover</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Gestão de Escolas</Text>
      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Cadastrar nova escola</Text>
        <TextInput style={styles.input} placeholder="Nome da escola" value={nome} onChangeText={setNome} />
        <TextInput style={styles.input} placeholder="Endereço (opcional)" value={endereco} onChangeText={setEndereco} />
        <View style={styles.mapBox}>
          <Map
            style={{ width: '100%', height: '100%' }}
            initialRegion={mapRegion}
            onPress={handleMapPress}
          >
            {latitude && longitude ? (
              <Marker coordinate={{ latitude: Number(latitude), longitude: Number(longitude) }} />
            ) : null}
            {Array.isArray(schools) && schools.length > 0 && (
              schools.map((s) => (
                <Marker key={`school-${s.id}`} coordinate={{ latitude: s.latitude, longitude: s.longitude }} />
              ))
            )}
          </Map>
          <Text style={styles.mapHint}>Clique no mapa para definir a localização.</Text>
        </View>
        <View style={styles.row}>
          <TextInput style={[styles.input, styles.half]} placeholder="Latitude" keyboardType="numeric" value={latitude} onChangeText={setLatitude} />
          <TextInput style={[styles.input, styles.half]} placeholder="Longitude" keyboardType="numeric" value={longitude} onChangeText={setLongitude} />
        </View>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.actionBtn, styles.primaryBtn]} onPress={handleCreate} disabled={isSaving}>
            <Text style={styles.actionText}>{isSaving ? 'Salvando...' : 'Salvar'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.secondaryBtn]} onPress={clearForm}>
            <Text style={styles.actionText}>Limpar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Escolas cadastradas</Text>
      {(!schools || schools.length === 0) ? (
        <Text style={styles.emptyText}>Nenhuma escola cadastrada ainda.</Text>
      ) : (
        <FlatList data={schools} keyExtractor={(i) => String(i.id)} renderItem={renderItem} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  form: { backgroundColor: '#fff', borderRadius: 10, padding: 12, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  input: { backgroundColor: '#ffffff', color: '#111', paddingHorizontal: 10, paddingVertical: 10, borderRadius: 8, marginBottom: 8, fontSize: 14 },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  primaryBtn: { backgroundColor: '#2a5298' },
  secondaryBtn: { backgroundColor: '#888' },
  editBtn: { backgroundColor: '#2a5298' },
  removeBtn: { backgroundColor: '#F44336' },
  actionText: { color: '#fff', fontWeight: 'bold' },
  schoolCard: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 10, elevation: 1 },
  schoolTitle: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  schoolText: { color: '#555', marginTop: 2 },
  emptyText: { textAlign: 'center', color: '#666', marginTop: 10 },
  mapBox: { height: 220, borderRadius: 10, overflow: 'hidden', marginBottom: 8 },
  mapHint: { position: 'absolute', bottom: 6, left: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 6, paddingVertical: 4, paddingHorizontal: 8, fontSize: 12, color: '#333' },
});
