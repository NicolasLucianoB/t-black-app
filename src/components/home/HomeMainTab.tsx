import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from 'src/contexts/AuthContext';
import { useTheme } from 'src/contexts/ThemeContext';
import { databaseService } from 'src/services/database';

interface HomeMainTabProps {
  onNavigate: (screenName: string, params?: any) => void;
}

export function HomeMainTab({ onNavigate }: HomeMainTabProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const iconColor = '#111';

  const [lastBooking, setLastBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLastBooking = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const bookings = await databaseService.bookings.getByUserId(user.id);
        if (bookings && bookings.length > 0) {
          const sortedBookings = bookings.sort((a: any, b: any) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateB.getTime() - dateA.getTime();
          });

          const lastBookingData = sortedBookings[0];

          const [service, barber] = await Promise.all([
            databaseService.services.getById(lastBookingData.serviceId),
            databaseService.barbers.getById(lastBookingData.barberId),
          ]);

          setLastBooking({
            ...lastBookingData,
            service,
            barber,
          });
        }
      } catch (error) {
        console.error('Erro ao buscar último agendamento:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLastBooking();
  }, [user]);

  const handleQuickBook = () => {
    if (lastBooking) {
      onNavigate('booking', {
        screen: 'Agendar',
        params: {
          quickBookServiceId: lastBooking.serviceId,
          quickBookBarberId: lastBooking.barberId,
        },
      });
    }
  };

  const barberFirstName = lastBooking?.barber?.name?.split(' ')[0] || 'Barbeiro';
  const formattedTime = lastBooking?.time?.substring(0, 5) || '';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.welcomeSection}>
        <Text
          style={[styles.title, { color: colors.text, textAlign: 'center' }]}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
        >
          Bem-vindo ao Studio T. Black!
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          O que deseja fazer hoje?
        </Text>
      </View>

      {/* Agendamento Rápido */}
      {!loading && lastBooking && (
        <View style={styles.quickBookContainer}>
          <View style={[styles.quickBookSection, { backgroundColor: colors.card }]}>
            <View style={styles.quickBookHeader}>
              <Ionicons name="flash" size={20} color="#25D366" />
              <Text style={[styles.quickBookTitle, { color: colors.text }]}>
                Agendamento Rápido
              </Text>
            </View>
            <TouchableOpacity style={styles.quickBookCard} onPress={handleQuickBook}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.quickBookService, { color: colors.text }]}>
                  {lastBooking.service?.name || 'Serviço'} - {barberFirstName}
                </Text>
                <Text style={[styles.quickBookDate, { color: colors.textSecondary }]}>
                  Último: {new Date(lastBooking.date).toLocaleDateString('pt-BR')} às{' '}
                  {formattedTime}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Cards de Ação */}
      <View style={styles.cardsContainer}>
        <ActionCard
          icon="calendar-outline"
          title="Agendar Horário"
          subtitle="Marque seu horário com nossos barbeiros"
          onPress={() => onNavigate('booking', { screen: 'Agendar' })}
          colors={colors}
          iconColor={iconColor}
        />

        <ActionCard
          icon="school-outline"
          title="Ver Cursos"
          subtitle="Aprenda técnicas profissionais"
          onPress={() => onNavigate('courses')}
          colors={colors}
          iconColor={iconColor}
        />

        <ActionCard
          icon="bag-outline"
          title="Comprar Produtos"
          subtitle="Produtos profissionais para cabelo"
          onPress={() => onNavigate('/product')}
          colors={colors}
          iconColor={iconColor}
        />

        <ActionCard
          icon="business-outline"
          title="Informações do Studio"
          subtitle="Horários, endereço e contatos"
          onPress={() => onNavigate('/studioInfo')}
          colors={colors}
          iconColor={iconColor}
        />

        <ActionCard
          icon="help-circle-outline"
          title="Perguntas Frequentes"
          subtitle="Tire suas dúvidas sobre nossos serviços"
          onPress={() => onNavigate('/faq')}
          colors={colors}
          iconColor={iconColor}
        />

        <ActionCard
          icon="people-outline"
          title="Clube de Benefícios"
          subtitle="Parceiros e vantagens exclusivas"
          onPress={() => onNavigate('/benefitsClub')}
          colors={colors}
          iconColor={iconColor}
        />
      </View>

      {/* Seção de Perfil */}
      <View style={styles.profileSection}>
        <TouchableOpacity
          style={[styles.profileButton, { backgroundColor: colors.card }]}
          onPress={() => onNavigate('/tabs/profile')}
        >
          <Ionicons name="person-outline" size={20} color={colors.text} />
          <Text style={[styles.profileButtonText, { color: colors.text }]}>Ver Perfil</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

interface ActionCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  colors: any;
  iconColor: string;
}

function ActionCard({ icon, title, subtitle, onPress, colors, iconColor }: ActionCardProps) {
  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.card }]} onPress={onPress}>
      <View style={styles.cardIcon}>
        <Ionicons name={icon} size={32} color={iconColor} />
      </View>
      <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeSection: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  quickBookContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  quickBookSection: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickBookHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickBookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  quickBookCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 0,
    borderRadius: 8,
  },
  quickBookService: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  quickBookDate: {
    fontSize: 14,
    marginTop: 0,
  },
  cardsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'left',
  },
  cardSubtitle: {
    fontSize: 14,
    textAlign: 'left',
    lineHeight: 20,
  },
  profileSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  profileButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
