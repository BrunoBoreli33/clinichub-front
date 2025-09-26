import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Send, Mic, Play, Pause } from "lucide-react";
import { Chat, Message } from "./ChatColumns";

interface ChatWindowProps {
  chat: Chat;
  onClose: () => void;
}

const ChatWindow = ({ chat, onClose }: ChatWindowProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(chat.messages);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioSpeed, setAudioSpeed] = useState<1 | 2>(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  return (
    <Card className="h-full bg-white border-0 shadow-medical flex flex-col">
      {/* Header do Chat */}
      <CardHeader className="pb-3 border-b border-border bg-gradient-to-r from-emerald-50 to-emerald-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-medium">
              {chat.avatar}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{chat.name}</h3>
              <p className="text-xs text-emerald-600">Online</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {chat.tag && (
              <Badge 
                variant="outline"
                className="text-xs"
                style={{ 
                  borderColor: chat.tag.color, 
                  color: chat.tag.color,
                  backgroundColor: `${chat.tag.color}10`
                }}
              >
                {chat.tag.name}
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Mensagens */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${
                    message.sender === "user"
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {message.type === "text" ? (
                    <p className="text-sm">{message.content}</p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => toggleAudio(message.id)}
                      >
                        {playingAudio === message.id ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <span className="text-xs">0:{message.duration || 15}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => setAudioSpeed(audioSpeed === 1 ? 2 : 1)}
                      >
                        {audioSpeed}x
                      </Button>
                    </div>
                  )}
                  <p className={`text-xs mt-1 ${
                    message.sender === "user" ? "text-emerald-100" : "text-gray-500"
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input de Mensagem */}
          <div className="p-4 border-t border-border bg-gray-50">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite uma mensagem..."
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1 bg-white"
              />
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-primary"
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
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