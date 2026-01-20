'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button, Input } from '@/components/ui';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
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

  const onSubmit = (data: FormData) => {
    setIsLoading(true);
    setError(null);

    // Simular envio de e-mail
    setTimeout(() => {
      console.log('E-mail de recuperação enviado para:', data.email);
      setIsSuccess(true);
      setIsLoading(false);
    }, 1000);
  };

  if (isSuccess) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-lg">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-success-light rounded-full flex items-center justify-center mx-auto mb-lg">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-title font-bold mb-sm">E-mail enviado!</h1>
          <p className="text-body text-text-secondary mb-xl">
            Verifique sua caixa de entrada e siga as instruções para redefinir
            sua senha.
          </p>
          <Link href="/login">
            <Button fullWidth variant="secondary">
              Voltar para o login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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
          <h1 className="text-title font-bold mb-sm">Esqueceu sua senha?</h1>
          <p className="text-body text-text-secondary">
            Digite seu e-mail e enviaremos instruções para redefinir sua senha.
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
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Button type="submit" fullWidth loading={isLoading}>
            Enviar instruções
          </Button>
        </form>
      </div>
    </div>
  );
}
