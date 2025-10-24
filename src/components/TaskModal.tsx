import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Save, X } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as taskApi from "@/api/task";
import { Chat } from "@/types/chat";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  chat: Chat | null;
  onTaskCreated?: () => void;
  showToast?: (toast: { message: string; description?: string; variant?: string }) => void;
}

const TaskModal = ({ isOpen, onClose, chat, onTaskCreated, showToast }: TaskModalProps) => {
  const [message, setMessage] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset form quando modal abre
  useEffect(() => {
    if (isOpen && chat) {
      setMessage("");
      // Definir data padrão para daqui a 1 hora
      const defaultDate = new Date();
      defaultDate.setHours(defaultDate.getHours() + 1);
      defaultDate.setMinutes(0);
      defaultDate.setSeconds(0);
      defaultDate.setMilliseconds(0);
      setSelectedDate(defaultDate);
    }
  }, [isOpen, chat]);

  const handleSubmit = async () => {
    if (!chat || !message.trim() || !selectedDate) {
      showToast?.({
        message: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    // Validar se a data é futura
    if (selectedDate <= new Date()) {
      showToast?.({
        message: "A data deve ser futura",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // ✅ CORREÇÃO BUG 1: Enviar data no formato local sem conversão UTC
      // Formato: "YYYY-MM-DDTHH:mm:ss" sem o "Z" no final
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const hours = String(selectedDate.getHours()).padStart(2, '0');
      const minutes = String(selectedDate.getMinutes()).padStart(2, '0');
      const seconds = String(selectedDate.getSeconds()).padStart(2, '0');
      
      const scheduledDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

      await taskApi.createTask({
        chatId: chat.id,
        message: message.trim(),
        scheduledDate,
      });

      showToast?.({
        message: "Tarefa criada com sucesso",
        description: `Mensagem será enviada em ${selectedDate.toLocaleString("pt-BR")}`,
      });

      onTaskCreated?.();
      onClose();
    } catch (error: unknown) {
      console.error("Erro ao criar tarefa:", error);
      const errorMessage = error instanceof Error ? error.message : "Tente novamente";
      showToast?.({
        message: "Erro ao criar tarefa",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!chat) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Criar Tarefa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Chat Info - Não editável */}
          <div>
            <Label>Chat</Label>
            <Input
              value={`${chat.name} (${chat.id})`}
              disabled
              className="bg-gray-50 cursor-not-allowed"
            />
          </div>

          {/* Mensagem */}
          <div>
            <Label>Mensagem</Label>
            <Textarea
              placeholder="Digite a mensagem que será enviada..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {message.length}/1000 caracteres
            </p>
          </div>

          {/* Data e Hora */}
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
            <p className="text-xs text-gray-500 mt-1">
              A mensagem será enviada automaticamente nesta data
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !message.trim() || !selectedDate}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Criando..." : "Criar Tarefa"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;