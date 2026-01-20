'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Logo } from '@/components/Logo';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);

    const result = await login(data);

    if (result.success) {
      router.push('/');
    } else {
      setError(result.error?.message || 'Erro ao fazer login');
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-lg">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-xl">
          <Logo width={140} className="mx-auto mb-lg" />
          <h1 className="text-header font-bold mb-sm">Área da Empresa</h1>
          <p className="text-body-lg text-text-secondary">
            Entre com sua conta para acessar o painel
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-md">
          {/* Error Alert */}
          {error && (
            <div className="bg-error-light border border-error rounded-sm p-md">
              <p className="text-body text-error">{error}</p>
            </div>
          )}

          {/* Email */}
          <Input
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            error={errors.email?.message}
            {...register('email')}
          />

          {/* Password */}
          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            showPasswordToggle
            error={errors.password?.message}
            {...register('password')}
          />

          {/* Forgot Password */}
          <div className="text-right">
            <Link
              href="/esqueci-senha"
              className="text-body text-primary hover:underline"
            >
              Esqueci minha senha
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
          >
            Entrar
          </Button>
        </form>

        {/* Version */}
        <p className="text-center text-caption text-text-muted mt-xl">
          Versão 1.0.0
        </p>
      </div>
    </div>
  );
}
