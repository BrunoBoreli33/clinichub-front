import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, Save, X, Trash2, Edit2, Plus, CheckCircle2 } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as taskApi from "@/api/task";
import { Task } from "@/api/task";
import { Chat } from "@/types/chat";

interface TaskManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  chat: Chat | null;
  onTasksUpdated?: () => void;
  showToast?: (toast: { message: string; description?: string; variant?: string }) => void;
}

const TaskManagerModal = ({ isOpen, onClose, chat, onTasksUpdated, showToast }: TaskManagerModalProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form states
  const [message, setMessage] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Carregar tarefas quando modal abre
  const loadTasks = useCallback(async () => {
    if (!chat) return;
    
    setLoading(true);
    try {
      const allTasks = await taskApi.getAllTasksByChat(chat.id);
      setTasks(allTasks);
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error);
      showToast?.({
        message: "Erro ao carregar tarefas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [chat, showToast]);

  useEffect(() => {
    if (isOpen && chat) {
      loadTasks();
    }
  }, [isOpen, chat, loadTasks]);

  const resetForm = () => {
    setMessage("");
    const defaultDate = new Date();
    defaultDate.setHours(defaultDate.getHours() + 1);
    defaultDate.setMinutes(0);
    defaultDate.setSeconds(0);
    defaultDate.setMilliseconds(0);
    setSelectedDate(defaultDate);
    setEditingTaskId(null);
    setIsCreating(false);
  };

  const handleStartCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const handleStartEdit = (task: Task) => {
    setMessage(task.message);
    setSelectedDate(new Date(task.scheduledDate));
    setEditingTaskId(task.id);
    setIsCreating(false);
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const formatDateToBackend = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  const handleSubmit = async () => {
    if (!chat || !message.trim() || !selectedDate) {
      showToast?.({
        message: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    if (selectedDate <= new Date()) {
      showToast?.({
        message: "A data deve ser futura",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const scheduledDate = formatDateToBackend(selectedDate);
      const request = {
        chatId: chat.id,
        message: message.trim(),
        scheduledDate,
      };

      if (editingTaskId) {
        // Atualizar tarefa existente
        await taskApi.updateTask(editingTaskId, request);
        showToast?.({
          message: "Tarefa atualizada com sucesso",
          description: `Será enviada em ${selectedDate.toLocaleString("pt-BR")}`,
        });
      } else {
        // Criar nova tarefa
        await taskApi.createTask(request);
        showToast?.({
          message: "Tarefa criada com sucesso",
          description: `Será enviada em ${selectedDate.toLocaleString("pt-BR")}`,
        });
      }

      resetForm();
      await loadTasks();
      onTasksUpdated?.();
    } catch (error: unknown) {
      console.error("Erro ao salvar tarefa:", error);
      const errorMessage = error instanceof Error ? error.message : "Tente novamente";
      showToast?.({
        message: editingTaskId ? "Erro ao atualizar tarefa" : "Erro ao criar tarefa",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) {
      return;
    }

    try {
      await taskApi.deleteTask(taskId);
      showToast?.({
        message: "Tarefa excluída com sucesso",
      });
      await loadTasks();
      onTasksUpdated?.();
    } catch (error: unknown) {
      console.error("Erro ao excluir tarefa:", error);
      const errorMessage = error instanceof Error ? error.message : "Tente novamente";
      showToast?.({
        message: "Erro ao excluir tarefa",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleComplete = async (taskId: string) => {
    try {
      await taskApi.completeTask(taskId);
      showToast?.({
        message: "Tarefa marcada como concluída",
      });
      await loadTasks();
      onTasksUpdated?.();
    } catch (error: unknown) {
      console.error("Erro ao concluir tarefa:", error);
      const errorMessage = error instanceof Error ? error.message : "Tente novamente";
      showToast?.({
        message: "Erro ao concluir tarefa",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (!chat) return null;

  const showForm = isCreating || editingTaskId !== null;
  const pendingTasks = tasks.filter(t => !t.executed);
  const completedTasks = tasks.filter(t => t.executed);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Gerenciar Tarefas - {chat.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {/* Botão Criar Nova Tarefa */}
          {!showForm && (
            <Button
              onClick={handleStartCreate}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Nova Tarefa
            </Button>
          )}

          {/* Formulário de Criar/Editar */}
          {showForm && (
            <Card className="p-4 bg-purple-50 border-purple-200">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                {editingTaskId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {editingTaskId ? "Editar Tarefa" : "Nova Tarefa"}
              </h3>

              <div className="space-y-3">
                <div>
                  <Label>Mensagem</Label>
                  <Textarea
                    placeholder="Digite a mensagem que será enviada..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {message.length}/1000 caracteres
                  </p>
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4" />
                    Data e Hora do Envio
                  </Label>
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date: Date | null) => setSelectedDate(date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="dd/MM/yyyy HH:mm"
                    minDate={new Date()}
                    placeholderText="Selecione data e hora"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    locale="pt-BR"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={submitting}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || !message.trim() || !selectedDate}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {submitting ? "Salvando..." : editingTaskId ? "Atualizar" : "Criar"}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Lista de Tarefas Pendentes */}
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-600">Carregando tarefas...</p>
            </div>
          ) : (
            <>
              {pendingTasks.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-sm text-gray-700">
                    Tarefas Pendentes ({pendingTasks.length})
                  </h3>
                  <div className="space-y-2">
                    {pendingTasks.map((task) => (
                      <Card
                        key={task.id}
                        className="p-3 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 mb-1 break-words">
                              {task.message}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(task.scheduledDate).toLocaleString("pt-BR")}
                            </p>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStartEdit(task)}
                              disabled={editingTaskId === task.id}
                              className="h-8 w-8 p-0"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleComplete(task.id)}
                              className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(task.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Lista de Tarefas Concluídas */}
              {completedTasks.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-sm text-gray-700">
                    Tarefas Concluídas ({completedTasks.length})
                  </h3>
                  <div className="space-y-2">
                    {completedTasks.map((task) => (
                      <Card
                        key={task.id}
                        className="p-3 bg-gray-50 border-gray-200"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0 opacity-60">
                            <p className="text-sm font-medium text-gray-700 mb-1 line-through break-words">
                              {task.message}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-green-600" />
                              Concluída em {task.executedAt ? new Date(task.executedAt).toLocaleString("pt-BR") : "-"}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(task.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {tasks.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Nenhuma tarefa criada ainda</p>
                  <p className="text-xs mt-1">Clique em "Criar Nova Tarefa" para começar</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskManagerModal;