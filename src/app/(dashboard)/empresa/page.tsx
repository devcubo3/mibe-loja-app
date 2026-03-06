'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ChevronRight, Pencil, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Card, Button, Badge, Avatar } from '@/components/ui';
import {
  LogoUpload,
  CoverUpload,
  PhotoGallery,
  ReviewCard,
  StarRating,
  EditStoreModal,
  LocationModal,
} from '@/components/empresa';
import { formatCNPJ, formatCurrency } from '@/lib/formatters';
import type { StoreUpdateData, Review } from '@/types/store';
import { storeService } from '@/services/storeService';
import { Loader2 } from 'lucide-react';

export default function EmpresaPage() {
  const router = useRouter();
  const { company, loadCompany } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [photos, setPhotos] = useState<string[]>(company?.photos || []);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      if (!company?.id) return;
      try {
        setIsLoadingReviews(true);
        const token = storeService.getAuthToken();
        const res = await fetch('/api/reviews', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const { data } = await res.json();
          setReviews(data || []);
        }
      } catch (error) {
        console.error('Erro ao carregar avaliações:', error);
      } finally {
        setIsLoadingReviews(false);
      }
    }

    loadReviews();
  }, [company?.id]);

  if (!company) {
    return (
      <div className="page-container">
        <p>Carregando...</p>
      </div>
    );
  }

  const handleCoverUpload = async (url: string, file?: File) => {
    if (!file) return;
    try {
      await storeService.uploadAsset(file, 'cover');
      await loadCompany();
      // toast.success('Capa atualizada!');
    } catch (error) {
      console.error('Erro ao subir capa:', error);
      // toast.error('Falha ao subir capa');
    }
  };

  const handleLogoUpload = async (url: string, file?: File) => {
    if (!file) return;
    try {
      await storeService.uploadAsset(file, 'logo');
      await loadCompany();
      // toast.success('Logo atualizado!');
    } catch (error) {
      console.error('Erro ao subir logo:', error);
      // toast.error('Falha ao subir logo');
    }
  };

  const handleSave = async (data: StoreUpdateData) => {
    try {
      await storeService.updateStore(data);
      await loadCompany();
      // toast.success('Dados salvos com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      // toast.error('Erro ao salvar alterações');
      throw error;
    }
  };

  const handleAddPhoto = (url: string) => {
    setPhotos((prev) => [...prev, url]);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReplyReview = async (reviewId: string, text: string) => {
    try {
      const token = storeService.getAuthToken();
      const res = await fetch('/api/reviews/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reviewId, text })
      });

      if (!res.ok) {
        throw new Error('Erro ao salvar resposta');
      }

      const result = await res.json();
      if (result.success) {
        // Atualiza o estado local para mostrar a resposta imediatamente
        setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, owner_response: text } : r));
      }
    } catch (error) {
      console.error('Erro ao responder avaliação:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Capa e Logo */}
      <div className="relative">
        {/* Cover Image */}
        <CoverUpload
          currentCover={company.cover_url || undefined}
          storeId={company.id}
          onUpload={handleCoverUpload}
        />

        {/* Logo sobreposta */}
        <div className="absolute bottom-0 left-lg transform translate-y-1/2">
          <div className="relative bg-white p-1 rounded-lg shadow-lg">
            <LogoUpload
              currentLogo={company.logo_url || undefined}
              storeName={company.business_name}
              storeId={company.id}
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
              {company.business_name}
            </h1>
            <div className="flex items-center gap-sm mt-xs">
              <StarRating rating={company.rating || 4.8} size="md" showValue />
              <span className="text-caption text-text-muted">
                ({company.total_reviews || 127} avaliações)
              </span>
            </div>
          </div>
          <Badge variant="dark">{company.category || 'Alimentação'}</Badge>
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
              <InfoField label="Nome fantasia" value={company.business_name} />
              <InfoField
                label="CNPJ"
                value={formatCNPJ(company.cnpj || '')}
                locked
              />
              <InfoField
                label="Categoria"
                value={company.category || 'Alimentação'}
              />
              <InfoField
                label="Descrição"
                value={
                  company.description ||
                  'Adicione uma descrição para sua empresa...'
                }
              />
              <InfoField label="E-mail" value={company.email || '-'} />
            </div>
          </Card>
        </section>

        {/* Localização */}
        <section className="mb-lg">
          <h2 className="section-title mb-md">Localização</h2>
          <Card
            variant="default"
            padding="md"
            hoverable
            onClick={() => setShowLocationModal(true)}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-md">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-text-primary">
                  {company?.address ? 'Editar localização' : 'Adicionar localização'}
                </p>
                <p className="text-caption text-text-secondary">
                  {company?.address || 'Informe o endereço e posição no mapa'}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-text-muted" />
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
                    {company.cashback_percent}%
                  </span>
                </div>
                <p className="text-caption text-text-muted mt-xs">
                  A cada R$ 1,00 gasto, o cliente recebe R${' '}
                  {(company.cashback_percent / 100).toFixed(2)} de volta
                </p>
              </div>

              <div className="h-px bg-input-border" />

              {/* Validade */}
              <div>
                <p className="text-caption text-text-muted mb-xs">
                  📅 Validade do saldo
                </p>
                {company.has_expiration ? (
                  <p className="text-body-lg font-semibold text-text-primary">
                    {company.expiration_days} dias
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
                {company.min_purchase_value > 0 ? (
                  <p className="text-body-lg font-semibold text-text-primary">
                    {formatCurrency(company.min_purchase_value)}
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
              Avaliações ({company.total_reviews || reviews.length})
            </h2>
            <button className="flex items-center gap-1 text-primary hover:underline">
              <span className="text-sm font-medium">Ver todas</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-md">
            {isLoadingReviews ? (
              <div className="flex justify-center p-md">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-center text-text-muted mt-md p-md bg-input-bg rounded-lg">
                Sua empresa ainda não possui avaliações.
              </p>
            ) : (
              reviews.slice(0, 5).map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onReply={handleReplyReview}
                />
              ))
            )}
          </div>
        </section>

        {/* Version */}
        <p className="text-center text-caption text-text-muted pb-lg mt-lg">
          Versão 1.0.0
        </p>
      </div>

      {/* Modals */}
      <EditStoreModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        store={company}
        onSave={handleSave}
      />

      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
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
