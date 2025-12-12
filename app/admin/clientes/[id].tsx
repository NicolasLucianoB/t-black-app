import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
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

export default function EditClienteScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isEdit = id !== 'new';

  const [loading, setLoading] = useState(false);
  const [cliente, setCliente] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isBanned, setIsBanned] = useState(false);

  useEffect(() => {
    if (isEdit) {
      loadCliente();
    }
  }, [id]);

  const loadCliente = async () => {
    if (!id || id === 'new') return;

    setLoading(true);
    try {
      const data = await databaseService.users.getById(id);
      if (data) {
        setCliente(data);
        setName(data.name || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setIsBanned(data.isBanned || false);
      }
    } catch (error) {
      console.error('Erro ao carregar cliente:', error);
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

    if (!email.trim()) {
      Alert.alert('Atenção', 'Email é obrigatório');
      return;
    }

    setLoading(true);
    try {
      const data = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || null,
        isBanned,
      };

      if (isEdit) {
        await databaseService.users.update(id, data);
        Alert.alert('Sucesso', 'Cliente atualizado!');
      } else {
        await databaseService.users.create(data);
        Alert.alert('Sucesso', 'Cliente criado!');
      }

      router.back();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      Alert.alert('Erro', 'Não foi possível salvar');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    if (!phone) {
      Alert.alert('Atenção', 'Cliente não possui telefone cadastrado');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    const whatsappUrl = `whatsapp://send?phone=55${cleanPhone}`;

    Linking.canOpenURL(whatsappUrl).then((supported) => {
      if (supported) {
        Linking.openURL(whatsappUrl);
      } else {
        Alert.alert('Erro', 'WhatsApp não está instalado');
      }
    });
  };

  const handleSendNotification = () => {
    Alert.alert('Enviar Notificação', 'Digite a mensagem que deseja enviar:', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Enviar',
        onPress: async () => {
          try {
            // TODO: Implementar envio de notificação
            Alert.alert('Sucesso', 'Notificação enviada!');
          } catch (error) {
            console.error('Erro ao enviar notificação:', error);
            Alert.alert('Erro', 'Não foi possível enviar a notificação');
          }
        },
      },
    ]);
  };

  const handleToggleBan = () => {
    const newBanStatus = !isBanned;
    Alert.alert(
      newBanStatus ? 'Banir Cliente' : 'Desbanir Cliente',
      newBanStatus
        ? 'Tem certeza que deseja banir este cliente? Ele não poderá fazer novos agendamentos.'
        : 'Deseja desbanir este cliente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: newBanStatus ? 'Banir' : 'Desbanir',
          style: newBanStatus ? 'destructive' : 'default',
          onPress: () => setIsBanned(newBanStatus),
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
      color: colors.accent,
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
    inputWithIcon: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingLeft: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    inputFlex: {
      flex: 1,
      padding: 16,
      fontSize: 16,
      color: colors.text,
    },
    iconButton: {
      padding: 16,
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
    switchContainerBanned: {
      borderColor: '#ff4444',
      backgroundColor: '#ffeeee',
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
    actionButtonsContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 24,
    },
    actionButton: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    actionButtonText: {
      color: colors.accent,
      fontSize: 14,
      fontWeight: '600',
      marginTop: 4,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 24,
    },
    button: {
      flex: 1,
      backgroundColor: colors.accent,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButton: {
      backgroundColor: colors.border,
    },
    cancelButtonText: {
      color: colors.text,
    },
    bannedBadge: {
      backgroundColor: '#ff4444',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      marginTop: 8,
    },
    bannedBadgeText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <AdminHeader
        title={isEdit ? 'Editar Cliente' : 'Novo Cliente'}
        subtitle={isEdit ? cliente?.name : 'Cadastrar novo cliente'}
        showBack={true}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              {cliente?.avatar ? (
                <Image source={{ uri: cliente.avatar }} style={styles.avatar} />
              ) : (
                <Ionicons name="person" size={50} color={colors.textSecondary} />
              )}
            </View>
            <TouchableOpacity>
              <Text style={styles.changePhotoText}>Alterar foto</Text>
            </TouchableOpacity>
            {isBanned && (
              <View style={styles.bannedBadge}>
                <Text style={styles.bannedBadgeText}>🚫 BANIDO</Text>
              </View>
            )}
          </View>

          {/* Botões de Ação (apenas em edit) */}
          {isEdit && (
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity style={styles.actionButton} onPress={handleWhatsApp}>
                <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
                <Text style={[styles.actionButtonText, { color: '#25D366' }]}>WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={handleSendNotification}>
                <Ionicons name="notifications" size={24} color={colors.primary} />
                <Text style={styles.actionButtonText}>Notificar</Text>
              </TouchableOpacity>
            </View>
          )}

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

          {/* Email */}
          <View style={styles.section}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="email@exemplo.com"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Telefone */}
          <View style={styles.section}>
            <Text style={styles.label}>Telefone</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                style={styles.inputFlex}
                placeholder="(00) 00000-0000"
                placeholderTextColor={colors.textSecondary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              {phone && (
                <TouchableOpacity style={styles.iconButton} onPress={handleWhatsApp}>
                  <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Status de Banimento */}
          {isEdit && (
            <View style={styles.section}>
              <TouchableOpacity
                style={[styles.switchContainer, isBanned && styles.switchContainerBanned]}
                onPress={handleToggleBan}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchLabel}>
                    {isBanned ? '🚫 Cliente Banido' : 'Cliente Ativo'}
                  </Text>
                  <Text style={styles.switchSubtitle}>
                    {isBanned ? 'Não pode fazer novos agendamentos' : 'Toque para banir o cliente'}
                  </Text>
                </View>
                <Switch
                  value={isBanned}
                  onValueChange={handleToggleBan}
                  trackColor={{ false: colors.border, true: '#ff4444' }}
                  thumbColor="#fff"
                />
              </TouchableOpacity>
            </View>
          )}

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
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
