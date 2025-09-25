import { useState } from "react";
import { QRConnection } from "@/components/QRConnection";
import { ChatColumns } from "@/components/ChatColumns";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const Dashboard = () => {
  const [isConnected, setIsConnected] = useState(false);

  const handleLogout = () => {
    // TODO: Implement logout with Supabase
    console.log("Logout");
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <header className="bg-card shadow-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">
            WhatsApp Business Control
          </h1>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {!isConnected ? (
          <QRConnection onConnect={() => setIsConnected(true)} />
        ) : (
          <ChatColumns />
        )}
      </main>
    </div>
  );
};

export default Dashboard;