import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import AppHeader from '../components/AppHeader';
import { useTheme } from '../contexts/ThemeContext';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // Agendamentos
  {
    id: '1',
    question: 'Como faço para agendar um horário?',
    answer:
      'É muito fácil! Basta acessar a aba "Agendar" no app, escolher o barbeiro, a data e o horário disponível. Você receberá uma confirmação por WhatsApp.',
    category: 'Agendamentos',
  },
  {
    id: '2',
    question: 'Posso cancelar meu horário?',
    answer:
      'Sim! Você pode cancelar até 2 horas antes do horário agendado. Basta entrar em contato conosco pelo WhatsApp ou pelo app.',
    category: 'Agendamentos',
  },
  {
    id: '3',
    question: 'Quais documentos preciso levar?',
    answer:
      'Não é necessário levar documentos. Apenas venha com o cabelo limpo e seco para um melhor resultado.',
    category: 'Agendamentos',
  },
  // Serviços
  {
    id: '4',
    question: 'Quais tipos de corte vocês fazem?',
    answer:
      'Fazemos todos os tipos de corte masculino: degradê, undercut, pompadour, side part, buzz cut, e muito mais. Traga sua referência!',
    category: 'Serviços',
  },
  {
    id: '5',
    question: 'Fazem barba e bigode?',
    answer:
      'Sim! Fazemos barba, bigode, acabamentos e tratamentos faciais. Temos especialistas em barbas de todos os estilos.',
    category: 'Serviços',
  },
  {
    id: '6',
    question: 'Têm produtos para venda?',
    answer:
      'Sim! Temos uma linha completa de produtos profissionais: pomadas, shampoos, óleos capilares e muito mais. Veja na aba "Produtos".',
    category: 'Serviços',
  },
  // Pagamento
  {
    id: '7',
    question: 'Aceitam cartão?',
    answer:
      'Sim! Aceitamos cartão de crédito, débito, PIX e dinheiro. Você pode pagar online pelo app ou presencialmente.',
    category: 'Pagamento',
  },
  {
    id: '8',
    question: 'Posso pagar online?',
    answer: 'Sim! Você pode pagar online pelo app usando cartão ou PIX. É seguro e prático.',
    category: 'Pagamento',
  },
  {
    id: '9',
    question: 'Têm desconto para pacotes?',
    answer:
      'Sim! Temos pacotes mensais e trimestrais com desconto. Consulte nossos preços na aba "Agendar".',
    category: 'Pagamento',
  },
  // Horários
  {
    id: '10',
    question: 'Qual o horário de funcionamento?',
    answer: 'Segunda a Sexta: 09h às 20h\nSábado: 08h às 18h\nDomingo: Fechado',
    category: 'Horários',
  },
  {
    id: '11',
    question: 'Atendem aos domingos?',
    answer: 'Não, não atendemos aos domingos. Nosso horário é de segunda a sábado.',
    category: 'Horários',
  },
  {
    id: '12',
    question: 'Têm horário de almoço?',
    answer:
      'Não fechamos para almoço! Atendemos normalmente durante todo o horário de funcionamento.',
    category: 'Horários',
  },
  // Cursos
  {
    id: '13',
    question: 'Vocês oferecem cursos?',
    answer:
      'Sim! Temos cursos online de barbearia para quem quer aprender. Veja na aba "Cursos" do app.',
    category: 'Cursos',
  },
  {
    id: '14',
    question: 'Os cursos são presenciais ou online?',
    answer:
      'Nossos cursos são 100% online, com vídeos em HD e suporte dos instrutores. Você pode assistir quando quiser.',
    category: 'Cursos',
  },
  {
    id: '15',
    question: 'Posso acessar os cursos depois de comprar?',
    answer:
      'Sim! Você tem acesso vitalício aos cursos que comprar. Pode assistir quantas vezes quiser.',
    category: 'Cursos',
  },
];

const categories = ['Agendamentos', 'Serviços', 'Pagamento', 'Horários', 'Cursos'];

export default function FAQScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const toggleItem = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId],
    );
  };

  const filteredFAQ =
    selectedCategory === 'Todos'
      ? faqData
      : faqData.filter((item) => item.category === selectedCategory);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader navigation={navigation} title="Perguntas Frequentes" />
      <View style={styles.header}>
        <Text style={styles.title}>Perguntas Frequentes</Text>
        <Text style={styles.subtitle}>Tire suas dúvidas sobre nossos serviços</Text>
      </View>

      {/* Categorias */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        <TouchableOpacity
          style={[
            styles.categoryButton,
            selectedCategory === 'Todos' && styles.categoryButtonActive,
          ]}
          onPress={() => setSelectedCategory('Todos')}
        >
          <Text
            style={[styles.categoryText, selectedCategory === 'Todos' && styles.categoryTextActive]}
          >
            Todos
          </Text>
        </TouchableOpacity>

        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.faqContainer} showsVerticalScrollIndicator={false}>
        {filteredFAQ.map((item) => (
          <View key={item.id} style={styles.faqItem}>
            <TouchableOpacity style={styles.questionContainer} onPress={() => toggleItem(item.id)}>
              <Text style={styles.question}>{item.question}</Text>
              <Ionicons
                name={expandedItems.includes(item.id) ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>

            {expandedItems.includes(item.id) && (
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
    backgroundColor: '#f7f7f7',
  },
  header: {
    backgroundColor: '#111',
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  categoryButtonActive: {
    backgroundColor: '#111',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
  },
  faqContainer: {
    flex: 1,
    padding: 16,
  },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    color: '#666',
    lineHeight: 20,
  },
});
