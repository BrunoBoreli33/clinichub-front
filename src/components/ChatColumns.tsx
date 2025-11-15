import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";
import { MoreVertical, Tag as TagIcon, MoveRight, ArrowUpDown, Settings, Move, Loader2, RotateCcw, Calendar, Upload, EyeOff, Eye } from "lucide-react";
import ChatWindow from "./ChatWindow";
import TaskModal from "./TaskModal";
import TaskManagerModal from "./Taskmanagermodal";
import * as tagApi from "@/api/tags";
import { logError } from "@/lib/logger";
import { buildUrl } from "@/lib/api";
import type { Chat, Tag, ChatsData } from "@/types/chat";

interface ChatColumnsProps {
  chatsData?: ChatsData | null;
  showToast?: (toast: { message: string; description?: string; variant?: string }) => void;
  tagsVersion?: number;
  onChatClosed?: () => void;
  onColumnChange?: () => void;
  setOpenChatId?: (chatId: string | null) => void;
}

const columnsConfig = [
  { id: "vip", title: "Atendimento VIP", color: "from-orange-400 to-orange-500" },
  { id: "humanizado", title: "Atendimento Humanizado", color: "from-blue-500 to-blue-600" },
  { id: "inicial", title: "Atendimento Inicial", color: "from-green-500 to-green-600" },
  { id: "repescagem", title: "Repescagem", color: "from-red-500 to-red-600" },
  { id: "tarefa", title: "Tarefa", color: "from-purple-500 to-purple-600" },
  { id: "lead_quente", title: "Lead Quente", color: "from-yellow-400 to-yellow-500" },
  { id: "cliente", title: "Cliente", color: "from-emerald-500 to-emerald-600" },
  { id: "lead_frio", title: "Lead Frio", color: "from-gray-400 to-gray-500" }
];

const sortChatsByLastMessage = (chats: Chat[], sortOrder: "recent" | "oldest") => {
  return [...chats].sort((a, b) => {
    const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
    const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
    
    return sortOrder === "recent" ? timeB - timeA : timeA - timeB;
  });
};

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

      // Disparar evento para recarregar chats no Dashboard
      window.dispatchEvent(new CustomEvent('tag-added-to-chat'));
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
        
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
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
                  className="pointer-events-none"
                />
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: tag.color }}
                />
                <Badge
                  variant="outline"
                  className="flex-shrink-0"
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
  onCreateTask: (chat: Chat) => void;
  onOpenTaskManager: (chat: Chat) => void;
  onRefresh: () => void;
  onChatClosed?: () => void;
  showToast?: (toast: { message: string; description?: string; variant?: string }) => void;
  hideUploadChat: boolean;
  toggleHideUploadChat: () => void;
  showHiddenChats: boolean;
  toggleShowHiddenChats: () => void;
  hideTemporaryChats: boolean;
  toggleHideTemporaryChats: () => void;
}

const ChatColumn = ({ id, title, color, chats, availableTags, onChatSelect, onMoveChat, onOpenTagManager, onCreateTask, onOpenTaskManager, onRefresh, onChatClosed, showToast, hideUploadChat, toggleHideUploadChat, showHiddenChats, toggleShowHiddenChats, hideTemporaryChats, toggleHideTemporaryChats }: ChatColumnProps) => {
  const [sortOrder, setSortOrder] = useState<"recent" | "oldest">(() => {
    const saved = localStorage.getItem(`column-${id}-sortOrder`);
    return (saved as "recent" | "oldest") || "recent";
  });
  
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

  useEffect(() => {
    localStorage.setItem(`column-${id}-sortOrder`, sortOrder);
  }, [sortOrder, id]);

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

  const isTemporaryChat = (chat: Chat) => {
    if (!chat.phone) return false;
    return chat.phone.includes('@lid') || chat.phone.length > 13;
  };


  const truncateMessage = (message: string | null, maxLength: number = 40) => {
    if (!message) return "Sem mensagens";
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  const filteredChats = chats.filter(chat => {
    if (!showGroups && chat.isGroup) return false;
    if (!showNewsletters && isNewsletter(chat)) return false;
    if (!showHiddenChats && chat.isHidden) return false;
    if (hideTemporaryChats && isTemporaryChat(chat)) return false;
    return true;
  });

  const sortedChats = sortChatsByLastMessage(filteredChats, sortOrder);

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "recent" ? "oldest" : "recent");
  };

  const handleMoveFromDropdown = (chatId: string, toColumnId: string) => {
    // ✅ NOVO: Verificar se é chat temporário
    const chat = chats[id]?.find(c => c.id === chatId);
    
    if (chat && chat.phone && chat.phone.includes('@lid')) {
      showToast?.({
        message: "Movimentação bloqueada",
        description: "Chats temporários (com @lid) não podem ser movidos manualmente. Aguarde o número ser revelado.",
        variant: "destructive",
      });
      return;
    }

    if (id === "repescagem") {
      showToast?.({
        message: "Movimentação bloqueada",
        description: "Chats na coluna 'Repescagem' só podem ser movidos automaticamente pelo sistema de rotinas. Não é permitido mover manualmente.",
        variant: "destructive",
      });
      return;
    }

    // ✅ Bloqueia movimentação de chats na coluna "tarefa"
    if (id === "tarefa") {
      showToast?.({
        message: "Movimentação bloqueada",
        description: "Chats na coluna 'Tarefa' são gerenciados exclusivamente pelo backend. Não é permitido mover manualmente.",
        variant: "destructive",
      });
      return;
    }

    if (toColumnId === "repescagem") {
      showToast?.({
        message: "Movimentação bloqueada",
        description: "A coluna 'Repescagem' é exclusiva para rotinas automáticas. Não é permitido mover conversas manualmente.",
        variant: "destructive",
      });
      return;
    }
    
    if (toColumnId === "tarefa") {
      showToast?.({
        message: "Movimentação bloqueada",
        description: "A coluna 'Tarefa' é gerenciada exclusivamente pelo backend. Não é permitido mover conversas manualmente.",
        variant: "destructive",
      });
      return;
    }
    
    onMoveChat(chatId, id, toColumnId);
  };

  // ✅ NOVA FUNÇÃO: Resetar rotinas do chat
  const handleResetRoutine = async (chatId: string, chatName: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast?.({
          message: "Erro de autenticação",
          description: "Token não encontrado",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(buildUrl(`/dashboard/chats/${chatId}/reset-routine`), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        showToast?.({
          message: "Rotinas resetadas",
          description: `As rotinas do chat "${chatName}" foram resetadas com sucesso`,
        });
        onRefresh?.();
      } else {
        showToast?.({
          message: "Erro ao resetar rotinas",
          description: data.message || "Ocorreu um erro desconhecido",
          variant: "destructive",
        });
      }
    } catch (error) {
      logError('Erro ao resetar rotinas do chat', error);
      showToast?.({
        message: "Erro ao resetar rotinas",
        description: "Não foi possível resetar as rotinas",
        variant: "destructive",
      });
    }
  };

  const handleToggleChatHidden = async (chatId: string, chatName: string, isCurrentlyHidden: boolean) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast?.({
          message: "Erro de autenticação",
          description: "Token não encontrado",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(buildUrl(`/dashboard/chats/${chatId}/toggle-hidden`), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        showToast?.({
          message: data.isHidden ? "Chat ocultado" : "Chat exibido",
          description: `O chat "${chatName}" foi ${data.isHidden ? 'ocultado' : 'exibido'} com sucesso`,
        });
        // Recarregar chats para aplicar o filtro
        if (onChatClosed) {
          onChatClosed();
        }
      } else {
        showToast?.({
          message: "Erro ao alternar visibilidade",
          description: data.message || "Ocorreu um erro desconhecido",
          variant: "destructive",
        });
      }
    } catch (error) {
      logError('Erro ao alternar visibilidade do chat', error);
      showToast?.({
        message: "Erro ao alternar visibilidade",
        description: "Não foi possível alterar a visibilidade do chat",
        variant: "destructive",
      });
    }
  };

  const isRepescagemColumn = title === "Repescagem";
  const isTarefaColumn = title === "Tarefa";

  return (
    <Card className="w-80 h-full bg-gradient-card border-0 shadow-card flex flex-col flex-shrink-0">
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
                
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="text-xs">
                    Chats Ocultos
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem 
                      className="text-xs"
                      onClick={() => {
                        if (!showHiddenChats) toggleShowHiddenChats();
                      }}
                    >
                      {showHiddenChats && "✓ "}Mostrar chats ocultos
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-xs"
                      onClick={() => {
                        if (showHiddenChats) toggleShowHiddenChats();
                      }}
                    >
                      {!showHiddenChats && "✓ "}Esconder chats ocultos
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="text-xs">
                    Ocultar @lid
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem 
                      className="text-xs"
                      onClick={() => {
                        if (!hideTemporaryChats) toggleHideTemporaryChats();
                      }}
                    >
                      {hideTemporaryChats && "✓ "}Ocultar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-xs"
                      onClick={() => {
                        if (hideTemporaryChats) toggleHideTemporaryChats();
                      }}
                    >
                      {!hideTemporaryChats && "✓ "}Mostrar
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {sortedChats.length} conversas
        </p>
      </CardHeader>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <CardContent
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`flex-1 overflow-y-auto space-y-2 p-4 pt-0 transition-all duration-200 ${
              snapshot.isDraggingOver
                ? (isRepescagemColumn || isTarefaColumn)
                  ? 'bg-red-50/50 ring-2 ring-red-500 ring-inset rounded-lg'
                  : 'bg-green-50/50 ring-2 ring-green-400 ring-inset rounded-lg'
                : ''
            }`}
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
                      className={`group relative bg-white p-3 rounded-lg border transition-all cursor-pointer ${
                        chat.unread > 0 
                          ? 'bg-green-50/30 border-green-200 shadow-lg ring-2 ring-green-400/50' 
                          : 'border-gray-100 hover:shadow-card'
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
                                <div className="absolute -top-1 -left-1 bg-green-500 text-white text-[10px] font-bold h-5 min-w-[20px] rounded-full flex items-center justify-center px-1 shadow-lg ring-2 ring-white">
                                  {chat.unread > 99 ? '99+' : chat.unread}
                                </div>
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
                              <p className={`text-xs truncate ${
                                chat.unread > 0 
                                  ? 'font-semibold text-gray-900' 
                                  : 'text-muted-foreground'
                              }`}>
                                {truncateMessage(chat.lastMessageContent)}
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
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => onOpenTagManager(chat)}
                              className="text-xs"
                            >
                              <TagIcon className="mr-2 h-3 w-3" />
                              Gerenciar Etiquetas
                            </DropdownMenuItem>
                            
                            
                            {/* Criar/Editar Tarefa - Muda conforme o chat está na coluna tarefa */}
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (chat.column === "task") {
                                  // Se chat já está na coluna tarefa, abrir gerenciador
                                  onOpenTaskManager(chat);
                                } else {
                                  // Senão, abrir modal de criação
                                  onCreateTask(chat);
                                }
                              }}
                              className="text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                            >
                              <Calendar className="mr-2 h-3 w-3" />
                              {chat.column === "task" ? "Editar Tarefa" : "Criar Tarefa"}
                            </DropdownMenuItem>
                            
                            {/* ✅ NOVA OPÇÃO: Resetar Rotinas */}
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleResetRoutine(chat.id, chat.name);
                              }}
                              className="text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            >
                              <RotateCcw className="mr-2 h-3 w-3" />
                              Resetar Rotinas
                            </DropdownMenuItem>
                            
                            {/* ✅ NOVA OPÇÃO: Ocultar/Exibir Chat */}
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleChatHidden(chat.id, chat.name, chat.isHidden);
                              }}
                              className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              {chat.isHidden ? (
                                <><Eye className="mr-2 h-3 w-3" />Exibir este chat</>
                              ) : (
                                <><EyeOff className="mr-2 h-3 w-3" />Ocultar este chat</>
                              )}
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            <DropdownMenuItem disabled className="text-xs">
                              <MoveRight className="mr-2 h-3 w-3" />
                              Mover para Coluna
                            </DropdownMenuItem>
                            
                            {columnsConfig.filter(col => col.id !== id).map(column => (
                              <DropdownMenuItem 
                                key={column.id}
                                onClick={() => handleMoveFromDropdown(chat.id, column.id)}
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

const ChatColumns = ({ chatsData, showToast, tagsVersion, onChatClosed, onColumnChange, setOpenChatId }: ChatColumnsProps) => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [chatForTagManager, setChatForTagManager] = useState<Chat | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTaskManagerModal, setShowTaskManagerModal] = useState(false);
  const [chatForTaskManager, setChatForTaskManager] = useState<Chat | null>(null);
  const [chatForTask, setChatForTask] = useState<Chat | null>(null);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  
  const [chats, setChats] = useState<Record<string, Chat[]>>({
    vip: [],
    humanizado: [],
    inicial: [],
    repescagem: [],
    tarefa: [],
    lead_quente: [],
    cliente: [],
    lead_frio: []
  });

  const [hideUploadChat, setHideUploadChat] = useState(
    localStorage.getItem('hideUploadChat') !== 'false' // true por padrão
  );

  const [showHiddenChats, setShowHiddenChats] = useState(
    localStorage.getItem('showHiddenChats') === 'true' // false por padrão
  );

  const [hideTemporaryChats, setHideTemporaryChats] = useState(() => {
    const saved = localStorage.getItem('hideTemporaryChats');
    return saved !== null ? saved === 'true' : true; // true = ocultar por padrão
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

  const toggleHideUploadChat = () => {
    const newValue = !hideUploadChat;
    setHideUploadChat(newValue);
    localStorage.setItem('hideUploadChat', String(newValue));
    
    // ✅ CORRIGIDO: Recarregar chats imediatamente para aplicar filtro
    console.log('🔄 Filtro de chat de upload alterado:', newValue ? 'OCULTAR' : 'MOSTRAR');
    if (onChatClosed) {
      onChatClosed();
    }
  };

  const toggleShowHiddenChats = () => {
    const newValue = !showHiddenChats;
    setShowHiddenChats(newValue);
    localStorage.setItem('showHiddenChats', String(newValue));
    
    console.log('🔄 Filtro de chats ocultos alterado:', newValue ? 'MOSTRAR OCULTOS' : 'OCULTAR OCULTOS');
    
    if (onChatClosed) {
      onChatClosed();
    }
  };

  const toggleHideTemporaryChats = () => {
    const newValue = !hideTemporaryChats;
    setHideTemporaryChats(newValue);
    localStorage.setItem('hideTemporaryChats', String(newValue));
    
    console.log('🔄 Filtro de chats temporários alterado:', newValue ? 'OCULTAR @lid e >13' : 'MOSTRAR @lid e >13');
    
    if (onChatClosed) {
      onChatClosed();
    }
  };


  const handleCreateTask = (chat: Chat) => {
    setChatForTask(chat);
    setShowTaskModal(true);
  };

  const handleManageTasks = (chat: Chat) => {
    setChatForTaskManager(chat);
    setShowTaskManagerModal(true);
  };

  const handleTasksUpdated = () => {
    // Recarregar dados dos chats após atualizar tarefas
    if (onChatClosed) {
      onChatClosed();
    }
  };

  const handleTaskCreated = () => {
    // Recarregar dados dos chats após criar tarefa
    if (onChatClosed) {
      onChatClosed();
    }
    
    showToast?.({
      message: "Tarefa criada com sucesso",
      description: "O chat foi movido para a coluna Tarefas",
    });
  };

  useEffect(() => {
    if (chatsData?.chats) {
      const organized: Record<string, Chat[]> = {
        vip: [],
        humanizado: [],
        inicial: [],
        repescagem: [],
        tarefa: [],
        lead_quente: [],
        cliente: [],
        lead_frio: []
      };

      chatsData.chats.forEach(chat => {
        const columnMap: Record<string, string> = {
          'inbox': 'inicial',
          'vip': 'vip',
          'humanized': 'humanizado',
          'followup': 'repescagem',
          'task': 'tarefa',
          'hot_lead': 'lead_quente',
          'client': 'cliente',
          'cold_lead': 'lead_frio',
          'Repescagem': 'repescagem',
          'Lead Quente': 'lead_quente',
          'Atendimento Inicial': 'inicial'
        };

        const targetColumn = columnMap[chat.column] || 'inicial';
        organized[targetColumn].push(chat);
      });

      Object.keys(organized).forEach(column => {
        organized[column] = sortChatsByLastMessage(organized[column], "recent");
      });

      setChats(organized);
    }
  }, [chatsData]);

  const moveChat = async (chatId: string, fromColumn: string, toColumn: string) => {
    if (toColumn === "repescagem") {
      showToast?.({
        message: "Movimentação bloqueada",
        description: "A coluna 'Repescagem' é exclusiva para rotinas automáticas. Não é permitido mover conversas manualmente.",
        variant: "destructive",
      });
      return;
    }

    if (toColumn === "tarefa") {
      showToast?.({
        message: "Movimentação bloqueada",
        description: "A coluna 'Tarefa' é gerenciada exclusivamente pelo backend. Não é permitido mover conversas manualmente.",
        variant: "destructive",
      });
      return;
    }

    const chat = chats[fromColumn]?.find(c => c.id === chatId);
    if (!chat) return;

    const columnMapToBackend: Record<string, string> = {
      'vip': 'vip',
      'humanizado': 'humanized',
      'inicial': 'inbox',
      'repescagem': 'followup',
      'tarefa': 'task',
      'lead_quente': 'hot_lead',
      'cliente': 'client',
      'lead_frio': 'cold_lead'
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
      const apiFetch = (await import("@/lib/http")).default;
      await apiFetch(`/dashboard/zapi/chats/${chatId}/column`, { 
        method: 'PUT', 
        body: JSON.stringify({ column: backendColumn }) 
      });
      
      setChats(prev => ({
        ...prev,
        [fromColumn]: prev[fromColumn].filter(c => c.id !== chatId),
        [toColumn]: [...(prev[toColumn] || []), { ...chat, column: backendColumn }]
      }));

      // Recarregar chats do Dashboard para sincronizar o estado global
      if (onColumnChange) {
        onColumnChange();
      }

      showToast?.({
        message: "Chat movido com sucesso!",
        description: `Movido para ${columnsConfig.find(c => c.id === toColumn)?.title}`,
      });
    } catch (error: unknown) {
      logError("Erro ao mover chat:", { error });
      
      const errorMessage = 
        error && typeof error === 'object' && 'data' in error && 
        error.data && typeof error.data === 'object' && 'message' in error.data
          ? String(error.data.message)
          : error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : "Não foi possível mover o chat.";
      
      showToast?.({
        message: "Erro ao mover chat",
        description: errorMessage,
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

    if (fromColumn === "repescagem") {
      showToast?.({
        message: "Movimentação bloqueada",
        description: "Chats na coluna 'Repescagem' só podem ser movidos automaticamente pelo sistema de rotinas.",
        variant: "destructive",
      });
      return;
    }

    if (fromColumn === "tarefa") {
      showToast?.({
        message: "Movimentação bloqueada",
        description: "Chats na coluna 'Tarefa' só podem ser movidos pelo backend. Não é permitido arrastar manualmente.",
        variant: "destructive",
      });
      return;
    }

    if (toColumn === "tarefa") {
      showToast?.({
        message: "Movimentação bloqueada",
        description: "A coluna 'Tarefa' é gerenciada exclusivamente pelo backend. Não é permitido arrastar conversas para esta coluna.",
        variant: "destructive",
      });
      return;
    }

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
              tarefa: [],
              lead_quente: [],
              cliente: [],
              lead_frio: []
            };

            updatedChatsData.chats.forEach((chat: Chat) => {
              const columnMap: Record<string, string> = {
                'inbox': 'inicial',
                'vip': 'vip',
                'humanized': 'humanizado',
                'followup': 'repescagem',
                'task': 'tarefa',
                'hot_lead': 'lead_quente',
                'client': 'cliente',
                'cold_lead': 'lead_frio',
                'Repescagem': 'repescagem',
                'Lead Quente': 'lead_quente',
                'Atendimento Inicial': 'inicial'
              };

              const targetColumn = columnMap[chat.column] || 'inicial';
              organized[targetColumn].push(chat);
            });

            Object.keys(organized).forEach(column => {
              organized[column] = sortChatsByLastMessage(organized[column], "recent");
            });

            setChats(organized);
          }
        } catch (error) {
          logError("Erro ao recarregar chats:", { error });
        }
      }
    }
  };

  const handleCloseChat = () => {
    setSelectedChat(null);
    onChatClosed?.();
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
        <div className="w-full overflow-x-auto overflow-y-hidden pb-4 horizontal-scroll-container">
          <div className="flex gap-4 h-[calc(100vh-120px)] min-w-min">
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
                onCreateTask={handleCreateTask}
                onOpenTaskManager={handleManageTasks}
                onRefresh={loadTags}
                onChatClosed={onChatClosed}
                showToast={showToast}
                hideUploadChat={hideUploadChat}
                toggleHideUploadChat={toggleHideUploadChat}
                showHiddenChats={showHiddenChats}
                toggleShowHiddenChats={toggleShowHiddenChats}
                hideTemporaryChats={hideTemporaryChats}
                toggleHideTemporaryChats={toggleHideTemporaryChats}
              />
            ))}
          </div>
        </div>

        {selectedChat && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={handleCloseChat}
          >
            <div 
              className="w-full max-w-2xl h-[80vh] mx-4 animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <ChatWindow
                chat={selectedChat}
                onClose={handleCloseChat}
                setOpenChatId={setOpenChatId}
              />
            </div>
          </div>
        )}
      </DragDropContext>

      {chatForTagManager && (
        <ChatTagsModal
          chat={chatForTagManager}
          availableTags={availableTags}
          onClose={() => setChatForTagManager(null)}
          onUpdate={handleTagsUpdated}
        />
      )}

      {/* Modal de Tarefa */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        chat={chatForTask}
        onTaskCreated={handleTaskCreated}
        showToast={showToast}
      />

      {/* Modal de Gerenciamento de Tarefas */}
      <TaskManagerModal
        isOpen={showTaskManagerModal}
        onClose={() => setShowTaskManagerModal(false)}
        chat={chatForTaskManager}
        onTasksUpdated={handleTasksUpdated}
        showToast={showToast}
      />
    </>
  );
};

export default ChatColumns;