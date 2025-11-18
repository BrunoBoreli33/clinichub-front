import React, { useState, useEffect, useCallback } from "react";
import { X, Plus, Trash2, Save, Image, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { buildUrl } from "@/lib/api";
import GalleryModal from "./GalleryModal";

interface RoutineText {
  id: string;
  sequenceNumber: number;
  textContent: string;
  hoursDelay: number;
  photoIds?: string[];
  videoIds?: string[];
}

interface RoutinesModalProps {
  onClose: () => void;
  showToast: (params: { message: string; description?: string; variant?: string }) => void;
}

const RoutinesModal: React.FC<RoutinesModalProps> = ({ onClose, showToast }) => {
  const [routines, setRoutines] = useState<RoutineText[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{ [key: number]: { text: string; hours: number; photoIds: string[]; videoIds: string[] } }>({});
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryFilterType, setGalleryFilterType] = useState<"photos" | "videos" | null>(null);
  const [editingSequence, setEditingSequence] = useState<number | null>(null);

  const loadRoutines = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(buildUrl("/dashboard/routines"), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.success) {
        setRoutines(data.routines || []);
        
        const initialData: { [key: number]: { text: string; hours: number; photoIds: string[]; videoIds: string[] } } = {};
        data.routines.forEach((r: RoutineText) => {
          initialData[r.sequenceNumber] = { 
            text: r.textContent, 
            hours: r.hoursDelay,
            photoIds: r.photoIds || [],
            videoIds: r.videoIds || []
          };
        });
        setFormData(initialData);
      }
    } catch (error) {
      console.error("Erro ao carregar rotinas:", error);
      showToast({ message: "Erro ao carregar rotinas", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadRoutines();
  }, [loadRoutines]);

  const handleSave = async (sequenceNumber: number) => {
    const token = localStorage.getItem("token");
    const data = formData[sequenceNumber];

    if (!data || !data.text.trim()) {
      showToast({ message: "Texto não pode ser vazio", variant: "destructive" });
      return;
    }

    const existing = routines.find(r => r.sequenceNumber === sequenceNumber);

    try {
      const payload = {
        sequenceNumber,
        textContent: data.text,
        hoursDelay: data.hours,
        photoIds: data.photoIds.length > 0 ? data.photoIds : null,
        videoIds: data.videoIds.length > 0 ? data.videoIds : null,
      };

      const response = await fetch(
        buildUrl(existing ? `/dashboard/routines/${existing.id}` : "/dashboard/routines"),
        {
          method: existing ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      if (result.success) {
        showToast({ message: existing ? "Rotina atualizada!" : "Rotina criada!" });
        loadRoutines();
        setEditingId(null);
      } else {
        showToast({ message: result.message, variant: "destructive" });
      }
    } catch (error) {
      console.error("Erro ao salvar rotina:", error);
      showToast({ message: "Erro ao salvar rotina", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(buildUrl(`/dashboard/routines/${id}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        showToast({ message: "Rotina removida!" });
        loadRoutines();
      } else {
        showToast({ message: result.message, variant: "destructive" });
      }
    } catch (error) {
      console.error("Erro ao deletar rotina:", error);
      showToast({ message: "Erro ao deletar rotina", variant: "destructive" });
    }
  };

  const updateFormData = (seq: number, field: "text" | "hours" | "photoIds" | "videoIds", value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      [seq]: {
        text: field === "text" ? String(value) : prev[seq]?.text || "",
        hours: field === "hours" ? Number(value) : prev[seq]?.hours || 0,
        photoIds: field === "photoIds" ? value as string[] : prev[seq]?.photoIds || [],
        videoIds: field === "videoIds" ? value as string[] : prev[seq]?.videoIds || [],
      },
    }));
  };

  const handleAttachPhotos = (seq: number) => {
    setEditingSequence(seq);
    setGalleryFilterType("photos");
    setShowGalleryModal(true);
  };

  const handleAttachVideos = (seq: number) => {
    setEditingSequence(seq);
    setGalleryFilterType("videos");
    setShowGalleryModal(true);
  };

  const handleMediaSelected = (items: Array<{id: string; imageUrl?: string; videoUrl?: string}>) => {
    if (editingSequence === null) return;

    if (galleryFilterType === "photos") {
      const photoIds = items.map(item => item.id);
      updateFormData(editingSequence, "photoIds", photoIds);
    } else if (galleryFilterType === "videos") {
      const videoIds = items.map(item => item.id);
      updateFormData(editingSequence, "videoIds", videoIds);
    }

    setShowGalleryModal(false);
    setEditingSequence(null);
  };

  const handleRemoveAllPhotos = (seq: number) => {
    updateFormData(seq, "photoIds", []);
  };

  const handleRemoveAllVideos = (seq: number) => {
    updateFormData(seq, "videoIds", []);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg p-6">
          <p>Carregando rotinas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Rotinas Automáticas</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {[1, 2, 3, 4, 5, 6, 7].map(seq => {
            const routine = routines.find(r => r.sequenceNumber === seq);
            const isEditing = editingId === routine?.id || (!routine && editingId === `new-${seq}`);
            const currentData = formData[seq] || { text: "", hours: 0, photoIds: [], videoIds: [] };

            return (
              <div key={seq} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-700">
                    {seq === 1 ? "Primeira Rotina" : `Rotina ${seq}`}
                  </h3>
                  {routine && (
                    <button
                      onClick={() => handleDelete(routine.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Texto</label>
                    <Textarea
                      value={currentData.text}
                      onChange={e => updateFormData(seq, "text", e.target.value)}
                      placeholder="Digite o texto da rotina..."
                      className="w-full"
                      rows={3}
                      disabled={!isEditing && !!routine}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      {seq === 1 ? "Horas para iniciar repescagem" : "Horas do próximo envio"}
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={48}
                      value={currentData.hours}
                      onChange={e => updateFormData(seq, "hours", e.target.value)}
                      className="w-32"
                      disabled={!isEditing && !!routine}
                      placeholder="0-48 horas"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Valor em horas
                    </p>
                  </div>

                  {(isEditing || !routine) && (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAttachPhotos(seq)}
                        className="flex items-center gap-1"
                      >
                        <Image className="w-4 h-4" />
                        Anexar Fotos
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAttachVideos(seq)}
                        className="flex items-center gap-1"
                      >
                        <Video className="w-4 h-4" />
                        Anexar Vídeos
                      </Button>
                    </div>
                  )}

                  {currentData.photoIds && currentData.photoIds.length > 0 && (
                    <div className="bg-blue-50 rounded p-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-blue-700">
                          📷 {currentData.photoIds.length} foto(s) anexada(s)
                        </p>
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveAllPhotos(seq)}
                            className="text-red-500 hover:text-red-700"
                            title="Remover todas as fotos"
                          >
                            ❌
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {currentData.videoIds && currentData.videoIds.length > 0 && (
                    <div className="bg-purple-50 rounded p-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-purple-700">
                          🎥 {currentData.videoIds.length} vídeo(s) anexado(s)
                        </p>
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveAllVideos(seq)}
                            className="text-red-500 hover:text-red-700"
                            title="Remover todos os vídeos"
                          >
                            ❌
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {(!routine || isEditing) && (
                      <Button
                        onClick={() => handleSave(seq)}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Salvar
                      </Button>
                    )}
                    {routine && !isEditing && (
                      <Button
                        onClick={() => setEditingId(routine.id)}
                        variant="outline"
                      >
                        Editar
                      </Button>
                    )}
                    {!routine && !isEditing && (
                      <Button
                        onClick={() => setEditingId(`new-${seq}`)}
                        variant="outline"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showGalleryModal && (
        <GalleryModal
          onClose={() => {
            setShowGalleryModal(false);
            setEditingSequence(null);
          }}
          selectionMode={true}
          filterType={galleryFilterType}
          onMediaSelected={handleMediaSelected}
        />
      )}
    </div>
  );
};

export default RoutinesModal;