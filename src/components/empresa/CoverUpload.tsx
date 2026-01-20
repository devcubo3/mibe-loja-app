'use client';

import { useState, useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';

interface CoverUploadProps {
  currentCover?: string | null;
  storeId: string;
  onUpload: (url: string) => void;
}

export function CoverUpload({
  currentCover,
  storeId,
  onUpload,
}: CoverUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentCover || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
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
      setPreviewUrl(url);
      onUpload(url);
      setIsUploading(false);
    };
    reader.onerror = () => {
      setError('Erro ao carregar imagem');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative h-[200px] w-full bg-input-bg overflow-hidden">
      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Capa da loja"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-gray-200 to-gray-300">
          <Camera className="w-12 h-12 text-text-muted" />
        </div>
      )}

      {/* Botão de editar */}
      <button
        type="button"
        onClick={handleClick}
        disabled={isUploading}
        className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 text-white px-3 py-2 rounded hover:bg-black/70 transition-colors disabled:opacity-50"
      >
        {isUploading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Camera className="w-4 h-4" />
        )}
        <span className="text-sm font-medium">
          {isUploading ? 'Enviando...' : 'Alterar capa'}
        </span>
      </button>

      {/* Erro */}
      {error && (
        <div className="absolute bottom-4 left-4 right-4 bg-error text-white px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      {/* Input hidden */}
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
