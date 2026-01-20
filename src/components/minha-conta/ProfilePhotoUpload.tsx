'use client';

import { useState, useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';

interface ProfilePhotoUploadProps {
  currentPhoto?: string | null;
  userName: string;
  onUpload: (url: string) => void;
  isEditing?: boolean;
}

export function ProfilePhotoUpload({
  currentPhoto,
  userName,
  onUpload,
  isEditing = true,
}: ProfilePhotoUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhoto || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const initial = userName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleClick = () => {
    if (!isEditing) return;
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
    <div className="flex flex-col items-center py-xl">
      {/* Photo Container */}
      <div className="relative">
        <div
          onClick={handleClick}
          className={`w-[100px] h-[100px] rounded-full border-[3px] border-primary overflow-hidden ${
            isEditing ? 'cursor-pointer' : ''
          }`}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={userName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-primary text-white flex items-center justify-center text-title font-bold">
              {initial}
            </div>
          )}
        </div>

        {/* Edit Button */}
        {isEditing && (
          <button
            type="button"
            onClick={handleClick}
            disabled={isUploading}
            className="absolute bottom-0 right-0 w-9 h-9 bg-primary rounded-full flex items-center justify-center border-[3px] border-white hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Camera className="w-5 h-5 text-white" />
            )}
          </button>
        )}
      </div>

      {/* Error */}
      {error && <p className="mt-sm text-caption text-error">{error}</p>}

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
