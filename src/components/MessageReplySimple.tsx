import React from 'react';
import { Reply, Image, Mic, FileText, Video } from 'lucide-react';

interface MessageReplySimpleProps {
  messageId: string;
  replies: Array<{
    id: string;
    messageId: string;
    referenceMessageId: string;
    messageContent?: string;
    mensagemEnviada?: string;
    senderName?: string;
    audioUrl?: string;
    documentUrl?: string;
    imageUrl?: string;
    videoUrl?: string;
    replyType: string;
    fromMe: boolean;
    timestamp: string;
    originalMessageNotFound?: boolean;
    original_message_not_found?: boolean;
  }>;
  onReplyClick?: (referenceMessageId: string) => void;
}

const MessageReplySimple: React.FC<MessageReplySimpleProps> = ({ messageId, replies, onReplyClick }) => {
  // Buscar se esta mensagem tem um reply
  const reply = replies.find(r => r.messageId === messageId);

  if (!reply) {
    return null;
  }

  // ✅ Verificar se a mensagem original não foi encontrada
  const isNotFound = reply.originalMessageNotFound === true || reply.original_message_not_found === true;

  // ✅ Detectar tipo real baseado no conteúdo (caso venha como 'unknown')
  let actualType = reply.replyType;
  if (actualType === 'unknown' || !actualType) {
    if (reply.audioUrl) actualType = 'audio';
    else if (reply.imageUrl) actualType = 'image';
    else if (reply.videoUrl) actualType = 'video';
    else if (reply.documentUrl) actualType = 'document';
    else if (reply.messageContent) actualType = 'text';
  }

  // ✅ Handler para clique no reply
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Só permite clique se a mensagem original foi encontrada
    if (!isNotFound && onReplyClick) {
      console.log('🖱️ Clique no reply:', reply.referenceMessageId);
      onReplyClick(reply.referenceMessageId);
    }
  };

  const renderReplyPreview = () => {
    // ✅ Se a mensagem não foi encontrada, mostrar layout especial
    if (isNotFound) {
      return (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1">
            <Reply className="h-3 w-3 text-blue-500 flex-shrink-0" />
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
              {reply.senderName || 'Contato'}
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 italic ml-4">
            Mensagem respondida!
          </div>
        </div>
      );
    }

    switch (actualType) {
      case 'text':
        return (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1">
              <Reply className="h-3 w-3 text-blue-500 flex-shrink-0" />
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                {reply.senderName || 'Contato'}
              </span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 italic ml-4">
              {reply.messageContent ? (
                <span className="line-clamp-1">{reply.messageContent}</span>
              ) : (
                <span>Mensagem de texto</span>
              )}
            </div>
          </div>
        );
      
      case 'image':
        return (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1">
              <Reply className="h-3 w-3 text-blue-500 flex-shrink-0" />
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                {reply.senderName || 'Contato'}
              </span>
            </div>
            <div className="flex items-center gap-2 ml-4">
              {reply.imageUrl && (
                <img 
                  src={reply.imageUrl} 
                  alt="Reply" 
                  className="w-8 h-8 object-cover rounded"
                />
              )}
              <span className="text-xs text-gray-600 dark:text-gray-400 italic flex items-center gap-1">
                <Image className="h-3 w-3" />
                Foto
              </span>
            </div>
          </div>
        );
      
      case 'audio':
        return (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1">
              <Reply className="h-3 w-3 text-blue-500 flex-shrink-0" />
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                {reply.senderName || 'Contato'}
              </span>
            </div>
            <div className="ml-4">
              <span className="text-xs text-gray-600 dark:text-gray-400 italic flex items-center gap-1">
                <Mic className="h-3 w-3" />
                Áudio
              </span>
            </div>
          </div>
        );
      
      case 'video':
        return (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1">
              <Reply className="h-3 w-3 text-blue-500 flex-shrink-0" />
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                {reply.senderName || 'Contato'}
              </span>
            </div>
            <div className="flex items-center gap-2 ml-4">
              {reply.videoUrl && (
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                  <Video className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
              )}
              <span className="text-xs text-gray-600 dark:text-gray-400 italic flex items-center gap-1">
                <Video className="h-3 w-3" />
                Vídeo
              </span>
            </div>
          </div>
        );
      
      case 'document':
        return (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1">
              <Reply className="h-3 w-3 text-blue-500 flex-shrink-0" />
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                {reply.senderName || 'Contato'}
              </span>
            </div>
            <div className="ml-4">
              <span className="text-xs text-gray-600 dark:text-gray-400 italic flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Documento
              </span>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div 
      className={`bg-gray-50 dark:bg-gray-800 px-2 py-1.5 rounded-t-lg mb-1 border-l-2 border-blue-500 dark:border-blue-400 ${
        !isNotFound ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors' : ''
      }`}
      onClick={handleClick}
    >
      {renderReplyPreview()}
    </div>
  );
};

export default MessageReplySimple;