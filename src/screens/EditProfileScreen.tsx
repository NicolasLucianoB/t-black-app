import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';

interface EditProfileScreenProps {
  navigation: any;
  route: any;
}

export default function EditProfileScreen({ navigation, route }: EditProfileScreenProps) {
  const [nome, setNome] = useState(route.params?.userData?.nome || '');
  const [email, setEmail] = useState(route.params?.userData?.email || '');
  const [telefone, setTelefone] = useState(route.params?.userData?.telefone || '');

  const handleSalvar = () => {
    if (!nome.trim() || !email.trim() || !telefone.trim()) {
      Alert.alert('Erro', 'Todos os campos são obrigatórios');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Erro', 'E-mail inválido');
      return;
    }

    Alert.alert(
      'Sucesso',
      'Perfil atualizado com sucesso!',
      [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]
    );
  };

  const handleCancelar = () => {
    Alert.alert(
      'Cancelar',
      'Deseja descartar as alterações?',
      [
        { text: 'Continuar editando', style: 'cancel' },
        { text: 'Descartar', style: 'destructive', onPress: () => navigation.goBack() }
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Editar Perfil</Text>
        
        <View style={styles.section}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Digite seu nome completo"
            autoCapitalize="words"
            accessibilityLabel="Nome"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Digite seu e-mail"
            keyboardType="email-address"
            autoCapitalize="none"
            accessibilityLabel="E-mail"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Telefone</Text>
          <TextInput
            style={styles.input}
            value={telefone}
            onChangeText={setTelefone}
            placeholder="(11) 99999-9999"
            keyboardType="phone-pad"
            accessibilityLabel="Telefone"
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelar}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSalvar}>
            <Text style={styles.saveButtonText}>Salvar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#f7f7f7',
    paddingBottom: 24,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    textAlign: 'center',
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#111',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 