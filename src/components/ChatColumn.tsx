import { Draggable } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Tag, ArrowRight } from "lucide-react";
import type { Chat, ChatTag } from "@/components/ChatColumns";

interface ChatColumnProps {
  title: string;
  chats: Chat[];
  color: string;
  tags: ChatTag[];
  onChatClick: (chat: Chat) => void;
  onTagChange: (chatId: string, tagIds: string[]) => void;
  onMoveChat: (chatId: string, targetColumn: string) => void;
  columns: Array<{ id: string; title: string; color: string }>;
}

export const ChatColumn = ({ title, chats, color, tags, onChatClick, onTagChange, onMoveChat, columns }: ChatColumnProps) => {
  const getTagColor = (tagId: string) => {
    const tag = tags.find(t => t.id === tagId);
    return tag?.color || "#6B7280";
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Card className="h-full flex flex-col shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <div className={`w-3 h-3 rounded-full ${color}`}></div>
          {title}
          <Badge variant="secondary" className="ml-auto">
            {chats.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto space-y-2 px-3">
        {chats.map((chat, index) => (
          <Draggable key={chat.id} draggableId={chat.id} index={index}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className={`group p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                  snapshot.isDragging 
                    ? "bg-primary/10 border-primary shadow-lg" 
                    : "bg-card hover:bg-muted/50"
                }`}
                onClick={() => onChatClick(chat)}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={chat.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {chat.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm truncate">{chat.name}</h4>
                      <div className="flex items-center gap-1">
                        {chat.unreadCount > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                          >
                            {chat.unreadCount}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">{chat.time}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={handleMenuClick}>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {}}>
                              <Tag className="h-4 w-4 mr-2" />
                              Alterar Etiquetas
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {columns.filter(col => col.id !== title.toLowerCase().replace(/\s+/g, '')).map(column => (
                              <DropdownMenuItem 
                                key={column.id}
                                onClick={() => onMoveChat(chat.id, column.id)}
                              >
                                <ArrowRight className="h-4 w-4 mr-2" />
                                Mover para {column.title}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {chat.lastMessage}
                    </p>
                    
                    {chat.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {chat.tags.map((tagId) => {
                          const tag = tags.find(t => t.id === tagId);
                          return tag ? (
                            <Badge
                              key={tagId}
                              variant="outline"
                              className="text-xs px-2 py-0"
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
                  </div>
                </div>
              </div>
            )}
          </Draggable>
        ))}
        
        {chats.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Nenhuma conversa</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};