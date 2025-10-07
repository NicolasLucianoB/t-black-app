import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { useAuth } from 'src/contexts/AuthContext';
import { useTheme } from 'src/contexts/ThemeContext';
import { useChat } from 'src/hooks/useChat';
import { ChatMessage } from 'src/types';

export default function CommunityScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const { messages, loading, sendingMessage, error, sendMessage } = useChat();
  const [newMessage, setNewMessage] = useState('');

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef?.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const result = await sendMessage(
      newMessage.trim(),
      user.id,
      user.name,
      user.avatar || undefined,
    );

    if (result) {
      setNewMessage('');
    } else if (error) {
      Alert.alert('Erro', 'Não foi possível enviar a mensagem. Tente novamente.');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getUserColor = (senderId: string) => {
    // Generate consistent color based on user ID
    const colorsArray = [
      '#007AFF',
      '#FF6B35',
      '#34C759',
      '#AF52DE',
      '#FF9500',
      '#5AC8FA',
      '#FF3B30',
    ];
    const hash = senderId.split('').reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colorsArray[Math.abs(hash) % colorsArray.length];
  };

  const isCurrentUser = (senderId: string) => {
    return senderId === user?.id;
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMe = isCurrentUser(item.senderId);

    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.currentUserMessage : styles.otherUserMessage,
        ]}
      >
        <View style={[styles.messageBubble, { backgroundColor: colors.card }]}>
          <View style={styles.messageHeader}>
            <Text style={[styles.senderName, { color: getUserColor(item.senderId) }]}>
              {isMe ? 'Você' : item.senderName}
            </Text>
            <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
              {formatTime(item.createdAt)}
            </Text>
          </View>
          <Text style={[styles.messageText, { color: colors.text }]}>{item.content}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Carregando mensagens...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>Comunidade T-Black</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          {messages.length} mensagens
        </Text>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            flatListRef?.current?.scrollToEnd({ animated: true });
          }}
        />

        {/* Input */}
        <View
          style={[
            styles.inputContainer,
            { backgroundColor: colors.card, borderTopColor: colors.border },
          ]}
        >
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Digite sua mensagem..."
            placeholderTextColor={colors.textSecondary}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={500}
            editable={!sendingMessage}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor:
                  newMessage.trim() && !sendingMessage ? colors.primary : colors.border,
              },
            ]}
            onPress={handleSendMessage}
            disabled={!newMessage.trim() || sendingMessage}
          >
            {sendingMessage ? (
              <ActivityIndicator size="small" color={colors.card} />
            ) : (
              <Ionicons
                name="send"
                size={20}
                color={newMessage.trim() ? colors.card : colors.textSecondary}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageContainer: {
    marginVertical: 4,
  },
  currentUserMessage: {
    alignItems: 'flex-end',
  },
  otherUserMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 11,
    marginLeft: 8,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
    borderWidth: 1,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
