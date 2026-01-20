'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button, Input } from '@/components/ui';
import {
  formatPhone,
  formatCurrency,
  parseCurrencyInput,
  formatCurrencyInput,
} from '@/lib/formatters';
import type { Store, StoreUpdateData } from '@/types/store';
import { STORE_CATEGORIES } from '@/types/store';

const schema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(14, 'Telefone inválido'),
  whatsapp: z.string().min(14, 'WhatsApp inválido'),
  address: z.string().min(5, 'Endereço deve ter no mínimo 5 caracteres'),
  category: z.string().min(1, 'Selecione uma categoria'),
  description: z.string().max(500, 'Descrição deve ter no máximo 500 caracteres').optional(),
  cashback_percentage: z.string(),
  has_expiration: z.boolean(),
  expiration_days: z.string().optional(),
  has_min_purchase: z.boolean(),
  min_purchase: z.string().optional(),
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
      whatsapp: formatPhone(store.whatsapp || store.phone || ''),
      address: store.address || '',
      category: store.category || 'Alimentação',
      description: store.description || '',
      cashback_percentage: store.cashback_percentage.toString(),
      has_expiration: store.has_expiration,
      expiration_days: store.expiration_days?.toString() || '90',
      has_min_purchase: store.has_min_purchase,
      min_purchase: formatCurrency(store.min_purchase || 0),
    },
  });

  const descriptionValue = watch('description') || '';
  const hasExpiration = watch('has_expiration');
  const hasMinPurchase = watch('has_min_purchase');

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);

    try {
      await onSave({
        name: data.name,
        email: data.email,
        phone: data.phone.replace(/\D/g, ''),
        whatsapp: data.whatsapp.replace(/\D/g, ''),
        address: data.address,
        category: data.category,
        description: data.description,
        cashback_percentage: parseFloat(data.cashback_percentage),
        has_expiration: data.has_expiration,
        expiration_days: data.has_expiration ? parseInt(data.expiration_days || '90') : undefined,
        has_min_purchase: data.has_min_purchase,
        min_purchase: data.has_min_purchase ? parseCurrencyInput(data.min_purchase || '0') : undefined,
      });

      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }

    setIsLoading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Informações"
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-md">
        {/* Nome */}
        <Input
          label="Nome fantasia"
          error={errors.name?.message}
          {...register('name')}
        />

        {/* E-mail */}
        <Input
          label="E-mail"
          type="email"
          error={errors.email?.message}
          {...register('email')}
        />

        {/* Categoria */}
        <div>
          <label className="block text-body font-medium text-text-primary mb-xs">
            Categoria
          </label>
          <select
            {...register('category')}
            className="w-full h-[56px] px-md bg-input-bg border border-input-border rounded-lg text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {STORE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category?.message && (
            <p className="text-caption text-error mt-xs">
              {errors.category.message}
            </p>
          )}
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-body font-medium text-text-primary mb-xs">
            Descrição
          </label>
          <textarea
            {...register('description')}
            placeholder="Descreva sua empresa em poucas palavras..."
            className="w-full h-24 px-md py-sm bg-input-bg border border-input-border rounded-lg text-body text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <div className="flex justify-between mt-xs">
            {errors.description?.message ? (
              <p className="text-caption text-error">
                {errors.description.message}
              </p>
            ) : (
              <span />
            )}
            <p className="text-caption text-text-muted">
              {descriptionValue.length}/500
            </p>
          </div>
        </div>

        {/* Endereço */}
        <Input
          label="Endereço"
          error={errors.address?.message}
          {...register('address')}
        />

        {/* Telefones */}
        <div className="grid grid-cols-2 gap-md">
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
            label="WhatsApp"
            error={errors.whatsapp?.message}
            {...register('whatsapp', {
              onChange: (e) => {
                setValue('whatsapp', formatPhone(e.target.value));
              },
            })}
          />
        </div>

        <div className="h-px bg-input-border" />

        <h3 className="font-semibold">Configurações de Cashback</h3>

        {/* Porcentagem */}
        <div>
          <Input
            label="Porcentagem (%)"
            type="number"
            min="1"
            max="50"
            step="0.5"
            error={errors.cashback_percentage?.message}
            {...register('cashback_percentage')}
          />
          <p className="text-caption text-text-muted mt-xs">
            Entre 1% e 50%
          </p>
        </div>

        {/* Validade do saldo */}
        <div className="bg-input-bg rounded-lg p-md">
          <div className="flex items-center justify-between mb-sm">
            <div>
              <p className="text-body font-medium text-text-primary">
                Validade do saldo
              </p>
              <p className="text-caption text-text-muted">
                Definir prazo para expiração do cashback
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                {...register('has_expiration')}
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {hasExpiration && (
            <div className="mt-md">
              <Input
                label="Dias de validade"
                type="number"
                min="1"
                max="365"
                error={errors.expiration_days?.message}
                {...register('expiration_days')}
              />
              <p className="text-caption text-text-muted mt-xs">
                Entre 1 e 365 dias
              </p>
            </div>
          )}
        </div>

        {/* Compra mínima */}
        <div className="bg-input-bg rounded-lg p-md">
          <div className="flex items-center justify-between mb-sm">
            <div>
              <p className="text-body font-medium text-text-primary">
                Compra mínima
              </p>
              <p className="text-caption text-text-muted">
                Valor mínimo para gerar cashback
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                {...register('has_min_purchase')}
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {hasMinPurchase && (
            <div className="mt-md">
              <Input
                label="Valor mínimo"
                error={errors.min_purchase?.message}
                {...register('min_purchase', {
                  onChange: (e) => {
                    const formatted = formatCurrencyInput(e.target.value);
                    setValue('min_purchase', formatted);
                  },
                })}
              />
            </div>
          )}
        </div>

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
