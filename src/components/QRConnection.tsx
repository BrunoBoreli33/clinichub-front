import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Smartphone, CheckCircle } from "lucide-react";

interface QRConnectionProps {
  onConnect: () => void;
}

export const QRConnection = ({ onConnect }: QRConnectionProps) => {
  const [isScanning, setIsScanning] = useState(false);

  const generateQRCode = () => {
    setIsScanning(true);
    // TODO: Generate real QR code with WhatsApp Business API
    setTimeout(() => {
      onConnect();
    }, 3000); // Simulate connection after 3 seconds
  };

  return (
    <div className="flex justify-center items-center min-h-[600px]">
      <Card className="w-full max-w-md shadow-medical">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <Smartphone className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Conectar WhatsApp Business</CardTitle>
          <CardDescription>
            Conecte sua conta do WhatsApp Business para começar a gerenciar suas conversas
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!isScanning ? (
            <>
              <div className="text-center space-y-4">
                <div className="p-8 border-2 border-dashed border-border rounded-lg">
                  <QrCode className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Clique no botão abaixo para gerar o código QR
                  </p>
                </div>
                
                <Button 
                  onClick={generateQRCode}
                  className="w-full"
                  size="lg"
                >
                  Gerar Código QR
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Como conectar:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Abra o WhatsApp Business no seu celular</li>
                  <li>Toque em Menu ou Configurações</li>
                  <li>Toque em "Aparelhos conectados"</li>
                  <li>Toque em "Conectar um aparelho"</li>
                  <li>Aponte seu celular para o código QR</li>
                </ol>
              </div>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="animate-pulse p-8 border-2 border-dashed border-primary rounded-lg bg-primary/5">
                <div className="h-32 w-32 mx-auto bg-foreground/10 rounded-lg mb-4"></div>
                <p className="text-primary font-medium">Escaneie o código QR com seu celular</p>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-accent">
                <CheckCircle className="h-5 w-5 animate-pulse" />
                <span>Aguardando conexão...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};