'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  ChevronRight,
  Pencil,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Card, Button, Badge, Avatar } from '@/components/ui';
import {
  LogoUpload,
  CoverUpload,
  PhotoGallery,
  ReviewCard,
  StarRating,
  EditStoreModal,
} from '@/components/empresa';
import { formatCNPJ, formatPhone, formatCurrency } from '@/lib/formatters';
import type { StoreUpdateData, Review } from '@/types/store';

// Dados mock de avaliações para demonstração
const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    store_id: '1',
    customer_id: '1',
    customer_name: 'Maria Silva',
    rating: 5,
    comment:
      'Excelente restaurante! A comida é maravilhosa e o atendimento impecável. Voltarei mais vezes!',
    created_at: '2026-01-15T10:00:00Z',
    reply: {
      text: 'Obrigado pelo carinho, Maria! Esperamos você novamente em breve.',
      created_at: '2026-01-15T14:00:00Z',
    },
  },
  {
    id: '2',
    store_id: '1',
    customer_id: '2',
    customer_name: 'João Santos',
    rating: 4,
    comment:
      'Boa comida e ambiente agradável. O único ponto a melhorar seria o tempo de espera.',
    created_at: '2026-01-10T15:30:00Z',
  },
  {
    id: '3',
    store_id: '1',
    customer_id: '3',
    customer_name: 'Ana Oliveira',
    rating: 5,
    comment: 'Melhor experiência gastronômica que tive! Recomendo demais.',
    created_at: '2026-01-08T19:00:00Z',
  },
];

export default function EmpresaPage() {
  const router = useRouter();
  const { store, loadStore } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [photos, setPhotos] = useState<string[]>(store?.photos || []);
  const [reviews] = useState<Review[]>(MOCK_REVIEWS);

  if (!store) {
    return (
      <div className="page-container">
        <p>Carregando...</p>
      </div>
    );
  }

  const handleCoverUpload = (url: string) => {
    console.log('Capa atualizada:', url);
  };

  const handleLogoUpload = (url: string) => {
    console.log('Logo atualizado:', url);
  };

  const handleSave = async (data: StoreUpdateData) => {
    console.log('Dados salvos:', data);
    await loadStore();
  };

  const handleAddPhoto = (url: string) => {
    setPhotos((prev) => [...prev, url]);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReplyReview = async (reviewId: string, text: string) => {
    console.log('Resposta enviada:', { reviewId, text });
    // Aqui seria a chamada para API
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Capa e Logo */}
      <div className="relative">
        {/* Cover Image */}
        <CoverUpload
          currentCover={store.cover_image}
          storeId={store.id}
          onUpload={handleCoverUpload}
        />

        {/* Logo sobreposta */}
        <div className="absolute bottom-0 left-lg transform translate-y-1/2">
          <div className="relative bg-white p-1 rounded-lg shadow-lg">
            <LogoUpload
              currentLogo={store.logo_url}
              storeName={store.name}
              storeId={store.id}
              onUpload={handleLogoUpload}
            />
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="page-container max-w-3xl mx-auto pt-16">
        {/* Nome e avaliação */}
        <div className="flex items-start justify-between mb-lg">
          <div>
            <h1 className="text-title font-bold text-text-primary">
              {store.name}
            </h1>
            <div className="flex items-center gap-sm mt-xs">
              <StarRating rating={store.rating || 4.8} size="md" showValue />
              <span className="text-caption text-text-muted">
                ({store.total_reviews || 127} avaliações)
              </span>
            </div>
          </div>
          <Badge variant="dark">{store.category || 'Alimentação'}</Badge>
        </div>

        {/* Informações da empresa */}
        <section className="mb-lg">
          <div className="flex items-center justify-between mb-md">
            <h2 className="section-title">Informações da empresa</h2>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-1 text-primary hover:underline"
            >
              <Pencil className="w-4 h-4" />
              <span className="text-sm font-medium">Editar</span>
            </button>
          </div>
          <Card variant="default" padding="md">
            <div className="space-y-md">
              <InfoField label="Nome fantasia" value={store.name} />
              <InfoField
                label="CNPJ"
                value={formatCNPJ(store.cnpj)}
                locked
              />
              <InfoField
                label="Categoria"
                value={store.category || 'Alimentação'}
              />
              <InfoField
                label="Descrição"
                value={
                  store.description ||
                  'Adicione uma descrição para sua empresa...'
                }
              />
              <InfoField label="Endereço" value={store.address || '-'} />
              <InfoField
                label="Telefone"
                value={formatPhone(store.phone || '')}
              />
              <InfoField
                label="WhatsApp"
                value={formatPhone(store.whatsapp || store.phone || '')}
              />
            </div>
          </Card>
        </section>

        {/* Configurações de Cashback */}
        <section className="mb-lg">
          <div className="flex items-center justify-between mb-md">
            <h2 className="section-title">Configurações de Cashback</h2>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-1 text-primary hover:underline"
            >
              <Pencil className="w-4 h-4" />
              <span className="text-sm font-medium">Editar</span>
            </button>
          </div>
          <Card variant="default" padding="md" className="bg-input-bg">
            <div className="space-y-lg">
              {/* Porcentagem */}
              <div>
                <p className="text-caption text-text-muted mb-xs">
                  💰 Porcentagem de Cashback
                </p>
                <div className="flex items-baseline gap-sm">
                  <span className="text-[32px] font-bold text-primary">
                    {store.cashback_percentage}%
                  </span>
                </div>
                <p className="text-caption text-text-muted mt-xs">
                  A cada R$ 1,00 gasto, o cliente recebe R${' '}
                  {(store.cashback_percentage / 100).toFixed(2)} de volta
                </p>
              </div>

              <div className="h-px bg-input-border" />

              {/* Validade */}
              <div>
                <p className="text-caption text-text-muted mb-xs">
                  📅 Validade do saldo
                </p>
                {store.has_expiration ? (
                  <p className="text-body-lg font-semibold text-text-primary">
                    {store.expiration_days} dias
                  </p>
                ) : (
                  <p className="text-body-lg font-semibold text-success">
                    Sem validade
                  </p>
                )}
              </div>

              <div className="h-px bg-input-border" />

              {/* Compra mínima */}
              <div>
                <p className="text-caption text-text-muted mb-xs">
                  🛒 Compra mínima para cashback
                </p>
                {store.has_min_purchase ? (
                  <p className="text-body-lg font-semibold text-text-primary">
                    {formatCurrency(store.min_purchase || 0)}
                  </p>
                ) : (
                  <p className="text-body-lg font-semibold text-success">
                    Sem valor mínimo
                  </p>
                )}
              </div>
            </div>
          </Card>
        </section>

        {/* Galeria de Fotos */}
        <section className="mb-lg">
          <PhotoGallery
            photos={photos}
            onAdd={handleAddPhoto}
            onRemove={handleRemovePhoto}
          />
        </section>

        {/* Avaliações */}
        <section className="mb-lg">
          <div className="flex items-center justify-between mb-md">
            <h2 className="section-title">
              Avaliações ({store.total_reviews || reviews.length})
            </h2>
            <button className="flex items-center gap-1 text-primary hover:underline">
              <span className="text-sm font-medium">Ver todas</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-md">
            {reviews.slice(0, 3).map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onReply={handleReplyReview}
              />
            ))}
          </div>
        </section>

        {/* Version */}
        <p className="text-center text-caption text-text-muted pb-lg mt-lg">
          Versão 1.0.0
        </p>
      </div>

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
