import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { ChatColumn } from "@/components/ChatColumn";
import { ChatWindow } from "@/components/ChatWindow";
import { TagManager } from "@/components/TagManager";
import { Button } from "@/components/ui/button";
import { Settings, Tags } from "lucide-react";

export interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  tags: string[];
  avatar?: string;
}

export interface ChatTag {
  id: string;
  name: string;
  color: string;
}

const initialChats: Chat[] = [
  {
    id: "1",
    name: "Maria Silva",
    lastMessage: "Olá, gostaria de saber sobre o procedimento de botox",
    time: "14:30",
    unreadCount: 2,
    tags: ["botox"]
  },
  {
    id: "2", 
    name: "João Santos",
    lastMessage: "Qual o valor do preenchimento labial?",
    time: "13:45",
    unreadCount: 1,
    tags: ["preenchimento"]
  },
  {
    id: "3",
    name: "Ana Costa",
    lastMessage: "Obrigada pelo atendimento!",
    time: "12:20",
    unreadCount: 0,
    tags: []
  }
];

const initialTags: ChatTag[] = [
  { id: "botox", name: "Botox", color: "#3B82F6" },
  { id: "preenchimento", name: "Preenchimento", color: "#10B981" },
  { id: "limpeza", name: "Limpeza de Pele", color: "#F59E0B" },
  { id: "consulta", name: "Consulta", color: "#8B5CF6" }
];

export const ChatColumns = () => {
  const [chats, setChats] = useState<Record<string, Chat[]>>({
    vip: [initialChats[0]],
    humanizado: [initialChats[1]],
    repescagem: [],
    tarefa: [],
    inicial: [initialChats[2]]
  });
  
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [tags, setTags] = useState<ChatTag[]>(initialTags);
  const [showTagManager, setShowTagManager] = useState(false);

  const columns = [
    { id: "vip", title: "Atendimento VIP", color: "bg-yellow-500" },
    { id: "humanizado", title: "Atendimento Humanizado", color: "bg-blue-500" },
    { id: "repescagem", title: "Repescagem", color: "bg-orange-500" },
    { id: "tarefa", title: "Tarefa", color: "bg-purple-500" },
    { id: "inicial", title: "Atendimento Inicial", color: "bg-green-500" }
  ];

  const handleMoveChat = (chatId: string, targetColumn: string) => {
    const sourceColumn = Object.keys(chats).find(col => 
      chats[col].some(chat => chat.id === chatId)
    );
    
    if (!sourceColumn) return;
    
    const newChats = { ...chats };
    const chatIndex = newChats[sourceColumn].findIndex(chat => chat.id === chatId);
    const [movedChat] = newChats[sourceColumn].splice(chatIndex, 1);
    newChats[targetColumn].push(movedChat);
    
    setChats(newChats);
  };

  const handleTagChange = (chatId: string, tagIds: string[]) => {
    const newChats = { ...chats };
    for (const column in newChats) {
      const chatIndex = newChats[column].findIndex(chat => chat.id === chatId);
      if (chatIndex !== -1) {
        newChats[column][chatIndex].tags = tagIds;
        break;
      }
    }
    setChats(newChats);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceColumn = result.source.droppableId;
    const destColumn = result.destination.droppableId;
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    if (sourceColumn === destColumn && sourceIndex === destIndex) return;

    const newChats = { ...chats };
    const [movedChat] = newChats[sourceColumn].splice(sourceIndex, 1);
    newChats[destColumn].splice(destIndex, 0, movedChat);

    setChats(newChats);
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-4">
      <div className="flex-1">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-foreground">
            Gerenciamento de Conversas
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTagManager(true)}
              className="flex items-center gap-2"
            >
              <Tags className="h-4 w-4" />
              Gerenciar Etiquetas
            </Button>
          </div>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-5 gap-4 h-full">
            {columns.map((column) => (
              <Droppable key={column.id} droppableId={column.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="h-full"
                  >
                    <ChatColumn
                      title={column.title}
                      chats={chats[column.id] || []}
                      color={column.color}
                      tags={tags}
                      onChatClick={setSelectedChat}
                      onTagChange={handleTagChange}
                      onMoveChat={handleMoveChat}
                      columns={columns}
                    />
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>

      {selectedChat && (
        <div className="w-96">
          <ChatWindow
            chat={selectedChat}
            onClose={() => setSelectedChat(null)}
            tags={tags}
          />
        </div>
      )}

      {showTagManager && (
        <TagManager
          tags={tags}
          onTagsChange={setTags}
          onClose={() => setShowTagManager(false)}
        />
      )}
    </div>
  );
};