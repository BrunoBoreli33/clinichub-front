import { useEffect, useState, useRef } from "react";
import { Progress } from "@/components/ui/progress";
import { buildUrl } from "@/lib/api";
import { MessageCircle, Users, Image } from "lucide-react";
import { ChatsData } from "@/types/chat";  // ✅ Import correto

interface LoadingChatsProps {
  onLoadingComplete: (chatsData: ChatsData | null) => void;
  totalChats: number;
}

const LoadingChats = ({ onLoadingComplete, totalChats }: LoadingChatsProps) => {
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [total, setTotal] = useState(totalChats);
  const [statusMessage, setStatusMessage] = useState("Carregando conversas...");
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    const checkProgress = async () => {
      const token = localStorage.getItem("token");
      if (!token || hasCompletedRef.current) return;

      try {
        const response = await fetch(
          buildUrl('/dashboard/zapi/chats_loading_progress'),
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          
          setProgress(data.percentage || 0);
          setLoaded(data.loaded || 0);
          setTotal(data.total || totalChats);

          // Atualizar mensagem de status baseado no progresso
          if (data.percentage < 30) {
            setStatusMessage("Sincronizando contatos...");
          } else if (data.percentage < 70) {
            setStatusMessage("Carregando fotos de perfil...");
          } else if (data.percentage < 100) {
            setStatusMessage("Quase pronto...");
          } else {
            setStatusMessage("Carregamento concluído!");
          }

          // Se completou, buscar os chats e finalizar
          if (data.completed && data.percentage >= 100) {
            hasCompletedRef.current = true;
            
            // Pequeno delay para mostrar 100% antes de redirecionar
            setTimeout(async () => {
              try {
                const chatsResponse = await fetch(
                  buildUrl('/dashboard/zapi/chats'),
                  {
                    method: "GET",
                    headers: {
                      Authorization: `Bearer ${token}`,
                      "Content-Type": "application/json",
                    },
                  }
                );

                if (chatsResponse.ok) {
                  const chatsData = await chatsResponse.json();
                  onLoadingComplete(chatsData);
                }
              } catch (error) {
                console.error("Erro ao buscar chats finais:", error);
                // Mesmo com erro, redireciona
                onLoadingComplete(null);
              }
            }, 800);

            // Para o polling
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
          }
        }
      } catch (error) {
        console.error("Erro ao verificar progresso:", error);
      }
    };

    // Primeira verificação imediata
    checkProgress();

    // Polling a cada 1000ms para atualização suave
    pollingIntervalRef.current = setInterval(checkProgress, 1000);

    // Cleanup
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [totalChats, onLoadingComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo e Título */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-gradient-to-b from-green-400 to-green-600 rounded-2xl shadow-lg animate-pulse">
              <MessageCircle className="w-16 h-16 text-white" />
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              WhatsApp Business Monitor
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              {statusMessage}
            </p>
          </div>
        </div>

        {/* Card de Progresso */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Estatísticas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{total}</div>
              <div className="text-xs text-gray-600">Conversas</div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <Image className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{loaded}</div>
              <div className="text-xs text-gray-600">Fotos Carregadas</div>
            </div>
          </div>

          {/* Barra de Progresso */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Progresso
              </span>
              <span className="text-sm font-bold text-green-600">
                {progress}%
              </span>
            </div>
            
            <Progress 
              value={progress} 
              className="h-3 bg-gray-200"
            />
            
            <div className="text-center">
              <p className="text-xs text-gray-500">
                {loaded} de {total} contatos processados
              </p>
            </div>
          </div>

          {/* Mensagem de Status */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <p className="text-sm text-gray-700 font-medium">
                {progress < 100 
                  ? "Carregando informações dos contatos..." 
                  : "Preparando sua área de trabalho..."}
              </p>
            </div>
          </div>
        </div>

        {/* Animação decorativa */}
        <div className="flex justify-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

export default LoadingChats;