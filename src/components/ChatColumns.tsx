import { useState } from "react";
import ChatColumn from "./ChatColumn";
import ChatWindow from "./ChatWindow";

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  avatar: string;
  unread: number;
  tag?: Tag;
  messages: Message[];
}

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: "user" | "client";
  type: "text" | "audio";
  duration?: number;
}

const ChatColumns = () => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  
  // Dados mockados para demonstração
  const [chats, setChats] = useState<Record<string, Chat[]>>({
    vip: [
      {
        id: "1",
        name: "Maria Silva",
        lastMessage: "Quero agendar o procedimento",
        time: "14:30",
        avatar: "MS",
        unread: 2,
        tag: { id: "1", name: "Botox", color: "#10B981" },
        messages: [
          { id: "1", content: "Olá! Gostaria de mais informações sobre botox", timestamp: "14:25", sender: "client", type: "text" },
          { id: "2", content: "Claro! Temos várias opções disponíveis. Quando gostaria de agendar?", timestamp: "14:26", sender: "user", type: "text" },
          { id: "3", content: "Quero agendar o procedimento", timestamp: "14:30", sender: "client", type: "text" }
        ]
      }
    ],
    humanizado: [
      {
        id: "2",
        name: "João Santos",
        lastMessage: "Muito obrigado pelo atendimento",
        time: "13:45",
        avatar: "JS",
        unread: 0,
        tag: { id: "2", name: "Preenchimento", color: "#8B5CF6" },
        messages: [
          { id: "1", content: "Boa tarde! Como foi o procedimento?", timestamp: "13:40", sender: "user", type: "text" },
          { id: "2", content: "Foi excelente! Muito satisfeito", timestamp: "13:44", sender: "client", type: "text" },
          { id: "3", content: "Muito obrigado pelo atendimento", timestamp: "13:45", sender: "client", type: "text" }
        ]
      }
    ],
    repescagem: [
      {
        id: "3",
        name: "Ana Costa",
        lastMessage: "Ainda estou pensando...",
        time: "12:20",
        avatar: "AC",
        unread: 1,
        messages: [
          { id: "1", content: "Olá Ana! Viu nossa promoção especial?", timestamp: "12:15", sender: "user", type: "text" },
          { id: "2", content: "Ainda estou pensando...", timestamp: "12:20", sender: "client", type: "text" }
        ]
      }
    ],
    tarefa: [
      {
        id: "4",
        name: "Carlos Lima",
        lastMessage: "Preciso reagendar",
        time: "11:30",
        avatar: "CL",
        unread: 1,
        messages: [
          { id: "1", content: "Preciso reagendar minha consulta", timestamp: "11:25", sender: "client", type: "text" },
          { id: "2", content: "Sem problemas! Que dia seria melhor?", timestamp: "11:28", sender: "user", type: "text" },
          { id: "3", content: "Preciso reagendar", timestamp: "11:30", sender: "client", type: "text" }
        ]
      }
    ],
    inicial: [
      {
        id: "5",
        name: "Luciana Rocha",
        lastMessage: "Primeira vez aqui",
        time: "10:15",
        avatar: "LR",
        unread: 3,
        messages: [
          { id: "1", content: "Olá! É a primeira vez que venho aqui", timestamp: "10:10", sender: "client", type: "text" },
          { id: "2", content: "Sejam bem-vindas! Em que posso ajudar?", timestamp: "10:12", sender: "user", type: "text" },
          { id: "3", content: "Primeira vez aqui", timestamp: "10:15", sender: "client", type: "text" }
        ]
      }
    ]
  });

  const columns = [
    { id: "vip", title: "Atendimento VIP", color: "from-yellow-400 to-orange-500" },
    { id: "humanizado", title: "Atendimento Humanizado", color: "from-blue-400 to-blue-600" },
    { id: "inicial", title: "Atendimento Inicial", color: "from-green-400 to-green-600" },
    { id: "repescagem", title: "Repescagem", color: "from-red-400 to-red-600" },
    { id: "tarefa", title: "Tarefa", color: "from-purple-400 to-purple-600" }
  ];

  const moveChat = (chatId: string, fromColumn: string, toColumn: string) => {
    const chat = chats[fromColumn]?.find(c => c.id === chatId);
    if (!chat) return;

    setChats(prev => ({
      ...prev,
      [fromColumn]: prev[fromColumn].filter(c => c.id !== chatId),
      [toColumn]: [...(prev[toColumn] || []), chat]
    }));
  };

  const updateChatTag = (chatId: string, columnId: string, tag: Tag | undefined) => {
    setChats(prev => ({
      ...prev,
      [columnId]: prev[columnId].map(chat => 
        chat.id === chatId ? { ...chat, tag } : chat
      )
    }));
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-120px)] justify-center">
      {/* Colunas de Chat */}
      <div className="flex gap-4 justify-center">
        {columns.map(column => (
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

      {/* Janela de Chat */}
      {selectedChat && (
        <div className="w-96">
          <ChatWindow
            chat={selectedChat}
            onClose={() => setSelectedChat(null)}
          />
        </div>
      )}
    </div>
  );
};

export default ChatColumns;