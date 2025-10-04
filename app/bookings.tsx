import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BackHeader from 'src/components/BackHeader';
import { useAuth } from 'src/contexts/AuthContext';
import { useTheme } from 'src/contexts/ThemeContext';
import { databaseService } from 'src/services';
import { Booking } from 'src/types';

export default function BookingsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadBookings();
    }
  }, [user?.id]);

  const loadBookings = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await databaseService.bookings.getByUserId(user.id);
      setBookings(data);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      setError('Não foi possível carregar os agendamentos');
      Alert.alert('Erro', 'Não foi possível carregar os agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return '#FF9500';
      case 'confirmed':
        return '#007AFF';
      case 'in_progress':
        return '#5856D6';
      case 'completed':
        return '#34C759';
      case 'cancelled':
        return '#FF3B30';
      case 'no_show':
        return '#8E8E93';
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Agendado';
      case 'confirmed':
        return 'Confirmado';
      case 'in_progress':
        return 'Em andamento';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      case 'no_show':
        return 'Não compareceu';
      default:
        return status;
    }
  };

  const handleCancelBooking = async (booking: Booking) => {
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      Alert.alert('Aviso', 'Este agendamento não pode ser cancelado');
      return;
    }

    Alert.alert('Cancelar Agendamento', 'Tem certeza que deseja cancelar este agendamento?', [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Sim, cancelar',
        style: 'destructive',
        onPress: async () => {
          try {
            const success = await databaseService.bookings.cancel(booking.id);
            if (success) {
              Alert.alert('Sucesso', 'Agendamento cancelado com sucesso');
              await loadBookings(); // Recarregar lista
            } else {
              Alert.alert('Erro', 'Não foi possível cancelar o agendamento');
            }
          } catch (error) {
            console.error('Erro ao cancelar agendamento:', error);
            Alert.alert('Erro', 'Erro interno do servidor');
          }
        },
      },
    ]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <BackHeader title="Meus Agendamentos" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.text, marginTop: 16 }}>Carregando agendamentos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <BackHeader title="Meus Agendamentos" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ color: colors.text, fontSize: 18, textAlign: 'center' }}>
            {error || 'Faça login para ver seus agendamentos'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (bookings.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <BackHeader title="Meus Agendamentos" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Ionicons name="calendar-outline" size={64} color={colors.textSecondary} />
          <Text style={{ color: colors.text, fontSize: 18, marginTop: 16, textAlign: 'center' }}>
            Nenhum agendamento encontrado
          </Text>
          <Text
            style={{ color: colors.textSecondary, fontSize: 14, marginTop: 8, textAlign: 'center' }}
          >
            Faça seu primeiro agendamento na aba Agendar
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/tabs/booking')}
          >
            <Text style={[styles.buttonText, { color: colors.card }]}>Fazer Agendamento</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <BackHeader title="Meus Agendamentos" />
      <ScrollView style={styles.scrollView}>
        {bookings.map((booking) => (
          <View key={booking.id} style={[styles.bookingCard, { backgroundColor: colors.card }]}>
            <View style={styles.bookingHeader}>
              <View style={styles.bookingInfo}>
                <Text style={[styles.bookingDate, { color: colors.text }]}>
                  {formatDate(booking.date)} às {booking.time}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(booking.status) + '20' },
                  ]}
                >
                  <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                    {getStatusText(booking.status)}
                  </Text>
                </View>
              </View>
            </View>

            {booking.barber && (
              <Text style={[styles.barberName, { color: colors.textSecondary }]}>
                Barbeiro: {booking.barber.name}
              </Text>
            )}

            {booking.service && (
              <Text style={[styles.serviceName, { color: colors.textSecondary }]}>
                Serviço: {booking.service.name}
              </Text>
            )}

            <Text style={[styles.totalPrice, { color: colors.text }]}>
              Total: R$ {booking.totalPrice.toFixed(2)}
            </Text>

            {booking.notes && (
              <Text style={[styles.notes, { color: colors.textSecondary }]}>
                Observações: {booking.notes}
              </Text>
            )}

            {(booking.status === 'scheduled' || booking.status === 'confirmed') && (
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: '#FF3B30' }]}
                onPress={() => handleCancelBooking(booking)}
              >
                <Text style={[styles.cancelButtonText, { color: '#FF3B30' }]}>
                  Cancelar Agendamento
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  bookingCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingDate: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  barberName: {
    fontSize: 14,
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 14,
    marginBottom: 4,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  notes: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  cancelButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
