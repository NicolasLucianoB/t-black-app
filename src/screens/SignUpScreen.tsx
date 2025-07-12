import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

interface SignUpScreenProps {
  navigation: any;
}

export default function SignUpScreen({ navigation }: SignUpScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!email.includes('@')) {
      newErrors.email = 'E-mail inválido';
    }

    if (!password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = () => {
    if (validateForm()) {
      // Futuramente: integrar com Supabase Auth
      navigation.replace('LoggedTabs');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro</Text>
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        accessibilityLabel="E-mail"
      />
      {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        accessibilityLabel="Senha"
      />
      {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleSignUp} accessibilityRole="button">
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkContainer} accessibilityRole="link">
        <Text style={styles.linkText}>Já tem uma conta? Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
    color: '#111',
  },
  input: {
    width: '100%',
    maxWidth: 320,
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  button: {
    width: '100%',
    maxWidth: 320,
    height: 48,
    backgroundColor: '#111',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkContainer: {
    marginTop: 16,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 16,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginBottom: 8,
    alignSelf: 'flex-start',
    maxWidth: 320,
  },
}); 