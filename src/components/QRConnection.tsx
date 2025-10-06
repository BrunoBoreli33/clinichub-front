import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, CheckCircle, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { buildUrl } from "@/lib/api";

interface QRConnectionProps {
  onClose: () => void;
  onConnected: () => void;
}

const QRConnection = ({ onClose, onConnected }: QRConnectionProps) => {
  const [step, setStep] = useState<"qr" | "success" | "error">("qr");
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [canRetry, setCanRetry] = useState(false);

  const { toast } = useToast();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const attemptsRef = useRef(0);

  // Função para buscar QR Code ou verificar se já está conectado
  const fetchQRCode = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMessage("Token de autenticação não encontrado");
      setStep("error");
      return;
    }

    try {
      setIsLoading(true);
  const response = await fetch(buildUrl('/dashboard/zapi/qr-code'), {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      // Se já estiver conectado, vai direto para os chats
      if (data.connected) {
        setStep("success");
        stopPolling();
        setQrCodeImage(null);
        setTimeout(() => {
          onConnected();
          toast({
            title: "WhatsApp conectado com sucesso!",
            description: "Suas conversas serão carregadas em breve.",
          });
        }, 500);
        return;
      }

      // Se veio QR Code, exibe
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

    // Primeira chamada imediata
    fetchQRCode();

    // Polling a cada 15 segundos se ainda não estiver conectado
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
        toast({
          title: "QR Code expirado",
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
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 py-6">
          {step === "qr" && (
            <>
              <div className="w-48 h-48 bg-white border-2 border-border rounded-lg flex items-center justify-center overflow-hidden">
                {isLoading && !qrCodeImage ? (
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                ) : qrCodeImage ? (
                  <img src={qrCodeImage} alt="QR Code WhatsApp" className="w-full h-full object-contain p-2" />
                ) : (
                  <div className="w-40 h-40 bg-foreground/10 rounded-lg flex items-center justify-center">
                    <QrCode className="w-20 h-20 text-foreground/30" />
                  </div>
                )}
              </div>

              <div className="text-center space-y-2">
                <p className="font-medium">Escaneie o código QR</p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Abra o WhatsApp Business no seu celular e escaneie este código para conectar
                </p>
                {attempts > 0 && (
                  <p className="text-xs text-orange-600 font-medium">
                    Tentativa {attempts} de 3
                  </p>
                )}
              </div>

              {canRetry && (
                <Button onClick={handleRetry} className="bg-gradient-primary text-white hover:shadow-medical">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Gerar Novo QR Code
                </Button>
              )}
            </>
          )}

          {step === "success" && (
            <>
              <div className="w-48 h-48 flex items-center justify-center">
                <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-16 h-16 text-accent" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="font-medium text-accent">Conectado com Sucesso!</p>
                <p className="text-sm text-muted-foreground">Redirecionando para o painel de conversas...</p>
              </div>
            </>
          )}

          {step === "error" && (
            <>
              <div className="w-48 h-48 flex items-center justify-center">
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-16 h-16 text-red-500" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="font-medium text-red-600">Erro na Conexão</p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  {errorMessage || "Não foi possível conectar ao WhatsApp Business"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleRetry} className="bg-gradient-primary text-white hover:shadow-medical">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar Novamente
                </Button>
                <Button onClick={onClose} variant="outline">Fechar</Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRConnection;
