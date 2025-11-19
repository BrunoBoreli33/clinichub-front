import React, { useState, useEffect, useCallback, useRef } from "react";
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
  ChevronLeft,
  User,
  MessageCircle,
  File,
  Repeat,
  Search,
  Image,
  Send,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import QRConnection from "@/components/QRConnection";
import ChatColumns from "@/components/ChatColumns";
import TagManager from "@/components/TagManager";
import RoutinesModal from "@/components/RoutinesModal";
import PreConfiguredTextsModal from "@/components/PreConfiguredTextsModal";
import GalleryModal from "@/components/GalleryModal";
import CampaignModal from "@/components/CampaignModal";
import * as tagApi from "@/api/tags";
import { logError } from "@/lib/logger";
import Toast from "@/components/Toast";
import LoadingChats from "./LoadingChats";
import type { ChatsData } from "@/types/chat";
import { buildUrl } from "@/lib/api";
import { useNotifications, NewMessageNotification, ChatUpdateNotification, TagUpdateNotification, TagDeleteNotification, TaskCompletedNotification } from "@/hooks/useNotifications";
import clinicHubIco from "@/assets/clinichub.ico";

interface DashboardData {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    confirmed: boolean;
  };
}

const Sidebar: React.FC<{
  onClose: () => void;
  onOpenTags: () => void;
  onOpenRoutines: () => void;
  onOpenPreConfiguredTexts: () => void;
  onOpenGallery: () => void;
  onOpenCampaign: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  isOpen: boolean;
  userName: string;
}> = ({ onClose, onOpenTags, onOpenRoutines, onOpenPreConfiguredTexts, onOpenGallery, onOpenCampaign, onOpenSettings, onLogout, isOpen, userName }) => {
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
  <div className="flex justify-center">
    <img
      src={clinicHubIco}
      alt="Logo ClinicHub"
      className="w-14 h-14 md:w-14 md:h-14 rounded-full shadow-md"
    />
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
            onClick={onOpenRoutines}
          >
            <Repeat className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
            <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">
              Rotinas Automáticas
            </span>
          </button>

          <button
            className="w-full text-left flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors group"
            onClick={onOpenPreConfiguredTexts}
          >
            <File className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
            <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">
              Textos Pré-Configurados
            </span>
          </button>

          <button
            className="w-full text-left flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors group"
            onClick={onOpenGallery}
          >
            <Image className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
            <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">
              Galeria
            </span>
          </button>

          <button
            className="w-full text-left flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors group"
            onClick={onOpenCampaign}
          >
            <Send className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
            <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">
              Disparo de Campanha
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

  const handleUpdateName = async () => {
    const token = localStorage.getItem("token");
    
    if (!newName || newName.trim() === "") {
      showToast({ message: "Nome não pode ser vazio", variant: "destructive" });
      return;
    }

    try {
      const response = await fetch(buildUrl('/api/profile/update-name'), {
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

  const handleRequestEmailChange = async () => {
    const token = localStorage.getItem("token");
    
    if (!newEmail || newEmail.trim() === "") {
      showToast({ message: "Email não pode ser vazio", variant: "destructive" });
      return;
    }

    try {
      const response = await fetch(buildUrl('/api/profile/request-email-change'), {
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

  const handleConfirmEmailChange = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(buildUrl('/api/profile/confirm-email-change'), {
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
      const response = await fetch(buildUrl('/api/profile/request-password-change'), {
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

  const handleConfirmPasswordChange = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(buildUrl('/api/profile/confirm-password-change'), {
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
                    <Button type="button" size="sm" onClick={handleUpdateName} className="bg-green-500 hover:bg-green-600">Salvar</Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => { setEditingName(false); setNewName(userData.name); }}>Cancelar</Button>
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

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRoutines, setShowRoutines] = useState(false);
  const [showPreConfiguredTexts, setShowPreConfiguredTexts] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [chatsData, setChatsData] = useState<ChatsData | null>(null);
  const [toast, setToast] = useState<{ message: string; description?: string; variant?: string } | null>(null);
  const [tagsVersion, setTagsVersion] = useState(0);
  
  const [showLoadingChats, setShowLoadingChats] = useState(false);
  const [totalChatsForLoading, setTotalChatsForLoading] = useState(0);
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);
  const [availableTags, setAvailableTags] = useState<Array<{ id: string; name: string; color: string }>>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showOnlyTrustworthy, setShowOnlyTrustworthy] = useState<boolean>(false);

  const shouldHideUploadChat = () => {
    return localStorage.getItem('hideUploadChat') !== 'false'; // true por padrão
  };

  const shouldShowHiddenChats = () => {
    return localStorage.getItem('showHiddenChats') === 'true'; // false por padrão
  };

  const filteredChatsData = React.useMemo(() => {
    if (!chatsData) return chatsData;
    
    let filtered = chatsData.chats;
    
    const hideUpload = shouldHideUploadChat();
    const showHidden = shouldShowHiddenChats();
    
    // ✅ CORRIGIDO: Ocultar chat de upload se configurado
    if (hideUpload) {
      filtered = filtered.filter((chat: ChatsData['chats'][number]) => {
        // Oculta chats onde isUploadChat === true
        return !chat.isUploadChat;
      });
    }
    
    // ✅ NOVO: Filtro de chats ocultos
    if (!showHidden) {
      filtered = filtered.filter((chat: ChatsData['chats'][number]) => {
        // Oculta chats onde isHidden === true quando showHidden está false
        return !chat.isHidden;
      });
    }
    
    // ✅ NOVO: Filtro de chats confiáveis
    if (showOnlyTrustworthy) {
      filtered = filtered.filter((chat: ChatsData['chats'][number]) => {
        // Mostra apenas chats onde isTrustworthy === true
        return chat.isTrustworthy;
      });
    }
    
    // Filtro por etiquetas
    if (selectedTagIds.size > 0) {
      filtered = filtered.filter((chat: ChatsData['chats'][number]) => chat.tags.some((t: { id: string; name: string; color: string }) => selectedTagIds.has(t.id)));
    }
    
    // Filtro por pesquisa (nome ou telefone)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(chat => {
        const name = (chat.name || '').toLowerCase();
        const phone = (chat.phone || '').toLowerCase();
        return name.includes(term) || phone.includes(term);
      });
    }
    
    return { ...chatsData, chats: filtered };
  }, [chatsData, selectedTagIds, searchTerm, showOnlyTrustworthy]);

  
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  
  const hasCheckedInitialConnection = useRef(false);
  
  const fetchChatsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const minFetchInterval = 1000;

  const showToast = useCallback(({ message, description, variant = "default" }: { message: string; description?: string; variant?: string }) => {
    setToast({ message, description, variant });
  }, []);

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

  const fetchChats = useCallback(async (silent = false) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(buildUrl('/dashboard/zapi/chats'), {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setChatsData(data);
        
        if (!silent) {
          showToast({
            message: `${data.totalChats} conversas carregadas`,
            description: data.unreadCount > 0 ? `${data.unreadCount} não lidas` : "Todas lidas",
          });
        }
      } else {
        if (!silent) {
          showToast({
            message: "Erro ao carregar conversas",
            description: data.message,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Erro ao buscar chats:", error);
      if (!silent) {
        showToast({
          message: "Erro de conexão",
          description: "Não foi possível carregar as conversas",
          variant: "destructive",
        });
      }
    }
  }, [showToast]);

  const debouncedFetchChats = useCallback((silent: boolean = false, delay: number = 500) => {
    if (fetchChatsTimeoutRef.current) {
      clearTimeout(fetchChatsTimeoutRef.current);
    }

    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTimeRef.current;
    
    if (timeSinceLastFetch < minFetchInterval) {
      console.log('⏳ Fetch bloqueado - aguardando intervalo mínimo');
      return;
    }

    fetchChatsTimeoutRef.current = setTimeout(() => {
      lastFetchTimeRef.current = Date.now();
      fetchChats(silent);
    }, delay);
  }, [fetchChats, minFetchInterval]);

  const reloadChats = useCallback(() => {
    console.log("🔄 Recarregando chats após fechar ChatWindow");
    debouncedFetchChats(true, 300);
  }, [debouncedFetchChats]);

  const handleColumnChange = useCallback(() => {
    console.log("🔄 Recarregando chats após mudança de coluna");
    fetchChats(true);
  }, [fetchChats]);

  // ✅ MODIFICADO: Atualizar imediatamente ao receber mensagem (sem debounce)
  const handleNewMessage = useCallback((data: NewMessageNotification) => {
    console.log('📨 Nova mensagem recebida via SSE:', {
      chatId: data.chatId,
      chatName: data.chatName,
      message: data.message.substring(0, 30) + '...',
      unreadCount: data.unreadCount
    });
    
    // ✅ MODIFICADO: Atualizar imediatamente sem debounce
    fetchChats(true);

    window.dispatchEvent(new CustomEvent('sse-new-message', {
      detail: { type: 'new-message', data }
    }));
  }, [fetchChats]);

  // ✅ MODIFICADO: Atualizar imediatamente ao enviar mensagem (sem debounce)
  const handleChatUpdate = useCallback((data: ChatUpdateNotification) => {
    console.log('📤 Atualização de chat via SSE (mensagem enviada):', {
      chatId: data.chatId,
      chatName: data.chatName,
      lastMessageContent: data.lastMessageContent?.substring(0, 30) + '...'
    });
    
    // ✅ MODIFICADO: Atualizar imediatamente sem debounce
    fetchChats(true);

    window.dispatchEvent(new CustomEvent('sse-chat-update', {
      detail: { type: 'chat-update', data }
    }));
  }, [fetchChats]);

  const handleTagUpdate = useCallback((data: TagUpdateNotification) => {
    console.log('🏷️ Atualização de tag via SSE:', data);
    
    if (isConnected && chatsData) {
      debouncedFetchChats(true, 500);
    }
    
    setTagsVersion(prev => prev + 1);
  }, [isConnected, chatsData, debouncedFetchChats]);

  const handleTagDelete = useCallback((data: TagDeleteNotification) => {
    console.log('🗑️ Exclusão de tag via SSE:', data);
    
    if (isConnected && chatsData) {
      debouncedFetchChats(true, 500);
    }
    
    setTagsVersion(prev => prev + 1);
  }, [isConnected, chatsData, debouncedFetchChats]);

  const handleTaskCompleted = useCallback((data: TaskCompletedNotification) => {
    console.log('✅ Tarefa concluída via SSE:', data);
    
    if (isConnected && chatsData) {
      fetchChats(true);
    }
  }, [isConnected, chatsData, fetchChats]);

  const { setOpenChatId } = useNotifications({
    onNewMessage: handleNewMessage,
    onChatUpdate: handleChatUpdate,
    onTagUpdate: handleTagUpdate,
    onTagDelete: handleTagDelete,
    onTaskCompleted: handleTaskCompleted,
    onConnected: () => {
      console.log('✅ Sistema de notificações ativo');
      setNotificationEnabled(true);
    },
    onError: (error) => {
      console.error('❌ Erro no sistema de notificações:', error);
      setNotificationEnabled(false);
    }
  });

  const fixedHScrollRef = useRef<HTMLDivElement | null>(null);
  const columnsContainerRef = useRef<HTMLDivElement | null>(null);

  // Navegação entre colunas: pula uma coluna por vez (largura da coluna + gap)
  const scrollColumnsByOne = (direction: "next" | "prev") => {
    const wrapper = columnsContainerRef.current;
    if (!wrapper) return;

    const cols = wrapper.querySelector('.horizontal-scroll-container') as HTMLElement | null;
    if (!cols) return;

    const inner = cols.firstElementChild as HTMLElement | null; // flex container that holds columns
    if (!inner) return;

    const firstCol = inner.firstElementChild as HTMLElement | null;
    if (!firstCol) return;

    // gap between columns (CSS gap / column-gap)
    const cs = window.getComputedStyle(inner as Element);
    const gapStr = cs.columnGap || (cs as any).gap || '0px';
    const gap = parseFloat(gapStr) || 0;

    const amount = Math.round(firstCol.getBoundingClientRect().width + gap);

    cols.scrollBy({ left: direction === 'next' ? amount : -amount, behavior: 'smooth' });
  };

  // Sincroniza um scrollbar fixo no rodapé com o container horizontal das colunas
  useEffect(() => {
    const fixedEl = fixedHScrollRef.current;
    const cols = document.querySelector('.horizontal-scroll-container') as HTMLElement | null;
    if (!fixedEl || !cols) return;

    // scrollable wrapper inside the fixed footer (the element that actually scrolls)
    const fixedWrapper = fixedEl.querySelector('.fixed-scroll-wrapper') as HTMLElement | null;
    const fixedInner = fixedEl.querySelector('.fixed-scroll-inner') as HTMLElement | null;
    if (!fixedWrapper || !fixedInner) return;

    // hide native scrollbar of the columns container while our fixed scrollbar is present
    cols.classList.add('hide-native-scrollbar');

    const updateInnerWidth = () => {
      fixedInner.style.width = `${cols.scrollWidth}px`;
    };

    let syncing = false;

    const onColsScroll = () => {
      if (syncing) return;
      syncing = true;
      fixedWrapper.scrollLeft = cols.scrollLeft;
      requestAnimationFrame(() => (syncing = false));
    };

    const onFixedScroll = () => {
      if (syncing) return;
      syncing = true;
      cols.scrollLeft = fixedWrapper.scrollLeft;
      requestAnimationFrame(() => (syncing = false));
    };

    cols.addEventListener('scroll', onColsScroll, { passive: true });
    fixedWrapper.addEventListener('scroll', onFixedScroll, { passive: true });
    window.addEventListener('resize', updateInnerWidth);

    const ro = new ResizeObserver(updateInnerWidth);
    ro.observe(cols);

    // set initial width and position
    updateInnerWidth();
    fixedWrapper.scrollLeft = cols.scrollLeft;

    return () => {
      cols.removeEventListener('scroll', onColsScroll);
      fixedWrapper.removeEventListener('scroll', onFixedScroll);
      window.removeEventListener('resize', updateInnerWidth);
      ro.disconnect();
      cols.classList.remove('hide-native-scrollbar');
    };
  }, [tagsVersion, chatsData]);

  // Listener para quando uma tag é adicionada a um chat (disparado pelo ChatColumns)
  useEffect(() => {
    const handleTagAddedToChat = () => {
      console.log('🏷️ Tag adicionada a um chat - recarregando chats');
      fetchChats(true);
    };

    window.addEventListener('tag-added-to-chat', handleTagAddedToChat);

    return () => {
      window.removeEventListener('tag-added-to-chat', handleTagAddedToChat);
    };
  }, [fetchChats]);

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      
      if (!token || !userId) {
        handleLogout();
        return;
      }

      try {
        const response = await fetch(buildUrl(`/dashboard?userId=${userId}`), {
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
          }
          
          localStorage.setItem("dashboardData", JSON.stringify(data));
        } else {
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
  }, [showToast]);

  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await tagApi.getAllTags();
        setAvailableTags(tags);
      } catch (error) {
        logError("Erro ao carregar etiquetas no dashboard", { error });
      }
    };

    loadTags();
  }, [tagsVersion]);

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

  const handleLoadingComplete = useCallback((data: ChatsData | null) => {
    setShowLoadingChats(false);
    setChatsData(data);
    
    showToast({
      message: "Chats carregados com sucesso!",
      description: `${data?.totalChats || 0} conversas prontas para visualização.`,
    });
  }, [showToast]);

  const toggleTagSelection = (tagId: string) => {
    setSelectedTagIds(prev => {
      const next = new Set(prev);
      if (next.has(tagId)) next.delete(tagId);
      else next.add(tagId);
      return next;
    });
  };

  const clearTagSelection = () => setSelectedTagIds(new Set());

  const exportFilteredToCSV = async () => {
    const data = filteredChatsData?.chats || [];
    if (!data.length) {
      showToast({ message: 'Nenhuma conversa para exportar', variant: 'destructive' });
      return;
    }

    try {
      // Importar biblioteca XLSX dinamicamente
      const XLSX = await import('xlsx');
      
      // Preparar dados
      const rows = data.map(chat => ({
        'Nome': chat.name || '',
        'Telefone': chat.phone || '',
        'Etiquetas': (chat.tags || []).map(t => t.name).join('; ')
      }));

      // Criar worksheet
      const ws = XLSX.utils.json_to_sheet(rows);

      // Definir larguras das colunas
      ws['!cols'] = [
        { wch: 35 },  // Nome
        { wch: 20 },  // Telefone
        { wch: 30 }   // Etiquetas
      ];

      // Aplicar formatação ao cabeçalho (linha 1)
      const headerCells = ['A1', 'B1', 'C1'];
      headerCells.forEach(cell => {
        if (ws[cell]) {
          ws[cell].s = {
            font: { bold: true },
            alignment: { horizontal: 'center', vertical: 'center' }
          };
        }
      });

      // Aplicar formatação às células de dados
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      for (let R = range.s.r + 1; R <= range.e.r; ++R) {
        // Coluna A (Nome) - Alinhada à esquerda
        const cellA = XLSX.utils.encode_cell({ r: R, c: 0 });
        if (ws[cellA]) {
          ws[cellA].s = {
            alignment: { horizontal: 'left', vertical: 'center' }
          };
        }

        // Coluna B (Telefone) - Centralizada e formato texto
        const cellB = XLSX.utils.encode_cell({ r: R, c: 1 });
        if (ws[cellB]) {
          ws[cellB].t = 's'; // Força tipo string
          ws[cellB].s = {
            alignment: { horizontal: 'center', vertical: 'center' }
          };
        }

        // Coluna C (Etiquetas) - Centralizada
        const cellC = XLSX.utils.encode_cell({ r: R, c: 2 });
        if (ws[cellC]) {
          ws[cellC].s = {
            alignment: { horizontal: 'center', vertical: 'center' }
          };
        }
      }

      // Criar workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Conversas');

      // Exportar arquivo
      XLSX.writeFile(wb, `chats_export_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.xlsx`);

      showToast({ 
        message: 'Exportação concluída!', 
        description: `${data.length} conversas exportadas com sucesso.` 
      });
    } catch (error) {
      console.error('Erro ao exportar:', error);
      showToast({ 
        message: 'Erro ao exportar', 
        description: 'Não foi possível gerar o arquivo.',
        variant: 'destructive' 
      });
    }
  };

  useEffect(() => {
    const checkExistingConnection = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsCheckingConnection(false);
        return;
      }

      try {
        const response = await fetch(buildUrl('/dashboard/zapi/status'), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        
        if (data.connected) {
          setIsConnected(true);
          
          const chatsResponse = await fetch(buildUrl('/dashboard/zapi/chats_info'), {
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
          setIsConnected(false);
          setIsCheckingConnection(false);
          
          setTimeout(() => {
            setShowQR(true);
          }, 500);
        }
      } catch (error) {
        console.error("Erro ao verificar conexão:", error);
        setIsCheckingConnection(false);
        
        setTimeout(() => {
          setShowQR(true);
        }, 500);
      }
    };

    if (dashboardData && !hasCheckedInitialConnection.current) {
      hasCheckedInitialConnection.current = true;
      checkExistingConnection();
    }
  }, [dashboardData]);

  useEffect(() => {
    if (!isConnected || !chatsData) return;

    const checkConnectionInterval = setInterval(async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(buildUrl('/dashboard/zapi/status'), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        
        if (!data.connected) {
          setIsConnected(false);
          setChatsData(null);
          
          showToast({
            message: "WhatsApp desconectado",
            description: "Reconectando automaticamente...",
            variant: "destructive",
          });
          
          setTimeout(() => {
            setShowQR(true);
          }, 500);
        }
      } catch (error) {
        console.error("Erro ao verificar status:", error);
      }
    }, 10000);

    return () => clearInterval(checkConnectionInterval);
  }, [isConnected, chatsData, showToast]);

  useEffect(() => {
    return () => {
      if (fetchChatsTimeoutRef.current) {
        clearTimeout(fetchChatsTimeoutRef.current);
      }
    };
  }, []);

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
  <div className="h-screen bg-[#f4f8f9] flex relative overflow-hidden">
      <Sidebar
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        onOpenTags={() => {
          setShowTagManager(true);
          setShowSidebar(false);
        }}
        onOpenRoutines={() => {
          setShowRoutines(true);
          setShowSidebar(false);
        }}
        onOpenPreConfiguredTexts={() => {
          setShowPreConfiguredTexts(true);
          setShowSidebar(false);
        }}
        onOpenGallery={() => {
          setShowSidebar(false);
          setShowGalleryModal(true);
        }}
        onOpenCampaign={() => {
          setShowSidebar(false);
          setShowCampaignModal(true);
        }}
        onOpenSettings={() => {
          setShowSettings(true);
          setShowSidebar(false);
        }}
        onLogout={handleLogout}
        userName={dashboardData.user.name}
      />

  <div className="flex-1 flex flex-col overflow-x-hidden">
        <header className="bg-white border-b border-gray-200 relative">
          <div className="px-4 py-3 flex items-center">
            <button className="ml-6 p-2" onClick={() => setShowSidebar(true)} aria-label="Abrir menu">
              <Menu className="w-6 h-6 text-gray-700" />
            </button>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3">
              <div className="flex justify-center">
              <img
              src={clinicHubIco}
              alt="Logo ClinicHub"
              className="w-12 h-12 md:w-12 md:h-12 rounded-full shadow-md animate-pulse"
              />
            </div>
              <div className="flex flex-col leading-tight text-center">
                <h1 className="text-[15px] font-semibold text-[#1a1a1a]">ClinicHub CRM</h1>
                <p className="text-[13px] text-[#6b7a89]">Hybrid Intelligence for Customer Relations</p>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-green-700">{dashboardData.user.name}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col overflow-hidden">
          {!isConnected || !chatsData ? (
            <div className="flex-1 flex items-center justify-center p-4">
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
            </div>
          ) : (
            <div className="flex-1 p-4 flex flex-col overflow-hidden">
              <div className="mb-4 flex items-center justify-between gap-3 flex-wrap flex-shrink-0">
                {/* ...existing static filter/search/export UI... */}
                {/* This block stays fixed, never scrolls horizontally */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Pesquisar por nome ou telefone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-3 py-1 w-64 text-sm border rounded-md"
                    />
                  </div>
                  <button
                    onClick={() => setShowOnlyTrustworthy(!showOnlyTrustworthy)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      showOnlyTrustworthy 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    title="Filtrar apenas chats confiáveis"
                  >
                    Chats Confiáveis
                  </button>
                  <div className="text-sm text-gray-700 font-medium">Filtrar por etiquetas:</div>
                  <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={clearTagSelection}
                    className={`px-3 py-1 rounded-full text-sm ${selectedTagIds.size === 0 ? 'bg-green-600 text-white' : 'bg-white border'}`}
                  >
                    Todas
                  </button>
                  {availableTags.map(tag => {
                    const selected = selectedTagIds.has(tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => toggleTagSelection(tag.id)}
                        className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 border ${selected ? '' : 'bg-white'}`}
                        style={selected ? { backgroundColor: tag.color, color: '#fff', borderColor: tag.color } : { borderColor: tag.color }}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                        {tag.name}
                      </button>
                    );
                  })}
                  </div>
                </div>
                <div className="ml-auto">
                  <button
                    onClick={exportFilteredToCSV}
                    className="flex items-center gap-2 px-3 py-1 rounded-md bg-white border hover:bg-gray-50"
                    title="Exportar conversas filtradas para CSV"
                  >
                    <File className="w-4 h-4 " />
                    <span className="text-sm">Exportar</span>
                  </button>
                </div>
              </div>

              {/* Content area scrolls vertically internally; only the columns area scrolls horizontally */}
              <div className="flex-1 overflow-y-auto">
                <div className="min-w-0">
                  <div ref={columnsContainerRef} className="overflow-x-auto relative" style={{ minWidth: 0 }}>
                    {/* Navigation buttons overlay */}
                    <button
                      type="button"
                      aria-label="Coluna anterior"
                      onClick={() => scrollColumnsByOne('prev')}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-40 bg-white/90 hover:bg-white shadow-md rounded-full p-2 border border-gray-200"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-700" />
                    </button>

                    <button
                      type="button"
                      aria-label="Próxima coluna"
                      onClick={() => scrollColumnsByOne('next')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-40 bg-white/90 hover:bg-white shadow-md rounded-full p-2 border border-gray-200"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-700" />
                    </button>

                    <ChatColumns
                      chatsData={filteredChatsData}
                      showToast={showToast}
                      tagsVersion={tagsVersion}
                      onChatClosed={reloadChats}
                      onColumnChange={handleColumnChange}
                      setOpenChatId={setOpenChatId}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {showQR && <QRConnection onClose={() => setShowQR(false)} onConnected={handleConnected} showToast={showToast} />}
        {showTagManager && (
          <TagManager 
            onClose={() => setShowTagManager(false)} 
            onTagsUpdated={() => {
              setTagsVersion(prev => prev + 1);
              showToast({
                message: "Etiquetas atualizadas!",
                description: "As alterações foram salvas com sucesso.",
              });
            }} 
          />
        )}
        {showRoutines && (
          <RoutinesModal 
            onClose={() => setShowRoutines(false)}
            showToast={showToast}
          />
        )}
        {showPreConfiguredTexts && (
          <PreConfiguredTextsModal onClose={() => setShowPreConfiguredTexts(false)} />
        )}
        {showGalleryModal && (
          <GalleryModal onClose={() => setShowGalleryModal(false)} />
        )}
        {showCampaignModal && (
          <CampaignModal
            isOpen={showCampaignModal}
            onClose={() => setShowCampaignModal(false)}
            tags={availableTags}
            chats={chatsData?.chats || []}
          />
        )}
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
        {/* Fixed horizontal scrollbar synced with ChatColumns */}
        <div ref={fixedHScrollRef} className="fixed left-0 right-0 bottom-0 h-6 z-50 bg-white/0 pointer-events-auto">
          <div className="h-6 overflow-x-auto overflow-y-hidden fixed-scroll-wrapper">
            <div className="fixed-scroll-inner h-1" style={{ height: 1 }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;