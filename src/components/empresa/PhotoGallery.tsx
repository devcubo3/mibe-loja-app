'use client';

import { useState, useRef } from 'react';
import { Plus, Trash2, Loader2, X, Eye } from 'lucide-react';
import { Modal } from '@/components/ui';

interface PhotoGalleryProps {
  photos: string[];
  onAdd: (url: string) => void;
  onRemove: (index: number) => void;
  maxPhotos?: number;
}

export function PhotoGallery({
  photos,
  onAdd,
  onRemove,
  maxPhotos = 10,
}: PhotoGalleryProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (photos.length >= maxPhotos) {
      setError(`Máximo de ${maxPhotos} fotos permitidas`);
      return;
    }
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Selecione uma imagem válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Imagem deve ter no máximo 5MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      onAdd(url);
      setIsUploading(false);
    };
    reader.onerror = () => {
      setError('Erro ao carregar imagem');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = '';
  };

  return (
    <div className="space-y-md">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="section-title">Galeria de Fotos</h2>
        <button
          type="button"
          onClick={handleClick}
          disabled={isUploading || photos.length >= maxPhotos}
          className="flex items-center gap-1 text-primary hover:underline disabled:opacity-50 disabled:no-underline"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">Adicionar</span>
        </button>
      </div>

      {/* Erro */}
      {error && (
        <p className="text-caption text-error">{error}</p>
      )}

      {/* Grid de fotos */}
      {photos.length > 0 ? (
        <div className="flex gap-sm overflow-x-auto pb-sm -mx-4 px-4 scrollbar-hide">
          {photos.map((photo, index) => (
            <div
              key={index}
              className="relative flex-shrink-0 w-[140px] h-[100px] rounded overflow-hidden group"
            >
              <img
                src={photo}
                alt={`Foto ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Overlay com ações */}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => setSelectedPhoto(photo)}
                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <Eye className="w-4 h-4 text-primary" />
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="w-8 h-8 bg-error rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-[100px] bg-input-bg rounded-lg border-2 border-dashed border-input-border">
          <button
            type="button"
            onClick={handleClick}
            disabled={isUploading}
            className="flex flex-col items-center gap-2 text-text-muted hover:text-text-secondary transition-colors"
          >
            {isUploading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <Plus className="w-8 h-8" />
            )}
            <span className="text-sm">Adicionar fotos</span>
          </button>
        </div>
      )}

      {/* Contador */}
      <p className="text-caption text-text-muted text-right">
        {photos.length} / {maxPhotos} fotos
      </p>

      {/* Input hidden */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Modal de visualização */}
      <Modal
        isOpen={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        size="lg"
        showCloseButton
      >
        {selectedPhoto && (
          <img
            src={selectedPhoto}
            alt="Foto ampliada"
            className="w-full h-auto rounded-lg"
          />
        )}
      </Modal>
    </div>
  );
}
