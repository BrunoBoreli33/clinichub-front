import { useState, useEffect } from "react";
import { X, Upload, Check, Edit2, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildUrl } from "@/lib/api";

interface UploadModalProps {
  onClose: () => void;
}

const UploadModal = ({ onClose }: UploadModalProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [savedPhoneNumber, setSavedPhoneNumber] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadUploadPhoneNumber();
  }, []);

  const loadUploadPhoneNumber = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(buildUrl("/api/profile/upload-phone"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success && data.uploadPhoneNumber) {
        setSavedPhoneNumber(data.uploadPhoneNumber);
        setPhoneNumber(data.uploadPhoneNumber);
      } else {
        setIsEditing(true);
      }
    } catch (error) {
      console.error("Erro ao carregar número de upload:", error);
      setIsEditing(true);
    }
  };

  const savePhoneNumber = async () => {
    if (!phoneNumber.trim()) {
      alert("Por favor, informe um número de telefone");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(buildUrl("/api/profile/upload-phone"), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber: phoneNumber.trim() }),
      });

      const data = await response.json();
      if (data.success) {
        setSavedPhoneNumber(phoneNumber.trim());
        setIsEditing(false);
        console.log("✅ Número de upload salvo com sucesso");
      } else {
        alert("Erro ao salvar número: " + data.message);
      }
    } catch (error) {
      console.error("Erro ao salvar número de upload:", error);
      alert("Erro ao salvar número de upload");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (type: 'photo' | 'video') => {
    if (!savedPhoneNumber) {
      alert("Configure um número de telefone antes de fazer upload");
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = type === 'photo' ? "image/*" : "video/*";
    input.multiple = true;

    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;

      setUploading(true);
      const token = localStorage.getItem("token");

      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const reader = new FileReader();

          await new Promise((resolve, reject) => {
            reader.onload = async () => {
              try {
                // Obter o base64 completo COM o prefixo data:image/...
                const base64Full = reader.result as string;
                
                const endpoint = type === 'photo' 
                  ? '/dashboard/messages/upload-image'
                  : '/dashboard/messages/upload-video';

                await fetch(buildUrl(endpoint), {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    phone: savedPhoneNumber,
                    [type === 'photo' ? 'image' : 'video']: base64Full,
                  }),
                });

                console.log(`✅ ${type === 'photo' ? 'Foto' : 'Vídeo'} ${i + 1}/${files.length} enviado`);
                resolve(true);
              } catch (error) {
                reject(error);
              }
            };

            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          // Delay entre envios
          if (i < files.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        alert(`${files.length} ${type === 'photo' ? 'foto(s)' : 'vídeo(s)'} enviado(s) com sucesso!`);
        onClose();
      } catch (error) {
        console.error("Erro ao enviar arquivos:", error);
        alert("Erro ao enviar alguns arquivos");
      } finally {
        setUploading(false);
      }
    };

    input.click();
  };

  return (
    <>
      {/* ✅ CORREÇÃO 2: Overlay com z-index maior para bloquear interação com o fundo */}
      <div 
        className="fixed inset-0 bg-black/70 z-[60]" 
        onClick={onClose} 
      />
      {/* ✅ CORREÇÃO 2: Card com z-index maior que o GalleryModal */}
      <Card className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-md z-[70] p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Upload de Mídias</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Configuração do Número */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número de Telefone para Upload
          </label>
          
          {!isEditing && savedPhoneNumber ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-green-700 font-medium">{savedPhoneNumber}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="5544999999999"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={savePhoneNumber}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
          
          <p className="mt-2 text-xs text-gray-500">
            Configure o número do WhatsApp que receberá os uploads.
            As mídias serão automaticamente salvas na galeria.
          </p>
        </div>

        {/* Botões de Upload */}
        <div className="space-y-3">
          <Button
            onClick={() => handleFileSelect('photo')}
            disabled={!savedPhoneNumber || uploading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {uploading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 mr-2" />
                Enviar Fotos
              </>
            )}
          </Button>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Como funciona:</strong><br />
            1. Configure seu número de WhatsApp<br />
            2. Selecione fotos do computador<br />
            3. As fotos serão enviadas para seu número<br />
            4. Automaticamente aparecerão na galeria
          </p>
        </div>
      </Card>
    </>
  );
};

export default UploadModal;