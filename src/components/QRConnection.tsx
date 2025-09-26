import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QRConnectionProps {
  onClose: () => void;
  onConnected: () => void;
}

const QRConnection = ({ onClose, onConnected }: QRConnectionProps) => {
  const [step, setStep] = useState<"qr" | "connecting" | "success">("qr");
  const { toast } = useToast();

  useEffect(() => {
    if (step === "connecting") {
      const timer = setTimeout(() => {
        setStep("success");
        setTimeout(() => {
          onConnected();
          toast({
            title: "WhatsApp conectado com sucesso!",
            description: "Suas conversas serão carregadas em breve.",
          });
        }, 1500);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [step, onConnected, toast]);

  const handleScanQR = () => {
    setStep("connecting");
    toast({
      title: "QR Code escaneado!",
      description: "Conectando ao WhatsApp Business...",
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-card border-0 shadow-medical">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {step === "qr" && "Conectar WhatsApp Business"}
            {step === "connecting" && "Conectando..."}
            {step === "success" && "Conectado com Sucesso!"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-6 py-6">
          {step === "qr" && (
            <>
              {/* Simulação do QR Code */}
              <div className="w-48 h-48 bg-white border-2 border-border rounded-lg flex items-center justify-center">
                <div className="w-40 h-40 bg-foreground/10 rounded-lg flex items-center justify-center">
                  <QrCode className="w-20 h-20 text-foreground/30" />
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <p className="font-medium">Escaneie o código QR</p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Abra o WhatsApp Business no seu celular e escaneie este código para conectar
                </p>
              </div>
              
              <Button 
                onClick={handleScanQR}
                className="bg-gradient-primary text-white hover:shadow-medical"
              >
                Simular Conexão
              </Button>
            </>
          )}
          
          {step === "connecting" && (
            <>
              <div className="w-48 h-48 flex items-center justify-center">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
              </div>
              
              <div className="text-center space-y-2">
                <p className="font-medium">Conectando ao WhatsApp Business...</p>
                <p className="text-sm text-muted-foreground">
                  Aguarde enquanto estabelecemos a conexão
                </p>
              </div>
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
                <p className="text-sm text-muted-foreground">
                  Redirecionando para o painel de conversas...
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRConnection;