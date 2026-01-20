'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Lock,
  Pencil,
  Key,
  MessageCircle,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Card, Button, Input } from '@/components/ui';
import {
  ProfilePhotoUpload,
  ChangePasswordModal,
  LogoutConfirmModal,
} from '@/components/minha-conta';
import {
  formatCPF,
  formatPhone,
  formatBirthDate,
  formatBirthDateInput,
} from '@/lib/formatters';

const SUPPORT_WHATSAPP = '5511999999999';

const schema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100, 'Nome deve ter no máximo 100 caracteres'),
  phone: z.string().min(14, 'Telefone inválido'),
  birth_date: z.string().min(10, 'Data inválida'),
});

type FormData = z.infer<typeof schema>;

export default function MinhaContaPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name || '',
      phone: formatPhone(user?.phone || ''),
      birth_date: formatBirthDate(user?.birth_date || ''),
    },
  });

  if (!user) {
    return (
      <div className="page-container">
        <p>Carregando...</p>
      </div>
    );
  }

  const handlePhotoUpload = (url: string) => {
    console.log('Foto atualizada:', url);
  };

  const handleSave = async (data: FormData) => {
    setIsSaving(true);
    console.log('Dados salvos:', data);
    // Aqui seria a chamada para API
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    reset({
      name: user.name,
      phone: formatPhone(user.phone || ''),
      birth_date: formatBirthDate(user.birth_date || ''),
    });
    setIsEditing(false);
  };

  const handleChangePassword = async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    console.log('Trocar senha:', data);
    // Aqui seria a chamada para API
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  const handleWhatsAppSupport = () => {
    const message = encodeURIComponent(
      `Olá, preciso de ajuda com o painel MIBE Store`
    );
    window.open(`https://wa.me/${SUPPORT_WHATSAPP}?text=${message}`, '_blank');
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    router.push('/login');
  };

  return (
    <div className="page-container max-w-xl mx-auto">
      {/* Header */}
      <div className="page-header">
        <h1 className="text-title font-bold">Minha Conta</h1>
      </div>

      {/* Profile Photo */}
      <ProfilePhotoUpload
        currentPhoto={user.photo_url}
        userName={user.name}
        onUpload={handlePhotoUpload}
        isEditing={isEditing}
      />

      {/* Personal Data Section */}
      <section className="mb-lg">
        <h2 className="section-title mb-md">Dados pessoais</h2>
        <Card variant="default" padding="md">
          {isEditing ? (
            <form onSubmit={handleSubmit(handleSave)} className="space-y-md">
              {/* Nome (editável) */}
              <Input
                label="Nome completo"
                error={errors.name?.message}
                {...register('name')}
              />

              {/* E-mail (bloqueado) */}
              <div>
                <label className="block text-body font-medium text-text-primary mb-xs">
                  E-mail
                </label>
                <div className="flex items-center justify-between bg-input-bg px-md py-sm rounded border border-input-border opacity-60">
                  <span className="text-body text-text-secondary">
                    {user.email}
                  </span>
                  <Lock className="w-4 h-4 text-text-muted" />
                </div>
                <p className="text-caption text-text-muted mt-xs">
                  O e-mail não pode ser alterado
                </p>
              </div>

              {/* CPF (bloqueado) */}
              <div>
                <label className="block text-body font-medium text-text-primary mb-xs">
                  CPF
                </label>
                <div className="flex items-center justify-between bg-input-bg px-md py-sm rounded border border-input-border opacity-60">
                  <span className="text-body text-text-secondary">
                    {formatCPF(user.cpf)}
                  </span>
                  <Lock className="w-4 h-4 text-text-muted" />
                </div>
                <p className="text-caption text-text-muted mt-xs">
                  O CPF não pode ser alterado
                </p>
              </div>

              {/* Telefone (editável) */}
              <Input
                label="Telefone"
                error={errors.phone?.message}
                {...register('phone', {
                  onChange: (e) => {
                    setValue('phone', formatPhone(e.target.value));
                  },
                })}
              />

              {/* Data de Nascimento (editável) */}
              <Input
                label="Data de Nascimento"
                placeholder="DD/MM/AAAA"
                error={errors.birth_date?.message}
                {...register('birth_date', {
                  onChange: (e) => {
                    setValue('birth_date', formatBirthDateInput(e.target.value));
                  },
                })}
              />

              {/* Botões de ação */}
              <div className="flex gap-sm pt-md">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={isSaving}
                  fullWidth
                >
                  Cancelar
                </Button>
                <Button type="submit" loading={isSaving} fullWidth>
                  Salvar
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-md">
              <InfoField label="Nome completo" value={user.name} />
              <InfoField label="E-mail" value={user.email} locked />
              <InfoField label="CPF" value={formatCPF(user.cpf)} locked />
              <InfoField
                label="Telefone"
                value={formatPhone(user.phone || '')}
              />
              <InfoField
                label="Data de Nascimento"
                value={formatBirthDate(user.birth_date || '') || '-'}
              />
            </div>
          )}
        </Card>
      </section>

      {/* Action Buttons (quando não está editando) */}
      {!isEditing && (
        <section className="mb-lg space-y-sm">
          <button
            onClick={() => setIsEditing(true)}
            className="w-full flex items-center justify-center gap-xs py-sm px-md bg-white border border-primary rounded text-primary hover:bg-input-bg transition-colors"
          >
            <Pencil className="w-4 h-4" />
            <span className="text-body font-semibold">Editar dados</span>
          </button>

          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full flex items-center justify-center gap-xs py-sm px-md bg-white border border-primary rounded text-primary hover:bg-input-bg transition-colors"
          >
            <Key className="w-4 h-4" />
            <span className="text-body font-semibold">Trocar senha</span>
          </button>
        </section>
      )}

      {/* Support Section */}
      <section className="mb-lg">
        <h2 className="section-title mb-md">Suporte</h2>
        <Card
          variant="default"
          padding="md"
          hoverable
          onClick={handleWhatsAppSupport}
          className="cursor-pointer"
        >
          <div className="flex items-center gap-md">
            <div className="w-12 h-12 bg-success-light rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-success" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-text-primary">
                Falar com o suporte
              </p>
              <p className="text-caption text-text-secondary">
                Tire suas dúvidas pelo WhatsApp
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-text-muted" />
          </div>
        </Card>
      </section>

      {/* Logout Section */}
      <section className="mb-lg">
        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full flex items-center justify-center gap-xs py-sm px-md bg-white border border-error rounded text-error hover:bg-error-light transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-body font-semibold">Sair da conta</span>
        </button>
      </section>

      {/* Version */}
      <p className="text-center text-caption text-text-muted pb-lg">
        Versão 1.0.0
      </p>

      {/* Modals */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handleChangePassword}
      />

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />
    </div>
  );
}

function InfoField({
  label,
  value,
  locked,
}: {
  label: string;
  value: string;
  locked?: boolean;
}) {
  return (
    <div className="border-b border-input-border pb-sm last:border-0 last:pb-0">
      <p className="text-caption text-text-muted mb-xs">{label}</p>
      <div className="flex items-center justify-between">
        <p className={`text-body-lg ${locked ? 'text-text-secondary' : 'text-text-primary'}`}>
          {value}
        </p>
        {locked && <Lock className="w-4 h-4 text-text-muted" />}
      </div>
      {locked && (
        <p className="text-caption text-text-muted mt-xs">
          {label === 'E-mail' ? 'O e-mail não pode ser alterado' : 'O CPF não pode ser alterado'}
        </p>
      )}
    </div>
  );
}
