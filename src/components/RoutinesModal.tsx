import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { buildUrl } from "@/lib/api";

interface RoutineText {
  id: string;
  sequenceNumber: number;
  textContent: string;
  hoursDelay: number;
}

interface RoutinesModalProps {
  onClose: () => void;
  showToast: (params: { message: string; description?: string; variant?: string }) => void;
}

const RoutinesModal: React.FC<RoutinesModalProps> = ({ onClose, showToast }) => {
  const [routines, setRoutines] = useState<RoutineText[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{ [key: number]: { text: string; hours: number } }>({});

  useEffect(() => {
    loadRoutines();
  }, []);

  const loadRoutines = async () => {
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
        
        const initialData: { [key: number]: { text: string; hours: number } } = {};
        data.routines.forEach((r: RoutineText) => {
          initialData[r.sequenceNumber] = { text: r.textContent, hours: r.hoursDelay };
        });
        setFormData(initialData);
      }
    } catch (error) {
      console.error("Erro ao carregar rotinas:", error);
      showToast({ message: "Erro ao carregar rotinas", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

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
        showToast({ message: result.message });
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
        showToast({ message: result.message });
        loadRoutines();
      } else {
        showToast({ message: result.message, variant: "destructive" });
      }
    } catch (error) {
      console.error("Erro ao deletar rotina:", error);
      showToast({ message: "Erro ao deletar rotina", variant: "destructive" });
    }
  };

  const updateFormData = (seq: number, field: "text" | "hours", value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [seq]: {
        text: field === "text" ? String(value) : prev[seq]?.text || "",
        hours: field === "hours" ? Number(value) : prev[seq]?.hours || 0,
      },
    }));
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
            const currentData = formData[seq] || { text: "", hours: 0 };

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
                      {seq === 1 ? "⚠️ DEV: Minutos para iniciar repescagem" : "⚠️ DEV: Minutos do próximo envio"}
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={48}
                      value={currentData.hours}
                      onChange={e => updateFormData(seq, "hours", e.target.value)}
                      className="w-32"
                      disabled={!isEditing && !!routine}
                      placeholder="0-48 minutos"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Valor em minutos para testes
                    </p>
                  </div>

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
    </div>
  );
};

export default RoutinesModal;