import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";
import { MoreVertical, Tag as TagIcon, MoveRight, ArrowUpDown, Settings, Move, Loader2 } from "lucide-react";
import ChatWindow from "./ChatWindow";
import * as tagApi from "@/api/tags";
import { logError } from "@/lib/logger";
import { buildUrl } from "@/lib/api";
import type { Chat, Tag, ChatsData } from "@/types/chat";

interface ChatColumnsProps {
  chatsData?: ChatsData | null;
  showToast?: (toast: { message: string; description?: string; variant?: string }) => void;
  tagsVersion?: number;
}

const columnsConfig = [
  { id: "vip", title: "Atendimento VIP", color: "from-orange-400 to-orange-500" },
  { id: "humanizado", title: "Atendimento Humanizado", color: "from-blue-500 to-blue-600" },
  { id: "inicial", title: "Atendimento Inicial", color: "from-green-500 to-green-600" },
  { id: "repescagem", title: "Repescagem", color: "from-red-500 to-red-600" },
  { id: "tarefa", title: "Tarefa", color: "from-purple-500 to-purple-600" }
];

interface ChatTagsModalProps {
  chat: Chat;
  availableTags: Tag[];
  onClose: () => void;
  onUpdate: () => void;
}

const ChatTagsModal = ({ chat, availableTags, onClose, onUpdate }: ChatTagsModalProps) => {
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(
    new Set(chat.tags.map(tag => tag.id))
  );
  const [isSaving, setIsSaving] = useState(false);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tagId)) {
        newSet.delete(tagId);
      } else {
        newSet.add(tagId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await tagApi.setTagsForChat(chat.id, Array.from(selectedTagIds));
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar tags:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-card border-0 shadow-medical">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Gerenciar Etiquetas - {chat.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {availableTags.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma etiqueta disponível. Crie etiquetas no menu lateral.
            </p>
          ) : (
            availableTags.map(tag => (
              <div
                key={tag.id}
                className="flex items-center gap-3 p-3 bg-white/50 rounded-lg border border-white/20 cursor-pointer hover:bg-white/70 transition-colors"
                onClick={() => toggleTag(tag.id)}
              >
                <Checkbox
                  checked={selectedTagIds.has(tag.id)}
                  onCheckedChange={() => toggleTag(tag.id)}
                />
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                <Badge
                  variant="outline"
                  style={{ 
                    borderColor: tag.color, 
                    color: tag.color,
                    backgroundColor: `${tag.color}10`
                  }}
                >
                  {tag.name}
                </Badge>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleSave}
            className="flex-1 bg-gradient-primary text-white"
            disabled={isSaving}
          >
            {isSaving ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>
            ) : (
              "Salvar"
            )}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface ChatColumnProps {
  id: string;
  title: string;
  color: string;
  chats: Chat[];
  availableTags: Tag[];
  onChatSelect: (chat: Chat) => void;
  onMoveChat: (chatId: string, fromColumn: string, toColumn: string) => void;
  onOpenTagManager: (chat: Chat) => void;
  onRefresh: () => void;
}

const ChatColumn = ({ id, title, color, chats, availableTags, onChatSelect, onMoveChat, onOpenTagManager, onRefresh }: ChatColumnProps) => {
  const [sortOrder, setSortOrder] = useState<"recent" | "oldest">("recent");
  const [showGroups, setShowGroups] = useState(() => {
    const saved = localStorage.getItem(`column-${id}-showGroups`);
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [showNewsletters, setShowNewsletters] = useState(() => {
    const saved = localStorage.getItem(`column-${id}-showNewsletters`);
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem(`column-${id}-showGroups`, JSON.stringify(showGroups));
  }, [showGroups, id]);

  useEffect(() => {
    localStorage.setItem(`column-${id}-showNewsletters`, JSON.stringify(showNewsletters));
  }, [showNewsletters, id]);

  const formatTime = (timeString: string | null) => {
    if (!timeString) return "";
    const date = new Date(timeString);
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.substring(0, 2).toUpperCase();
  };

  const isNewsletter = (chat: Chat) => {
    return chat.phone.includes("newsletter") || chat.phone.length > 20;
  };

  const filteredChats = chats.filter(chat => {
    if (!showGroups && chat.isGroup) return false;
    if (!showNewsletters && isNewsletter(chat)) return false;
    return true;
  });

  const sortedChats = [...filteredChats].sort((a, b) => {
    const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
    const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
    return sortOrder === "recent" ? timeB - timeA : timeA - timeB;
  });

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "recent" ? "oldest" : "recent");
  };

  return (
    <Card className="w-80 h-full bg-gradient-card border-0 shadow-card flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className={`text-base font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
            {title}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSortOrder}
              className="h-6 w-6 p-0 hover:bg-white/50"
              title={sortOrder === "recent" ? "Ordenar por mais antigas" : "Ordenar por mais recentes"}
            >
              <ArrowUpDown className="h-3 w-3 text-gray-600" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-white/50"
                  title="Configurações da coluna"
                >
                  <Settings className="h-3 w-3 text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="text-xs">
                    Ocultar
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="text-xs">
                        Grupos
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem 
                          className="text-xs"
                          onClick={() => setShowGroups(true)}
                        >
                          {showGroups && "✓ "}Mostrar grupos
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-xs"
                          onClick={() => setShowGroups(false)}
                        >
                          {!showGroups && "✓ "}Ocultar grupos
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="text-xs">
                        Newsletter
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem 
                          className="text-xs"
                          onClick={() => setShowNewsletters(true)}
                        >
                          {showNewsletters && "✓ "}Mostrar newsletter
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-xs"
                          onClick={() => setShowNewsletters(false)}
                        >
                          {!showNewsletters && "✓ "}Ocultar newsletter
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {sortedChats.length} conversas
        </p>
      </CardHeader>

      <Droppable droppableId={id}>
        {(provided) => (
          <CardContent
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex-1 overflow-y-auto space-y-2 p-4 pt-0"
          >
            {sortedChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <p className="text-sm">Nenhuma conversa</p>
              </div>
            ) : (
              sortedChats.map((chat, index) => (
                <Draggable key={chat.id} draggableId={chat.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`group relative bg-white p-3 rounded-lg border border-gray-100 transition-all cursor-pointer ${
                        chat.unread > 0 ? 'shadow-lg ring-2 ring-green-400' : 'hover:shadow-card'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div 
                          className="flex-1 min-w-0"
                          onClick={() => onChatSelect(chat)}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="relative">
                              {chat.profileThumbnail ? (
                                <img 
                                  src={chat.profileThumbnail} 
                                  alt={chat.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-medium">
                                  {getInitials(chat.name)}
                                </div>
                              )}
                              {chat.unread > 0 && (
                                <Badge 
                                  variant="secondary" 
                                  className="absolute -top-1 -right-1 bg-primary text-white text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center"
                                >
                                  {chat.unread}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-foreground truncate">
                                  {chat.name || chat.phone}
                                </h4>
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(chat.lastMessageTime)}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {chat.phone}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 flex-wrap">
                            {chat.isGroup && (
                              <Badge variant="outline" className="text-xs">
                                Grupo
                              </Badge>
                            )}
                            
                            {chat.tags && chat.tags.length > 0 && (
                              chat.tags.slice(0, 3).map(tag => (
                                <Badge 
                                  key={tag.id}
                                  variant="outline" 
                                  className="text-xs"
                                  style={{ 
                                    borderColor: tag.color,
                                    color: tag.color,
                                    backgroundColor: `${tag.color}10`
                                  }}
                                >
                                  {tag.name}
                                </Badge>
                              ))
                            )}
                            
                            {chat.tags && chat.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{chat.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem 
                              onClick={() => onOpenTagManager(chat)}
                              className="text-xs"
                            >
                              <TagIcon className="mr-2 h-3 w-3" />
                              Gerenciar Etiquetas
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem className="text-xs font-medium text-muted-foreground cursor-default">
                              <MoveRight className="mr-2 h-3 w-3" />
                              Mover para Coluna
                            </DropdownMenuItem>
                            
                            {columnsConfig.filter(col => col.id !== id).map(column => (
                              <DropdownMenuItem 
                                key={column.id}
                                onClick={() => onMoveChat(chat.id, id, column.id)}
                                className="text-xs pl-6"
                              >
                                {column.title}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div
                        {...provided.dragHandleProps}
                        className="absolute bottom-1 right-1 p-1 opacity-0 group-hover:opacity-60 hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Move className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    </div>
                  )}
                </Draggable>
              ))
            )}
            {provided.placeholder}
          </CardContent>
        )}
      </Droppable>
    </Card>
  );
};

const ChatColumns = ({ chatsData, showToast, tagsVersion }: ChatColumnsProps) => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [chatForTagManager, setChatForTagManager] = useState<Chat | null>(null);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [chats, setChats] = useState<Record<string, Chat[]>>({
    vip: [],
    humanizado: [],
    inicial: [],
    repescagem: [],
    tarefa: []
  });

  useEffect(() => {
    loadTags();
  }, []);

  useEffect(() => {
    if (tagsVersion !== undefined && tagsVersion > 0) {
      loadTags();
    }
  }, [tagsVersion]);

  const loadTags = async () => {
    try {
      const tags = await tagApi.getAllTags();
      setAvailableTags(tags);
    } catch (error) {
      logError("Erro ao carregar tags:", { error });
    }
  };

  useEffect(() => {
    if (chatsData?.chats) {
      const organized: Record<string, Chat[]> = {
        vip: [],
        humanizado: [],
        inicial: [],
        repescagem: [],
        tarefa: []
      };

      chatsData.chats.forEach(chat => {
        const columnMap: Record<string, string> = {
          'inbox': 'inicial',
          'vip': 'vip',
          'humanized': 'humanizado',
          'followup': 'repescagem',
          'task': 'tarefa'
        };

        const targetColumn = columnMap[chat.column] || 'inicial';
        organized[targetColumn].push(chat);
      });

      setChats(organized);
    }
  }, [chatsData]);

  const moveChat = async (chatId: string, fromColumn: string, toColumn: string) => {
    const chat = chats[fromColumn]?.find(c => c.id === chatId);
    if (!chat) return;

    const columnMapToBackend: Record<string, string> = {
      'vip': 'vip',
      'humanizado': 'humanized',
      'inicial': 'inbox',
      'repescagem': 'followup',
      'tarefa': 'task'
    };

    const backendColumn = columnMapToBackend[toColumn] || toColumn;
    const token = localStorage.getItem("token");
    
    if (!token) {
      showToast?.({
        message: "Erro de autenticação",
        description: "Token não encontrado. Faça login novamente.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Use apiFetch so successful mutation triggers a reload (default behavior)
      const apiFetch = (await import("@/lib/http")).default;
      await apiFetch(`/dashboard/zapi/chats/${chatId}/column`, { method: 'PUT', body: JSON.stringify({ column: backendColumn }) });
      // optimistic UI update (will be superseded by reload)
      setChats(prev => ({
        ...prev,
        [fromColumn]: prev[fromColumn].filter(c => c.id !== chatId),
        [toColumn]: [...(prev[toColumn] || []), { ...chat, column: backendColumn }]
      }));

      showToast?.({
        message: "Chat movido com sucesso!",
        description: `Movido para ${columnsConfig.find(c => c.id === toColumn)?.title}`,
      });
    } catch (error) {
      logError("Erro ao mover chat:", { error });
      showToast?.({
        message: "Erro ao mover chat",
        description: error instanceof Error ? error.message : "Não foi possível mover o chat.",
        variant: "destructive"
      });
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const fromColumn = source.droppableId;
    const toColumn = destination.droppableId;
    const chatId = draggableId;

    if (fromColumn !== toColumn) {
      moveChat(chatId, fromColumn, toColumn);
    }
  };

  const handleTagsUpdated = async () => {
    await loadTags();
    
    if (chatsData) {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await fetch(buildUrl('/dashboard/zapi/chats'), {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          
          if (response.ok) {
            const updatedChatsData = await response.json();
            
            const organized: Record<string, Chat[]> = {
              vip: [],
              humanizado: [],
              inicial: [],
              repescagem: [],
              tarefa: []
            };

            updatedChatsData.chats.forEach((chat: Chat) => {
              const columnMap: Record<string, string> = {
                'inbox': 'inicial',
                'vip': 'vip',
                'humanized': 'humanizado',
                'followup': 'repescagem',
                'task': 'tarefa'
              };

              const targetColumn = columnMap[chat.column] || 'inicial';
              organized[targetColumn].push(chat);
            });

            setChats(organized);
          }
        } catch (error) {
          logError("Erro ao recarregar chats:", { error });
        }
      }
    }
  };

  if (!chatsData) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando conversas...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 h-[calc(100vh-120px)] justify-center">
          <div className="flex gap-4 justify-center">
            {columnsConfig.map(column => (
              <ChatColumn
                key={column.id}
                id={column.id}
                title={column.title}
                color={column.color}
                chats={chats[column.id] || []}
                availableTags={availableTags}
                onChatSelect={setSelectedChat}
                onMoveChat={moveChat}
                onOpenTagManager={setChatForTagManager}
                onRefresh={loadTags}
              />
            ))}
          </div>

          {selectedChat && (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedChat(null)}
            >
              <div 
                className="w-full max-w-2xl h-[80vh] mx-4 animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <ChatWindow
                  chat={selectedChat}
                  onClose={() => setSelectedChat(null)}
                />
              </div>
            </div>
          )}
        </div>
      </DragDropContext>

      {chatForTagManager && (
        <ChatTagsModal
          chat={chatForTagManager}
          availableTags={availableTags}
          onClose={() => setChatForTagManager(null)}
          onUpdate={handleTagsUpdated}
        />
      )}
    </>
  );
};

export default ChatColumns;