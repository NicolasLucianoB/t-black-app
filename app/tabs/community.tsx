import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Clipboard,
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
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const { messages, loading, sendingMessage, error, sendMessage, deleteMessage, editMessage } =
    useChat();
  const [newMessage, setNewMessage] = useState('');
  const [editingMessage, setEditingMessage] = useState<{ id: string; content: string } | null>(
    null,
  );
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());

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

    if (editingMessage) {
      // Editar mensagem existente
      const success = await editMessage(editingMessage.id, newMessage.trim());
      if (success) {
        setEditingMessage(null);
        setNewMessage('');
      } else {
        Alert.alert('Erro', 'Não foi possível editar a mensagem. Tente novamente.');
      }
    } else {
      // Enviar nova mensagem
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

  const handleCopyMessage = (content: string) => {
    Clipboard.setString(content);
    Alert.alert('Copiado', 'Mensagem copiada para a área de transferência');
  };

  const handleCopySelectedMessages = () => {
    const messagesToCopy = messages
      .filter((msg) => selectedMessages.has(msg.id))
      .map((msg) => `${msg.senderName}: ${msg.content}`)
      .join('\n\n');

    Clipboard.setString(messagesToCopy);
    Alert.alert('Copiado', `${selectedMessages.size} mensagem(ns) copiada(s)`);
    setSelectionMode(false);
    setSelectedMessages(new Set());
  };

  const handleEditMessage = (messageId: string, content: string) => {
    setEditingMessage({ id: messageId, content });
    setNewMessage(content);
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setNewMessage('');
  };

  const handleDeleteSelectedMessages = () => {
    Alert.alert('Excluir Mensagens', `Deseja excluir ${selectedMessages.size} mensagem(ns)?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          for (const messageId of selectedMessages) {
            await deleteMessage(messageId);
          }
          setSelectionMode(false);
          setSelectedMessages(new Set());
        },
      },
    ]);
  };

  const handleToggleSelection = (messageId: string) => {
    setSelectedMessages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedMessages(new Set());
  };

  const handleEnterSelectionMode = (messageId: string) => {
    setSelectionMode(true);
    setSelectedMessages(new Set([messageId]));
  };

  const canDeleteMessage = (senderId: string) => {
    return isAdmin || isSuperAdmin || senderId === user?.id;
  };

  const handleMessageLongPress = (message: ChatMessage) => {
    if (selectionMode) return; // Não abre menu se já está em modo seleção

    const isMe = isCurrentUser(message.senderId);
    const canEdit = isMe; // Só o autor pode editar
    const canDelete = canDeleteMessage(message.senderId);

    const options: { text: string; onPress?: () => void; style?: 'cancel' | 'destructive' }[] = [
      {
        text: 'Copiar',
        onPress: () => handleCopyMessage(message.content),
      },
    ];

    if (canEdit) {
      options.push({
        text: 'Editar',
        onPress: () => handleEditMessage(message.id, message.content),
      });
    }

    if (canDelete) {
      options.push({
        text: 'Apagar',
        onPress: () => handleEnterSelectionMode(message.id), // Entra em modo seleção
        style: 'destructive',
      });
    }

    options.push({
      text: 'Cancelar',
      style: 'cancel',
    });

    Alert.alert('Ações', 'Escolha uma ação', options);
  };

  const handleMessagePress = (messageId: string, senderId: string) => {
    if (!selectionMode) return;

    // Em modo seleção, só permite selecionar mensagens que pode deletar
    if (!canDeleteMessage(senderId)) return;

    handleToggleSelection(messageId);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMe = isCurrentUser(item.senderId);
    const isSelected = selectedMessages.has(item.id);
    const canDelete = canDeleteMessage(item.senderId);

    return (
      <TouchableOpacity
        onLongPress={() => handleMessageLongPress(item)}
        onPress={() => handleMessagePress(item.id, item.senderId)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.messageContainer,
            isMe ? styles.currentUserMessage : styles.otherUserMessage,
          ]}
        >
          <View
            style={[
              styles.messageBubble,
              { backgroundColor: colors.card },
              isSelected && {
                backgroundColor: colors.primary + '20',
                borderWidth: 2,
                borderColor: colors.primary,
              },
            ]}
          >
            {selectionMode && canDelete && (
              <View style={styles.selectionIndicator}>
                <Ionicons
                  name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                  size={20}
                  color={isSelected ? colors.primary : colors.border}
                />
              </View>
            )}
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
      </TouchableOpacity>
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
        style={[
          styles.header,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
          selectionMode && styles.headerRow,
        ]}
      >
        {selectionMode ? (
          <>
            <TouchableOpacity onPress={handleCancelSelection} style={styles.headerButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text
              style={[styles.headerTitle, { color: colors.text, flex: 1, textAlign: 'center' }]}
            >
              {selectedMessages.size} selecionada(s)
            </Text>
            <TouchableOpacity
              onPress={handleDeleteSelectedMessages}
              style={styles.headerButton}
              disabled={selectedMessages.size === 0}
            >
              <Ionicons
                name="trash"
                size={24}
                color={selectedMessages.size > 0 ? '#FF3B30' : colors.textSecondary}
              />
            </TouchableOpacity>
          </>
        ) : (
          <Text style={[styles.headerTitle, { color: colors.text, textAlign: 'center' }]}>
            Comunidade T-Black
          </Text>
        )}
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
          {editingMessage && (
            <View style={[styles.editingBar, { backgroundColor: colors.primary + '20' }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.editingLabel, { color: colors.primary }]}>
                  Editando mensagem
                </Text>
                <Text style={[styles.editingText, { color: colors.text }]} numberOfLines={1}>
                  {editingMessage.content}
                </Text>
              </View>
              <TouchableOpacity onPress={handleCancelEdit} style={styles.editingCancel}>
                <Ionicons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.inputRow}>
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
                  name={editingMessage ? 'checkmark' : 'send'}
                  size={20}
                  color={newMessage.trim() ? colors.card : colors.textSecondary}
                />
              )}
            </TouchableOpacity>
          </View>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  headerButton: {
    padding: 8,
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
    paddingRight: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    position: 'relative',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  editingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    borderRadius: 8,
  },
  editingLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  editingText: {
    fontSize: 14,
  },
  editingCancel: {
    padding: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
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
