import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, Store } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AuthService } from "@/services/auth";
import type { AuthResponse } from "@/services/auth";
import { GiKnifeFork } from 'react-icons/gi';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Validações básicas
      if (!email || !password) {
        throw new Error("Preencha todos os campos");
      }

      if (!validateEmail(email)) {
        throw new Error("Email inválido");
      }

      // Tentar fazer login
      const response = await AuthService.login({ email, password });
      
      // Verificar se é um estabelecimento
      if (response.user.role !== 'ESTABLISHMENT') {
        AuthService.logout(); // Fazer logout se não for estabelecimento
        throw new Error("Acesso permitido apenas para estabelecimentos");
      }

      // Atualizar contexto
      await login({ email, password });

      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo(a) de volta, ${response.user.name}!`,
      });

      navigate('/dashboard');
    } catch (error: any) {
      let errorMessage = "Ocorreu um erro ao fazer login";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setError(errorMessage);
      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f8f5f2]">
      <Card className="w-full max-w-md rounded-2xl shadow-lg border border-[#2d0a0a] bg-white">
        <CardHeader className="text-center">
          <div className="flex flex-col items-center mb-2">
            <img src="/logo.svg" alt="Logo QuickPainel" className="w-16 h-16 mb-2 rounded-full border-2 border-[#7a1c1c] bg-[#f8f5f2] object-cover" />
          </div>
          <CardTitle className="text-3xl font-extrabold tracking-tight text-[#2d0a0a] mb-1">
            Painel rápido
          </CardTitle>
          <p className="text-[#7a1c1c] text-sm font-medium">Acesso exclusivo para estabelecimentos</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#2d0a0a]">E-mail do estabelecimento</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@estabelecimento.com"
                disabled={isSubmitting}
                required
                className="border-[#7a1c1c] focus:border-[#2d0a0a]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#2d0a0a]">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  disabled={isSubmitting}
                  required
                  className="border-[#7a1c1c] focus:border-[#2d0a0a]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a1c1c] hover:text-[#2d0a0a]"
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-[#7a1c1c] hover:bg-[#2d0a0a] text-white font-bold rounded-lg shadow-md"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-[#2d0a0a]">
              Não tem uma conta?{' '}
              <Link
                to="/register"
                className="p-0 h-auto text-[#7a1c1c] hover:text-[#2d0a0a] font-semibold underline"
              >
                Cadastre seu estabelecimento
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login; 