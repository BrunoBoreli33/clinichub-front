// ===== Componente ChatCard - ATUALIZADO =====
// Este componente mostra o card de cada chat na lista

import { Badge } from "@/components/ui/badge";
import { Chat } from "@/types/chat";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ChatCardProps {
  chat: Chat;
  isSelected: boolean;
  onClick: () => void;
}

const ChatCard = ({ chat, isSelected, onClick }: ChatCardProps) => {
  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.substring(0, 2).toUpperCase();
  };

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp);
      return formatDistanceToNow(date, { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch {
      return "";
    }
  };

  // ✅ NOVO: Função para truncar a última mensagem se necessário
  const truncateMessage = (message: string | null, maxLength: number = 30) => {
    if (!message) return "Sem mensagens";
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  return (
    <div
      onClick={onClick}
      className={`
        group relative p-3 cursor-pointer transition-all duration-200
        hover:bg-gray-50 border-l-4
        ${isSelected 
          ? "bg-green-50 border-green-500" 
          : "border-transparent hover:border-gray-300"
        }
      `}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        {chat.profileThumbnail ? (
          <img
            src={chat.profileThumbnail}
            alt={chat.name}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-100"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-semibold flex-shrink-0 ring-2 ring-gray-100">
            {getInitials(chat.name)}
          </div>
        )}

        {/* Informações do Chat */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            {/* Nome do Chat */}
            <h4 className="font-semibold text-gray-900 truncate">
              {chat.name}
            </h4>

            {/* Horário da Última Mensagem */}
            {chat.lastMessageTime && (
              <span className="text-xs text-gray-500 flex-shrink-0">
                {formatTime(chat.lastMessageTime)}
              </span>
            )}
          </div>

          {/* ✅ MODIFICADO: Mostrar última mensagem ao invés do telefone */}
          <p className={`text-sm truncate ${
            chat.unread > 0 ? "font-semibold text-gray-900" : "text-gray-600"
          }`}>
            {truncateMessage(chat.lastMessageContent)}
          </p>

          {/* Tags e Badge de Não Lidas */}
          <div className="flex items-center justify-between gap-2 mt-2">
            {/* Tags */}
            {chat.tags && chat.tags.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {chat.tags.slice(0, 2).map((tag) => (
                  <Badge
                    key={tag.id}
                    style={{ backgroundColor: tag.color }}
                    className="text-white text-xs px-2 py-0.5"
                  >
                    {tag.name}
                  </Badge>
                ))}
                {chat.tags.length > 2 && (
                  <Badge className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700">
                    +{chat.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}

            {/* Badge de Mensagens Não Lidas */}
            {chat.unread > 0 && (
              <Badge className="bg-green-500 text-white text-xs px-2 py-0.5 font-bold flex-shrink-0">
                {chat.unread}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatCard;