import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { buildUrl } from "@/lib/api";
import clinicHero from "@/assets/clinic-hero.jpg";

interface LocationState {
  email: string;
}

const ConfirmForm = () => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as LocationState | undefined;
  const email = state?.email || "";

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code) {
      toast({
        title: "Código obrigatório",
        description: "Digite o código enviado para seu e-mail.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
  const response = await fetch(buildUrl('/auth/confirm'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      if (response.ok) {
        toast({
          title: "Conta confirmada!",
          description: "Agora você pode acessar o sistema.",
        });

        navigate("/dashboard");
      } else {
        toast({
          title: "Código inválido",
          description: "O código inserido está incorreto ou expirou.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
                  <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                    Confirmação de Conta
                  </h2>
                </div>
                <p className="text-lg text-white drop-shadow-md max-w-md">
                  Insira o código de verificação enviado para seu e-mail e finalize seu cadastro.
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
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">
                Verifique seu E-mail
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Insira o código de confirmação enviado para <strong>{email}</strong>
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleConfirm} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-sm font-medium text-foreground">
                    Código de confirmação
                  </Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="______"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    maxLength={6}
                    className="h-12 bg-background border-border focus:ring-primary text-center tracking-widest"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-primary text-white font-semibold shadow-card hover:shadow-medical transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? "Confirmando..." : "Confirmar"}
                </Button>

                <div className="mt-6 text-center">
                  <Link to="/">
                    <Button
                      variant="ghost"
                      className="text-sm text-muted-foreground hover:text-primary hover:bg-green-500/5"
                    >
                      Voltar ao login
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Info segurança */}
          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p className="flex items-center justify-center gap-1">
              <Shield className="w-3 h-3" />
              Confirmação segura de conta
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmForm;
