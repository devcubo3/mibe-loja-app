'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button, Input } from '@/components/ui';

const schema = z
  .object({
    current_password: z.string().min(1, 'Senha atual é obrigatória'),
    new_password: z.string().min(8, 'Nova senha deve ter no mínimo 8 caracteres'),
    confirm_password: z.string().min(1, 'Confirme a nova senha'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'As senhas não coincidem',
    path: ['confirm_password'],
  });

type FormData = z.infer<typeof schema>;

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  onSubmit,
}: ChangePasswordModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleFormSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await onSubmit({
        currentPassword: data.current_password,
        newPassword: data.new_password,
      });
      reset();
      onClose();
    } catch (error) {
      console.error('Erro ao trocar senha:', error);
    }
    setIsLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="text-center mb-lg">
        <h2 className="text-subtitle font-bold text-text-primary mb-xs">
          Trocar senha
        </h2>
        <p className="text-body text-text-secondary">
          Digite sua senha atual e a nova senha
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-md">
        {/* Senha atual */}
        <div className="relative">
          <Input
            label="Senha atual"
            type={showCurrentPassword ? 'text' : 'password'}
            error={errors.current_password?.message}
            {...register('current_password')}
          />
          <button
            type="button"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            className="absolute right-3 top-[38px] text-text-muted hover:text-text-secondary"
          >
            {showCurrentPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Nova senha */}
        <div className="relative">
          <Input
            label="Nova senha"
            type={showNewPassword ? 'text' : 'password'}
            error={errors.new_password?.message}
            {...register('new_password')}
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-[38px] text-text-muted hover:text-text-secondary"
          >
            {showNewPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Confirmar nova senha */}
        <div className="relative">
          <Input
            label="Confirmar nova senha"
            type={showConfirmPassword ? 'text' : 'password'}
            error={errors.confirm_password?.message}
            {...register('confirm_password')}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-[38px] text-text-muted hover:text-text-secondary"
          >
            {showConfirmPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>

        <ModalFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
            fullWidth
          >
            Cancelar
          </Button>
          <Button type="submit" loading={isLoading} fullWidth>
            Confirmar
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
