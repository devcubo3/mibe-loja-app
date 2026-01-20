# 10 - Empresa

## Objetivo
Implementar a página de dados e configurações da empresa.

---

## Layout da Página

```
┌─────────────────────────────────────────────────────────────┐
│  Minha Empresa                                              │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    [Logo da empresa]                  │ │
│  │                    📷 Alterar logo                    │ │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Dados da empresa                                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Nome fantasia                                         │ │
│  │  Restaurante Sabor & Arte                              │ │
│  │  ─────────────────────────────────────────────────    │ │
│  │  CNPJ                                          🔒      │ │
│  │  12.345.678/0001-00                                    │ │
│  │  ...                                                   │ │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Configurações de Cashback                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Porcentagem: 5%                                      │ │
│  │  Validade: 90 dias                                    │ │
│  │  Compra mínima: R$ 20,00                              │ │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  [EDITAR INFORMAÇÕES]                                       │
│                                                             │
│  Suporte                                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  💬 Falar com o suporte pelo WhatsApp                │ │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  [🚪 SAIR DA CONTA]                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Passo 1: Criar Tipo Store

Criar `src/types/store.ts`:

```typescript
export interface Store {
  id: string;
  user_id: string;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  logo_url?: string;
  cashback_percentage: number;
  expiration_days: number;
  min_purchase: number;
  created_at: string;
  updated_at: string;
}

export interface StoreUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  logo_url?: string;
  cashback_percentage?: number;
  expiration_days?: number;
  min_purchase?: number;
}
```

---

## Passo 2: Criar Componente LogoUpload

Criar `src/components/empresa/LogoUpload.tsx`:

```tsx
'use client';

import { useState, useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface LogoUploadProps {
  currentLogo?: string;
  storeName: string;
  storeId: string;
  onUpload: (url: string) => void;
}

export function LogoUpload({
  currentLogo,
  storeName,
  storeId,
  onUpload,
}: LogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const initial = storeName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validações
    if (!file.type.startsWith('image/')) {
      setError('Selecione uma imagem válida');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Imagem deve ter no máximo 2MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${storeId}-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      // Upload para o Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('store-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('store-assets')
        .getPublicUrl(filePath);

      onUpload(publicUrl);
    } catch (err) {
      console.error('Erro ao fazer upload:', err);
      setError('Erro ao fazer upload da imagem');
    }

    setIsUploading(false);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Logo Container */}
      <div
        onClick={handleClick}
        className="relative w-24 h-24 rounded-lg overflow-hidden cursor-pointer group"
      >
        {currentLogo ? (
          <img
            src={currentLogo}
            alt={storeName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-primary text-white flex items-center justify-center text-title font-bold">
            {initial}
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {isUploading ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
        </div>
      </div>

      {/* Button */}
      <button
        type="button"
        onClick={handleClick}
        disabled={isUploading}
        className="mt-sm text-body text-primary hover:underline disabled:opacity-50"
      >
        {isUploading ? 'Enviando...' : 'Alterar logo'}
      </button>

      {/* Error */}
      {error && <p className="mt-xs text-caption text-error">{error}</p>}

      {/* Hidden Input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
```

---

## Passo 3: Criar Modal de Edição

Criar `src/components/empresa/EditStoreModal.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button, Input } from '@/components/ui';
import { formatPhone, formatCurrency, parseCurrencyInput } from '@/lib/formatters';
import type { Store, StoreUpdateData } from '@/types/store';

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(14, 'Telefone inválido'),
  address: z.string().min(5, 'Endereço deve ter no mínimo 5 caracteres'),
  cashback_percentage: z.string(),
  expiration_days: z.string(),
  min_purchase: z.string(),
});

type FormData = z.infer<typeof schema>;

interface EditStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: Store;
  onSave: (data: StoreUpdateData) => Promise<void>;
}

export function EditStoreModal({
  isOpen,
  onClose,
  store,
  onSave,
}: EditStoreModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: store.name,
      email: store.email,
      phone: formatPhone(store.phone || ''),
      address: store.address || '',
      cashback_percentage: store.cashback_percentage.toString(),
      expiration_days: store.expiration_days.toString(),
      min_purchase: formatCurrency(store.min_purchase || 0),
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);

    try {
      await onSave({
        name: data.name,
        email: data.email,
        phone: data.phone.replace(/\D/g, ''),
        address: data.address,
        cashback_percentage: parseFloat(data.cashback_percentage),
        expiration_days: parseInt(data.expiration_days),
        min_purchase: parseCurrencyInput(data.min_purchase),
      });

      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }

    setIsLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Informações" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-md">
        <Input
          label="Nome fantasia"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="E-mail"
          type="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Telefone"
          error={errors.phone?.message}
          {...register('phone', {
            onChange: (e) => {
              setValue('phone', formatPhone(e.target.value));
            },
          })}
        />

        <Input
          label="Endereço"
          error={errors.address?.message}
          {...register('address')}
        />

        <div className="h-px bg-input-border" />

        <h3 className="font-semibold">Configurações de Cashback</h3>

        <div className="grid grid-cols-2 gap-md">
          <Input
            label="Porcentagem (%)"
            type="number"
            min="0"
            max="100"
            step="0.5"
            error={errors.cashback_percentage?.message}
            {...register('cashback_percentage')}
          />

          <Input
            label="Validade (dias)"
            type="number"
            min="1"
            error={errors.expiration_days?.message}
            {...register('expiration_days')}
          />
        </div>

        <Input
          label="Compra mínima para cashback"
          error={errors.min_purchase?.message}
          {...register('min_purchase', {
            onChange: (e) => {
              const formatted = formatCurrency(parseCurrencyInput(e.target.value));
              setValue('min_purchase', formatted);
            },
          })}
        />

        <ModalFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            fullWidth
          >
            Cancelar
          </Button>
          <Button type="submit" loading={isLoading} fullWidth>
            Salvar
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
```

---

## Passo 4: Criar Página da Empresa

Criar `src/app/(dashboard)/empresa/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, MessageCircle, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Card, Button } from '@/components/ui';
import { LogoUpload } from '@/components/empresa/LogoUpload';
import { EditStoreModal } from '@/components/empresa/EditStoreModal';
import { formatCNPJ, formatPhone, formatCurrency } from '@/lib/formatters';
import type { StoreUpdateData } from '@/types/store';

const SUPPORT_WHATSAPP = '5511999999999'; // Número do suporte

export default function EmpresaPage() {
  const router = useRouter();
  const { store, logout, loadStore } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!store) {
    return (
      <div className="page-container">
        <p>Carregando...</p>
      </div>
    );
  }

  const handleLogoUpload = async (url: string) => {
    try {
      await supabase
        .from('stores')
        .update({ logo_url: url, updated_at: new Date().toISOString() })
        .eq('id', store.id);

      await loadStore();
    } catch (error) {
      console.error('Erro ao atualizar logo:', error);
    }
  };

  const handleSave = async (data: StoreUpdateData) => {
    try {
      await supabase
        .from('stores')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', store.id);

      await loadStore();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      throw error;
    }
  };

  const handleWhatsAppSupport = () => {
    const message = encodeURIComponent(
      `Olá! Preciso de ajuda com minha loja ${store.name} (CNPJ: ${store.cnpj}).`
    );
    window.open(`https://wa.me/${SUPPORT_WHATSAPP}?text=${message}`, '_blank');
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    router.push('/login');
  };

  return (
    <div className="page-container max-w-2xl mx-auto">
      {/* Header */}
      <div className="page-header">
        <h1 className="text-title font-bold">Minha Empresa</h1>
      </div>

      {/* Logo */}
      <div className="mb-lg">
        <LogoUpload
          currentLogo={store.logo_url}
          storeName={store.name}
          storeId={store.id}
          onUpload={handleLogoUpload}
        />
      </div>

      {/* Company Data */}
      <section className="mb-lg">
        <h2 className="section-title mb-md">Dados da empresa</h2>
        <Card variant="default" padding="md">
          <div className="space-y-md">
            <InfoField label="Nome fantasia" value={store.name} />
            <InfoField label="CNPJ" value={formatCNPJ(store.cnpj)} locked />
            <InfoField label="E-mail" value={store.email} />
            <InfoField
              label="Telefone"
              value={formatPhone(store.phone || '')}
            />
            <InfoField label="Endereço" value={store.address || '-'} />
          </div>
        </Card>
      </section>

      {/* Cashback Settings */}
      <section className="mb-lg">
        <h2 className="section-title mb-md">Configurações de Cashback</h2>
        <Card variant="default" padding="md">
          <div className="space-y-md">
            <InfoField
              label="Porcentagem de cashback"
              value={`${store.cashback_percentage}%`}
            />
            <InfoField
              label="Validade do saldo"
              value={`${store.expiration_days} dias`}
            />
            <InfoField
              label="Compra mínima para cashback"
              value={formatCurrency(store.min_purchase || 0)}
            />
          </div>
        </Card>
      </section>

      {/* Edit Button */}
      <div className="mb-lg">
        <Button
          variant="secondary"
          fullWidth
          onClick={() => setIsEditModalOpen(true)}
        >
          Editar Informações
        </Button>
      </div>

      {/* Support */}
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
              <MessageCircle className="w-6 h-6 text-whatsapp" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Falar com o suporte</p>
              <p className="text-caption text-text-secondary">
                Atendimento via WhatsApp
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-text-muted" />
          </div>
        </Card>
      </section>

      {/* Logout */}
      <div className="mb-lg">
        <Button
          variant="danger"
          fullWidth
          onClick={handleLogout}
          loading={isLoggingOut}
          icon={<LogOut className="w-5 h-5" />}
        >
          Sair da Conta
        </Button>
      </div>

      {/* Version */}
      <p className="text-center text-caption text-text-muted">
        Versão 1.0.0
      </p>

      {/* Edit Modal */}
      <EditStoreModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        store={store}
        onSave={handleSave}
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
        <p className="text-body-lg text-text-primary">{value}</p>
        {locked && <Lock className="w-4 h-4 text-text-muted" />}
      </div>
    </div>
  );
}
```

---

## Passo 5: Exportar Componentes

Criar `src/components/empresa/index.ts`:

```typescript
export { LogoUpload } from './LogoUpload';
export { EditStoreModal } from './EditStoreModal';
```

---

## Passo 6: Configurar Supabase Storage

No Supabase Dashboard, criar um bucket chamado `store-assets`:

1. Ir em Storage > Create a new bucket
2. Nome: `store-assets`
3. Public bucket: **Sim** (para que as logos sejam acessíveis)

Criar política RLS para o bucket:

```sql
-- Permitir que lojas façam upload de suas próprias imagens
CREATE POLICY "Stores can upload own logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'store-assets' AND
  (storage.foldername(name))[1] = 'logos'
);

-- Permitir leitura pública
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'store-assets');

-- Permitir que lojas deletem suas próprias imagens
CREATE POLICY "Stores can delete own logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'store-assets' AND
  (storage.foldername(name))[1] = 'logos'
);
```

---

## Checklist

- [ ] LogoUpload com preview e upload
- [ ] EditStoreModal com validação
- [ ] Página da empresa implementada
- [ ] CNPJ não editável (locked)
- [ ] Link para WhatsApp de suporte
- [ ] Botão de logout funcionando
- [ ] Supabase Storage configurado

---

## Próximo Passo

Seguir para [11-notificacoes.md](./11-notificacoes.md) para implementar a central de notificações.
