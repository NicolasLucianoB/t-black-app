import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';
import { useTheme } from 'src/contexts/ThemeContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'barber' | 'tiago' | 'joão' | 'rafael' | 'carlos' | 'marcos';
  senderName: string;
  timestamp: Date;
}

export default function CommunityScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Fala rapaziada! quem aí já viu o vídeo sobre finalização que eu disponibilizei na aba de cursos?',
      sender: 'barber',
      senderName: 'Tiago',
      timestamp: new Date(),
    },
    {
      id: '2',
      text: 'Pô! Não vi ainda não, vou correndo assistir, estava precisando mesmo!',
      sender: 'marcos',
      senderName: 'Marcos Silva',
      timestamp: new Date(),
    },
    {
      id: '3',
      text: 'Eu já, ficou maneiraaaaço, já vou aplicar essa técnica depois que sair do banho.',
      sender: 'user',
      senderName: 'Nícolas Luciano',
      timestamp: new Date(),
    },
    {
      id: '4',
      text: 'Tiagão, surgiu um evento de última hora! Tem vaga hoje?',
      sender: 'user',
      senderName: 'Nícolas Luciano',
      timestamp: new Date(),
    },
    {
      id: '5',
      text: 'Temos sim! Pode vir às 15h',
      sender: 'barber',
      senderName: 'João',
      timestamp: new Date(),
    },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage,
        sender: 'user',
        senderName: 'Você',
        timestamp: new Date(),
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const getSenderColor = (sender: string) => {
    switch (sender) {
      case 'barber':
        return '#25D366'; // Verde WhatsApp
      case 'joão':
        return '#FF6B6B'; // Vermelho
      case 'rafael':
        return '#4ECDC4'; // Turquesa
      case 'carlos':
        return '#45B7D1'; // Azul
      case 'marcos':
        return '#96CEB4'; // Verde claro
      case 'user':
        return '#111'; // Preto para usuários
      default:
        return '#999';
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    const senderColor = getSenderColor(item.sender);
    return (
      <View
        style={[
          styles.messageContainer,
          isUser
            ? { ...styles.userMessage, backgroundColor: colors.primary }
            : { ...styles.barberMessage, backgroundColor: colors.card, shadowColor: colors.shadow },
        ]}
      >
        {!isUser && (
          <Text style={[styles.senderName, { color: senderColor }]}>{item.senderName}</Text>
        )}
        <Text
          style={[styles.messageText, isUser ? { color: colors.card } : { color: colors.text }]}
        >
          {item.text}
        </Text>
        <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.header}>
        <Text style={[styles.headerText]}>T. Black Chat</Text>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        />

        <View
          style={[
            styles.inputContainer,
            { backgroundColor: colors.card, borderTopColor: colors.border },
          ]}
        >
          <TextInput
            style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Digite sua mensagem..."
            placeholderTextColor={colors.textSecondary}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: newMessage.trim() ? colors.primary : colors.textSecondary },
            ]}
            onPress={sendMessage}
            disabled={!newMessage.trim()}
          >
            <Ionicons name="send" size={20} color={colors.card} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#111',
    borderBottomRightRadius: 4,
  },
  barberMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  barberMessageText: {
    color: '#111',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#111',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
    height: 44,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  header: {
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#3b3b3bff',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#c9b544ff',
  },
});
