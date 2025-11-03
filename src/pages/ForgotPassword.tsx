import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, Shield, CheckCircle, Lock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/http";

import clincHubLogo from "@/assets/clinichub-logo.png";

type Step = "email" | "code" | "password" | "success";

const ForgotPassword = () => {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
    
    try {
      const response = await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      if (response.success) {
        setEmailSent(true);
        setStep("code");
        setIsLoading(false);
        toast({
          title: "E-mail enviado com sucesso!",
          description: "Verifique sua caixa de entrada para o código de recuperação.",
        });
      }
    } catch (error: unknown) {
      setIsLoading(false);
      const errorMessage = error && typeof error === 'object' && 'data' in error 
        ? (error.data as { message?: string })?.message 
        : "Erro ao enviar código. Verifique o e-mail e tente novamente.";
      
      toast({
        title: "Erro ao enviar código",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code || code.length !== 6) {
      toast({
        title: "Código inválido",
        description: "O código deve ter 6 dígitos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await apiFetch("/auth/verify-reset-code", {
        method: "POST",
        body: JSON.stringify({ email, code }),
      });

      if (response.success) {
        toast({
          title: "Código verificado!",
          description: "Agora você pode definir sua nova senha.",
        });
        setStep("password");
      }
    } catch (error: unknown) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      const errorMessage = error && typeof error === 'object' && 'data' in error 
        ? (error.data as { message?: string })?.message 
        : `Tentativa ${newAttempts} de 3. Tente novamente.`;

      if (newAttempts >= 3) {
        toast({
          title: "Limite de tentativas excedido",
          description: "Por favor, solicite um novo código.",
          variant: "destructive",
        });
        setStep("email");
        setCode("");
        setAttempts(0);
        setEmailSent(false);
      } else {
        toast({
          title: "Código incorreto",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 2) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter no mínimo 2 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "As senhas devem ser iguais.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, newPassword }),
      });

      if (response.success) {
        toast({
          title: "Senha alterada com sucesso!",
          description: "Você será redirecionado para o login.",
        });
        setStep("success");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'data' in error 
        ? (error.data as { message?: string })?.message 
        : "Erro ao alterar senha. Tente novamente.";
      
      toast({
        title: "Erro ao alterar senha",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "success") {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Lado esquerdo - Imagem */}
          <div className="hidden lg:block relative">
            <div className="relative overflow-hidden rounded-2xl">
              <img 
                src={clincHubLogo} 
                alt="Ambiente clínico moderno" 
                className="w-full h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-accent/80 via-accent/40 to-transparent">
                <div className="absolute bottom-8 left-8 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold">Senha alterada</h2>
                  </div>
                  <p className="text-lg opacity-90 max-w-md">
                    Sua senha foi alterada com sucesso. Redirecionando para o login...
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
                  Senha alterada!
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Sua senha foi alterada com sucesso. Um email de confirmação foi enviado para você.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <p className="text-center font-medium text-accent">Redirecionando para o login...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (step === "code") {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Lado esquerdo - Imagem */}
          <div className="hidden lg:block relative">
            <div className="relative overflow-hidden rounded-2xl">
              <img 
                src={clincHubLogo} 
                alt="Ambiente clínico moderno" 
                className="w-full h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/60 via-primary/30 to-transparent">
                <div className="absolute bottom-8 left-8 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-b from-green-400 to-green-600 rounded-lg shadow-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white drop-shadow-lg">Verificação</h2>
                  </div>
                  <p className="text-lg text-white drop-shadow-md max-w-md">
                    Insira o código de 6 dígitos enviado para seu e-mail.
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
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                </div>

                <CardTitle className="text-2xl font-bold text-foreground mb-2">
                  Digite o código
                </CardTitle>

                <CardDescription className="text-muted-foreground">
                  Enviamos um código de 6 dígitos para {email}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleVerifyCode} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-sm font-medium text-foreground">
                      Código de verificação
                    </Label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="000000"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="h-11 bg-background border-border focus:ring-primary text-center text-2xl tracking-widest"
                      maxLength={6}
                      required
                    />
                    {attempts > 0 && (
                      <div className="flex items-center gap-2 text-sm text-orange-600">
                        <AlertCircle className="w-4 h-4" />
                        <span>Tentativa {attempts} de 3</span>
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-primary text-white font-semibold shadow-card hover:shadow-medical transition-all duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Verificando...
                      </div>
                    ) : (
                      "Verificar código"
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <Button
                    onClick={() => {
                      setStep("email");
                      setCode("");
                      setAttempts(0);
                      setEmailSent(false);
                    }}
                    variant="ghost"
                    className="text-sm text-muted-foreground hover:text-primary hover:bg-green-500/5"
                  >
                    Solicitar novo código
                  </Button>
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
  }

  if (step === "password") {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Lado esquerdo - Imagem */}
          <div className="hidden lg:block relative">
            <div className="relative overflow-hidden rounded-2xl">
              <img 
                src={clincHubLogo} 
                alt="Ambiente clínico moderno" 
                className="w-full h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/60 via-primary/30 to-transparent">
                <div className="absolute bottom-8 left-8 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-b from-green-400 to-green-600 rounded-lg shadow-lg flex items-center justify-center">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white drop-shadow-lg">Nova senha</h2>
                  </div>
                  <p className="text-lg text-white drop-shadow-md max-w-md">
                    Defina sua nova senha de acesso.
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
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                </div>

                <CardTitle className="text-2xl font-bold text-foreground mb-2">
                  Definir nova senha
                </CardTitle>

                <CardDescription className="text-muted-foreground">
                  Escolha uma senha forte para proteger sua conta
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-sm font-medium text-foreground">
                      Nova senha
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Digite sua nova senha"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-11 bg-background border-border focus:ring-primary"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                      Confirmar senha
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Digite novamente sua senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                        Alterando senha...
                      </div>
                    ) : (
                      "Alterar senha"
                    )}
                  </Button>
                </form>
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
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Lado esquerdo - Imagem */}
          <div className="hidden lg:block relative">
            <div className="relative overflow-hidden rounded-2xl">
              <img 
                src={clincHubLogo} 
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
                  <p>• O código expira em 15 minutos</p>
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
              src={clincHubLogo} 
              alt="Ambiente clínico moderno" 
              className="w-full h-[600px] object-cover"
            />

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