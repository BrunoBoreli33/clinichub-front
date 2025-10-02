import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const dashboardData = localStorage.getItem("dashboardData");

  // Se não tiver token, userId ou dados do dashboard, redireciona para login
  if (!token || !userId || !dashboardData) {
    return <Navigate to="/" replace />;
  }

  // Se tudo estiver OK, renderiza o componente protegido
  return <>{children}</>;
};

export default ProtectedRoute;