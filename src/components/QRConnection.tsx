import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, RefreshCw, AlertCircle } from "lucide-react";
import { ChatsData } from "@/types/chat";  // ✅ Import correto

interface QRConnectionProps {
  onClose: () => void;
  onConnected: (chatsData: ChatsData | null) => void;
  showToast: (toast: { message: string; description?: string; variant?: string }) => void;
}

const QRConnection = ({ onClose, onConnected, showToast }: QRConnectionProps) => {
  const [step, setStep] = useState<"qr" | "success" | "error">("qr");
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [canRetry, setCanRetry] = useState(false);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const attemptsRef = useRef(0);

  const fetchQRCode = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMessage("Token de autenticação não encontrado");
      setStep("error");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:8081/dashboard/zapi/qr-code", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.connected) {
        setStep("success");
        stopPolling();
        setQrCodeImage(null);
        
        setTimeout(async () => {
          try {
            const chatsResponse = await fetch("http://localhost:8081/dashboard/zapi/chats_info", {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });
            
            const chatsData = await chatsResponse.json();
            onConnected(chatsData);
            
            showToast({
              message: "WhatsApp conectado!",
              description: "Carregando suas conversas...",
            });
          } catch (error) {
            console.error("Erro ao carregar chats:", error);
            onConnected(null);
            showToast({
              message: "Conectado com aviso",
              description: "WhatsApp conectado, mas houve erro ao carregar conversas.",
              variant: "destructive",
            });
          }
        }, 500);
        return;
      }

      if (data.qrCode) {
        setQrCodeImage(data.qrCode);
        setStep("qr");
        setErrorMessage("");
      } else {
        setErrorMessage(data.message || "Erro ao gerar QR Code");
        setStep("error");
        stopPolling();
        setCanRetry(true);
      }
    } catch (error) {
      console.error("Erro ao buscar QR Code:", error);
      setErrorMessage("Erro de conexão com o servidor");
      setStep("error");
      setCanRetry(true);
      stopPolling();
    } finally {
      setIsLoading(false);
    }
  };

  const startPolling = () => {
    stopPolling();
    attemptsRef.current = 0;
    setAttempts(0);
    setCanRetry(false);
    setStep("qr");

    fetchQRCode();

    pollingIntervalRef.current = setInterval(() => {
      if (step === "success") {
        stopPolling();
        return;
      }

      attemptsRef.current += 1;
      setAttempts(attemptsRef.current);

      if (attemptsRef.current >= 3) {
        stopPolling();
        setCanRetry(true);
        showToast({
          message: "QR Code expirado",
          description: "Por favor, solicite um novo QR Code.",
          variant: "destructive",
        });
      } else {
        fetchQRCode();
      }
    }, 15000);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const handleRetry = () => {
    setErrorMessage("");
    setCanRetry(false);
    startPolling();
  };

  useEffect(() => {
    startPolling();
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-card border-0 shadow-medical">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {step === "qr" && "Conectar WhatsApp Business"}
            {step === "success" && "Conectado com Sucesso!"}
            {step === "error" && "Erro na Conexão"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {step === "qr" && "Escaneie o código QR com seu WhatsApp"}
            {step === "success" && "Seu WhatsApp foi conectado com sucesso"}
            {step === "error" && errorMessage}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {step === "qr" && (
            <>
              {isLoading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
                  <p className="text-sm text-gray-600">Gerando QR Code...</p>
                </div>
              ) : qrCodeImage ? (
                <>
                  <div className="p-4 bg-white rounded-lg shadow-sm">
                    <img
                      src={qrCodeImage}
                      alt="QR Code WhatsApp"
                      className="w-64 h-64 object-contain"
                    />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-sm text-gray-600">
                      Abra o WhatsApp no seu celular
                    </p>
                    <p className="text-xs text-gray-500">
                      Toque em Mais opções → Aparelhos conectados → Conectar
                      aparelho
                    </p>
                    {attempts > 0 && (
                      <p className="text-xs text-orange-600">
                        Tentativa {attempts} de 3
                      </p>
                    )}
                  </div>
                </>
              ) : null}
            </>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 bg-green-50 rounded-full">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              </div>
              <p className="text-center text-gray-600">
                Preparando suas conversas...
              </p>
            </div>
          )}

          {step === "error" && (
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-red-50 rounded-full">
                <AlertCircle className="w-16 h-16 text-red-500" />
              </div>
              {canRetry && (
                <Button
                  onClick={handleRetry}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar Novamente
                </Button>
              )}
            </div>
          )}
        </div>

        {step !== "success" && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              Cancelar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QRConnection;