import { Navigate } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { toast } = useToast();
  const [hasShownToast, setHasShownToast] = useState(false);
  
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const dashboardData = localStorage.getItem("dashboardData");
  const userRole = localStorage.getItem("userRole");

  // Debug: Ver o que está no localStorage
  console.log("🔐 ProtectedRoute Debug:", {
    requireAdmin,
    userRole,
    hasToken: !!token,
    hasUserId: !!userId,
    hasDashboardData: !!dashboardData
  });

  // ⭐ MOSTRAR TOAST apenas uma vez quando tentar acessar sem permissão
  useEffect(() => {
    if (requireAdmin && userRole !== "ADMIN" && !hasShownToast && token && userId) {
      toast({
        title: "Acesso Negado",
        description: "Você não tem permissão para acessar esta área. Apenas administradores têm acesso.",
        variant: "destructive",
      });
      setHasShownToast(true);
    }
  }, [requireAdmin, userRole, hasShownToast, token, userId, toast]);

  // ✅ PRIMEIRA VERIFICAÇÃO: Autenticação básica
  if (!token || !userId || !dashboardData) {
    console.log("❌ Sem autenticação - Redirecionando para login");
    return <Navigate to="/" replace />;
  }

  // ✅ SEGUNDA VERIFICAÇÃO: Permissão de admin (CRÍTICA)
  if (requireAdmin && userRole !== "ADMIN") {
    console.log("❌ Sem permissão de admin - Redirecionando para dashboard");
    console.log(`   userRole: "${userRole}" | Esperado: "ADMIN"`);
    return <Navigate to="/dashboard" replace />;
  }

  // ✅ Se passou por todas as verificações, renderiza o componente
  console.log("✅ Acesso autorizado - Renderizando componente");
  return <>{children}</>;
};

export default ProtectedRoute;