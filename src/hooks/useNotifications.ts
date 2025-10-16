import { useEffect, useRef, useCallback } from 'react';
import { buildUrl } from '@/lib/api';

// ✅ EXPORTAR os tipos para uso no Dashboard e outros componentes
export interface NewMessageNotification {
  chatId: string;
  chatName: string;
  message: string;
  unreadCount: number;
  lastMessageTime?: string;
}

export interface ChatUpdateNotification {
  chatId: string;
  chatName: string;
  lastMessageContent?: string;
}

export interface TagUpdateNotification {
  tagId: string;
  tagName: string;
  color?: string;
}

export interface TagDeleteNotification {
  tagId: string;
  tagName: string;
}

interface UseNotificationsOptions {
  onNewMessage?: (data: NewMessageNotification) => void;
  onChatUpdate?: (data: ChatUpdateNotification) => void;
  onTagUpdate?: (data: TagUpdateNotification) => void;
  onTagDelete?: (data: TagDeleteNotification) => void;
  onConnected?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Hook personalizado para conectar ao SSE e receber notificações em tempo real
 */
export const useNotifications = (options: UseNotificationsOptions = {}) => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000; // 3 segundos
  
  // ✅ Armazenar callbacks em refs para evitar reconexões desnecessárias
  const callbacksRef = useRef(options);
  
  // ✅ Atualizar refs quando callbacks mudarem
  useEffect(() => {
    callbacksRef.current = options;
  }, [options]);
  
  // ✅ Controle de mensagens já processadas para evitar sons duplicados
  const processedMessagesRef = useRef<Set<string>>(new Set());
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ Limpar mensagens antigas do cache a cada 60 segundos
  useEffect(() => {
    cleanupIntervalRef.current = setInterval(() => {
      // Manter apenas as últimas 100 mensagens
      if (processedMessagesRef.current.size > 100) {
        const messagesArray = Array.from(processedMessagesRef.current);
        processedMessagesRef.current = new Set(messagesArray.slice(-50));
        console.log('🧹 Cache de mensagens processadas limpo');
      }
    }, 60000);

    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
    };
  }, []);

  // ✅ Verificar se mensagem já foi processada
  const isMessageProcessed = useCallback((chatId: string, message: string, timestamp?: string) => {
    // Criar chave única para a mensagem
    const messageKey = `${chatId}:${message.substring(0, 50)}:${timestamp || 'no-timestamp'}`;
    return processedMessagesRef.current.has(messageKey);
  }, []);

  // ✅ Marcar mensagem como processada
  const markMessageAsProcessed = useCallback((chatId: string, message: string, timestamp?: string) => {
    const messageKey = `${chatId}:${message.substring(0, 50)}:${timestamp || 'no-timestamp'}`;
    processedMessagesRef.current.add(messageKey);
  }, []);

  // ✅ Tocar som de notificação apenas se não foi processada - CORRIGIDO
  const playNotificationSound = useCallback(async (chatId: string, message: string, timestamp?: string) => {
    // Verificar se já processou esta mensagem
    if (isMessageProcessed(chatId, message, timestamp)) {
      console.log('🔇 Som não tocado - mensagem já processada:', chatId);
      return;
    }

    try {
      // ✅ CORRIGIDO: Apenas caminhos corretos, sem /public/
      const possiblePaths = [
        '/notification.mp3',
        '/notification.MP3'
      ];

      let audioPlayed = false;

      // ✅ CORRIGIDO: Usar for...of com await para tentar cada caminho sequencialmente
      for (const path of possiblePaths) {
        if (audioPlayed) break; // Parar se já tocou com sucesso

        try {
          const audio = new Audio(path);
          audio.volume = 0.5;
          
          // ✅ CORRIGIDO: Aguardar a Promise completar antes de continuar
          await audio.play();
          
          console.log(`🔊 Som de notificação tocado: ${path}`);
          audioPlayed = true;
          
          // ✅ Marcar como processada após tocar o som com sucesso
          markMessageAsProcessed(chatId, message, timestamp);
          
        } catch (err) {
          console.debug(`Tentativa com caminho ${path} falhou:`, err);
          // Continuar para o próximo caminho
        }
      }

      if (!audioPlayed) {
        console.warn('⚠️ Não foi possível reproduzir o som de notificação em nenhum dos caminhos');
      }
    } catch (error) {
      console.error('❌ Erro ao tocar som de notificação:', error);
    }
  }, [isMessageProcessed, markMessageAsProcessed]);

  const connect = useCallback(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.warn('⚠️ Token não encontrado, não é possível conectar ao SSE');
      return;
    }

    try {
      // Fechar conexão anterior se existir
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      console.log('📡 Conectando ao SSE...');

      // Criar nova conexão SSE com token no header via URL params
      const url = buildUrl(`/api/notifications/stream?token=${encodeURIComponent(token)}`);
      const eventSource = new EventSource(url);

      eventSource.onopen = () => {
        console.log('✅ Conexão SSE estabelecida');
        reconnectAttempts.current = 0;
        callbacksRef.current.onConnected?.();
      };

      // Evento de conexão confirmada
      eventSource.addEventListener('connected', (event) => {
        console.log('📢 SSE conectado:', JSON.parse(event.data));
      });

      // ✅ Evento de nova mensagem RECEBIDA (com som - 1 vez apenas)
      eventSource.addEventListener('new-message', (event) => {
        try {
          const data: NewMessageNotification = JSON.parse(event.data);
          console.log('📨 Nova mensagem recebida via SSE:', data);

          // ✅ Tocar som apenas se não foi processada (controle de duplicatas)
          playNotificationSound(data.chatId, data.message, data.lastMessageTime || undefined);

          // Chamar callback
          callbacksRef.current.onNewMessage?.(data);

        } catch (error) {
          console.error('Erro ao processar notificação:', error);
        }
      });

      // Evento de atualização de chat ENVIADA (sem som)
      eventSource.addEventListener('chat-update', (event) => {
        try {
          const data: ChatUpdateNotification = JSON.parse(event.data);
          console.log('🔄 Atualização de chat via SSE:', data);

          // NÃO tocar som, apenas atualizar dados
          callbacksRef.current.onChatUpdate?.(data);

        } catch (error) {
          console.error('Erro ao processar atualização de chat:', error);
        }
      });

      // Evento de atualização de tag
      eventSource.addEventListener('tag-update', (event) => {
        try {
          const data: TagUpdateNotification = JSON.parse(event.data);
          console.log('🏷️ Atualização de tag via SSE:', data);
          callbacksRef.current.onTagUpdate?.(data);
        } catch (error) {
          console.error('Erro ao processar atualização de tag:', error);
        }
      });

      // Evento de exclusão de tag
      eventSource.addEventListener('tag-delete', (event) => {
        try {
          const data: TagDeleteNotification = JSON.parse(event.data);
          console.log('🗑️ Exclusão de tag via SSE:', data);
          callbacksRef.current.onTagDelete?.(data);
        } catch (error) {
          console.error('Erro ao processar exclusão de tag:', error);
        }
      });

      eventSource.onerror = (error) => {
        console.error('❌ Erro na conexão SSE:', error);
        eventSource.close();

        // Tentar reconectar
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          console.log(`🔄 Tentando reconectar... (${reconnectAttempts.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelay);
        } else {
          console.error('❌ Número máximo de tentativas de reconexão atingido');
          callbacksRef.current.onError?.(new Error('Falha ao conectar ao servidor de notificações'));
        }
      };

      eventSourceRef.current = eventSource;

    } catch (error) {
      console.error('❌ Erro ao conectar SSE:', error);
      callbacksRef.current.onError?.(error as Error);
    }
  }, [playNotificationSound]); // ✅ Removido 'options' das dependências

  const disconnect = useCallback(() => {
    console.log('🔌 Desconectando SSE...');
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // Limpar cache de mensagens processadas ao desconectar
    processedMessagesRef.current.clear();
  }, []);

  // Conectar automaticamente quando o hook é montado
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connect,
    disconnect,
    isConnected: eventSourceRef.current !== null && eventSourceRef.current.readyState === EventSource.OPEN,
  };
};