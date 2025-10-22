import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Edit2, Trash2, Save } from "lucide-react";
import { buildUrl } from "@/lib/api";

interface PreConfiguredText {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface PreConfiguredTextsModalProps {
  onClose: () => void;
}

const PreConfiguredTextsModal: React.FC<PreConfiguredTextsModalProps> = ({ onClose }) => {
  const [texts, setTexts] = useState<PreConfiguredText[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadTexts();
  }, []);

  const loadTexts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(buildUrl("/dashboard/pre-configured-texts"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setTexts(data.texts);
      }
    } catch (error) {
      console.error("Erro ao carregar textos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert("Título e conteúdo são obrigatórios");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const url = editingId
        ? buildUrl(`/dashboard/pre-configured-texts/${editingId}`)
        : buildUrl("/dashboard/pre-configured-texts");

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        await loadTexts();
        setFormData({ title: "", content: "" });
        setEditingId(null);
        setIsCreating(false);
      }
    } catch (error) {
      console.error("Erro ao salvar texto:", error);
      alert("Erro ao salvar texto");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente deletar este texto?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(buildUrl(`/dashboard/pre-configured-texts/${id}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        await loadTexts();
      }
    } catch (error) {
      console.error("Erro ao deletar texto:", error);
      alert("Erro ao deletar texto");
    }
  };

  const startEdit = (text: PreConfiguredText) => {
    setEditingId(text.id);
    setFormData({ title: text.title, content: text.content });
    setIsCreating(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ title: "", content: "" });
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle className="text-xl">Textos Pré-Configurados</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6">
          {/* Formulário de criação/edição */}
          {(isCreating || editingId) && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-green-500">
              <h3 className="font-semibold mb-3">
                {editingId ? "Editar Texto" : "Novo Texto"}
              </h3>
              <div className="space-y-3">
                <Input
                  placeholder="Título do texto"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                <Textarea
                  placeholder="Conteúdo do texto"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                  <Button onClick={cancelEdit} variant="outline">
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Botão para criar novo */}
          {!isCreating && !editingId && (
            <Button
              onClick={() => setIsCreating(true)}
              className="w-full mb-4 bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Texto Pré-Configurado
            </Button>
          )}

          {/* Lista de textos */}
          <div className="space-y-3">
            {loading ? (
              <p className="text-center text-gray-500">Carregando...</p>
            ) : texts.length === 0 ? (
              <p className="text-center text-gray-500">Nenhum texto cadastrado</p>
            ) : (
              texts.map((text) => (
                <div
                  key={text.id}
                  className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{text.title}</h4>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{text.content}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(text)}
                        className="h-8 w-8"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(text.id)}
                        className="h-8 w-8 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PreConfiguredTextsModal;