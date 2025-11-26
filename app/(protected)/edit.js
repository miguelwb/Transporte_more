import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useUserData } from '../../contexts/UserDataContext';
import { getEscolas, getPontos } from '../../services/api';

export default function Edit() {
  const router = useRouter();
  const { instituicao: savedInstituicao, ponto: savedPonto, updateUserData } = useUserData();

  const [openInstituicao, setOpenInstituicao] = useState(false);
  const [instituicao, setInstituicao] = useState(null);
  const [itensInstituicao, setItensInstituicao] = useState([]);

  const [openPonto, setOpenPonto] = useState(false);
  const [ponto, setPonto] = useState(null);
  const [itensPonto, setItensPonto] = useState([]);

  // Carregar dados salvos quando a tela for aberta
  useEffect(() => {
    (async () => {
      try {
        const escolas = await getEscolas();
        setItensInstituicao((escolas || []).map((e) => ({ label: e.nome, value: e.nome })));
      } catch (e) {
        console.warn('Falha ao carregar escolas:', e?.message);
        setItensInstituicao([]);
      }
      try {
        const pontos = await getPontos();
        setItensPonto((pontos || []).map((p) => ({ label: p.nome, value: p.nome })));
      } catch (e) {
        console.warn('Falha ao carregar pontos:', e?.message);
        setItensPonto([]);
      }
      if (savedInstituicao) setInstituicao(savedInstituicao);
      if (savedPonto) setPonto(savedPonto);
    })();
  }, [savedInstituicao, savedPonto]);

  const handleSave = async () => {
    try {
      await updateUserData(instituicao, ponto);
      Alert.alert('Sucesso', 'Dados atualizados com sucesso!');
      router.back();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar os dados.');
    }
  };

  // Removido upload de foto conforme solicitado

  return (
    <SafeAreaView style={styles.container}>
      {/* Card principal */}
      <View style={styles.card}>
        <TouchableOpacity style={styles.cardHeader}>
          <Text style={styles.cardHeaderText}>Editar - Escola e Ponto</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Selecione sua Instituição de ensino</Text>
        <View style={{ zIndex: 2 }}> 
          <DropDownPicker
            open={openInstituicao}
            value={instituicao}
            items={itensInstituicao}
            setOpen={setOpenInstituicao}
            setValue={setInstituicao}
            setItems={setItensInstituicao}
            placeholder="Selecione"
            style={styles.selectBox}
            dropDownContainerStyle={{ borderRadius: 20 }}
            textStyle={{ color: '#0f5176', fontFamily: 'LeagueSpartan-Regular' }}
          />
        </View>

        <Text style={[styles.label, { marginTop: 20 }]}>Selecione seu Ponto</Text>
        <View style={{ zIndex: 1 }}>
          <DropDownPicker
            open={openPonto}
            value={ponto}
            items={itensPonto}
            setOpen={setOpenPonto}
            setValue={setPonto}
            setItems={setItensPonto}
            placeholder="Selecione"
            style={styles.selectBox}
            dropDownContainerStyle={{ borderRadius: 20 }}
            textStyle={{ color: '#0f5176', fontFamily: 'LeagueSpartan-Regular' }}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Salvar</Text>
        </TouchableOpacity>
        {/* Botão de upload removido */}
      </View>

      {/* Botão voltar */}
      <TouchableOpacity style={styles.voltarButton} onPress={() => router.back()}>
        <LinearGradient colors={['#0f5176', '#0f5176']} style={styles.voltarGradient}>
          <Text style={styles.voltarText}>Voltar</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F3F5',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#0f5176',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    width: '85%',
    marginTop: 40,
  },
  cardHeader: {
    backgroundColor: '#b6c8d6',
    borderRadius: 20,
    paddingVertical: 8,
    alignSelf: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  cardHeaderText: {
    color: '#0f5176',
    fontFamily: 'LeagueSpartan-Bold',
    fontSize: 14,
  },
  label: {
    color: '#fff',
    fontFamily: 'LeagueSpartan-Regular',
    marginBottom: 6,
    fontSize: 13,
  },
  selectBox: {
    backgroundColor: '#e8f0f8',
    borderRadius: 20,
    borderWidth: 0,
  },
  saveButton: {
    backgroundColor: '#e8f0f8',
    borderRadius: 20,
    paddingVertical: 6,
    width: 100,
    alignSelf: 'center',
    marginTop: 25,
  },
  saveText: {
    textAlign: 'center',
    fontFamily: 'LeagueSpartan-Bold',
    color: '#0f5176',
    fontSize: 14,
  },
  voltarButton: {
    marginTop: 30,
    borderRadius: 20,
    overflow: 'hidden',
  },
  voltarGradient: {
    paddingVertical: 8,
    paddingHorizontal: 26,
    borderRadius: 20,
  },
  voltarText: {
    color: '#fff',
    fontFamily: 'LeagueSpartan-Bold',
    fontSize: 14,
  },
});
