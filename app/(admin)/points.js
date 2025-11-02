import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTransport } from '../../contexts/TransportContext';

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

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Gestão de Pontos de Embarque</Text>

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>{editingId ? 'Editar Ponto' : 'Adicionar Novo Ponto'}</Text>
        <TextInput placeholder="Nome do ponto" style={styles.input} value={form.nome} onChangeText={(t) => setForm((f) => ({ ...f, nome: t }))} />
        <TextInput placeholder="Endereço" style={styles.input} value={form.endereco} onChangeText={(t) => setForm((f) => ({ ...f, endereco: t }))} />
        <View style={styles.row}>
          <TextInput placeholder="Latitude" keyboardType="numeric" style={[styles.input, styles.half]} value={form.latitude} onChangeText={(t) => setForm((f) => ({ ...f, latitude: t }))} />
          <TextInput placeholder="Longitude" keyboardType="numeric" style={[styles.input, styles.half]} value={form.longitude} onChangeText={(t) => setForm((f) => ({ ...f, longitude: t }))} />
        </View>
        <View style={styles.row}>
          <TextInput placeholder="Nº de alunos" keyboardType="numeric" style={[styles.input, styles.half]} value={form.alunosCount} onChangeText={(t) => setForm((f) => ({ ...f, alunosCount: t }))} />
          <TextInput placeholder="Horário de coleta (ex: 07:30)" style={[styles.input, styles.half]} value={form.horarioColeta} onChangeText={(t) => setForm((f) => ({ ...f, horarioColeta: t }))} />
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
  input: { backgroundColor: '#f8f8f8', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
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
});