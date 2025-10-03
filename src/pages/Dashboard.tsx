import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Menu,
  QrCode,
  Tag,
  Settings,
  X,
  LogOut,
  ChevronRight,
  User,
  MessageCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import QRConnection from "@/components/QRConnection";
import ChatColumns from "@/components/ChatColumns";
import TagManager from "@/components/TagManager";

// Interface para tipar os dados do dashboard
interface DashboardData {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    confirmed: boolean;
  };
  // Adicione aqui outras propriedades conforme você adicionar no backend
  // messages?: Array<any>;
  // contacts?: Array<any>;
  // conversations?: Array<any>;
}

// Sidebar com animação e overlay sincronizado
const Sidebar: React.FC<{
  onClose: () => void;
  onOpenTags: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  isOpen: boolean;
  userName: string;
}> = ({ onClose, onOpenTags, onOpenSettings, onLogout, isOpen, userName }) => {
  const [visible, setVisible] = useState(isOpen);

  useEffect(() => {
    if (isOpen) setVisible(true);
  }, [isOpen]);

  const handleTransitionEnd = () => {
    if (!isOpen) setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay sincronizado com a sidebar */}
      <div
        className={`absolute inset-0 bg-black transition-all duration-300 ease-in-out ${
          isOpen ? "opacity-50" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Sidebar panel */}
      <aside
        className={`relative w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        onTransitionEnd={handleTransitionEnd}
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-b from-green-400 to-green-600 rounded-lg shadow-md flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-semibold text-gray-900 text-lg block">Menu</span>
              <span className="text-xs text-gray-500">{userName}</span>
            </div>
          </div>
          <button
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <nav className="p-3">
          <button
            className="w-full text-left flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors group"
            onClick={onOpenTags}
          >
            <Tag className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
            <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">
              Gerenciar Etiquetas
            </span>
          </button>

          <button
            className="w-full text-left flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors group"
            onClick={onOpenSettings}
          >
            <Settings className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
            <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">
              Configurações
            </span>
          </button>

          <div className="my-4 border-t border-gray-200" />

          <button
            className="w-full text-left flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-red-50 transition-colors group"
            onClick={onLogout}
          >
            <LogOut className="w-5 h-5 text-red-500" />
            <span className="text-sm text-red-500 font-medium">
              Sair
            </span>
          </button>
        </nav>
      </aside>
    </div>
  );
};

// Painel de Configurações
const SettingsPanel: React.FC<{ 
  onClose: () => void;
  userData: DashboardData["user"];
}> = ({ onClose, userData }) => {
  const [showAccountInfo, setShowAccountInfo] = useState(false);

  if (showAccountInfo) {
    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
        <div className="absolute inset-0 bg-black/30" onClick={() => setShowAccountInfo(false)} />

        <div className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 z-10 mt-20">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Informações da Conta</h2>
            <button
              className="p-2 rounded-md hover:bg-gray-100"
              onClick={() => setShowAccountInfo(false)}
              aria-label="Voltar"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <label className="text-sm font-medium text-gray-600 block mb-2">Nome</label>
              <p className="text-base text-gray-900 font-medium">{userData.name}</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <label className="text-sm font-medium text-gray-600 block mb-2">E-mail</label>
              <p className="text-base text-gray-900">{userData.email}</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <label className="text-sm font-medium text-gray-600 block mb-2">Senha</label>
              <div className="flex items-center justify-between">
                <p className="text-base text-gray-900">••••••••</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  Alterar Senha
                </Button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <label className="text-sm font-medium text-gray-600 block mb-2">Tipo de Conta</label>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base text-gray-900 font-medium">{userData.role}</p>
                  <p className="text-sm text-gray-500">
                    Status: {userData.confirmed ? "Confirmado" : "Pendente"}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  userData.confirmed 
                    ? "bg-green-100 text-green-700" 
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                  {userData.confirmed ? "Ativo" : "Pendente"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              onClick={() => setShowAccountInfo(false)}
            >
              Fechar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div className="relative bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 z-10 mt-20">
        <div className="flex items-start justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Configurações</h2>
          <button
            className="p-2 rounded-md hover:bg-gray-100"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="mt-6">
          <button
            className="w-full rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
            onClick={() => setShowAccountInfo(true)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-800">
                    Informações da Conta
                  </div>
                  <div className="text-sm text-gray-500">
                    Visualizar informações da conta
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

// Dashboard principal
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  // Função de logout usando useCallback para evitar problemas de dependência
  const handleLogout = useCallback(() => {
    // Limpar localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("dashboardData");
    
    // Redirecionar para login
    navigate("/");
  }, [navigate]);

  // Carregar dados do localStorage quando o componente montar
  useEffect(() => {
  const validateSession = async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    
    if (!token || !userId) {
      handleLogout();
      return;
    }

    try {
      // Faz uma chamada ao backend para validar o token
      const response = await fetch(
        `http://localhost:8081/dashboard?userId=${userId}`,
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
        setDashboardData(data);
        // Atualiza o localStorage com dados frescos do backend
        localStorage.setItem("dashboardData", JSON.stringify(data));
        console.log("Dados do dashboard carregados:", data);
      } else {
        // Token inválido ou expirado
        console.error("Sessão inválida");
        handleLogout();
      }
      } catch (error) {
        console.error("Erro ao validar sessão:", error);
        handleLogout();
      }
    };

    validateSession();
  }, [handleLogout]);

  // Se ainda não carregou os dados, mostra loading
  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-[#f4f8f9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f8f9] flex relative">
      <Sidebar
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        onOpenTags={() => {
          setShowTagManager(true);
          setShowSidebar(false);
        }}
        onOpenSettings={() => {
          setShowSettings(true);
          setShowSidebar(false);
        }}
        onLogout={handleLogout}
        userName={dashboardData.user.name}
      />

      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 relative">
          <div className="px-4 py-3 flex items-center">
            <button
              className="ml-6 p-2"
              onClick={() => setShowSidebar(true)}
              aria-label="Abrir menu"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>

            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-b from-green-400 to-green-600 rounded-lg shadow-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col leading-tight text-center">
                <h1 className="text-[15px] font-semibold text-[#1a1a1a]">
                  WhatsApp Business Monitor
                </h1>
                <p className="text-[13px] text-[#6b7a89]">
                  Sistema de Gestão de Conversas
                </p>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-green-700">
                {dashboardData.user.name}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-start justify-center p-4 pt-8">
          {!isConnected ? (
            <Card className="shadow-md max-w-sm w-full rounded-lg">
              <CardHeader className="text-center pt-8">
                <div className="p-6 bg-[#edf2f3] rounded-full w-fit mx-auto mb-4">
                  <QrCode className="w-10 h-10 text-[#7f8b91]" />
                </div>
                <CardTitle className="text-base font-semibold text-gray-800">
                  Conecte seu WhatsApp Business
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center pb-8">
                <p className="text-sm text-gray-500 mb-6">
                  Para começar a monitorar suas conversas, conecte sua conta do
                  WhatsApp Business.
                </p>
                <Button
                  className="w-full bg-green-500 text-white hover:bg-green-600 rounded-md py-2 px-4 font-semibold flex items-center justify-center gap-2"
                  onClick={() => setShowQR(true)}
                >
                  <QrCode className="w-4 h-4 text-white opacity-90" />
                  Conectar Agora
                </Button>
              </CardContent>
            </Card>
          ) : (
            <ChatColumns />
          )}
        </main>

        {showQR && (
          <QRConnection
            onClose={() => setShowQR(false)}
            onConnected={() => {
              setIsConnected(true);
              setShowQR(false);
            }}
          />
        )}
        {showTagManager && <TagManager onClose={() => setShowTagManager(false)} />}
        {showSettings && (
          <SettingsPanel 
            onClose={() => setShowSettings(false)}
            userData={dashboardData.user}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;