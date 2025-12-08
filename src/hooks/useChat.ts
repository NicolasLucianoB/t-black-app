import { useCallback, useEffect, useState } from 'react';

import { databaseService } from '../services';
import { supabase } from '../services/supabase';
import { ChatMessage, CreateMessageRequest } from '../types';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial messages
  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const data = await databaseService.chat.getMessages(50);
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Send new message
  const sendMessage = async (
    content: string,
    senderId: string,
    senderName: string,
    senderAvatar?: string,
  ) => {
    if (!content.trim()) return null;

    try {
      setSendingMessage(true);
      setError(null);

      const messageData: CreateMessageRequest = {
        content: content.trim(),
        senderId,
        senderName,
        senderAvatar,
      };

      const newMessage = await databaseService.chat.sendMessage(messageData);

      if (!newMessage) {
        setError('Erro ao enviar mensagem');
        return null;
      }

      return newMessage;
    } catch (error) {
      setError('Erro ao enviar mensagem');
      return null;
    } finally {
      setSendingMessage(false);
    }
  };

  // Delete message (only for message sender or admin)
  const deleteMessage = async (messageId: string) => {
    try {
      const success = await databaseService.chat.deleteMessage(messageId);
      if (success) {
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      }
      return success;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  };

  // Edit message (only for message sender)
  const editMessage = async (messageId: string, newContent: string) => {
    try {
      const success = await databaseService.chat.updateMessage(messageId, newContent.trim());
      if (success) {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === messageId ? { ...msg, content: newContent.trim() } : msg)),
        );
      }
      return success;
    } catch (error) {
      console.error('Error editing message:', error);
      return false;
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    loadMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('messages_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          console.log('New message received:', payload);

          // Convert the new message from snake_case to camelCase
          const newMessage: ChatMessage = {
            id: payload.new.id,
            content: payload.new.content,
            senderId: payload.new.sender_id,
            senderName: payload.new.sender_name,
            senderAvatar: payload.new.sender_avatar,
            timestamp: payload.new.created_at,
            createdAt: payload.new.created_at,
            updatedAt: payload.new.updated_at,
          };

          setMessages((prev) => [...prev, newMessage]);
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          console.log('Message deleted:', payload);
          setMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id));
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          console.log('Message updated:', payload);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.new.id
                ? { ...msg, content: payload.new.content, updatedAt: payload.new.updated_at }
                : msg,
            ),
          );
        },
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadMessages]);

  return {
    messages,
    loading,
    sendingMessage,
    error,
    sendMessage,
    deleteMessage,
    editMessage,
    refetch: loadMessages,
  };
}
