'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Navigation, Loader2, MapPin, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Modal, Button } from '@/components/ui';
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

interface NominatimAddress {
  road?: string;
  house_number?: string;
  suburb?: string;
  neighbourhood?: string;
  city?: string;
  town?: string;
  village?: string;
  city_district?: string;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: NominatimAddress;
}

// Formata endereço resumido: "Rua X, 123 - Bairro, Cidade"
function formatAddress(addr: NominatimAddress): string {
  const parts: string[] = [];

  // Rua + número
  if (addr.road) {
    parts.push(addr.house_number ? `${addr.road}, ${addr.house_number}` : addr.road);
  }

  // Bairro
  const bairro = addr.suburb || addr.neighbourhood || addr.city_district;
  if (bairro) parts.push(bairro);

  // Cidade
  const cidade = addr.city || addr.town || addr.village;
  if (cidade) parts.push(cidade);

  return parts.length > 0 ? parts.join(' - ') : '';
}

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

  // Geocoding states
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Ref da localização do navegador para busca por proximidade
  const browserLatRef = useRef<number | null>(null);
  const browserLngRef = useRef<number | null>(null);

  // Refs para controle
  const skipSearchRef = useRef(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Obter localização do navegador silenciosamente ao abrir o modal (para proximidade na busca)
  useEffect(() => {
    if (isOpen && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          browserLatRef.current = position.coords.latitude;
          browserLngRef.current = position.coords.longitude;
          // Se o pin ainda está no centro do Brasil (nunca foi setado), mover para a localização real
          if (lat === DEFAULT_LAT && lng === DEFAULT_LNG && !company?.latitude) {
            setLat(position.coords.latitude);
            setLng(position.coords.longitude);
          }
        },
        () => { /* silently ignore */ },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
      );
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reverse geocoding: coordenadas → endereço
  const reverseGeocode = useCallback(async (latitude: number, longitude: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=pt-BR&addressdetails=1`,
        { headers: { 'User-Agent': 'MIBE-Loja-App/1.0' } }
      );
      const data = await res.json();
      if (data.address) {
        const formatted = formatAddress(data.address);
        if (formatted) {
          skipSearchRef.current = true;
          setAddress(formatted);
        }
      }
    } catch {
      // Silently fail - user can still type manually
    }
  }, []);

  // Refs para lat/lng atuais (evitar stale closures no searchAddress)
  const latRef = useRef(lat);
  const lngRef = useRef(lng);
  useEffect(() => { latRef.current = lat; lngRef.current = lng; }, [lat, lng]);

  // Forward geocoding: texto → sugestões (prioriza proximidade)
  const searchAddress = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    try {
      // Prioridade: localização do navegador > posição do pin > centro do Brasil
      const searchLat = browserLatRef.current ?? latRef.current;
      const searchLng = browserLngRef.current ?? lngRef.current;
      const delta = 1;
      const viewbox = `${searchLng - delta},${searchLat + delta},${searchLng + delta},${searchLat - delta}`;

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&countrycodes=br&limit=5&accept-language=pt-BR&addressdetails=1&viewbox=${viewbox}&bounded=0`,
        { headers: { 'User-Agent': 'MIBE-Loja-App/1.0' } }
      );
      const data: NominatimResult[] = await res.json();
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch {
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleGetGPS = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocalização não é suportada neste navegador');
      return;
    }

    setIsLoadingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLat = position.coords.latitude;
        const newLng = position.coords.longitude;
        setLat(newLat);
        setLng(newLng);
        setHasChanges(true);
        setIsLoadingGPS(false);
        toast.success('Localização obtida com sucesso!');
        reverseGeocode(newLat, newLng);
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
    reverseGeocode(newLat, newLng);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);
    setHasChanges(true);

    // Se foi setado pelo reverse geocode, pular a busca
    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      return;
    }

    // Debounce da busca
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchAddress(value);
    }, 500);
  };

  const handleSelectSuggestion = (suggestion: NominatimResult) => {
    skipSearchRef.current = true;
    const formatted = suggestion.address ? formatAddress(suggestion.address) : suggestion.display_name;
    setAddress(formatted || suggestion.display_name);
    setLat(parseFloat(suggestion.lat));
    setLng(parseFloat(suggestion.lon));
    setShowSuggestions(false);
    setSuggestions([]);
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
        {/* Endereço com autocomplete */}
        <div ref={wrapperRef} className="relative z-20">
          <label className="block text-body font-medium text-text-primary mb-xs">
            Endereço completo
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Ex: Rua das Flores, 123 - Centro, São Paulo - SP"
              value={address}
              onChange={handleAddressChange}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              className="w-full px-md py-sm bg-input-bg border border-input-border rounded text-body text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary pr-10"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin text-text-muted" />
              ) : (
                <Search className="w-4 h-4 text-text-muted" />
              )}
            </div>
          </div>

          {/* Dropdown de sugestões */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-[9999] w-full mt-1 bg-white border border-input-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((s, i) => {
                const label = s.address ? formatAddress(s.address) : s.display_name;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectSuggestion(s)}
                    className="w-full flex items-start gap-sm px-md py-sm hover:bg-input-bg transition-colors text-left border-b border-input-border last:border-0"
                  >
                    <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm text-text-primary line-clamp-2">
                      {label || s.display_name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

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

        {/* Mapa — isolate cria stacking context para conter z-indexes do Leaflet */}
        <div className="relative" style={{ isolation: 'isolate', zIndex: 0 }}>
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
