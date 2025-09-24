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
        title: "Required field",
        description: "Please enter your email to continue.",
        variant: "destructive",
      });
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simular envio de email
    setTimeout(() => {
      setEmailSent(true);
      setIsLoading(false);
      toast({
        title: "Email sent successfully!",
        description: "Check your inbox to reset your password.",
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
                    <h2 className="text-2xl font-bold">Email Sent</h2>
                  </div>
                  <p className="text-lg opacity-90 max-w-md">
                    Check your inbox and follow the instructions to reset your password.
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
                  Email Sent!
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  We sent password reset instructions to:
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <p className="text-center font-medium text-accent">{email}</p>
                </div>
                
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>• Check your inbox</p>
                  <p>• If not found, check your spam folder</p>
                  <p>• The link expires in 24 hours</p>
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
                    Try another email
                  </Button>
                  
                  <Link to="/">
                    <Button
                      variant="ghost"
                      className="w-full text-muted-foreground hover:text-primary"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to login
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
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/80 via-primary/40 to-transparent">
              <div className="absolute bottom-8 left-8 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Shield className="w-6 h-6" />
                  </div>
                    <h2 className="text-2xl font-bold">Password Recovery</h2>
                  </div>
                  <p className="text-lg opacity-90 max-w-md">
                    Enter your email to receive password reset instructions.
                  </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lado direito - Formulário */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-medical bg-gradient-card border-0">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="p-2 bg-gradient-primary rounded-xl">
                  <Mail className="w-6 h-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">
                Forgot your password?
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter your email and we'll send you reset instructions
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
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
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Send instructions
                    </div>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/">
                  <Button 
                    variant="ghost" 
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Informações de segurança */}
          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p className="flex items-center justify-center gap-1">
              <Shield className="w-3 h-3" />
              Secure password recovery process
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;