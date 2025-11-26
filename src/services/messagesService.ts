import api from './api';

export interface MessageThread {
  id: number;
  threadId: string;
  participant1Id: number;
  participant2Id: number;
  participant1: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: { name: string };
  };
  participant2: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: { name: string };
  };
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount1: number;
  unreadCount2: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: number;
  threadId: string;
  senderId: number;
  recipientId: number;
  sender: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  recipient: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  content: string;
  subject?: string;
  type: string;
  channel: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface Recipient {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  specialization?: string;
  profileImage?: string;
}

export const messagesService = {
  // Get available recipients (doctors, assistants, admins for patients)
  async getRecipients(): Promise<Recipient[]> {
    const response = await api.get('/messages/recipients');
    return response.data;
  },

  // Get all threads
  async getThreads(filter?: 'all' | 'unread' | 'flagged'): Promise<MessageThread[]> {
    const params = filter ? { filter } : {};
    const response = await api.get('/messages/threads', { params });
    return response.data;
  },

  // Get or create thread
  async getOrCreateThread(participantId: number): Promise<MessageThread> {
    const response = await api.post('/messages/threads', { participantId });
    return response.data;
  },

  // Get messages in a thread
  async getThreadMessages(threadId: string): Promise<Message[]> {
    const response = await api.get(`/messages/threads/${threadId}/messages`);
    return response.data;
  },

  // Send a message
  async sendMessage(data: {
    recipientId: number;
    content: string;
    subject?: string;
    type?: string;
    channel?: string;
    attachmentUrl?: string;
  }): Promise<Message> {
    const response = await api.post('/messages/send', data);
    return response.data;
  },

  // Mark thread as read
  async markThreadAsRead(threadId: string): Promise<void> {
    await api.post(`/messages/threads/${threadId}/read`);
  },

  // Search messages
  async searchMessages(query: string): Promise<Message[]> {
    const response = await api.get('/messages/search', { params: { q: query } });
    return response.data;
  },

  // Get unread count
  async getUnreadCount(): Promise<number> {
    const response = await api.get('/messages/unread-count');
    return response.data.count;
  },
};

