'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Building2, User, Check } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

// ─── Schemas ────────────────────────────────────────────────
const companySchema = z.object({
  business_name: z.string().min(2, 'Nome da empresa é obrigatório'),
  cnpj: z
    .string()
    .min(14, 'CNPJ inválido')
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => v.length === 14, 'CNPJ deve ter 14 dígitos'),
  category_id: z.string().optional(),
});

const userSchema = z
  .object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    email: z.string().email('E-mail inválido'),
    password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
    confirm_password: z.string().min(1, 'Confirme a senha'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'As senhas não coincidem',
    path: ['confirm_password'],
  });

type CompanyFormData = z.infer<typeof companySchema>;
type UserFormData = z.infer<typeof userSchema>;

// ─── Categorias ─────────────────────────────────────────────
const CATEGORIES = [
  { id: '1', name: 'Alimentação' },
  { id: '5', name: 'Beleza' },
  { id: '4', name: 'Casa' },
  { id: '2', name: 'Compras' },
  { id: '8', name: 'Educação' },
  { id: '6', name: 'Fitness' },
  { id: '9', name: 'Lazer' },
  { id: '7', name: 'Pet' },
  { id: '3', name: 'Saúde' },
  { id: '11', name: 'Serviços' },
  { id: '12', name: 'Tecnologia' },
  { id: '10', name: 'Viagem' },
];

// ─── Máscara CNPJ ──────────────────────────────────────────
function formatCnpj(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

// ─── Steps indicator ────────────────────────────────────────
function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [
    { number: 1, label: 'Empresa', icon: Building2 },
    { number: 2, label: 'Seus dados', icon: User },
  ];

  return (
    <div className="flex items-center justify-center gap-3 mb-xl">
      {steps.map((step, i) => {
        const isActive = currentStep === step.number;
        const isCompleted = currentStep > step.number;
        const Icon = step.icon;

        return (
          <div key={step.number} className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-success text-white'
                    : isActive
                    ? 'bg-primary text-white'
                    : 'bg-input-bg text-text-muted'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span
                className={`text-caption font-medium ${
                  isActive || isCompleted ? 'text-text-primary' : 'text-text-muted'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-12 h-0.5 mb-5 transition-colors duration-300 ${
                  isCompleted ? 'bg-success' : 'bg-input-border'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────
export default function CriarContaPage() {
  const router = useRouter();
  const authStore = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyFormData | null>(null);

  // Step 1 form — Empresa
  const companyForm = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: { business_name: '', cnpj: '', category_id: '' },
  });

  // Step 2 form — Usuário
  const userForm = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: '', email: '', password: '', confirm_password: '' },
  });

  // ─── Handlers ───────────────────────────────────────────
  const handleStep1Submit = (data: CompanyFormData) => {
    setCompanyData(data);
    setStep(2);
  };

  const handleStep2Submit = async (data: UserFormData) => {
    if (!companyData) return;
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: {
            business_name: companyData.business_name,
            cnpj: companyData.cnpj,
            category_id: companyData.category_id
              ? parseInt(companyData.category_id)
              : null,
          },
          user: {
            name: data.name,
            email: data.email,
            password: data.password,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Erro ao criar conta');
        setIsSubmitting(false);
        return;
      }

      // Salvar sessão no store (auto-login)
      useAuth.setState({
        user: result.user,
        company: result.company,
        token: result.token,
        isAuthenticated: true,
        isLoading: false,
      });

      toast.success('Conta criada com sucesso!');
      router.push('/');
    } catch {
      toast.error('Erro de conexão. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    // Restaurar valores salvos
    if (companyData) {
      companyForm.reset(companyData);
    }
  };

  // ─── Render ─────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-lg">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-lg">
          <Logo width={120} className="mx-auto mb-md" />
          <h1 className="text-title font-bold mb-xs">Criar conta</h1>
          <p className="text-body text-text-secondary">
            {step === 1
              ? 'Comece com os dados da sua empresa'
              : 'Agora, seus dados pessoais'}
          </p>
        </div>

        {/* Steps */}
        <StepIndicator currentStep={step} />

        {/* ─── Step 1: Empresa ─────────────────────────── */}
        {step === 1 && (
          <form
            onSubmit={companyForm.handleSubmit(handleStep1Submit)}
            className="space-y-md"
          >
            <Input
              label="Nome da empresa"
              placeholder="Ex: Padaria do João"
              error={companyForm.formState.errors.business_name?.message}
              {...companyForm.register('business_name')}
            />

            <Input
              label="CNPJ"
              placeholder="00.000.000/0000-00"
              error={companyForm.formState.errors.cnpj?.message}
              {...companyForm.register('cnpj', {
                onChange: (e) => {
                  e.target.value = formatCnpj(e.target.value);
                },
              })}
            />

            {/* Categoria */}
            <div>
              <label className="label-default">
                Categoria <span className="text-text-muted">(opcional)</span>
              </label>
              <select
                className="input-default w-full"
                {...companyForm.register('category_id')}
              >
                <option value="">Selecione uma categoria</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" fullWidth icon={<ArrowRight className="w-5 h-5" />} iconPosition="right">
              Continuar
            </Button>

            <p className="text-center text-body text-text-secondary">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Entrar
              </Link>
            </p>
          </form>
        )}

        {/* ─── Step 2: Dados pessoais ──────────────────── */}
        {step === 2 && (
          <form
            onSubmit={userForm.handleSubmit(handleStep2Submit)}
            className="space-y-md"
          >
            <Input
              label="Seu nome"
              placeholder="Nome completo"
              error={userForm.formState.errors.name?.message}
              {...userForm.register('name')}
            />

            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              error={userForm.formState.errors.email?.message}
              {...userForm.register('email')}
            />

            <Input
              label="Senha"
              type="password"
              placeholder="Mínimo 8 caracteres"
              showPasswordToggle
              error={userForm.formState.errors.password?.message}
              {...userForm.register('password')}
            />

            <Input
              label="Confirmar senha"
              type="password"
              placeholder="Repita a senha"
              showPasswordToggle
              error={userForm.formState.errors.confirm_password?.message}
              {...userForm.register('confirm_password')}
            />

            <div className="flex gap-sm">
              <Button
                type="button"
                variant="secondary"
                onClick={handleBack}
                icon={<ArrowLeft className="w-5 h-5" />}
                className="flex-shrink-0"
              >
                Voltar
              </Button>
              <Button
                type="submit"
                fullWidth
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Criar conta
              </Button>
            </div>
          </form>
        )}

        {/* Version */}
        <p className="text-center text-caption text-text-muted mt-xl">
          Versão 1.0.0
        </p>
      </div>
    </div>
  );
}
