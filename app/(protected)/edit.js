import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

export default function Edit() {
  const router = useRouter();

  const [openInstituicao, setOpenInstituicao] = useState(false);
  const [instituicao, setInstituicao] = useState(null);
  const [itensInstituicao, setItensInstituicao] = useState([
    { label: 'Escola A', value: 'A' },
    { label: 'Escola B', value: 'B' },
  ]);

  const [openPonto, setOpenPonto] = useState(false);
  const [ponto, setPonto] = useState(null);
  const [itensPonto, setItensPonto] = useState([
    { label: 'Ponto 1', value: '1' },
    { label: 'Ponto 2', value: '2' },
  ]);

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

        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveText}>Salvar</Text>
        </TouchableOpacity>
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
