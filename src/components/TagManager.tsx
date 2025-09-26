import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TagManagerProps {
  onClose: () => void;
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

const TagManager = ({ onClose }: TagManagerProps) => {
  const [tags, setTags] = useState<Tag[]>([
    { id: "1", name: "Botox", color: "#10B981" },
    { id: "2", name: "Preenchimento", color: "#8B5CF6" },
    { id: "3", name: "Limpeza de Pele", color: "#F59E0B" },
    { id: "4", name: "Consulta", color: "#EF4444" },
    { id: "5", name: "Retorno", color: "#06B6D4" },
  ]);

  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState(predefinedColors[0]);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const { toast } = useToast();

  const addTag = () => {
    if (!newTagName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite um nome para a etiqueta.",
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

    const newTag: Tag = {
      id: Date.now().toString(),
      name: newTagName.trim(),
      color: selectedColor
    };

    setTags(prev => [...prev, newTag]);
    setNewTagName("");
    setSelectedColor(predefinedColors[0]);
    
    toast({
      title: "Etiqueta criada!",
      description: `A etiqueta "${newTag.name}" foi criada com sucesso.`,
    });
  };

  const updateTag = () => {
    if (!editingTag || !newTagName.trim()) return;

    setTags(prev => prev.map(tag => 
      tag.id === editingTag.id 
        ? { ...tag, name: newTagName.trim(), color: selectedColor }
        : tag
    ));

    toast({
      title: "Etiqueta atualizada!",
      description: `A etiqueta foi atualizada com sucesso.`,
    });

    setEditingTag(null);
    setNewTagName("");
    setSelectedColor(predefinedColors[0]);
  };

  const deleteTag = (tagId: string) => {
    setTags(prev => prev.filter(tag => tag.id !== tagId));
    toast({
      title: "Etiqueta removida!",
      description: "A etiqueta foi removida com sucesso.",
    });
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
          {/* Formulário para adicionar/editar etiqueta */}
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
                maxLength={20}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex gap-2 flex-wrap">
                {predefinedColors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
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
                disabled={!newTagName.trim()}
              >
                <Plus className="w-4 h-4 mr-2" />
                {editingTag ? "Atualizar" : "Adicionar"}
              </Button>
              
              {editingTag && (
                <Button
                  variant="outline"
                  onClick={cancelEdit}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </div>

          {/* Lista de etiquetas existentes */}
          <div className="space-y-3 max-h-60 overflow-y-auto">
            <h4 className="font-medium text-sm text-muted-foreground">
              Etiquetas Existentes ({tags.length})
            </h4>
            
            {tags.map(tag => (
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
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTag(tag.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TagManager;