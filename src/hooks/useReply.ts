// hooks/useReply.ts
// Hook customizado para gerenciar a funcionalidade de Reply

import { useState, useCallback } from 'react';
import { buildUrl } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ReplyTarget {
  messageId: string;
  content?: string;
  type: 'text' | 'audio' | 'image' | 'video' | 'document';
  senderName?: string;
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  documentUrl?: string;
  fileName?: string;
}

interface Message {
  messageId: string;
  content?: string;
  senderName?: string;
  fromMe?: boolean;
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  documentUrl?: string;
  fileName?: string;
}

export function useReply(chatId: string) {
  const [replyTo, setReplyTo] = useState<ReplyTarget | null>(null);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const startReply = useCallback((message: Message, type: ReplyTarget['type']) => {
    setReplyTo({
      messageId: message.messageId,
      content: message.content,
      type,
      senderName: message.senderName || message.fromMe ? 'Você' : 'Contato',
      imageUrl: message.imageUrl,
      audioUrl: message.audioUrl,
      videoUrl: message.videoUrl,
      documentUrl: message.documentUrl,
      fileName: message.fileName
    });
  }, []);

  const cancelReply = useCallback(() => {
    setReplyTo(null);
  }, []);

  const sendReply = useCallback(async (content: string) => {
    if (!replyTo) {
      throw new Error('Nenhuma mensagem selecionada para responder');
    }

    if (!content.trim()) {
      toast({
        title: 'Erro',
        description: 'A mensagem não pode estar vazia',
        variant: 'destructive'
      });
      return null;
    }

    setSending(true);
    try {
      const response = await fetch(buildUrl(`/dashboard/messages/reply/${chatId}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content,
          referenceMessageId: replyTo.messageId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao enviar reply');
      }

      const result = await response.json();
      
      // Limpar o reply após envio bem-sucedido
      setReplyTo(null);
      
      toast({
        title: 'Sucesso',
        description: 'Resposta enviada com sucesso'
      });
      
      return result;
    } catch (error: unknown) {
      console.error('Erro ao enviar reply:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Falha ao enviar resposta',
        variant: 'destructive'
      });
      return null;
    } finally {
      setSending(false);
    }
  }, [chatId, replyTo, toast]);

  return {
    replyTo,
    startReply,
    cancelReply,
    sendReply,
    sending
  };
}