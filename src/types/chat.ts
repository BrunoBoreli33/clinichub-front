// ===== src/types/chat.ts - COMPLETO COM TODOS OS TIPOS =====

export interface Tag {
  id: string;
  name: string;
  color: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

// ✅ Interface atualizada do Chat com lastMessageContent
export interface Chat {
  id: string;
  name: string;
  phone: string;
  lastMessageTime: string | null;
  lastMessageContent: string | null;  // ✅ NOVO CAMPO
  isGroup: boolean;
  unread: number;
  profileThumbnail: string | null;
  column: string;
  tags: Tag[];
  isUploadChat: boolean;  // ✅ NOVO CAMPO
  isHidden: boolean;
}

export interface ChatsData {
  success: boolean;
  message: string;
  totalChats: number;
  unreadCount: number;
  chats: Chat[];
}

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: "user" | "client";
  type: "text" | "audio";
  duration?: number;
}

// ✅ Interface para notificações SSE - Mensagem Recebida
export interface NewMessageNotification {
  chatId: string;
  chatName: string;
  chatPhone: string;
  message: string;
  lastMessageContent: string;
  unreadCount: number;
  isNewChat: boolean;
  profileThumbnail: string | null;
  lastMessageTime: string | null;
  column: string;
  isGroup: boolean;
}

// ✅ Interface para notificações SSE - Mensagem Enviada
export interface ChatUpdateNotification {
  chatId: string;
  chatName: string;
  chatPhone: string;
  lastMessageContent: string;
  unreadCount: number;
  profileThumbnail: string | null;
  lastMessageTime: string | null;
  column: string;
  isGroup: boolean;
}

// ✅ NOVO: Interface para notificações SSE - Tag Atualizada
export interface TagUpdateNotification {
  tagId: string;
  tagName: string;
  tagColor: string;
  userId: string;
  action: 'created' | 'updated';
}

// ✅ NOVO: Interface para notificações SSE - Tag Deletada
export interface TagDeleteNotification {
  tagId: string;
  tagName: string;
  userId: string;
}