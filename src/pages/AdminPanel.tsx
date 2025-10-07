import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Trash2, Edit, Plus, RefreshCw } from "lucide-react";

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
  totalChats: number;
}

const AdminPanel = () => {
  const [instances, setInstances] = useState<WebInstance[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<WebInstance | null>(null);
  const [toast, setToast] = useState<{ message: string; variant?: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    userId: "",
    status: "ACTIVE",
    clientToken: "",
    seuToken: "",
    suaInstancia: "",
    expiraEm: ""
  });

  const showToast = useCallback((message: string, variant = "default") => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 3000);
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

      const data = await response.json();
      
      if (data.success) {
        setInstances(data.instances);
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

    try {
      const response = await fetch("http://localhost:8081/api/dev/webinstances", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
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
      const response = await fetch(`http://localhost:8081/api/dev/webinstances/${selectedInstance.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        showToast("Instância atualizada com sucesso!");
        setShowEditModal(false);
        fetchInstances();
        resetForm();
      } else {
        showToast(data.message, "destructive");
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

  const updateStatus = async (id: string, newStatus: string) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`http://localhost:8081/api/dev/webinstances/${id}/status`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      
      if (data.success) {
        showToast("Status atualizado!");
        fetchInstances();
      } else {
        showToast(data.message, "destructive");
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      showToast("Erro ao atualizar status", "destructive");
    }
  };

  const resetForm = () => {
    setFormData({
      userId: "",
      status: "ACTIVE",
      clientToken: "",
      seuToken: "",
      suaInstancia: "",
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
      expiraEm: instance.expiraEm || ""
    });
    setShowEditModal(true);
  };

  useEffect(() => {
    fetchInstances();
  }, [fetchInstances]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: "bg-green-100 text-green-700",
      INACTIVE: "bg-gray-100 text-gray-700",
      PENDING: "bg-yellow-100 text-yellow-700",
      EXPIRED: "bg-red-100 text-red-700"
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">
                Gerenciamento de WebInstances
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={fetchInstances}
                  variant="outline"
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Recarregar
                </Button>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Instância
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Instância</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Chats</TableHead>
                    <TableHead>Criado Em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {instances.map(instance => (
                    <TableRow key={instance.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{instance.userName}</div>
                          <div className="text-sm text-gray-500">{instance.userEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {instance.suaInstancia}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(instance.status)}>
                          {instance.status}
                        </Badge>
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

      {/* Modal Criar */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova WebInstance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>User ID</Label>
              <Input
                value={formData.userId}
                onChange={(e) => setFormData({...formData, userId: e.target.value})}
                placeholder="UUID do usuário"
              />
            </div>
            <div>
              <Label>Client Token</Label>
              <Input
                value={formData.clientToken}
                onChange={(e) => setFormData({...formData, clientToken: e.target.value})}
              />
            </div>
            <div>
              <Label>Seu Token</Label>
              <Input
                value={formData.seuToken}
                onChange={(e) => setFormData({...formData, seuToken: e.target.value})}
              />
            </div>
            <div>
              <Label>Sua Instância</Label>
              <Input
                value={formData.suaInstancia}
                onChange={(e) => setFormData({...formData, suaInstancia: e.target.value})}
              />
            </div>
            <Button onClick={createInstance} className="w-full">
              Criar Instância
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 animate-in slide-in-from-bottom">
          <p className={toast.variant === "destructive" ? "text-red-600" : "text-gray-900"}>
            {toast.message}
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;