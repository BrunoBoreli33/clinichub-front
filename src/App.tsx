import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import Signup from "./pages/Signup";
import ConfirmForm from "@/components/ConfirmForm";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminPanel from "./pages/AdminPanel";
import tokenRefreshManager from "./lib/tokenRefresh"; // ✅ IMPORTAÇÃO DO SISTEMA DE REFRESH

const queryClient = new QueryClient();

/**
 * ✅ Componente interno para inicializar o sistema de renovação de token
 * Executa apenas uma vez quando o app é montado
 */
const TokenRefreshInitializer = () => {
  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (token) {
      // Inicializar sistema de refresh automático
      tokenRefreshManager.initialize();
      console.log("🔄 Sistema de renovação automática de token ativado");
    }

    // Cleanup: parar o sistema quando o componente for desmontado
    return () => {
      tokenRefreshManager.stop();
    };
  }, []); // Array vazio = executa apenas uma vez na montagem

  return null; // Este componente não renderiza nada
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* ✅ Componente que inicializa o sistema de refresh */}
        <TokenRefreshInitializer />
        
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Index />} />
          
          {/* Rota protegida - Dashboard */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* Rota protegida - Painel Admin (apenas para ADMIN) */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAdmin>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
          
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/confirm" element={<ConfirmForm />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;