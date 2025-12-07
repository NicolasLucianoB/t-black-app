import React from 'react';
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Barber } from 'src/types';

interface SummaryStepProps {
  servicoSelecionado: any;
  barbeiro: string;
  barbeiros: Barber[];
  data: string;
  horario: string;
  noConversation: boolean;
  observacoes: string;
  onNoConversationChange: (value: boolean) => void;
  onObservacoesChange: (text: string) => void;
  colors: any;
}

export function SummaryStep({
  servicoSelecionado,
  barbeiro,
  barbeiros,
  data,
  horario,
  noConversation,
  observacoes,
  onNoConversationChange,
  onObservacoesChange,
  colors,
}: SummaryStepProps) {
  const barbeiroSelecionado = barbeiros.find((b) => b.id === barbeiro);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Confirmar agendamento</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Revise os detalhes antes de finalizar
        </Text>
      </View>

      {/* Resumo do Agendamento */}
      <View
        style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <Text style={[styles.serviceTitle, { color: colors.text }]}>
          {servicoSelecionado?.name}
        </Text>

        <View style={styles.mainRow}>
          <View style={styles.professional}>
            <View style={styles.avatarSmall}>
              <Text style={styles.avatarInitials}>
                {barbeiroSelecionado?.name?.charAt(0) || 'T'}
              </Text>
            </View>
            <Text style={[styles.professionalName, { color: colors.text }]}>
              {barbeiroSelecionado?.name}
            </Text>
          </View>

          <View style={styles.dateInfo}>
            <Text style={[styles.dayNumber, { color: colors.text }]}>
              {new Date(data + 'T00:00:00').getDate()}
            </Text>
            <Text style={[styles.monthAbbr, { color: colors.textSecondary }]}>
              {new Date(data + 'T00:00:00')
                .toLocaleDateString('pt-BR', { month: 'short' })
                .toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <Text style={[styles.price, { color: '#25D366' }]}>
            R$ {servicoSelecionado?.price?.toFixed(2) || '0.00'}
          </Text>
          <Text style={[styles.time, { color: colors.textSecondary }]}>
            {horario} • {servicoSelecionado?.duration}min
          </Text>
        </View>
      </View>

      {/* Preferências */}
      <View style={styles.preferencesSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferências</Text>

        <View
          style={[
            styles.preferenceCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.preferenceRow}>
            <View style={styles.preferenceInfo}>
              <Text style={[styles.preferenceTitle, { color: colors.text }]}>
                Atendimento silencioso
              </Text>
              <Text style={[styles.preferenceSubtitle, { color: colors.textSecondary }]}>
                Não quero conversar durante o atendimento
              </Text>
            </View>
            <Switch
              value={noConversation}
              onValueChange={onNoConversationChange}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={noConversation ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.observationsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Observações</Text>
          <TextInput
            style={[
              styles.observationsInput,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Alguma observação especial? (opcional)"
            placeholderTextColor={colors.textSecondary}
            value={observacoes}
            onChangeText={onObservacoesChange}
            multiline
            numberOfLines={3}
            maxLength={200}
          />
          <Text style={[styles.charCount, { color: colors.textSecondary }]}>
            {observacoes.length}/200 caracteres
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  professional: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarInitials: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  professionalName: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateInfo: {
    alignItems: 'center',
  },
  dayNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  monthAbbr: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
  },
  time: {
    fontSize: 14,
    fontWeight: '500',
  },
  preferencesSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  preferenceCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  preferenceInfo: {
    flex: 1,
    marginRight: 12,
  },
  preferenceTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  preferenceSubtitle: {
    fontSize: 13,
  },
  observationsSection: {
    marginTop: 4,
  },
  observationsInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
  },
});
