// utils/messageUtils.ts
// Utilitário para combinar mensagens com seus replies

// Interface para mensagens de texto
export interface TextMessage {
  id: string;
  messageId: string;
  content: string;
  type?: string;
  timestamp: string;
  fromMe: boolean;
  status: string;
  senderName?: string;
  senderPhoto?: string;
  isEdited?: boolean;
}

// Interface para áudios
export interface AudioMessage {
  id: string;
  messageId: string;
  audioUrl: string;
  timestamp: string;
  fromMe: boolean;
  status: string;
  senderName?: string;
  senderPhoto?: string;
}

// Interface para fotos
export interface PhotoMessage {
  id: string;
  messageId: string;
  imageUrl: string;
  caption?: string;
  timestamp: string;
  fromMe: boolean;
  status: string;
  senderName?: string;
  senderPhoto?: string;
}

// Interface para vídeos
export interface VideoMessage {
  id: string;
  messageId: string;
  videoUrl: string;
  caption?: string;
  timestamp: string;
  fromMe: boolean;
  status: string;
  senderName?: string;
  senderPhoto?: string;
}

// Interface para documentos
export interface DocumentMessage {
  id: string;
  messageId: string;
  documentUrl: string;
  fileName?: string;
  timestamp: string;
  fromMe: boolean;
  status: string;
  senderName?: string;
}

// Interface para replies
export interface ReplyMessage {
  id: string;
  messageId: string;
  referenceMessageId: string;
  content?: string;
  audioUrl?: string;
  documentUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  replyType: string;
}

export interface CombinedMessage {
  id: string;
  messageId: string;
  content: string;
  type: string;
  audioUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  documentUrl?: string;
  timestamp: string;
  fromMe: boolean;
  status: string;
  senderName?: string;
  senderPhoto?: string;
  isEdited?: boolean;
  reply?: {
    id: string;
    referenceMessageId: string;
    content?: string;
    audioUrl?: string;
    documentUrl?: string;
    imageUrl?: string;
    videoUrl?: string;
    replyType: string;
  };
}

export function combineMessagesWithReplies(
  messages: TextMessage[],
  audios: AudioMessage[],
  photos: PhotoMessage[],
  videos: VideoMessage[],
  documents: DocumentMessage[],
  replies: ReplyMessage[]
): CombinedMessage[] {
  const allItems: CombinedMessage[] = [];
  
  // Criar um mapa de replies por messageId para acesso rápido
  const repliesMap = new Map<string, ReplyMessage>();
  replies.forEach(reply => {
    repliesMap.set(reply.messageId, reply);
  });
  
  // Processar mensagens de texto
  messages.forEach(msg => {
    const item: CombinedMessage = {
      ...msg,
      type: msg.type || 'text',
      reply: repliesMap.get(msg.messageId)
    };
    allItems.push(item);
  });
  
  // Processar áudios
  audios.forEach(audio => {
    const item: CombinedMessage = {
      id: audio.id,
      messageId: audio.messageId,
      content: '🎤 Áudio',
      type: 'audio',
      audioUrl: audio.audioUrl,
      timestamp: audio.timestamp,
      fromMe: audio.fromMe,
      status: audio.status,
      senderName: audio.senderName,
      senderPhoto: audio.senderPhoto,
      reply: repliesMap.get(audio.messageId)
    };
    allItems.push(item);
  });
  
  // Processar fotos
  photos.forEach(photo => {
    const item: CombinedMessage = {
      id: photo.id,
      messageId: photo.messageId,
      content: photo.caption || '🖼️ Foto',
      type: 'image',
      imageUrl: photo.imageUrl,
      timestamp: photo.timestamp,
      fromMe: photo.fromMe,
      status: photo.status,
      senderName: photo.senderName,
      senderPhoto: photo.senderPhoto,
      reply: repliesMap.get(photo.messageId)
    };
    allItems.push(item);
  });
  
  // Processar vídeos
  videos.forEach(video => {
    const item: CombinedMessage = {
      id: video.id,
      messageId: video.messageId,
      content: video.caption || '🎥 Vídeo',
      type: 'video',
      videoUrl: video.videoUrl,
      timestamp: video.timestamp,
      fromMe: video.fromMe,
      status: video.status,
      senderName: video.senderName,
      reply: repliesMap.get(video.messageId)
    };
    allItems.push(item);
  });
  
  // Processar documentos
  documents.forEach(doc => {
    const item: CombinedMessage = {
      id: doc.id,
      messageId: doc.messageId,
      content: doc.fileName || '📄 Documento',
      type: 'document',
      documentUrl: doc.documentUrl,
      timestamp: doc.timestamp,
      fromMe: doc.fromMe,
      status: doc.status,
      senderName: doc.senderName,
      reply: repliesMap.get(doc.messageId)
    };
    allItems.push(item);
  });
  
  // Ordenar por timestamp
  allItems.sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime();
    const dateB = new Date(b.timestamp).getTime();
    return dateA - dateB;
  });
  
  return allItems;
}

// Função para buscar mensagem original pelo ID de referência
export function findOriginalMessage(
  referenceMessageId: string,
  messages: TextMessage[],
  audios: AudioMessage[],
  photos: PhotoMessage[],
  videos: VideoMessage[],
  documents: DocumentMessage[]
): CombinedMessage | null {
  // Buscar em mensagens de texto
  const original = messages.find(m => m.messageId === referenceMessageId);
  if (original) return { ...original, type: 'text', content: original.content };
  
  // Buscar em áudios
  const audioOriginal = audios.find(a => a.messageId === referenceMessageId);
  if (audioOriginal) return { 
    ...audioOriginal, 
    type: 'audio',
    content: '🎤 Áudio'
  };
  
  // Buscar em fotos
  const photoOriginal = photos.find(p => p.messageId === referenceMessageId);
  if (photoOriginal) return { 
    ...photoOriginal, 
    type: 'image',
    content: photoOriginal.caption || '🖼️ Foto'
  };
  
  // Buscar em vídeos
  const videoOriginal = videos.find(v => v.messageId === referenceMessageId);
  if (videoOriginal) return { 
    ...videoOriginal, 
    type: 'video',
    content: videoOriginal.caption || '🎥 Vídeo'
  };
  
  // Buscar em documentos
  const docOriginal = documents.find(d => d.messageId === referenceMessageId);
  if (docOriginal) return { 
    ...docOriginal, 
    type: 'document',
    content: docOriginal.fileName || '📄 Documento'
  };
  
  return null;
}