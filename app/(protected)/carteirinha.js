import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTransport } from '../../contexts/TransportContext';
import { useUserData } from '../../contexts/UserDataContext';
import { getAlunoPorRA } from '../../services/api';

const { width } = Dimensions.get('window');

function extractCityFromAddress(addr) {
  if (!addr || typeof addr !== 'string') return '';
  const parts = addr.split(',').map((s) => s.trim());
  // Tenta pegar penúltimo ou último token como cidade/distrito
  const candidate = parts[parts.length - 2] || parts[parts.length - 1] || '';
  // Remove CEP se presente
  return candidate.replace(/\b\d{5}-\d{3}\b/, '').trim();
}

function StudentPhoto({ uri, theme }) {
  if (uri) {
    return (
      <Image source={{ uri }} style={styles.photo} resizeMode="cover" />
    );
  }
  const isDark = theme === 'dark';
  return (
    <View style={[styles.photo, { alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? '#0d3550' : '#e6f1fb' }]}>
      <FontAwesome5 name="user-graduate" size={54} color={isDark ? '#7fc6ff' : '#115f8c'} />
    </View>
  );
}

export default function CarteirinhaEstudantil() {
  const { instituicao, ponto: pontoCtx, theme, profileImage, nome: nomeCtx } = useUserData();
  const { points, routes, schools } = useTransport();
  const [loading, setLoading] = useState(true);
  const [aluno, setAluno] = useState(null);
  const [ra, setRa] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const savedRA = (await AsyncStorage.getItem('userRA')) || '';
        setRa(savedRA);
        const data = savedRA ? await getAlunoPorRA(savedRA) : null;
        setAluno(data);
      } catch (e) {
        console.warn('Falha ao carregar dados do aluno:', e?.message);
        setAluno(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const derive = useMemo(() => {
    const nomeCompleto = aluno?.nomeCompleto || nomeCtx || '';
    // Escola
    let escolaNome = aluno?.escola || instituicao || '';
    // Ponto
    let pontoNome = aluno?.ponto || pontoCtx || '';
    // Descobrir rota a partir do ponto
    let rotaNome = aluno?.rota || '';
    let cidadeDistrito = aluno?.cidadeOuDistrito || '';

    // Encontra pointId pelo nome
    const matchPoint = points.find((p) => p.nome?.toLowerCase() === pontoNome?.toLowerCase());
    const pointId = matchPoint?.id;
    // Rota: selecionar automaticamente quando houver ponto + escola
    if (pointId) {
      const candidates = routes.filter((rt) => Array.isArray(rt.pointIds) && rt.pointIds.includes(pointId));
      if (candidates.length > 0) {
        // Se já temos escola, exigir compatibilidade
        if (escolaNome) {
          const r = candidates.find((rt) => String(rt.schoolName || '').toLowerCase() === String(escolaNome).toLowerCase());
          rotaNome = r?.nome || '';
        } else {
          // Se não há escola, usar a escola da rota ao selecionar
          const r = candidates[0];
          rotaNome = r?.nome || '';
          if (!escolaNome && r?.schoolName) escolaNome = r.schoolName;
        }
      } else {
        // Nenhuma rota compatível com o ponto: manter rota em branco
        rotaNome = '';
      }
    }
    // Escola por proximidade do ponto
    if (!escolaNome && matchPoint) {
      // Tenta encontrar escola mais próxima por endereço similar
      const byName = schools.find((s) => s.nome && s.nome.toLowerCase().includes('escola'));
      if (byName?.nome) escolaNome = byName.nome;
    }

    // Cidade/distrito via endereço de escola ou ponto
    if (!cidadeDistrito) {
      const addr = (schools.find((s) => s.nome === escolaNome)?.endereco) || matchPoint?.endereco || '';
      cidadeDistrito = extractCityFromAddress(addr);
    }

    return {
      nomeCompleto,
      escolaNome,
      pontoNome,
      rotaNome,
      cidadeDistrito,
    };
  }, [aluno, nomeCtx, instituicao, pontoCtx, points, routes, schools]);

  const isDarkTheme = theme === 'dark';

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <LinearGradient
        colors={isDarkTheme ? ['#053','rgba(5,39,80,1)'] : ['rgba(17,95,140,1)', 'rgba(5,39,80,1)']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>Carteirinha de Transporte Escolar</Text>
        </View>

        <View style={[styles.card, { backgroundColor: isDarkTheme ? '#0e2e46' : '#ffffff' }]}>
          {/* Foto do aluno */}
          <View style={styles.leftPane}>
            <StudentPhoto uri={aluno?.fotoUrl || profileImage} theme={theme} />
            {/* RA / matrícula */}
            <View style={styles.badgeRow}>
              <Text style={[styles.badgeLabel, { color: isDarkTheme ? '#a1d7ff' : '#115f8c' }]}>Matrícula (RA)</Text>
              <Text style={[styles.badgeValue, { color: isDarkTheme ? '#fff' : '#003652' }]}>{ra || aluno?.ra || '—'}</Text>
            </View>
          </View>

          {/* Dados do aluno */}
          <View style={styles.rightPane}>
            {loading ? (
              <View style={{ padding: 20 }}><ActivityIndicator color={isDarkTheme ? '#7fc6ff' : '#115f8c'} /></View>
            ) : (
              <>
                <View style={styles.row}><Text style={[styles.label, isDarkTheme && { color: '#a1d7ff' }]}>Nome</Text><Text style={[styles.value, isDarkTheme && { color: '#ffffff' }]}>{derive.nomeCompleto || '—'}</Text></View>
                <View style={styles.row}><Text style={[styles.label, isDarkTheme && { color: '#a1d7ff' }]}>Escola</Text><Text style={[styles.value, isDarkTheme && { color: '#ffffff' }]}>{derive.escolaNome || '—'}</Text></View>
                <View style={styles.row}><Text style={[styles.label, isDarkTheme && { color: '#a1d7ff' }]}>Ponto de Embarque</Text><Text style={[styles.value, isDarkTheme && { color: '#ffffff' }]}>{derive.pontoNome || '—'}</Text></View>
              </>
            )}
          </View>
        </View>

        {/* Rodapé sutil para assinatura/validação visual */}
        <View style={styles.footerLine}>
          <Text style={[styles.footerText, { color: isDarkTheme ? '#7fc6ff' : '#115f8c' }]}>Válido enquanto ativo no sistema municipal</Text>
        </View>
      </LinearGradient>
    </ScrollView>
  );
}

const cardWidth = Math.min(width - 32, 860);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 32,
  },
  headerCard: {
    width: cardWidth,
    borderRadius: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(17,95,140,0.25)',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  card: {
    width: cardWidth,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  leftPane: {
    width: '36%',
  },
  rightPane: {
    flex: 1,
  },
  photo: {
    width: '100%',
    aspectRatio: 3/4,
    borderRadius: 12,
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'column',
    gap: 2,
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.9,
  },
  badgeValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  row: {
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    color: '#0c2d4a',
    fontWeight: '600',
  },
  footerLine: {
    width: cardWidth,
    marginTop: 10,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    opacity: 0.9,
  },
});
