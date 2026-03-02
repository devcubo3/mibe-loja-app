'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button, Input } from '@/components/ui';

const schema = z
  .object({
    new_password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
    confirm_password: z.string().min(1, 'Confirme a nova senha'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'As senhas não coincidem',
    path: ['confirm_password'],
  });

type FormData = z.infer<typeof schema>;

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          new_password: data.new_password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Erro ao redefinir senha');
        return;
      }

      setIsSuccess(true);
    } catch {
      setError('Erro ao conectar com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  // Sem token na URL — acesso inválido
  if (!token) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-lg">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-error-light rounded-full flex items-center justify-center mx-auto mb-lg">
            <AlertCircle className="w-8 h-8 text-error" />
          </div>
          <h1 className="text-title font-bold mb-sm">Link inválido</h1>
          <p className="text-body text-text-secondary mb-xl">
            Este link de redefinição de senha é inválido ou expirou. Solicite um novo link.
          </p>
          <Link href="/esqueci-senha">
            <Button fullWidth variant="secondary">
              Solicitar novo link
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Sucesso
  if (isSuccess) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-lg">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-success-light rounded-full flex items-center justify-center mx-auto mb-lg">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-title font-bold mb-sm">Senha redefinida!</h1>
          <p className="text-body text-text-secondary mb-xl">
            Sua senha foi alterada com sucesso. Agora você pode fazer login com a nova senha.
          </p>
          <Link href="/login">
            <Button fullWidth>
              Ir para o login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Formulário
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-lg">
      <div className="w-full max-w-sm">
        {/* Back Link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-body text-text-secondary hover:text-text-primary mb-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        {/* Header */}
        <div className="mb-xl">
          <Logo width={100} className="mb-lg" />
          <h1 className="text-title font-bold mb-sm">Redefinir senha</h1>
          <p className="text-body text-text-secondary">
            Digite sua nova senha abaixo.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-md">
          {error && (
            <div className="bg-error-light border border-error rounded-sm p-md">
              <p className="text-body text-error">{error}</p>
            </div>
          )}

          <Input
            label="Nova senha"
            type="password"
            placeholder="••••••••"
            showPasswordToggle
            error={errors.new_password?.message}
            {...register('new_password')}
          />

          <Input
            label="Confirmar nova senha"
            type="password"
            placeholder="••••••••"
            showPasswordToggle
            error={errors.confirm_password?.message}
            {...register('confirm_password')}
          />

          <Button type="submit" fullWidth loading={isLoading} disabled={isLoading}>
            Redefinir senha
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
