import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Send, Mic, Play, Pause } from "lucide-react";

// ✅ CORRIGIDO: Interface atualizada para usar tags
interface Tag {
  id: string;
  name: string;
  color: string;
}

interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: "user" | "client";
  type: "text" | "audio";
  duration?: number;
}

interface Chat {
  id: string;
  name: string;
  phone: string;
  lastMessageTime: string | null;
  isGroup: boolean;
  unread: number;
  profileThumbnail: string | null;
  column: string;
  tags: Tag[];  // ✅ CORRIGIDO: Array de tags ao invés de ticket
}

interface ChatWindowProps {
  chat: Chat;
  onClose: () => void;
}

const ChatWindow = ({ chat, onClose }: ChatWindowProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioSpeed, setAudioSpeed] = useState<1 | 2>(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Carregar mensagens do chat (mock inicial)
    const initialMessages: Message[] = [
      {
        id: "1",
        content: "Olá! Como posso ajudar?",
        timestamp: "10:30",
        sender: "client",
        type: "text"
      }
    ];
    setMessages(initialMessages);
  }, [chat.id]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      sender: "user",
      type: "text"
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");

    // Simular resposta automática
    setTimeout(() => {
      const autoResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "Entendi! Obrigado pela mensagem.",
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        sender: "client",
        type: "text"
      };
      setMessages(prev => [...prev, autoResponse]);
    }, 1000);
  };

  const toggleAudio = (messageId: string) => {
    if (playingAudio === messageId) {
      setPlayingAudio(null);
    } else {
      setPlayingAudio(messageId);
      // Simular fim do áudio
      setTimeout(() => setPlayingAudio(null), 3000);
    }
  };

  const formatTime = (timestamp: string) => {
    return timestamp;
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Card className="h-full bg-white border-0 shadow-2xl rounded-2xl flex flex-col overflow-hidden">
      {/* Header do Chat */}
      <CardHeader className="pb-4 pt-5 px-6 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {chat.profileThumbnail ? (
              <img 
                src={chat.profileThumbnail} 
                alt={chat.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-green-100"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-sm font-semibold ring-2 ring-green-100">
                {getInitials(chat.name)}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900 text-base">{chat.name}</h3>
              <p className="text-xs text-gray-500">{chat.phone}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* ✅ CORRIGIDO: Mostrar múltiplas tags */}
            {chat.tags && chat.tags.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                {chat.tags.slice(0, 2).map(tag => (
                  <Badge 
                    key={tag.id}
                    variant="outline"
                    className="text-xs px-3 py-1"
                    style={{ 
                      borderColor: tag.color,
                      color: tag.color,
                      backgroundColor: `${tag.color}15`
                    }}
                  >
                    {tag.name}
                  </Badge>
                ))}
                {chat.tags.length > 2 && (
                  <Badge 
                    variant="outline"
                    className="text-xs px-2 py-1"
                  >
                    +{chat.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="hover:bg-gray-100 rounded-full h-8 w-8 p-0"
            >
              <X className="h-4 w-4 text-gray-500" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Mensagens */}
      <CardContent className="flex-1 p-0 overflow-hidden bg-gray-50">
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2.5 rounded-2xl shadow-sm ${
                    message.sender === "user"
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-br-md"
                      : "bg-white text-gray-800 border border-gray-100 rounded-bl-md"
                  }`}
                >
                  {message.type === "text" ? (
                    <p className="text-sm">{message.content}</p>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAudio(message.id)}
                        className={`p-2 rounded-full ${
                          message.sender === "user"
                            ? "hover:bg-white/20"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {playingAudio === message.id ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <div className="flex-1">
                        <div className="h-1 bg-gray-300 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              message.sender === "user" ? "bg-white" : "bg-green-500"
                            }`}
                            style={{ width: playingAudio === message.id ? "100%" : "0%" }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs opacity-70">
                            {message.duration || 0}s
                          </span>
                          <button
                            onClick={() => setAudioSpeed(audioSpeed === 1 ? 2 : 1)}
                            className="text-xs opacity-70 hover:opacity-100"
                          >
                            {audioSpeed}x
                          </button>
                        </div>
                      </div>
                      <Mic className="h-4 w-4 opacity-50" />
                    </div>
                  )}
                  <span
                    className={`text-[10px] mt-1 block ${
                      message.sender === "user" ? "text-white/70" : "text-gray-500"
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input de mensagem */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Digite sua mensagem..."
                className="flex-1 rounded-full border-gray-200 focus:ring-2 focus:ring-green-500"
              />
              <Button
                onClick={sendMessage}
                className="rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 h-10 w-10 p-0"
                disabled={!newMessage.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatWindow;