import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useTransport } from '../../contexts/TransportContext';
import Map, { Marker } from '../../components/MapView';

export default function ManagePoints() {
  const { points, addPoint, updatePoint, removePoint } = useTransport();
  const [form, setForm] = useState({
    nome: '',
    endereco: '',
    latitude: '',
    longitude: '',
    alunosCount: '',
    horarioColeta: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: -21.874997619625923,
    longitude: -51.844490086689184,
    latitudeDelta: 0.03,
    longitudeDelta: 0.03,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const isFormValid = useMemo(() => {
    return (
      form.nome.trim() &&
      form.endereco.trim() &&
      form.latitude !== '' &&
      form.longitude !== '' &&
      form.horarioColeta.trim() !== ''
    );
  }, [form]);

  const resetForm = () => {
    setForm({ nome: '', endereco: '', latitude: '', longitude: '', alunosCount: '', horarioColeta: '' });
    setEditingId(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSubmit = async () => {
    if (!isFormValid) {
      Alert.alert('Campos obrigatórios', 'Preencha todos os campos necessários.');
      return;
    }
    const payload = {
      nome: form.nome.trim(),
      endereco: form.endereco.trim(),
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      alunosCount: Number(form.alunosCount || 0),
      horarioColeta: form.horarioColeta.trim(),
    };
    if (editingId) {
      await updatePoint(editingId, payload);
      Alert.alert('Atualizado', 'Ponto atualizado com sucesso.');
    } else {
      await addPoint(payload);
      Alert.alert('Adicionado', 'Ponto adicionado com sucesso.');
    }
    resetForm();
  };

  const handleEdit = (point) => {
    setEditingId(point.id);
    setForm({
      nome: point.nome || '',
      endereco: point.endereco || '',
      latitude: String(point.latitude ?? ''),
      longitude: String(point.longitude ?? ''),
      alunosCount: String(point.alunosCount ?? ''),
      horarioColeta: point.horarioColeta || '',
    });
    if (point.latitude && point.longitude) {
      setMapRegion((r) => ({ ...r, latitude: point.latitude, longitude: point.longitude }));
    }
  };

  const handleRemove = (id) => {
    Alert.alert('Remover Ponto', 'Tem certeza que deseja remover este ponto?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: async () => { await removePoint(id); } },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.pointCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.pointTitle}>{item.nome}</Text>
        <Text style={styles.pointText}>Endereço: {item.endereco}</Text>
        <Text style={styles.pointText}>Alunos: {item.alunosCount ?? 0}</Text>
        <Text style={styles.pointText}>Coleta: {item.horarioColeta}</Text>
        <Text style={styles.pointText}>Lat: {item.latitude} | Lng: {item.longitude}</Text>
      </View>
      <View style={styles.actionsRow}>
        <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => handleEdit(item)}>
          <Text style={styles.actionText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.removeBtn]} onPress={() => handleRemove(item.id)}>
          <Text style={styles.actionText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleMapPress = (e) => {
    // Apenas no mobile, o MapView nativo fornece nativeEvent.coordinate
    const coord = e?.nativeEvent?.coordinate;
    if (!coord) return;
    setForm((f) => ({ ...f, latitude: String(coord.latitude), longitude: String(coord.longitude) }));
    setMapRegion((r) => ({ ...r, latitude: coord.latitude, longitude: coord.longitude }));
  };

  const handleSearch = async () => {
    const q = searchQuery.trim();
    if (!q) return;
    try {
      setSearchLoading(true);
      setSearchResults([]);
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5`;
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          // Recomendado por Nominatim: incluir User-Agent identificável
          'User-Agent': 'TransporteMore-App/1.0 (contact: admin@example.com)'
        }
      });
      const data = await res.json();
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (err) {
      Alert.alert('Falha na busca', 'Não foi possível buscar o endereço.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectSearchResult = (item) => {
    const lat = Number(item.lat);
    const lon = Number(item.lon);
    setForm((f) => ({ ...f, endereco: item.display_name || f.endereco, latitude: String(lat), longitude: String(lon) }));
    setMapRegion((r) => ({ ...r, latitude: lat, longitude: lon }));
    setSearchResults([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Gestão de Pontos de Embarque</Text>

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>{editingId ? 'Editar Ponto' : 'Adicionar Novo Ponto'}</Text>
        <TextInput placeholder="Nome do ponto" placeholderTextColor="#666" style={styles.input} value={form.nome} onChangeText={(t) => setForm((f) => ({ ...f, nome: t }))} />
        <TextInput placeholder="Endereço" placeholderTextColor="#666" style={styles.input} value={form.endereco} onChangeText={(t) => setForm((f) => ({ ...f, endereco: t }))} />
        {/* Busca de endereço para obter coordenadas automaticamente */}
        <View style={styles.row}>
          <TextInput placeholder="Buscar endereço (ex: Rua, Cidade)" placeholderTextColor="#666" style={[styles.input, styles.flex]}
            value={searchQuery} onChangeText={setSearchQuery} />
          <TouchableOpacity style={[styles.actionBtn, styles.primaryBtn]} onPress={handleSearch}>
            <Text style={styles.actionText}>Buscar</Text>
          </TouchableOpacity>
        </View>
        {searchLoading ? (
          <View style={{ paddingVertical: 6 }}>
            <ActivityIndicator size="small" color="#2a5298" />
          </View>
        ) : null}
        {searchResults.length > 0 && (
          <View style={styles.searchResults}>
            {searchResults.map((it) => (
              <TouchableOpacity key={`${it.place_id}`} style={styles.searchItem} onPress={() => handleSelectSearchResult(it)}>
                <Text style={styles.searchText}>{it.display_name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Seleção por mapa: no mobile, toque no mapa define lat/lng; no web, exibe mapa como referência */}
        <View style={styles.mapBox}>
          <Map
            style={{ width: '100%', height: '100%' }}
            initialRegion={mapRegion}
            {...(Platform.OS !== 'web' ? { onPress: handleMapPress } : {})}
          >
            {form.latitude && form.longitude ? (
              <Marker coordinate={{ latitude: Number(form.latitude), longitude: Number(form.longitude) }} />
            ) : null}
          </Map>
          {Platform.OS === 'web' ? (
            <Text style={styles.mapHint}>Dica: no web, selecione as coordenadas pela busca acima.</Text>
          ) : (
            <Text style={styles.mapHint}>Toque no mapa para definir a localização.</Text>
          )}
        </View>
        <View style={styles.row}>
          <TextInput placeholder="Latitude" placeholderTextColor="#666" keyboardType="numeric" style={[styles.input, styles.half]} value={form.latitude} onChangeText={(t) => setForm((f) => ({ ...f, latitude: t }))} />
          <TextInput placeholder="Longitude" placeholderTextColor="#666" keyboardType="numeric" style={[styles.input, styles.half]} value={form.longitude} onChangeText={(t) => setForm((f) => ({ ...f, longitude: t }))} />
        </View>
        <View style={styles.row}>
          <TextInput placeholder="Nº de alunos" placeholderTextColor="#666" keyboardType="numeric" style={[styles.input, styles.half]} value={form.alunosCount} onChangeText={(t) => setForm((f) => ({ ...f, alunosCount: t }))} />
          <TextInput placeholder="Horário de coleta (ex: 07:30)" placeholderTextColor="#666" style={[styles.input, styles.half]} value={form.horarioColeta} onChangeText={(t) => setForm((f) => ({ ...f, horarioColeta: t }))} />
        </View>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.actionBtn, styles.primaryBtn]} onPress={handleSubmit}>
            <Text style={styles.actionText}>{editingId ? 'Salvar' : 'Adicionar'}</Text>
          </TouchableOpacity>
          {editingId ? (
            <TouchableOpacity style={[styles.actionBtn, styles.secondaryBtn]} onPress={resetForm}>
              <Text style={styles.actionText}>Cancelar</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Pontos cadastrados</Text>
      <FlatList
        data={points}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum ponto cadastrado.</Text>}
      />
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
  flex: { flex: 1 },
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  primaryBtn: { backgroundColor: '#2a5298' },
  secondaryBtn: { backgroundColor: '#888' },
  editBtn: { backgroundColor: '#2a5298' },
  removeBtn: { backgroundColor: '#F44336' },
  actionText: { color: '#fff', fontWeight: 'bold' },
  pointCard: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 10, elevation: 1 },
  pointTitle: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  pointText: { color: '#555', marginTop: 2 },
  emptyText: { textAlign: 'center', color: '#666', marginTop: 10 },
  mapBox: { height: 220, borderRadius: 10, overflow: 'hidden', marginBottom: 8 },
  mapHint: { position: 'absolute', bottom: 6, left: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 6, paddingVertical: 4, paddingHorizontal: 8, fontSize: 12, color: '#333' },
  searchResults: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 8, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: '#ddd' },
  searchItem: { paddingHorizontal: 10, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  searchText: { color: '#333', fontSize: 13 },
});