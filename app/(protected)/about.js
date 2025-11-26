import { StyleSheet, Text, View } from 'react-native';

export default function About() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sobre o App</Text>
      <Text style={styles.text}>
        Nosso aplicativo foi desenvolvido para tornar a gestão do transporte escolar mais simples, eficiente e segura.Implementando funcionalidades como visualização de rotas, notificações instantâneas sobre a chegada e saída dos veículos e possíveis imprevistos, além do acesso direto à carteirinha digital do aluno.
        Oferecemos uma experiência moderna tanto para responsáveis quanto para estudantes. Tudo isso em uma plataforma intuitiva e acessível, pensada justamente para facilitar o seu dia a dia.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f2f2f2',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#115f8c',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
});
