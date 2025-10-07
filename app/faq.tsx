import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BackHeader from '../src/components/BackHeader';
import { useTheme } from '../src/contexts/ThemeContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQ_DATA = [
  {
    id: '1',
    question: 'Como faço para agendar um horário?',
    answer: 'Acesse a aba "Agendar", escolha barbeiro, data e horário. Confirmação por WhatsApp.',
    category: 'Agendamentos',
  },
  {
    id: '2',
    question: 'Posso cancelar meu horário?',
    answer: 'Sim! Até 2h antes, pelo WhatsApp ou app.',
    category: 'Agendamentos',
  },
  {
    id: '3',
    question: 'Quais documentos preciso levar?',
    answer: 'Nenhum. Só venha com cabelo limpo e seco.',
    category: 'Agendamentos',
  },
  {
    id: '4',
    question: 'Quais tipos de corte vocês fazem?',
    answer: 'Todos os cortes masculinos. Traga sua referência!',
    category: 'Serviços',
  },
  {
    id: '5',
    question: 'Fazem barba e bigode?',
    answer: 'Sim! Barba, bigode, acabamentos e tratamentos.',
    category: 'Serviços',
  },
  {
    id: '6',
    question: 'Têm produtos para venda?',
    answer: 'Sim! Pomadas, shampoos, óleos e mais. Veja em "Produtos".',
    category: 'Serviços',
  },
  {
    id: '7',
    question: 'Aceitam cartão?',
    answer: 'Sim! Crédito, débito, PIX e dinheiro.',
    category: 'Pagamento',
  },
  {
    id: '8',
    question: 'Posso pagar online?',
    answer: 'Sim! Pelo app, cartão ou PIX.',
    category: 'Pagamento',
  },
  {
    id: '9',
    question: 'Têm desconto para pacotes?',
    answer: 'Sim! Pacotes mensais e trimestrais com desconto.',
    category: 'Pagamento',
  },
  {
    id: '10',
    question: 'Qual o horário de funcionamento?',
    answer: 'Seg a Sex: 09h-20h | Sáb: 08h-18h | Dom: Fechado',
    category: 'Horários',
  },
  {
    id: '11',
    question: 'Atendem aos domingos?',
    answer: 'Não. Só de segunda a sábado.',
    category: 'Horários',
  },
  {
    id: '12',
    question: 'Têm horário de almoço?',
    answer: 'Não fechamos para almoço.',
    category: 'Horários',
  },
  {
    id: '13',
    question: 'Vocês oferecem cursos?',
    answer: 'Sim! Cursos online de barbearia. Veja em "Cursos".',
    category: 'Cursos',
  },
  {
    id: '14',
    question: 'Os cursos são presenciais ou online?',
    answer: '100% online, vídeos HD e suporte.',
    category: 'Cursos',
  },
  {
    id: '15',
    question: 'Posso acessar os cursos depois de comprar?',
    answer: 'Sim! Acesso vitalício.',
    category: 'Cursos',
  },
];

const CATEGORIES = [
  { label: 'Agendamentos', icon: 'calendar-outline' },
  { label: 'Serviços', icon: 'cut-outline' },
  { label: 'Pagamento', icon: 'card-outline' },
  { label: 'Horários', icon: 'time-outline' },
  { label: 'Cursos', icon: 'school-outline' },
  { label: 'Todos', icon: 'grid-outline' },
];

export default function FAQScreen() {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [category, setCategory] = useState('Agendamentos');
  const [search, setSearch] = useState('');
  const username = 'Nícolas'; // mock, replace with value from backend later

  const filtered = useMemo(() => {
    let data = FAQ_DATA;
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      data = data.filter(
        (q) => q.question.toLowerCase().includes(s) || q.answer.toLowerCase().includes(s),
      );
    }
    if (category !== 'Todos') {
      data = data.filter((q) => q.category === category);
    }
    return data;
  }, [category, search]);

  const handleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => (prev === id ? null : id));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <BackHeader />
      <View style={styles.topWhiteBlock}>
        <Text style={styles.title}>
          Como podemos te {'\n'}ajudar hoje, {username}?
        </Text>
        <View style={styles.searchWrapper} accessible accessibilityLabel="Buscar perguntas">
          <Ionicons
            name="search-outline"
            size={20}
            color={colors.textSecondary}
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Qual é sua dúvida?"
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
            accessibilityLabel="Qual é sua dúvida?"
            returnKeyType="search"
          />
        </View>
        <Text style={styles.sectionLabel}>Atalhos para você</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
          accessibilityRole="tablist"
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.label}
              style={styles.categoryWrapper}
              onPress={() => setCategory(cat.label)}
              accessibilityRole="tab"
              accessibilityState={{ selected: category === cat.label }}
              accessibilityLabel={cat.label}
            >
              <View
                style={[
                  styles.categoryButton,
                  category === cat.label && styles.categoryButtonActive,
                ]}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={28}
                  color={category === cat.label ? '#fff' : colors.textSecondary}
                />
              </View>
              <Text
                style={[
                  styles.categoryText,
                  { color: category === cat.label ? '#111' : colors.textSecondary },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <ScrollView style={styles.faqContainer} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 && (
          <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 32 }}>
            Nenhuma pergunta encontrada.
          </Text>
        )}
        {filtered.map((item) => (
          <View key={item.id} style={styles.faqItem}>
            <TouchableOpacity
              style={styles.questionContainer}
              onPress={() => handleExpand(item.id)}
              accessibilityRole="button"
              accessibilityLabel={item.question}
              accessibilityState={{ expanded: expanded === item.id }}
              activeOpacity={1}
            >
              <Text style={styles.question}>{item.question}</Text>
              <Ionicons
                name={expanded === item.id ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#667"
              />
            </TouchableOpacity>
            {expanded === item.id && (
              <View style={styles.answerContainer}>
                <Text style={styles.answer}>{item.answer}</Text>
              </View>
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
  topWhiteBlock: {
    backgroundColor: '#fff',
    // borderBottomLeftRadius: 24,
    // borderBottomRightRadius: 24,
    paddingBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    zIndex: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: 'semibold',
    color: '#111',
    margin: 16,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    margin: 16,
    marginBottom: 0,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 6,
    backgroundColor: 'transparent',
  },
  categoriesContainer: {
    backgroundColor: 'transparent',
    marginTop: 8,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryWrapper: {
    alignItems: 'center',
    marginRight: 12,
  },
  categoryButton: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  categoryButtonActive: {
    backgroundColor: '#111',
  },
  categoryText: {
    fontSize: 13,
    color: '#667',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
  },
  faqContainer: {
    flex: 1,
    padding: 16,
    marginTop: 8,
  },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    flex: 1,
    marginRight: 12,
  },
  answerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  answer: {
    fontSize: 14,
    color: '#667',
    lineHeight: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#667',
    marginHorizontal: 16,
    marginTop: 20,
  },
});
