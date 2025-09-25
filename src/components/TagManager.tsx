import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Edit } from "lucide-react";
import type { ChatTag } from "@/components/ChatColumns";

interface TagManagerProps {
  tags: ChatTag[];
  onTagsChange: (tags: ChatTag[]) => void;
  onClose: () => void;
}

const predefinedColors = [
  "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", 
  "#EF4444", "#06B6D4", "#84CC16", "#F97316",
  "#EC4899", "#6366F1", "#14B8A6", "#F472B6"
];

export const TagManager = ({ tags, onTagsChange, onClose }: TagManagerProps) => {
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(predefinedColors[0]);
  const [editingTag, setEditingTag] = useState<ChatTag | null>(null);

  const handleAddTag = () => {
    if (!newTagName.trim()) return;

    const newTag: ChatTag = {
      id: newTagName.toLowerCase().replace(/\s+/g, '-'),
      name: newTagName,
      color: newTagColor
    };

    onTagsChange([...tags, newTag]);
    setNewTagName("");
    setNewTagColor(predefinedColors[0]);
  };

  const handleEditTag = (tag: ChatTag) => {
    setEditingTag(tag);
    setNewTagName(tag.name);
    setNewTagColor(tag.color);
  };

  const handleUpdateTag = () => {
    if (!editingTag || !newTagName.trim()) return;

    const updatedTags = tags.map(tag => 
      tag.id === editingTag.id 
        ? { ...tag, name: newTagName, color: newTagColor }
        : tag
    );

    onTagsChange(updatedTags);
    setEditingTag(null);
    setNewTagName("");
    setNewTagColor(predefinedColors[0]);
  };

  const handleDeleteTag = (tagId: string) => {
    const updatedTags = tags.filter(tag => tag.id !== tagId);
    onTagsChange(updatedTags);
  };

  const cancelEdit = () => {
    setEditingTag(null);
    setNewTagName("");
    setNewTagColor(predefinedColors[0]);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gerenciar Etiquetas</DialogTitle>
          <DialogDescription>
            Crie e gerencie etiquetas personalizadas para organizar suas conversas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add/Edit Tag Form */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="tagName">Nome da Etiqueta</Label>
                  <Input
                    id="tagName"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Ex: Botox, Preenchimento..."
                  />
                </div>

                <div>
                  <Label>Cor da Etiqueta</Label>
                  <div className="grid grid-cols-6 gap-2 mt-2">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full border-2 ${
                          newTagColor === color ? "border-foreground" : "border-border"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewTagColor(color)}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Preview:</span>
                  <Badge
                    variant="outline"
                    style={{ 
                      borderColor: newTagColor,
                      color: newTagColor,
                      backgroundColor: `${newTagColor}10`
                    }}
                  >
                    {newTagName || "Nome da etiqueta"}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  {editingTag ? (
                    <>
                      <Button onClick={handleUpdateTag} disabled={!newTagName.trim()}>
                        Atualizar Etiqueta
                      </Button>
                      <Button variant="outline" onClick={cancelEdit}>
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <Button onClick={handleAddTag} disabled={!newTagName.trim()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Etiqueta
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Existing Tags */}
          <div>
            <h3 className="text-lg font-medium mb-3">Etiquetas Existentes</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
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
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTag(tag)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTag(tag.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {tags.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhuma etiqueta criada ainda</p>
                  <p className="text-sm">Crie sua primeira etiqueta acima</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
