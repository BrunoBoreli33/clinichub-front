import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, Shield, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import clinicHero from "@/assets/clinic-hero.jpg";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, insira seu e-mail para continuar.",
        variant: "destructive",
      });
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "E-mail inválido",
        description: "Por favor, insira um endereço de e-mail válido.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simular envio de e-mail
    setTimeout(() => {
      setEmailSent(true);
      setIsLoading(false);
      toast({
        title: "E-mail enviado com sucesso!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    }, 2000);
  };

  if (emailSent) {
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
              <div className="absolute inset-0 bg-gradient-to-tr from-accent/80 via-accent/40 to-transparent">
                <div className="absolute bottom-8 left-8 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Mail className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold">E-mail enviado</h2>
                  </div>
                  <p className="text-lg opacity-90 max-w-md">
                    Verifique sua caixa de entrada e siga as instruções para redefinir a senha.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Lado direito - Confirmação */}
          <div className="w-full max-w-md mx-auto">
            <Card className="shadow-medical bg-gradient-card border-0">
              <CardHeader className="text-center pb-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="p-3 bg-accent rounded-xl">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">
                  E-mail enviado!
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Enviamos instruções para redefinir sua senha para:
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <p className="text-center font-medium text-accent">{email}</p>
                </div>
                
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>• Verifique sua caixa de entrada</p>
                  <p>• Se não encontrar, verifique a pasta de spam</p>
                  <p>• O link expira em 24 horas</p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      setEmailSent(false);
                      setEmail("");
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Tentar outro e-mail
                  </Button>
                  
                  <Link to="/">
                    <Button 
                      variant="ghost" 
                      className="text-sm text-muted-foreground hover:text-primary hover:bg-green-500/5"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar ao login
                  </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

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
                    <h2 className="text-2xl font-bold text-white drop-shadow-lg">Recuperação de senha</h2>
                  </div>
                  <p className="text-lg text-white drop-shadow-md max-w-md">
                    Insira seu e-mail para receber instruções de redefinição de senha.
                  </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lado direito - Formulário */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-medical bg-gradient-card border-0">
            <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-2">
              <div className="p-2 bg-gradient-primary rounded-xl">
                <Mail className="w-6 h-6 text-white" />
              </div>
            </div>

            <CardTitle className="text-2xl font-bold text-foreground mb-2">
              Esqueceu a senha?
            </CardTitle>

            <CardDescription className="text-muted-foreground">
              Informe seu e-mail e enviaremos instruções para redefinir.
            </CardDescription>
          </CardHeader>
            
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Endereço de e-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 bg-background border-border focus:ring-primary"
                  required
                />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-primary text-white font-semibold shadow-card hover:shadow-medical transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enviando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Enviar instruções
                    </div>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/">
                  <Button 
                    variant="ghost" 
                    className="text-sm text-muted-foreground hover:text-primary hover:bg-green-500/5"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar ao login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Informações de segurança */}
          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p className="flex items-center justify-center gap-1">
              <Shield className="w-3 h-3" />
              Processo seguro de recuperação de senha
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
