import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Shield, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import clinicHero from "@/assets/clinic-hero.jpg";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
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
    
    // Simular autenticação
    setTimeout(() => {
      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para o painel de controle...",
      });
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Lado esquerdo - Imagem e informações */}
        <div className="hidden lg:block relative">
          <div className="relative overflow-hidden rounded-2xl">
            <img 
              src={clinicHero} 
              alt="Ambiente clínico moderno" 
              className="w-full h-[600px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/80 via-primary/40 to-transparent">
              <div className="absolute bottom-8 left-8 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold">WhatsApp Business Monitor</h2>
                </div>
                <p className="text-lg opacity-90 max-w-md">
                  Sistema profissional de monitoramento e gestão de mensagens WhatsApp Business para sua clínica.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lado direito - Formulário de login */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-medical bg-gradient-card border-0">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="p-2 bg-gradient-primary rounded-xl">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-foreground">
                    Acesso Clínica
                  </CardTitle>
                </div>
              </div>
              <p className="text-muted-foreground">
                Entre com suas credenciais para acessar o sistema de monitoramento
              </p>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email ou Usuário
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

                <div className="text-center">
                  <Link to="/forgot-password">
                    <Button 
                      variant="ghost" 
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      Esqueceu sua senha?
                    </Button>
                  </Link>
                </div>

                <Link to="/signup">
                  <Button
                    variant="outline"
                    className="w-full h-12 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300"
                  >
                    Registre-se
                  </Button>
                </Link>
              </form>
            </CardContent>
          </Card>

          {/* Informações de segurança */}
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