import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Settings as SettingsIcon } from "lucide-react";

const Settings = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b flex items-center px-4 bg-background">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-xl font-semibold">Configurações</h1>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-8 bg-gradient-background">
            <div className="max-w-2xl mx-auto">
              <Card className="shadow-medical">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <SettingsIcon className="h-5 w-5" />
                    <CardTitle>Configurações do Sistema</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Configurações em desenvolvimento.
                  </p>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
