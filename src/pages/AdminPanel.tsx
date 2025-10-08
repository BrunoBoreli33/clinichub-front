import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit, Plus, RefreshCw, ArrowLeft, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface WebInstance {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: string;
  criadoEm: string;
  expiraEm: string | null;
  clientToken: string;
  seuToken: string;
  suaInstancia: string;
  connectedPhone: string;
  totalChats: number;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const [instances, setInstances] = useState<WebInstance[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<WebInstance | null>(null);
  const [toast, setToast] = useState<{ message: string; variant?: string } | null>(null);
  const [isCheckingPermission, setIsCheckingPermission] = useState(true);
  
  // ⭐ Dados do usuário logado
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentUserName, setCurrentUserName] = useState<string>("");

  // Form state
  const [formData, setFormData] = useState({
    userId: "",
    status: "ACTIVE",
    clientToken: "",
    seuToken: "",
    suaInstancia: "",
    connectedPhone: "",
    expiraEm: ""
  });

  const showToast = useCallback((message: string, variant = "default") => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ⭐ Verificação de permissão no backend
  const checkAdminPermission = useCallback(async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      console.log("❌ Sem token ou userId - Redirecionando para login");
      window.location.replace("/");
      return false;
    }

    try {
      const response = await fetch(`http://localhost:8081/dashboard?userId=${userId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.log("❌ Erro ao verificar permissão - Redirecionando");
        sessionStorage.setItem("accessDeniedMessage", "Erro ao verificar permissões. Faça login novamente.");
        window.location.replace("/dashboard");
        return false;
      }

      const data = await response.json();
      const userRole = data.user?.role;

      console.log("🔐 Role do backend:", userRole);

      if (userRole) {
        localStorage.setItem("userRole", userRole);
      }

      if (userRole !== "ADMIN") {
        console.log("❌ Usuário não é ADMIN - Redirecionando");
        sessionStorage.setItem("accessDeniedMessage", "Acesso negado: Área restrita apenas para ADMINISTRADORES!");
        window.location.replace("/dashboard");
        return false;
      }

      // ⭐ Salvar dados do usuário logado
      setCurrentUserId(data.user.id);
      setCurrentUserName(data.user.name);

      console.log("✅ Usuário é ADMIN - Acesso permitido");
      return true;

    } catch (error) {
      console.error("❌ Erro ao verificar permissão:", error);
      sessionStorage.setItem("accessDeniedMessage", "Erro ao verificar permissões. Tente novamente.");
      window.location.replace("/dashboard");
      return false;
    }
  }, []);

  const fetchInstances = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:8081/api/dev/webinstances", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.status === 403 || response.status === 500) {
        const data = await response.json();
        const errorMessage = data.message || "";
        
        if (errorMessage.toLowerCase().includes("acesso negado") || 
            errorMessage.toLowerCase().includes("administrador")) {
          console.log("❌ Acesso negado detectado no backend - Redirecionando");
          sessionStorage.setItem("accessDeniedMessage", "Acesso negado: Área restrita apenas para ADMINISTRADORES!");
          window.location.replace("/dashboard");
          return;
        }
      }

      const data = await response.json();
      
      if (data.success) {
        // ⭐ Ordenar instâncias - ACTIVE sempre no topo
        const sortedInstances = [...data.instances].sort((a, b) => {
            if (a.status === "ACTIVE") return -1;
            if (b.status === "ACTIVE") return 1;
            return 0;
        });

        setInstances(sortedInstances);
        showToast(`${data.total} instâncias carregadas`);
        } else {
        showToast(data.message, "destructive");
      }
    } catch (error) {
      console.error("Erro ao carregar instâncias:", error);
      showToast("Erro ao carregar instâncias", "destructive");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const createInstance = async () => {
    const token = localStorage.getItem("token");

    // ⭐ Validação do campo obrigatório
    if (!formData.connectedPhone || formData.connectedPhone.trim() === "") {
      showToast("O campo 'Telefone Conectado' é obrigatório!", "destructive");
      return;
    }

    try {
      // ⭐ Preparar dados com valores automáticos
      const body = {
        userId: currentUserId, // ← Usuário logado
        status: formData.status,
        clientToken: formData.clientToken,
        seuToken: formData.seuToken,
        suaInstancia: formData.suaInstancia,
        connectedPhone: formData.connectedPhone,
        // Se expiraEm não foi preenchido, aplicar 30 dias
        expiraEm: formData.expiraEm || null
      };

      console.log("Criando instância:", body);

      const response = await fetch("http://localhost:8081/api/dev/webinstances", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      
      if (data.success) {
        showToast("Instância criada com sucesso!");
        setShowCreateModal(false);
        fetchInstances();
        resetForm();
      } else {
        showToast(data.message, "destructive");
      }
    } catch (error) {
      console.error("Erro ao criar instância:", error);
      showToast("Erro ao criar instância", "destructive");
    }
  };

  const updateInstance = async () => {
    if (!selectedInstance) return;

    const token = localStorage.getItem("token");

    try {
      const body = {
        status: formData.status,
        clientToken: formData.clientToken,
        seuToken: formData.seuToken,
        suaInstancia: formData.suaInstancia,
        connectedPhone: formData.connectedPhone,
        expiraEm: formData.expiraEm || null
      };

      console.log("Enviando atualização:", body);

      const response = await fetch(`http://localhost:8081/api/dev/webinstances/${selectedInstance.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      
      if (data.success) {
        showToast("Instância atualizada com sucesso!");
        setShowEditModal(false);
        fetchInstances();
        resetForm();
        setSelectedInstance(null);
      } else {
        showToast(data.message || "Erro ao atualizar instância", "destructive");
      }
    } catch (error) {
      console.error("Erro ao atualizar instância:", error);
      showToast("Erro ao atualizar instância", "destructive");
    }
  };

  const deleteInstance = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar esta instância?")) return;

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`http://localhost:8081/api/dev/webinstances/${id}?confirm=true`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        showToast("Instância deletada com sucesso!");
        fetchInstances();
      } else {
        showToast(data.message, "destructive");
      }
    } catch (error) {
      console.error("Erro ao deletar instância:", error);
      showToast("Erro ao deletar instância", "destructive");
    }
  };

  const resetForm = () => {
    setFormData({
      userId: currentUserId,
      status: "ACTIVE",
      clientToken: "",
      seuToken: "",
      suaInstancia: "",
      connectedPhone: "",
      expiraEm: ""
    });
  };

  const openEditModal = (instance: WebInstance) => {
    setSelectedInstance(instance);
    setFormData({
      userId: instance.userId,
      status: instance.status,
      clientToken: instance.clientToken,
      seuToken: instance.seuToken,
      suaInstancia: instance.suaInstancia,
      connectedPhone: instance.connectedPhone || "",
      expiraEm: instance.expiraEm || ""
    });
    setShowEditModal(true);
  };

  // ⭐ Abrir modal de criação com userId já preenchido
  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  useEffect(() => {
    const initializeAdminPanel = async () => {
      console.log("🔐 Verificando permissões de admin no backend...");
      
      const isAdmin = await checkAdminPermission();
      
      if (isAdmin) {
        console.log("✅ Permissão concedida - Carregando instâncias");
        setIsCheckingPermission(false);
        fetchInstances();
      }
    };

    initializeAdminPanel();
  }, [checkAdminPermission, fetchInstances]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: "bg-green-100 text-green-700",
      DEACTIVATED: "bg-red-100 text-red-700",
      INACTIVE: "bg-gray-100 text-gray-700",
      PENDING: "bg-yellow-100 text-yellow-700",
      EXPIRED: "bg-red-100 text-red-700"
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  if (isCheckingPermission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 animate-spin text-green-500" />
          <p className="text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* ⭐ BOTÃO VOLTAR PARA DASHBOARD */}
                <Button
                  onClick={() => navigate("/dashboard")}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Dashboard
                </Button>
                <CardTitle className="text-2xl font-bold">
                  Gerenciamento de WebInstances
                </CardTitle>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={fetchInstances}
                  variant="outline"
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Recarregar
                </Button>
                <Button onClick={openCreateModal}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Instância
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : instances.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma instância encontrada
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Instância</TableHead>
                    <TableHead>Chats</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {instances.map((instance) => (
                    <TableRow key={instance.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{instance.userName}</p>
                          <p className="text-sm text-gray-500">{instance.userEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(instance.status)}>
                          {instance.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          {instance.connectedPhone || "N/A"}
                        </code>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {instance.suaInstancia}
                        </code>
                      </TableCell>
                      <TableCell>{instance.totalChats}</TableCell>
                      <TableCell>
                        {new Date(instance.criadoEm).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditModal(instance)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteInstance(instance.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ⭐ MODAL CRIAR - ATUALIZADO */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-visible">
          <DialogHeader>
            <DialogTitle>Nova WebInstance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* ⭐ USER ID - NÃO EDITÁVEL */}
            <div>
              <Label>Usuário (Você)</Label>
              <Input
                value={currentUserName}
                disabled
                className="bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                A instância será criada para você automaticamente
              </p>
            </div>

            {/* ⭐ STATUS - APENAS 2 OPÇÕES */}
            <div>
              <Label>Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({...formData, status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                  <SelectItem value="DEACTIVATED">DEACTIVATED</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ⭐ TELEFONE CONECTADO - OBRIGATÓRIO COM TOOLTIP */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label>Telefone Conectado *</Label>
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-amber-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent 
                      side="right" 
                      align="center"
                      sideOffset={5}
                      className="max-w-xs z-[100]"
                    >
                      <p className="text-sm">
                        Preencha esse campo com o número do telefone que será conectado à instância
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                value={formData.connectedPhone}
                onChange={(e) => setFormData({...formData, connectedPhone: e.target.value})}
                placeholder="Ex: 5544999887766"
                required
              />
            </div>

            {/* ⭐ NOVA ORDEM: ID, TOKEN, CLIENT-TOKEN */}
            <div>
              <Label>ID da instância</Label>
              <Input
                value={formData.suaInstancia}
                onChange={(e) => setFormData({...formData, suaInstancia: e.target.value})}
                placeholder="Identificador da instância"
              />
            </div>

            <div>
              <Label>Token da instância</Label>
              <Input
                value={formData.seuToken}
                onChange={(e) => setFormData({...formData, seuToken: e.target.value})}
                placeholder="Token de acesso da instância"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label>Client-Token</Label>
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-amber-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent 
                      side="right" 
                      align="center"
                      sideOffset={5}
                      className="max-w-xs z-[100]"
                    >
                      <p className="text-sm">
                        Para obter o Client-Token, vá para a opção "Segurança" no painel do Z-API e clique em "Configurar Agora" na opção "Token de segurança da conta"
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                value={formData.clientToken}
                onChange={(e) => setFormData({...formData, clientToken: e.target.value})}
                placeholder="Token de segurança da conta"
              />
            </div>

            {/* ⭐ DATA DE EXPIRAÇÃO - OPCIONAL */}
            <div>
              <Label>Data de Expiração (Opcional)</Label>
              <Input
                type="datetime-local"
                value={formData.expiraEm}
                onChange={(e) => setFormData({...formData, expiraEm: e.target.value})}
              />
              <p className="text-xs text-gray-500 mt-1">
                Se não preenchido, será aplicado 30 dias automaticamente
              </p>
            </div>

            <Button onClick={createInstance} className="w-full">
              Criar Instância
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ⭐ MODAL DE EDIÇÃO - ATUALIZADO */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-visible">
          <DialogHeader>
            <DialogTitle>Editar WebInstance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>User ID (Não editável)</Label>
              <Input
                value={formData.userId}
                disabled
                className="bg-gray-100"
              />
            </div>

            <div>
              <Label>Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({...formData, status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                  <SelectItem value="DEACTIVATED">DEACTIVATED</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label>Telefone Conectado</Label>
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-amber-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent 
                      side="right" 
                      align="center"
                      sideOffset={5}
                      className="max-w-xs z-[100]"
                    >
                      <p className="text-sm">
                        Número do telefone que será conectado à instância
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                value={formData.connectedPhone}
                onChange={(e) => setFormData({...formData, connectedPhone: e.target.value})}
                placeholder="Ex: 5544999887766"
              />
            </div>

            {/* ⭐ NOVA ORDEM: ID, TOKEN, CLIENT-TOKEN */}
            <div>
              <Label>ID da instância</Label>
              <Input
                value={formData.suaInstancia}
                onChange={(e) => setFormData({...formData, suaInstancia: e.target.value})}
              />
            </div>

            <div>
              <Label>Token da instância</Label>
              <Input
                value={formData.seuToken}
                onChange={(e) => setFormData({...formData, seuToken: e.target.value})}
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label>Client-Token</Label>
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-amber-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent 
                      side="right" 
                      align="center"
                      sideOffset={5}
                      className="max-w-xs z-[100]"
                    >
                      <p className="text-sm">
                        Para obter o Client-Token, vá para a opção "Segurança" no painel do Z-API e clique em "Configurar Agora" na opção "Token de segurança da conta"
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                value={formData.clientToken}
                onChange={(e) => setFormData({...formData, clientToken: e.target.value})}
              />
            </div>

            <div>
              <Label>Data de Expiração (Opcional)</Label>
              <Input
                type="datetime-local"
                value={formData.expiraEm}
                onChange={(e) => setFormData({...formData, expiraEm: e.target.value})}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={updateInstance} 
                className="flex-1"
              >
                Salvar Alterações
              </Button>
              <Button 
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                  setSelectedInstance(null);
                }} 
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 animate-in slide-in-from-bottom z-50">
          <p className={toast.variant === "destructive" ? "text-red-600" : "text-gray-900"}>
            {toast.message}
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;