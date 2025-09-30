import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, QrCode, Settings, User } from "lucide-react";
import QRConnection from "@/components/QRConnection";
import ChatColumns from "@/components/ChatColumns";
import TagManager from "@/components/TagManager";

const Dashboard = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-border shadow-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-xl">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">WhatsApp Business Monitor</h1>
                <p className="text-sm text-muted-foreground">Sistema de Gestão de Conversas</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowTagManager(true)}
                className="border-primary text-primary hover:bg-primary hover:text-white"
              >
                <Settings className="w-4 h-4 mr-2" />
                Gerenciar Etiquetas
              </Button>
              
              {!isConnected && (
                <Button
                  onClick={() => setShowQR(true)}
                  className="bg-gradient-primary text-white hover:shadow-medical"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Conectar WhatsApp
                </Button>
              )}
              
              <div className="flex items-center gap-2 ml-4 px-3 py-2 bg-muted rounded-lg">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Usuário da Clínica</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        {!isConnected ? (
          <Card className="shadow-medical bg-gradient-card border-0 max-w-md mx-auto mt-12">
            <CardHeader className="text-center">
              <div className="p-4 bg-muted rounded-full w-fit mx-auto mb-4">
                <QrCode className="w-8 h-8 text-muted-foreground" />
              </div>
              <CardTitle className="text-xl">Conecte seu WhatsApp Business</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-6">
                Para começar a monitorar suas conversas, conecte sua conta do WhatsApp Business.
              </p>
              <Button
                onClick={() => setShowQR(true)}
                className="w-full bg-gradient-primary text-white hover:shadow-medical"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Conectar Agora
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ChatColumns />
        )}
      </div>

      {/* Modais */}
      {showQR && (
        <QRConnection 
          onClose={() => setShowQR(false)}
          onConnected={() => {
            setIsConnected(true);
            setShowQR(false);
          }}
        />
      )}

      {showTagManager && (
        <TagManager onClose={() => setShowTagManager(false)} />
      )}
    </div>
  );
};

export default Dashboard;