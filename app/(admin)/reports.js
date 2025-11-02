import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTransport } from '../../contexts/TransportContext';

function parseTimeToMinutes(t) {
  if (!t || typeof t !== 'string') return null;
  const m = t.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (Number.isNaN(h) || Number.isNaN(min)) return null;
  return h * 60 + min;
}

export default function TransportReports() {
  const { points, routes, totalStudentsTransported, routeChangeCount } = useTransport();

  const avgDisplacementTime = useMemo(() => {
    // Para cada rota, diferença entre primeiro e último horário definido, em minutos
    const durations = routes.map((r) => {
      const ids = r.pointIds || [];
      if (ids.length < 2) return null;
      const first = parseTimeToMinutes(r.horarios?.[ids[0]]);
      const last = parseTimeToMinutes(r.horarios?.[ids[ids.length - 1]]);
      if (first == null || last == null) return null;
      return Math.max(0, last - first);
    }).filter((d) => d != null);
    if (durations.length === 0) return null;
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    return Math.round(avg);
  }, [routes]);

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Relatórios de Transporte</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Número de alunos transportados</Text>
        <Text style={styles.value}>{totalStudentsTransported}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Tempo médio de deslocamento</Text>
        <Text style={styles.value}>{avgDisplacementTime != null ? `${avgDisplacementTime} min` : 'N/A'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Frequência de alterações nas rotas</Text>
        <Text style={styles.value}>{routeChangeCount}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Rotas cadastradas</Text>
        <Text style={styles.value}>{routes.length}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Pontos cadastrados</Text>
        <Text style={styles.value}>{points.length}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 10, elevation: 2 },
  label: { color: '#666', marginBottom: 6 },
  value: { color: '#333', fontSize: 18, fontWeight: 'bold' },
});