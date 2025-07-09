import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import { AuthService } from '@/services/auth';
import { useToast } from '@/hooks/use-toast';

// Utilitário simples para validação de CPF/CNPJ
function isValidCpfCnpj(value: string) {
  const cleaned = value.replace(/\D/g, '');
  return cleaned.length === 11 || cleaned.length === 14;
}

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    cpfCnpj: '',
    suporte: '',
  });
  const [errors, setErrors] = useState<any>({});
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validate() {
    const errs: any = {};
    if (!form.nome) errs.nome = 'Nome é obrigatório';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'E-mail válido é obrigatório';
    if (!form.senha || form.senha.length < 6) errs.senha = 'Senha deve ter pelo menos 6 caracteres';
    if (!form.cpfCnpj || !isValidCpfCnpj(form.cpfCnpj)) errs.cpfCnpj = 'CPF ou CNPJ válido é obrigatório';
    if (!form.suporte) errs.suporte = 'Telefone ou WhatsApp de suporte é obrigatório';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await AuthService.registerEstablishment({
        user: form,
        establishment: {},
        business_hours: [],
      });
      toast({ title: 'Cadastro realizado!', description: 'Seu cadastro foi enviado com sucesso.' });
      setForm({ nome: '', email: '', senha: '', cpfCnpj: '', suporte: '' });
    } catch (error: any) {
      toast({ title: 'Erro ao cadastrar', description: error?.response?.data?.message || 'Erro desconhecido', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f5f2] p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-lg border border-[#2d0a0a] bg-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-extrabold tracking-tight text-[#2d0a0a] mb-1">
            Cadastro de Estabelecimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="nome" className="text-[#2d0a0a]">Nome do responsável</Label>
              <Input id="nome" name="nome" value={form.nome} onChange={handleChange} className="border-[#7a1c1c] focus:border-[#2d0a0a]" />
              {errors.nome && <span className="text-xs text-red-700">{errors.nome}</span>}
            </div>
            <div>
              <Label htmlFor="email" className="text-[#2d0a0a]">E-mail</Label>
              <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} className="border-[#7a1c1c] focus:border-[#2d0a0a]" />
              {errors.email && <span className="text-xs text-red-700">{errors.email}</span>}
            </div>
            <div>
              <Label htmlFor="senha" className="text-[#2d0a0a]">Senha</Label>
              <div className="relative">
                <Input id="senha" name="senha" type={showPassword ? 'text' : 'password'} value={form.senha} onChange={handleChange} className="border-[#7a1c1c] focus:border-[#2d0a0a]" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a1c1c] hover:text-[#2d0a0a]">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.senha && <span className="text-xs text-red-700">{errors.senha}</span>}
            </div>
            <div>
              <Label htmlFor="cpfCnpj" className="text-[#2d0a0a]">CPF ou CNPJ</Label>
              <Input id="cpfCnpj" name="cpfCnpj" value={form.cpfCnpj} onChange={handleChange} className="border-[#7a1c1c] focus:border-[#2d0a0a]" maxLength={18} />
              {errors.cpfCnpj && <span className="text-xs text-red-700">{errors.cpfCnpj}</span>}
            </div>
            <div>
              <Label htmlFor="suporte" className="text-[#2d0a0a]">Telefone/WhatsApp de Suporte</Label>
              <Input id="suporte" name="suporte" value={form.suporte} onChange={handleChange} className="border-[#7a1c1c] focus:border-[#2d0a0a]" />
              {errors.suporte && <span className="text-xs text-red-700">{errors.suporte}</span>}
            </div>
            <Button type="submit" className="w-full bg-[#7a1c1c] hover:bg-[#2d0a0a] text-white font-bold rounded-lg shadow-md mt-4" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Cadastrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 