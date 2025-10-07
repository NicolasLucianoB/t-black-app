// Chat related types
export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: string;
  createdAt: string;
  updatedAt?: string;

  // Relations
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface CreateMessageRequest {
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
}

// Chat room/channel types (for future expansion)
export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  type: 'general' | 'private' | 'group';
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ChatParticipant {
  id: string;
  roomId: string;
  userId: string;
  joinedAt: string;
  role: 'member' | 'admin' | 'moderator';
}
