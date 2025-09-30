import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, QrCode } from "lucide-react";
import QRConnection from "@/components/QRConnection";
import ChatColumns from "@/components/ChatColumns";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const Dashboard = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [showQR, setShowQR] = useState(false);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col bg-gradient-background">
          {/* Header */}
          <header className="border-b bg-background/80 backdrop-blur-sm">
            <div className="flex items-center justify-center py-4 px-4 relative">
              <SidebarTrigger className="absolute left-4" />
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-primary rounded-xl">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <h1 className="text-xl font-bold text-foreground">WhatsApp Business Monitor</h1>
                  <p className="text-xs text-muted-foreground">Sistema de Gestão de Conversas</p>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 flex items-center justify-center p-4">
            {!isConnected ? (
              <Card className="shadow-medical bg-card border-0 max-w-md w-full">
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
          </main>

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
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;