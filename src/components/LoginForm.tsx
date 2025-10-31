import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Shield, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { buildUrl } from "@/lib/api";
import clinicHubIco from "@/assets/clinichub.ico";
import clincHubLogo from "@/assets/clinichub-logo.png";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // PASSO 1: Fazer login e obter token
  const loginResponse = await fetch(buildUrl('/auth/login'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (loginResponse.status === 404) {
        toast({
          title: "Usuário não cadastrado",
          description: "Por favor, registre-se antes de tentar entrar.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (loginResponse.status === 401) {
        toast({
          title: "Senha incorreta",
          description: "A senha informada está errada.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!loginResponse.ok) {
        toast({
          title: "Erro ao fazer login",
          description: "Ocorreu um erro inesperado. Tente novamente.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Login bem-sucedido - extrair dados
      const loginData = await loginResponse.json();
      const { id, name, token } = loginData;

      console.log("Login bem-sucedido:", { id, name });

      // PASSO 2: Buscar dados do dashboard com o token
      const dashboardResponse = await fetch(
        buildUrl(`/dashboard?userId=${id}`),
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (dashboardResponse.status === 401) {
        toast({
          title: "Token inválido",
          description: "Sua sessão expirou. Faça login novamente.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (dashboardResponse.status === 403) {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para acessar este recurso.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!dashboardResponse.ok) {
        toast({
          title: "Erro ao carregar dashboard",
          description: "Não foi possível carregar os dados. Tente novamente.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Dashboard carregado com sucesso
      const dashboardData = await dashboardResponse.json();
      
      console.log("Dados do dashboard recebidos:", dashboardData);

      // PASSO 3: Salvar dados no localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("userId", id);
      localStorage.setItem("userName", name);
      localStorage.setItem("userEmail", dashboardData.user.email);
      localStorage.setItem("userRole", dashboardData.user.role);
      localStorage.setItem("dashboardData", JSON.stringify(dashboardData));

      // PASSO 4: Mostrar mensagem de sucesso
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo de volta, ${name}!`,
      });

      // PASSO 5: Redirecionar para o dashboard do frontend
      navigate("/dashboard");

    } catch (error) {
      console.error("Erro na requisição:", error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor. Verifique se o backend está rodando.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Lado esquerdo - Imagem e informações */}
        <div className="hidden lg:block relative">
          <div className="relative overflow-hidden rounded-2xl">
            <img
              src={clincHubLogo}
              alt="Ambiente clínico moderno"
              className="w-full h-[600px] object-cover"
            />

          </div>
        </div>

        {/* Lado direito - Formulário de login */}
        <div className="w-full max-w-md mx-auto">

          <Card className="shadow-medical bg-gradient-card border-0">

<CardHeader className="text-center pb-6">
  <div className="flex items-center justify-center gap-2 mb-4">
    <CardTitle className="text-2xl font-bold text-foreground">
    </CardTitle>
  </div>

  {/* Ícone centralizado */}
  <div className="flex justify-center mb-4">
    <img
      src={clinicHubIco}
      alt="Logo ClinicHub"
      className="w-20 h-20 md:w-24 md:h-24 rounded-full shadow-md animate-bounce"
    />
  </div>

  <p className="text-muted-foreground">
    Seu hub de inteligência clínica começa aqui. Faça login para continuar.
  </p>
</CardHeader>


            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.email@clinica.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 bg-background border-border focus:ring-primary"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 bg-background border-border focus:ring-primary pr-11"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-11 px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-primary text-white font-semibold shadow-card hover:shadow-medical transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Entrando...
                    </div>
                  ) : (
                    "Entrar no Sistema"
                  )}
                </Button>

                <Link to="/signup">
                  <Button
                    variant="outline"
                    className="w-full h-12 mt-6 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300"
                  >
                    Registre-se
                  </Button>
                </Link>

                <div className="text-center">
                  <Link to="/forgot-password">
                    <Button
                      variant="ghost"
                      className="text-sm text-muted-foreground hover:text-primary hover:bg-green-500/5"
                    >
                      Esqueceu sua senha?
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p className="flex items-center justify-center gap-1">
              <Shield className="w-3 h-3" />
              Conexão segura e criptografada
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;