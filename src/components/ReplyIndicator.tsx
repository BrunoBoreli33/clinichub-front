import React from 'react';
import { X, Reply, Image, Mic, FileText, Video } from 'lucide-react';

interface ReplyIndicatorProps {
  replyTo: {
    messageId: string;
    content?: string;
    type: 'text' | 'audio' | 'image' | 'video' | 'document';
    senderName?: string;
    imageUrl?: string;
    audioUrl?: string;
    videoUrl?: string;
    documentUrl?: string;
    fileName?: string;
  };
  onCancel: () => void;
}

const ReplyIndicator: React.FC<ReplyIndicatorProps> = ({ replyTo, onCancel }) => {
  const renderReplyPreview = () => {
    switch (replyTo.type) {
      case 'text':
        return (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700">
              {replyTo.senderName || 'Mensagem'}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {replyTo.content}
            </p>
          </div>
        );
      
      case 'image':
        return (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {replyTo.imageUrl && (
              <img 
                src={replyTo.imageUrl} 
                alt="Imagem" 
                className="w-10 h-10 object-cover rounded"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700">
                {replyTo.senderName || 'Foto'}
              </p>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Image className="h-3 w-3" />
                Foto
              </p>
            </div>
          </div>
        );
      
      case 'audio':
        return (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
              <Mic className="h-5 w-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700">
                {replyTo.senderName || 'Áudio'}
              </p>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Mic className="h-3 w-3" />
                Áudio
              </p>
            </div>
          </div>
        );
      
      case 'video':
        return (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {replyTo.videoUrl && (
              <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                <Video className="h-5 w-5 text-gray-600" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700">
                {replyTo.senderName || 'Vídeo'}
              </p>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Video className="h-3 w-3" />
                Vídeo
              </p>
            </div>
          </div>
        );
      
      case 'document':
        return (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
              <FileText className="h-5 w-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700">
                {replyTo.senderName || 'Documento'}
              </p>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {replyTo.fileName || 'Documento'}
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 border-l-4 border-blue-500 px-3 py-2 mb-1 flex items-center justify-between animate-slideDown">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Reply className="h-4 w-4 text-blue-500 flex-shrink-0" />
        {renderReplyPreview()}
      </div>
      <button
        onClick={onCancel}
        className="ml-2 p-1 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
        title="Cancelar resposta"
      >
        <X className="h-4 w-4 text-gray-500" />
      </button>
    </div>
  );
};

export default ReplyIndicator;