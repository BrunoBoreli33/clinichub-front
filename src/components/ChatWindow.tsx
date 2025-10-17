import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { X, Send, MoreVertical, Loader2, Edit, Check, Play, Pause } from "lucide-react";
import { buildUrl } from "@/lib/api";
import EmojiPicker from "./EmojiPicker";
import AudioRecorder from "./AudioRecorder";

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface Message {
  id: string;
  messageId: string;
  content: string;
  type: string;
  audioUrl?: string;
  audioDuration?: number;
  timestamp: string;
  fromMe: boolean;
  status: string;
  senderName?: string;
  senderPhoto?: string;
  isEdited?: boolean;
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
  tags: Tag[];
}

interface ChatWindowProps {
  chat: Chat;
  onClose: () => void;
}

const ChatWindow = ({ chat, onClose }: ChatWindowProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [shouldAutoFocus, setShouldAutoFocus] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isInitialLoadRef = useRef(true);

  // ✅ CORRIGIDO: Scroll inicial garantido com useLayoutEffect (antes da renderização)
  useLayoutEffect(() => {
    if (isInitialLoadRef.current && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
      isInitialLoadRef.current = false;
    }
  }, [messages]);

  // Auto-focus e scroll suave após carregamento inicial
  useEffect(() => {
    if (!isInitialLoadRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    
    if (shouldAutoFocus && messages.length > 0 && !editingMessageId) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [messages.length, editingMessageId, shouldAutoFocus]);

  // Carregar mensagens ao abrir chat
  useEffect(() => {
    loadMessages();
  }, [chat.id]);

  // ✅ Marcar chat como lido ao abrir
  useEffect(() => {
    markChatAsRead();
  }, [chat.id]);

  // Detectar cliques fora do input
  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    
    const handleClickOutsideInput = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const clickedInput = inputRef.current?.contains(target);
      
      if (!clickedInput) {
        setShouldAutoFocus(false);
      }
    };

    if (messagesContainer) {
      messagesContainer.addEventListener('mousedown', handleClickOutsideInput);
    }

    return () => {
      if (messagesContainer) {
        messagesContainer.removeEventListener('mousedown', handleClickOutsideInput);
      }
    };
  }, []);

  const markChatAsRead = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(buildUrl(`/dashboard/chats/${chat.id}/mark-read`), {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        console.log("✅ Chat marcado como lido no backend");
      }
    } catch (error) {
      console.error("❌ Erro ao marcar chat como lido:", error);
    }
  };

  const loadMessages = async (silent = false) => {
    if (!silent) setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(buildUrl(`/dashboard/messages/${chat.id}`), {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const text = await response.text();
      if (!text) {
        setMessages([]);
        return;
      }

      const data = JSON.parse(text);
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    const messageContent = newMessage;
    const tempId = `temp_${Date.now()}`;
    setNewMessage("");

    setShouldAutoFocus(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

    const optimisticMessage: Message = {
      id: tempId,
      messageId: tempId,
      content: messageContent,
      type: "text",
      timestamp: new Date().toISOString(),
      fromMe: true,
      status: "SENDING",
      isEdited: false,
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    setSending(true);
    const token = localStorage.getItem("token");

    try {
      const body = {
        chatId: chat.id,
        phone: chat.phone,
        message: messageContent,
      };

      const response = await fetch(buildUrl('/dashboard/messages/send'), {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const text = await response.text();
      if (!response.ok) {
        setMessages(prev => prev.filter(msg => msg.id !== tempId));
        setNewMessage(messageContent);
        throw new Error(`Erro ${response.status}: ${text}`);
      }

      const data = JSON.parse(text);
      if (data.success && data.data) {
        setMessages(prev => prev.map(msg => 
          msg.id === tempId ? { 
            ...msg, 
            id: data.data.id, 
            messageId: data.data.messageId, 
            status: data.data.status || "SENT"
          } : msg
        ));
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      alert("Erro ao enviar mensagem: " + (error as Error).message);
    } finally {
      setSending(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  const sendAudio = async (audioBase64: string, duration: number) => {
    const tempId = `temp_audio_${Date.now()}`;

    const optimisticAudio: Message = {
      id: tempId,
      messageId: tempId,
      content: "🎤 Áudio",
      type: "audio",
      audioUrl: audioBase64,
      audioDuration: duration,
      timestamp: new Date().toISOString(),
      fromMe: true,
      status: "SENDING",
      isEdited: false,
    };

    setMessages(prev => [...prev, optimisticAudio]);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    setSending(true);
    const token = localStorage.getItem("token");

    try {
      const body = {
        chatId: chat.id,
        phone: chat.phone,
        audio: audioBase64,
        duration: duration,
        waveform: true,
      };

      const response = await fetch(buildUrl('/dashboard/messages/send-audio'), {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const text = await response.text();
      if (!response.ok) {
        setMessages(prev => prev.filter(msg => msg.id !== tempId));
        throw new Error(`Erro ${response.status}: ${text}`);
      }

      const data = JSON.parse(text);
      if (data.success && data.data) {
        setMessages(prev => prev.map(msg => 
          msg.id === tempId ? { 
            ...msg, 
            id: data.data.id, 
            messageId: data.data.messageId, 
            status: data.data.status || "SENT"
          } : msg
        ));
      }
    } catch (error) {
      console.error("Erro ao enviar áudio:", error);
      alert("Erro ao enviar áudio: " + (error as Error).message);
    } finally {
      setSending(false);
    }
  };

  const playAudio = (audioUrl: string, messageId: string) => {
    if (playingAudio === messageId) {
      audioRef.current?.pause();
      setPlayingAudio(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => {
        setPlayingAudio(null);
      };
      audio.play();
      setPlayingAudio(messageId);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShouldAutoFocus(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const startEdit = (message: Message) => {
    setEditingMessageId(message.messageId);
    setEditContent(message.content);
  };

  const saveEdit = async (messageId: string) => {
    if (!editContent.trim()) return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(buildUrl('/dashboard/messages/edit'), {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: chat.phone,
          editMessageId: messageId,
          message: editContent,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setEditingMessageId(null);
        setEditContent("");
        loadMessages();
      }
    } catch (error) {
      console.error("Erro ao editar mensagem:", error);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.substring(0, 2).toUpperCase();
  };

  const renderMessageStatus = (message: Message) => {
    if (!message.fromMe) return null;

    if (message.status === "SENDING") {
      return <Loader2 className="h-3 w-3 animate-spin ml-1 text-white/70" />;
    }

    return null;
  };

  return (
  <Card className="h-full bg-base-100 border-0 shadow-2xl rounded-2xl flex flex-col overflow-hidden">
  <CardHeader className="pb-4 pt-5 px-4 sm:px-6 border-b border-base-200 bg-base-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {chat.profileThumbnail ? (
              <img
                src={chat.profileThumbnail}
                alt={chat.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-green-100"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-semibold text-lg ring-2 ring-green-100">
                {getInitials(chat.name)}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{chat.name}</h3>
              <p className="text-xs text-gray-500">{chat.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {chat.tags && chat.tags.length > 0 && (
              <div className="flex gap-1">
                {chat.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    style={{ backgroundColor: tag.color }}
                    className="text-white text-xs px-2 py-0.5"
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-500" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0">
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-base-100"
          >
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-green-500" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                Nenhuma mensagem ainda
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.fromMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`group max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2 ${
                      message.fromMe
                        ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white"
                        : "bg-white text-gray-900 shadow-sm border border-gray-100"
                    }`}
                  >
                    {message.type === "audio" ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <Button
                            size="sm"
                            onClick={() => playAudio(message.audioUrl!, message.messageId)}
                            className={`h-8 w-8 p-0 rounded-full ${
                              message.fromMe 
                                ? "bg-white/20 hover:bg-white/30 text-white" 
                                : "bg-green-500 hover:bg-green-600 text-white"
                            }`}
                          >
                            {playingAudio === message.messageId ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4 ml-0.5" />
                            )}
                          </Button>
                          <div className="flex-1 relative">
                            <div className={`h-1 rounded-full ${
                              message.fromMe ? "bg-white/30" : "bg-gray-200"
                            }`}>
                              <div 
                                className={`h-full rounded-full ${
                                  message.fromMe ? "bg-white/60" : "bg-green-500"
                                }`}
                                style={{
                                  width: playingAudio === message.messageId ? "100%" : "0%",
                                  transition: "width 0.3s"
                                }}
                              />
                            </div>
                            <span
                              className={`text-xs mt-1 block ${
                                message.fromMe ? "text-white/70" : "text-gray-500"
                              }`}
                            >
                              {formatDuration(message.audioDuration || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : editingMessageId === message.messageId ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="text-sm bg-white text-gray-900 border-gray-300"
                          onKeyPress={(e) => e.key === "Enter" && saveEdit(message.messageId)}
                        />
                        <Button
                          size="sm"
                          onClick={() => saveEdit(message.messageId)}
                          className="h-6 w-6 p-0 bg-green-500 hover:bg-green-600"
                        >
                          <Check className="h-3 w-3 text-white" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm break-words">{message.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-1">
                            <span
                              className={`text-[10px] ${
                                message.fromMe ? "text-white/70" : "text-gray-500"
                              }`}
                            >
                              {formatTime(message.timestamp)}
                              {message.isEdited && " (editada)"}
                            </span>
                            {renderMessageStatus(message)}
                          </div>
                          {message.fromMe && message.type === "text" && message.status !== "SENDING" && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 hover:bg-white/20"
                                >
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => startEdit(message)}>
                                  <Edit className="h-3 w-3 mr-2" />
                                  Editar mensagem
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 sm:p-4 bg-base-100 border-t border-base-200">
            <div className="flex items-center gap-2">
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
              <Input
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onFocus={() => setShouldAutoFocus(true)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !sending) {
                    sendMessage();
                  }
                }}
                placeholder="Digite sua mensagem..."
                className="flex-1 rounded-full border-gray-200 focus:ring-2 focus:ring-green-500"
                disabled={sending}
              />
              {newMessage.trim() ? (
                <Button
                  onClick={sendMessage}
                  className="rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 h-10 w-10 p-0"
                  disabled={sending}
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              ) : (
                <AudioRecorder onAudioRecorded={sendAudio} disabled={sending} />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatWindow;