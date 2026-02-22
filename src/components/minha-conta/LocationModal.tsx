'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Navigation, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Modal, Button, Input } from '@/components/ui';
import { storeService } from '@/services/storeService';
import { useAuth } from '@/hooks/useAuth';

const LocationMap = dynamic(() => import('./LocationMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] rounded-lg border border-input-border flex items-center justify-center bg-input-bg">
      <Loader2 className="w-6 h-6 animate-spin text-text-muted" />
    </div>
  ),
});

// Centro do Brasil como fallback
const DEFAULT_LAT = -14.235;
const DEFAULT_LNG = -51.9253;

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LocationModal({ isOpen, onClose }: LocationModalProps) {
  const { company, loadCompany, updateCompany } = useAuth();

  const [address, setAddress] = useState(company?.address || '');
  const [lat, setLat] = useState(company?.latitude || DEFAULT_LAT);
  const [lng, setLng] = useState(company?.longitude || DEFAULT_LNG);
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleGetGPS = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocalização não é suportada neste navegador');
      return;
    }

    setIsLoadingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setHasChanges(true);
        setIsLoadingGPS(false);
        toast.success('Localização obtida com sucesso!');
      },
      (error) => {
        setIsLoadingGPS(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Permissão de localização negada. Habilite nas configurações do navegador.');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('Localização indisponível. Tente novamente.');
            break;
          case error.TIMEOUT:
            toast.error('Tempo esgotado ao buscar localização.');
            break;
          default:
            toast.error('Erro ao obter localização.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handlePositionChange = (newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
    setHasChanges(true);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!address.trim()) {
      toast.error('Informe o endereço da empresa');
      return;
    }

    if (lat === DEFAULT_LAT && lng === DEFAULT_LNG) {
      toast.error('Ajuste a localização no mapa ou use o GPS');
      return;
    }

    setIsSaving(true);
    try {
      await storeService.updateStore({
        address: address.trim(),
        latitude: lat,
        longitude: lng,
      });

      updateCompany({
        address: address.trim(),
        latitude: lat,
        longitude: lng,
      });

      toast.success('Localização salva com sucesso!');
      setHasChanges(false);
      onClose();
      await loadCompany();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar localização');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Localização da empresa"
      size="lg"
    >
      <div className="space-y-md">
        {/* Endereço */}
        <Input
          label="Endereço completo"
          placeholder="Ex: Rua das Flores, 123 - Centro, São Paulo - SP"
          value={address}
          onChange={handleAddressChange}
        />

        {/* Botão GPS */}
        <Button
          type="button"
          variant="secondary"
          onClick={handleGetGPS}
          loading={isLoadingGPS}
          fullWidth
          icon={<Navigation className="w-4 h-4" />}
        >
          {isLoadingGPS ? 'Obtendo localização...' : 'Usar minha localização'}
        </Button>

        {/* Mapa */}
        <div>
          <p className="text-caption text-text-muted mb-xs">
            Arraste o marcador para ajustar a posição exata
          </p>
          <LocationMap
            lat={lat}
            lng={lng}
            onPositionChange={handlePositionChange}
          />
        </div>

        {/* Coordenadas */}
        <p className="text-caption text-text-muted text-center">
          Lat: {lat.toFixed(6)} | Lng: {lng.toFixed(6)}
        </p>

        {/* Botões */}
        <div className="flex gap-sm pt-sm">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSaving}
            fullWidth
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            loading={isSaving}
            disabled={!hasChanges}
            fullWidth
          >
            Salvar localização
          </Button>
        </div>
      </div>
    </Modal>
  );
}
