import React, { useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTransport } from '../../contexts/TransportContext';

export default function ManageRoutes() {
  const { points, routes, addRoute, updateRoute, removeRoute } = useTransport();
  const [routeName, setRouteName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [selectedPointIds, setSelectedPointIds] = useState([]);
  const [horarios, setHorarios] = useState({});
  const [editingId, setEditingId] = useState(null);

  const isValid = useMemo(() => {
    return routeName.trim() && schoolName.trim() && selectedPointIds.length > 0;
  }, [routeName, schoolName, selectedPointIds]);

  const togglePoint = (id) => {
    setSelectedPointIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const movePoint = (id, direction) => {
    const idx = selectedPointIds.indexOf(id);
    if (idx < 0) return;
    const newOrder = [...selectedPointIds];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= newOrder.length) return;
    [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];
    setSelectedPointIds(newOrder);
  };

  const setHorarioForPoint = (id, value) => {
    setHorarios((h) => ({ ...h, [id]: value }));
  };

  const clearForm = () => {
    setRouteName('');
    setSchoolName('');
    setSelectedPointIds([]);
    setHorarios({});
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!isValid) {
      Alert.alert('Campos obrigatórios', 'Preencha nome da rota, escola e selecione pontos.');
      return;
    }
    const payload = {
      nome: routeName.trim(),
      descricao: `Rota da ${schoolName.trim()}`,
      schoolName: schoolName.trim(),
      busId: 1,
      pointIds: selectedPointIds,
      horarios,
    };
    try {
      if (editingId) {
        await updateRoute(editingId, payload);
        Alert.alert('Atualizado', 'Rota atualizada com sucesso.');
      } else {
        await addRoute(payload);
        Alert.alert('Criada', 'Rota criada com sucesso.');
      }
    } catch (e) {
      Alert.alert('Aviso', `Falha ao integrar com o backend. A rota foi salva localmente.\n${e?.message || ''}`);
    }
    clearForm();
  };

  const handleEdit = (route) => {
    setEditingId(route.id);
    setRouteName(route.nome || '');
    setSchoolName(route.schoolName || '');
    setSelectedPointIds(route.pointIds || []);
    setHorarios(route.horarios || {});
  };

  const handleRemove = (id) => {
    Alert.alert('Remover Rota', 'Tem certeza que deseja remover esta rota?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: async () => { await removeRoute(id); } },
    ]);
  };

  const renderSelected = ({ item }) => (
    <View style={styles.selectedItem}>
      <Text style={styles.pointTitle}>{item.nome}</Text>
      <View style={styles.row}>
        <TouchableOpacity style={[styles.smallBtn, styles.moveBtn]} onPress={() => movePoint(item.id, 'up')}>
          <Text style={styles.smallText}>↑</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.smallBtn, styles.moveBtn]} onPress={() => movePoint(item.id, 'down')}>
          <Text style={styles.smallText}>↓</Text>
        </TouchableOpacity>
        <TextInput
          placeholder="Horário (ex: 07:30)"
          style={[styles.input, { flex: 1 }]}
          value={horarios[item.id] || ''}
          onChangeText={(t) => setHorarioForPoint(item.id, t)}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Rotas Personalizadas</Text>
      <View style={styles.form}>
        <Text style={styles.sectionTitle}>{editingId ? 'Editar Rota' : 'Criar Nova Rota'}</Text>
        <TextInput placeholder="Nome da rota" style={styles.input} value={routeName} onChangeText={setRouteName} />
        <TextInput placeholder="Escola" style={styles.input} value={schoolName} onChangeText={setSchoolName} />

        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Selecionar pontos</Text>
        <View style={styles.pointsList}>
          {points.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum ponto cadastrado.</Text>
          ) : (
            points.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.pointChip, selectedPointIds.includes(p.id) ? styles.pointChipActive : null]}
                onPress={() => togglePoint(p.id)}
              >
                <Text style={styles.pointChipText}>{p.nome}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {selectedPointIds.length > 0 && (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.sectionTitle}>Ordem e horários</Text>
            <FlatList
              data={selectedPointIds.map((id) => points.find((p) => p.id === id)).filter(Boolean)}
              keyExtractor={(item) => item.id}
              renderItem={renderSelected}
            />
          </View>
        )}

        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.actionBtn, styles.primaryBtn]} onPress={handleSubmit}>
            <Text style={styles.actionText}>{editingId ? 'Salvar' : 'Criar Rota'}</Text>
          </TouchableOpacity>
          {editingId ? (
            <TouchableOpacity style={[styles.actionBtn, styles.secondaryBtn]} onPress={clearForm}>
              <Text style={styles.actionText}>Cancelar</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Rotas existentes</Text>
      {routes.length === 0 ? (
        <Text style={styles.emptyText}>Nenhuma rota cadastrada.</Text>
      ) : (
        routes.map((r) => (
          <View key={r.id} style={styles.routeCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.routeTitle}>{r.nome}</Text>
              <Text style={styles.routeText}>Escola: {r.schoolName}</Text>
              <Text style={styles.routeText}>Pontos: {r.pointIds?.length || 0}</Text>
            </View>
            <View style={styles.actionsRow}>
              <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => handleEdit(r)}>
                <Text style={styles.actionText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.removeBtn]} onPress={() => handleRemove(r.id)}>
                <Text style={styles.actionText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  form: { backgroundColor: '#fff', borderRadius: 10, padding: 12, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  input: { backgroundColor: '#f8f8f8', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, marginBottom: 8 },
  pointsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pointChip: { backgroundColor: '#e0e0e0', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  pointChipActive: { backgroundColor: '#2a5298' },
  pointChipText: { color: '#333' },
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  primaryBtn: { backgroundColor: '#2a5298' },
  secondaryBtn: { backgroundColor: '#888' },
  editBtn: { backgroundColor: '#2a5298' },
  removeBtn: { backgroundColor: '#F44336' },
  actionText: { color: '#fff', fontWeight: 'bold' },
  selectedItem: { backgroundColor: '#fff', borderRadius: 8, padding: 10, marginBottom: 8 },
  smallBtn: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6, marginRight: 6 },
  moveBtn: { backgroundColor: '#2a5298' },
  smallText: { color: '#fff', fontWeight: 'bold' },
  row: { flexDirection: 'row', alignItems: 'center' },
  routeCard: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 10, elevation: 1 },
  routeTitle: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  routeText: { color: '#555', marginTop: 2 },
  emptyText: { textAlign: 'center', color: '#666', marginTop: 10 },
});
