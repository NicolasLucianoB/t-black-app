import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AdminHeader } from 'src/components/AdminHeader';
import { useTheme } from 'src/contexts/ThemeContext';
import { databaseService } from 'src/services';

export default function EditProfissionalScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isEdit = id !== 'new';

  const [loading, setLoading] = useState(false);
  const [profissional, setProfissional] = useState<any>(null);
  const [name, setName] = useState('');
  const [position, setPosition] = useState('Barbeiro');
  const [description, setDescription] = useState('');
  const [showInBooking, setShowInBooking] = useState(true);
  const [workingHours, setWorkingHours] = useState('');

  useEffect(() => {
    if (isEdit) {
      loadProfissional();
    }
  }, [id]);

  const loadProfissional = async () => {
    if (!id || id === 'new') return;

    setLoading(true);
    try {
      const data = await databaseService.barbers.getById(id);
      if (data) {
        setProfissional(data);
        setName(data.name || '');
        setPosition(data.position || 'Barbeiro');
        setDescription(data.description || '');
        setShowInBooking(data.showInBooking ?? true);
        setWorkingHours(data.workingHours ? JSON.stringify(data.workingHours, null, 2) : '');
      }
    } catch (error) {
      console.error('Erro ao carregar profissional:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Atenção', 'Nome é obrigatório');
      return;
    }

    setLoading(true);
    try {
      let parsedWorkingHours = null;
      if (workingHours.trim()) {
        try {
          parsedWorkingHours = JSON.parse(workingHours);
        } catch (e) {
          Alert.alert('Erro', 'Formato de horários inválido. Use JSON válido.');
          setLoading(false);
          return;
        }
      }

      const data = {
        name: name.trim(),
        position: position.trim(),
        description: description.trim() || null,
        showInBooking,
        workingHours: parsedWorkingHours,
      };

      if (isEdit) {
        await databaseService.barbers.update(id, data);
        Alert.alert('Sucesso', 'Profissional atualizado!');
      } else {
        await databaseService.barbers.create(data);
        Alert.alert('Sucesso', 'Profissional criado!');
      }

      router.back();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      Alert.alert('Erro', 'Não foi possível salvar');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja remover este profissional? Ele será rebaixado para cliente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Implementar lógica de rebaixar para cliente
              await databaseService.barbers.delete(id);
              Alert.alert('Sucesso', 'Profissional removido!');
              router.back();
            } catch (error) {
              console.error('Erro ao excluir:', error);
              Alert.alert('Erro', 'Não foi possível excluir');
            }
          },
        },
      ],
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
    },
    avatarContainer: {
      alignItems: 'center',
      marginBottom: 24,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    changePhotoText: {
      color: colors.primary,
      fontSize: 14,
      marginTop: 8,
    },
    section: {
      marginBottom: 24,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    textArea: {
      height: 120,
      textAlignVertical: 'top',
    },
    switchContainer: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    switchLabel: {
      fontSize: 16,
      color: colors.text,
      flex: 1,
    },
    switchSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 24,
    },
    button: {
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    deleteButton: {
      backgroundColor: '#ff4444',
      marginTop: 16,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
    },
    deleteButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButton: {
      backgroundColor: colors.border,
    },
    cancelButtonText: {
      color: colors.text,
    },
    hint: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
  });

  return (
    <View style={styles.container}>
      <AdminHeader
        title={isEdit ? 'Editar Profissional' : 'Novo Profissional'}
        subtitle={isEdit ? profissional?.name : 'Cadastrar novo membro'}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              {profissional?.avatar ? (
                <Image source={{ uri: profissional.avatar }} style={styles.avatar} />
              ) : (
                <Ionicons name="person" size={50} color={colors.textSecondary} />
              )}
            </View>
            <TouchableOpacity>
              <Text style={styles.changePhotoText}>Alterar foto</Text>
            </TouchableOpacity>
          </View>

          {/* Nome */}
          <View style={styles.section}>
            <Text style={styles.label}>Nome *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Cargo */}
          <View style={styles.section}>
            <Text style={styles.label}>Cargo *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Barbeiro, Recepcionista, Gestão"
              placeholderTextColor={colors.textSecondary}
              value={position}
              onChangeText={setPosition}
            />
          </View>

          {/* Descrição */}
          <View style={styles.section}>
            <Text style={styles.label}>Descrição / Perfil</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descrição que aparece na aba Profissionais do agendamento..."
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
            <Text style={styles.hint}>
              Opcional. Aparece apenas se "Exibir no agendamento" estiver ativo.
            </Text>
          </View>

          {/* Horários de Trabalho */}
          <View style={styles.section}>
            <Text style={styles.label}>Horários de Trabalho (JSON)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={'{\n  "monday": "09:00-18:00",\n  "tuesday": "09:00-18:00"\n}'}
              placeholderTextColor={colors.textSecondary}
              value={workingHours}
              onChangeText={setWorkingHours}
              multiline
              numberOfLines={6}
            />
            <Text style={styles.hint}>Formato JSON. Deixe vazio para usar padrão.</Text>
          </View>

          {/* Exibir no Booking */}
          <View style={styles.section}>
            <View style={styles.switchContainer}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchLabel}>Exibir no agendamento</Text>
                <Text style={styles.switchSubtitle}>Aparece na lista pública de profissionais</Text>
              </View>
              <Switch
                value={showInBooking}
                onValueChange={setShowInBooking}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            </View>
          </View>

          {/* Botões */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => router.back()}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? 'Salvando...' : 'Salvar'}</Text>
            </TouchableOpacity>
          </View>

          {/* Botão Excluir */}
          {isEdit && (
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.deleteButtonText}>Excluir Profissional</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
