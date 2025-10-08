import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TagManagerProps {
  onClose: () => void;
  onTagsUpdated?: () => void;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

const predefinedColors = [
  "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#06B6D4",
  "#EC4899", "#84CC16", "#F97316", "#6366F1", "#14B8A6"
];

const API_URL = "http://localhost:8081";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

const getAllTagsAPI = async (): Promise<Tag[]> => {
  const response = await fetch(`${API_URL}/dashboard/tags`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Erro ao buscar etiquetas");
  }

  return data.tags;
};

const createTagAPI = async (tagData: { name: string; color: string }): Promise<Tag> => {
  const response = await fetch(`${API_URL}/dashboard/tags`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(tagData),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    // Capturar mensagem de validação do backend
    throw new Error(data.message || "Erro ao criar etiqueta");
  }

  return data.tag;
};

const updateTagAPI = async (tagId: string, tagData: { name: string; color: string }): Promise<Tag> => {
  const response = await fetch(`${API_URL}/dashboard/tags/${tagId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(tagData),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    // Capturar mensagem de validação do backend
    throw new Error(data.message || "Erro ao atualizar etiqueta");
  }

  return data.tag;
};

const deleteTagAPI = async (tagId: string): Promise<void> => {
  const response = await fetch(`${API_URL}/dashboard/tags/${tagId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Erro ao deletar etiqueta");
  }
};

const TagManager = ({ onClose, onTagsUpdated }: TagManagerProps) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState(predefinedColors[0]);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const loadTags = useCallback(async () => {
    setIsLoading(true);
    try {
      const loadedTags = await getAllTagsAPI();
      setTags(loadedTags);
    } catch (error) {
      toast({
        title: "Erro ao carregar etiquetas",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  const addTag = async () => {
    if (!newTagName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite um nome para a etiqueta.",
        variant: "destructive",
      });
      return;
    }

    // ✅ VALIDAÇÃO: Nome deve ter entre 2 e 50 caracteres
    if (newTagName.trim().length < 2) {
      toast({
        title: "Nome muito curto",
        description: "O nome da etiqueta deve ter no mínimo 2 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if (newTagName.trim().length > 50) {
      toast({
        title: "Nome muito longo",
        description: "O nome da etiqueta deve ter no máximo 50 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if (tags.some(tag => tag.name.toLowerCase() === newTagName.toLowerCase())) {
      toast({
        title: "Etiqueta já existe",
        description: "Já existe uma etiqueta com esse nome.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const newTag = await createTagAPI({
        name: newTagName.trim(),
        color: selectedColor
      });

      setTags(prev => [...prev, newTag]);
      setNewTagName("");
      setSelectedColor(predefinedColors[0]);
      
      toast({
        title: "Etiqueta criada!",
        description: `A etiqueta "${newTag.name}" foi criada com sucesso.`,
      });

      onTagsUpdated?.();
    } catch (error) {
      toast({
        title: "Erro ao criar etiqueta",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateTag = async () => {
    if (!editingTag || !newTagName.trim()) return;

    // ✅ VALIDAÇÃO: Nome deve ter entre 2 e 50 caracteres
    if (newTagName.trim().length < 2) {
      toast({
        title: "Nome muito curto",
        description: "O nome da etiqueta deve ter no mínimo 2 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if (newTagName.trim().length > 50) {
      toast({
        title: "Nome muito longo",
        description: "O nome da etiqueta deve ter no máximo 50 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const updatedTag = await updateTagAPI(editingTag.id, {
        name: newTagName.trim(),
        color: selectedColor
      });

      setTags(prev => prev.map(tag => 
        tag.id === editingTag.id ? updatedTag : tag
      ));

      toast({
        title: "Etiqueta atualizada!",
        description: "A etiqueta foi atualizada com sucesso.",
      });

      setEditingTag(null);
      setNewTagName("");
      setSelectedColor(predefinedColors[0]);
      onTagsUpdated?.();
    } catch (error) {
      toast({
        title: "Erro ao atualizar etiqueta",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteTag = async (tagId: string) => {
    setIsSaving(true);
    try {
      await deleteTagAPI(tagId);
      setTags(prev => prev.filter(tag => tag.id !== tagId));
      
      toast({
        title: "Etiqueta removida!",
        description: "A etiqueta foi removida com sucesso.",
      });

      onTagsUpdated?.();
    } catch (error) {
      toast({
        title: "Erro ao remover etiqueta",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (tag: Tag) => {
    setEditingTag(tag);
    setNewTagName(tag.name);
    setSelectedColor(tag.color);
  };

  const cancelEdit = () => {
    setEditingTag(null);
    setNewTagName("");
    setSelectedColor(predefinedColors[0]);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-card border-0 shadow-medical">
        <DialogHeader>
          <DialogTitle className="text-xl">Gerenciar Etiquetas</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="tagName">
                {editingTag ? "Editar Etiqueta" : "Nova Etiqueta"}
              </Label>
              <Input
                id="tagName"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Nome da etiqueta"
                maxLength={50}
                disabled={isSaving}
              />
              <p className="text-xs text-muted-foreground">
                {newTagName.length}/50 caracteres (mínimo: 2)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex gap-2 flex-wrap">
                {predefinedColors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    disabled={isSaving}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === color ? "border-foreground scale-110" : "border-border"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={editingTag ? updateTag : addTag}
                className="flex-1 bg-gradient-primary text-white"
                disabled={!newTagName.trim() || newTagName.trim().length < 2 || isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {editingTag ? "Atualizar" : "Adicionar"}
              </Button>
              
              {editingTag && (
                <Button
                  variant="outline"
                  onClick={cancelEdit}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto">
            <h4 className="font-medium text-sm text-muted-foreground">
              Etiquetas Existentes ({tags.length})
            </h4>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : tags.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma etiqueta criada ainda
              </p>
            ) : (
              tags.map(tag => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-white/20"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <Badge
                      variant="outline"
                      style={{ 
                        borderColor: tag.color, 
                        color: tag.color,
                        backgroundColor: `${tag.color}10`
                      }}
                    >
                      {tag.name}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(tag)}
                      disabled={isSaving}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTag(tag.id)}
                      disabled={isSaving}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TagManager;