import React, { useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from 'src/contexts/AuthContext';
import { useTheme } from 'src/contexts/ThemeContext';
import { BookingModalHeader } from './BookingModalHeader';
import { BookingProgressIndicator } from './BookingProgressIndicator';
import { DateTimeStep } from './DateTimeStep';
import { ProfessionalStep } from './ProfessionalStep';
import { ServiceCard } from './ServiceCard';
import { SummaryStep } from './SummaryStep';
import { useBookingFlow } from './useBookingFlow';

export function AgendarTab() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalAnimation] = useState(new Animated.Value(0));

  const bookingFlow = useBookingFlow(user?.id || '');

  const openModal = () => {
    setIsModalVisible(true);
    Animated.timing(modalAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setIsModalVisible(false);
      bookingFlow.resetFlow();
    });
  };

  const handleServiceSelect = async (servico: any) => {
    await bookingFlow.handleServiceSelect(servico);
    openModal();
  };

  const handleBack = () => {
    if (bookingFlow.step === 'professional') {
      closeModal();
    } else {
      bookingFlow.handleBack();
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.mainContent}>
          <Text style={[styles.mainTitle, { color: colors.text }]}>Nossos Serviços</Text>
          <Text style={[styles.mainSubtitle, { color: colors.textSecondary }]}>
            Escolha o serviço que deseja agendar
          </Text>

          <View style={styles.servicesGrid}>
            {bookingFlow.loading ? (
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Carregando serviços...
              </Text>
            ) : (
              bookingFlow.allServices.map((servico) => (
                <ServiceCard
                  key={servico.id}
                  service={servico}
                  onPress={() => handleServiceSelect(servico)}
                  colors={colors}
                />
              ))
            )}
          </View>
        </View>
      </View>

      {/* Modal de Agendamento */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closeModal} />
          <Animated.View
            style={[
              styles.modalContainer,
              { backgroundColor: colors.background },
              {
                transform: [
                  {
                    translateY: modalAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [Dimensions.get('window').height, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <BookingModalHeader onBack={handleBack} onClose={closeModal} colors={colors} />
            <BookingProgressIndicator step={bookingFlow.step} colors={colors} />

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {bookingFlow.step === 'professional' && (
                <ProfessionalStep
                  barbeiros={bookingFlow.barbeiros}
                  onSelect={bookingFlow.handleProfessionalSelect}
                  colors={colors}
                />
              )}

              {bookingFlow.step === 'datetime' && (
                <DateTimeStep
                  data={bookingFlow.data}
                  horario={bookingFlow.horario}
                  horariosDisponiveis={bookingFlow.horariosDisponiveis}
                  onDateChange={bookingFlow.handleDataChange}
                  onTimeSelect={bookingFlow.handleTimeSelect}
                  colors={colors}
                />
              )}

              {bookingFlow.step === 'summary' && (
                <SummaryStep
                  servicoSelecionado={bookingFlow.servicoSelecionado}
                  barbeiro={bookingFlow.barbeiro}
                  barbeiros={bookingFlow.barbeiros}
                  data={bookingFlow.data}
                  horario={bookingFlow.horario}
                  noConversation={bookingFlow.noConversation}
                  observacoes={bookingFlow.observacoes}
                  onNoConversationChange={bookingFlow.setNoConversation}
                  onObservacoesChange={bookingFlow.setObservacoes}
                  colors={colors}
                />
              )}
            </ScrollView>

            {bookingFlow.step === 'summary' && (
              <View
                style={[
                  styles.modalFooter,
                  { backgroundColor: colors.background, borderTopColor: colors.border },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    { backgroundColor: colors.primary },
                    bookingFlow.bookingLoading && { opacity: 0.7 },
                  ]}
                  onPress={() => bookingFlow.handleConfirmar(closeModal)}
                  disabled={bookingFlow.bookingLoading}
                >
                  <Text style={[styles.confirmButtonText, { color: colors.card }]}>
                    {bookingFlow.bookingLoading
                      ? 'Confirmando...'
                      : `Confirmar - R$ ${bookingFlow.servicoSelecionado?.price?.toFixed(2) || '0.00'}`}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  mainContent: {
    width: '100%',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  mainSubtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  servicesGrid: {
    width: '100%',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalContent: {
    flex: 1,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
  },
  confirmButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
