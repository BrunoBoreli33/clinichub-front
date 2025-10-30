import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Mail, Lock, User, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { buildUrl } from "@/lib/api";
import { Link, useNavigate } from "react-router-dom";
import clinicHero from "@/assets/clinic-hero.jpg";

const SignupForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate(); // ← Corrigido aqui

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "As senhas digitadas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
  const response = await fetch(buildUrl('/auth/register'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        toast({
          title: "Verifique seu e-mail",
          description: "Um código de confirmação foi enviado para o seu e-mail.",
        });

        // Redireciona para a página de confirmação, passando o e-mail no state
        navigate("/confirm", { state: { email: data.email } });
      } else {
        toast({
          title: "Erro ao criar conta",
          description: "Este email já está cadastrado.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro ao criar sua conta.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false); // ← Corrigido aqui, removeu o ', 2000'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Lado esquerdo - Imagem */}
        <div className="hidden lg:block relative">
          <div className="relative overflow-hidden rounded-2xl">
            <img
              src={clinicHero}
              alt="Ambiente clínico moderno"
              className="w-full h-[600px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/60 via-primary/30 to-transparent">
              <div className="absolute bottom-8 left-8 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-b from-green-400 to-green-600 rounded-lg shadow-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold drop-shadow-lg">
                    Registro de Clínica
                  </h2>
                </div>
                <p className="text-lg text-white drop-shadow-md max-w-md">
                  Crie sua conta para acessar o sistema de monitoramento.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lado direito - Formulário */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-medical bg-gradient-card border-0">
            <CardHeader className="text-center pb-8">
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="p-2 bg-gradient-primary rounded-xl">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">
                  Registro Clínica
                </CardTitle>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Crie sua conta
              </h2>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSignup} className="space-y-6">
                {/* Nome */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-muted-foreground">
                    Nome Completo
                  </Label>
                  <div className="relative">
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Digite seu nome completo"
                      value={formData.name}
                      onChange={handleChange}
                      className="h-12 bg-background border-border focus:ring-primary pr-12"
                      required
                    />
                    <User className="absolute right-3 top-3 h-5 w-5 text-primary" />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                    Endereço de Email
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Digite seu email"
                      value={formData.email}
                      onChange={handleChange}
                      className="h-12 bg-background border-border focus:ring-primary pr-12"
                      required
                    />
                    <Mail className="absolute right-3 top-3 h-5 w-5 text-primary" />
                  </div>
                </div>

                {/* Senha */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-muted-foreground">
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Crie uma senha"
                      value={formData.password}
                      onChange={handleChange}
                      className="h-12 bg-background border-border focus:ring-primary pr-12"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-10 w-10 p-0 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5 text-primary" /> : <Lock className="h-5 w-5 text-primary" />}
                    </Button>
                  </div>
                </div>

                {/* Confirmar senha */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-muted-foreground">
                    Confirmar Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirme sua senha"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="h-12 bg-background border-border focus:ring-primary pr-12"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-10 w-10 p-0 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5 text-primary" /> : <Lock className="h-5 w-5 text-primary" />}
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
                      Criando conta...
                    </div>
                  ) : (
                    "Criar Conta"
                  )}
                </Button>

                <div className="text-center">
                  <span className="text-sm text-muted-foreground">Já tem uma conta? </span>
                  <Link
                    to="/"
                    className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-green-500/5 transition"
                  >
                    Faça login aqui
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
