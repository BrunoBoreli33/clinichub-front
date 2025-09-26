import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Tag, MoveRight } from "lucide-react";
import { Chat, Tag as TagType } from "./ChatColumns";

interface ChatColumnProps {
  id: string;
  title: string;
  color: string;
  chats: Chat[];
  onChatSelect: (chat: Chat) => void;
  onMoveChat: (chatId: string, fromColumn: string, toColumn: string) => void;
  onUpdateTag: (chatId: string, columnId: string, tag: TagType | undefined) => void;
}

const availableTags: TagType[] = [
  { id: "1", name: "Botox", color: "#10B981" },
  { id: "2", name: "Preenchimento", color: "#8B5CF6" },
  { id: "3", name: "Limpeza de Pele", color: "#F59E0B" },
  { id: "4", name: "Consulta", color: "#EF4444" },
  { id: "5", name: "Retorno", color: "#06B6D4" },
];

const columns = [
  { id: "vip", title: "Atendimento VIP" },
  { id: "humanizado", title: "Atendimento Humanizado" },
  { id: "repescagem", title: "Repescagem" },
  { id: "tarefa", title: "Tarefa" },
  { id: "inicial", title: "Atendimento Inicial" }
];

const ChatColumn = ({ id, title, color, chats, onChatSelect, onMoveChat, onUpdateTag }: ChatColumnProps) => {
  return (
    <Card className="w-80 h-full bg-gradient-card border-0 shadow-card flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className={`text-sm font-semibold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
          {title}
        </CardTitle>
        <div className="text-xs text-muted-foreground">
          {chats.length} conversa{chats.length !== 1 ? 's' : ''}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden">
        <div className="space-y-1 h-full overflow-y-auto px-4 pb-4">
          {chats.map(chat => (
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
                    <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-medium">
                      {chat.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-foreground truncate">{chat.name}</h4>
                        <span className="text-xs text-muted-foreground">{chat.time}</span>
                      </div>
                      {chat.unread > 0 && (
                        <Badge variant="secondary" className="bg-primary text-white text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                          {chat.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground truncate mb-2">{chat.lastMessage}</p>
                  
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
                    
                    {columns.filter(col => col.id !== id).map(column => (
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatColumn;