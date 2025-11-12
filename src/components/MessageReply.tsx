import React from 'react';
import { Reply, Image, Mic, FileText, Video } from 'lucide-react';

interface OriginalMessage {
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
}

interface MessageReplyProps {
  reply: {
    id: string;
    messageId: string;
    referenceMessageId: string;
    content?: string;
    audioUrl?: string;
    documentUrl?: string;
    imageUrl?: string;
    videoUrl?: string;
    replyType: string;
    fromMe: boolean;
    timestamp: string;
  };
  originalMessage?: OriginalMessage;
}

const MessageReply: React.FC<MessageReplyProps> = ({ reply, originalMessage }) => {
  const renderReplyContent = () => {
    switch (reply.replyType) {
      case 'text':
        return (
          <div className="flex items-start gap-1">
            <Reply className="h-3 w-3 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-gray-600 italic">
              {originalMessage?.content ? (
                <span className="line-clamp-1">{originalMessage.content}</span>
              ) : (
                <span>Mensagem de texto</span>
              )}
            </div>
          </div>
        );
      
      case 'image':
        return (
          <div className="flex items-center gap-2">
            <Reply className="h-3 w-3 text-gray-500 flex-shrink-0" />
            {reply.imageUrl && (
              <img 
                src={reply.imageUrl} 
                alt="Reply" 
                className="w-8 h-8 object-cover rounded"
              />
            )}
            <span className="text-xs text-gray-600 italic flex items-center gap-1">
              <Image className="h-3 w-3" />
              Foto
            </span>
          </div>
        );
      
      case 'audio':
        return (
          <div className="flex items-center gap-2">
            <Reply className="h-3 w-3 text-gray-500 flex-shrink-0" />
            <span className="text-xs text-gray-600 italic flex items-center gap-1">
              <Mic className="h-3 w-3" />
              Áudio
            </span>
          </div>
        );
      
      case 'video':
        return (
          <div className="flex items-center gap-2">
            <Reply className="h-3 w-3 text-gray-500 flex-shrink-0" />
            {reply.videoUrl && (
              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                <Video className="h-4 w-4 text-gray-600" />
              </div>
            )}
            <span className="text-xs text-gray-600 italic flex items-center gap-1">
              <Video className="h-3 w-3" />
              Vídeo
            </span>
          </div>
        );
      
      case 'document':
        return (
          <div className="flex items-center gap-2">
            <Reply className="h-3 w-3 text-gray-500 flex-shrink-0" />
            <span className="text-xs text-gray-600 italic flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Documento
            </span>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-t-lg mb-0.5 border-l-2 border-gray-300 dark:border-gray-600">
      {renderReplyContent()}
    </div>
  );
};

export default MessageReply;