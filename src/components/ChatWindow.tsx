import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { X, Send, MoreVertical, Loader2, Edit, Check, Play, Pause, Images, Mic, Copy } from "lucide-react";
import { buildUrl } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import EmojiPicker from "./EmojiPicker";
import PreConfiguredTextsPicker from "./PreConfiguredTextsPicker";
import AudioRecorder from "./AudioRecorder";
import AudioPlayer from "./AudioPlayer";
import PhotoViewer from "./PhotoViewer";
import VideoViewer from "./VideoViewer";
import MediaTypeSelectorModal from "./MediaTypeSelectorModal";
import GalleryModal from "./GalleryModal";

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

interface Audio {
  id: string;
  messageId: string;
  timestamp: string;
  fromMe: boolean;
  seconds: number;
  audioUrl: string;
  status: string;
  senderName?: string;
  senderPhoto?: string;
}

interface Photo {
  id: string;
  messageId: string;
  imageUrl: string;
  width: number;
  height: number;
  timestamp: string;
  fromMe: boolean;
  status: string;
  senderName?: string;
  savedInGallery: boolean;
  caption?: string;
}

interface Video {
  id: string;
  messageId: string;
  videoUrl: string;
  width: number;
  height: number;
  seconds: number;
  timestamp: string;
  fromMe: boolean;
  status: string;
  senderName?: string;
  savedInGallery: boolean;
  mimeType?: string;
  isGif?: boolean;
  caption?: string;
}

// Tipo para itens vindos da galeria (compatível com GalleryModal)
type GalleryMediaItem = {
  id: string;
  imageUrl?: string;
  videoUrl?: string;
};

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
  setOpenChatId?: (chatId: string | null) => void;
}

const ChatWindow = ({ chat, onClose, setOpenChatId }: ChatWindowProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [audios, setAudios] = useState<Audio[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [shouldAutoFocus, setShouldAutoFocus] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  
  // Estados para galeria e seletor de mídia
  const [showMediaTypeSelector, setShowMediaTypeSelector] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryFilterType, setGalleryFilterType] = useState<'photos' | 'videos'>('photos');
  
  // Estados para controlar carregamento de mídias
  const [loadedMediaCount, setLoadedMediaCount] = useState(0);
  const [totalMediaCount, setTotalMediaCount] = useState(0);
  const [allMediaLoaded, setAllMediaLoaded] = useState(false);
  
  // ✅ NOVO: Estado para rastrear mídias carregadas individualmente
  const [loadedMedia, setLoadedMedia] = useState<Set<string>>(new Set());
  
  // ✅ Estado para controlar scroll durante edição
  const [preventAutoScroll, setPreventAutoScroll] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isInitialLoadRef = useRef(true);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // ✅ Ref para a mensagem sendo editada
  const editingMessageRef = useRef<HTMLDivElement | null>(null);

  const { toast } = useToast();

  // ✅ MODIFICADO: Handler para quando uma mídia carrega individualmente
  const handleMediaLoad = (mediaId: string) => {
    setLoadedMedia(prev => {
      const newSet = new Set(prev);
      newSet.add(mediaId);
      return newSet;
    });
    setLoadedMediaCount(prev => prev + 1);
  };

  // Calcular total de mídias quando mensagens carregam
  useEffect(() => {
    const total = photos.length + videos.length;
    setTotalMediaCount(total);
    setLoadedMediaCount(0);
    setLoadedMedia(new Set()); // ✅ Resetar mídias carregadas
    setAllMediaLoaded(total === 0); // Se não há mídias, já está tudo carregado
  }, [photos.length, videos.length]);

  // Verificar se todas as mídias foram carregadas
  useEffect(() => {
    if (totalMediaCount > 0 && loadedMediaCount >= totalMediaCount) {
      setAllMediaLoaded(true);
    }
  }, [loadedMediaCount, totalMediaCount]);

  // Scroll inicial apenas quando tudo estiver carregado (mensagens + mídias)
  useLayoutEffect(() => {
    if (isInitialLoadRef.current && messages.length > 0 && allMediaLoaded) {
      messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
      isInitialLoadRef.current = false;
    }
  }, [messages, allMediaLoaded]);

  useEffect(() => {
    // ✅ NÃO fazer scroll automático se estiver editando ou preventAutoScroll estiver ativo
    if (!isInitialLoadRef.current && !editingMessageId && !preventAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    
    if (shouldAutoFocus && messages.length > 0 && !editingMessageId) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [messages.length, editingMessageId, shouldAutoFocus, preventAutoScroll]);

  // ✅ Notificar quando chat abre/fecha
  useEffect(() => {
    setOpenChatId?.(chat.id);
    console.log('📂 ChatWindow ABERTO - Chat ID:', chat.id);

    return () => {
      setOpenChatId?.(null);
      console.log('📂 ChatWindow FECHADO');
    };
  }, [chat.id, setOpenChatId]);

  const markChatAsRead = useCallback(async () => {
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
  }, [chat.id]);

  // ✅ MODIFICADO: loadMessages com cache busting e retry logic
  const loadMessages = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const token = localStorage.getItem("token");

    try {
      // ✅ Cache busting com timestamp
      const timestamp = Date.now();
      const response = await fetch(buildUrl(`/dashboard/messages/${chat.id}?t=${timestamp}`), {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-cache", // ✅ Forçar bypass do cache
      });

      const text = await response.text();
      if (!text) {
        setMessages([]);
        setAudios([]);
        setPhotos([]);
        setVideos([]);
        return;
      }

      const data = JSON.parse(text);
      if (data.success) {
        setMessages(data.messages || []);
        setAudios(data.audios || []);
        setPhotos(data.photos || []);
        setVideos(data.videos || []);
      }
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [chat.id]);

  // Funções de controle da galeria
  const handleGalleryButtonClick = () => {
    setShowMediaTypeSelector(true);
  };

  const handleMediaTypeSelect = (type: 'photo' | 'video') => {
    setShowMediaTypeSelector(false);
    setGalleryFilterType(type === 'photo' ? 'photos' : 'videos');
    setShowGalleryModal(true);
  };

  const handleMediaSelected = async (items: GalleryMediaItem[], type: 'photo' | 'video') => {
    console.log(`📤 Enviando ${items.length} ${type === 'photo' ? 'fotos' : 'vídeos'}`);
    setSending(true);

    const token = localStorage.getItem("token");

    try {
      for (const item of items) {
        if (type === 'photo' && 'imageUrl' in item) {
          await fetch(buildUrl('/dashboard/messages/send-image'), {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chatId: chat.id,
              phone: chat.phone,
              image: item.imageUrl,
              photoId: item.id
            }),
          });
        } else if (type === 'video' && 'videoUrl' in item) {
          await fetch(buildUrl('/dashboard/messages/send-video'), {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chatId: chat.id,
              phone: chat.phone,
              video: item.videoUrl,
              videoId: item.id
            }),
          });
        }
        
        // Pequeno delay entre envios
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log("✅ Todas as mídias foram enviadas");
      loadMessages(true);
    } catch (error) {
      console.error("❌ Erro ao enviar mídias:", error);
    } finally {
      setSending(false);
    }
  };

  // Carregar mensagens ao abrir chat
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // ✅ Marcar chat como lido ao abrir
  useEffect(() => {
    markChatAsRead();
  }, [markChatAsRead]);

  // ✅ Marcar como lido ao FECHAR o chat também
  useEffect(() => {
    return () => {
      markChatAsRead();
    };
  }, [markChatAsRead]);

  // ✅ NOVO: Polling inteligente a cada 2 segundos quando chat está aberto
  useEffect(() => {
    if (!chat.id) return;

    console.log('🔄 Iniciando polling para chat:', chat.id);

    // Polling a cada 2 segundos
    pollingIntervalRef.current = setInterval(() => {
      loadMessages(true);
    }, 2000);

    return () => {
      if (pollingIntervalRef.current) {
        console.log('⏹️ Parando polling para chat:', chat.id);
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [chat.id, loadMessages]);

  // ✅ MODIFICADO: Listener SSE com retry múltiplo
  useEffect(() => {
    const handleSSEMessage = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { type, data } = customEvent.detail;
      
      if (data.chatId !== chat.id) return;
      
      console.log(`📨 Evento SSE no ChatWindow - Tipo: ${type}, ChatId: ${data.chatId}`);
      
      // ✅ CRÍTICO: Múltiplas tentativas de reload com delays
      loadMessages(true); // Tentativa imediata
      
      setTimeout(() => {
        loadMessages(true); // Retry após 300ms
      }, 300);
      
      setTimeout(() => {
        loadMessages(true); // Retry após 800ms
      }, 800);
      
      setTimeout(() => {
        loadMessages(true); // Retry final após 1.5s
      }, 1500);
    };

    window.addEventListener('sse-new-message', handleSSEMessage);
    window.addEventListener('sse-chat-update', handleSSEMessage);

    return () => {
      window.removeEventListener('sse-new-message', handleSSEMessage);
      window.removeEventListener('sse-chat-update', handleSSEMessage);
    };
  }, [chat.id, loadMessages]);

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
      messagesContainer.addEventListener('click', handleClickOutsideInput);
    }

    return () => {
      if (messagesContainer) {
        messagesContainer.removeEventListener('click', handleClickOutsideInput);
      }
    };
  }, []);

  const getCombinedMessages = (): Array<Message | (Audio & { type: 'audio' }) | (Photo & { type: 'photo' }) | (Video & { type: 'video' })> => {
    const combined = [
      ...messages,
      ...audios.map(audio => ({ ...audio, type: 'audio' as const })),
      ...photos.map(photo => ({ ...photo, type: 'photo' as const })),
      ...videos.map(video => ({ ...video, type: 'video' as const }))
    ];

    return combined.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeA - timeB;
    });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const token = localStorage.getItem("token");
    const messageText = newMessage;
    setNewMessage("");

    try {
      const response = await fetch(buildUrl('/dashboard/messages/send'), {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId: chat.id,
          phone: chat.phone,
          message: messageText,
        }),
      });

      const data = await response.json();
      if (data.success) {
        console.log("✅ Mensagem enviada com sucesso");
        loadMessages(true);
      } else {
        console.error("❌ Erro ao enviar mensagem:", data.message);
        setNewMessage(messageText);
      }
    } catch (error) {
      console.error("❌ Erro ao enviar mensagem:", error);
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleAudioRecorded = async (audioBase64: string, duration: number) => {
    console.log("🎤 Áudio recebido - Duration:", duration, "seconds");
    
    setSending(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(buildUrl('/dashboard/messages/send-audio'), {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId: chat.id,
          phone: chat.phone,
          audio: audioBase64,
          duration: duration,
          waveform: true
        }),
      });

      const data = await response.json();
      if (data.success) {
        console.log("✅ Áudio enviado com sucesso");
        loadMessages(true);
      } else {
        console.error("❌ Erro ao enviar áudio:", data.message);
      }
    } catch (error) {
      console.error("❌ Erro ao enviar áudio:", error);
    } finally {
      setSending(false);
    }
  };

  const playAudio = (audioUrl: string, messageId: string) => {
    if (playingAudio === messageId) {
      if (audioRef.current) {
        audioRef.current.pause();
        setPlayingAudio(null);
      }
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

  const handlePreConfiguredTextSelect = (content: string) => {
    setNewMessage(content);
    setShouldAutoFocus(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const startEdit = (message: Message) => {
    setEditingMessageId(message.messageId);
    setEditContent(message.content);
    setPreventAutoScroll(true);
    
    // ✅ Fazer scroll até a mensagem sendo editada
    setTimeout(() => {
      if (editingMessageRef.current) {
        editingMessageRef.current.scrollIntoView({ 
          behavior: "smooth", 
          block: "center" 
        });
      }
    }, 100);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
      .then(() => {
        toast({
          title: "✓ Copiado!",
          description: `Mensagem "${content}" copiada para a área de transferência!`,
        });
      })
      .catch((err) => {
        console.error("Erro ao copiar mensagem:", err);
        toast({
          title: "Erro",
          description: "Não foi possível copiar a mensagem",
          variant: "destructive",
        });
      });
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
        await loadMessages(true);
        
        // ✅ Manter o preventAutoScroll ativo por mais tempo
        setTimeout(() => {
          setPreventAutoScroll(false);
        }, 1000);
      }
    } catch (error) {
      console.error("Erro ao editar mensagem:", error);
      setPreventAutoScroll(false);
    }
  };

  const togglePhotoInGallery = async (photoId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        buildUrl(`/dashboard/messages/photos/${photoId}/toggle-gallery`),
        {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        // Atualizar estado local
        setPhotos(prev => 
          prev.map(p => 
            p.id === photoId 
              ? { ...p, savedInGallery: data.photo.savedInGallery }
              : p
          )
        );
        
        // Atualizar selectedPhoto se for a mesma foto
        if (selectedPhoto?.id === photoId) {
          setSelectedPhoto(prev => 
            prev ? { ...prev, savedInGallery: data.photo.savedInGallery } : null
          );
        }
      }
    } catch (error) {
      console.error("Erro ao salvar/remover foto da galeria:", error);
    }
  };

  const toggleVideoInGallery = async (videoId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        buildUrl(`/dashboard/messages/videos/${videoId}/toggle-gallery`),
        {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        // Atualizar estado local
        setVideos(prev => 
          prev.map(v => 
            v.id === videoId 
              ? { ...v, savedInGallery: data.video.savedInGallery }
              : v
          )
        );
        
        // Atualizar selectedVideo se for o mesmo vídeo
        if (selectedVideo?.id === videoId) {
          setSelectedVideo(prev => 
            prev ? { ...prev, savedInGallery: data.video.savedInGallery } : null
          );
        }
      }
    } catch (error) {
      console.error("Erro ao salvar/remover vídeo da galeria:", error);
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
    <Card className="h-full bg-white border-0 shadow-2xl rounded-2xl flex flex-col overflow-hidden">
      <CardHeader className="pb-4 pt-5 px-6 border-b border-gray-100 bg-white">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {chat.profileThumbnail ? (
              <img
                src={chat.profileThumbnail}
                alt={chat.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-green-100 flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-semibold text-lg ring-2 ring-green-100 flex-shrink-0">
                {getInitials(chat.name)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 text-lg truncate">{chat.name}</h3>
              <p className="text-xs text-gray-500 truncate">{chat.phone}</p>
              {chat.tags && chat.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
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
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 flex-shrink-0"
          >
            <X className="h-5 w-5 text-gray-500" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0">
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-3 bg-gradient-to-b from-gray-50 to-white"
          >
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-green-500" />
              </div>
            ) : getCombinedMessages().length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                Nenhuma mensagem ainda
              </div>
            ) : (
              getCombinedMessages().map((item) => {
                const isAudio = 'type' in item && item.type === 'audio';
                const isPhoto = 'type' in item && item.type === 'photo';
                const isVideo = 'type' in item && item.type === 'video';
                const audio = isAudio ? item as Audio & { type: 'audio' } : null;
                const photo = isPhoto ? item as Photo & { type: 'photo' } : null;
                const video = isVideo ? item as Video & { type: 'video' } : null;
                const message = !isAudio && !isPhoto && !isVideo ? item as Message : null;

                if (isAudio && audio) {
                  // Renderizar áudio
                  return (
                    <div
                      key={audio.messageId}
                      className={`flex ${audio.fromMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`group max-w-[70%] rounded-2xl px-4 py-2 ${
                          audio.fromMe
                            ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white"
                            : "bg-white text-gray-900 shadow-sm border border-gray-100"
                        }`}
                      >
                        <AudioPlayer
                          audioUrl={audio.audioUrl}
                          duration={audio.seconds}
                          fromMe={audio.fromMe}
                          messageId={audio.messageId}
                        />
                        <div className="flex items-center justify-between mt-1">
                          <span
                            className={`text-[10px] ${
                              audio.fromMe ? "text-white/70" : "text-gray-500"
                            }`}
                          >
                            {formatTime(audio.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (isPhoto && photo) {
                  // ✅ MODIFICADO: Renderizar foto com container fixo
                  const mediaId = `photo-${photo.messageId}`;
                  const isLoaded = loadedMedia.has(mediaId);
                  
                  return (
                    <div
                      key={photo.messageId}
                      className={`flex ${photo.fromMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`group max-w-[70%] rounded-2xl overflow-hidden ${
                          photo.fromMe
                            ? "bg-gradient-to-br from-green-500 to-emerald-600"
                            : "bg-white shadow-sm border border-gray-100"
                        }`}
                      >
                        {/* ✅ Container com aspect-ratio fixo */}
                        <div 
                          className="relative cursor-pointer w-full bg-gray-200"
                          style={{ aspectRatio: '16/9', maxWidth: '300px' }}
                          onClick={() => setSelectedPhoto(photo)}
                        >
                          {/* ✅ Placeholder enquanto carrega */}
                          {!isLoaded && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-gray-400 text-sm">...</span>
                            </div>
                          )}
                          
                          {/* ✅ Imagem com transição de opacity */}
                          <img
                            src={photo.imageUrl}
                            alt="Foto"
                            className={`w-full h-full object-cover transition-opacity duration-300 ${
                              isLoaded ? 'opacity-100' : 'opacity-0'
                            }`}
                            loading="lazy"
                            onLoad={() => handleMediaLoad(mediaId)}
                            onError={() => handleMediaLoad(mediaId)}
                          />
                          
                          {/* Overlay ao hover */}
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <svg 
                                className="w-12 h-12 text-white drop-shadow-lg" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" 
                                />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Caption da foto */}
                        {photo.caption && photo.caption.trim() !== "" && (
                          <div className={`px-3 py-2 ${photo.fromMe ? "text-white" : "text-gray-900"}`}>
                            <p className="text-sm break-words">{photo.caption}</p>
                          </div>
                        )}

                        {/* Footer com timestamp e opções */}
                        <div className={`px-3 py-2 ${photo.fromMe ? "text-white" : "text-gray-900"}`}>
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] ${photo.fromMe ? "text-white/70" : "text-gray-500"}`}>
                              {formatTime(photo.timestamp)}
                            </span>
                            
                            {/* Dropdown com opções */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`h-6 w-6 p-0 ${
                                    photo.fromMe 
                                      ? "hover:bg-white/20 text-white" 
                                      : "hover:bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => togglePhotoInGallery(photo.id)}>
                                  {photo.savedInGallery ? "Remover da Galeria" : "Salvar na Galeria"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (isVideo && video) {
                  // ✅ MODIFICADO: Renderizar vídeo com container fixo
                  const mediaId = `video-${video.messageId}`;
                  const isLoaded = loadedMedia.has(mediaId);
                  
                  return (
                    <div
                      key={video.messageId}
                      className={`flex ${video.fromMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`group max-w-[70%] rounded-2xl overflow-hidden ${
                          video.fromMe
                            ? "bg-gradient-to-br from-green-500 to-emerald-600"
                            : "bg-white shadow-sm border border-gray-100"
                        }`}
                      >
                        {/* ✅ Container com aspect-ratio fixo */}
                        <div 
                          className="relative cursor-pointer w-full bg-gray-200"
                          style={{ aspectRatio: '16/9', maxWidth: '300px' }}
                          onClick={() => setSelectedVideo(video)}
                        >
                          {/* ✅ Placeholder enquanto carrega */}
                          {!isLoaded && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-gray-400 text-sm">...</span>
                            </div>
                          )}
                          
                          {/* ✅ Vídeo com transição de opacity */}
                          <video
                            src={video.videoUrl}
                            className={`w-full h-full object-cover transition-opacity duration-300 ${
                              isLoaded ? 'opacity-100' : 'opacity-0'
                            }`}
                            onLoadedData={() => handleMediaLoad(mediaId)}
                            onError={() => handleMediaLoad(mediaId)}
                          />
                          
                          {/* Overlay com ícone de play */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                              </svg>
                            </div>
                          </div>
                          
                          {/* Duração do vídeo */}
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {formatDuration(video.seconds)}
                          </div>
                        </div>

                        {/* Caption do vídeo */}
                        {video.caption && video.caption.trim() !== "" && (
                          <div className={`px-3 py-2 ${video.fromMe ? "text-white" : "text-gray-900"}`}>
                            <p className="text-sm break-words">{video.caption}</p>
                          </div>
                        )}

                        {/* Footer com timestamp e opções */}
                        <div className={`px-3 py-2 ${video.fromMe ? "text-white" : "text-gray-900"}`}>
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] ${video.fromMe ? "text-white/70" : "text-gray-500"}`}>
                              {formatTime(video.timestamp)}
                            </span>
                            
                            {/* Dropdown com opções */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`h-6 w-6 p-0 ${
                                    video.fromMe 
                                      ? "hover:bg-white/20 text-white" 
                                      : "hover:bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => toggleVideoInGallery(video.id)}>
                                  {video.savedInGallery ? "Remover da Galeria" : "Salvar na Galeria"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (message) {
                  // Renderizar mensagem de texto
                  return (
                    <div
                      key={message.messageId}
                      className={`flex ${message.fromMe ? "justify-end" : "justify-start"}`}
                      ref={editingMessageId === message.messageId ? editingMessageRef : null}
                    >
                      <div
                        className={`group max-w-[70%] rounded-2xl px-4 py-2 ${
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
                              {message.type === "text" && message.status !== "SENDING" && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className={`h-4 w-4 p-0 opacity-0 group-hover:opacity-100 ${
                                        message.fromMe ? "hover:bg-white/20" : "hover:bg-gray-100"
                                      }`}
                                    >
                                      <MoreVertical className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => copyMessage(message.content)}>
                                      <Copy className="h-3 w-3 mr-2" />
                                      Copiar
                                    </DropdownMenuItem>
                                    {message.fromMe && (
                                      <DropdownMenuItem onClick={() => startEdit(message)}>
                                        <Edit className="h-3 w-3 mr-2" />
                                        Editar mensagem
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                }

                return null;
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2">
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
              <PreConfiguredTextsPicker onSelectText={handlePreConfiguredTextSelect} />
              
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

              {/* Botão Galeria */}
              <Button
                onClick={handleGalleryButtonClick}
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 rounded-full hover:bg-gray-100"
                disabled={sending}
              >
                <Images className="h-5 w-5 text-gray-600" />
              </Button>

              {/* Botão Conjugado: Enviar OU Gravar Áudio */}
              {newMessage.trim().length > 0 ? (
                // Botão de Enviar (quando tem texto)
                <Button
                  onClick={sendMessage}
                  className="rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 h-10 w-10 p-0"
                  disabled={sending || !newMessage.trim()}
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              ) : (
                // Botão de Gravar Áudio (quando não tem texto)
                <AudioRecorder 
                  onAudioRecorded={handleAudioRecorded}
                  disabled={sending}
                />
              )}
            </div>
          </div>
        </div>
      </CardContent>

      {selectedPhoto && (
        <PhotoViewer
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onToggleGallery={togglePhotoInGallery}
        />
      )}

      {selectedVideo && (
        <VideoViewer
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
          onToggleGallery={toggleVideoInGallery}
        />
      )}

      {/* Modal Seletor de Tipo de Mídia */}
      {showMediaTypeSelector && (
        <MediaTypeSelectorModal
          onSelectType={handleMediaTypeSelect}
          onClose={() => setShowMediaTypeSelector(false)}
        />
      )}

      {/* Modal Galeria em Modo Seleção */}
      {showGalleryModal && (
        <GalleryModal
          onClose={() => setShowGalleryModal(false)}
          selectionMode={true}
          filterType={galleryFilterType}
          onMediaSelected={handleMediaSelected}
        />
      )}
    </Card>
  );
};

export default ChatWindow;