import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  X, 
  Send, 
  Mic, 
  Paperclip, 
  Phone, 
  Video, 
  MoreVertical,
  Play,
  Pause,
  Volume2
} from "lucide-react";
import type { Chat, ChatTag } from "@/components/ChatColumns";

interface Message {
  id: string;
  content: string;
  type: "text" | "audio" | "image";
  sender: "user" | "client";
  timestamp: string;
  audioUrl?: string;
  duration?: number;
}

interface ChatWindowProps {
  chat: Chat;
  onClose: () => void;
  tags: ChatTag[];
}

const mockMessages: Message[] = [
  {
    id: "1",
    content: "Olá! Gostaria de saber mais sobre o procedimento de botox.",
    type: "text",
    sender: "client",
    timestamp: "14:28"
  },
  {
    id: "2", 
    content: "Olá Maria! Claro, ficarei feliz em te ajudar. O botox é um procedimento minimamente invasivo...",
    type: "text",
    sender: "user",
    timestamp: "14:29"
  },
  {
    id: "3",
    content: "Audio message",
    type: "audio",
    sender: "client",
    timestamp: "14:30",
    audioUrl: "/audio-sample.mp3",
    duration: 15
  }
];

export const ChatWindow = ({ chat, onClose, tags }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2>(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      type: "text",
      sender: "user",
      timestamp: new Date().toLocaleTimeString("pt-BR", { 
        hour: "2-digit", 
        minute: "2-digit" 
      })
    };

    setMessages([...messages, message]);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleAudioPlayback = (audioId: string) => {
    if (playingAudio === audioId) {
      setPlayingAudio(null);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    } else {
      setPlayingAudio(audioId);
      if (audioRef.current) {
        audioRef.current.playbackRate = playbackSpeed;
        audioRef.current.play();
      }
    }
  };

  const togglePlaybackSpeed = () => {
    const newSpeed = playbackSpeed === 1 ? 2 : 1;
    setPlaybackSpeed(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  };

  return (
    <Card className="h-full overflow-hidden shadow-medical">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={chat.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {chat.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <CardTitle className="text-lg">{chat.name}</CardTitle>
              <p className="text-sm text-muted-foreground">Online</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {chat.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {chat.tags.map((tagId) => {
              const tag = tags.find(t => t.id === tagId);
              return tag ? (
                <Badge
                  key={tagId}
                  variant="outline"
                  style={{ 
                    borderColor: tag.color,
                    color: tag.color,
                    backgroundColor: `${tag.color}10`
                  }}
                >
                  {tag.name}
                </Badge>
              ) : null;
            })}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex flex-col h-full p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {message.type === "text" ? (
                  <p className="text-sm">{message.content}</p>
                ) : message.type === "audio" ? (
                  <div className="flex items-center gap-2 min-w-[200px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => toggleAudioPlayback(message.id)}
                    >
                      {playingAudio === message.id ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <div className="flex-1 h-2 bg-background/20 rounded-full overflow-hidden">
                      <div className="h-full bg-current opacity-60 rounded-full w-1/3"></div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={togglePlaybackSpeed}
                    >
                      {playbackSpeed}x
                    </Button>
                    
                    <span className="text-xs opacity-70">{message.duration}s</span>
                    
                    <audio
                      ref={audioRef}
                      src={message.audioUrl}
                      onEnded={() => setPlayingAudio(null)}
                    />
                  </div>
                ) : null}
                
                <div className="flex justify-end mt-1">
                  <span className="text-xs opacity-70">{message.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="border-t p-4">
          <div className="flex items-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={`${isRecording ? "text-destructive" : ""}`}
              onClick={() => setIsRecording(!isRecording)}
            >
              <Mic className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="sm">
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <div className="flex-1">
              <Input
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="resize-none"
              />
            </div>
            
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {isRecording && (
            <div className="mt-2 p-2 bg-destructive/10 rounded-lg flex items-center gap-2">
              <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
              <span className="text-sm text-destructive">Gravando áudio...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};