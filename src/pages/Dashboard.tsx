import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import Toast from "@/components/Toast";
import LoadingChats from "./LoadingChats";

// Interface para tipar os dados do dashboard
interface DashboardData {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    confirmed: boolean;
  };
}

// Interface para os dados dos chats
interface ChatsData {
  success: boolean;
  message: string;
  totalChats: number;
  unreadCount: number;
  chats: {
    id: string;
    name: string;
    phone: string;
    lastMessageTime: string | null;
    isGroup: boolean;
    unread: number;
    profileThumbnail: string | null;
    column: string;
    ticket: { tag?: string } | null;
  }[];
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
      <div
        className={`absolute inset-0 bg-black transition-all duration-300 ease-in-out ${
          isOpen ? "opacity-50" : "opacity-0"
        }`}
        onClick={onClose}
      />

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

// Painel de Configurações com Edição
const SettingsPanel: React.FC<{ 
  onClose: () => void;
  userData: DashboardData["user"];
  onUserUpdate: (updatedData: DashboardData) => void;
  showToast: (params: { message: string; description?: string; variant?: string }) => void;
}> = ({ onClose, userData, onUserUpdate, showToast }) => {
  const [showAccountInfo, setShowAccountInfo] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  
  const [newName, setNewName] = useState(userData.name);
  const [newEmail, setNewEmail] = useState(userData.email);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [verificationCode, setVerificationCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState<"email" | "password" | null>(null);
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingPassword, setPendingPassword] = useState("");

  // Atualizar Nome
  const handleUpdateName = async () => {
    const token = localStorage.getItem("token");
    
    if (!newName || newName.trim() === "") {
      showToast({ message: "Nome não pode ser vazio", variant: "destructive" });
      return;
    }

    try {
      const response = await fetch("http://localhost:8081/api/profile/update-name", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: newName })
      });

      const data = await response.json();

      if (data.success) {
        showToast({ message: "Nome atualizado com sucesso!", variant: "default" });
        
        const updatedData = {
          ...JSON.parse(localStorage.getItem("dashboardData") || "{}"),
          user: { ...userData, name: data.name }
        };
        localStorage.setItem("dashboardData", JSON.stringify(updatedData));
        localStorage.setItem("userName", data.name);
        
        onUserUpdate(updatedData);
        setEditingName(false);
      } else {
        showToast({ message: data.message || "Erro ao atualizar nome", variant: "destructive" });
      }
    } catch (error) {
      console.error("Erro ao atualizar nome:", error);
      showToast({ message: "Erro de conexão", variant: "destructive" });
    }
  };

  // Solicitar mudança de Email
  const handleRequestEmailChange = async () => {
    const token = localStorage.getItem("token");
    
    if (!newEmail || newEmail.trim() === "") {
      showToast({ message: "Email não pode ser vazio", variant: "destructive" });
      return;
    }

    try {
      const response = await fetch("http://localhost:8081/api/profile/request-email-change", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ newEmail })
      });

      const data = await response.json();

      if (data.success) {
        showToast({ message: data.message, variant: "default" });
        setPendingEmail(newEmail);
        setShowCodeInput("email");
      } else {
        showToast({ message: data.message || "Erro ao solicitar mudança de email", variant: "destructive" });
      }
    } catch (error) {
      console.error("Erro:", error);
      showToast({ message: "Erro de conexão", variant: "destructive" });
    }
  };

  // Confirmar mudança de Email
  const handleConfirmEmailChange = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:8081/api/profile/confirm-email-change", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ newEmail: pendingEmail, code: verificationCode })
      });

      const data = await response.json();

      if (data.success) {
        showToast({ message: "Email atualizado com sucesso! Faça login novamente.", variant: "default" });
        localStorage.clear();
        setTimeout(() => { window.location.href = "/"; }, 2000);
      } else {
        showToast({ message: data.message || "Código inválido", variant: "destructive" });
      }
    } catch (error) {
      console.error("Erro:", error);
      showToast({ message: "Erro de conexão", variant: "destructive" });
    }
  };

  // Solicitar mudança de Senha
  const handleRequestPasswordChange = async () => {
    const token = localStorage.getItem("token");
    
    if (!newPassword || newPassword.trim() === "") {
      showToast({ message: "Senha não pode ser vazia", variant: "destructive" });
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast({ message: "As senhas não coincidem", variant: "destructive" });
      return;
    }

    try {
      const response = await fetch("http://localhost:8081/api/profile/request-password-change", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ newPassword })
      });

      const data = await response.json();

      if (data.success) {
        showToast({ message: data.message, variant: "default" });
        setPendingPassword(newPassword);
        setShowCodeInput("password");
      } else {
        showToast({ message: data.message || "Erro ao solicitar mudança de senha", variant: "destructive" });
      }
    } catch (error) {
      console.error("Erro:", error);
      showToast({ message: "Erro de conexão", variant: "destructive" });
    }
  };

  // Confirmar mudança de Senha
  const handleConfirmPasswordChange = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:8081/api/profile/confirm-password-change", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ newPassword: pendingPassword, code: verificationCode })
      });

      const data = await response.json();

      if (data.success) {
        showToast({ message: "Senha atualizada com sucesso!", variant: "default" });
        setShowCodeInput(null);
        setEditingPassword(false);
        setNewPassword("");
        setConfirmPassword("");
        setVerificationCode("");
      } else {
        showToast({ message: data.message || "Código inválido", variant: "destructive" });
      }
    } catch (error) {
      console.error("Erro:", error);
      showToast({ message: "Erro de conexão", variant: "destructive" });
    }
  };

  if (showAccountInfo) {
    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
        <div className="absolute inset-0 bg-black/30" onClick={() => setShowAccountInfo(false)} />

        <div className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 z-10 mt-20 max-h-[90vh] overflow-y-auto">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Informações da Conta</h2>
            <button className="p-2 rounded-md hover:bg-gray-100" onClick={() => setShowAccountInfo(false)} aria-label="Voltar">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="space-y-4">
            {/* NOME */}
            <div className="border border-gray-200 rounded-lg p-4">
              <label className="text-sm font-medium text-gray-600 block mb-2">Nome</label>
              {editingName ? (
                <div className="space-y-2">
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} className="mb-2" />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleUpdateName} className="bg-green-500 hover:bg-green-600">Salvar</Button>
                    <Button size="sm" variant="outline" onClick={() => { setEditingName(false); setNewName(userData.name); }}>Cancelar</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-base text-gray-900 font-medium">{userData.name}</p>
                  <Button size="sm" variant="outline" onClick={() => setEditingName(true)} className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700">Editar</Button>
                </div>
              )}
            </div>

            {/* EMAIL */}
            <div className="border border-gray-200 rounded-lg p-4">
              <label className="text-sm font-medium text-gray-600 block mb-2">E-mail</label>
              {editingEmail ? (
                <div className="space-y-2">
                  {showCodeInput === "email" ? (
                    <>
                      <p className="text-sm text-gray-600 mb-2">Digite o código enviado para {userData.email}</p>
                      <Input placeholder="Código de 6 dígitos" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} maxLength={6} className="mb-2" />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleConfirmEmailChange} className="bg-green-500 hover:bg-green-600">Confirmar</Button>
                        <Button size="sm" variant="outline" onClick={() => { setShowCodeInput(null); setEditingEmail(false); setVerificationCode(""); }}>Cancelar</Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="mb-2" />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleRequestEmailChange} className="bg-green-500 hover:bg-green-600">Enviar Código</Button>
                        <Button size="sm" variant="outline" onClick={() => { setEditingEmail(false); setNewEmail(userData.email); }}>Cancelar</Button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-base text-gray-900">{userData.email}</p>
                  <Button size="sm" variant="outline" onClick={() => setEditingEmail(true)} className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700">Alterar Email</Button>
                </div>
              )}
            </div>

            {/* SENHA */}
            <div className="border border-gray-200 rounded-lg p-4">
              <label className="text-sm font-medium text-gray-600 block mb-2">Senha</label>
              {editingPassword ? (
                <div className="space-y-2">
                  {showCodeInput === "password" ? (
                    <>
                      <p className="text-sm text-gray-600 mb-2">Digite o código enviado para {userData.email}</p>
                      <Input placeholder="Código de 6 dígitos" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} maxLength={6} className="mb-2" />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleConfirmPasswordChange} className="bg-green-500 hover:bg-green-600">Confirmar</Button>
                        <Button size="sm" variant="outline" onClick={() => { setShowCodeInput(null); setEditingPassword(false); setVerificationCode(""); }}>Cancelar</Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Input type="password" placeholder="Nova senha" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mb-2" />
                      <Input type="password" placeholder="Confirmar nova senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mb-2" />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleRequestPasswordChange} className="bg-green-500 hover:bg-green-600">Enviar Código</Button>
                        <Button size="sm" variant="outline" onClick={() => { setEditingPassword(false); setNewPassword(""); setConfirmPassword(""); }}>Cancelar</Button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-base text-gray-900">••••••••</p>
                  <Button size="sm" variant="outline" onClick={() => setEditingPassword(true)} className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700">Alterar Senha</Button>
                </div>
              )}
            </div>

            {/* TIPO DE CONTA */}
            <div className="border border-gray-200 rounded-lg p-4">
              <label className="text-sm font-medium text-gray-600 block mb-2">Tipo de Conta</label>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base text-gray-900 font-medium">{userData.role}</p>
                  <p className="text-sm text-gray-500">Status: {userData.confirmed ? "Confirmado" : "Pendente"}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${userData.confirmed ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {userData.confirmed ? "Ativo" : "Pendente"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button className="flex-1 bg-green-500 hover:bg-green-600 text-white" onClick={() => setShowAccountInfo(false)}>Fechar</Button>
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
          <button className="p-2 rounded-md hover:bg-gray-100" onClick={onClose} aria-label="Fechar">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="mt-6">
          <button className="w-full rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors" onClick={() => setShowAccountInfo(true)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-800">Informações da Conta</div>
                  <div className="text-sm text-gray-500">Editar nome, email e senha</div>
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
  const [chatsData, setChatsData] = useState<ChatsData | null>(null);
  const [toast, setToast] = useState<{ message: string; description?: string; variant?: string } | null>(null);
  
  const [showLoadingChats, setShowLoadingChats] = useState(false);
  const [totalChatsForLoading, setTotalChatsForLoading] = useState(0);
  
  // ⭐ NOVO ESTADO - Para controlar verificação inicial de conexão
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);

  const showToast = ({ message, description, variant = "default" }: { message: string; description?: string; variant?: string }) => {
    setToast({ message, description, variant });
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("dashboardData");
    navigate("/");
  }, [navigate]);

  const handleUserUpdate = useCallback((updatedData: DashboardData) => {
    setDashboardData(updatedData);
  }, []);

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      
      if (!token || !userId) {
        handleLogout();
        return;
      }

      try {
        const response = await fetch(`http://localhost:8081/dashboard?userId=${userId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
          
          if (data.user?.role) {
            localStorage.setItem("userRole", data.user.role);
            console.log("🔐 Role atualizada do backend:", data.user.role);
          }
          
          localStorage.setItem("dashboardData", JSON.stringify(data));
          console.log("Dados do dashboard carregados:", data);
        } else {
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

  useEffect(() => {
    const accessDeniedMessage = sessionStorage.getItem("accessDeniedMessage");
    
    if (accessDeniedMessage) {
      const timer = setTimeout(() => {
        showToast({
          message: accessDeniedMessage,
          variant: "destructive",
        });
        
        sessionStorage.removeItem("accessDeniedMessage");
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConnected = (data: ChatsData | null) => {
    setIsConnected(true);
    setShowQR(false);
    
    if (data && data.totalChats > 0) {
      setTotalChatsForLoading(data.totalChats);
      setShowLoadingChats(true);
    } else {
      setChatsData(data);
    }
  };

  const handleLoadingComplete = (data: ChatsData | null) => {
    setShowLoadingChats(false);
    setChatsData(data);
    
    showToast({
      message: "Chats carregados com sucesso!",
      description: `${data?.totalChats || 0} conversas prontas para visualização.`,
    });
  };

  // ⭐ MODIFICADO - Verifica conexão PRIMEIRO e age de acordo
  useEffect(() => {
    const checkExistingConnection = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsCheckingConnection(false);
        return;
      }

      try {
        // VERIFICAR STATUS PRIMEIRO
        const response = await fetch("http://localhost:8081/dashboard/zapi/status", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        
        if (data.connected) {
          // JÁ ESTÁ CONECTADO - CARREGAR CHATS DIRETO
          console.log("✅ WhatsApp já conectado - carregando chats...");
          setIsConnected(true);
          
          // Buscar os chats imediatamente
          const chatsResponse = await fetch("http://localhost:8081/dashboard/zapi/chats_info", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          
          const chatsData = await chatsResponse.json();
          
          if (chatsData.totalChats > 0) {
            setTotalChatsForLoading(chatsData.totalChats);
            setShowLoadingChats(true);
          } else {
            setChatsData(chatsData);
          }
          
          setIsCheckingConnection(false);
        } else {
          // NÃO CONECTADO - MOSTRAR CARD E CLICAR AUTOMATICAMENTE
          console.log("❌ WhatsApp não conectado - abrindo QR Code...");
          setIsConnected(false);
          setIsCheckingConnection(false);
          
          // Abrir QR automaticamente após mostrar o card
          setTimeout(() => {
            setShowQR(true);
          }, 500);
        }
      } catch (error) {
        console.error("Erro ao verificar conexão:", error);
        setIsCheckingConnection(false);
        
        // Em caso de erro, mostrar card e abrir QR
        setTimeout(() => {
          setShowQR(true);
        }, 500);
      }
    };

    if (dashboardData) {
      checkExistingConnection();
    }
  }, [dashboardData]);

  // ⭐ NOVO - Verificação periódica para detectar desconexão durante uso
  useEffect(() => {
    if (!isConnected || !chatsData) return;

    const checkConnectionInterval = setInterval(async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch("http://localhost:8081/dashboard/zapi/status", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        
        if (!data.connected) {
          // WHATSAPP DESCONECTOU!
          console.log("🔌 WhatsApp desconectado - voltando para tela de conexão");
          setIsConnected(false);
          setChatsData(null);
          
          showToast({
            message: "WhatsApp desconectado",
            description: "Reconectando automaticamente...",
            variant: "destructive",
          });
          
          // Abrir QR automaticamente
          setTimeout(() => {
            setShowQR(true);
          }, 500);
        }
      } catch (error) {
        console.error("Erro ao verificar status:", error);
      }
    }, 10000); // Verifica a cada 10 segundos

    return () => clearInterval(checkConnectionInterval);
  }, [isConnected, chatsData, showToast]);

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

  // ⭐ NOVO - Loading durante verificação de conexão
  if (isCheckingConnection) {
    return (
      <div className="min-h-screen bg-[#f4f8f9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
          <p className="text-gray-600">Verificando conexão WhatsApp...</p>
        </div>
      </div>
    );
  }

  if (showLoadingChats) {
    return (
      <LoadingChats 
        onLoadingComplete={handleLoadingComplete}
        totalChats={totalChatsForLoading}
      />
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
            <button className="ml-6 p-2" onClick={() => setShowSidebar(true)} aria-label="Abrir menu">
              <Menu className="w-6 h-6 text-gray-700" />
            </button>

            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-b from-green-400 to-green-600 rounded-lg shadow-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col leading-tight text-center">
                <h1 className="text-[15px] font-semibold text-[#1a1a1a]">WhatsApp Business Monitor</h1>
                <p className="text-[13px] text-[#6b7a89]">Sistema de Gestão de Conversas</p>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-green-700">{dashboardData.user.name}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-start justify-center p-4 pt-8">
          {!isConnected || !chatsData ? (
            <Card className="shadow-md max-w-sm w-full rounded-lg">
              <CardHeader className="text-center pt-8">
                <div className="p-6 bg-[#edf2f3] rounded-full w-fit mx-auto mb-4">
                  <QrCode className="w-10 h-10 text-[#7f8b91]" />
                </div>
                <CardTitle className="text-base font-semibold text-gray-800">Conecte seu WhatsApp Business</CardTitle>
              </CardHeader>
              <CardContent className="text-center pb-8">
                <p className="text-sm text-gray-500 mb-6">Para começar a monitorar suas conversas, conecte sua conta do WhatsApp Business.</p>
                <Button className="w-full bg-green-500 text-white hover:bg-green-600 rounded-md py-2 px-4 font-semibold flex items-center justify-center gap-2" onClick={() => setShowQR(true)}>
                  <QrCode className="w-4 h-4 text-white opacity-90" />
                  Conectar Agora
                </Button>
              </CardContent>
            </Card>
          ) : (
            <ChatColumns chatsData={chatsData} />
          )}
        </main>

        {showQR && <QRConnection onClose={() => setShowQR(false)} onConnected={handleConnected} showToast={showToast} />}
        {showTagManager && <TagManager onClose={() => setShowTagManager(false)} />}
        {showSettings && (
          <SettingsPanel 
            onClose={() => setShowSettings(false)}
            userData={dashboardData.user}
            onUserUpdate={handleUserUpdate}
            showToast={showToast}
          />
        )}
        {toast && (
          <Toast
            message={toast.message}
            description={toast.description}
            variant={toast.variant as "default" | "destructive"}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;