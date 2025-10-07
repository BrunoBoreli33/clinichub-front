import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";
import { MoreVertical, Tag, MoveRight, MessageCircle, ArrowUpDown, Settings } from "lucide-react";
import ChatWindow from "./ChatWindow";

// Interfaces
export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Chat {
  id: string;
  name: string;
  phone: string;
  lastMessageTime: string | null;
  isGroup: boolean;
  unread: number;
  profileThumbnail: string | null;
  column: string;
  ticket: { tag?: string } | null;
}

interface ChatsData {
  success: boolean;
  message: string;
  totalChats: number;
  unreadCount: number;
  chats: Chat[];
}

// ← MODIFICADO: Adicionada prop showToast
interface ChatColumnsProps {
  chatsData?: ChatsData | null;
  showToast?: (toast: { message: string; description?: string; variant?: string }) => void;
}

// Tags disponíveis
const availableTags: Tag[] = [
  { id: "1", name: "Botox", color: "#10B981" },
  { id: "2", name: "Preenchimento", color: "#8B5CF6" },
  { id: "3", name: "Limpeza de Pele", color: "#F59E0B" },
  { id: "4", name: "Consulta", color: "#EF4444" },
  { id: "5", name: "Retorno", color: "#06B6D4" },
];

// Definição das colunas
const columnsConfig = [
  { id: "vip", title: "Atendimento VIP", color: "from-orange-400 to-orange-500" },
  { id: "humanizado", title: "Atendimento Humanizado", color: "from-blue-500 to-blue-600" },
  { id: "inicial", title: "Atendimento Inicial", color: "from-green-500 to-green-600" },
  { id: "repescagem", title: "Repescagem", color: "from-red-500 to-red-600" },
  { id: "tarefa", title: "Tarefa", color: "from-purple-500 to-purple-600" }
];

// Componente ChatColumn (interno)
interface ChatColumnProps {
  id: string;
  title: string;
  color: string;
  chats: Chat[];
  onChatSelect: (chat: Chat) => void;
  onMoveChat: (chatId: string, fromColumn: string, toColumn: string) => void;
  onUpdateTag: (chatId: string, columnId: string, tag: Tag | undefined) => void;
}

const ChatColumn = ({ id, title, color, chats, onChatSelect, onMoveChat, onUpdateTag }: ChatColumnProps) => {
  const [sortOrder, setSortOrder] = useState<"recent" | "oldest">("recent");
  
  // Carregar preferências do localStorage
  const [showGroups, setShowGroups] = useState(() => {
    const saved = localStorage.getItem(`column-${id}-showGroups`);
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const [showNewsletters, setShowNewsletters] = useState(() => {
    const saved = localStorage.getItem(`column-${id}-showNewsletters`);
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Salvar preferências no localStorage quando mudar
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

  // Verificar se é newsletter (número muito longo ou com padrão específico)
  const isNewsletter = (chat: Chat) => {
    return chat.phone.includes("newsletter") || chat.phone.length > 20;
  };

  // Filtrar chats baseado nas configurações
  const filteredChats = chats.filter(chat => {
    if (!showGroups && chat.isGroup) return false;
    if (!showNewsletters && isNewsletter(chat)) return false;
    return true;
  });

  // Ordenar chats com base no sortOrder
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
        <div className="text-xs text-muted-foreground font-medium">
          {sortedChats.length} conversa{sortedChats.length !== 1 ? 's' : ''}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden">
        <div className="space-y-1 h-full overflow-y-auto px-4 pb-4">
          {chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <MessageCircle className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-xs">Nenhuma conversa</p>
            </div>
          ) : (
            sortedChats.map(chat => (
              <div
                key={chat.id}
                className="group p-3 rounded-lg bg-white/50 hover:bg-white/80 cursor-pointer transition-all duration-200 hover:shadow-card border border-white/20"
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
                    
                    <div className="flex items-center gap-2">
                      {chat.isGroup && (
                        <Badge variant="outline" className="text-xs">
                          Grupo
                        </Badge>
                      )}
                      
                      {chat.ticket?.tag && (
                        <Badge 
                          variant="outline" 
                          className="text-xs"
                          style={{ 
                            borderColor: availableTags.find(t => t.name === chat.ticket?.tag)?.color || "#666",
                            color: availableTags.find(t => t.name === chat.ticket?.tag)?.color || "#666",
                            backgroundColor: `${availableTags.find(t => t.name === chat.ticket?.tag)?.color || "#666"}10`
                          }}
                        >
                          {chat.ticket.tag}
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
                      <DropdownMenuItem className="text-xs font-medium text-muted-foreground cursor-default">
                        <Tag className="mr-2 h-3 w-3" />
                        Alterar Etiqueta
                      </DropdownMenuItem>
                      
                      {availableTags.map(tag => (
                        <DropdownMenuItem 
                          key={tag.id}
                          onClick={() => onUpdateTag(chat.id, id, tag)}
                          className="text-xs pl-6"
                        >
                          <div 
                            className="w-2 h-2 rounded-full mr-2"
                            style={{ backgroundColor: tag.color }}
                          />
                          {tag.name}
                        </DropdownMenuItem>
                      ))}
                      
                      <DropdownMenuItem 
                        onClick={() => onUpdateTag(chat.id, id, undefined)}
                        className="text-xs pl-6 text-muted-foreground"
                      >
                        Remover etiqueta
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
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Componente principal ChatColumns
// ← MODIFICADO: Adicionado showToast na desestruturação
const ChatColumns = ({ chatsData, showToast }: ChatColumnsProps) => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [chats, setChats] = useState<Record<string, Chat[]>>({
    vip: [],
    humanizado: [],
    inicial: [],
    repescagem: [],
    tarefa: []
  });

  // Organizar chats vindos do backend nas colunas corretas
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
        // Mapear column do backend para as colunas locais
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

  // ← MÉTODO COMPLETAMENTE MODIFICADO: Backend-first
  const moveChat = async (chatId: string, fromColumn: string, toColumn: string) => {
    const chat = chats[fromColumn]?.find(c => c.id === chatId);
    if (!chat) return;

    // Mapeamento das colunas do frontend para o formato do backend
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
      // PASSO 1: Fazer requisição ao backend PRIMEIRO
      const response = await fetch(`http://localhost:8081/dashboard/zapi/chats/${chatId}/column`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ column: backendColumn })
      });

      const data = await response.json();

      // PASSO 2: Verificar se a requisição foi bem-sucedida
      if (response.ok && data.success) {
        // PASSO 3: Atualizar estado local SOMENTE se o backend confirmou
        setChats(prev => ({
          ...prev,
          [fromColumn]: prev[fromColumn].filter(c => c.id !== chatId),
          [toColumn]: [...(prev[toColumn] || []), { ...chat, column: backendColumn }]
        }));

        // Feedback de sucesso
        showToast?.({
          message: "Chat movido com sucesso!",
          description: `Movido para ${columnsConfig.find(c => c.id === toColumn)?.title}`,
        });
      } else {
        // Erro retornado pelo backend
        throw new Error(data.message || "Erro ao mover chat");
      }
    } catch (error) {
      console.error("Erro ao mover chat:", error);
      
      // Mostrar erro ao usuário
      showToast?.({
        message: "Erro ao mover chat",
        description: error instanceof Error ? error.message : "Não foi possível mover o chat. Tente novamente.",
        variant: "destructive"
      });

      // O estado local NÃO foi alterado, então o chat permanece na coluna original
    }
  };

  const updateChatTag = (chatId: string, columnId: string, tag: Tag | undefined) => {
    setChats(prev => ({
      ...prev,
      [columnId]: prev[columnId].map(chat => 
        chat.id === chatId 
          ? { ...chat, ticket: tag ? { tag: tag.name } : null } 
          : chat
      )
    }));

    // TODO: Fazer requisição para o backend atualizar a tag do chat
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`http://localhost:8081/dashboard/zapi/chat/${chatId}/tag`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tag: tag?.name || null })
      }).catch(err => console.error("Erro ao atualizar tag:", err));
    }
  };

  // Loading state
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
    <div className="flex gap-4 h-[calc(100vh-120px)] justify-center">
      {/* Colunas de Chat */}
      <div className="flex gap-4 justify-center">
        {columnsConfig.map(column => (
          <ChatColumn
            key={column.id}
            id={column.id}
            title={column.title}
            color={column.color}
            chats={chats[column.id] || []}
            onChatSelect={setSelectedChat}
            onMoveChat={moveChat}
            onUpdateTag={updateChatTag}
          />
        ))}
      </div>

      {/* Janela de Chat - Centralizada com Overlay */}
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
  );
};

export default ChatColumns;