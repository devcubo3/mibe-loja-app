'use client';

import { useState, useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';

interface LogoUploadProps {
  currentLogo?: string | null;
  storeName: string;
  storeId: string;
  onUpload: (url: string, file?: File) => void;
  size?: 'sm' | 'md' | 'lg';
  showButton?: boolean;
}

export function LogoUpload({
  currentLogo,
  storeName,
  storeId,
  onUpload,
  size = 'md',
  showButton = false,
}: LogoUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogo || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sizes = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-24 h-24',
  };

  const initial = storeName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

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

    if (file.size > 2 * 1024 * 1024) {
      setError('Imagem deve ter no máximo 2MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setPreviewUrl(url);
      onUpload(url, file);
      setIsUploading(false);
    };
    reader.onerror = () => {
      setError('Erro ao carregar imagem');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Logo Container */}
      <div
        onClick={handleClick}
        className={`relative ${sizes[size]} rounded-lg overflow-hidden cursor-pointer group`}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={storeName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-primary text-white flex items-center justify-center text-subtitle font-bold">
            {initial}
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {isUploading ? (
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          ) : (
            <Camera className="w-5 h-5 text-white" />
          )}
        </div>

        {/* Botão de editar no canto */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          disabled={isUploading}
          className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center border-2 border-white hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
          ) : (
            <Camera className="w-3.5 h-3.5 text-white" />
          )}
        </button>
      </div>

      {/* Button (opcional) */}
      {showButton && (
        <button
          type="button"
          onClick={handleClick}
          disabled={isUploading}
          className="mt-sm text-body text-primary hover:underline disabled:opacity-50"
        >
          {isUploading ? 'Enviando...' : 'Alterar logo'}
        </button>
      )}

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
