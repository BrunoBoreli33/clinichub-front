// src/types/chat.ts
// ✅ ARQUIVO DE TIPOS COMPARTILHADOS - USE EM TODOS OS COMPONENTES

export interface Tag {
  id: string;
  name: string;
  color: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

// ✅ Interface base do Chat (usado no sistema)
export interface Chat {
  id: string;
  name: string;
  phone: string;
  lastMessageTime: string | null;
  isGroup: boolean;
  unread: number;
  profileThumbnail: string | null;
  column: string;
  tags: Tag[];  // ✅ Array de tags
}

// ✅ Dados dos chats para uso no sistema
export interface ChatsData {
  success: boolean;
  message: string;
  totalChats: number;
  unreadCount: number;
  chats: Chat[];  // ✅ Chats com tags
}

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: "user" | "client";
  type: "text" | "audio";
  duration?: number;
}